import { API_URL } from '../config/env.js';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    // Determinar si el body es FormData
    const isFormData = options.body instanceof FormData;

    // Configurar headers por defecto dependiendo del tipo de body
    const headers = {
      ...options.headers,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    // Inyectar el token automáticamente si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Si es FormData, no hay que pasar 'Content-Type' (el navegador lo agrega)
    const config = {
      ...options,
      headers,
      credentials: 'include',
    };
    if (isFormData) {
      // Eliminar 'Content-Type' si está, para que el navegador lo maneje correctamente
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      // Si la sesión expiró (401), limpiar y redirigir
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        return null;
      }

      // Manejar errores de servidor (500 o similares)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const mensajeError = errorData.mensaje || errorData.message || 'Error en la petición';
        throw new Error(mensajeError);
      }

      // Devolver JSON si la respuesta tiene contenido
      if (response.status !== 204) {
        return await response.json();
      }
      
      return true;
    } catch (error) {
      console.error(`[apiClient Error] en ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Métodos de ayuda rápidos
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
