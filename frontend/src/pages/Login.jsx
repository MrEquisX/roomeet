import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 200 && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
        return;
      }

      const mensajeError =
        data.mensaje ||
        (response.status === 401
          ? 'Contraseña incorrecta.'
          : response.status === 404
            ? 'Usuario no encontrado.'
            : 'No se pudo iniciar sesión. Intenta de nuevo.');

      setError(mensajeError);
    } catch (err) {
      console.error('Error de conexión en login:', err);
      setError('Error de conexión con el servidor. ¿Está el backend en marcha?');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">

        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-blue-900 mb-1">Roomeet</h1>
        <h2 className="text-xl font-semibold text-gray-800 mt-4">Bienvenido de nuevo</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-8 px-4">
          Encuentra tu compañero de vivienda ideal
        </p>

        {error && (
          <div
            role="alert"
            className="w-full mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
          >
            {error}
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
              disabled={cargando}
              placeholder="estudiante@pucv.cl"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">

          <Link to="/recuperar" className="block text-sm text-blue-600 hover:text-blue-800 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>

          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta? <br />
            <Link to="/registro" className="text-blue-600 hover:text-blue-800 font-bold">
              Crear cuenta nueva
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;