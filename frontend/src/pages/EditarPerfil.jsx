import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EditarPerfil = () => {
  const navigate = useNavigate();

  // Estados inicializados con los datos actuales del usuario (simulados)
  const [bio, setBio] = useState("Busco compañeros tranquilos que respeten los horarios de estudio. Me gusta el básquet y los videojuegos.");
  const [fuma, setFuma] = useState(false);
  const [mascotas, setMascotas] = useState(true);
  const [orden, setOrden] = useState(4);
  const [ruido, setRuido] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos listos para hacer PUT en el backend:", { bio, fuma, mascotas, orden, ruido });
    // Simulamos que se guardó y volvemos al perfil
    navigate('/perfil');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* Header Fijo */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm sticky top-0 z-40 flex items-center justify-between">
        <Link to="/perfil" className="text-gray-400 hover:text-blue-600 p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Editar Perfil</h1>
        <div className="w-6"></div> {/* Espaciador para centrar el título */}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Sección Biografía */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-1">Sobre mí</h3>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Cuéntale a tus futuros compañeros cómo eres..."
          />
        </section>

        {/* Sección Hábitos */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-1">Hábitos</h3>
          <div className="space-y-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            
            {/* Toggle Fuma */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">¿Fumas?</p>
                <p className="text-xs text-gray-400">Cigarro, vaper, etc.</p>
              </div>
              <button 
                type="button"
                onClick={() => setFuma(!fuma)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${fuma ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${fuma ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="border-t border-gray-50"></div>

            {/* Toggle Mascotas */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">¿Aceptas mascotas?</p>
                <p className="text-xs text-gray-400">Perros, gatos, etc.</p>
              </div>
              <button 
                type="button"
                onClick={() => setMascotas(!mascotas)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${mascotas ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${mascotas ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

          </div>
        </section>

        {/* Sección Convivencia */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-1">Niveles de Convivencia</h3>
          <div className="space-y-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            
            {/* Rango Orden */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-gray-800 text-sm">Nivel de Orden</label>
                <span className="text-blue-600 font-bold text-sm">{orden}/5</span>
              </div>
              <input 
                type="range" 
                min="1" max="5" 
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Relajado</span>
                <span>Impecable</span>
              </div>
            </div>

            {/* Rango Ruido */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-gray-800 text-sm">Tolerancia al Ruido</label>
                <span className="text-blue-600 font-bold text-sm">{ruido}/5</span>
              </div>
              <input 
                type="range" 
                min="1" max="5" 
                value={ruido}
                onChange={(e) => setRuido(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Silencio total</span>
                <span>Fiesta siempre</span>
              </div>
            </div>

          </div>
        </section>

        {/* Botón Guardar */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
        >
          Guardar Cambios
        </button>

      </form>
    </div>
  );
};

export default EditarPerfil;