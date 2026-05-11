import { Link } from 'react-router-dom';

const Publicar = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col">
        
        {/* Encabezado */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-blue-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Publicar Alojamiento</h1>
            <p className="text-xs text-gray-500">Agrega los detalles de tu espacio</p>
          </div>
        </div>

        {/* Formulario que coincide con la tabla ALOJAMIENTOS */}
        <form className="w-full space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Dirección completa
            </label>
            <input 
              type="text" 
              placeholder="Ej. Av. Los Carrera 123, Depto 45"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Precio mensual ($)
              </label>
              <input 
                type="number" 
                placeholder="Ej. 250000"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Habitaciones
              </label>
              <input 
                type="number" 
                min="1"
                placeholder="1"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Reglas de la casa y descripción
            </label>
            <textarea 
              rows="4"
              placeholder="Describe el ambiente, si incluye gastos comunes, reglas de limpieza..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Botón para subir imágenes (simulado) */}
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer mt-2">
            <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-medium text-blue-600">Sube fotos del lugar</span>
          </div>

          {/* Botón Principal */}
          <button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-6"
          >
            Publicar Alojamiento
          </button>
        </form>

      </div>
    </div>
  );
};

export default Publicar;