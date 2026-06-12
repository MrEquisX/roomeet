export { universidadesChile } from '../data/sedes_nacionales.mjs';

export const ANIO_ACTUAL = new Date().getFullYear();
export const ANIO_MIN_INGRESO = ANIO_ACTUAL - 10;

export const EDAD_MINIMA = 18;
export const EDAD_MAXIMA = 100;

export const formatearFechaInput = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const obtenerFechaMaxNacimiento = () => {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setFullYear(hoy.getFullYear() - EDAD_MINIMA);
  return formatearFechaInput(limite);
};

export const obtenerFechaMinNacimiento = () => {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setFullYear(hoy.getFullYear() - EDAD_MAXIMA);
  return formatearFechaInput(limite);
};

export const INTERESES_OPCIONES = [
  { nombre: 'Fútbol',         icono: '⚽' },
  { nombre: 'Gym',            icono: '💪' },
  { nombre: 'Videojuegos',    icono: '🎮' },
  { nombre: 'Básquet',        icono: '🏀' },
  { nombre: 'Música',         icono: '🎸' },
  { nombre: 'Cine',           icono: '🎬' },
  { nombre: 'Series',         icono: '📺' },
  { nombre: 'Cocinar',        icono: '🍳' },
  { nombre: 'Automóviles',    icono: '🚗' },
  { nombre: 'Juegos de Mesa', icono: '🎲' },
  { nombre: 'Moda',           icono: '👗' },
  { nombre: 'Shopping',       icono: '🛍️' },
  { nombre: 'Running',        icono: '🏃' },
  { nombre: 'Fiesta',         icono: '🎉' },
  { nombre: 'Leer',           icono: '📚' },
  { nombre: 'Bailar',         icono: '💃' },
  { nombre: 'Tenis',          icono: '🎾' },
  { nombre: 'Pádel',          icono: '🏸' },
  { nombre: 'Vóley',          icono: '🏐' },
  { nombre: 'Natación',       icono: '🏊' },
  { nombre: 'Disco',          icono: '🪩' },
  { nombre: 'Trekking',       icono: '🥾' },
  { nombre: 'Estudiar',       icono: '📖' },
  { nombre: 'Viajar',         icono: '✈️' },
  { nombre: 'Dibujar',        icono: '🎨' },
  { nombre: 'Karate',         icono: '🥋' },
  { nombre: 'Judo',           icono: '🤼' },
  { nombre: 'Boxeo',          icono: '🥊' },
];

export const obtenerIconoInteres = (nombreInteres) => {
  if (!nombreInteres) {
    return '🏷️';
  }

  for (const opcion of INTERESES_OPCIONES) {
    if (opcion.nombre === nombreInteres) {
      return opcion.icono;
    }
  }

  return '🏷️';
};

const esIconoInteresGenerico = (icono) => {
  if (!icono) {
    return true;
  }

  if (icono === '⭐') {
    return true;
  }

  if (icono === '🏷️') {
    return true;
  }

  return false;
};

export const normalizarInteresParaVista = (interes) => {
  let nombre = '';
  let icono = null;

  if (typeof interes === 'string') {
    nombre = interes;
  } else if (interes && interes.nombre) {
    nombre = interes.nombre;

    if (interes.icono) {
      icono = interes.icono;
    }
  }

  if (nombre) {
    const iconoDesdeMapa = obtenerIconoInteres(nombre);
    const iconoEsGenerico = esIconoInteresGenerico(icono);

    if (iconoEsGenerico) {
      icono = iconoDesdeMapa;
    }
  }

  if (!icono) {
    icono = '🏷️';
  }

  return {
    nombre: nombre,
    icono: icono,
  };
};

export const OPCIONES_FUMA = ['Sí', 'No', 'Ocasionalmente'];
export const OPCIONES_BEBE = ['Sí', 'No', 'Ocasionalmente'];
export const OPCIONES_MASCOTAS = ['Sí', 'No'];

export const buscarUniversidad = (universidades, texto) => {
  const query = (texto || '').trim().toLowerCase();
  if (!query) {
    return null;
  }
  return universidades.find((u) => {
    const porNombre = u.nombre.toLowerCase() === query;
    const porAbrev  = u.abreviacion.toLowerCase() === query;
    return porNombre || porAbrev;
  }) || null;
};

