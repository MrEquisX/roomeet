import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

const getToken = () => {
  try { return localStorage.getItem('token'); } catch { return null; }
};

// ─── Chats ────────────────────────────────────────────────────────────────────
const Chats = () => {
  // ── Tab activa: 'mensajes' | 'guardados' ──────────────────────────────────
  const [tabActiva, setTabActiva] = useState('mensajes');

  // ── Estado chats ──────────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [chats, setChats] = useState([]);
  const [cargandoChats, setCargandoChats] = useState(true);
  const [errorChats, setErrorChats] = useState('');

  // ── Estado favoritos ──────────────────────────────────────────────────────
  const [favoritos, setFavoritos] = useState([]);
  const [cargandoFavs, setCargandoFavs] = useState(false);
  const [errorFavs, setErrorFavs] = useState('');
  const [quitandoId, setQuitandoId] = useState(null);

  const navigate = useNavigate();

  // ── Fetch chats ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      setCargandoChats(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/chats`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error('Error al cargar chats');
        const data = await res.json();
        setChats(data);
      } catch {
        setChats([]);
        setErrorChats('No se pudieron cargar los chats. Revisa tu conexión.');
      } finally {
        setCargandoChats(false);
      }
    };
    fetchChats();
  }, []);

  // Contador para recargar favoritos manualmente (botón Reintentar)
  const [triggerFavs, setTriggerFavs] = useState(0);
  const recargarFavoritos = () => setTriggerFavs((t) => t + 1);

  // ── Fetch favoritos ────────────────────────────────────────────────────────
  useEffect(() => {
    if (tabActiva !== 'guardados') return;

    let cancelado = false;

    async function doFetchFavs() {
      if (!cancelado) {
        setCargandoFavs(true);
        setErrorFavs('');
      }

      const token = getToken();
      try {
        const res = await fetch(`${API_BASE}/api/favoritos`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error('Error al cargar favoritos');
        const data = await res.json();
        if (!cancelado) {
          setFavoritos(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelado) setErrorFavs('No se pudieron cargar las viviendas guardadas.');
      } finally {
        if (!cancelado) setCargandoFavs(false);
      }
    }

    doFetchFavs();
    return () => { cancelado = true; };
  }, [tabActiva, triggerFavs]);

  // ── Quitar favorito ────────────────────────────────────────────────────────
  const handleQuitarFavorito = async (alojamientoId) => {
    setQuitandoId(alojamientoId);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/favoritos/${alojamientoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setFavoritos((prev) => prev.filter((f) => (f._id || f.id) !== alojamientoId));
    } catch {
      // Falla silenciosa — la lista no cambia
    } finally {
      setQuitandoId(null);
    }
  };

  // ── Contactar anunciante de una vivienda guardada ──────────────────────────
  const handleContactarAnunciante = async (vivienda) => {
    const anuncianteId = vivienda.anunciante?.id || vivienda.anunciante?._id || vivienda.anuncianteId;
    if (!anuncianteId) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ alojamientoId: vivienda._id || vivienda.id }),
      });
      const solicitud = await res.json();
      const chatId = solicitud._id || solicitud.id || solicitud.idSolicitud || anuncianteId;
      navigate(`/chat/${chatId}`);
    } catch {
      navigate(`/chat/${anuncianteId}`);
    }
  };

  const chatsFiltrados = chats.filter((c) =>
    !busqueda.trim() || c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* HEADER */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4 relative">
          <h1 className="text-2xl font-bold text-blue-900">Chats</h1>

          {/* Menú opciones (sólo en tab mensajes) */}
          {tabActiva === 'mensajes' && (
            <div className="relative">
              <button
                onClick={() => setMostrarOpciones(!mostrarOpciones)}
                className={`p-2 rounded-full transition-all ${mostrarOpciones ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {mostrarOpciones && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMostrarOpciones(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Marcar todos leídos
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Filtrar no leídos
                    </button>
                    <button
                      onClick={() => { setMostrarOpciones(false); navigate('/chats-archivados'); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                    >
                      Ver chats archivados
                      <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">1</span>
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                      Eliminar chats
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Barra de búsqueda (solo en tab mensajes) */}
        {tabActiva === 'mensajes' && (
          <div className="relative mb-3">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setTabActiva('mensajes')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tabActiva === 'mensajes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensajes
          </button>
          <button
            onClick={() => setTabActiva('guardados')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              tabActiva === 'guardados' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Guardados
          </button>
        </div>
      </div>

      {/* ── TAB: MENSAJES ──────────────────────────────────────────────────── */}
      {tabActiva === 'mensajes' && (
        <div className="p-2 mt-2 space-y-1">
          {cargandoChats ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-800 font-bold text-lg">Cargando chats...</p>
            </div>
          ) : errorChats ? (
            <div className="text-center py-16 px-6">
              <span className="text-4xl block mb-3">📡</span>
              <p className="font-bold text-gray-700 text-sm">{errorChats}</p>
              <button
                onClick={() => { setErrorChats(''); setCargandoChats(true); }}
                className="mt-4 text-xs font-bold text-blue-600 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : chatsFiltrados.length > 0 ? (
            chatsFiltrados.map((chat) => {
              const chatId = chat.id_chat || chat._id || chat.id;
              return (
                <div
                  key={chatId}
                  onClick={() => navigate(`/chat/${chatId}`)}
                  className="flex items-center p-3 hover:bg-white rounded-3xl transition-all cursor-pointer group"
                >
                  <div className="relative flex-shrink-0">
                    {chat.foto ? (
                      <img
                        src={chat.foto}
                        alt={chat.nombre}
                        className="w-14 h-14 rounded-[1.25rem] object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-blue-200 rounded-[1.25rem] flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm border border-gray-100 select-none">
                        {chat.nombre?.split(' ').map((x) => x[0]).join('').slice(0, 2)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 border-b border-gray-100 pb-4 pt-1 group-last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{chat.nombre}</h3>
                      <span className="text-[10px] whitespace-nowrap text-gray-400">
                        {chat.ultimoMensaje?.hora || ''}
                      </span>
                    </div>
                    <p className="text-xs truncate text-gray-500">
                      {chat.ultimoMensaje?.texto
                        ? chat.ultimoMensaje.texto
                        : typeof chat.ultimoMensaje === 'string'
                          ? chat.ultimoMensaje
                          : 'No hay mensajes aún'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 px-6">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-gray-500 text-sm font-bold">
                {busqueda ? `Sin resultados para "${busqueda}"` : 'No tienes conversaciones aún'}
              </p>
              {!busqueda && (
                <p className="text-gray-400 text-xs mt-1">Conecta con un estudiante desde la pantalla de Inicio</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: GUARDADOS ────────────────────────────────────────────────── */}
      {tabActiva === 'guardados' && (
        <div className="p-4 mt-2 space-y-3">

          {cargandoFavs && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-bold">Cargando viviendas guardadas...</p>
            </div>
          )}

          {errorFavs && !cargandoFavs && (
            <div className="text-center py-10 px-6">
              <span className="text-3xl block mb-2">📡</span>
              <p className="font-bold text-gray-700 text-sm">{errorFavs}</p>
              <button
                onClick={recargarFavoritos}
                className="mt-3 text-xs font-bold text-blue-600 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!cargandoFavs && !errorFavs && favoritos.length === 0 && (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <span className="text-4xl block mb-3">🏠</span>
              <p className="font-bold text-gray-700 text-sm">No tienes viviendas guardadas</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto">
                Guarda viviendas que te interesen desde la vista de detalle
              </p>
              <button
                onClick={() => navigate('/explorar')}
                className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Explorar viviendas
              </button>
            </div>
          )}

          {!cargandoFavs && !errorFavs && favoritos.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-medium px-1 pb-1">
                {favoritos.length} {favoritos.length === 1 ? 'vivienda guardada' : 'viviendas guardadas'}
              </p>
              {favoritos.map((vivienda) => {
                const vid = vivienda._id || vivienda.id;
                const isQuitando = quitandoId === vid;

                return (
                  <div
                    key={vid}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex gap-3 p-4">
                      {/* Miniatura o placeholder */}
                      <div
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/detalle-vivienda/${vid}`)}
                      >
                        {vivienda.imagenUrl || (vivienda.imagenes && vivienda.imagenes[0]) ? (
                          <img
                            src={vivienda.imagenUrl || vivienda.imagenes[0]}
                            alt={vivienda.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/detalle-vivienda/${vid}`)}
                      >
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {vivienda.titulo || 'Sin título'}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          📍 {vivienda.sector || vivienda.comuna || 'Ubicación no especificada'}
                        </p>
                        {vivienda.precio && (
                          <p className="text-green-600 font-extrabold text-sm mt-1">
                            ${vivienda.precio.toLocaleString('es-CL')}
                            <span className="text-gray-400 font-normal text-[10px]">/mes</span>
                          </p>
                        )}
                        {vivienda.descripcion && (
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{vivienda.descripcion}</p>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex border-t border-gray-100">
                      <button
                        onClick={() => handleContactarAnunciante(vivienda)}
                        className="flex-1 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Iniciar Chat
                      </button>

                      <div className="w-px bg-gray-100" />

                      <button
                        onClick={() => handleQuitarFavorito(vid)}
                        disabled={isQuitando}
                        className="flex-1 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isQuitando ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-dashed rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        )}
                        {isQuitando ? 'Quitando...' : 'Quitar Favorito'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* MENÚ INFERIOR */}
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
