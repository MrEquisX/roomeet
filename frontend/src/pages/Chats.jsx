import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { API_BASE } from '../config/env.js';

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const getIniciales = (nombre) => {
  if (!nombre) {
    return '?';
  }
  const partes = nombre.split(' ');
  const letras = partes.map((p) => {
    return p[0];
  });
  return letras.join('').toUpperCase().slice(0, 2);
};

const obtenerExtractoMensaje = (item) => {
  const ultimo = item.ultimoMensaje;
  if (!ultimo) {
    return 'No hay mensajes aún';
  }
  if (ultimo.texto) {
    return ultimo.texto;
  }
  if (typeof ultimo === 'string') {
    return ultimo;
  }
  return 'No hay mensajes aún';
};

const obtenerHoraMensaje = (item) => {
  const ultimo = item.ultimoMensaje;
  if (!ultimo) {
    return '';
  }
  if (ultimo.hora) {
    return ultimo.hora;
  }
  return '';
};

const ItemListaChat = (props) => {
  const item = props.item;
  const alSeleccionar = props.alSeleccionar;

  const chatId = item.id_chat || item._id;
  const nombre = item.nombre || 'Estudiante';
  const fotoUrl = getImageUrl(item.foto);
  const extracto = obtenerExtractoMensaje(item);
  const hora = obtenerHoraMensaje(item);

  return (
    <div
      onClick={() => {
        alSeleccionar(chatId);
      }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white rounded-2xl transition-all cursor-pointer group"
    >
      <div className="relative shrink-0">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={nombre}
            className="w-14 h-14 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-gray-200 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg border border-gray-100">
            {getIniciales(nombre)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 group-last:border-0">
        <div className="flex justify-between items-baseline gap-2 mb-0.5">
          <h3 className="font-bold text-gray-900 truncate text-[15px]">
            {nombre}
          </h3>
          {hora && (
            <span className="text-[11px] whitespace-nowrap text-gray-400 font-medium shrink-0">
              {hora}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate leading-snug">
          {extracto}
        </p>
      </div>
    </div>
  );
};

// ─── Chats ────────────────────────────────────────────────────────────────────
const Chats = () => {
  const [busqueda, setBusqueda] = useState('');
  const [listaChats, setListaChats] = useState([]);
  const [cargandoChats, setCargandoChats] = useState(true);
  const [errorChats, setErrorChats] = useState('');

  const navigate = useNavigate();

  const cargarConversaciones = async () => {
    setCargandoChats(true);
    setErrorChats('');
    try {
      const data = await apiClient.get('/chats');
      let lista = [];
      if (Array.isArray(data)) {
        lista = data;
      } else if (Array.isArray(data?.data)) {
        lista = data.data;
      }
      setListaChats(lista);
    } catch {
      setListaChats([]);
      setErrorChats('No se pudieron cargar tus conversaciones. Revisa tu conexión.');
    } finally {
      setCargandoChats(false);
    }
  };

  useEffect(() => {
    cargarConversaciones();
  }, []);

  const abrirChat = (chatId) => {
    if (!chatId) {
      return;
    }
    navigate(`/chat/${chatId}`);
  };

  const chatsFiltrados = listaChats.filter((item) => {
    if (!busqueda.trim()) {
      return true;
    }
    const nombre = item.nombre || '';
    return nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Mensajes</h1>
        </div>

        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
            }}
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
              }}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-2 mt-2">
        {cargandoChats && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4" />
            <p className="text-blue-800 font-bold text-lg">Cargando conversaciones...</p>
          </div>
        )}

        {!cargandoChats && errorChats && (
          <div className="text-center py-16 px-6">
            <span className="text-4xl block mb-3">📡</span>
            <p className="font-bold text-gray-700 text-sm">{errorChats}</p>
            <button
              type="button"
              onClick={cargarConversaciones}
              className="mt-4 text-xs font-bold text-blue-600 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {!cargandoChats && !errorChats && chatsFiltrados.length > 0 && (
          <div className="space-y-0.5">
            {chatsFiltrados.map((item) => {
              const chatId = item.id_chat || item._id;
              return (
                <ItemListaChat
                  key={chatId}
                  item={item}
                  alSeleccionar={abrirChat}
                />
              );
            })}
          </div>
        )}

        {!cargandoChats && !errorChats && chatsFiltrados.length === 0 && (
          <div className="text-center py-16 px-6 mx-3 mt-4 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="font-bold text-gray-700 text-base">
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No tienes conversaciones aún'}
            </p>
            {!busqueda && (
              <>
                <p className="text-gray-400 text-sm mt-2 max-w-[260px] mx-auto">
                  Cuando tengas un match mutuo, tus conversaciones aparecerán aquí
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/dashboard');
                  }}
                  className="mt-5 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                >
                  Ir al Dashboard
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>

        <Link to="/chats" className="flex flex-col items-center text-blue-600 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
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
