import TinderCard from 'react-tinder-card';
import { useEffect, useState, createRef, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { calcularAfinidad, normalizarInteresParaVista } from '../utils/perfilHelpers';
import { API_BASE } from '../config/env.js';

// ─── Utilidades ───────────────────────────────────────────────────────────────

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const getIniciales = (nombre) => {
  if (!nombre) {
    return '?';
  }
  const partes    = nombre.split(' ');
  const iniciales = partes.map((n) => n[0]);
  return iniciales.join('').toUpperCase().slice(0, 2);
};

const calcularEdad = (fecha) => {
  if (!fecha) {
    return null;
  }
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad  = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad = edad - 1;
  }
  return edad;
};

/**
 * Fórmula Haversine — devuelve kilómetros entre dos puntos en grados decimales.
 */
const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
  const R     = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLon  = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Elimina del mazo los perfiles cuyo _id ya figura en swiped_users.
 * Solo deben montarse usuarios que aún no fueron deslizados.
 */
const filtrarMatchesSinSwipeados = (itemsMatches, idsSwipeados) => {
  const resultado = [];

  for (const item of itemsMatches) {
    const idUsuario = item.usuario?._id || item.usuario?.id;
    let yaDeslizado = false;

    if (idUsuario) {
      const idStr = String(idUsuario);
      if (idsSwipeados.includes(idStr)) {
        yaDeslizado = true;
      }
    }

    if (!yaDeslizado) {
      resultado.push(item);
    }
  }

  return resultado;
};

const filtrarMatchesSinUsuarioPropio = (itemsMatches, miId) => {
  return itemsMatches.filter((item) => {
    const usuario = item.usuario;
    const idUsuario = usuario?._id || usuario?.id;

    if (!miId) {
      return true;
    }

    if (!idUsuario) {
      return true;
    }

    const idStr = String(idUsuario);

    if (idStr === miId) {
      return false;
    }

    return true;
  });
};

const obtenerPuntuacionItemMatch = (item, perfilLogueado) => {
  if (!item) {
    return 0;
  }

  if (item.matchScore !== null && item.matchScore !== undefined) {
    return Number(item.matchScore);
  }

  if (item.porcentajeAfinidad !== null && item.porcentajeAfinidad !== undefined) {
    return Number(item.porcentajeAfinidad);
  }

  const usuarioItem = item.usuario;

  if (perfilLogueado && usuarioItem) {
    return calcularAfinidad(perfilLogueado, usuarioItem);
  }

  return 0;
};

const ordenarMatchesPorAfinidad = (itemsMatches, perfilLogueado) => {
  const copiaMatches = [...itemsMatches];

  copiaMatches.sort(function compararPorAfinidad(itemA, itemB) {
    const afinidadA = obtenerPuntuacionItemMatch(itemA, perfilLogueado);
    const afinidadB = obtenerPuntuacionItemMatch(itemB, perfilLogueado);

    if (afinidadA > afinidadB) {
      return 1;
    }

    if (afinidadA < afinidadB) {
      return -1;
    }

    return 0;
  });

  return copiaMatches;
};

const etiquetaFuma = (valor) => {
  if (valor === 'Sí' || valor === true) {
    return 'Fuma: Sí';
  }
  if (valor === 'Ocasionalmente' || valor === 'Ocasional') {
    return 'Fuma: Ocas.';
  }
  return 'Fuma: No';
};

const etiquetaBebe = (valor) => {
  if (valor === 'Sí') {
    return 'Bebe: Sí';
  }
  if (valor === 'Ocasionalmente' || valor === 'Socialmente' || valor === 'Frecuente') {
    return 'Bebe: Ocas.';
  }
  if (valor === false) {
    return 'Bebe: No';
  }
  return 'Bebe: No';
};

const etiquetaMascotas = (valor) => {
  if (valor === 'Sí' || valor === true) {
    return 'Mascotas: Sí';
  }
  return 'Mascotas: No';
};

const extraerInteresesTarjeta = (estudiante) => {
  const crudos = estudiante?.intereses || [];
  const items = [];

  for (const item of crudos) {
    const normalizado = normalizarInteresParaVista(item);

    if (normalizado.nombre) {
      items.push(normalizado);
    }

    if (items.length >= 5) {
      break;
    }
  }

  while (items.length < 5) {
    items.push(null);
  }

  return items.slice(0, 5);
};

