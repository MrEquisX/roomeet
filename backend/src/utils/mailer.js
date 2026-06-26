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
    const urlBase = process.env.FRONTEND_URL;

    if (!urlBase) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FRONTEND_URL no está definida en las variables de entorno.');
        }

        return 'http://localhost:5173';
    }

    const urlSinBarraFinal = urlBase.trim().replace(/\/+$/, '');

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
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de contraseña — Roomeet</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;">
        <tr>
            <td align="center" style="padding:24px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;">
                    <tr>
                        <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#374151;">
                            <h2 style="color:#1d4ed8;margin:0 0 16px;font-size:22px;">Recupera tu contraseña</h2>
                            <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta Roomeet.
                            </p>
                            <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
                                Haz clic en el botón para crear una nueva contraseña. Este enlace es válido por
                                <strong>1 hora</strong>.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px auto;">
                                <tr>
                                    <td align="center" bgcolor="#007bff" style="border-radius:5px;">
                                        <a href="${enlaceRecuperacion}" target="_blank" rel="noopener noreferrer" style="background-color:#007bff;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">Restablecer contraseña</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size:13px;line-height:1.6;margin:0 0 16px;color:#6b7280;">
                                Si el botón no funciona,
                                <a href="${enlaceRecuperacion}" target="_blank" rel="noopener noreferrer" style="color:#007bff;text-decoration:underline;">haz clic aquí para restablecer tu contraseña</a>.
                            </p>
                            <p style="font-size:13px;margin:0 0 24px;color:#6b7280;">
                                Si no solicitaste esto, ignora este correo.
                            </p>
                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                            <p style="color:#9ca3af;font-size:11px;margin:0;">Equipo Roomeet · Chile</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
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

    const enlaceRecuperacion = buildFrontendUrl(`nueva-password?token=${encodeURIComponent(token)}`);
    const htmlCorreo = buildPasswordResetHtml(enlaceRecuperacion);

    console.log('[mailer] URL de recuperación:', enlaceRecuperacion);
    console.log('[mailer] HTML enviado a SendGrid:\n', htmlCorreo);

    const mensaje = {
        to: to,
        from: {
            email: remitenteEmail,
            name: 'Roomeet',
        },
        subject: 'Recuperación de contraseña — Roomeet',
        html: htmlCorreo,
        text: [
            'Recuperación de contraseña — Roomeet',
            '',
            'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
            'Este enlace es válido por 1 hora:',
            '',
            enlaceRecuperacion,
            '',
            'Si no solicitaste esto, ignora este correo.',
            '',
            'Equipo Roomeet · Chile',
        ].join('\n'),
        trackingSettings: {
            clickTracking: {
                enable: false,
                enableText: false,
            },
        },
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
