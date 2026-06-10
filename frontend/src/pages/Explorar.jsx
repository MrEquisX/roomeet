import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

const PRECIO_MAX_DEFAULT = 500000;
const RADIO_KM_DEFAULT = 0;
const EDAD_MIN_DEFECTO = 17;
const EDAD_MAX_DEFECTO = 35;

const OPCIONES_INTERES_FILTRO = [
  'Fútbol',
  'Gym',
  'Videojuegos',
  'Música',
  'Cocinar',
  'Mascotas',
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const filtrarUsuariosSinPropio = (usuarios, miId) => {
  return usuarios.filter((usuario) => {
    const idUsuario = usuario._id || usuario.id;

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

const calcularEdad = (fecha) => {
  if (!fecha) {
    return null;
  }
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad = edad - 1;
  }
  return edad;
};

const usuarioTieneInteres = (usuario, interesBuscado) => {
  const interesesCrudos = usuario.intereses || [];
  let encontrado = false;

  for (const item of interesesCrudos) {
    let nombre = null;

    if (typeof item === 'string') {
      nombre = item;
    } else if (item && item.nombre) {
      nombre = item.nombre;
    }

    if (nombre === interesBuscado) {
      encontrado = true;
      break;
    }
  }

  return encontrado;
};

const habitacionCumpleTipo = (habitacion, alojamiento, filtroTipo) => {
  if (filtroTipo === 'Cualquiera') {
    return true;
  }

  const tipoRaw = habitacion.tipoHabitacion || habitacion.tipo || '';

  if (tipoRaw) {
    if (filtroTipo === 'Privada') {
      if (tipoRaw.includes('Privada')) {
        return true;
      }
    }
    if (filtroTipo === 'Compartida') {
      if (tipoRaw.includes('Compartida')) {
        return true;
      }
    }
    return false;
  }

  const tipoPropiedad = alojamiento.tipoPropiedad || '';

  if (filtroTipo === 'Privada') {
    if (tipoPropiedad.includes('Pieza')) {
      return true;
    }
  }

  if (filtroTipo === 'Compartida') {
    const habitacionesTotales = alojamiento.habitacionesTotales || 0;
    if (habitacionesTotales > 1) {
      return true;
    }
    if (tipoPropiedad.includes('Casa')) {
      return true;
    }
    if (tipoPropiedad.includes('Departamento')) {
      return true;
    }
  }

  return false;
};

const habitacionCumpleBano = (habitacion, filtroBano) => {
  if (filtroBano === 'Cualquiera') {
    return true;
  }

  const tipoBanoRaw = habitacion.tipoBano || habitacion.bano || '';

  if (filtroBano === 'Privado') {
    if (tipoBanoRaw.includes('Privado')) {
      return true;
    }
    return false;
  }

  if (filtroBano === 'Compartido') {
    if (tipoBanoRaw.includes('Compartido')) {
      return true;
    }
    if (tipoBanoRaw.includes('Público')) {
      return true;
    }
    return false;
  }

  return false;
};

const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (x) => {
    return (x * Math.PI) / 180;
  };
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const obtenerPrecioMinimoAlojamiento = (alojamiento) => {
  const habitaciones = alojamiento?.habitacionesOfrecidas || [];
  const precios = [];

  for (const hab of habitaciones) {
    const precio = Number(hab.precio) || 0;
    if (precio > 0) {
      precios.push(precio);
    }
  }

  if (precios.length === 0) {
    return 0;
  }

  let minimo = precios[0];
  for (const p of precios) {
    if (p < minimo) {
      minimo = p;
    }
  }
  return minimo;
};

const normalizarFuma = (valor) => {
  if (valor === true) {
    return 'Sí';
  }
  if (valor === false) {
    return 'No';
  }
  if (valor === 'Ocasional') {
    return 'Ocasionalmente';
  }
  return valor || 'No';
};

const normalizarBebe = (valor) => {
  if (valor === 'Nunca') {
    return 'No';
  }
  if (valor === 'Socialmente' || valor === 'Frecuente') {
    return 'Ocasionalmente';
  }
  return valor || 'No';
};

const normalizarMascotas = (valor) => {
  if (valor === true) {
    return 'Sí';
  }
  if (valor === false) {
    return 'No';
  }
  return valor || 'No';
};

// ─── Filtrado Personas ────────────────────────────────────────────────────────

const usuarioCoincideTexto = (usuario, termino) => {
  if (!termino.trim()) {
    return true;
  }
  const term = termino.toLowerCase();
  const nombre = (usuario.nombre_completo || '').toLowerCase();
  const univ = (usuario.perfil_academico?.universidad || '').toLowerCase();
  const carr = (usuario.perfil_academico?.carrera || '').toLowerCase();
  const sede = (usuario.perfil_academico?.sede || '').toLowerCase();

  if (nombre.includes(term)) {
    return true;
  }
  if (univ.includes(term)) {
    return true;
  }
  if (carr.includes(term)) {
    return true;
  }
  if (sede.includes(term)) {
    return true;
  }
  return false;
};

const usuarioPasaFiltrosPersona = (usuario, filtros, aplicarFiltrosPersona) => {
  if (!usuarioCoincideTexto(usuario, filtros.searchTerm)) {
    return false;
  }

  if (!aplicarFiltrosPersona) {
    return true;
  }

  if (filtros.universidad.trim()) {
    const uUniv = (usuario.perfil_academico?.universidad || '').toLowerCase();
    const filtro = filtros.universidad.trim().toLowerCase();
    if (!uUniv.includes(filtro)) {
      return false;
    }
  }

  if (filtros.carrera.trim()) {
    const uCarr = (usuario.perfil_academico?.carrera || '').toLowerCase();
    const filtro = filtros.carrera.trim().toLowerCase();
    if (!uCarr.includes(filtro)) {
      return false;
    }
  }

  const pref = usuario.preferencias_convivencia || {};
  const fumaUsuario = normalizarFuma(pref.fuma);
  const bebeUsuario = normalizarBebe(pref.bebe_alcohol);
  const mascotasUsuario = normalizarMascotas(pref.mascotas);

  if (filtros.fuma !== 'Indiferente') {
    if (fumaUsuario !== filtros.fuma) {
      return false;
    }
  }

  if (filtros.bebe !== 'Indiferente') {
    if (bebeUsuario !== filtros.bebe) {
      return false;
    }
  }

  if (filtros.mascotas !== 'Indiferente') {
    if (mascotasUsuario !== filtros.mascotas) {
      return false;
    }
  }

  if (filtros.nivelOrdenMin > 0) {
    const ordenUsuario = pref.nivel_orden ?? 0;
    if (ordenUsuario < filtros.nivelOrdenMin) {
      return false;
    }
  }

  if (filtros.nivelRuidoMin > 0) {
    const ruidoUsuario = pref.nivel_ruido ?? 0;
    if (ruidoUsuario < filtros.nivelRuidoMin) {
      return false;
    }
  }

  const edadMin = Number(filtros.edadMin);
  const edadMax = Number(filtros.edadMax);
  const edadUsuario = calcularEdad(usuario.fecha_nacimiento);

  if (edadUsuario === null) {
    return false;
  }

  if (edadUsuario < edadMin) {
    return false;
  }

  if (edadUsuario > edadMax) {
    return false;
  }

  if (filtros.genero !== 'Indiferente') {
    const sexoUsuario = usuario.sexo_biologico || '';
    if (sexoUsuario !== filtros.genero) {
      return false;
    }
  }

  if (filtros.interesPrincipal !== 'Cualquiera') {
    const tieneInteres = usuarioTieneInteres(usuario, filtros.interesPrincipal);
    if (!tieneInteres) {
      return false;
    }
  }

  return true;
};

// ─── Filtrado Viviendas ───────────────────────────────────────────────────────

const alojamientoCoincideTexto = (alojamiento, termino) => {
  if (!termino.trim()) {
    return true;
  }
  const term = termino.toLowerCase();
  const titulo = (alojamiento.titulo || '').toLowerCase();
  const sector = (alojamiento.sector || '').toLowerCase();
  const comuna = (alojamiento.comuna || '').toLowerCase();

  if (titulo.includes(term)) {
    return true;
  }
  if (sector.includes(term)) {
    return true;
  }
  if (comuna.includes(term)) {
    return true;
  }
  return false;
};

const alojamientoPasaFiltrosVivienda = (alojamiento, filtros, miUbicacion, aplicarFiltrosVivienda) => {
  if (!alojamientoCoincideTexto(alojamiento, filtros.searchTerm)) {
    return false;
  }

  if (!aplicarFiltrosVivienda) {
    return true;
  }

  const precioMinimo = obtenerPrecioMinimoAlojamiento(alojamiento);
  if (filtros.precioMax < PRECIO_MAX_DEFAULT) {
    if (precioMinimo <= 0) {
      return false;
    }
    if (precioMinimo > filtros.precioMax) {
      return false;
    }
  }

  if (filtros.radioKm > RADIO_KM_DEFAULT && miUbicacion) {
    const miLat = miUbicacion.latitud;
    const miLng = miUbicacion.longitud;
    const vivLat = alojamiento.latitud;
    const vivLng = alojamiento.longitud;

    if (vivLat == null || vivLng == null) {
      return false;
    }

    const distancia = calcularDistanciaHaversine(miLat, miLng, vivLat, vivLng);
    if (distancia > filtros.radioKm) {
      return false;
    }
  }

  if (filtros.habitacionesMin > 0) {
    const disponibles = alojamiento.habitacionesOfrecidas?.length || 0;
    if (disponibles < filtros.habitacionesMin) {
      return false;
    }
  }

  const habitaciones = alojamiento.habitacionesOfrecidas || [];

  if (filtros.tipoHabitacion !== 'Cualquiera') {
    let tieneTipoHabitacion = false;

    for (const hab of habitaciones) {
      const cumple = habitacionCumpleTipo(hab, alojamiento, filtros.tipoHabitacion);
      if (cumple) {
        tieneTipoHabitacion = true;
        break;
      }
    }

    if (!tieneTipoHabitacion) {
      return false;
    }
  }

  if (filtros.tipoBano !== 'Cualquiera') {
    let tieneBano = false;

    for (const hab of habitaciones) {
      const cumple = habitacionCumpleBano(hab, filtros.tipoBano);
      if (cumple) {
        tieneBano = true;
        break;
      }
    }

    if (!tieneBano) {
      return false;
    }
  }

  return true;
};

// ─── Detección de filtros activos ─────────────────────────────────────────────

const hayFiltrosPersonaActivos = (filtros) => {
  if (filtros.universidad.trim() !== '') {
    return true;
  }
  if (filtros.carrera.trim() !== '') {
    return true;
  }
  if (filtros.fuma !== 'Indiferente') {
    return true;
  }
  if (filtros.bebe !== 'Indiferente') {
    return true;
  }
  if (filtros.mascotas !== 'Indiferente') {
    return true;
  }
  if (filtros.nivelOrdenMin > 0) {
    return true;
  }
  if (filtros.nivelRuidoMin > 0) {
    return true;
  }
  if (filtros.edadMin !== EDAD_MIN_DEFECTO) {
    return true;
  }
  if (filtros.edadMax !== EDAD_MAX_DEFECTO) {
    return true;
  }
  if (filtros.genero !== 'Indiferente') {
    return true;
  }
  if (filtros.interesPrincipal !== 'Cualquiera') {
    return true;
  }
  return false;
};

const hayFiltrosViviendaActivos = (filtros) => {
  if (filtros.precioMax < PRECIO_MAX_DEFAULT) {
    return true;
  }
  if (filtros.radioKm > RADIO_KM_DEFAULT) {
    return true;
  }
  if (filtros.habitacionesMin > 0) {
    return true;
  }
  if (filtros.tipoHabitacion !== 'Cualquiera') {
    return true;
  }
  if (filtros.tipoBano !== 'Cualquiera') {
    return true;
  }
  return false;
};

// ─── Resultados mixtos con filtrado cruzado ────────────────────────────────────

const construirResultadosMixtos = (opciones) => {
  const usuarios = opciones.usuarios;
  const alojamientos = opciones.alojamientos;
  const mapaAlojamientosPorId = opciones.mapaAlojamientosPorId;
  const mapaUsuariosPorId = opciones.mapaUsuariosPorId;
  const filtros = opciones.filtros;
  const miUbicacion = opciones.miUbicacion;
  const activarFiltrosPersona = opciones.activarFiltrosPersona;
  const activarFiltrosVivienda = opciones.activarFiltrosVivienda;

  let filtrosPersonaActivos = false;
  if (activarFiltrosPersona) {
    if (hayFiltrosPersonaActivos(filtros)) {
      filtrosPersonaActivos = true;
    }
  }

  let filtrosViviendaActivos = false;
  if (activarFiltrosVivienda) {
    if (hayFiltrosViviendaActivos(filtros)) {
      filtrosViviendaActivos = true;
    }
  }

  const usuariosQuePasanPersona = [];
  for (const usuario of usuarios) {
    const pasa = usuarioPasaFiltrosPersona(usuario, filtros, activarFiltrosPersona);
    if (pasa) {
      usuariosQuePasanPersona.push(usuario);
    }
  }

  const alojamientosQuePasanVivienda = [];
  for (const alojamiento of alojamientos) {
    const pasa = alojamientoPasaFiltrosVivienda(
      alojamiento,
      filtros,
      miUbicacion,
      activarFiltrosVivienda
    );
    if (pasa) {
      alojamientosQuePasanVivienda.push(alojamiento);
    }
  }

  const idsAlojamientosIncluidos = new Set();
  const itemsMixtos = [];

  for (const alojamiento of alojamientosQuePasanVivienda) {
    const idAloj = String(alojamiento._id || alojamiento.id);
    idsAlojamientosIncluidos.add(idAloj);

    let anfitrion = null;
    if (alojamiento.id_anfitrion) {
      anfitrion = mapaUsuariosPorId[String(alojamiento.id_anfitrion)] || null;
    }

    if (filtrosPersonaActivos && anfitrion) {
      const anfitrionPasa = usuarioPasaFiltrosPersona(anfitrion, filtros, activarFiltrosPersona);
      if (!anfitrionPasa) {
        continue;
      }
    }

    let esCruzado = false;
    if (filtrosPersonaActivos && filtrosViviendaActivos) {
      esCruzado = true;
    }

    itemsMixtos.push({
      tipo: 'vivienda',
      esCruzado,
      alojamiento,
      anfitrion,
    });
  }

  for (const usuario of usuariosQuePasanPersona) {
    const userId = String(usuario._id || usuario.id);
    const esAnfitrion = usuario.rol === 'Anfitrion';
    const alojamientoId = usuario.alojamientoId
      ? String(usuario.alojamientoId)
      : null;

    if (filtrosViviendaActivos && esAnfitrion && alojamientoId) {
      const alojamiento = mapaAlojamientosPorId[alojamientoId] || null;
      if (!alojamiento) {
        continue;
      }
      const viviendaPasa = alojamientoPasaFiltrosVivienda(
        alojamiento,
        filtros,
        miUbicacion,
        activarFiltrosVivienda
      );
      if (!viviendaPasa) {
        continue;
      }
      if (idsAlojamientosIncluidos.has(alojamientoId)) {
        continue;
      }
    }

    if (filtrosViviendaActivos && esAnfitrion && !alojamientoId) {
      continue;
    }

    let esCruzado = false;
    if (filtrosPersonaActivos && filtrosViviendaActivos && esAnfitrion) {
      esCruzado = true;
    }

    itemsMixtos.push({
      tipo: 'persona',
      esCruzado,
      usuario,
      alojamiento: alojamientoId
        ? mapaAlojamientosPorId[alojamientoId] || null
        : null,
    });
  }

  return itemsMixtos;
};

// ─── Drawer de filtros ────────────────────────────────────────────────────────

const ToggleCategoria = (props) => {
  const activo = props.activo;
  const alCambiar = props.alCambiar;
  const etiqueta = props.etiqueta;

  let claseFondo = 'bg-gray-200';
  let claseCirculo = 'translate-x-0.5';

  if (activo) {
    claseFondo = 'bg-blue-600';
    claseCirculo = 'translate-x-5';
  }

  let claseBoton = 'relative w-11 h-6 rounded-full transition-colors shrink-0 ';
  claseBoton = claseBoton + claseFondo;

  let claseCirculoCompleto = 'absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform ';
  claseCirculoCompleto = claseCirculoCompleto + claseCirculo;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => {
        alCambiar(!activo);
      }}
      className={claseBoton}
    >
      <span className={claseCirculoCompleto} />
    </button>
  );
};

const DrawerFiltros = (props) => {
  const filtros = props.filtros;
  const setFiltros = props.setFiltros;
  const onCerrar = props.onCerrar;
  const onLimpiar = props.onLimpiar;
  const hayPersonaActivos = props.hayPersonaActivos;
  const hayViviendaActivos = props.hayViviendaActivos;
  const activarFiltrosPersona = props.activarFiltrosPersona;
  const setActivarFiltrosPersona = props.setActivarFiltrosPersona;
  const activarFiltrosVivienda = props.activarFiltrosVivienda;
  const setActivarFiltrosVivienda = props.setActivarFiltrosVivienda;

  let claseContenedorPersona = 'space-y-4';
  if (!activarFiltrosPersona) {
    claseContenedorPersona = claseContenedorPersona + ' opacity-50 pointer-events-none';
  }

  let claseContenedorVivienda = 'space-y-4';
  if (!activarFiltrosVivienda) {
    claseContenedorVivienda = claseContenedorVivienda + ' opacity-50 pointer-events-none';
  }

  return (
    <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          <p className="text-[11px] text-gray-400">Personas + Viviendas combinables</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
          aria-label="Cerrar filtros"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
              Personas
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {hayPersonaActivos && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">
                  Activos
                </span>
              )}
              <ToggleCategoria
                activo={activarFiltrosPersona}
                alCambiar={setActivarFiltrosPersona}
                etiqueta="Activar filtros de personas"
              />
            </div>
          </div>

          <div className={claseContenedorPersona}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Universidad</label>
                <input
                  type="text"
                  value={filtros.universidad}
                  onChange={(e) => {
                    setFiltros({ ...filtros, universidad: e.target.value });
                  }}
                  placeholder="PUCV, UChile..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Carrera</label>
                <input
                  type="text"
                  value={filtros.carrera}
                  onChange={(e) => {
                    setFiltros({ ...filtros, carrera: e.target.value });
                  }}
                  placeholder="Ingeniería..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Edad Mínima</label>
                <input
                  type="number"
                  min="17"
                  max="99"
                  value={filtros.edadMin}
                  onChange={(e) => {
                    setFiltros({ ...filtros, edadMin: Number(e.target.value) || EDAD_MIN_DEFECTO });
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Edad Máxima</label>
                <input
                  type="number"
                  min="17"
                  max="99"
                  value={filtros.edadMax}
                  onChange={(e) => {
                    setFiltros({ ...filtros, edadMax: Number(e.target.value) || EDAD_MAX_DEFECTO });
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Género</label>
              <select
                value={filtros.genero}
                onChange={(e) => {
                  setFiltros({ ...filtros, genero: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Indiferente">Indiferente</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Interés Principal</label>
              <select
                value={filtros.interesPrincipal}
                onChange={(e) => {
                  setFiltros({ ...filtros, interesPrincipal: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Cualquiera">Cualquiera</option>
                {OPCIONES_INTERES_FILTRO.map((interes) => {
                  return (
                    <option key={interes} value={interes}>
                      {interes}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Fuma</label>
              <select
                value={filtros.fuma}
                onChange={(e) => {
                  setFiltros({ ...filtros, fuma: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Indiferente">Indiferente</option>
                <option value="No">No fuma</option>
                <option value="Sí">Sí fuma</option>
                <option value="Ocasionalmente">Ocasionalmente</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Bebe alcohol</label>
              <select
                value={filtros.bebe}
                onChange={(e) => {
                  setFiltros({ ...filtros, bebe: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Indiferente">Indiferente</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
                <option value="Ocasionalmente">Ocasionalmente</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Mascotas</label>
              <select
                value={filtros.mascotas}
                onChange={(e) => {
                  setFiltros({ ...filtros, mascotas: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Indiferente">Indiferente</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Orden mínimo</label>
                <span className="text-xs font-bold text-blue-600">
                  {filtros.nivelOrdenMin === 0 ? 'Sin filtro' : `≥ ${filtros.nivelOrdenMin}/5`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={filtros.nivelOrdenMin}
                onChange={(e) => {
                  setFiltros({ ...filtros, nivelOrdenMin: Number(e.target.value) });
                }}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Ruido mínimo tolerado</label>
                <span className="text-xs font-bold text-blue-600">
                  {filtros.nivelRuidoMin === 0 ? 'Sin filtro' : `≥ ${filtros.nivelRuidoMin}/5`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={filtros.nivelRuidoMin}
                onChange={(e) => {
                  setFiltros({ ...filtros, nivelRuidoMin: Number(e.target.value) });
                }}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xs font-extrabold text-green-600 uppercase tracking-widest">
              Viviendas
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {hayViviendaActivos && (
                <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-lg">
                  Activos
                </span>
              )}
              <ToggleCategoria
                activo={activarFiltrosVivienda}
                alCambiar={setActivarFiltrosVivienda}
                etiqueta="Activar filtros de viviendas"
              />
            </div>
          </div>

          <div className={claseContenedorVivienda}>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Precio máximo</label>
                <span className="text-xs font-bold text-green-600">
                  ${filtros.precioMax.toLocaleString('es-CL')}
                </span>
              </div>
              <input
                type="range"
                min="80000"
                max={PRECIO_MAX_DEFAULT}
                step="10000"
                value={filtros.precioMax}
                onChange={(e) => {
                  setFiltros({ ...filtros, precioMax: Number(e.target.value) });
                }}
                className="w-full accent-green-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {filtros.precioMax >= PRECIO_MAX_DEFAULT
                  ? 'Sin tope de precio'
                  : 'Habitación desde este valor hacia abajo'}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Radio desde tu sede</label>
                <span className="text-xs font-bold text-green-600">
                  {filtros.radioKm === 0 ? 'Sin límite' : `${filtros.radioKm} km`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={filtros.radioKm}
                onChange={(e) => {
                  setFiltros({ ...filtros, radioKm: Number(e.target.value) });
                }}
                className="w-full accent-green-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Habitaciones mínimas</label>
              <input
                type="number"
                min="0"
                max="10"
                value={filtros.habitacionesMin}
                onChange={(e) => {
                  setFiltros({ ...filtros, habitacionesMin: Number(e.target.value) || 0 });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Tipo de Habitación</label>
              <select
                value={filtros.tipoHabitacion}
                onChange={(e) => {
                  setFiltros({ ...filtros, tipoHabitacion: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Cualquiera">Cualquiera</option>
                <option value="Privada">Privada</option>
                <option value="Compartida">Compartida</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1 block uppercase">Baño</label>
              <select
                value={filtros.tipoBano}
                onChange={(e) => {
                  setFiltros({ ...filtros, tipoBano: e.target.value });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="Cualquiera">Cualquiera</option>
                <option value="Privado">Privado</option>
                <option value="Compartido">Compartido</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div className="shrink-0 px-5 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onLimpiar}
          className="w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl bg-transparent hover:bg-gray-50 transition-colors"
        >
          Restablecer filtros
        </button>
      </div>
    </aside>
  );
};

// ─── Explorar ─────────────────────────────────────────────────────────────────

const FILTROS_INICIALES = {
  searchTerm: '',
  universidad: '',
  carrera: '',
  edadMin: EDAD_MIN_DEFECTO,
  edadMax: EDAD_MAX_DEFECTO,
  genero: 'Indiferente',
  interesPrincipal: 'Cualquiera',
  fuma: 'Indiferente',
  bebe: 'Indiferente',
  mascotas: 'Indiferente',
  nivelOrdenMin: 0,
  nivelRuidoMin: 0,
  precioMax: PRECIO_MAX_DEFAULT,
  radioKm: RADIO_KM_DEFAULT,
  habitacionesMin: 0,
  tipoHabitacion: 'Cualquiera',
  tipoBano: 'Cualquiera',
};

const Explorar = () => {
  const navigate = useNavigate();

  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES });

  const [activarFiltrosPersona, setActivarFiltrosPersona] = useState(true);
  const [activarFiltrosVivienda, setActivarFiltrosVivienda] = useState(true);

  const [usuariosRaw, setUsuariosRaw] = useState([]);
  const [alojamientosRaw, setAlojamientosRaw] = useState([]);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggerBusqueda, setTriggerBusqueda] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      const token = getToken();
      if (!token) {
        if (!cancelado) {
          setError('No se encontró el token de autenticación.');
        }
        return;
      }

      if (!cancelado) {
        setIsLoading(true);
        setError(null);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        const resUsuarios = await fetch(`${API_BASE}/api/usuarios`, { headers });
        const resAlojamientos = await fetch(`${API_BASE}/api/alojamientos`, { headers });
        const resPerfil = await fetch(`${API_BASE}/api/usuarios/mi-perfil`, { headers });

        if (!resUsuarios.ok || !resAlojamientos.ok) {
          throw new Error('Error al cargar datos de búsqueda.');
        }

        const dataUsuarios = await resUsuarios.json();
        const dataAlojamientos = await resAlojamientos.json();

        let miIdLogueado = null;

        if (resPerfil.ok) {
          const perfil = await resPerfil.json();

          if (perfil?._id) {
            miIdLogueado = String(perfil._id);
          } else if (perfil?.id) {
            miIdLogueado = String(perfil.id);
          }

          if (!cancelado) {
            const lat = perfil?.ubicacion_sede?.latitud;
            const lng = perfil?.ubicacion_sede?.longitud;

            if (lat != null && lng != null) {
              setMiUbicacion({ latitud: lat, longitud: lng });
            }
          }
        }

        let listaUsuarios = [];
        if (Array.isArray(dataUsuarios)) {
          listaUsuarios = dataUsuarios;
        } else if (Array.isArray(dataUsuarios?.data)) {
          listaUsuarios = dataUsuarios.data;
        }

        const usuariosSinPropio = filtrarUsuariosSinPropio(listaUsuarios, miIdLogueado);

        let listaAlojamientos = [];
        if (Array.isArray(dataAlojamientos)) {
          listaAlojamientos = dataAlojamientos;
        } else if (Array.isArray(dataAlojamientos?.data)) {
          listaAlojamientos = dataAlojamientos.data;
        }

        if (!cancelado) {
          setUsuariosRaw(usuariosSinPropio);
          setAlojamientosRaw(listaAlojamientos);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'Error desconocido.');
        }
      } finally {
        if (!cancelado) {
          setIsLoading(false);
        }
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [triggerBusqueda]);

  const mapaAlojamientosPorId = useMemo(() => {
    const mapa = {};
    for (const aloj of alojamientosRaw) {
      const id = String(aloj._id || aloj.id);
      mapa[id] = aloj;
    }
    return mapa;
  }, [alojamientosRaw]);

  const mapaUsuariosPorId = useMemo(() => {
    const mapa = {};
    for (const usuario of usuariosRaw) {
      const id = String(usuario._id || usuario.id);
      mapa[id] = usuario;
    }
    return mapa;
  }, [usuariosRaw]);

  const resultadosMixtos = useMemo(() => {
    return construirResultadosMixtos({
      usuarios: usuariosRaw,
      alojamientos: alojamientosRaw,
      mapaAlojamientosPorId,
      mapaUsuariosPorId,
      filtros,
      miUbicacion,
      activarFiltrosPersona,
      activarFiltrosVivienda,
    });
  }, [
    usuariosRaw,
    alojamientosRaw,
    mapaAlojamientosPorId,
    mapaUsuariosPorId,
    filtros,
    miUbicacion,
    activarFiltrosPersona,
    activarFiltrosVivienda,
  ]);

  let personaActivos = false;
  if (activarFiltrosPersona) {
    if (hayFiltrosPersonaActivos(filtros)) {
      personaActivos = true;
    }
  }

  let viviendaActivos = false;
  if (activarFiltrosVivienda) {
    if (hayFiltrosViviendaActivos(filtros)) {
      viviendaActivos = true;
    }
  }

  const cruzadoActivos = personaActivos && viviendaActivos;

  const totalFiltrosActivos = (() => {
    let count = 0;
    if (personaActivos) {
      count = count + 1;
    }
    if (viviendaActivos) {
      count = count + 1;
    }
    return count;
  })();

  const abrirDrawer = () => {
    setDrawerIsOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerIsOpen(false);
  };

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
    setActivarFiltrosPersona(true);
    setActivarFiltrosVivienda(true);
  };

  const contarPersonas = () => {
    let count = 0;
    for (const item of resultadosMixtos) {
      if (item.tipo === 'persona') {
        count = count + 1;
      }
    }
    return count;
  };

  const contarViviendas = () => {
    let count = 0;
    for (const item of resultadosMixtos) {
      if (item.tipo === 'vivienda') {
        count = count + 1;
      }
    }
    return count;
  };

  const contarCruzados = () => {
    let count = 0;
    for (const item of resultadosMixtos) {
      if (item.esCruzado) {
        count = count + 1;
      }
    }
    return count;
  };

  let contenidoDrawer = null;
  if (drawerIsOpen) {
    contenidoDrawer = (
      <>
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={cerrarDrawer}
          aria-hidden="true"
        />
        <DrawerFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          onCerrar={cerrarDrawer}
          onLimpiar={limpiarFiltros}
          hayPersonaActivos={personaActivos}
          hayViviendaActivos={viviendaActivos}
          activarFiltrosPersona={activarFiltrosPersona}
          setActivarFiltrosPersona={setActivarFiltrosPersona}
          activarFiltrosVivienda={activarFiltrosVivienda}
          setActivarFiltrosVivienda={setActivarFiltrosVivienda}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Buscador</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
              Filtrado total · Personas + Viviendas
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/dashboard');
            }}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            ← Volver
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filtros.searchTerm}
              onChange={(e) => {
                setFiltros({ ...filtros, searchTerm: e.target.value });
              }}
              placeholder="Buscar personas, universidades, viviendas..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={abrirDrawer}
            className="relative shrink-0 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtros
            {totalFiltrosActivos > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {totalFiltrosActivos}
              </span>
            )}
          </button>
        </div>

        {cruzadoActivos && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 text-[11px] text-purple-700 font-medium">
            🔀 Filtro cruzado activo: se combinan criterios de personas y viviendas simultáneamente.
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            <p className="text-sm text-gray-600 font-bold">Cargando buscador...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => {
                setTriggerBusqueda((t) => {
                  return t + 1;
                });
              }}
              className="mt-3 text-xs font-bold text-red-600 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-gray-800">
                {resultadosMixtos.length} resultados
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                👤 {contarPersonas()} personas
              </span>
              <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                🏠 {contarViviendas()} viviendas
              </span>
              {cruzadoActivos && (
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">
                  🔀 {contarCruzados()} cruzados
                </span>
              )}
            </div>

            {resultadosMixtos.length === 0 && (
              <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-sm font-bold text-gray-600">Sin resultados con estos filtros</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Prueba ampliar el precio, quitar el radio o relajar hábitos de convivencia.
                </p>
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="mt-4 text-xs font-bold text-blue-600 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {resultadosMixtos.length > 0 && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {resultadosMixtos.map((item, idx) => {
                  if (item.tipo === 'vivienda') {
                    const a = item.alojamiento;
                    const idAloj = a._id || a.id;
                    const fotoUrl = getImageUrl(a.imagenes?.[0]);
                    const precioDesde = obtenerPrecioMinimoAlojamiento(a);
                    const anfitrionNombre = item.anfitrion?.nombre_completo || '';

                    return (
                      <div
                        key={`viv-${idAloj}-${idx}`}
                        onClick={() => {
                          navigate(`/detalle-vivienda/${idAloj}`);
                        }}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {fotoUrl ? (
                          <img src={fotoUrl} alt={a.titulo} className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-28 bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center text-3xl">
                            🏠
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="text-[10px] font-extrabold bg-green-50 text-green-700 px-2 py-0.5 rounded-lg uppercase">
                              Vivienda
                            </span>
                            {item.esCruzado && (
                              <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg uppercase">
                                Match cruzado
                              </span>
                            )}
                            {a.comuna && (
                              <span className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg">
                                {a.comuna}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 truncate">{a.titulo || 'Sin título'}</h3>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">📍 {a.sector || '—'}</p>
                          {anfitrionNombre && (
                            <p className="text-[10px] text-blue-600 font-bold mt-1 truncate">Anfitrión: {anfitrionNombre}</p>
                          )}
                          {precioDesde > 0 && (
                            <p className="text-green-600 font-extrabold text-base mt-2">
                              Desde ${precioDesde.toLocaleString('es-CL')}
                              <span className="text-gray-400 font-normal text-[10px]">/mes</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const u = item.usuario;
                  const userId = u._id || u.id;
                  const nombre = u.nombre_completo || 'Sin nombre';
                  const univ = u.perfil_academico?.universidad || '';
                  const carr = u.perfil_academico?.carrera || '';
                  const fotoUrl = getImageUrl(u.foto_perfil || '');
                  const edad = calcularEdad(u.fecha_nacimiento);
                  const pref = u.preferencias_convivencia || {};
                  const precioVinculado = item.alojamiento
                    ? obtenerPrecioMinimoAlojamiento(item.alojamiento)
                    : 0;

                  return (
                    <div
                      key={`per-${userId}-${idx}`}
                      onClick={() => {
                        navigate(`/usuario/${userId}`);
                      }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-full h-32 bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative">
                        {fotoUrl ? (
                          <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                            {nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg">
                          👤 Persona
                        </span>
                        {item.esCruzado && (
                          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg">
                            🔀 Cruzado
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-gray-900 truncate">{nombre}</h3>
                        {univ && (
                          <p className="text-[11px] text-blue-700 font-bold truncate mt-0.5">{univ}</p>
                        )}
                        {carr && (
                          <p className="text-[10px] text-gray-400 truncate">{carr}</p>
                        )}
                        {edad !== null && (
                          <p className="text-[10px] text-gray-400">{edad} años</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[9px] bg-gray-50 text-gray-600 font-bold px-1.5 py-0.5 rounded-md">
                            🚬 {normalizarFuma(pref.fuma)}
                          </span>
                          <span className="text-[9px] bg-gray-50 text-gray-600 font-bold px-1.5 py-0.5 rounded-md">
                            🍷 {normalizarBebe(pref.bebe_alcohol)}
                          </span>
                          <span className="text-[9px] bg-gray-50 text-gray-600 font-bold px-1.5 py-0.5 rounded-md">
                            🐾 {normalizarMascotas(pref.mascotas)}
                          </span>
                        </div>
                        {precioVinculado > 0 && (
                          <p className="text-[11px] text-green-600 font-bold mt-2">
                            Ofrece desde ${precioVinculado.toLocaleString('es-CL')}/mes
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {contenidoDrawer}
    </div>
  );
};

export default Explorar;