const extraerNombresIntereses = (perfil) => {
  const resultado = [];
  const crudos = perfil?.intereses || [];

  for (const item of crudos) {
    let nombre = null;

    if (typeof item === 'string') {
      nombre = item;
    } else if (item && item.nombre) {
      nombre = item.nombre;
    }

    if (nombre) {
      resultado.push(nombre);
    }
  }

  return resultado;
};

const obtenerPreferenciasUsuario = (perfil) => {
  if (!perfil) {
    return {};
  }
  if (perfil.preferencias_convivencia) {
    return perfil.preferencias_convivencia;
  }
  if (perfil.preferencias) {
    return perfil.preferencias;
  }
  return {};
};

const obtenerCoordsVivienda = (estudiante) => {
  const vivienda = estudiante?.vivienda || null;
  if (!vivienda) {
    return { lat: null, lng: null, id: null, titulo: null };
  }

  const lat = vivienda.latitud ?? null;
  const lng = vivienda.longitud ?? null;
  const id  = vivienda._id || estudiante?.alojamientoId || null;
  const titulo = vivienda.titulo || vivienda.sector || 'Vivienda';

  return { lat, lng, id, titulo };
};

const formatearDistanciaKm = (distanciaKm) => {
  if (distanciaKm === null || distanciaKm === undefined) {
    return null;
  }
  if (distanciaKm < 1) {
    const metros = Math.round(distanciaKm * 1000);
    return `${metros} m de tu sede`;
  }
  return `${distanciaKm.toFixed(1)} km de tu sede`;
};

/**
 * Lee el array de IDs de usuarios ya deslizados desde localStorage.
 * Devuelve un array vacío si la clave no existe o si el JSON está corrupto.
 */
const leerSwipeados = () => {
  let resultado = [];
  try {
    const guardado = localStorage.getItem('swiped_users');
    if (!guardado) {
      return resultado;
    }
    const parseado = JSON.parse(guardado);
    if (!Array.isArray(parseado)) {
      return resultado;
    }
    resultado = parseado;
  } catch {
    resultado = [];
  }
  return resultado;
};

/**
 * Limpia el registro de perfiles ya deslizados en localStorage.
 */
const limpiarSwipeados = () => {
  try {
    localStorage.removeItem('swiped_users');
  } catch {
    // Si localStorage no está disponible, omitir silenciosamente
  }
};

/**
 * Procesa la respuesta de la API de matches y devuelve el arreglo ordenado listo para el mazo.
 */
const procesarRespuestaMatches = (respuesta, perfilLogueado, miIdLogueado) => {
  let itemsMatches = [];

  if (respuesta === null) {
    itemsMatches = [];
  } else if (Array.isArray(respuesta)) {
    itemsMatches = respuesta;
  } else if (respuesta && Array.isArray(respuesta.data)) {
    itemsMatches = respuesta.data;
  }

  const idsSwipeados = leerSwipeados();
  const matchesSinSwipeados = filtrarMatchesSinSwipeados(itemsMatches, idsSwipeados);
  const matchesSinPropio = filtrarMatchesSinUsuarioPropio(matchesSinSwipeados, miIdLogueado);
  let matchesOrdenados = ordenarMatchesPorAfinidad(matchesSinPropio, perfilLogueado);

  if (matchesOrdenados.length === 0 && itemsMatches.length > 0) {
    const matchesRescateSinPropio = filtrarMatchesSinUsuarioPropio(itemsMatches, miIdLogueado);
    matchesOrdenados = ordenarMatchesPorAfinidad(matchesRescateSinPropio, perfilLogueado);
  }

  return matchesOrdenados;
};

/**
 * Añade el _id de un usuario al array de swipeados en localStorage.
 * No inserta duplicados. Si localStorage falla, el error se silencia
 * para no interrumpir el flujo de swipe.
 */
const guardarSwipeEnMemoria = (userId) => {
  if (!userId) {
    return;
  }
  const idStr       = String(userId);
  const listaActual = leerSwipeados();

  if (listaActual.includes(idStr)) {
    return;
  }

  listaActual.push(idStr);

  try {
    localStorage.setItem('swiped_users', JSON.stringify(listaActual));
  } catch {
    // Si localStorage está lleno o no disponible, omitir silenciosamente
  }
};

