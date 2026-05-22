import { useParams, Link, useNavigate } from 'react-router-dom';

const PerfilPublico = () => {
  const { id } = useParams(); // Así capturamos el ID del usuario de la URL
  const navigate = useNavigate();

  // Simulamos los datos del usuario que estamos visitando
  const usuarioVisitado = {
    id: id,
    nombre: "Felipe",
    apellido: "González",
    carrera: "Ing. Comercial",
    universidad: "PUCV",
    bio: "Soy ordenado, me gusta cocinar los fines de semana y busco un depto cerca del plan de Viña.",
    tieneDepto: true,
    datosDepto: {
      sector: "Viña del Mar - Plan",
      precio: "$ 250.000 + GGCC",
      banos: "Privado"
    },
    preferencias: { fuma: false, mascotas: false, orden: 5, ruido: 1 },
    intereses: ["Cocina", "Trekking", "Series"]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">
      
      {/* Botón Flotante para Volver */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Header / Portada */}
      <div className="bg-gray-800 h-32 rounded-b-[3rem] w-full relative">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            <div className="w-full h-full bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold">
              {usuarioVisitado.nombre[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Info Básica */}
      <div className="mt-16 text-center px-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900">{usuarioVisitado.nombre} {usuarioVisitado.apellido}</h1>
          <span className={`mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${usuarioVisitado.tieneDepto ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
            {usuarioVisitado.tieneDepto ? 'Tiene vivienda' : 'Buscando alojamiento'}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-2">{usuarioVisitado.carrera}</p>
        <p className="text-blue-600 font-semibold text-xs">{usuarioVisitado.universidad}</p>
        
        {/* BOTÓN DE CONTACTO (Ruta dinámica al chat con este ID) */}
        <div className="mt-6">
          <Link 
            to={`/chat/${usuarioVisitado.id}`} 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all text-sm w-full max-w-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Enviar Mensaje
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* SECCIÓN SITUACIÓN HABITACIONAL (Vista de espectador) */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <h3 className="font-bold text-gray-800">Su Espacio</h3>
          </div>
          
          {!usuarioVisitado.tieneDepto ? (
            <div className="text-center py-2 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-500 py-3">Actualmente buscando un lugar donde vivir o alguien para arrendar juntos.</p>
            </div>
          ) : (
            <div className="space-y-2">
               <div className="flex justify-between items-center bg-purple-50 p-3 rounded-2xl border border-purple-100">
                  <span className="text-xs text-purple-600 font-medium">Sector</span>
                  <span className="text-xs font-bold text-purple-900">{usuarioVisitado.datosDepto.sector}</span>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="bg-gray-50 p-3 rounded-2xl flex flex-col justify-center items-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Precio Aprox</span>
                    <span className="text-xs font-bold text-gray-800 mt-1">{usuarioVisitado.datosDepto.precio}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-2xl flex flex-col justify-center items-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Baño</span>
                    <span className="text-xs font-bold text-gray-800 mt-1">{usuarioVisitado.datosDepto.banos}</span>
                 </div>
               </div>
            </div>
          )}
        </section>

        {/* Biografía */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Sobre {usuarioVisitado.nombre}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{usuarioVisitado.bio}</p>
        </section>

        {/* Convivencia */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Estilo de Vida</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className={`flex items-center gap-2 p-3 rounded-2xl border ${usuarioVisitado.preferencias.fuma ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
              <span className="text-xs">{usuarioVisitado.preferencias.fuma ? '🚬 Fumador' : '🚭 No fumador'}</span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-2xl border ${usuarioVisitado.preferencias.mascotas ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <span className="text-xs">{usuarioVisitado.preferencias.mascotas ? '🐶 Pet friendly' : '🚫 Sin mascotas'}</span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Nivel de Orden</span>
                <span className="font-bold text-blue-600">{usuarioVisitado.preferencias.orden}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(usuarioVisitado.preferencias.orden/5)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Tolerancia al Ruido</span>
                <span className="font-bold text-blue-600">{usuarioVisitado.preferencias.ruido}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(usuarioVisitado.preferencias.ruido/5)*100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Intereses */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-2 text-sm">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {usuarioVisitado.intereses.map((interes, index) => (
              <span key={index} className="bg-white px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-100 shadow-sm">
                {interes}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PerfilPublico;