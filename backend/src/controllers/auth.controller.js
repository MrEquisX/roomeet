const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const Usuario    = require('../models/Usuario');

// ─── Transporte de correo (instancia única reutilizable) ──────────────────────
const crearTransporte = () => nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

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
            // Token inválido o expirado → redirigir con error
            return res.redirect(`${frontendUrl}/login?verificacion=expirado`);
        }

        usuario.emailVerificado          = true;
        usuario.emailVerificacionToken   = undefined;
        usuario.emailVerificacionExpires = undefined;
        await usuario.save({ validateBeforeSave: false });

        // Redirigir al login con bandera de éxito
        return res.redirect(`${frontendUrl}/login?verificado=true`);

    } catch (error) {
        console.error('[verificarEmail] Error:', error.message);
        return res.redirect(`${frontendUrl}/login?verificacion=error`);
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
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'El correo es obligatorio.' });
    }

    try {
        const usuario = await Usuario.findOne({ email });

        // Respuesta genérica para no revelar si el correo existe
        if (!usuario) {
            return res.status(200).json({ msg: 'Si el correo existe recibirás un enlace en breve.' });
        }

        const tokenPlano = crypto.randomBytes(32).toString('hex');
        const tokenHash  = crypto.createHash('sha256').update(tokenPlano).digest('hex');

        usuario.resetPasswordToken   = tokenHash;
        usuario.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await usuario.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const enlace      = `${frontendUrl}/nueva-password?token=${tokenPlano}`;

        const transporte = crearTransporte();
        await transporte.sendMail({
            from:    `"Roomeet" <${process.env.EMAIL_USER}>`,
            to:      usuario.email,
            subject: 'Recuperación de contraseña — Roomeet',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto">
                    <h2 style="color:#1d4ed8">Recupera tu contraseña</h2>
                    <p>Hola <strong>${usuario.nombre_completo}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta Roomeet.</p>
                    <p>Haz clic en el botón para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
                    <a href="${enlace}"
                       style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1d4ed8;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold;">
                        Restablecer contraseña
                    </a>
                    <p style="color:#6b7280;font-size:13px">Si no solicitaste esto, ignora este correo.</p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                    <p style="color:#9ca3af;font-size:11px">Equipo Roomeet · Chile</p>
                </div>
            `,
        });

        return res.status(200).json({ msg: 'Si el correo existe recibirás un enlace en breve.' });

    } catch (error) {
        console.error('[olvideMiPassword] Error:', error.message);
        return res.status(500).json({ msg: 'Error interno. Intenta más tarde.' });
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
    resetPassword,
};
