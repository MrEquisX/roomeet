import { useState } from 'react';
import { Link } from 'react-router-dom';

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header y Buscador */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-900">Explorar</h1>
            <Link to="/dashboard" className="text-sm text-blue-600 font-bold">Volver</Link>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por universidad, carrera..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Botón de Filtros que abre el menú lateral */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </div>

      {/* MENÚ LATERAL DE FILTROS */}
      {isFilterOpen && (
        <>
          {/* Fondo oscuro al abrir el menú */}
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity" onClick={() => setIsFilterOpen(false)} />
          
          {/* Panel Lateral */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl p-6 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Presupuesto Máximo</label>
                <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferencias</label>
                <div className="flex flex-wrap gap-2">
                  {['Sin humo', 'Mascotas', 'Silencio', 'Orden'].map(f => (
                    <button key={f} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-blue-500 hover:text-blue-500">{f}</button>
                  ))}
                </div>
              </div>
            </div>

            <button 
                onClick={() => setIsFilterOpen(false)}
                className="absolute bottom-6 left-6 right-6 bg-blue-600 text-white font-bold py-4 rounded-2xl"
            >
                Aplicar Filtros
            </button>
          </div>
        </>
      )}

      {/* Contenido (Lista) - Aquí iría tu lógica de filtrado con searchTerm */}
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-400">Resultados para: "{searchTerm || 'Todos'}"</p>
        {/* ... tarjetas de estudiantes ... */}
      </div>

    </div>
  );
};

export default Explorar;