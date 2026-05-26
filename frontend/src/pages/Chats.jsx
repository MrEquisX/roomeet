import { useState } from 'react';
import { Link } from 'react-router-dom';

const Chats = () => {
  // Estados para la interactividad
  const [busqueda, setBusqueda] = useState('');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  // Lista simulada de chats (Pronto vendrán de tu backend MariaDB)
  const chatsSimulados = [
    {
      id: "grupo-1",
      tipo: "grupo",
      nombre: "Grupo Depto Los Carrera",
      ultimoMensaje: "¡Hola! ¿Vamos todos a la visita del...",
      hora: "10:24",
      noLeidos: 3,
      icono: "🏠",
      colorFondo: "bg-blue-100"
    },
    {
      id: "1",
      tipo: "individual",
      nombre: "Sarah Chen",
      ultimoMensaje: "Perfecto, nos vemos mañana entonces.",
      hora: "Ayer",
      noLeidos: 0,
      enLinea: true,
      iniciales: "SC",
      gradiente: "from-indigo-400 to-purple-600"
    },
    {
      id: "2",
      tipo: "individual",
      nombre: "Sara Morales",
      ultimoMensaje: "Hola! Vi tu perfil y tenemos muy b...",
      hora: "2d",
      noLeidos: 0,
      enLinea: false,
      iniciales: "SM",
      gradiente: "from-teal-400 to-emerald-500"
    }
  ];

  // Lógica de filtrado en tiempo real
  const chatsFiltrados = chatsSimulados.filter(chat => 
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER Y BUSCADOR (Fijo arriba) */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4 relative">
          <h1 className="text-2xl font-bold text-blue-900">Chats</h1>
          
          {/* BOTÓN 3 PUNTOS E INTERACTIVIDAD */}
          <div className="relative">
            <button 
              onClick={() => setMostrarOpciones(!mostrarOpciones)}
              className={`p-2 rounded-full transition-all ${mostrarOpciones ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {/* MENÚ DESPLEGABLE (Con opciones de Archivar, Ver Archivados y Eliminar) */}
            {mostrarOpciones && (
              <>
                {/* Overlay invisible para cerrar al hacer clic afuera */}
                <div className="fixed inset-0 z-40" onClick={() => setMostrarOpciones(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    Marcar todos leídos
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    Filtrar no leídos
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between">
                    Ver chats archivados
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">1</span>
                  </button>
                  
                  <div className="h-px bg-gray-100 my-1"></div>
                  
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                    Archivar chats
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                    Eliminar chats
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INTERACTIVA */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar conversaciones..." 
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {/* Botón para borrar la búsqueda si hay texto */}
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE CONVERSACIONES RENDERIZADA DINÁMICAMENTE */}
      <div className="p-2 mt-2 space-y-1">
        {chatsFiltrados.length > 0 ? (
          chatsFiltrados.map((chat) => (
            <Link key={chat.id} to={`/chat/${chat.id}`} className="flex items-center p-3 hover:bg-white rounded-3xl transition-all cursor-pointer group">
              
              <div className="relative flex-shrink-0">
                {chat.tipo === 'grupo' ? (
                  <div className={`w-14 h-14 ${chat.colorFondo} rounded-[1.25rem] flex items-center justify-center overflow-hidden border border-blue-100`}>
                    <span className="text-xl">{chat.icono}</span>
                  </div>
                ) : (
                  <div className={`w-14 h-14 bg-gradient-to-br ${chat.gradiente} rounded-[1.25rem] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-gray-100`}>
                    {chat.iniciales}
                  </div>
                )}
                
                {/* Indicador de mensajes no leídos */}
                {chat.noLeidos > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {chat.noLeidos}
                  </span>
                )}

                {/* Indicador de En Línea (solo para individuales) */}
                {chat.tipo === 'individual' && chat.enLinea && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="ml-4 flex-1 border-b border-gray-100 pb-4 pt-1 group-last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold text-gray-900 truncate pr-2 ${chat.noLeidos > 0 ? 'text-blue-900' : ''}`}>
                    {chat.nombre}
                  </h3>
                  <span className={`text-[10px] whitespace-nowrap ${chat.noLeidos > 0 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {chat.hora}
                  </span>
                </div>
                <p className={`text-xs truncate ${chat.noLeidos > 0 ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                  {chat.ultimoMensaje}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm font-bold">No se encontraron chats con "{busqueda}"</p>
          </div>
        )}
      </div>

      {/* MENÚ INFERIOR UNIFICADO - CHATS ACTIVO */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>

        <Link to="/chats" className="flex flex-col items-center text-blue-600 relative w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-bold">Chats</span>
        </Link>

        <Link to="/perfil" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>

    </div>
  );
};

export default Chats;