// ─── EstudianteCard (formato Swipe) ──────────────────────────────────────────
// Tarjeta de dimensiones fijas (w-80 × h-[30rem]).
// La foto ocupa todo el espacio con object-cover.
// Los datos se superponen en la parte inferior usando un gradiente oscuro.
const EstudianteCard = (props) => {
  const estudiante      = props.estudiante;
  const matchScore      = props.matchScore;
  const compatibilidad  = props.compatibilidad;
  const navigate        = props.navigate;
  const Maps            = navigate;
  const miUbicacion     = props.miUbicacion;
  const zIndex          = props.zIndex;
  const usuarioLogueado = props.usuarioLogueado;

  // ── Badge de compatibilidad (termómetro visual) ───────────────────────────
  let badgeColorClases = '';
  let badgeEmoji       = '';
  let badgeTexto       = '';

  const hayBadge = matchScore !== null && matchScore !== undefined;

  if (hayBadge) {
    badgeTexto = `${matchScore}%`;

    if (matchScore >= 80) {
      badgeColorClases = 'bg-emerald-500/80 text-white border-emerald-400/30';
      badgeEmoji       = '🔥';
    } else if (matchScore >= 50) {
      badgeColorClases = 'bg-indigo-500/80 text-white border-indigo-400/30';
      badgeEmoji       = '✨';
    } else {
      badgeColorClases = 'bg-zinc-700 text-white border-zinc-600/30';
      badgeEmoji       = '👋';
    }
  }

  if (compatibilidad) {
    badgeTexto = compatibilidad;
  }

  let badgeContainerClases = 'absolute top-4 right-4 z-[5] flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border backdrop-blur-sm';
  if (badgeColorClases) {
    badgeContainerClases = badgeContainerClases + ' ' + badgeColorClases;
  }

  // ── Datos derivados del documento normalizado ─────────────────────────────
  const fotoUrl = getImageUrl(
    estudiante?.fotoPerfilUrl || estudiante?.foto_perfil || estudiante?.fotoPerfil
  );
  const userId      = estudiante?._id || estudiante?.id;
  const nombre      = estudiante?.nombre_completo || estudiante?.nombre || 'Estudiante';
  const objetoVivienda = estudiante?.vivienda || null;
  let tieneObjetoVivienda = false;

  if (objetoVivienda !== null && objetoVivienda !== undefined) {
    tieneObjetoVivienda = true;
  }

  const coordsVivienda = obtenerCoordsVivienda(estudiante);
  const viviendaId =
    coordsVivienda.id ||
    estudiante?.vivienda_id   ||
    estudiante?.vivienda?.id  ||
    estudiante?.vivienda?._id ||
    estudiante?.alojamientoId ||
    null;
  const tieneViviendaPublicada = viviendaId !== null && coordsVivienda.lat !== null && coordsVivienda.lng !== null;

  const carrera     = estudiante?.perfil_academico?.carrera     || estudiante?.carrera     || '';
  const universidad = estudiante?.perfil_academico?.universidad || estudiante?.universidad || '';
  const sede        = estudiante?.perfil_academico?.sede        || estudiante?.sede        || '';
  const edad        = calcularEdad(estudiante?.fecha_nacimiento) ?? estudiante?.edad ?? null;

  const pref = estudiante?.preferencias_convivencia || estudiante?.preferencias || {};
  const fuma = pref?.fuma;
  const bebe = pref?.bebe_alcohol ?? pref?.bebeAlcohol ?? null;
  const mascotas = pref?.mascotas ?? pref?.acepta_mascotas ?? null;
  const interesesTarjeta = extraerInteresesTarjeta(estudiante);

  const prefLogueado = obtenerPreferenciasUsuario(usuarioLogueado);
  const fumaLogueado = prefLogueado.fuma ?? null;
  const bebeLogueado = prefLogueado.bebe_alcohol ?? prefLogueado.bebeAlcohol ?? null;
  const mascotasLogueado = prefLogueado.mascotas ?? prefLogueado.acepta_mascotas ?? null;
  const interesesLogueado = extraerNombresIntereses(usuarioLogueado);

  const claseCoincidencia = 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
  const claseSinCoincidencia = 'bg-zinc-800 text-zinc-500 border border-zinc-700';

  let claseBaseHabito = 'shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm';

  let claseFuma = claseBaseHabito;
  if (usuarioLogueado && fumaLogueado !== null && fumaLogueado !== undefined && fuma !== null && fuma !== undefined) {
    if (fuma === fumaLogueado) {
      claseFuma = claseFuma + ' ' + claseCoincidencia;
    } else {
      claseFuma = claseFuma + ' ' + claseSinCoincidencia;
    }
  } else {
    claseFuma = claseFuma + ' ' + claseSinCoincidencia;
  }

  let claseBebe = claseBaseHabito;
  if (usuarioLogueado && bebeLogueado !== null && bebeLogueado !== undefined && bebe !== null && bebe !== undefined) {
    if (bebe === bebeLogueado) {
      claseBebe = claseBebe + ' ' + claseCoincidencia;
    } else {
      claseBebe = claseBebe + ' ' + claseSinCoincidencia;
    }
  } else {
    claseBebe = claseBebe + ' ' + claseSinCoincidencia;
  }

  let claseMascotas = claseBaseHabito;
  if (usuarioLogueado && mascotasLogueado !== null && mascotasLogueado !== undefined && mascotas !== null && mascotas !== undefined) {
    if (mascotas === mascotasLogueado) {
      claseMascotas = claseMascotas + ' ' + claseCoincidencia;
    } else {
      claseMascotas = claseMascotas + ' ' + claseSinCoincidencia;
    }
  } else {
    claseMascotas = claseMascotas + ' ' + claseSinCoincidencia;
  }

  let claseBaseInteres = 'shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[4.5rem]';
  let claseInteresVacio = 'shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800/60 text-zinc-600 border border-zinc-700 backdrop-blur-sm';

  // ── Cálculo de distancia: vivienda del match → sede del usuario logueado ──
  const miLat = miUbicacion?.latitud ?? null;
  const miLng = miUbicacion?.longitud ?? null;

  let distanciaKm = null;
  let distanciaLabel = null;

  if (tieneViviendaPublicada && miLat !== null && miLng !== null) {
    const viviendaLat = coordsVivienda.lat;
    const viviendaLng = coordsVivienda.lng;
    distanciaKm = calcularDistanciaHaversine(miLat, miLng, viviendaLat, viviendaLng);
    distanciaLabel = formatearDistanciaKm(distanciaKm);
  }

  let mostrarDistanciaSede = false;
  let textoDistanciaSede = '';

  if (tieneViviendaPublicada) {
    if (distanciaLabel) {
      mostrarDistanciaSede = true;
      textoDistanciaSede = `📍 A ${distanciaLabel}`;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-80 h-120 rounded-2xl overflow-hidden shadow-xl select-none cursor-grab active:cursor-grabbing bg-zinc-900"
      style={{ zIndex: zIndex }}
    >

      {/* Capa opaca — evita que se transparenten las tarjetas inferiores */}
      <div className="absolute inset-0 bg-zinc-900 pointer-events-none z-0" />

      {/* ── FOTO DE FONDO ── */}
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]"
          draggable="false"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-indigo-400 to-purple-600 flex items-center justify-center pointer-events-none z-[1]">
          <span className="text-white text-6xl font-bold select-none">
            {getIniciales(nombre)}
          </span>
        </div>
      )}

      {/* Zona superior cliqueable → perfil público (no cubre el overlay inferior ni bloquea swipe lateral) */}
      <Link
        to={`/usuario/${userId}`}
        className="absolute top-0 left-0 right-0 h-[58%] z-[4]"
        onClick={(e) => {
          e.stopPropagation();
        }}
        aria-label={`Ver perfil de ${nombre}`}
      />

      {/* ── GRADIENTE OSCURO ── */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-[2]" />

      {/* ── BADGE VIVIENDA — esquina superior izquierda ── */}
      {tieneObjetoVivienda ? (
        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            if (objetoVivienda && objetoVivienda._id) {
              Maps('/detalle-vivienda/' + objetoVivienda._id);
            } else if (objetoVivienda && objetoVivienda.id) {
              Maps('/detalle-vivienda/' + objetoVivienda.id);
            }
          }}
          className="absolute top-4 left-4 z-[5] flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-3 py-1.5 rounded-2xl font-extrabold text-[11px] border border-purple-400/30 backdrop-blur-sm transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Ofrece Vivienda
        </button>
      ) : (
        <div className="absolute top-4 left-4 z-[5] flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-2xl font-extrabold text-[11px] border border-orange-400/30 backdrop-blur-sm">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscando alojamiento
        </div>
      )}

      {/* ── BADGE COMPATIBILIDAD — esquina superior derecha ── */}
      {hayBadge && badgeTexto && (
        <div className={badgeContainerClases}>
          <span>{badgeEmoji}</span>
          <span>{badgeTexto}</span>
        </div>
      )}

      {/* ── INFO OVERLAY ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] p-5 text-white pointer-events-none">

        {/* Nombre + edad */}
        <Link
          to={`/usuario/${userId}`}
          className="block hover:opacity-90 transition-opacity pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h2 className="text-xl font-extrabold leading-tight drop-shadow-sm text-white">
            {nombre}
            {edad ? `, ${edad}` : ''}
          </h2>
        </Link>

        {carrera && (
          <p className="text-sm text-gray-200 mt-0.5 truncate">{carrera}</p>
        )}

        {universidad && (
          <p className="text-xs text-white/65 mt-0.5 truncate">
            🏫 {universidad}
            {sede ? ` · ${sede}` : ''}
          </p>
        )}

        {mostrarDistanciaSede && (
          <p className="text-xs text-blue-400 font-medium mt-1">
            {textoDistanciaSede}
          </p>
        )}

        {/* Fuma · Bebe · Mascotas — afinidad suave vs. usuario logueado */}
        <div className="flex flex-nowrap gap-1.5 mt-3 overflow-hidden">
          <span className={claseFuma}>
            🚬 {etiquetaFuma(fuma)}
          </span>
          {bebe !== null && bebe !== undefined && (
            <span className={claseBebe}>
              🍷 {etiquetaBebe(bebe)}
            </span>
          )}
          {mascotas !== undefined && (
            <span className={claseMascotas}>
              🐾 {etiquetaMascotas(mascotas)}
            </span>
          )}
        </div>

        {/* Exactamente 5 intereses — semáforo vs. usuario logueado */}
        <div className="flex flex-nowrap gap-1 mt-2 overflow-hidden">
          {interesesTarjeta.map((interesItem, idx) => {
            if (!interesItem) {
              return (
                <span
                  key={`vacío-${idx}`}
                  className={claseInteresVacio}
                >
                  —
                </span>
              );
            }

            const nombreInteres = interesItem.nombre;
            const iconoInteres = interesItem.icono;

            let estaCompartido = false;

            if (usuarioLogueado && interesesLogueado.length > 0) {
              for (const itemLogueado of interesesLogueado) {
                if (itemLogueado === nombreInteres) {
                  estaCompartido = true;
                  break;
                }
              }
            }

            let claseInteres = claseBaseInteres;

            if (usuarioLogueado) {
              if (estaCompartido) {
                claseInteres = claseInteres + ' ' + claseCoincidencia;
              } else {
                claseInteres = claseInteres + ' ' + claseSinCoincidencia;
              }
            } else {
              claseInteres = claseInteres + ' ' + claseSinCoincidencia;
            }

            return (
              <span
                key={`${nombreInteres}-${idx}`}
                className={claseInteres}
                title={nombreInteres}
              >
                <span>{iconoInteres}</span>
                {nombreInteres}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = (props) => {
  const [estudiantesAfines, setEstudiantesAfines] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [avatarUrl, setAvatarUrl]         = useState(null);
  const [avatarInicial, setAvatarInicial] = useState('');
  const [miUbicacion, setMiUbicacion]     = useState(null);
  const [miPerfil, setMiPerfil]             = useState(null);
  const [mazoCompletado, setMazoCompletado] = useState(false);

  // Índice de la tarjeta que está en la cima del mazo.
  // -1 = mazo vacío / todas las tarjetas ya fueron deslizadas.
  const [currentIndex, setCurrentIndex] = useState(-1);

  const navigate = useNavigate();

  const currentIndexRef       = useRef(-1);
  const swipeEnProgresoRef    = useRef(false);
  const longitudMatchesPrevRef = useRef(0);
  const miPerfilRef           = useRef(null);
  const miIdRef               = useRef(null);
  const longitudEstudiantesRef = useRef(0);

  useEffect(() => {
    miPerfilRef.current = miPerfil;
  }, [miPerfil]);

  useEffect(() => {
    longitudEstudiantesRef.current = estudiantesAfines.length;
  }, [estudiantesAfines.length]);

  const cargarMatches = async (perfilLogueado, miIdLogueado) => {
    setCargando(true);

    try {
      const respuesta = await apiClient.get('/usuarios/matches');
      const matchesOrdenados = procesarRespuestaMatches(respuesta, perfilLogueado, miIdLogueado);
      setMazoCompletado(false);
      setEstudiantesAfines(matchesOrdenados);
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else if (error && error.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        console.error('Error al cargar matches:', error);
        setEstudiantesAfines([]);
      }
    } finally {
      setCargando(false);
    }
  };

  const handleVolverABuscarPerfiles = async () => {
    limpiarSwipeados();

    let perfilLogueado = miPerfilRef.current;
    let miIdLogueado = miIdRef.current;

    await cargarMatches(perfilLogueado, miIdLogueado);
  };

  // Refs limitadas a la ventana DOM (máx. 10 tarjetas físicas).
  const childRefs = useMemo(() => {
    const refs = [];
    const limiteCartasDom = 10;
    let cantidadRefs = estudiantesAfines.length;

    if (cantidadRefs > limiteCartasDom) {
      cantidadRefs = limiteCartasDom;
    }

    for (let i = 0; i < cantidadRefs; i++) {
      refs.push(createRef());
    }

    return refs;
  }, [estudiantesAfines.length]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Solo reiniciar currentIndex cuando cambia la cantidad de matches (nueva carga), no en cada render
  useEffect(() => {
    const nuevaLongitud = estudiantesAfines.length;

    if (nuevaLongitud === 0) {
      setCurrentIndex(-1);
      longitudMatchesPrevRef.current = 0;
      return;
    }

    if (nuevaLongitud !== longitudMatchesPrevRef.current) {
      longitudMatchesPrevRef.current = nuevaLongitud;
      setCurrentIndex(nuevaLongitud - 1);
    }
  }, [estudiantesAfines.length]);

  const agregarMatchChat = async (userId) => {
    if (!userId) {
      return;
    }
    try {
      await apiClient.post('/matches', { id_destinatario: String(userId) });
    } catch (error) {
      console.error('Error al registrar match:', error);
    }
  };

  // Swipe derecha (Aceptar) → registrar match y habilitar chat
  const handleSwipe = (direction, cardIndex, cardUserId) => {
    const indiceSuperiorEsperado = longitudEstudiantesRef.current - 1;

    if (cardIndex !== indiceSuperiorEsperado) {
      return;
    }

    if (direction === 'right') {
      if (cardUserId) {
        agregarMatchChat(cardUserId);
      }
    }
  };

  // ── Llamado cuando la tarjeta sale de pantalla — persiste y elimina del mazo ─
  const handleCardLeftScreen = (direction, cardIndex, cardUserId) => {
    const indiceSuperiorEsperado = longitudEstudiantesRef.current - 1;

    if (cardIndex !== indiceSuperiorEsperado) {
      return;
    }

    guardarSwipeEnMemoria(cardUserId);

    setEstudiantesAfines(function actualizarEstudiantesTrasSwipe(prevEstudiantes) {
      const nuevosEstudiantes = [];
      let idSwipeStr = '';

      if (cardUserId) {
        idSwipeStr = String(cardUserId);
      }

      for (let i = 0; i < prevEstudiantes.length; i++) {
        const item = prevEstudiantes[i];
        const usuarioItem = item.usuario;
        let idItem = null;

        if (usuarioItem && usuarioItem._id) {
          idItem = String(usuarioItem._id);
        } else if (usuarioItem && usuarioItem.id) {
          idItem = String(usuarioItem.id);
        }

        let esElSwipeado = false;

        if (idSwipeStr.length > 0 && idItem !== null) {
          if (idItem === idSwipeStr) {
            esElSwipeado = true;
          }
        }

        if (!esElSwipeado) {
          nuevosEstudiantes.push(item);
        }
      }

      if (nuevosEstudiantes.length === 0) {
        setMazoCompletado(true);
      }

      return nuevosEstudiantes;
    });
  };

  // ── Ejecuta animación + handlers de forma explícita (botones Rechazar/Aceptar) ─
  const swiparProgramatico = async (direction) => {
    if (swipeEnProgresoRef.current) {
      return;
    }

    const indiceSuperiorGlobal = longitudEstudiantesRef.current - 1;

    if (indiceSuperiorGlobal < 0) {
      return;
    }

    const itemActivo = estudiantesAfines[indiceSuperiorGlobal];
    const usuarioActivo = itemActivo?.usuario;
    let idUsuarioActivo = null;

    if (usuarioActivo && usuarioActivo._id) {
      idUsuarioActivo = usuarioActivo._id;
    } else if (usuarioActivo && usuarioActivo.id) {
      idUsuarioActivo = usuarioActivo.id;
    }

    let cantidadVentana = estudiantesAfines.length;
    const limiteCartasDom = 10;

    if (cantidadVentana > limiteCartasDom) {
      cantidadVentana = limiteCartasDom;
    }

    const indiceSuperiorVentana = cantidadVentana - 1;

    swipeEnProgresoRef.current = true;

    try {
      const refDeLaTarjeta = childRefs[indiceSuperiorVentana];

      if (refDeLaTarjeta && refDeLaTarjeta.current) {
        await refDeLaTarjeta.current.swipe(direction);
      } else {
        handleSwipe(direction, indiceSuperiorGlobal, idUsuarioActivo);
        handleCardLeftScreen(direction, indiceSuperiorGlobal, idUsuarioActivo);
      }
    } finally {
      swipeEnProgresoRef.current = false;
    }
  };

  useEffect(() => {
    const inicializarDashboard = async () => {
      let miIdLogueado = null;
      let perfilLogueado = null;

      try {
        const respuestaPerfil = await apiClient.get('/usuarios/mi-perfil');
        perfilLogueado = respuestaPerfil;
        setMiPerfil(respuestaPerfil);

        if (respuestaPerfil && respuestaPerfil._id) {
          miIdLogueado = String(respuestaPerfil._id);
        } else if (respuestaPerfil && respuestaPerfil.id) {
          miIdLogueado = String(respuestaPerfil.id);
        }

        miIdRef.current = miIdLogueado;

        if (respuestaPerfil && respuestaPerfil.fotoPerfilUrl) {
          setAvatarUrl(getImageUrl(respuestaPerfil.fotoPerfilUrl));
        } else {
          const inicial = respuestaPerfil && respuestaPerfil.nombre ? respuestaPerfil.nombre[0].toUpperCase() : '?';
          setAvatarInicial(inicial);
        }

        if (respuestaPerfil && respuestaPerfil.ubicacion_sede) {
          const lat = respuestaPerfil.ubicacion_sede.latitud;
          const lng = respuestaPerfil.ubicacion_sede.longitud;

          if (lat && lng) {
            setMiUbicacion({ latitud: lat, longitud: lng });
          }
        }
      } catch {
        // avatar y ubicación no son críticos — la app sigue funcionando
      }

      await cargarMatches(perfilLogueado, miIdLogueado);
    };

    inicializarDashboard();
  }, [navigate]);

  // Tarjetas que faltan por deslizar (para el contador)
  const tarjetasRestantes = estudiantesAfines.length;

  let textoSedeEncabezado = null;

  if (miPerfil) {
    const sedeLogueado = miPerfil.perfil_academico?.sede;
    if (sedeLogueado) {
      textoSedeEncabezado = `Sede: ${sedeLogueado}`;
    }
  }

  // ── Ventana deslizante: solo las últimas MAX_CARTAS_DOM entradas van al DOM ──
  const MAX_CARTAS_DOM = 10;

  let ventanaTarjetas = [];
  let indiceInicioVentana = 0;

  if (estudiantesAfines.length > MAX_CARTAS_DOM) {
    indiceInicioVentana = estudiantesAfines.length - MAX_CARTAS_DOM;
    ventanaTarjetas = estudiantesAfines.slice(-MAX_CARTAS_DOM);
  } else {
    ventanaTarjetas = estudiantesAfines.slice(0);
    indiceInicioVentana = 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative overflow-x-hidden">

      {/* ── HEADER ── */}
      <div className="bg-white px-6 pt-8 pb-5 shadow-sm rounded-b-3xl sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight leading-tight">Roomeet</h1>
            {textoSedeEncabezado && (
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                {textoSedeEncabezado}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/explorar')}
              className="bg-gray-100 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-2xl transition-all shadow-sm text-xs active:scale-[0.98]"
            >
              Buscador
            </button>
            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-inner border-2 border-gray-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                  {avatarInicial}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN PRINCIPAL ── */}
      <div className="p-6 space-y-5">

        {/* Cabecera de sección */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Estudiantes más afines</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Acepta para conectar · Los matches van directo a tu chat
            </p>
          </div>
          {!cargando && estudiantesAfines.length > 0 && (
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {tarjetasRestantes} {tarjetasRestantes === 1 ? 'perfil' : 'perfiles'}
            </span>
          )}
        </div>

        {/* ── Estado: cargando ── */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            <p className="text-sm text-gray-500 font-medium">Calculando compatibilidad...</p>
          </div>
        )}

        {/* ── Estado: sin matches disponibles ── */}
        {!cargando && estudiantesAfines.length === 0 && !mazoCompletado && (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-sm border border-gray-100 gap-3">
            <span className="text-5xl">🔍</span>
            <p className="font-bold text-gray-700">Sin matches disponibles</p>
            <p className="text-sm text-gray-400 max-w-[240px]">
              El algoritmo no encontró perfiles compatibles aún. Completa tu perfil para mejorar tu puntuación.
            </p>
            <Link to="/editar-perfil" className="mt-2 text-blue-600 font-bold text-sm hover:underline">
              Mejorar mi perfil →
            </Link>
          </div>
        )}

        {/* ── Estado: mazo agotado (todos deslizados) ── */}
        {!cargando && estudiantesAfines.length === 0 && mazoCompletado && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
            <span className="text-5xl">🎉</span>
            <p className="font-extrabold text-gray-800 text-lg">¡Revisaste todos los perfiles!</p>
            <p className="text-sm text-gray-400 max-w-[220px]">
              Vuelve más tarde para ver nuevos estudiantes o revisa tus chats.
            </p>
            <button
              type="button"
              onClick={handleVolverABuscarPerfiles}
              className="mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-sm transition-all"
            >
              Volver a buscar perfiles
            </button>
            <Link to="/chats" className="mt-1 text-blue-600 font-bold text-sm hover:underline">
              Ver mis chats →
            </Link>
          </div>
        )}

        {/* ── MAZO DE TARJETAS SWIPE ─────────────────────────────────────────── */}
        {!cargando && estudiantesAfines.length > 0 && (
          <div className="flex flex-col items-center">

            {/* Mazo de tarjetas — contenedor aislado del flujo de botones */}
            <div className="relative w-80 h-120 z-0 isolate bg-zinc-900 rounded-2xl overflow-hidden">
              {ventanaTarjetas.map((item, idxLocal) => {
                const usuarioDelItem = item.usuario;
                let idDelItem = idxLocal;

                if (usuarioDelItem && usuarioDelItem._id) {
                  idDelItem = usuarioDelItem._id;
                } else if (usuarioDelItem && usuarioDelItem.id) {
                  idDelItem = usuarioDelItem.id;
                }

                const idxGlobal = indiceInicioVentana + idxLocal;
                const scoreDelItem = obtenerPuntuacionItemMatch(item, miPerfil);

                let esTarjetaSuperior = false;

                if (idxLocal === ventanaTarjetas.length - 1) {
                  esTarjetaSuperior = true;
                }

                const zIndexTarjeta = idxLocal + 1;

                let pointerEventsTarjeta = 'none';

                if (esTarjetaSuperior) {
                  pointerEventsTarjeta = 'auto';
                }

                return (
                  <div
                    key={idDelItem}
                    className="absolute top-0 left-0 w-80 h-120"
                    style={{
                      zIndex: zIndexTarjeta,
                      pointerEvents: pointerEventsTarjeta,
                    }}
                  >
                    <TinderCard
                      ref={childRefs[idxLocal]}
                      onSwipe={(dir) => {
                        handleSwipe(dir, idxGlobal, idDelItem);
                      }}
                      onCardLeftScreen={(dir) => {
                        handleCardLeftScreen(dir, idxGlobal, idDelItem);
                      }}
                      preventSwipe={['up', 'down']}
                      className="w-full h-full"
                    >
                      <EstudianteCard
                        estudiante={usuarioDelItem}
                        matchScore={scoreDelItem}
                        compatibilidad={null}
                        navigate={navigate}
                        miUbicacion={miUbicacion}
                        usuarioLogueado={miPerfil}
                        zIndex={zIndexTarjeta}
                      />
                    </TinderCard>
                  </div>
                );
              })}
            </div>

            {/* Controles Rechazar / Aceptar — fuera del contenedor absolute del mazo */}
            <div className="relative z-40 flex flex-col items-center gap-4 mt-8 w-full max-w-sm">

              <div className="flex items-center justify-center gap-6 w-full">

                <button
                  type="button"
                  onClick={() => {
                    swiparProgramatico('left');
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-200 border-2 border-red-400 active:scale-95 transition-all"
                  aria-label="Rechazar"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Rechazar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    swiparProgramatico('right');
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-green-200 border-2 border-green-400 active:scale-95 transition-all"
                  aria-label="Aceptar"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Aceptar</span>
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BARRA DE NAVEGACIÓN INFERIOR ── */}
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
          <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
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
