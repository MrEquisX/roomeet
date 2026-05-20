import { Link } from 'react-router-dom';

const Chats = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header y Buscador de Chats */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Chats</h1>
          <button className="text-gray-400 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Buscar conversaciones..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Conversaciones */}
      <div className="p-2">
        {/* Chat Grupal o de Hogar */}
        <Link to="/chat/grupo-1" className="flex items-center p-4 hover:bg-white rounded-3xl transition-all cursor-pointer group">
          <div className="relative">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden">
               <span className="text-blue-600 font-bold">🏠</span>
            </div>
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">3</span>
          </div>
          <div className="ml-4 flex-1 border-b border-gray-100 pb-4 group-last:border-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900">Grupo Depto Los Carrera</h3>
              <span className="text-[10px] text-gray-400">10:24</span>
            </div>
            <p className="text-xs text-blue-600 font-medium truncate">¡Hola! ¿Vamos todos a la visita del...</p>
          </div>
        </Link>

        {/* Chat Individual 1 */}
        <Link to="/chat/1" className="flex items-center p-4 hover:bg-white rounded-3xl transition-all cursor-pointer group">
          <div className="relative">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl overflow-hidden"></div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="ml-4 flex-1 border-b border-gray-100 pb-4 group-last:border-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900">Sarah Chen</h3>
              <span className="text-[10px] text-gray-400">Ayer</span>
            </div>
            <p className="text-xs text-gray-500 truncate">Perfecto, nos vemos mañana enton...</p>
          </div>
        </Link>

        {/* Chat Individual 2 */}
        <Link to="/chat/2" className="flex items-center p-4 hover:bg-white rounded-3xl transition-all cursor-pointer group">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl overflow-hidden"></div>
          <div className="ml-4 flex-1 border-b border-gray-100 pb-4 group-last:border-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900">Sara Morales</h3>
              <span className="text-[10px] text-gray-400">2d</span>
            </div>
            <p className="text-xs text-gray-500 truncate">Hola! Vi tu perfil y tenemos muy b...</p>
          </div>
        </Link>
      </div>

      {/* MENÚ INFERIOR UNIFICADO - CHATS ACTIVO */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        
        {/* 1. Descubrir - INACTIVO */}
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Descubrir</span>
        </Link>

        {/* 2. Explorar - INACTIVO */}
        <Link to="/explorar" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium">Explorar</span>
        </Link>
        
        {/* 3. Chats - ACTIVO */}
        <Link to="/chats" className="flex flex-col items-center text-blue-600 relative">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-bold">Chats</span>
        </Link>

        {/* 4. Perfil - INACTIVO */}
        <Link to="/perfil" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>

    </div>
  );
};

export default Chats;