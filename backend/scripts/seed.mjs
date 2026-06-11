/**
 * seed.mjs
 * Genera 1000 perfiles estudiantiles realistas para ROOMEET.
 * Ejecutar desde /backend: node scripts/seed.mjs
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { fakerES as faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const require = createRequire(import.meta.url);
const Usuario     = require('../src/models/Usuario.js');
const Alojamiento = require('../src/models/Alojamiento.js');

import { universidadesChile } from './sedes_nacionales.mjs';

// ─── Constantes globales ──────────────────────────────────────────────────────

const TOTAL_PERFILES     = 1000;
const PORCENTAJE_VIVIENDA = 0.40;
const CANTIDAD_CON_VIVIENDA = Math.floor(TOTAL_PERFILES * PORCENTAJE_VIVIENDA);
const PASSWORD_PLANO = 'Password123!';

const INTERESES = [
  'Fútbol',
  'Gym',
  'Videojuegos',
  'Básquet',
  'Música',
  'Cine',
  'Series',
  'Cocinar',
  'Automóviles',
  'Juegos de Mesa',
  'Moda',
  'Shopping',
  'Running',
  'Fiesta',
  'Leer',
  'Bailar',
  'Tenis',
  'Pádel',
  'Vóley',
  'Natación',
  'Disco',
  'Trekking',
  'Estudiar',
  'Viajar',
  'Dibujar',
  'Karate',
  'Judo',
  'Boxeo',
];

const AMENIDADES = [
  'Internet',
  'TV',
  'Cocina Equipada',
  'Lavadora',
  'Ascensor',
  'Conserjería 24/7',
  'Gimnasio',
  'Estacionamiento',
  'Calefacción',
  'Ventilador / AC',
];

const TIPOS_PROPIEDAD = ['Departamento', 'Casa'];

const ESTADOS_AMOBLADO = [
  'Amoblado Completo',
  'Semi Amoblado (Solo espacios comunes)',
  'Sin Amoblar',
];

const GASTOS_COMUNES = [
  'Incluidos en el precio',
  'No incluidos (se dividen entre roomies)',
];

const TIPOS_BANO = [
  'Privado (Dentro de la pieza)',
  'Público/Compartido (Fuera de la pieza)',
];

const HORARIOS = ['Diurno', 'Nocturno', 'Indiferente'];

const FRASES_BIO_BUSCADOR = [
  'Estudio {carrera} en {universidad} y busco un lugar tranquilo para rendir bien durante el semestre.',
  'Soy de {ciudad} y me mudé a estudiar {carrera}; me interesa convivir con gente ordenada y respetuosa.',
  'Me gusta {interes1} y {interes2}, pero en la casa priorizo un ambiente de estudio y buena comunicación.',
  'Busco roomie para dividir gastos cerca de mi campus; soy responsable con los pagos y la limpieza.',
  'Soy estudiante de {carrera}, tranquilo/a y sociable en la medida justa; me adapto bien a las reglas de convivencia.',
  'Quiero un hogar universitario donde se respeten los horarios de descanso y se compartan las tareas del hogar.',
  'Llegué a {ciudad} por la {universidad} y busco compañeros/as de piso con hábitos sanos y buena onda.',
];

const FRASES_BIO_ANFITRION = [
  'Tengo una vivienda disponible cerca de {universidad} y busco un compañero/a de piso para {carrera} o carreras afines.',
  'Ofrezco habitación en {ciudad}; la casa es cómoda, con buena conectividad y ambiente estudiantil.',
  'Soy anfitrión/a en ROOMEET: me gusta {interes1}, mantengo la casa ordenada y valoro el respeto mutuo.',
  'Arriendo pieza en sector cercano al campus; ideal para quien estudia {carrera} y busca un espacio estable.',
  'Comparto departamento en {ciudad}; busco roomie responsable, sin dramas y con gusto por convivir bien.',
];

const TITULOS_VIVIENDA = [
  'Habitación luminosa cerca del campus',
  'Pieza amplia en departamento estudiantil',
  'Arriendo de habitación en casa familiar',
  'Departamento compartido para universitarios',
  'Pieza con baño privado en sector tranquilo',
  'Habitación en casa con patio y buena ubicación',
  'Espacio ideal para estudiantes de día',
  'Pieza disponible a pasos de locomoción',
];

const DESCRIPCIONES_VIVIENDA = [
  'La vivienda está ubicada en un sector residencial con buena conectividad. Ideal para estudiantes que buscan tranquilidad y cercanía al transporte público.',
  'Espacio cómodo para estudiar, con áreas comunes ordenadas y ambiente respetuoso. Se prioriza la convivencia sana entre roomies.',
  'Casa habitada por estudiantes con buena onda; se comparten gastos básicos y se mantienen horarios de descanso razonables.',
  'Departamento seguro y bien iluminado, perfecto para quienes necesitan un lugar estable durante la carrera universitaria.',
  'La pieza cuenta con buena ventilación y acceso a servicios básicos. El barrio es tranquilo y familiar.',
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function generarTelefonoCL() {
  const sufijo = faker.number.int({ min: 10000000, max: 99999999 });
  return `+569${sufijo}`;
}

function elegirAleatorios(arreglo, min, max) {
  const cantidad  = faker.number.int({ min: min, max: max });
  const copia     = [...arreglo];
  const resultado = [];

  for (let k = 0; k < cantidad; k++) {
    if (copia.length === 0) {
      break;
    }
    const indice  = faker.number.int({ min: 0, max: copia.length - 1 });
    const elegido = copia[indice];
    resultado.push(elegido);
    copia.splice(indice, 1);
  }

  return resultado;
}

function generarIndicesConVivienda(total, cantidad) {
  const indices = new Set();

  while (indices.size < cantidad) {
    const candidato = faker.number.int({ min: 0, max: total - 1 });
    indices.add(candidato);
  }

  return indices;
}

function generarListaGenerosEquilibrada(total) {
  const lista = [];
  const mitad = Math.floor(total / 2);

  for (let i = 0; i < mitad; i++) {
    lista.push('male');
  }
  for (let i = 0; i < total - mitad; i++) {
    lista.push('female');
  }

  // Mezclar para que no queden todos los hombres al inicio
  for (let i = lista.length - 1; i > 0; i--) {
    const j = faker.number.int({ min: 0, max: i });
    const temp = lista[i];
    lista[i] = lista[j];
    lista[j] = temp;
  }

  return lista;
}

function obtenerSexoBiologico(generoFaker) {
  let sexo = 'Femenino';

  if (generoFaker === 'male') {
    sexo = 'Masculino';
  }

  return sexo;
}

function obtenerFotoPerfil(generoFaker, indiceUnico) {
  let carpeta = 'women';

  if (generoFaker === 'male') {
    carpeta = 'men';
  }

  const numeroFoto = (indiceUnico % 99) + 1;
  const url = `https://randomuser.me/api/portraits/${carpeta}/${numeroFoto}.jpg`;

  return url;
}

function generarFechaNacimientoUniversitaria() {
  const fecha = faker.date.birthdate({ min: 18, max: 29, mode: 'age' });
  return fecha;
}

function generarBiografia(opciones) {
  const carrera      = opciones.carrera;
  const universidad  = opciones.universidad;
  const ciudad       = opciones.ciudad;
  const interes1     = opciones.interes1;
  const interes2     = opciones.interes2;
  const esAnfitrion  = opciones.esAnfitrion;

  let plantillas = FRASES_BIO_BUSCADOR;

  if (esAnfitrion) {
    plantillas = FRASES_BIO_ANFITRION;
  }

  const plantillaElegida = faker.helpers.arrayElement(plantillas);
  const segundaPlantilla   = faker.helpers.arrayElement(plantillas);

  let bio = plantillaElegida;
  bio = bio.replace('{carrera}', carrera);
  bio = bio.replace('{universidad}', universidad);
  bio = bio.replace('{ciudad}', ciudad);
  bio = bio.replace('{interes1}', interes1);
  bio = bio.replace('{interes2}', interes2);

  let bioExtra = segundaPlantilla;
  bioExtra = bioExtra.replace('{carrera}', carrera);
  bioExtra = bioExtra.replace('{universidad}', universidad);
  bioExtra = bioExtra.replace('{ciudad}', ciudad);
  bioExtra = bioExtra.replace('{interes1}', interes1);
  bioExtra = bioExtra.replace('{interes2}', interes2);

  const biografiaFinal = `${bio} ${bioExtra}`;

  return biografiaFinal;
}

function generarCoordenadasCercanas(latBase, lngBase) {
  const deltaLat = (faker.number.float({ min: -0.03, max: 0.03, fractionDigits: 6 }));
  const deltaLng = (faker.number.float({ min: -0.03, max: 0.03, fractionDigits: 6 }));

  const latitud  = Number((latBase + deltaLat).toFixed(6));
  const longitud = Number((lngBase + deltaLng).toFixed(6));

  return { latitud, longitud };
}

function generarImagenesVivienda(prefijoSemilla, cantidad) {
  const imagenes = [];

  for (let i = 0; i < cantidad; i++) {
    const semilla = `${prefijoSemilla}-foto-${i + 1}`;
    const url = `https://picsum.photos/seed/${semilla}/800/600`;
    imagenes.push(url);
  }

  return imagenes;
}

function construirHabitacionesOfrecidas(cantidadHabitaciones) {
  const habitaciones = [];

  for (let h = 0; h < cantidadHabitaciones; h++) {
    const precio   = faker.number.int({ min: 120000, max: 380000 });
    const tipoBano = faker.helpers.arrayElement(TIPOS_BANO);

    const habitacion = {
      precio:   precio,
      tipoBano: tipoBano,
    };

    habitaciones.push(habitacion);
  }

  return habitaciones;
}

function construirAlojamiento(anfitrion, sedeElegida, indiceGlobal) {
  const titulo        = faker.helpers.arrayElement(TITULOS_VIVIENDA);
  const descripcion   = faker.helpers.arrayElement(DESCRIPCIONES_VIVIENDA);
  const tipoPropiedad = faker.helpers.arrayElement(TIPOS_PROPIEDAD);
  const amoblado      = faker.helpers.arrayElement(ESTADOS_AMOBLADO);
  const gastosComunes = faker.helpers.arrayElement(GASTOS_COMUNES);

  const calle    = faker.location.street();
  const numero   = faker.number.int({ min: 100, max: 4500 });
  const sector   = `${calle} ${numero}, ${sedeElegida.comuna}`;
  const comuna   = sedeElegida.comuna;

  const coords         = generarCoordenadasCercanas(sedeElegida.lat, sedeElegida.lng);
  const habitacionesTotales  = faker.number.int({ min: 2, max: 5 });
  const habitantesActuales   = faker.number.int({ min: 1, max: habitacionesTotales - 1 });
  const habitacionesDisponibles = habitacionesTotales - habitantesActuales;

  const habitacionesOfrecidas = construirHabitacionesOfrecidas(habitacionesDisponibles);
  const caracteristicas       = elegirAleatorios(AMENIDADES, 3, 7);
  const cantidadFotos         = faker.number.int({ min: 3, max: 5 });
  const imagenes              = generarImagenesVivienda(`vivienda-${indiceGlobal}`, cantidadFotos);

  const alojamiento = {
    id_anfitrion:          anfitrion._id,
    titulo:                titulo,
    descripcion:           descripcion,
    tipoPropiedad:         tipoPropiedad,
    amoblado:              amoblado,
    sector:                sector,
    comuna:                comuna,
    latitud:               coords.latitud,
    longitud:              coords.longitud,
    gastosComunes:         gastosComunes,
    locomocion:            'Micro y buses urbanos a menos de 10 minutos caminando.',
    habitacionesTotales:   habitacionesTotales,
    habitantesActuales:    habitantesActuales,
    habitacionesOfrecidas: habitacionesOfrecidas,
    caracteristicas:       caracteristicas,
    imagenes:              imagenes,
  };

  return alojamiento;
}

function construirPerfil(opciones) {
  const hashedPassword = opciones.hashedPassword;
  const generoFaker    = opciones.generoFaker;
  const indiceGlobal   = opciones.indiceGlobal;
  const tendraVivienda = opciones.tendraVivienda;

  const nombre   = faker.person.firstName(generoFaker);
  const apellido = faker.person.lastName();

  const sufijo       = faker.number.int({ min: 1, max: 99999 });
  const nombreNorm   = normalizarTexto(nombre);
  const apellidoNorm = normalizarTexto(apellido);
  const email        = `${nombreNorm}.${apellidoNorm}${sufijo}@roomeet.cl`;

  const universidadElegida = faker.helpers.arrayElement(universidadesChile);
  const sedeElegida        = faker.helpers.arrayElement(universidadElegida.sedes);
  const carreraElegida     = faker.helpers.arrayElement(universidadElegida.carreras);

  const direccionSede = `${sedeElegida.nombre}, ${sedeElegida.comuna}, Chile`;
  const fotoUrl       = obtenerFotoPerfil(generoFaker, indiceGlobal);
  const sexoBiologico = obtenerSexoBiologico(generoFaker);

  const nivelOrden       = faker.number.int({ min: 1, max: 5 });
  const nivelRuido       = faker.number.int({ min: 1, max: 5 });
  const fuma             = faker.helpers.arrayElement(['Sí', 'No', 'Ocasionalmente']);
  const mascotas         = faker.helpers.arrayElement(['Sí', 'No']);
  const bebeAlcohol      = faker.helpers.arrayElement(['Sí', 'No', 'Ocasionalmente']);
  const horarioPreferido = faker.helpers.arrayElement(HORARIOS);

  const preferencias = {
    fuma:              fuma,
    mascotas:          mascotas,
    nivel_orden:       nivelOrden,
    nivel_ruido:       nivelRuido,
    bebe_alcohol:      bebeAlcohol,
    horario_preferido: horarioPreferido,
  };

  const interesesUsuario = elegirAleatorios(INTERESES, 3, 5);
  const interes1 = interesesUsuario[0] || 'Estudiar';
  const interes2 = interesesUsuario[1] || 'Música';

  let rolUsuario = 'Buscador';

  if (tendraVivienda) {
    rolUsuario = 'Anfitrion';
  }

  const anioIngreso = faker.number.int({ min: 2018, max: 2025 });

  const biografia = generarBiografia({
    carrera:     carreraElegida,
    universidad: universidadElegida.nombre,
    ciudad:      sedeElegida.comuna,
    interes1:    interes1,
    interes2:    interes2,
    esAnfitrion: tendraVivienda,
  });

  const perfil = {
    nombre_completo:  `${nombre} ${apellido}`,
    email:            email,
    password:         hashedPassword,
    emailVerificado:  true,
    telefono:         generarTelefonoCL(),
    bio:              biografia,
    foto_perfil:      fotoUrl,
    fecha_nacimiento: generarFechaNacimientoUniversitaria(),
    sexo_biologico:   sexoBiologico,
    identidad_genero: '',
    perfil_academico: {
      universidad:  universidadElegida.nombre,
      carrera:      carreraElegida,
      sede:         sedeElegida.nombre,
      anio_ingreso: anioIngreso,
    },
    ubicacion_sede: {
      latitud:   sedeElegida.lat,
      longitud:  sedeElegida.lng,
      direccion: direccionSede,
    },
    preferencias_convivencia: preferencias,
    intereses:                interesesUsuario,
    rol:                      rolUsuario,
    filtros: {
      soloMismaUniversidad: faker.datatype.boolean({ probability: 0.15 }),
      soloMismaCarrera:     faker.datatype.boolean({ probability: 0.10 }),
      generoPreferido:      faker.helpers.arrayElement(['Indiferente', 'Masculino', 'Femenino', 'Indiferente']),
    },
    alojamientoId: null,
    _meta: {
      tendraVivienda: tendraVivienda,
      sedeElegida:    sedeElegida,
      indiceGlobal:   indiceGlobal,
    },
  };

  return perfil;
}

// ─── Función principal ────────────────────────────────────────────────────────

async function generarPerfiles(cantidad) {
  console.log('🔌 Conectando a MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está definido en backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa.');

    console.log('🧹 Limpiando colecciones anteriores...');
    const eliminadosUsuarios = await Usuario.deleteMany({});
    const eliminadosAlojamientos = await Alojamiento.deleteMany({});
    console.log(`   → ${eliminadosUsuarios.deletedCount} usuarios eliminados.`);
    console.log(`   → ${eliminadosAlojamientos.deletedCount} alojamientos eliminados.`);

    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash(PASSWORD_PLANO, 10);

    const indicesConVivienda = generarIndicesConVivienda(cantidad, CANTIDAD_CON_VIVIENDA);
    const listaGeneros       = generarListaGenerosEquilibrada(cantidad);

    console.log(`🌱 Construyendo ${cantidad} perfiles (${CANTIDAD_CON_VIVIENDA} con vivienda, ${cantidad - CANTIDAD_CON_VIVIENDA} buscadores)...`);

    const perfilesEnMemoria = [];

    for (let i = 0; i < cantidad; i++) {
      let tendraVivienda = false;

      if (indicesConVivienda.has(i)) {
        tendraVivienda = true;
      }

      const generoFaker = listaGeneros[i];

      const perfil = construirPerfil({
        hashedPassword: hashedPassword,
        generoFaker:    generoFaker,
        indiceGlobal:   i,
        tendraVivienda: tendraVivienda,
      });

      perfilesEnMemoria.push(perfil);
    }

    console.log('💾 Insertando usuarios en lotes...');

    const TAMANO_LOTE = 100;
    const usuariosInsertados = [];

    for (let inicio = 0; inicio < perfilesEnMemoria.length; inicio += TAMANO_LOTE) {
      const fin  = inicio + TAMANO_LOTE;
      const lote = perfilesEnMemoria.slice(inicio, fin);

      const documentosLote = [];

      for (let j = 0; j < lote.length; j++) {
        const perfilCrudo = lote[j];
        const documento = { ...perfilCrudo };
        delete documento._meta;
        documentosLote.push(documento);
      }

      const insertados = await Usuario.insertMany(documentosLote, { ordered: false });

      for (let k = 0; k < insertados.length; k++) {
        const usuarioDoc = insertados[k];
        const indiceReal = inicio + k;
        const meta = perfilesEnMemoria[indiceReal]._meta;

        usuariosInsertados.push({
          usuario: usuarioDoc,
          meta:    meta,
        });
      }

      console.log(`   → Lote ${inicio + 1}-${Math.min(fin, cantidad)} insertado.`);
    }

    console.log('🏠 Creando alojamientos para anfitriones...');

    const alojamientosParaInsertar = [];
    const vinculosAnfitrion = [];

    for (let m = 0; m < usuariosInsertados.length; m++) {
      const entrada = usuariosInsertados[m];
      const usuario = entrada.usuario;
      const meta    = entrada.meta;

      if (!meta.tendraVivienda) {
        continue;
      }

      const alojamientoDoc = construirAlojamiento(usuario, meta.sedeElegida, meta.indiceGlobal);
      alojamientosParaInsertar.push(alojamientoDoc);
      vinculosAnfitrion.push(usuario._id);
    }

    let alojamientosCreados = 0;

    if (alojamientosParaInsertar.length > 0) {
      const alojamientosInsertados = await Alojamiento.insertMany(alojamientosParaInsertar, { ordered: false });
      alojamientosCreados = alojamientosInsertados.length;

      for (let n = 0; n < alojamientosInsertados.length; n++) {
        const alojamiento = alojamientosInsertados[n];
        const anfitrionId = vinculosAnfitrion[n];

        await Usuario.updateOne(
          { _id: anfitrionId },
          {
            $set: {
              alojamientoId: alojamiento._id,
              rol:           'Anfitrion',
            },
          }
        );
      }
    }

    const buscadores = cantidad - alojamientosCreados;

    console.log('');
    console.log('✅ Siembra completada con éxito.');
    console.log(`   → ${cantidad} estudiantes creados.`);
    console.log(`   → ${alojamientosCreados} viviendas publicadas (~${Math.round(PORCENTAJE_VIVIENDA * 100)}%).`);
    console.log(`   → ${buscadores} buscadores sin vivienda (~${100 - Math.round(PORCENTAJE_VIVIENDA * 100)}%).`);
    console.log(`   → Contraseña de todos los perfiles: ${PASSWORD_PLANO}`);
    console.log('');

    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la siembra:');
    console.error(error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }

    await mongoose.disconnect();
    process.exit(1);
  }
}

// ─── Punto de entrada ─────────────────────────────────────────────────────────

generarPerfiles(TOTAL_PERFILES);
