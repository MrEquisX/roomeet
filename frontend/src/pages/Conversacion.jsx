import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const Conversacion = () => {
  // El ID nos servirá después para saber qué chat buscar en MariaDB
  const { id } = useParams(); 
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  // Datos simulados del contacto
  const contacto = { nombre: "Sarah C.", match: "92%" };
  
  // Memoria temporal de los mensajes (simulando la base de datos)
  const [mensajes, setMensajes] = useState([
    { id: 1, texto: "¡Hola! Vi que también buscas pieza cerca de la U.", remitente: "Sarah", hora: "10:30" },
    { id: 2, texto: "¡Hola! Sí, estoy buscando algo tranquilo para este semestre.", remitente: "yo", hora: "10:32" },
    { id: 3, texto: "Genial. Mi depto es súper relajado y no hacemos ruido de noche. ¿Te tinca si hablamos los detalles?", remitente: "Sarah", hora: "10:35" }
  ]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return; // Evita enviar mensajes en blanco

    // Agregamos el nuevo mensaje a la lista
    setMensajes([...mensajes, {
      id: Date.now(),
      texto: nuevoMensaje,
      remitente: "yo",
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setNuevoMensaje(''); // Limpiamos el input
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* Header del Chat (Fijo arriba) */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 z-10 sticky top-0">
        <Link to="/chats" className="text-gray-500 hover:text-blue-600 p-2 -ml-2 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 relative">
          {/* Puntito verde de "En línea" */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">{contacto.nombre}</h2>
          <p className="text-xs text-green-600 font-semibold">Match {contacto.match}</p>
        </div>
      </div>

      {/* Área de Mensajes (Deslizable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {mensajes.map((msg) => (
          <div key={msg.id} className={`flex ${msg.remitente === 'yo' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
              msg.remitente === 'yo' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.texto}</p>
              <p className={`text-[10px] text-right mt-1 ${msg.remitente === 'yo' ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.hora}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra para escribir (Fija abajo) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-6">
        <form onSubmit={enviarMensaje} className="flex gap-2">
          <input 
            type="text" 
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 text-sm px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white w-11 h-11 rounded-full hover:bg-blue-700 shadow-md flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
};

export default Conversacion;