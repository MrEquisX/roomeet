const rateLimit = require('express-rate-limit');

const respuestaLimite = (mensaje) => ({
  status: 429,
  mensaje,
});

const crearLimiter = ({ windowMs, max, mensaje }) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: respuestaLimite(mensaje),
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/** Login, recuperar contraseña — máximo 10 intentos / 15 min por IP */
const authStrictLimiter = crearLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  mensaje: 'Demasiados intentos de acceso. Espera 15 minutos e intenta de nuevo.',
});

/** Registro, reset password, verificación — 30 / 15 min por IP */
const authGeneralLimiter = crearLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  mensaje: 'Demasiadas solicitudes de autenticación. Intenta más tarde.',
});

/** Swipes y notificaciones — 120 / 15 min por IP (usuarios autenticados) */
const matchesLimiter = crearLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
  mensaje: 'Has realizado demasiadas acciones. Espera un momento e intenta de nuevo.',
});

module.exports = {
  authStrictLimiter,
  authGeneralLimiter,
  matchesLimiter,
};
