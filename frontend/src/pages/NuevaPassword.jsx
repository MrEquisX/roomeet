import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NuevaPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pequeña validación visual de ejemplo
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden. Inténtalo de nuevo.");
      return;
    }

    console.log("Enviando nueva contraseña al backend...");
    // Aquí a futuro el backend validará el token de la URL y guardará la nueva clave
    
    alert("¡Tu contraseña ha sido actualizada con éxito!");
    navigate('/login');
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

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Nueva Contraseña
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Confirmar Nueva Contraseña
            </label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
          >
            Guardar Contraseña
          </button>
          
        </form>

      </div>
    </div>
  );
};

export default NuevaPassword;