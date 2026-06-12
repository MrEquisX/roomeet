const DEFAULT_API_BASE = 'http://localhost:3000';

let apiBase = DEFAULT_API_BASE;

const viteApiBase = import.meta.env.VITE_API_BASE;

if (viteApiBase) {
  if (typeof viteApiBase === 'string') {
    if (viteApiBase.length > 0) {
      apiBase = viteApiBase;
    }
  }
}

let socketUrl = apiBase;

const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;

if (viteSocketUrl) {
  if (typeof viteSocketUrl === 'string') {
    if (viteSocketUrl.length > 0) {
      socketUrl = viteSocketUrl;
    }
  }
}

export const API_BASE = apiBase;
export const API_URL = apiBase + '/api';
export const SOCKET_URL = socketUrl;