export const extraerDigitosTelefono = (telefono) => {
  return (telefono || '').replace(/\D/g, '');
};

export const validarTelefono9Digitos = (telefono) => {
  return extraerDigitosTelefono(telefono).length === 9;
};

export const validarFechaNacimiento = (fechaStr) => {
  if (!fechaStr) {
    return false;
  }
  const partes = fechaStr.split('-');
  if (partes.length !== 3) {
    return false;
  }
  const anio = Number(partes[0]);
  const mes  = Number(partes[1]);
  const dia  = Number(partes[2]);
  if (!anio || !mes || !dia) {
    return false;
  }
  const fecha = new Date(anio, mes - 1, dia);
  if (isNaN(fecha.getTime())) {
    return false;
  }
  const formatoValido = (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
  if (!formatoValido) {
    return false;
  }

  const min = obtenerFechaMinNacimiento();
  const max = obtenerFechaMaxNacimiento();
  if (fechaStr < min || fechaStr > max) {
    return false;
  }

  return true;
};

export const validarAnioIngreso = (valor) => {
  const texto = String(valor || '').trim();
  if (!/^\d{4}$/.test(texto)) {
    return false;
  }
  const anio = Number(texto);
  return anio >= ANIO_MIN_INGRESO && anio <= ANIO_ACTUAL;
};

export const normalizarFumaLegacy = (valor) => {
  if (valor === true) {
    return 'Sí';
  }
  if (valor === false) {
    return 'No';
  }
  if (valor === 'Ocasional') {
    return 'Ocasionalmente';
  }
  if (OPCIONES_FUMA.includes(valor)) {
    return valor;
  }
  return 'No';
};

export const normalizarBebeLegacy = (valor) => {
  if (valor === 'Nunca') {
    return 'No';
  }
  if (valor === 'Socialmente' || valor === 'Frecuente') {
    return 'Ocasionalmente';
  }
  if (OPCIONES_BEBE.includes(valor)) {
    return valor;
  }
  return 'No';
};

export const normalizarMascotasLegacy = (valor) => {
  if (valor === true) {
    return 'Sí';
  }
  if (valor === false) {
    return 'No';
  }
  if (OPCIONES_MASCOTAS.includes(valor)) {
    return valor;
  }
  return 'No';
};

export const perfilCompletarIncompleto = ({
  biografia,
  fotoPerfil,
  fotoPreview,
  interesesSeleccionados,
}) => {
  const sinBio = !(biografia || '').trim();
  const sinFoto = !fotoPerfil && !fotoPreview;
  const sinIntereses = !interesesSeleccionados || interesesSeleccionados.length === 0;
  return sinBio || sinFoto || sinIntereses;
};

export const buscarDireccionesNominatim = async (query) => {
  const texto = (query || '').trim();
  if (texto.length < 3) {
    return [];
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&countrycodes=cl&addressdetails=1&limit=5`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'es', 'User-Agent': 'Roomeet/1.0' },
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
};

const obtenerPreferenciasConvivencia = (perfil) => {
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

const extraerNombresInteresesPerfil = (perfil) => {
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

const obtenerNivelOrdenPerfil = (perfil) => {
  const pref = obtenerPreferenciasConvivencia(perfil);
  const valor = pref.nivel_orden;

  if (valor === null || valor === undefined) {
    return null;
  }

  return Number(valor);
};

const obtenerToleranciaRuidoPerfil = (perfil) => {
  const pref = obtenerPreferenciasConvivencia(perfil);
  let valor = pref.tolerancia_ruido;

  if (valor === null || valor === undefined) {
    valor = pref.nivel_ruido;
  }

  if (valor === null || valor === undefined) {
    return null;
  }

  return Number(valor);
};

const obtenerDatosAcademicosPerfil = (perfil) => {
  let universidad = '';
  let sede = '';
  let carrera = '';

  if (perfil && perfil.perfil_academico) {
    if (perfil.perfil_academico.universidad) {
      universidad = String(perfil.perfil_academico.universidad).toLowerCase().trim();
    }
    if (perfil.perfil_academico.sede) {
      sede = String(perfil.perfil_academico.sede).toLowerCase().trim();
    }
    if (perfil.perfil_academico.carrera) {
      carrera = String(perfil.perfil_academico.carrera).toLowerCase().trim();
    }
  }

  if (universidad.length === 0 && perfil && perfil.universidad) {
    universidad = String(perfil.universidad).toLowerCase().trim();
  }

  if (sede.length === 0 && perfil && perfil.sede) {
    sede = String(perfil.sede).toLowerCase().trim();
  }

  if (carrera.length === 0 && perfil && perfil.carrera) {
    carrera = String(perfil.carrera).toLowerCase().trim();
  }

  return {
    universidad: universidad,
    sede:        sede,
    carrera:     carrera,
  };
};

const obtenerFiltrosPerfil = (perfil) => {
  if (!perfil) {
    return {};
  }

  if (perfil.filtros) {
    return perfil.filtros;
  }

  return {};
};

const calcularPuntosHabitoTernario = (valorA, valorB) => {
  let textoA = '';
  if (valorA) {
    textoA = String(valorA);
  }

  let textoB = '';
  if (valorB) {
    textoB = String(valorB);
  }

  if (textoA.length === 0 || textoB.length === 0) {
    return 0;
  }

  if (textoA === textoB) {
    return 7;
  }

  let esOpuesto = false;

  if (textoA === 'Sí' && textoB === 'No') {
    esOpuesto = true;
  }

  if (textoA === 'No' && textoB === 'Sí') {
    esOpuesto = true;
  }

  if (esOpuesto) {
    return 0;
  }

  if (textoA === 'Ocasionalmente' || textoB === 'Ocasionalmente') {
    return 3;
  }

  return 0;
};

const calcularPuntosPorDiferenciaEscala = (diferencia) => {
  if (diferencia === 0) {
    return 8;
  }

  if (diferencia === 1) {
    return 5;
  }

  if (diferencia === 2) {
    return 2;
  }

  return 0;
};

export const calcularAfinidad = (perfilA, perfilB) => {
  const prefA = obtenerPreferenciasConvivencia(perfilA);
  const prefB = obtenerPreferenciasConvivencia(perfilB);
  const acadA = obtenerDatosAcademicosPerfil(perfilA);
  const acadB = obtenerDatosAcademicosPerfil(perfilB);
  const filtrosA = obtenerFiltrosPerfil(perfilA);

  if (filtrosA.soloMismaUniversidad === true) {
    if (acadA.universidad.length === 0 || acadB.universidad.length === 0) {
      return 0;
    }

    if (acadA.universidad !== acadB.universidad) {
      return 0;
    }
  }

  if (filtrosA.soloMismaCarrera === true) {
    if (acadA.carrera.length === 0 || acadB.carrera.length === 0) {
      return 0;
    }

    if (acadA.carrera !== acadB.carrera) {
      return 0;
    }
  }

  let puntajeTotal = 20;
  let puntajeAcademico = 0;
  let puntajeHabitos = 0;
  let puntajeConvivencia = 0;
  let puntajeIntereses = 0;

  if (acadA.universidad.length > 0 && acadB.universidad.length > 0) {
    if (acadA.universidad === acadB.universidad) {
      puntajeAcademico = puntajeAcademico + 10;
    }
  }

  if (acadA.sede.length > 0 && acadB.sede.length > 0) {
    if (acadA.sede === acadB.sede) {
      puntajeAcademico = puntajeAcademico + 6;
    }
  }

  if (acadA.carrera.length > 0 && acadB.carrera.length > 0) {
    if (acadA.carrera === acadB.carrera) {
      puntajeAcademico = puntajeAcademico + 4;
    }
  }

  if (puntajeAcademico > 20) {
    puntajeAcademico = 20;
  }

  let fumaA = '';
  if (prefA.fuma) {
    fumaA = String(prefA.fuma);
  }

  let fumaB = '';
  if (prefB.fuma) {
    fumaB = String(prefB.fuma);
  }

  const puntosFuma = calcularPuntosHabitoTernario(fumaA, fumaB);
  puntajeHabitos = puntajeHabitos + puntosFuma;

  let bebeA = prefA.bebe_alcohol ?? prefA.bebeAlcohol ?? null;
  let bebeB = prefB.bebe_alcohol ?? prefB.bebeAlcohol ?? null;

  let bebeAStr = '';
  if (bebeA) {
    bebeAStr = String(bebeA);
  }

  let bebeBStr = '';
  if (bebeB) {
    bebeBStr = String(bebeB);
  }

  const puntosBebe = calcularPuntosHabitoTernario(bebeAStr, bebeBStr);
  puntajeHabitos = puntajeHabitos + puntosBebe;

  let mascotasA = prefA.mascotas ?? prefA.acepta_mascotas ?? null;
  let mascotasB = prefB.mascotas ?? prefB.acepta_mascotas ?? null;

  let mascotasAStr = '';
  if (mascotasA) {
    mascotasAStr = String(mascotasA);
  }

  let mascotasBStr = '';
  if (mascotasB) {
    mascotasBStr = String(mascotasB);
  }

  let puntosMascotas = 0;

  if (mascotasAStr.length > 0 && mascotasBStr.length > 0) {
    if (mascotasAStr === mascotasBStr) {
      puntosMascotas = 7;
    }
  }

  puntajeHabitos = puntajeHabitos + puntosMascotas;

  if (puntajeHabitos > 21) {
    puntajeHabitos = 21;
  }

  const nivelOrdenA = obtenerNivelOrdenPerfil(perfilA);
  const nivelOrdenB = obtenerNivelOrdenPerfil(perfilB);

  if (nivelOrdenA !== null && nivelOrdenB !== null) {
    const diferenciaOrden = Math.abs(nivelOrdenA - nivelOrdenB);
    const puntosOrden = calcularPuntosPorDiferenciaEscala(diferenciaOrden);
    puntajeConvivencia = puntajeConvivencia + puntosOrden;
  }

  const toleranciaRuidoA = obtenerToleranciaRuidoPerfil(perfilA);
  const toleranciaRuidoB = obtenerToleranciaRuidoPerfil(perfilB);

  if (toleranciaRuidoA !== null && toleranciaRuidoB !== null) {
    const diferenciaRuido = Math.abs(toleranciaRuidoA - toleranciaRuidoB);
    const puntosRuido = calcularPuntosPorDiferenciaEscala(diferenciaRuido);
    puntajeConvivencia = puntajeConvivencia + puntosRuido;
  }

  let horarioA = '';
  if (prefA.horario_preferido) {
    horarioA = String(prefA.horario_preferido);
  } else if (prefA.horarioPreferido) {
    horarioA = String(prefA.horarioPreferido);
  }

  let horarioB = '';
  if (prefB.horario_preferido) {
    horarioB = String(prefB.horario_preferido);
  } else if (prefB.horarioPreferido) {
    horarioB = String(prefB.horarioPreferido);
  }

  let horarioCompatible = false;

  if (horarioA.length > 0 && horarioB.length > 0) {
    if (horarioA === horarioB) {
      horarioCompatible = true;
    }
  }

  if (horarioA === 'Indiferente') {
    horarioCompatible = true;
  }

  if (horarioB === 'Indiferente') {
    horarioCompatible = true;
  }

  if (horarioCompatible) {
    puntajeConvivencia = puntajeConvivencia + 8;
  }

  if (puntajeConvivencia > 24) {
    puntajeConvivencia = 24;
  }

  const interesesA = extraerNombresInteresesPerfil(perfilA);
  const interesesB = extraerNombresInteresesPerfil(perfilB);
  let cantidadCompartidos = 0;

  for (let i = 0; i < interesesA.length; i++) {
    const interesActual = interesesA[i];
    let encontrado = false;

    for (let j = 0; j < interesesB.length; j++) {
      const otroInteres = interesesB[j];

      if (interesActual === otroInteres) {
        encontrado = true;
        break;
      }
    }

    if (encontrado) {
      cantidadCompartidos = cantidadCompartidos + 1;
    }
  }

  puntajeIntereses = cantidadCompartidos * 5;

  if (puntajeIntereses > 15) {
    puntajeIntereses = 15;
  }

  puntajeTotal = puntajeTotal + puntajeAcademico;
  puntajeTotal = puntajeTotal + puntajeHabitos;
  puntajeTotal = puntajeTotal + puntajeConvivencia;
  puntajeTotal = puntajeTotal + puntajeIntereses;

  if (puntajeTotal > 100) {
    puntajeTotal = 100;
  }

  if (puntajeTotal < 0) {
    puntajeTotal = 0;
  }

  return Math.round(puntajeTotal);
};
