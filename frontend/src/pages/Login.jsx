import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  // 1. Creamos la "memoria" para guardar lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 2. Función que se ejecuta al presionar "Iniciar Sesión"
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    
    // Por ahora solo imprimimos en consola para probar que funciona
    console.log("Datos capturados listos para ir al backend:", { email, password });
    
    // Simulamos que el login fue exitoso y lo mandamos al dashboard
    // Pronto cambiaremos esto por la validación real con tu base de datos
    navigate('/dashboard');
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

        {/* 3. Conectamos el formulario a la función handleSubmit */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Correo Institucional
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Guardamos lo que tipea
              required
              placeholder="estudiante@pucv.cl"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                onChange={(e) => setPassword(e.target.value)} // Guardamos lo que tipea
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          
          {/* Aquí está el cambio a <Link> para conectar con RecuperarPassword.jsx */}
          <Link to="/recuperar" className="block text-sm text-blue-600 hover:text-blue-800 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
          
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta? <br/>
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