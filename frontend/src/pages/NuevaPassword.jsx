import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config/env.js';
import PasswordInput from '../components/PasswordInput.jsx';

const NuevaPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extraer el token de ?token=... de la query string
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState({ success: null, error: null, loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos y coincidencia
    if (!password || !confirmPassword) {
      setFeedback({
        success: null,
        error: "Debes completar ambos campos.",
        loading: false,
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        success: null,
        error: "Las contraseñas no coinciden. Inténtalo de nuevo.",
        loading: false,
      });
      return;
    }

    if (!token) {
      setFeedback({
        success: null,
        error: "El enlace de recuperación no es válido o expiró.",
        loading: false,
      });
      return;
    }

    setFeedback({
      success: null,
      error: null,
      loading: true,
    });

    try {
      const res = await fetch(`${API_URL}/auth/nueva-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password,
          token
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFeedback({
          success: "¡Tu contraseña ha sido actualizada con éxito! Ahora puedes iniciar sesión.",
          error: null,
          loading: false,
        });

        setTimeout(() => {
          navigate('/login');
        }, 1800); // Da tiempo para que el usuario vea el mensaje
      } else {
        setFeedback({
          success: null,
          error: data?.msg || "No se pudo actualizar la contraseña. Inténtalo nuevamente.",
          loading: false,
        });
      }
    } catch (err) {
      setFeedback({
        success: null,
        error: "No se pudo conectar al servidor. Intenta más tarde.",
        loading: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
        {/* Ícono de Candado/Seguridad */}
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 mb-2 text-center">Digitar Nueva Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Crea una nueva contraseña segura y que sea fácil de recordar para ti.
        </p>

        {feedback.error && (
          <div className="w-full mb-4 bg-red-50 text-red-700 rounded-lg p-3 text-sm text-center border border-red-200">
            {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="w-full mb-4 bg-green-50 text-green-700 rounded-lg p-3 text-sm text-center border border-green-200 animate-pulse">
            {feedback.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Nueva Contraseña
            </label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={feedback.loading}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Confirmar Nueva Contraseña
            </label>
            <PasswordInput
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={feedback.loading}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <button 
            type="submit" 
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4 ${
              feedback.loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            disabled={feedback.loading}
          >
            {feedback.loading ? "Guardando..." : "Guardar Contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default NuevaPassword;