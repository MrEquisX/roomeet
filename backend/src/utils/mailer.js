const nodemailer = require('nodemailer');

const SMTP_SEND_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS) || 20000;

function getSmtpConfig() {
    return {
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465,
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

function formatSmtpError(error) {
    if (!error) {
        return { message: 'Error desconocido' };
    }

    const detalle = {
        message:      error.message,
        name:         error.name,
        code:         error.code,
        command:      error.command,
        response:     error.response,
        responseCode: error.responseCode,
        errno:        error.errno,
        syscall:      error.syscall,
        address:      error.address,
        port:         error.port,
    };

    if (process.env.NODE_ENV !== 'production') {
        detalle.stack = error.stack;
    }

    return detalle;
}

function logSmtpAudit(contexto) {
    const cfg = getSmtpConfig();

    console.log(`[mailer][audit] ${contexto}`, {
        host:             cfg.host,
        port:             cfg.port,
        userResuelto:     cfg.user ? 'Existe' : 'Falta',
        passResuelto:     cfg.pass ? 'Existe' : 'Falta',
        SMTP_HOST:        process.env.SMTP_HOST || '(vacío, usa default)',
        EMAIL_HOST:       process.env.EMAIL_HOST ? 'Existe' : 'Falta',
        SMTP_PORT:        process.env.SMTP_PORT || process.env.EMAIL_PORT || '(default 587)',
        SMTP_USER:        process.env.SMTP_USER ? 'Existe' : 'Falta',
        EMAIL_USER:       process.env.EMAIL_USER ? 'Existe' : 'Falta',
        SMTP_PASS:        process.env.SMTP_PASS ? 'Existe' : 'Falta',
        EMAIL_PASSWORD:   process.env.EMAIL_PASSWORD ? 'Existe' : 'Falta',
        FRONTEND_URL:     process.env.FRONTEND_URL ? 'Existe' : 'Falta',
        NODE_ENV:         process.env.NODE_ENV || 'undefined',
        timeoutMs:        SMTP_SEND_TIMEOUT_MS,
    });
}

function logSmtpError(contexto, error) {
    console.error(`[mailer] ${contexto} — detalle JSON:`, JSON.stringify(formatSmtpError(error), null, 2));
    console.error(`[mailer] ${contexto} — objeto Error completo:`, error);
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

    if (!user) {
        throw new Error('Credencial faltante: SMTP_USER (o EMAIL_USER) no está definida en las variables de entorno.');
    }

    if (!pass) {
        throw new Error('Credencial faltante: SMTP_PASS (o EMAIL_PASSWORD) no está definida en las variables de entorno.');
    }

    // Puerto 465 → SSL directo (secure: true, sin STARTTLS)
    // Puerto 587 → STARTTLS (secure: false + requireTLS: true)
    const usaSSL = port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure:     usaSSL,
        requireTLS: !usaSSL,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout:   10000,
        socketTimeout:     15000,
        tls: {
            minVersion: 'TLSv1.2',
        },
    });
}

async function verifySmtpConnection() {
    logSmtpAudit('verifySmtpConnection');

    if (!isSmtpConfigured()) {
        const error = new Error('SMTP no configurado: faltan credenciales.');
        logSmtpError('verifySmtpConnection', error);
        return {
            ok:    false,
            fase:  'config',
            error: formatSmtpError(error),
        };
    }

    let transporte;

    try {
        transporte = createTransporter();
    } catch (error) {
        logSmtpError('verifySmtpConnection — createTransporter', error);
        return {
            ok:    false,
            fase:  'config',
            error: formatSmtpError(error),
        };
    }

    try {
        await withTimeout(
            transporte.verify(),
            SMTP_SEND_TIMEOUT_MS,
            `Timeout en transporter.verify() (${SMTP_SEND_TIMEOUT_MS}ms). Posible puerto bloqueado o host inaccesible desde Render.`
        );

        return {
            ok:      true,
            fase:    'verify',
            mensaje: 'Conexión SMTP verificada correctamente con Google.',
        };
    } catch (error) {
        logSmtpError('verifySmtpConnection — transporter.verify()', error);
        return {
            ok:    false,
            fase:  'verify',
            error: formatSmtpError(error),
        };
    } finally {
        try {
            transporte.close();
        } catch {
            // Ignorar errores al cerrar el transporte
        }
    }
}

async function sendPasswordResetEmail({ to, nombre, tokenPlano }) {
    logSmtpAudit('sendPasswordResetEmail — pre-envío');

    const { user } = getSmtpConfig();
    const enlace = buildFrontendUrl(`nueva-password?token=${tokenPlano}`);

    let transporte;

    try {
        transporte = createTransporter();
    } catch (configError) {
        logSmtpError('sendPasswordResetEmail — createTransporter', configError);
        throw configError;
    }

    console.log('[mailer] sendPasswordResetEmail — intentando enviar a:', to);

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
        const info = await withTimeout(
            envio,
            SMTP_SEND_TIMEOUT_MS,
            `Timeout SMTP (${SMTP_SEND_TIMEOUT_MS}ms). Verifica SMTP_HOST, SMTP_USER y SMTP_PASS en Render.`
        );

        console.log('[mailer] sendPasswordResetEmail — enviado OK. messageId:', info?.messageId || '(sin id)');

        return info;
    } catch (error) {
        logSmtpError('sendPasswordResetEmail — sendMail', error);
        throw error;
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
    verifySmtpConnection,
    formatSmtpError,
    logSmtpAudit,
    logSmtpError,
};
