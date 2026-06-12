import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { apiClient } from '../services/apiClient';
import { API_BASE, SOCKET_URL } from '../config/env.js';

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

const calcularEdad = (fecha) => {
  if (!fecha) {
    return null;
  }
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad = edad - 1;
  }
  return edad;
};

const Conversacion = () => {
  const { id } = useParams();

  const fileInputRef = useRef(null);
  const mensajesEndRef = useRef(null);
  const socketRef = useRef(null);

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [cargandoChat, setCargandoChat] = useState(true);
  const [errorChat, setErrorChat] = useState('');

  const [contacto, setContacto] = useState({
    id: null,
    nombre: 'Cargando...',
    iniciales: '?',
    fotoUrl: null,
    edad: null,
  });

  useEffect(() => {
    const cargarChat = async () => {
      if (!id) {
        return;
      }
      setCargandoChat(true);
      setErrorChat('');
      try {
        const dataChat = await apiClient.get(`/chats/${id}`);
        const persona = dataChat?.contacto || dataChat?.data?.contacto;
        if (persona) {
          const nombrePersona = persona.nombre_completo || persona.nombre || 'Estudiante';
          setContacto({
            id: persona._id || persona.id,
            nombre: nombrePersona,
            iniciales: getIniciales(nombrePersona),
            fotoUrl: getImageUrl(persona.foto_perfil || persona.fotoPerfilUrl),
            edad: calcularEdad(persona.fecha_nacimiento),
          });
        }
      } catch {
        setErrorChat('No se pudo cargar la conversación.');
      } finally {
        setCargandoChat(false);
      }
    };

    const cargarMensajes = async () => {
      if (!id) {
        return;
      }
      try {
        const data = await apiClient.get(`/chats/${id}/mensajes`);
        let lista = [];
        if (Array.isArray(data)) {
          lista = data;
        } else if (Array.isArray(data?.data)) {
          lista = data.data;
        }
        setMensajes(lista);
      } catch {
        setMensajes([]);
      }
    };

    cargarChat();
    cargarMensajes();
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      withCredentials: true,
    });
    socketRef.current.emit('joinChat', id);

    socketRef.current.on('nuevoMensaje', (mensajeRecibido) => {
      setMensajes((prev) => {
        const yaExiste = prev.some((m) => {
          return String(m.id) === String(mensajeRecibido.id);
        });
        if (yaExiste) {
          return prev;
        }
        return [...prev, mensajeRecibido];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('nuevoMensaje');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) {
      return;
    }

    setErrorEnvio('');
    try {
      const nuevo = await apiClient.post(`/chats/${id}/mensajes`, {
        texto: nuevoMensaje,
      });

      if (nuevo) {
        setMensajes((msgs) => {
          return [...msgs, nuevo];
        });
        setNuevoMensaje('');
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('enviarMensaje', { chatId: id, mensaje: nuevo });
        }
      }
    } catch {
      setErrorEnvio('No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setMensajes((prev) => {
      return [
        ...prev,
        {
          id: Date.now(),
          tipo: 'imagen',
          url: imageUrl,
          remitente: 'yo',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  };

  let subtituloContacto = 'Conversación activa';
  if (contacto.edad) {
    subtituloContacto = `${contacto.edad} años`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans relative">

      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 z-10 sticky top-0 border-b border-gray-100">
        <Link to="/chats" className="text-gray-400 hover:text-blue-600 p-2 -ml-2 transition-colors rounded-full hover:bg-gray-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <Link to={`/usuario/${contacto.id}`} className="flex items-center gap-3 flex-1 group">
          <div className="relative shrink-0">
            {contacto.fotoUrl ? (
              <img
                src={contacto.fotoUrl}
                alt={contacto.nombre}
                className="w-10 h-10 rounded-2xl object-cover border border-gray-100 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                {contacto.iniciales}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {contacto.nombre}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
              {cargandoChat ? 'Cargando...' : subtituloContacto}
            </p>
          </div>
        </Link>
      </div>

      {errorChat && (
        <div className="mx-4 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs font-bold text-red-600">{errorChat}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        <div className="flex justify-center mb-6">
          <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-4 py-2 rounded-xl text-center shadow-sm max-w-[85%] border border-yellow-200">
            🔒 Nunca compartas contraseñas ni realices pagos por adelantado sin visitar la vivienda previamente.
          </span>
        </div>

        {mensajes.map((msg) => {
          const esMio = msg.remitente === 'yo';
          const tipoMensaje = msg.tipo || 'texto';

          return (
            <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
                  esMio
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                }`}
              >
                {tipoMensaje === 'texto' && (
                  <p className="text-[13px] leading-relaxed font-medium">{msg.texto}</p>
                )}

                {tipoMensaje === 'imagen' && (
                  <div className="relative mt-1">
                    <img src={msg.url} alt="Archivo adjunto" className="rounded-lg max-h-48 object-cover mb-1" />
                  </div>
                )}

                {tipoMensaje === 'audio' && (
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <button type="button" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-white rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold">{msg.duracion}</span>
                  </div>
                )}

                <p className={`text-[9px] font-bold text-right mt-1.5 ${esMio ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.hora}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={mensajesEndRef} />
      </div>

      <input type="file" accept="image/*, .pdf, .doc" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe z-20 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        {errorEnvio && (
          <div className="mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-red-600">{errorEnvio}</p>
            <button
              type="button"
              onClick={() => {
                setErrorEnvio('');
              }}
              className="text-red-400 hover:text-red-600 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={enviarMensaje} className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors shrink-0 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => {
              setNuevoMensaje(e.target.value);
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-50 border border-gray-200 text-sm font-medium px-5 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
          />

          <button
            type="submit"
            disabled={!nuevoMensaje.trim()}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversacion;
