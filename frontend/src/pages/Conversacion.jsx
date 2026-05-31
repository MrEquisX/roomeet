import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket;

const Conversacion = () => {
  const { id } = useParams();

  // Referencias para inputs ocultos
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mensajesEndRef = useRef(null);

  // Estados
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [grabandoAudio, setGrabandoAudio] = useState(false);

  // Datos simulados del contacto (puedes reemplazar luego por info real si es necesario)
  const contacto = { 
    id: id || "1",
    nombre: "Sarah Chen", 
    iniciales: "SC",
    match: "92%",
    gradiente: "from-indigo-400 to-purple-600",
    enLinea: true
  };

  // Obtener mensajes de la conversación desde el backend al cargar
  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/chats/${id}/mensajes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('No se pudieron cargar los mensajes');
        const data = await res.json();
        setMensajes(data); // Asegúrate de que data sea un array de mensajes
      } catch (err) {
        setMensajes([]);
      }
    };
    if (id) fetchMensajes();
  }, [id]);

  // Integración Socket.IO
  useEffect(() => {
    if (!id) return;
    // 2) Crear la conexión
    socket = io(SOCKET_URL, {
      // Puedes agregar opciones si usas autenticación
    });

    // 3) Unirse al chat específico
    socket.emit('joinChat', id);

    // 4) Escuchar eventos de nuevos mensajes
    socket.on('nuevoMensaje', (mensajeRecibido) => {
      setMensajes(prev => [...prev, mensajeRecibido]);
    });

    return () => {
      // Limpia la conexión al desmontar
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  // 6. Scroll automático cuando llegan mensajes nuevos
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 5) Enviar mensaje de texto al backend + notificar vía socket
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/chats/${id}/mensajes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto: nuevoMensaje })
      });

      if (res.status === 201) {
        const nuevo = await res.json();

        setMensajes((msgs) => [...msgs, nuevo]);
        setNuevoMensaje('');

        // Emitir el mensaje por socket
        if (socket && socket.connected) {
          socket.emit('enviarMensaje', { chatId: id, mensaje: nuevo });
        }
      }
    } catch (err) {
      // Error al enviar, manejo opcional
    }
  };

  // ENVIAR ARCHIVO / FOTO (sigue local porque backend no está especificado)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setMensajes(prev => [...prev, {
      id: Date.now(),
      tipo: 'imagen',
      url: imageUrl,
      remitente: "yo",
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // SIMULAR AUDIO
  const handleAudioToggle = () => {
    if (grabandoAudio) {
      setMensajes(prev => [...prev, {
        id: Date.now(),
        tipo: 'audio',
        duracion: "0:04",
        remitente: "yo",
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setGrabandoAudio(!grabandoAudio);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans relative">

      {/* HEADER DEL CHAT */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 z-10 sticky top-0 border-b border-gray-100">
        <Link to="/chats" className="text-gray-400 hover:text-blue-600 p-2 -ml-2 transition-colors rounded-full hover:bg-gray-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        
        <Link to={`/usuario/${contacto.id}`} className="flex items-center gap-3 flex-1 group">
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 bg-gradient-to-br ${contacto.gradiente} rounded-[1rem] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform`}>
              {contacto.iniciales}
            </div>
            {contacto.enLinea && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{contacto.nombre}</h2>
            <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-wider mt-0.5">Match {contacto.match}</p>
          </div>
        </Link>

        <button className="text-gray-400 hover:text-gray-700 p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </button>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        <div className="flex justify-center mb-6">
          <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-4 py-2 rounded-xl text-center shadow-sm max-w-[85%] border border-yellow-200">
            🔒 Nunca compartas contraseñas ni realices pagos por adelantado sin visitar la vivienda previamente. Recuerda que no nos hacemos responsables, ya que no intervenimos en ningún método de transacción.
          </span>
        </div>

        {mensajes.map((msg) => (
          <div key={msg.id} className={`flex ${msg.remitente === 'yo' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
              msg.remitente === 'yo' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
            }`}>
              
              {/* Renderizado condicional según el tipo de mensaje */}
              {msg.tipo === 'texto' && (
                <p className="text-[13px] leading-relaxed font-medium">{msg.texto}</p>
              )}

              {msg.tipo === 'imagen' && (
                <div className="relative mt-1">
                  <img src={msg.url} alt="Archivo adjunto" className="rounded-lg max-h-48 object-cover mb-1" />
                </div>
              )}

              {msg.tipo === 'audio' && (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <button className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  </button>
                  <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-white rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-bold">{msg.duracion}</span>
                </div>
              )}

              <p className={`text-[9px] font-bold text-right mt-1.5 ${msg.remitente === 'yo' ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.hora}
              </p>
            </div>

          </div>
        ))}
        <div ref={mensajesEndRef} />
      </div>

      {/* INPUTS OCULTOS PARA ARCHIVOS Y CÁMARA */}
      <input type="file" accept="image/*, .pdf, .doc" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileSelect} className="hidden" />

      {/* BARRA PARA ESCRIBIR MULTIMEDIA */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe z-20 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        {grabandoAudio ? (
          <div className="flex items-center justify-between bg-red-50 text-red-600 px-5 py-3 rounded-full border border-red-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm font-bold tracking-widest">Grabando...</span>
            </div>
            <button onClick={handleAudioToggle} className="text-red-600 font-extrabold text-xs uppercase tracking-wider hover:text-red-800">
              Enviar 📤
            </button>
          </div>
        ) : (
          <form onSubmit={enviarMensaje} className="flex gap-2 items-center">
            {/* 1. Botón Adjuntar Galería/Documentos */}
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>

            {/* Contenedor del Texto + Cámara */}
            <div className="flex-1 relative flex items-center">
              <input 
                type="text" 
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full bg-gray-50 border border-gray-200 text-sm font-medium pl-5 pr-12 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
              />
              
              {/* 2. Botón Cámara */}
              <button type="button" onClick={() => cameraInputRef.current.click()} className="absolute right-3 text-gray-400 hover:text-blue-600 p-1 transition-colors active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            
            {/* 3. Botón Dinámico */}
            {nuevoMensaje.trim() ? (
              <button type="submit" className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all flex-shrink-0">
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            ) : (
              <button type="button" onClick={handleAudioToggle} className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-900 text-white shadow-md hover:bg-black active:scale-95 transition-all flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Conversacion;