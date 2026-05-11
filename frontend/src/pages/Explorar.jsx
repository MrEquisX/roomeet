import { Link } from 'react-router-dom';

const Explorar = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header y Buscador */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Explorar</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Buscar por universidad, carrera..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Tarjeta Candidato 1 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-lg">Sarah Chen</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">92%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">21 años • PUCV</p>
              <p className="text-xs text-gray-500 mb-2">Arquitectura</p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-600 flex items-center gap-1"><span className="text-red-400">📍</span> 1.2 km</span>
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-600 flex items-center gap-1"><span className="text-yellow-500">💰</span> $250-350k</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">✨ Ordenada</span>
            <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">🚭 Sin humo</span>
            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium">📚 Estudiosa</span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md">
            Enviar mensaje
          </button>
        </div>

        {/* Tarjeta Candidato 2 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-lg">Sara Morales</h3>
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg">87%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">22 años • PUCV</p>
              <p className="text-xs text-gray-500 mb-2">Ing. Comercial</p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-600 flex items-center gap-1"><span className="text-red-400">📍</span> 2.5 km</span>
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-600 flex items-center gap-1"><span className="text-yellow-500">💰</span> $200-300k</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-medium">💪 Fitness</span>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">🎮 Gamer</span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">✨ Ordenada</span>
          </div>
          <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-2xl transition-all">
            Ver Perfil Completo
          </button>
        </div>

      </div>

      {/* Menú de Navegación Inferior */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-medium">Descubrir</span>
        </Link>
        <Link to="/explorar" className="flex flex-col items-center text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          <span className="text-[10px] font-bold">Explorar</span>
        </Link>
        <Link to="/gastos" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-[10px] font-medium">Gastos</span>
        </Link>
        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[10px] font-medium">Chats</span>
        </Link>
      </div>

    </div>
  );
};

export default Explorar;