const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const Usuario = require('../models/Usuario');
const {
    isSmtpConfigured,
    buildFrontendUrl,
    sendPasswordResetEmail,
    verifySmtpConnection,
    formatSmtpError,
    logSmtpAudit,
    logSmtpError,
    getSmtpConfig,
} = require('../utils/mailer');

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
// POST /api/auth/registro
// Body esperado (estructura normalizada):
// {
//   nombre, email, password,
//   telefono?, fecha_nacimiento?, sexo_biologico?, identidad_genero?,
//   perfil_academico: { universidad, carrera, sede?, anio_ingreso? },
//   ubicacion_sede?:  { latitud?, longitud?, direccion? },
//   preferencias_convivencia: { nivel_orden, fuma?, mascotas?, ... },
//   intereses?: []
// }
const registrarUsuario = async (req, res) => {
    const {
        nombre,
        email,
        password,
        telefono,
        fecha_nacimiento,
        sexo_biologico,
        identidad_genero,
        perfil_academico,
        ubicacion_sede,
        preferencias_convivencia,
        intereses,
    } = req.body;

    // ── Validaciones de campos obligatorios ──────────────────────────────────
    if (!nombre || !email || !password) {
        return res.status(400).json({ mensaje: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (!perfil_academico?.universidad || !perfil_academico?.carrera) {
        return res.status(400).json({ mensaje: 'Universidad y carrera son obligatorias.' });
    }
    if (
        !preferencias_convivencia ||
        preferencias_convivencia.nivel_orden === undefined ||
        preferencias_convivencia.nivel_orden === null
    ) {
        return res.status(400).json({ mensaje: "El campo 'nivel_orden' en preferencias de convivencia es obligatorio." });
    }
    if (password.length < 8) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ mensaje: 'El correo ingresado ya está registrado.' });
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        const nuevoUsuario = new Usuario({
            nombre_completo:          nombre,
            email,
            password:                 passwordHasheada,
            telefono:                 telefono || '',
            fecha_nacimiento:         fecha_nacimiento || undefined,
            sexo_biologico:           sexo_biologico  || '',
            identidad_genero:         identidad_genero || '',
            perfil_academico,
            ubicacion_sede:           ubicacion_sede || {},
            preferencias_convivencia,
            intereses:                Array.isArray(intereses) ? intereses : [],
            emailVerificado:          true,
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            mensaje: '¡Cuenta creada! Ya puedes iniciar sesión.',
            idNuevoUsuario: nuevoUsuario._id,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensaje: 'Error de validación', detalles: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'El correo ingresado ya está registrado.' });
        }
        console.error('[registrarUsuario] Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────
// GET /api/auth/verificar-email?token=<tokenPlano>
const verificarEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ msg: 'Token de verificación requerido.' });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const usuario = await Usuario.findOne({
            emailVerificacionToken:   tokenHash,
            emailVerificacionExpires: { $gt: new Date() },
        }).select('+emailVerificacionToken +emailVerificacionExpires');

        if (!usuario) {
            return res.redirect(buildFrontendUrl('login?verificacion=expirado'));
        }

        usuario.emailVerificado          = true;
        usuario.emailVerificacionToken   = undefined;
        usuario.emailVerificacionExpires = undefined;
        await usuario.save({ validateBeforeSave: false });

        return res.redirect(buildFrontendUrl('login?verificado=true'));

    } catch (error) {
        console.error('[verificarEmail] Error:', error.message);
        return res.redirect(buildFrontendUrl('login?verificacion=error'));
    }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login  →  { email, password }
