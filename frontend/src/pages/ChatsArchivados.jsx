import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ChatsArchivados = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para controlar QUÉ menú de opciones de chat está abierto (guarda el ID)
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const [chatsSimulados, setChatsSimulados] = useState([
    {
      id: "3",
      tipo: "individual",
      nombre: "Matias Soto",
      ultimoMensaje: "Dale, suerte con la búsqueda bro.",
      hora: "Semana pasada",
      noLeidos: 0,
      enLinea: false,
      iniciales: "MS",
      gradiente: "from-gray-400 to-gray-500",
      usuarioId: "user-123" // ID simulado para ver el perfil
    },
    {
      id: "grupo-2",
      tipo: "grupo",
      nombre: "Interesados Depto Viña",
      ultimoMensaje: "El depto ya se arrendó, gracias a todos.",
      hora: "12 Mar",
      noLeidos: 0,
      icono: "🔒",
      colorFondo: "bg-gray-200"
    }
  ]);

  const chatsFiltrados = chatsSimulados.filter(chat => 
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Funciones de las opciones del menú individual
  const desarchivarChat = (id) => {
    console.log(`Desarchivando chat ${id}...`);
    setChatsSimulados(chatsSimulados.filter(chat => chat.id !== id));
    setMenuAbiertoId(null);
  };

  const eliminarChat = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este chat? Se borrará el historial.");
    if (confirmar) {
      console.log(`Eliminando chat ${id}...`);
      setChatsSimulados(chatsSimulados.filter(chat => chat.id !== id));
    }
    setMenuAbiertoId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER Y BUSCADOR (Fijo arriba) */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4 relative">
          <button 
            onClick={() => navigate('/chats')} 
            className="p-2 -ml-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Archivados</h1>
          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">
            {chatsSimulados.length}
          </span>
        </div>

        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en archivados..." 
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE CONVERSACIONES ARCHIVADAS */}
      <div className="p-2 mt-2 space-y-1">
        {chatsFiltrados.length > 0 ? (
          chatsFiltrados.map((chat) => (
            <div key={chat.id} className="flex items-center p-3 hover:bg-white rounded-3xl transition-all group relative">
              
              {/* ZONA CLICABLE HACIA EL CHAT (Avatar y Texto) */}
              <Link to={`/chat/${chat.id}`} className="flex flex-1 items-center overflow-hidden cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <div className="relative flex-shrink-0">
                  {chat.tipo === 'grupo' ? (
                    <div className={`w-14 h-14 ${chat.colorFondo} rounded-[1.25rem] flex items-center justify-center overflow-hidden border border-gray-100`}>
                      <span className="text-xl opacity-70">{chat.icono}</span>
                    </div>
                  ) : (
                    <div className={`w-14 h-14 bg-gradient-to-br ${chat.gradiente} rounded-[1.25rem] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-gray-100`}>
                      {chat.iniciales}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex-1 truncate pr-2">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-600 truncate">{chat.nombre}</h3>
                    <span className="text-[10px] whitespace-nowrap text-gray-400 ml-2">{chat.hora}</span>
                  </div>
                  <p className="text-xs truncate text-gray-400 font-medium">{chat.ultimoMensaje}</p>
                </div>
              </Link>

              {/* BOTÓN 3 PUNTITOS Y MENÚ CONTEXTUAL INDIVIDUAL */}
              <div className="relative flex-shrink-0 ml-2">
                <button 
                  onClick={() => setMenuAbiertoId(menuAbiertoId === chat.id ? null : chat.id)}
                  className={`p-2 rounded-full transition-colors ${menuAbiertoId === chat.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Icono de 3 puntos verticales */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {/* MENÚ DESPLEGABLE DEL CHAT ESPECÍFICO */}
                {menuAbiertoId === chat.id && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuAbiertoId(null)}></div>
                    <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in duration-200">
                      
                      <button onClick={() => desarchivarChat(chat.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19h14" /></svg>
                        Desarchivar
                      </button>
                      
                      {chat.tipo === 'individual' && (
                        <button onClick={() => navigate(`/usuario/${chat.usuarioId}`)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Ver perfil
                        </button>
                      )}
                      
                      <div className="h-px bg-gray-100 my-1"></div>
                      
                      <button onClick={() => eliminarChat(chat.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Eliminar chat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm font-bold">No se encontraron chats archivados.</p>
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

export default ChatsArchivados;