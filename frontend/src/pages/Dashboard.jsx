import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const API_BASE = 'http://localhost:3000';

const getImageUrl = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  return `${API_BASE}${ruta}`;
};

const getIniciales = (nombre) => {
  if (!nombre) return '?';
  return nombre.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

// ─── Tarjeta de estudiante ────────────────────────────────────────────────────
const EstudianteCard = ({ estudiante, navigate }) => {
  const fotoUrl = getImageUrl(estudiante.fotoPerfilUrl || estudiante.fotoPerfil);
  const viviendaId = estudiante.vivienda?.id || estudiante.vivienda?._id;
  const tieneVivienda = Boolean(estudiante.vivienda?.tiene);
  const userId = estudiante.id || estudiante._id;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

      {/* FOTO / AVATAR GRANDE */}
      <div className="relative w-full h-60 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={estudiante.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
              {getIniciales(estudiante.nombre)}
            </div>
          </div>
        )}

        {/* Badge de afinidad */}
        {(estudiante.afinidad !== undefined && estudiante.afinidad !== null) && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg border border-white/50">
            {estudiante.afinidad}% Match
          </div>
        )}

        {/* Badge / botón de hogar */}
        {tieneVivienda ? (
          <button
            onClick={() => viviendaId && navigate(`/detalle-vivienda/${viviendaId}`)}
            className={`absolute bottom-4 left-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-lg transition-all ${!viviendaId ? 'pointer-events-none opacity-70' : ''}`}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Tiene hogar · Ver
          </button>
        ) : (
          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-lg">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Busca hogar
          </div>
        )}
      </div>

      {/* INFORMACIÓN */}
      <div className="p-5 space-y-3">

        {/* Nombre y verificación */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/usuario/${userId}`}
                className="font-extrabold text-gray-900 text-xl hover:text-blue-600 transition-colors leading-tight"
              >
                {estudiante.nombre}
              </Link>
              {estudiante.verificado && (
                <div title="Perfil Verificado" className="text-white bg-blue-500 p-0.5 rounded-full shadow-sm flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {(estudiante.edad || estudiante.carrera) && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {estudiante.edad ? `${estudiante.edad} años` : ''}
                {estudiante.edad && estudiante.carrera ? ' · ' : ''}
                {estudiante.carrera || ''}
              </p>
            )}
            {estudiante.universidad && (
              <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{estudiante.universidad}</p>
            )}
          </div>
        </div>

        {/* Preferencias rápidas */}
        {estudiante.preferencias && (
          <div className="flex flex-wrap gap-1.5">
            {estudiante.preferencias.fuma !== undefined && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${estudiante.preferencias.fuma ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                {estudiante.preferencias.fuma ? '🚬 Fuma' : '🚭 No fuma'}
              </span>
            )}
            {estudiante.preferencias.mascotas !== undefined && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${estudiante.preferencias.mascotas ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                {estudiante.preferencias.mascotas ? '🐾 Mascotas' : '🚫 Sin mascotas'}
              </span>
            )}
            {estudiante.preferencias.horarioPreferido && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-100 text-gray-600">
                🌙 {estudiante.preferencias.horarioPreferido}
              </span>
            )}
            {estudiante.preferencias.orden !== undefined && estudiante.preferencias.orden !== null && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-100 text-gray-600">
                ✨ Orden {estudiante.preferencias.orden}/5
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {estudiante.bio && (
          <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">
            "{estudiante.bio}"
          </p>
        )}

        {/* Intereses */}
        {Array.isArray(estudiante.intereses) && estudiante.intereses.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {estudiante.intereses.slice(0, 3).map((interes, i) => (
              <span
                key={interes.nombre || i}
                className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold flex items-center gap-1"
              >
                {interes.icono && <span>{interes.icono}</span>}
                {interes.nombre || interes}
              </span>
            ))}
            {estudiante.intereses.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-bold">
                +{estudiante.intereses.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/chat/${userId}`}
          className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm text-sm active:scale-[0.98] mt-1"
        >
          Conectar
        </Link>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [estudiantesAfines, setEstudiantesAfines] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarInicial, setAvatarInicial] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const perfil = await apiClient.get('/usuarios/mi-perfil');
        if (perfil?.fotoPerfilUrl) {
          setAvatarUrl(getImageUrl(perfil.fotoPerfilUrl));
        } else {
          const nombre = perfil?.nombre || '';
          setAvatarInicial(nombre ? nombre[0].toUpperCase() : '?');
        }
      } catch {
        // avatar no crítico
      }
    };

    const fetchData = async () => {
      setCargando(true);
      try {
        const [matchRes, studentsRes] = await Promise.all([
          apiClient.get('/matches/dia'),
          apiClient.get('/usuarios/recomendados'),
        ]);

        const todos = [];

        const match = matchRes?.data ?? matchRes;
        if (match && typeof match === 'object' && !Array.isArray(match)) {
          todos.push({ ...match, esCandidatoDelDia: true });
        }

        const recomendados = studentsRes?.data ?? studentsRes ?? [];
        if (Array.isArray(recomendados)) todos.push(...recomendados);

        setEstudiantesAfines(todos);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          console.error(error);
        }
      } finally {
        setCargando(false);
      }
    };

    fetchPerfil();
    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative overflow-x-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 pt-8 pb-5 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight leading-tight">Roomeet</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Campus PUCV · Valparaíso</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/explorar')}
              className="bg-gray-100 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-2xl transition-all shadow-sm text-xs active:scale-[0.98]"
            >
              Buscador
            </button>

            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-inner border-2 border-gray-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                  {avatarInicial}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="p-6 space-y-5">

        {/* Encabezado sección */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Estudiantes más afines</h3>
            <p className="text-xs text-gray-400 mt-0.5">Basado en tu perfil y preferencias</p>
          </div>
          {!cargando && estudiantesAfines.length > 0 && (
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {estudiantesAfines.length} {estudiantesAfines.length === 1 ? 'coincidencia' : 'coincidencias'}
            </span>
          )}
        </div>

        {/* Estado cargando */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500 font-medium">Buscando estudiantes afines...</p>
          </div>
        ) : estudiantesAfines.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-sm border border-gray-100 gap-3">
            <span className="text-5xl">✨</span>
            <p className="font-bold text-gray-700">No hay coincidencias aún</p>
            <p className="text-sm text-gray-400 max-w-[220px]">Completa tu perfil para mejorar tus matches</p>
            <Link to="/editar-perfil" className="mt-2 text-blue-600 font-bold text-sm hover:underline">
              Completar perfil →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {estudiantesAfines.map((est, idx) => (
              <EstudianteCard
                key={est.id || est._id || idx}
                estudiante={est}
                navigate={navigate}
              />
            ))}
          </div>
        )}

      </div>

      {/* BARRA INFERIOR */}
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
