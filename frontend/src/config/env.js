const DEFAULT_API_BASE_DESARROLLO = 'http://localhost:3000';
const DEFAULT_API_BASE_PRODUCCION = 'https://roomeet-backend.onrender.com';

const esModoProduccion = import.meta.env.PROD;

function normalizarUrlBase(urlCruda) {
  if (!urlCruda) {
    return '';
  }

  if (typeof urlCruda !== 'string') {
    return '';
  }

  let urlLimpia = urlCruda.trim();

  while (urlLimpia.endsWith('/')) {
    urlLimpia = urlLimpia.slice(0, -1);
  }

  return urlLimpia;
}

let apiBase = DEFAULT_API_BASE_DESARROLLO;

const viteApiBase = import.meta.env.VITE_API_BASE;
const apiBaseDesdeEntorno = normalizarUrlBase(viteApiBase);

if (apiBaseDesdeEntorno.length > 0) {
  apiBase = apiBaseDesdeEntorno;
} else if (esModoProduccion) {
  apiBase = DEFAULT_API_BASE_PRODUCCION;
  console.warn(
    '[ROOMEET] VITE_API_BASE no definida en el build. Usando backend Render por defecto:',
    apiBase
  );
}

let socketUrl = apiBase;

const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;
const socketDesdeEntorno = normalizarUrlBase(viteSocketUrl);

if (socketDesdeEntorno.length > 0) {
  socketUrl = socketDesdeEntorno;
} else if (apiBase.length > 0) {
  socketUrl = apiBase;
}

export const API_BASE = apiBase;
export const API_URL = apiBase.length > 0 ? apiBase + '/api' : '/api';
export const SOCKET_URL = socketUrl;
