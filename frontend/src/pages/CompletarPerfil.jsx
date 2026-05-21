import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompletarPerfil = () => {
  const navigate = useNavigate();
  // Estado para controlar si mostramos la ventana emergente de advertencia
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  // Cuando hace clic en omitir, mostramos la alerta
  const handleOmitirClick = () => {
    setMostrarAlerta(true);
  };

  // Si confirma en la alerta que quiere omitir, lo mandamos al dashboard
  const confirmarOmitir = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col relative">
        
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">¡Cuenta Creada! 🎉</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Para ayudarte a encontrar compañeros compatibles, cuéntanos cómo es tu estilo de vida y preferencias.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* SECCIÓN: BIOGRAFÍA */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Sobre ti</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Mini Biografía</label>
              <textarea required rows="3" placeholder="Busco un ambiente tranquilo para estudiar, me gusta hacer deporte los fines de semana..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
            </div>
          </section>

          {/* SECCIÓN: CONVIVENCIA */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Reglas de Convivencia</h2>
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Fumas?</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="fuma" value="true" /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="fuma" value="false" defaultChecked /> No</label>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Aceptas mascotas?</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="mascotas" value="true" defaultChecked /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="mascotas" value="false" /> No</label>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Visitas frecuentes?</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="visitas" value="true" /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="visitas" value="false" defaultChecked /> No</label>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Nivel de Orden (1 al 5)</label>
              <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                <span>Relajado</span>
                <span>Estricto</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Tolerancia al Ruido (1 al 5)</label>
              <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                <span>Silencio total</span>
                <span>Fiesta</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Horario de Clases</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                <option value="diurno">Diurno (Estudio de día)</option>
                <option value="nocturno">Nocturno (Estudio de noche)</option>
                <option value="mixto">Mixto (Flexible)</option>
              </select>
            </div>
          </section>

          {/* SECCIÓN: INTERESES */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Tus Intereses</h2>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Deportes ⚽</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Gaming 🎮</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Música 🎵</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Cocina 🍳</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Cine y Series 🍿</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Lectura 📚</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Arte y Diseño 🎨</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Viajes ✈️</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Fotografía 📷</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" /> <span className="text-xs font-medium">Fiestas 🎉</span>
              </label>
            </div>
          </section>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Guardar y Entrar a Roomeet
            </button>
            
            <button 
              type="button" 
              onClick={handleOmitirClick}
              className="w-full bg-transparent border-2 border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 font-bold py-3 rounded-2xl transition-all"
            >
              Omitir por ahora
            </button>
          </div>
          
        </form>
      </div>

      {/* VENTANA EMERGENTE (MODAL) DE ADVERTENCIA */}
      {mostrarAlerta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4 mx-auto">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Seguro que quieres omitir?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Al tener tu perfil incompleto, serás menos fiable para la comunidad y tendrás menos posibilidades de hacer Match. Puedes completarlo más tarde en tu perfil.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMostrarAlerta(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={confirmarOmitir}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
              >
                Sí, omitir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompletarPerfil;