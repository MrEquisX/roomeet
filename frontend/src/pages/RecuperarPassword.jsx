import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/env.js';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ sent: false, error: null, loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ sent: false, error: null, loading: true });

    try {
      const response = await fetch(`${API_URL}/auth/recuperar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      // Independiente de si el email existe o no, mostramos el mensaje de éxito si el backend responde 200
      if (response.ok) {
        setFeedback({
          sent: true,
          error: null,
          loading: false
        });
        setEmail(''); // limpiamos el campo
      } else {
        // Si el servidor responde con error (ej: 400, 500), mostramos un mensaje de error amigable
        const data = await response.json().catch(() => ({}));
        setFeedback({
          sent: false,
          error: data?.msg || 'Ocurrió un error al solicitar el reseteo. Intenta nuevamente.',
          loading: false
        });
      }
    } catch (err) {
      setFeedback({
        sent: false,
        error: "No se pudo conectar al servidor. Intenta más tarde.",
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 mb-2 text-center">Recuperar Contraseña</h1>
        
        {!feedback.sent ? (
          <>
            <p className="text-sm text-gray-500 text-center mb-6">
              Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>
            {feedback.error && (
              <div className="bg-red-50 text-red-700 p-3 mb-4 rounded-2xl border border-red-200 w-full text-center text-sm">
                {feedback.error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Correo Institucional
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="estudiante@pucv.cl"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={feedback.loading}
                />
              </div>

              <button 
                type="submit" 
                disabled={feedback.loading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-2 ${
                  feedback.loading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {feedback.loading ? "Enviando..." : "Enviar correo de recuperación"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center w-full mt-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl mb-6 border border-green-200">
              <p className="font-medium text-sm">
                Si el correo existe, recibirás un enlace para cambiar tu contraseña.
              </p>
              <p className="text-xs mt-1">Revisa tu bandeja de entrada o la carpeta de spam.</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;