const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son requeridos.' });
    }

    try {
        const usuario = await Usuario.findOne({ email }).select('+password');
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

        // ── Verificación de email — modo no-bloqueante ────────────────────
        // El login siempre procede. El flag emailVerificado se devuelve en la
        // respuesta para que el frontend pueda mostrar un banner informativo
        // sin bloquear el acceso a la app.
        //   null  → cuenta anterior a la feature → se trata como verificada
        //   false → registrada pero sin verificar → login OK + flag = false
        //   true  → verificada → login OK + flag = true
        let emailEstaVerificado = true;

        if (usuario.emailVerificado === false) {
            emailEstaVerificado = false;
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            mensaje:         '¡Inicio de sesión exitoso!',
            token,
            emailVerificado: emailEstaVerificado,
        });

    } catch (error) {
        console.error('[loginUsuario] Error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// ─── SOLICITAR RECUPERACIÓN DE CONTRASEÑA ────────────────────────────────────
// POST /api/auth/recuperar-password  →  { email }
const olvideMiPassword = async (req, res) => {
    const emailNormalizado = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    if (!emailNormalizado) {
        return res.status(400).json({ msg: 'El correo es obligatorio.' });
    }

    if (!isSmtpConfigured()) {
        console.error('[olvideMiPassword] SMTP no configurado. Variables requeridas: SMTP_USER + SMTP_PASS (o EMAIL_USER + EMAIL_PASSWORD).');
        return res.status(503).json({
            msg: 'El servicio de correo no está disponible. Contacta al administrador.',
        });
    }

    const mensajeExito = 'Si el correo existe recibirás un enlace en breve.';

    try {
        const usuario = await Usuario.findOne({ email: emailNormalizado });

        if (!usuario) {
            return res.status(200).json({ msg: mensajeExito });
        }

        const tokenPlano = crypto.randomBytes(32).toString('hex');
        const tokenHash  = crypto.createHash('sha256').update(tokenPlano).digest('hex');

        usuario.resetPasswordToken   = tokenHash;
        usuario.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await usuario.save({ validateBeforeSave: false });

        try {
            logSmtpAudit('olvideMiPassword — antes de sendPasswordResetEmail');
            await sendPasswordResetEmail({
                to:         usuario.email,
                nombre:     usuario.nombre_completo,
                tokenPlano,
            });
        } catch (mailError) {
            logSmtpError('olvideMiPassword — sendPasswordResetEmail', mailError);

            usuario.resetPasswordToken   = undefined;
            usuario.resetPasswordExpires = undefined;
            await usuario.save({ validateBeforeSave: false });

            if (process.env.NODE_ENV !== 'production') {
                console.error('[olvideMiPassword] Token de recuperación (solo dev):', tokenPlano);
            }

            return res.status(503).json({
                msg: 'No pudimos enviar el correo de recuperación. Verifica la configuración SMTP o intenta más tarde.',
                ...(process.env.NODE_ENV !== 'production' && {
                    detalle: formatSmtpError(mailError),
                }),
            });
        }

        return res.status(200).json({ msg: mensajeExito });

    } catch (error) {
        logSmtpError('olvideMiPassword — error general', error);
        return res.status(500).json({ msg: 'Error interno. Intenta más tarde.' });
    }
};

// ─── DIAGNÓSTICO SMTP (solo para depuración) ─────────────────────────────────
// GET /api/auth/test-smtp?secret=TU_SMTP_TEST_SECRET
const testSmtp = async (req, res) => {
    const secretoEnv = process.env.SMTP_TEST_SECRET;
    const secretoReq = req.query.secret || req.headers['x-smtp-test-secret'];

    if (process.env.NODE_ENV === 'production') {
        if (!secretoEnv || secretoReq !== secretoEnv) {
            return res.status(403).json({
                ok:  false,
                msg: 'Forbidden. En producción debes pasar ?secret=SMTP_TEST_SECRET configurado en Render.',
            });
        }
    }

    try {
        const cfg = getSmtpConfig();
        const resultado = await verifySmtpConnection();

        return res.status(resultado.ok ? 200 : 503).json({
            ok:     resultado.ok,
            fase:   resultado.fase,
            mensaje: resultado.mensaje || null,
            error:  resultado.error || null,
            config: {
                host:           cfg.host,
                port:           cfg.port,
                userConfigured: Boolean(cfg.user),
                passConfigured: Boolean(cfg.pass),
                isSmtpConfigured: isSmtpConfigured(),
            },
        });
    } catch (error) {
        logSmtpError('testSmtp — error inesperado', error);
        return res.status(500).json({
            ok:    false,
            msg:   'Error inesperado al probar SMTP.',
            error: formatSmtpError(error),
        });
    }
};

// ─── RESET DE CONTRASEÑA ──────────────────────────────────────────────────────
// POST /api/auth/nueva-password  →  { token, password }
const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ msg: 'Token y contraseña son obligatorios.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ msg: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const usuario = await Usuario.findOne({
            resetPasswordToken:   tokenHash,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!usuario) {
            return res.status(400).json({ msg: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' });
        }

        usuario.password             = await bcrypt.hash(password, 10);
        usuario.resetPasswordToken   = undefined;
        usuario.resetPasswordExpires = undefined;
        await usuario.save({ validateBeforeSave: false });

        return res.status(200).json({ msg: '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('[resetPassword] Error:', error.message);
        return res.status(500).json({ msg: 'Error interno. Intenta más tarde.' });
    }
};

module.exports = {
    registrarUsuario,
    verificarEmail,
    loginUsuario,
    olvideMiPassword,
    testSmtp,
    resetPassword,
};
