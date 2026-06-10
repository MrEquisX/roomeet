export { universidadesChile } from '../../../backend/scripts/sedes_nacionales.mjs';

export const API_BASE = 'http://localhost:3000';

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

export const calcularAfinidad = (perfilA, perfilB) => {
  let puntaje = 0;

  const prefA = obtenerPreferenciasConvivencia(perfilA);
  const prefB = obtenerPreferenciasConvivencia(perfilB);

  const fumaA = prefA.fuma;
  const fumaB = prefB.fuma;
  if (fumaA && fumaB && fumaA === fumaB) {
    puntaje = puntaje + 10;
  }

  const bebeA = prefA.bebe_alcohol ?? prefA.bebeAlcohol ?? null;
  const bebeB = prefB.bebe_alcohol ?? prefB.bebeAlcohol ?? null;
  if (bebeA && bebeB && bebeA === bebeB) {
    puntaje = puntaje + 10;
  }

  const mascotasA = prefA.mascotas ?? prefA.acepta_mascotas ?? null;
  const mascotasB = prefB.mascotas ?? prefB.acepta_mascotas ?? null;
  if (mascotasA && mascotasB && mascotasA === mascotasB) {
    puntaje = puntaje + 10;
  }

  const nivelOrdenA = obtenerNivelOrdenPerfil(perfilA);
  const nivelOrdenB = obtenerNivelOrdenPerfil(perfilB);

  if (nivelOrdenA !== null && nivelOrdenB !== null) {
    const diferenciaOrden = Math.abs(nivelOrdenA - nivelOrdenB);
    if (diferenciaOrden <= 1) {
      puntaje = puntaje + 15;
    }
  }

  const toleranciaRuidoA = obtenerToleranciaRuidoPerfil(perfilA);
  const toleranciaRuidoB = obtenerToleranciaRuidoPerfil(perfilB);

  if (toleranciaRuidoA !== null && toleranciaRuidoB !== null) {
    const diferenciaRuido = Math.abs(toleranciaRuidoA - toleranciaRuidoB);
    if (diferenciaRuido <= 1) {
      puntaje = puntaje + 15;
    }
  }

  const interesesA = extraerNombresInteresesPerfil(perfilA);
  const interesesB = extraerNombresInteresesPerfil(perfilB);
  const interesesCompartidos = [];

  for (const interes of interesesA) {
    let estaEnB = false;

    for (const otro of interesesB) {
      if (interes === otro) {
        estaEnB = true;
        break;
      }
    }

    if (estaEnB) {
      interesesCompartidos.push(interes);
    }
  }

  const cantidadCompartidos = interesesCompartidos.length;
  let puntosIntereses = cantidadCompartidos * 8;

  if (puntosIntereses > 40) {
    puntosIntereses = 40;
  }

  puntaje = puntaje + puntosIntereses;

  return Math.round(puntaje);
};
