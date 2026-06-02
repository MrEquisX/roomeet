import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

const getToken = () => {
  try { return localStorage.getItem('token'); } catch { return null; }
};

// ─── Explorar ─────────────────────────────────────────────────────────────────
const Explorar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Resultados separados por tipo
  const [resultadosEstudiantes, setResultadosEstudiantes] = useState([]);
  const [resultadosViviendas, setResultadosViviendas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Toggles de modo (independientes) ──────────────────────────────────────
  const [usarFiltrosPersona, setUsarFiltrosPersona] = useState(true);
  const [usarFiltrosVivienda, setUsarFiltrosVivienda] = useState(false);

  // ── Filtros por persona ────────────────────────────────────────────────────
  const [soloMismaUniversidad, setSoloMismaUniversidad] = useState(false);
  const [soloMismaCarrera, setSoloMismaCarrera] = useState(false);
  const [generoPreferido, setGeneroPreferido] = useState('Indiferente');
  const [edadMax, setEdadMax] = useState(30);
  const [fuma, setFuma] = useState(false);
  const [bebeAlcohol, setBebeAlcohol] = useState('Indiferente');
  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);

  // ── Filtros por vivienda ───────────────────────────────────────────────────
  const [comuna, setComuna] = useState('Todas');
  const [precioMax, setPrecioMax] = useState(250000);
  const [distanciaMaxSede, setDistanciaMaxSede] = useState(5);

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
    { id: 10, nombre: 'Juegos de Mesa', icono: '🎲' },
  ];

  const toggleInteres = (nombre) =>
    setInteresesSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );

  const limpiarFiltros = () => {
    setSoloMismaUniversidad(false);
    setSoloMismaCarrera(false);
    setGeneroPreferido('Indiferente');
    setEdadMax(30);
    setFuma(false);
    setBebeAlcohol('Indiferente');
    setInteresesSeleccionados([]);
    setComuna('Todas');
    setPrecioMax(250000);
    setDistanciaMaxSede(5);
  };

  // Contador para forzar re-fetch manual (botón "Aplicar Filtros")
  const [triggerBusqueda, setTriggerBusqueda] = useState(0);

  useEffect(() => {
    // Si ningún modo está activo, no hay nada que buscar
    if (!usarFiltrosPersona && !usarFiltrosVivienda) return;

    let cancelado = false;

    async function doFetch() {
      const token = getToken();

      if (!token) {
        if (!cancelado) setError('No se encontró el token de autenticación');
        return;
      }

      if (!cancelado) {
        setIsLoading(true);
        setError(null);
      }

      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      try {
        const [ests, vivs] = await Promise.all([
          usarFiltrosPersona
            ? fetch(`${API_BASE}/api/usuarios`, { headers })
                .then((r) => { if (!r.ok) throw new Error('Error cargando estudiantes'); return r.json(); })
                .then((d) => (Array.isArray(d) ? d : []))
            : Promise.resolve([]),
          usarFiltrosVivienda
            ? fetch(`${API_BASE}/api/alojamientos`, { headers })
                .then((r) => { if (!r.ok) throw new Error('Error cargando viviendas'); return r.json(); })
                .then((d) => (Array.isArray(d) ? d : []))
            : Promise.resolve([]),
        ]);
        if (!cancelado) {
          setResultadosEstudiantes(ests);
          setResultadosViviendas(vivs);
        }
      } catch (err) {
        if (!cancelado) setError(err.message || 'Error desconocido');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    doFetch();
    return () => { cancelado = true; };
  }, [usarFiltrosPersona, usarFiltrosVivienda, triggerBusqueda]);

  const handleAplicarFiltros = () => {
    setIsFilterOpen(false);
    setTriggerBusqueda((t) => t + 1);
  };

  // ── Filtrado local por searchTerm ──────────────────────────────────────────
  const estudiantesFiltrados = resultadosEstudiantes.filter((u) =>
    searchTerm.trim() === '' ||
    (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.universidad && u.universidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.carrera && u.carrera.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const viviendasFiltradas = resultadosViviendas.filter((a) =>
    searchTerm.trim() === '' ||
    (a.titulo && a.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.comuna && a.comuna.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.direccion && a.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const hayFiltrosActivos =
    interesesSeleccionados.length > 0 ||
    generoPreferido !== 'Indiferente' ||
    soloMismaUniversidad ||
    soloMismaCarrera ||
    precioMax !== 250000 ||
    distanciaMaxSede !== 5 ||
    fuma ||
    bebeAlcohol !== 'Indiferente';

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* HEADER Y BUSCADOR */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Explorar</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            Volver
          </button>
        </div>

        {/* Barra de búsqueda + filtros */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                usarFiltrosVivienda && !usarFiltrosPersona
                  ? 'Buscar por título, dirección o comuna...'
                  : 'Buscar por nombre, universidad o carrera...'
              }
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
            {hayFiltrosActivos && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* ── TOGGLES DE MODO (visibles en la página principal) ── */}
        <div className="flex gap-2">
          <button
            onClick={() => setUsarFiltrosPersona((prev) => !prev)}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${
              usarFiltrosPersona
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            🎒 Estudiantes
          </button>
          <button
            onClick={() => setUsarFiltrosVivienda((prev) => !prev)}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${
              usarFiltrosVivienda
                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            🏠 Viviendas
          </button>
        </div>
      </div>

      {/* ── DRAWER DE FILTROS ───────────────────────────────────────────────── */}
      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[85vw] max-w-md bg-white z-50 shadow-2xl overflow-y-auto pb-28">

            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Filtros Avanzados</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Indicadores del modo activo dentro del drawer */}
              <div className="flex gap-2 text-xs font-bold">
                <span className={`px-3 py-1.5 rounded-xl border ${usarFiltrosPersona ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  🎒 Estudiantes {usarFiltrosPersona ? 'ON' : 'OFF'}
                </span>
                <span className={`px-3 py-1.5 rounded-xl border ${usarFiltrosVivienda ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  🏠 Viviendas {usarFiltrosVivienda ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* FILTROS POR PERSONA */}
              {usarFiltrosPersona && (
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎒</span>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Filtros por Persona</h3>
                  </div>

                  {/* Exclusividad académica */}
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

                  {/* Género */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Preferencia de Género</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['Indiferente', 'Solo Mujeres', 'Solo Hombres', 'Mixto'].map((g) => (
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

                  {/* Edad máxima */}
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

                  {/* Hábitos */}
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
                        <option>Indiferente</option>
                        <option>Nunca</option>
                        <option>Socialmente</option>
                        <option>Frecuente</option>
                      </select>
                    </div>
                  </div>

                  {/* Intereses */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Intereses compartidos</span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {catalogoIntereses.map((interes) => {
                        const active = interesesSeleccionados.includes(interes.nombre);
                        return (
                          <button
                            key={interes.id}
                            onClick={() => toggleInteres(interes.nombre)}
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
              )}

              {/* FILTROS POR VIVIENDA */}
              {usarFiltrosVivienda && (
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🏠</span>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Filtros por Vivienda</h3>
                  </div>

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

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-semibold text-gray-500">📍 Distancia a tu Sede</span>
                      <span className="text-sm font-extrabold text-blue-600">Menos de {distanciaMaxSede} KM</span>
                    </div>
                    <input
                      type="range" min="1" max="25" step="1" value={distanciaMaxSede}
                      onChange={(e) => setDistanciaMaxSede(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      Calculado entre la vivienda y la sede universitaria de tu perfil.
                    </p>
                  </div>
                </div>
              )}

              {/* Si ningún modo activo */}
              {!usarFiltrosPersona && !usarFiltrosVivienda && (
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                  <p className="text-sm font-bold text-gray-500">Activa al menos un modo de búsqueda</p>
                  <p className="text-xs text-gray-400 mt-1">Usa los toggles de la pantalla principal</p>
                </div>
              )}
            </div>

            {/* Acciones del drawer */}
            <div className="fixed bottom-0 right-0 w-[85vw] max-w-md p-6 bg-white border-t border-gray-100 flex gap-3 z-20">
              <button
                onClick={limpiarFiltros}
                className="flex-1 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-100 transition-colors border border-gray-100"
              >
                Limpiar
              </button>
              <button
                onClick={handleAplicarFiltros}
                className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg text-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── RESULTADOS ─────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-8">

        {/* Sin modo activo */}
        {!usarFiltrosPersona && !usarFiltrosVivienda && !isLoading && (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <span className="text-3xl block mb-3">🔍</span>
            <p className="text-sm font-bold text-gray-700">Selecciona un modo de búsqueda</p>
            <p className="text-xs text-gray-400 mt-1">Activa "Estudiantes", "Viviendas" o ambos usando los botones de arriba.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm text-gray-600 font-bold">Buscando...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border border-red-200">
            <span className="text-2xl block mb-2">❌</span>
            <p className="text-sm font-bold text-red-700">Error al cargar resultados</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button
              onClick={() => setTriggerBusqueda((t) => t + 1)}
              className="mt-3 text-xs font-bold text-red-600 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* SECCIÓN ESTUDIANTES */}
            {usarFiltrosPersona && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Estudiantes</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {estudiantesFiltrados.length} {estudiantesFiltrados.length === 1 ? 'resultado' : 'resultados'}
                    </p>
                  </div>
                  {hayFiltrosActivos && (
                    <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      Filtros activos
                    </span>
                  )}
                </div>

                {estudiantesFiltrados.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                    <span className="text-2xl block mb-2">🎒</span>
                    <p className="text-sm font-bold text-gray-500">Sin estudiantes para mostrar</p>
                    <p className="text-xs text-gray-400 mt-1">Prueba cambiando los filtros</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                    {estudiantesFiltrados.map((u, idx) => (
                      <div
                        key={u.id || u._id || idx}
                        onClick={() => navigate(`/usuario/${u._id || u.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {/* Foto */}
                        <div className="w-full h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          {u.fotoPerfil || u.fotoPerfilUrl ? (
                            <img
                              src={u.fotoPerfil || u.fotoPerfilUrl}
                              alt={u.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                              {u.nombre ? u.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="font-bold text-sm text-gray-900 truncate">{u.nombre || 'Sin Nombre'}</h3>
                          <p className="text-[11px] text-blue-700 font-bold truncate mt-0.5">{u.universidad || '—'}</p>
                          <p className="text-[10px] text-gray-400 truncate">{u.carrera || '—'}</p>
                          {u.edad && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{u.edad} años</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SECCIÓN VIVIENDAS */}
            {usarFiltrosVivienda && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Viviendas</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {viviendasFiltradas.length} {viviendasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                    </p>
                  </div>
                </div>

                {viviendasFiltradas.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                    <span className="text-2xl block mb-2">🏠</span>
                    <p className="text-sm font-bold text-gray-500">Sin viviendas disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Prueba cambiando los filtros</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {viviendasFiltradas.map((a, idx) => (
                      <div
                        key={a.id || a._id || idx}
                        onClick={() => navigate(`/detalle-vivienda/${a._id || a.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {a.imagenUrl && (
                          <img
                            src={a.imagenUrl}
                            alt={a.titulo}
                            className="w-full h-36 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] bg-green-50 text-green-700 font-extrabold uppercase tracking-wider">
                              {a.comuna || 'Comuna desconocida'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 truncate">{a.titulo || 'Sin título'}</h3>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{a.direccion || 'Dirección no disponible'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-green-600 font-extrabold text-base">
                              ${a.precio?.toLocaleString('es-CL') || '—'}
                            </span>
                            {a.habitaciones && (
                              <span className="text-[10px] text-gray-400">{a.habitaciones} hab.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explorar;
