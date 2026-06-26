const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SENDGRID_API_KEY;

if (sendGridApiKey) {
    sgMail.setApiKey(sendGridApiKey);
}

function isSendGridConfigured() {
    const tieneApiKey = Boolean(process.env.SENDGRID_API_KEY);
    const tieneRemitente = Boolean(process.env.SENDGRID_SENDER_EMAIL);

    if (tieneApiKey && tieneRemitente) {
        return true;
    }

    return false;
}

function getFrontendBaseUrl() {
    const urlBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const urlSinBarraFinal = urlBase.replace(/\/+$/, '');

    return urlSinBarraFinal;
}

function buildFrontendUrl(pathWithQuery) {
    const base = getFrontendBaseUrl();
    let path = pathWithQuery;

    if (path.startsWith('/')) {
        path = path.slice(1);
    }

    const urlCompleta = `${base}/#/${path}`;

    return urlCompleta;
}

function buildPasswordResetHtml(enlaceRecuperacion) {
    const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#1d4ed8">Recupera tu contraseña</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta Roomeet.</p>
            <p>Haz clic en el botón para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
            <a href="${enlaceRecuperacion}"
               style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1d4ed8;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold;">
                Restablecer contraseña
            </a>
            <p style="color:#6b7280;font-size:13px">Si no solicitaste esto, ignora este correo.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
            <p style="color:#9ca3af;font-size:11px">Equipo Roomeet · Chile</p>
        </div>
    `;

    return html;
}

async function sendPasswordResetEmail(to, token) {
    const remitenteEmail = process.env.SENDGRID_SENDER_EMAIL;

    if (!process.env.SENDGRID_API_KEY) {
        const errorConfig = new Error('SENDGRID_API_KEY no está definida en las variables de entorno.');
        throw errorConfig;
    }

    if (!remitenteEmail) {
        const errorRemitente = new Error('SENDGRID_SENDER_EMAIL no está definida en las variables de entorno.');
        throw errorRemitente;
    }

    const enlaceRecuperacion = buildFrontendUrl(`nueva-password?token=${token}`);

    const mensaje = {
        to: to,
        from: {
            email: remitenteEmail,
            name: 'Roomeet',
        },
        subject: 'Recuperación de contraseña — Roomeet',
        html: buildPasswordResetHtml(enlaceRecuperacion),
    };

    try {
        const respuesta = await sgMail.send(mensaje);

        console.log('[mailer] sendPasswordResetEmail — enviado OK a:', to);

        return respuesta;
    } catch (error) {
        if (error.response) {
            console.error('[mailer] SendGrid error.response.body:', error.response.body);
        } else {
            console.error('[mailer] SendGrid error.message:', error.message);
        }

        throw error;
    }
}

module.exports = {
    isSendGridConfigured,
    getFrontendBaseUrl,
    buildFrontendUrl,
    sendPasswordResetEmail,
};
