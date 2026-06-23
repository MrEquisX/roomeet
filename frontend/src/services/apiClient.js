import { API_URL } from '../config/env.js';

const REQUEST_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(mensaje, { status = 0, esRed = false } = {}) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.esRed = esRed;
  }
}

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    const headers = { ...options.headers };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };
    if (isFormData) {
      delete config.headers['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        throw new ApiError('Sesión expirada. Inicia sesión de nuevo.', { status: 401 });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const mensajeError = errorData.mensaje || errorData.msg || errorData.message || 'Error en la petición';
        throw new ApiError(mensajeError, { status: response.status });
      }

      if (response.status !== 204) {
        return await response.json();
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('La solicitud tardó demasiado. Revisa tu conexión e intenta de nuevo.', { esRed: true });
      }

      throw new ApiError('Sin conexión al servidor. Verifica tu internet e intenta de nuevo.', { esRed: true });
    } finally {
      clearTimeout(timeoutId);
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};
