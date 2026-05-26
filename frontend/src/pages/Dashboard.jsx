import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Datos simulados del Match Principal
  const matchDelDia = {
    id: 1,
    nombre: "Sarah Chen",
    carrera: "Arquitectura",
    universidad: "PUCV",
    sede: "Campus Curauma",
    edad: 21,
    afinidad: 92,
    verificado: true,
    bio: "Estudiante de 4to año buscando roomie tranquila y ordenada. Necesito silencio por las noches. Soy sociable pero respeto mucho el espacio personal.",
    preferencias: {
      fuma: false,
      mascotas: false,
      bebeAlcohol: "Socialmente",
      tipoDieta: "Vegetariana",
      visitasFrecuentes: false,
      aceptaParejasVisita: false,
      horarioPreferido: "Nocturno",
      orden: 5, 
      ruido: 1  
    },
    intereses: [
      { nombre: 'Lectura', icono: '📚' },
      { nombre: 'Arte y Diseño', icono: '🎨' },
      { nombre: 'Música', icono: '🎸' }
    ],
    // DATOS ACTUALIZADOS SEGÚN EL NUEVO ORDEN
    vivienda: { tiene: true, sector: "Valparaíso - Placeres", precioCompartido: "$ 230.000" },
    logistica: { tiempoEstimado: "25 min", distancia: "12 km" }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative overflow-x-hidden">
      
      {/* HEADER Y BUSCADOR UNIFICADO (Fijo arriba) */}
      <div className="bg-white px-6 pt-8 pb-5 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight leading-tight transition-all">Roomeet</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Campus PUCV • Valparaíso</p>
          </div>
  
          <Link to="/perfil" className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-inner flex-shrink-0">
             A
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* SECCIÓN ESTRELLA: INTERFAZ DE MATCH / SWIPE CARD */}
        <section className="relative">
          
          <button className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-400 hover:text-blue-600 p-2.5 rounded-full shadow-lg border border-gray-100 z-20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-400 hover:text-blue-600 p-2.5 rounded-full shadow-lg border border-gray-100 z-20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="flex justify-between items-center mb-4 relative z-10 px-1">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Candidata del Día</h3>
            <div className="flex items-center gap-2">
              <Link to="/explorar" className="text-center bg-gray-100 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-4 rounded-2xl transition-all shadow-sm text-xs active:scale-[0.98]">
                Buscador
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative">
             
             <div className="w-full h-80 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative flex items-center justify-center border-b border-gray-100">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white transform hover:scale-105 transition-transform flex-shrink-0">
                  SC
                </div>
                <div className="absolute top-6 right-6 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg border border-white">
                  {matchDelDia.afinidad}% Match
                </div>
             </div>

             <div className="p-7 space-y-6">
                
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Link to={`/usuario/${matchDelDia.id}`} className="font-bold text-gray-900 text-2xl hover:text-blue-600 transition-colors leading-tight">
                              {matchDelDia.nombre}
                            </Link>
                            {matchDelDia.verificado && (
                              <div title="Perfil Verificado" className="text-white bg-blue-500 p-0.5 rounded-full shadow-sm flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{matchDelDia.edad} años • {matchDelDia.universidad}</p>
                        <p className="text-sm text-gray-500">{matchDelDia.carrera}</p>
                    </div>
                    
                    {/* NUEVA AGRUPACIÓN DE VIVIENDA + LOGÍSTICA */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-1 text-right">
                        
                        {/* 1. BADGE: TIENE VIVIENDA */}
                        <div className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1 mb-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider">Tiene Vivienda</span>
                        </div>
                        
                        {/* 2. SECTOR EXACTO */}
                        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                          En {matchDelDia.vivienda.sector}
                        </p>
                        
                        {/* 3. DISTANCIA AL CAMPUS */}
                        <p className="text-[11px] font-extrabold text-blue-600">
                          📍 A {matchDelDia.logistica.distancia} de {matchDelDia.sede}
                        </p>
                        
                        {/* 4. TIEMPO ESTIMADO */}
                        <p className="text-[10px] font-medium text-gray-500">
                          🚌 A {matchDelDia.logistica.tiempoEstimado} aprox.
                        </p>

                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
                    <svg className="w-6 h-6 text-gray-200 absolute top-2 left-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    <p className="text-xs text-gray-600 leading-relaxed italic pl-6 pr-2">
                        {matchDelDia.bio}
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${matchDelDia.preferencias.fuma ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                    <span className="text-lg">{matchDelDia.preferencias.fuma ? '🚬' : '🚭'}</span>
                    <span className="text-[9px] font-bold mt-1 text-center">{matchDelDia.preferencias.fuma ? 'Fuma' : 'No Fuma'}</span>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${matchDelDia.preferencias.mascotas ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <span className="text-lg">{matchDelDia.preferencias.mascotas ? '🐾' : '🚫'}</span>
                    <span className="text-[9px] font-bold mt-1 text-center">{matchDelDia.preferencias.mascotas ? 'Mascotas' : 'Sin Mascotas'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
                    <span className="text-lg">🌙</span>
                    <span className="text-[9px] font-bold mt-1 text-center uppercase">{matchDelDia.preferencias.horarioPreferido}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
                    <span className="text-lg">✨</span>
                    <span className="text-[9px] font-bold mt-1 text-center uppercase">Orden {matchDelDia.preferencias.orden}/5</span>
                  </div>
                </div>

                <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                        {matchDelDia.intereses.map(interes => (
                          <span key={interes.nombre} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1">
                            <span>{interes.icono}</span> {interes.nombre}
                          </span>
                        ))}
                    </div>
                </div>

                <Link to={`/chat/${matchDelDia.id}`} className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-sm active:scale-[0.98] mt-4">
                  Enviar mensaje y Conectar
                </Link>
             </div>
          </div>
        </section>

        {/* SECCIÓN SECUNDARIA: MÁS ESTUDIANTES */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Más estudiantes</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Link to="/usuario/2" className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm">FG</div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white">87%</div>
                </Link>
                <div className="flex-1 ml-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <Link to="/usuario/2" className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors leading-tight">Felipe González</Link>
                    <div title="Busca vivienda" className="text-red-500 bg-red-50 p-2 rounded-xl border border-red-100 shadow-sm flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16"/></svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">22 años • PUCV • Ing. Comercial</p>
                  
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">🎮 Gaming</span>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Diurno</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* BARRA INFERIOR DE NAVEGACIÓN */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50 pb-safe">
        
        <Link to="/dashboard" className="flex flex-col items-center text-blue-600 w-16">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>

        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-medium">Chats</span>
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

export default Dashboard;