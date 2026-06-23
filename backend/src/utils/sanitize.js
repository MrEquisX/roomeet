const MAX_MENSAJE_LENGTH = 2000;

function sanitizarTexto(texto, maxLength = MAX_MENSAJE_LENGTH) {
  if (texto === null || texto === undefined) {
    return '';
  }

  let limpio = String(texto)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  if (limpio.length > maxLength) {
    limpio = limpio.slice(0, maxLength);
  }

  return limpio;
}

function sanitizarEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase().slice(0, 254);
}

module.exports = {
  MAX_MENSAJE_LENGTH,
  sanitizarTexto,
  sanitizarEmail,
};
