import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estado para alojamientos, carga y error
  const [alojamientos, setAlojamientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. ESTADOS MAESTROS DE ACTIVACIÓN (SWITCHES)
  const [usarFiltrosPersona, setUsarFiltrosPersona] = useState(true);
  const [usarFiltrosVivienda, setUsarFiltrosVivienda] = useState(false);

  // 2. ESTADOS: FILTROS POR PERSONA (Espejo de la tabla Preferencias_Convivencia e Intereses)
  const [soloMismaUniversidad, setSoloMismaUniversidad] = useState(false); // NUEVO
  const [soloMismaCarrera, setSoloMismaCarrera] = useState(false);         // NUEVO
  const [generoPreferido, setGeneroPreferido] = useState('Indiferente');
  const [edadMax, setEdadMax] = useState(30);
  const [fuma, setFuma] = useState(false);
  const [bebeAlcohol, setBebeAlcohol] = useState('Indiferente');
  const [dieta, setDieta] = useState('Indiferente');
  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);

  // 3. ESTADOS: FILTROS POR VIVIENDA (Espejo de la tabla Alojamientos + Cálculo GPS)
  const [comuna, setComuna] = useState('Todas');
  const [precioMax, setPrecioMax] = useState(250000);
  const [distanciaMaxSede, setDistanciaMaxSede] = useState(5);

  // Catálogo de intereses ampliado
  const catalogoIntereses = [
    { id: 1, nombre: 'Fútbol', icono: '⚽' },
    { id: 2, nombre: 'Calistenia / Gym', icono: '💪' },
    { id: 3, nombre: 'Hardware & Gaming', icono: '💻' },
    { id: 4, nombre: 'Básquetbol', icono: '🏀' },
    { id: 5, nombre: 'Música', icono: '🎸' },
    { id: 6, nombre: 'Cine y Series', icono: '🎬' },
    { id: 7, nombre: 'Programación', icono: '🚀' },
    { id: 8, nombre: 'Cocina', icono: '🍳' },
    { id: 9, nombre: 'Automovilismo & Tuning', icono: '🚗' },
    { id: 10, nombre: 'Juegos de Mesa', icono: '🎲' }
  ];

  const toggleInteres = (nombre) => {
    setInteresesSeleccionados(prev =>
      prev.includes(nombre)
        ? prev.filter(i => i !== nombre)
        : [...prev, nombre]
    );
  };

  const limpiarTodosLosFiltros = () => {
    setUsarFiltrosPersona(true);
    setUsarFiltrosVivienda(false);
    setSoloMismaUniversidad(false);
    setSoloMismaCarrera(false);
    setGeneroPreferido('Indiferente');
    setEdadMax(30);
    setFuma(false);
    setBebeAlcohol('Indiferente');
    setDieta('Indiferente');
    setInteresesSeleccionados([]);
    setComuna('Todas');
    setPrecioMax(250000);
    setDistanciaMaxSede(5);
  };

  // Fetch de los alojamientos al cargar el componente:
  useEffect(() => {
    const fetchAlojamientos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3000/api/alojamientos');
        if (!res.ok) {
          throw new Error('Error en la conexión al servidor');
        }
        const data = await res.json();
        setAlojamientos(data);
      } catch (err) {
        setError(err.message || 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlojamientos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER Y BUSCADOR */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Explorar</h1>
          <Link to="/dashboard" className="text-sm text-blue-600 font-bold hover:underline">Volver</Link>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por universidad, carrera o sede..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="relative p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {(interesesSeleccionados.length > 0 || usarFiltrosVivienda || generoPreferido !== 'Indiferente' || soloMismaUniversidad || soloMismaCarrera) && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* MENÚ LATERAL DE FILTROS DRAWER */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />
          
          <div className="fixed top-0 right-0 h-full w-[85vw] max-w-md bg-white z-50 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out pb-28">
            
            {/* Header del Drawer */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Filtros Avanzados</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* BLOCK 1: FILTROS POR PERSONA */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎒</span>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Filtros por Persona</h3>
                  </div>
                  
                  <div 
                    onClick={() => setUsarFiltrosPersona(!usarFiltrosPersona)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${usarFiltrosPersona ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${usarFiltrosPersona ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className={`space-y-5 transition-all duration-300 ${!usarFiltrosPersona ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                  
                  {/* NUEVO: Filtros Académicos */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Exclusividad Académica</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSoloMismaUniversidad(!soloMismaUniversidad)}
                        className={`py-2 px-1 border text-[11px] font-bold rounded-xl transition-all ${soloMismaUniversidad ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                      >
                        {soloMismaUniversidad ? '🎓 Solo mi Universidad' : '🎓 Cualquier U'}
                      </button>
                      <button 
                        onClick={() => setSoloMismaCarrera(!soloMismaCarrera)}
                        className={`py-2 px-1 border text-[11px] font-bold rounded-xl transition-all ${soloMismaCarrera ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                      >
                        {soloMismaCarrera ? '📚 Solo mi Carrera' : '📚 Cualquier Carrera'}
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Género Preferido */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Preferencia de Género</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['Indiferente', 'Solo Mujeres', 'Solo Hombres', 'Mixto'].map(g => (
                        <button
                          key={g}
                          onClick={() => setGeneroPreferido(g)}
                          className={`py-2 px-3 border text-[11px] font-bold rounded-xl transition-all ${generoPreferido === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edad Máxima */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>Edad Máxima</span>
                      <span className="text-blue-600 font-bold">{edadMax} años</span>
                    </div>
                    <input 
                      type="range" min="18" max="40" value={edadMax} 
                      onChange={(e) => setEdadMax(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Hábitos Rápidos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">¿Fumador?</span>
                      <button 
                        onClick={() => setFuma(!fuma)}
                        className={`w-full py-2 border text-[11px] font-bold rounded-xl transition-all ${fuma ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600'}`}
                      >
                        {fuma ? '🚬 Permite Humo' : '🚭 Libre de Humo'}
                      </button>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">Alcohol</span>
                      <select 
                        value={bebeAlcohol} onChange={(e) => setBebeAlcohol(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-700 font-bold focus:outline-none"
                      >
                        <option value="Indiferente">Indiferente</option>
                        <option value="Nunca">Nunca</option>
                        <option value="Socialmente">Socialmente</option>
                        <option value="Frecuente">Frecuente</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags de Intereses */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Intereses compartidos</span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {catalogoIntereses.map(interes => {
                        const active = interesesSeleccionados.includes(interes.nombre);
                        return (
                          <button
                            key={interes.id} onClick={() => toggleInteres(interes.nombre)}
                            className={`flex items-center gap-1 py-1.5 px-2.5 border rounded-xl text-[11px] font-bold transition-all ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'}`}
                          >
                            <span>{interes.icono}</span>
                            {interes.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* BLOCK 2: FILTROS POR VIVIENDA */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏠</span>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Filtros por Vivienda</h3>
                  </div>
                  
                  <div 
                    onClick={() => setUsarFiltrosVivienda(!usarFiltrosVivienda)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${usarFiltrosVivienda ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${usarFiltrosVivienda ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className={`space-y-4 transition-all duration-300 ${!usarFiltrosVivienda ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                  
                  {/* Comuna */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-1.5 block">Sector / Comuna</span>
                    <select
                      value={comuna} onChange={(e) => setComuna(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todas">Todas las comunas</option>
                      <option value="Valparaiso">Valparaíso</option>
                      <option value="Curauma">Curauma</option>
                      <option value="Vina">Viña del Mar</option>
                      <option value="Quilpue">Quilpué</option>
                    </select>
                  </div>

                  {/* Presupuesto */}
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-semibold text-gray-500">Presupuesto Máximo</span>
                      <span className="text-sm font-extrabold text-green-600">${precioMax.toLocaleString('es-CL')}</span>
                    </div>
                    <input 
                      type="range" min="100000" max="500000" step="10000" value={precioMax}
                      onChange={(e) => setPrecioMax(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>

                  {/* Distancia a la Sede */}
                  <div className="pt-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        📍 Distancia a tu Sede
                      </span>
                      <span className="text-sm font-extrabold text-blue-600">Menos de {distanciaMaxSede} KM</span>
                    </div>
                    <input 
                      type="range" min="1" max="25" step="1" value={distanciaMaxSede}
                      onChange={(e) => setDistanciaMaxSede(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      Calculado mediante geolocalización entre la vivienda y la sede universitaria ingresada en tu perfil.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* ACCIONES DEL DRAWER */}
            <div className="fixed bottom-0 right-0 w-[85vw] max-w-md p-6 bg-white border-t border-gray-100 flex gap-3 z-20">
              <button 
                onClick={limpiarTodosLosFiltros}
                className="flex-1 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-100 transition-colors border border-gray-100"
              >
                Limpiar
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg text-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                Aplicar Filtros
              </button>
            </div>

          </div>
        </>
      )}

      {/* RENDERIZADO DE RESULTADOS */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alojamientos Disponibles</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Resultados para: <span className="text-blue-600 font-bold">"{searchTerm || 'Todos los alojamientos'}"</span>
            </p>
          </div>
          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Modo Visual
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm text-gray-600 font-bold">Cargando alojamientos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border border-red-200 shadow">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-sm font-bold text-red-700">No se pudieron cargar los alojamientos</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        ) : alojamientos.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl text-gray-400">🤷</span>
            </div>
            <p className="text-sm font-bold text-gray-700">No hay alojamientos disponibles</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
              Prueba cambiando filtros o intenta más tarde.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {alojamientos
              .filter(a =>
                searchTerm.trim() === '' ||
                (a.titulo && a.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (a.comuna && a.comuna.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (a.direccion && a.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((a, idx) => (
                <div
                  key={a.id || idx}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow hover:shadow-md transition-all flex flex-col"
                >
                  {a.imagenUrl && (
                    <img
                      src={a.imagenUrl}
                      alt={a.titulo}
                      className="w-full h-36 object-cover rounded-xl mb-3"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-lg text-xs bg-blue-50 text-blue-700 font-bold uppercase tracking-widest">
                        {a.comuna || 'Comuna desconocida'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mb-1">
                      {a.titulo || 'Sin título'}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {a.direccion || 'Dirección no disponible'}
                    </p>
                    {a.descripcion && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{a.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-green-600 font-extrabold text-lg">
                      ${a.precio?.toLocaleString('es-CL') || '---'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {a.habitaciones
                        ? `${a.habitaciones} hab.` : ''}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Explorar;