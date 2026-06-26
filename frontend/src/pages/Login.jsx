import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/env.js';
import PasswordInput from '../components/PasswordInput.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const rutaLogo = import.meta.env.BASE_URL + 'logo-roomeet.png';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json().catch(function onParseError() {
        return {};
      });

      if (response.status === 200 && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
        return;
      }

      let mensajeError = data.mensaje;

      if (!mensajeError) {
        if (response.status === 401) {
          mensajeError = 'Contraseña incorrecta.';
        } else if (response.status === 404) {
          mensajeError = 'Usuario no encontrado.';
        } else {
          mensajeError = 'No se pudo iniciar sesión. Intenta de nuevo.';
        }
      }

      setError(mensajeError);
    } catch (err) {
      console.error('Error de conexión en login:', err);
      setError('Error de conexión con el servidor. ¿Está el backend en marcha?');
    } finally {
      setCargando(false);
    }
  };

  let textoBoton = 'Iniciar Sesión';

  if (cargando) {
    textoBoton = 'Iniciando sesión...';
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-xl border border-neutral-200 p-8 flex flex-col items-center">

        <div className="w-full flex flex-col items-center justify-center mb-5">
          <div
            className="w-40 h-40 rounded-xl bg-black shadow-lg mb-2 overflow-hidden"
          >
            <img
              src={rutaLogo}
              alt="ROOMEET"
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-neutral-700 text-center tracking-tight">
          Bienvenido de nuevo
        </h1>
        <p className="text-sm text-neutral-500 text-center mt-2 mb-8 px-4 leading-relaxed">
          Encuentra tu compañero de vivienda ideal en un espacio acogedor y seguro
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
            <label className="block text-sm font-semibold text-neutral-700 mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={function onEmailChange(e) {
                setEmail(e.target.value);
              }}
              required
              disabled={cargando}
              placeholder="estudiante@pucv.cl"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-surface text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <PasswordInput
                value={password}
                onChange={function onPasswordChange(e) {
                  setPassword(e.target.value);
                }}
                required
                disabled={cargando}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-surface text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary-light text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
          >
            {textoBoton}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">

          <Link
            to="/recuperar"
            className="block text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <p className="text-sm text-neutral-600">
            ¿No tienes una cuenta?
            <br />
            <Link
              to="/registro"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Crear cuenta nueva
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
