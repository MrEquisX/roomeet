const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const Usuario      = require('../models/Usuario');

// ─── Transporte de correo (se crea una vez y se reutiliza) ───────────────────
const crearTransporte = () => nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,            // true para 465, false para 587 con STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const registrarUsuario = async (req, res) => {
    const { 
        nombre, 
        email, 
        password, 
        perfil_academico, 
        preferencias_convivencia, 
        intereses 
    } = req.body;

    // Validación de campos obligatorios básicos
    if (!nombre || !email || !password || !perfil_academico || !preferencias_convivencia) {
        return res.status(400).json({ mensaje: 'Error: Todos los campos son obligatorios (nombre, email, password, perfil_academico, preferencias_convivencia).' });
    }

    // Validar que nivel_orden exista dentro de preferencias_convivencia
    if (
        !Object.prototype.hasOwnProperty.call(preferencias_convivencia, "nivel_orden") ||
        preferencias_convivencia.nivel_orden === undefined ||
        preferencias_convivencia.nivel_orden === null
    ) {
        return res.status(400).json({ mensaje: "Error: El campo 'nivel_orden' en preferencias_convivencia es obligatorio." });
    }

    try {
        // Buscar usuario existente
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ mensaje: 'Error: El correo ingresado ya está registrado.' });
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        // Crear y guardar la instancia del usuario
        const nuevoUsuario = new Usuario({
            nombre_completo: nombre,
            email,
            password: passwordHasheada,
            perfil_academico,
            preferencias_convivencia,
            intereses
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente.',
            idNuevoUsuario: nuevoUsuario._id
        });

    } catch (error) {
        // Error de validación de Mongoose
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: "Error de validación (campos incompletos o inválidos)", detalles: error.message });
        }
        // Error de duplicado de clave única (correo)
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'Error: El correo ingresado ya está registrado.' });
        }
        console.error('Error en el registro:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Incluimos explícitamente la contraseña en la búsqueda
        const usuario = await Usuario.findOne({ email }).select('+password');
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Error: Usuario no encontrado.' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Error: Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({ mensaje: '¡Inicio de sesión exitoso!', token });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// ─── RECUPERAR CONTRASEÑA ────────────────────────────────────────────────────
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

        // Generar token aleatorio (32 bytes = 64 hex chars)
        const tokenPlano = crypto.randomBytes(32).toString('hex');
        // Guardar el hash en la DB (nunca el token en claro)
        const tokenHash  = crypto.createHash('sha256').update(tokenPlano).digest('hex');

        usuario.resetPasswordToken   = tokenHash;
        usuario.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await usuario.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const enlace = `${frontendUrl}/nueva-password?token=${tokenPlano}`;

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
                    <p style="color:#6b7280;font-size:13px">Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.</p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                    <p style="color:#9ca3af;font-size:11px">Roomeet · Campus PUCV · Valparaíso</p>
                </div>
            `,
        });

        return res.status(200).json({ msg: 'Si el correo existe recibirás un enlace en breve.' });

    } catch (error) {
        console.error('[olvideMiPassword] Error:', error.message);
        return res.status(500).json({ msg: 'Error interno. Intenta más tarde.' });
    }
};

// ─── RESET DE CONTRASEÑA ─────────────────────────────────────────────────────
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
        // Hashear el token recibido para comparar con el guardado en DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const usuario = await Usuario.findOne({
            resetPasswordToken:   tokenHash,
            resetPasswordExpires: { $gt: new Date() },  // aún no expirado
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!usuario) {
            return res.status(400).json({ msg: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' });
        }

        // Hash de la nueva contraseña y limpieza del token
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

module.exports = { registrarUsuario, loginUsuario, olvideMiPassword, resetPassword };