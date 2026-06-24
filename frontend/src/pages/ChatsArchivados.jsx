import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/env.js';
import BottomNav from '../components/BottomNav.jsx';

const ChatsArchivados = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const [chatsArchivados, setChatsArchivados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatsArchivados = async () => {
      setCargando(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/chats/archivados`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('No se pudo cargar chats archivados');
        const data = await res.json();
        setChatsArchivados(data.chats || data); // Soporta distintos shapes
      } catch (err) {
        setError(err?.message || 'Error desconocido');
      } finally {
        setCargando(false);
      }
    };
    fetchChatsArchivados();
  }, []);

  const chatsFiltrados = chatsArchivados.filter(chat =>
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleDesarchivar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${id}/desarchivar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 200) {
        setChatsArchivados(prev => prev.filter(chat => chat.id !== id));
        setMenuAbiertoId(null);
      } else {
        alert('No se pudo desarchivar el chat.');
      }
    } catch (err) {
      alert('Error al desarchivar.');
    }
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
            {chatsArchivados.length}
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
        {cargando ? (
          <div className="text-center py-10 text-gray-400 font-bold">Cargando...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 font-bold">{error}</div>
        ) : (
          <>
            {chatsFiltrados.length > 0 ? (
              chatsFiltrados.map((chat) => (
                <div key={chat.id} className="flex items-center p-3 hover:bg-white rounded-3xl transition-all group relative">
                  {/* ZONA CLICABLE HACIA EL CHAT (Avatar y Texto) */}
                  <Link to={`/chat/${chat.id}`} className="flex flex-1 items-center overflow-hidden cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                    <div className="relative flex-shrink-0">
                      {chat.tipo === 'grupo' ? (
                        <div className={`w-14 h-14 ${chat.colorFondo || 'bg-gray-200'} rounded-[1.25rem] flex items-center justify-center overflow-hidden border border-gray-100`}>
                          <span className="text-xl opacity-70">{chat.icono || "👥"}</span>
                        </div>
                      ) : (
                        <div className={`w-14 h-14 bg-gradient-to-br ${chat.gradiente || 'from-gray-400 to-gray-500'} rounded-[1.25rem] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-gray-100`}>
                          {chat.iniciales || (chat.nombre ? chat.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?')}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1 truncate pr-2">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-600 truncate">{chat.nombre}</h3>
                        <span className="text-[10px] whitespace-nowrap text-gray-400 ml-2">{chat.hora || ''}</span>
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

                          <button
                            onClick={() => handleDesarchivar(chat.id)}
                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19h14" /></svg>
                            Desarchivar
                          </button>

                          {chat.tipo === 'individual' && chat.usuarioId && (
                            <button onClick={() => navigate(`/usuario/${chat.usuarioId}`)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              Ver perfil
                            </button>
                          )}

                          {/* (Puedes agregar otros botones del menú aquí si lo deseas) */}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Botón Desarchivar visible fuera del menú */}
                  <button
                    onClick={() => handleDesarchivar(chat.id)}
                    className="ml-4 px-4 py-2 bg-blue-100 text-blue-600 text-xs rounded-lg font-bold hover:bg-blue-200 transition-all"
                  >
                    Desarchivar
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm font-bold">No se encontraron chats archivados.</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="chats" />
    </div>
  );
};

export default ChatsArchivados;