import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3000';

// Construye la URL absoluta de una imagen almacenada en el backend
const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

// ─── PerfilPublico ────────────────────────────────────────────────────────────
// Consume GET /api/usuarios/:id → devuelve el mismo formato que obtenerMiPerfil:
//   { _id, nombre, apellido, bio, fotoPerfilUrl, rol, universidad, carrera, sede,
//     preferencias: { fuma, mascotas, orden, ruido, horarioPreferido, tipoDieta,
//                     visitasFrecuentes, aceptaParejasVisita },
//     intereses: [{ nombre, icono }] }
const PerfilPublico = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [usuarioVisitado, setUsuarioVisitado] = useState(null);
  const [cargando, setCargando]               = useState(true);
  const [error, setError]                     = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No autenticado. Por favor inicia sesión.');
        setCargando(false);
        return;
      }

      if (!id) {
        setError('No se proporcionó un ID de usuario.');
        setCargando(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/usuarios/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const mensajeServidor = errorData.mensaje || errorData.message || 'Error desconocido';
          throw new Error(mensajeServidor);
        }

        // El endpoint devuelve el perfil normalizado directamente (sin wrapper {exito, data})
        const data = await response.json();
        setUsuarioVisitado(data);

      } catch (err) {
        setError(err.message || 'Error de red al cargar el perfil.');
      } finally {
        setCargando(false);
      }
    };

    fetchPerfil();
  }, [id]);

  // ── Estado: cargando ────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        <span className="text-gray-500 text-sm font-medium">Cargando perfil...</span>
      </div>
    );
  }

  // ── Estado: error ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-6">
        <span className="text-5xl">😔</span>
        <p className="text-red-600 font-bold text-center">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 text-sm font-bold hover:underline"
        >
          ← Volver atrás
        </button>
      </div>
    );
  }

  // ── Estado: sin datos ───────────────────────────────────────────────────────
  if (!usuarioVisitado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-400 font-medium">Perfil no encontrado.</span>
      </div>
    );
  }

  // ── Variables derivadas — optional chaining en todas las lecturas ────────────
  const nombre         = usuarioVisitado.nombre   || '';
  const apellido       = usuarioVisitado.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim() || 'Sin nombre';
  const inicial        = nombreCompleto.charAt(0).toUpperCase();

  const fotoUrl    = getImageUrl(usuarioVisitado.fotoPerfilUrl);
  const userId     = usuarioVisitado._id;
  const esAnfitrion = usuarioVisitado.rol === 'Anfitrion';

  // Preferencias con fallback a objeto vacío para evitar errores de lectura
  const pref = usuarioVisitado.preferencias || {};

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">

      {/* Botón Flotante para Volver */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── 1. IDENTIDAD (Header / Portada) ── */}
      <div className="bg-gray-800 h-32 rounded-b-[3rem] w-full relative shadow-sm">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nombreCompleto}
                className="w-full h-full object-cover rounded-[1.25rem]"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold">
                {inicial}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 text-center px-6">

        <h1 className="text-2xl font-bold text-gray-900">{nombreCompleto}</h1>

        {usuarioVisitado.carrera && (
          <p className="text-sm text-gray-500 mt-1">{usuarioVisitado.carrera}</p>
        )}

        {usuarioVisitado.universidad && (
          <p className="text-blue-600 font-bold text-xs mt-0.5">
            {usuarioVisitado.universidad}
            {usuarioVisitado.sede ? ` · ${usuarioVisitado.sede}` : ''}
          </p>
        )}

        {/* Botón de contacto — usa _id del documento MongoDB */}
        <div className="mt-6">
          <Link
            to={`/chat/${userId}`}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all text-sm w-full max-w-xs active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Enviar Mensaje
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-5 mt-2">

        {/* ── 2. ESTADO HABITACIONAL — derivado de rol, no de campo obsoleto ── */}
        <div className="flex flex-col items-center justify-center mb-6">
          {esAnfitrion ? (
            <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border bg-purple-50 text-purple-700 border-purple-100">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ofrece Vivienda
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border bg-blue-50 text-blue-700 border-blue-100">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscando Alojamiento
            </span>
          )}
        </div>

        {/* ── 3. BIOGRAFÍA ── */}
        {usuarioVisitado.bio && (
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">
              Sobre {nombre}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">{usuarioVisitado.bio}</p>
          </section>
        )}

        {/* ── 4. MATRIZ DE CONVIVENCIA ── */}
        {usuarioVisitado.preferencias && (
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
              Estilo de Convivencia
            </h3>

            {/* Cuatro ítems rápidos */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className={`flex flex-col items-center p-2 rounded-xl border ${pref.fuma ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                <span className="text-lg">{pref.fuma ? '🚬' : '🚭'}</span>
                <span className="text-[8px] font-bold mt-1 uppercase text-center">
                  {pref.fuma ? 'Fuma' : 'No Fuma'}
                </span>
              </div>

              <div className={`flex flex-col items-center p-2 rounded-xl border ${pref.mascotas ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <span className="text-lg">{pref.mascotas ? '🐾' : '🚫'}</span>
                <span className="text-[8px] font-bold mt-1 uppercase text-center">
                  {pref.mascotas ? 'Mascotas' : 'Sin Pets'}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-xl border bg-gray-50 text-gray-700 border-gray-100">
                <span className="text-lg">☀️</span>
                <span className="text-[8px] font-bold mt-1 uppercase text-center">
                  {pref.horarioPreferido || 'N/D'}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-xl border bg-gray-50 text-gray-700 border-gray-100">
                <span className="text-lg">🥘</span>
                <span className="text-[8px] font-bold mt-1 uppercase text-center">
                  {pref.tipoDieta || 'N/D'}
                </span>
              </div>
            </div>

            {/* Visitas y pareja */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold text-gray-600">Visitas de amigos</span>
                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${pref.visitasFrecuentes ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {pref.visitasFrecuentes ? 'PERMITIDAS' : 'RESTRINGIDAS'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold text-gray-600">Pareja a dormir</span>
                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${pref.aceptaParejasVisita ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {pref.aceptaParejasVisita ? 'PERMITIDO' : 'RESTRINGIDO'}
                </span>
              </div>
            </div>

            {/* ── 5. BARRAS DE NIVEL (orden y ruido) ── */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-gray-400">
                  <span>Nivel de Orden</span>
                  <span className="text-blue-600">{pref.orden ?? 0}/5</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${((pref.orden ?? 0) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-gray-400">
                  <span>Tolerancia al Ruido</span>
                  <span className="text-blue-600">{pref.ruido ?? 0}/5</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${((pref.ruido ?? 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 6. INTERESES ── */}
        {Array.isArray(usuarioVisitado.intereses) && usuarioVisitado.intereses.length > 0 && (
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
              Intereses de {nombre}
            </h3>
            <div className="flex flex-wrap gap-2">
              {usuarioVisitado.intereses.map((item, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-100"
                >
                  <span>{item.icono}</span>
                  {item.nombre}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default PerfilPublico;
