import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { normalizarInteresParaVista } from '../utils/perfilHelpers';
import { apiClient } from '../services/apiClient';
import { API_BASE, API_URL } from '../config/env.js';

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const etiquetaRol = (rol) => {
  if (rol === 'Anfitrion') {
    return '🏠 Tengo vivienda';
  }
  return '🔍 Busco habitación';
};

const PerfilPublico = (props) => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      setCargando(true);
      setError(null);

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
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const mensajeServidor = errorData.mensaje || errorData.message || 'Error desconocido';
          throw new Error(mensajeServidor);
        }

        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        setError(err.message || 'Error de red al cargar el perfil.');
      } finally {
        setCargando(false);
      }
    };

    fetchPerfil();
  }, [id]);

  const manejarClickOfreceVivienda = () => {
    if (!usuario) {
      return;
    }
    if (!usuario.vivienda) {
      return;
    }
    if (!usuario.vivienda._id) {
      return;
    }
    navigate('/detalle-vivienda/' + usuario.vivienda._id);
  };

  const manejarEnviarMensaje = async () => {
    if (!usuario) {
      return;
    }

    const otroUsuarioId = usuario._id;
    if (!otroUsuarioId) {
      return;
    }

    setEnviandoMensaje(true);
    setError(null);

    try {
      const respuesta = await apiClient.get('/chats/con-usuario/' + String(otroUsuarioId));

      let chatId = null;
      if (respuesta) {
        if (respuesta.id_chat) {
          chatId = respuesta.id_chat;
        }
      }

      if (!chatId) {
        setError('No se pudo abrir la conversación.');
        return;
      }

      navigate('/chat/' + String(chatId));
    } catch (err) {
      setError(err.message || 'No se pudo abrir la conversación.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
        <span className="text-blue-800 font-bold text-lg">Cargando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-500 px-6">
        <span className="text-red-600 font-bold text-center mb-4">{error}</span>
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
          onClick={() => {
            navigate(-1);
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-500">
        <span>Perfil no encontrado.</span>
      </div>
    );
  }

  const nombre = usuario.nombre || '';
  const apellido = usuario.apellido || '';
  const bio = usuario.bio || '';
  const carrera = usuario.carrera || '';
  const universidad = usuario.universidad || '';
  const sede = usuario.sede || '';
  const anioIngreso = usuario.anio_ingreso || null;
  const rol = usuario.rol || '';
  const intereses = usuario.intereses || [];
  const preferencias = usuario.preferencias || {};
  const filtros = usuario.filtros || {};
  const alojamiento = usuario.vivienda || null;

  let hayFiltros = false;
  if (filtros.soloMismaUniversidad) {
    hayFiltros = true;
  }
  if (filtros.soloMismaCarrera) {
    hayFiltros = true;
  }
  if (filtros.generoPreferido && filtros.generoPreferido !== 'Indiferente') {
    hayFiltros = true;
  }

  let bloqueOfreceVivienda = null;
  if (usuario.vivienda && usuario.vivienda._id) {
    bloqueOfreceVivienda = (
      <button
        type="button"
        onClick={manejarClickOfreceVivienda}
        className="mt-4 px-4 py-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border bg-purple-600 hover:bg-purple-700 text-white border-purple-500 cursor-pointer transition-colors mx-auto"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Ofrece Vivienda
      </button>
    );
  }

  let bloquePortadaAlojamiento = null;
  if (alojamiento) {
    if (alojamiento.imagenes && alojamiento.imagenes.length > 0) {
      bloquePortadaAlojamiento = (
        <img
          src={getImageUrl(alojamiento.imagenes[0])}
          alt="portada vivienda"
          className="w-full h-40 object-cover"
        />
      );
    } else {
      bloquePortadaAlojamiento = (
        <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      );
    }
  }

  let bloquePrecioAlojamiento = null;
  if (alojamiento && alojamiento.habitacionesOfrecidas && alojamiento.habitacionesOfrecidas.length > 0) {
    const precio = Number(alojamiento.habitacionesOfrecidas[0].precio || 0);
    bloquePrecioAlojamiento = (
      <p className="text-sm font-bold text-blue-700 mb-4">
        Desde ${precio.toLocaleString('es-CL')} / mes
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">

      <button
        type="button"
        onClick={() => {
          navigate(-1);
        }}
        className="absolute top-6 left-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="bg-blue-600 h-32 rounded-b-[3rem] w-full relative shadow-sm">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            {usuario.fotoPerfilUrl ? (
              <img
                src={getImageUrl(usuario.fotoPerfilUrl)}
                alt="foto de perfil"
                className="w-full h-full object-cover rounded-[1.25rem]"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold select-none uppercase">
                {nombre && nombre[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-bold text-blue-900">{nombre} {apellido}</h1>
        {carrera && (
          <p className="text-gray-500 text-sm mt-1">{carrera}</p>
        )}
        {rol && (
          <p className="text-gray-500 text-xs mt-1">{etiquetaRol(rol)}</p>
        )}
        {universidad && (
          <p className="text-blue-600 font-bold text-xs mt-0.5">
            {universidad}
            {sede ? ` - ${sede}` : ''}
          </p>
        )}

        {bloqueOfreceVivienda}

        <div className="mt-6">
          <button
            type="button"
            onClick={manejarEnviarMensaje}
            disabled={enviandoMensaje}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg transition-all text-sm w-full max-w-xs active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {enviandoMensaje ? 'Abriendo chat...' : 'Enviar Mensaje'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Sobre mí</h3>
          {bio ? (
            <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">Sin descripción aún.</p>
          )}
        </section>

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Vida Académica</h3>
          <div className="space-y-3">
            {universidad && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">🏫</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Universidad</p>
                  <p className="text-sm font-semibold text-gray-700">{universidad}</p>
                </div>
              </div>
            )}
            {carrera && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📚</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carrera</p>
                  <p className="text-sm font-semibold text-gray-700">{carrera}</p>
                </div>
              </div>
            )}
            {sede && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📍</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sede / Campus</p>
                  <p className="text-sm font-semibold text-gray-700">{sede}</p>
                </div>
              </div>
            )}
            {anioIngreso && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📅</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Año de Ingreso</p>
                  <p className="text-sm font-semibold text-gray-700">{anioIngreso}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {alojamiento && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {bloquePortadaAlojamiento}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-800 text-base leading-tight flex-1">
                  {alojamiento.titulo || 'Vivienda'}
                </h3>
                <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg whitespace-nowrap">
                  {alojamiento.tipoPropiedad || '—'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">
                📍 {alojamiento.sector || 'Ubicación no especificada'}
              </p>
              {alojamiento.comuna && (
                <p className="text-xs text-gray-400 mb-3">🏙 {alojamiento.comuna}</p>
              )}
              {bloquePrecioAlojamiento}
              <div className="flex gap-2">
                <Link
                  to={`/detalle-vivienda/${alojamiento._id}`}
                  className="flex-1 text-center py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all"
                >
                  Ver Publicación
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Estilo de Convivencia</h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🚬</span>
              <span className="text-[11px] font-bold">Fuma: {preferencias.fuma || 'No'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🍷</span>
              <span className="text-[11px] font-bold">Bebe: {preferencias.bebeAlcohol || 'No'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700 col-span-2">
              <span className="text-base">🐾</span>
              <span className="text-[11px] font-bold">Mascotas: {preferencias.mascotas || 'No'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Nivel de Orden</span>
                <span className="font-bold text-blue-600">{preferencias.orden ?? 0}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((preferencias.orden ?? 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Tolerancia al Ruido</span>
                <span className="font-bold text-blue-600">{preferencias.ruido ?? 0}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((preferencias.ruido ?? 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            {preferencias.horarioPreferido && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-500">
                  <span className="font-bold text-gray-700">Horario:</span> {preferencias.horarioPreferido}
                </p>
              </div>
            )}
          </div>
        </section>

        {hayFiltros && (
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Busca compañeros que…</h3>
            <div className="flex flex-wrap gap-2">
              {filtros.soloMismaUniversidad && (
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  🎓 Sean de mi U
                </span>
              )}
              {filtros.soloMismaCarrera && (
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  📚 Sean de mi carrera
                </span>
              )}
              {filtros.generoPreferido && filtros.generoPreferido !== 'Indiferente' && (
                <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  👤 {filtros.generoPreferido}
                </span>
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-2">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {intereses.length === 0 && (
              <span className="text-xs text-gray-400">Sin intereses registrados</span>
            )}
            {intereses.map((interes, index) => {
              const interesNormalizado = normalizarInteresParaVista(interes);
              const nombreInteres = interesNormalizado.nombre;
              const iconoInteres = interesNormalizado.icono;
              const claveInteres = nombreInteres + '-' + String(index);

              return (
                <span
                  key={claveInteres}
                  className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 shadow-sm"
                >
                  <span>{iconoInteres}</span>
                  {nombreInteres}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>
        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
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

export default PerfilPublico;
