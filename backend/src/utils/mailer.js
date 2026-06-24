const nodemailer = require('nodemailer');

const SMTP_SEND_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS) || 20000;

function getSmtpConfig() {
    return {
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    };
}

function isSmtpConfigured() {
    const { user, pass } = getSmtpConfig();
    return Boolean(user && pass);
}

function getFrontendBaseUrl() {
    const url = process.env.FRONTEND_URL || 'http://localhost:5173';
    return url.replace(/\/+$/, '');
}

/** Rutas del frontend con HashRouter (/#/ruta) */
function buildFrontendUrl(pathWithQuery) {
    const base = getFrontendBaseUrl();
    const path = pathWithQuery.startsWith('/') ? pathWithQuery.slice(1) : pathWithQuery;
    return `${base}/#/${path}`;
}

function withTimeout(promise, ms, mensaje) {
    let timerId;

    const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
            reject(new Error(mensaje));
        }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timerId);
    });
}

function createTransporter() {
    const { host, port, user, pass } = getSmtpConfig();

    if (!user || !pass) {
        throw new Error('SMTP no configurado: faltan credenciales de correo.');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        requireTLS: port === 587,
        tls: {
            minVersion: 'TLSv1.2',
        },
    });
}

async function sendPasswordResetEmail({ to, nombre, tokenPlano }) {
    const { user } = getSmtpConfig();
    const enlace = buildFrontendUrl(`nueva-password?token=${tokenPlano}`);

    let transporte;
    try {
        transporte = createTransporter();
    } catch (configError) {
        throw new Error(configError.message || 'SMTP no configurado.');
    }

    const envio = transporte.sendMail({
        from:    `"Roomeet" <${user}>`,
        to,
        subject: 'Recuperación de contraseña — Roomeet',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#1d4ed8">Recupera tu contraseña</h2>
                <p>Hola <strong>${nombre || 'estudiante'}</strong>,</p>
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

    try {
        await withTimeout(
            envio,
            SMTP_SEND_TIMEOUT_MS,
            `Timeout SMTP (${SMTP_SEND_TIMEOUT_MS}ms). Verifica SMTP_HOST, SMTP_USER y SMTP_PASS en Render.`
        );
    } catch (error) {
        const mensaje = error?.message || 'Error desconocido al enviar correo.';
        console.error('[mailer] sendPasswordResetEmail:', mensaje);
        throw new Error(mensaje);
    } finally {
        try {
            transporte.close();
        } catch {
            // Ignorar errores al cerrar el transporte
        }
    }
}

module.exports = {
    getSmtpConfig,
    isSmtpConfigured,
    getFrontendBaseUrl,
    buildFrontendUrl,
    createTransporter,
    sendPasswordResetEmail,
};
