import { useParams, Link, useNavigate } from 'react-router-dom';

const PerfilPublico = () => {
  const { id } = useParams(); // Capturamos el ID de la URL
  const navigate = useNavigate();

  // Datos simulados (Espejo exacto de las nuevas tablas de MariaDB para el usuario visitado)
  const usuarioVisitado = {
    id: id,
    nombre: "Felipe",
    apellido: "González",
    carrera: "Ing. Comercial",
    universidad: "PUCV",
    sede: "Sede Recreo",
    bio: "Soy ordenado, me gusta cocinar los fines de semana y busco un depto cerca del plan de Viña.",
    filtros: {
      soloMismaUniversidad: false,
      soloMismaCarrera: false,
      generoPreferido: "Indiferente"
    },
    preferencias: {
      fuma: false,
      mascotas: false,
      bebeAlcohol: "Frecuente",
      tipoDieta: "Omnívoro",
      visitasFrecuentes: true,
      aceptaParejasVisita: true,
      horarioPreferido: "Diurno",
      orden: 5, 
      ruido: 1  
    },
    intereses: [
      { nombre: 'Cocina', icono: '🍳' },
      { nombre: 'Cine y Series', icono: '🎬' }
    ],
    // Situación Habitacional
    tieneDepto: false,
    datosDepto: null // Si tuviera, irían los datos aquí
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

      {/* 1. IDENTIDAD (Header / Portada) */}
      <div className="bg-gray-800 h-32 rounded-b-[3rem] w-full relative shadow-sm">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            <div className="w-full h-full bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold">
              {usuarioVisitado.nombre[0]}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-bold text-gray-900">{usuarioVisitado.nombre} {usuarioVisitado.apellido}</h1>
        <p className="text-sm text-gray-500 mt-1">{usuarioVisitado.carrera}</p>
        <p className="text-blue-600 font-bold text-xs mt-0.5">{usuarioVisitado.universidad} - {usuarioVisitado.sede}</p>
        
        {/* BOTÓN DE CONTACTO (Ruta dinámica al chat con este ID) */}
        <div className="mt-6">
          <Link 
            to={`/chat/${usuarioVisitado.id}`} 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all text-sm w-full max-w-xs active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Enviar Mensaje
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-5 mt-2">
        
        {/* 2. LOGÍSTICA / ESTADO HABITACIONAL */}
        <div className="flex flex-col items-center justify-center mb-6">
           <span className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${usuarioVisitado.tieneDepto ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
            {usuarioVisitado.tieneDepto ? (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> Tiene Vivienda</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Buscando Alojamiento</>
            )}
          </span>
          
          {usuarioVisitado.tieneDepto && usuarioVisitado.datosDepto && (
            <div className="mt-3 bg-white w-full p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sector</p>
                  <p className="text-sm font-bold text-gray-800">{usuarioVisitado.datosDepto.sector}</p>
               </div>
               <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Precio</p>
                  <p className="text-sm font-bold text-green-600">{usuarioVisitado.datosDepto.precio}</p>
               </div>
            </div>
          )}
        </div>

        {/* 3. BIOGRAFÍA */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Sobre {usuarioVisitado.nombre}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{usuarioVisitado.bio}</p>
        </section>

        {/* 4. MATRIZ DE CONVIVENCIA */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Estilo de Convivencia</h3>
          
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className={`flex flex-col items-center p-2 rounded-xl border ${usuarioVisitado.preferencias.fuma ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              <span className="text-lg">{usuarioVisitado.preferencias.fuma ? '🚬' : '🚭'}</span>
              <span className="text-[8px] font-bold mt-1 uppercase text-center">{usuarioVisitado.preferencias.fuma ? 'Fuma' : 'No Fuma'}</span>
            </div>
            <div className={`flex flex-col items-center p-2 rounded-xl border ${usuarioVisitado.preferencias.mascotas ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <span className="text-lg">{usuarioVisitado.preferencias.mascotas ? '🐾' : '🚫'}</span>
              <span className="text-[8px] font-bold mt-1 uppercase text-center">{usuarioVisitado.preferencias.mascotas ? 'Mascotas' : 'Sin Pets'}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl border bg-gray-50 text-gray-700 border-gray-100">
              <span className="text-lg">☀️</span>
              <span className="text-[8px] font-bold mt-1 uppercase text-center">{usuarioVisitado.preferencias.horarioPreferido}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl border bg-gray-50 text-gray-700 border-gray-100">
              <span className="text-lg">🥘</span>
              <span className="text-[8px] font-bold mt-1 uppercase text-center">{usuarioVisitado.preferencias.tipoDieta}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-600">Visitas de amigos</span>
              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${usuarioVisitado.preferencias.visitasFrecuentes ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {usuarioVisitado.preferencias.visitasFrecuentes ? 'PERMITIDAS' : 'RESTRINGIDAS'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-600">Pareja a dormir</span>
              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${usuarioVisitado.preferencias.aceptaParejasVisita ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {usuarioVisitado.preferencias.aceptaParejasVisita ? 'PERMITIDO' : 'RESTRINGIDO'}
              </span>
            </div>
          </div>

          {/* 5. NIVELES DETALLADOS */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-gray-400">
                <span>Nivel de Orden</span>
                <span className="text-blue-600">{usuarioVisitado.preferencias.orden}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(usuarioVisitado.preferencias.orden/5)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-gray-400">
                <span>Tolerancia al Ruido</span>
                <span className="text-blue-600">{usuarioVisitado.preferencias.ruido}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(usuarioVisitado.preferencias.ruido/5)*100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. INTERESES */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Intereses de {usuarioVisitado.nombre}</h3>
          <div className="flex flex-wrap gap-2">
            {usuarioVisitado.intereses.map((i, index) => (
              <span key={index} className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-100">
                <span>{i.icono}</span> {i.nombre}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PerfilPublico;