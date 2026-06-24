import { API_BASE } from '../config/env.js';

/**
 * Convierte rutas relativas del backend (/uploads/...) en URL absolutas.
 * Reescribe URLs de localhost hacia API_BASE en producción.
 */
export function getImageUrl(ruta) {
  if (!ruta || typeof ruta !== 'string') {
    return null;
  }

  const limpia = ruta.trim();
  if (!limpia) {
    return null;
  }

  if (/^https?:\/\//i.test(limpia)) {
    try {
      const url = new URL(limpia);
      if (url.pathname.startsWith('/uploads/')) {
        return `${API_BASE}${url.pathname}`;
      }
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return null;
      }
      return limpia;
    } catch {
      return null;
    }
  }

  const path = limpia.startsWith('/') ? limpia : `/${limpia}`;
  if (!path.startsWith('/uploads/')) {
    return null;
  }

  return `${API_BASE}${path}`;
}

export function getInicialesAvatar(nombre) {
  if (!nombre || typeof nombre !== 'string') {
    return '?';
  }

  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return '?';
  }

  return partes
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
