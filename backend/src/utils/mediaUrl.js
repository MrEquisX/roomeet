/**
 * Normaliza rutas de uploads almacenadas en MongoDB.
 * El frontend las resuelve contra API_BASE; aquí garantizamos formato consistente.
 */
function normalizarRutaUpload(ruta) {
  if (!ruta || typeof ruta !== 'string') {
    return '';
  }

  const limpia = ruta.trim();
  if (!limpia) {
    return '';
  }

  if (/^https?:\/\//i.test(limpia)) {
    try {
      const url = new URL(limpia);
      if (url.pathname.startsWith('/uploads/')) {
        return url.pathname;
      }
      return limpia;
    } catch {
      return '';
    }
  }

  return limpia.startsWith('/') ? limpia : `/${limpia}`;
}

module.exports = { normalizarRutaUpload };
