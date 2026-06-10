/**
 * seed.mjs
 * Genera 40 usuarios de prueba para ROOMEET.
 * Todos los campos coinciden exactamente con el esquema de Usuario.js.
 * Ejecutar desde /backend: node scripts/seed.mjs
 */

import mongoose from 'mongoose';
import bcrypt    from 'bcrypt';
import { faker } from '@faker-js/faker/locale/es';
import dotenv    from 'dotenv';
import path      from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import Usuario              from '../src/models/Usuario.js';
import { universidadesChile } from './sedes_nacionales.mjs';

// ─── Catálogos estáticos ──────────────────────────────────────────────────────

/** Lista oficial — debe coincidir con INTERESES_OPCIONES en perfilHelpers.js */
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

const ROLES = ['Buscador', 'Anfitrion'];

const SEXOS = ['Masculino', 'Femenino', 'Otro'];

const NIVELES_ALCOHOL = ['Nunca', 'Socialmente', 'Frecuente'];

const DIETAS = ['Omnívoro', 'Vegetariano', 'Vegano', 'Indiferente'];

const HORARIOS = ['Diurno', 'Nocturno', 'Indiferente'];

// ─── Funciones utilitarias ────────────────────────────────────────────────────

/**
 * Genera un número de teléfono celular chileno realista.
 * Formato: +569XXXXXXXX
 */
function generarTelefonoCL() {
  const sufijo = faker.number.int({ min: 10000000, max: 99999999 });
  return `+569${sufijo}`;
}

/**
 * Extrae N elementos aleatorios sin repetición de un arreglo.
 * Nunca usa ternarios comprimidos ni bucles en una sola línea.
 */
function elegirAleatorios(arreglo, min, max) {
  const cantidad = faker.number.int({ min: min, max: max });
  const copia    = [...arreglo];
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

/**
 * Construye el objeto de datos de un perfil de usuario completo.
 * Sigue estrictamente la jerarquía:
 *   universidadElegida → sedeElegida (para coordenadas)
 *   universidadElegida → carreraElegida (las carreras son del nivel universidad)
 */
function construirPerfil(hashedPassword) {
  // ── Género base — determina nombre, foto y sexo_biologico ─────────────────
  // Se elige primero para que todo el perfil sea internamente consistente.
  const genero   = faker.helpers.arrayElement(['male', 'female']);
  const nombre   = faker.person.firstName(genero);
  const apellido = faker.person.lastName();

  // ── Email único: nombre.apellidoNNN@ejemplo.cl ────────────────────────────
  const sufijo          = faker.number.int({ min: 1, max: 9999 });
  const nombreNorm      = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const apellidoNorm    = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const emailGenerado   = `${nombreNorm}.${apellidoNorm}${sufijo}@roomeet.cl`;

  // ── Jerarquía: Universidad → Sede (coords) + Carrera ─────────────────────
  // Las carreras están en universidadElegida.carreras (NO en la sede)
  const universidadElegida = faker.helpers.arrayElement(universidadesChile);
  const sedeElegida        = faker.helpers.arrayElement(universidadElegida.sedes);
  const carreraElegida     = faker.helpers.arrayElement(universidadElegida.carreras);

  // ── Dirección textual compuesta ───────────────────────────────────────────
  const direccionSede = `${sedeElegida.nombre}, ${sedeElegida.comuna}, Chile`;

  // ── Foto de perfil — randomuser.me, rostros jóvenes coherentes con género ──
  let carpetaFoto = 'women';
  if (genero === 'male') {
    carpetaFoto = 'men';
  }
  const numeroFoto = faker.number.int({ min: 1, max: 50 });
  const fotoUrl    = `https://randomuser.me/api/portraits/${carpetaFoto}/${numeroFoto}.jpg`;

  // ── sexo_biologico alineado con el género usado para nombre y foto ────────
  let sexoBiologico = 'Femenino';
  if (genero === 'male') {
    sexoBiologico = 'Masculino';
  }

  // ── Preferencias de convivencia (todos los campos del sub-esquema) ────────
  const nivelOrden           = faker.number.int({ min: 1, max: 5 });
  const nivelRuido           = faker.number.int({ min: 1, max: 5 });
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

  // ── Intereses: exactamente 5 de la lista oficial, sin repetición ─────────
  const interesesUsuario = elegirAleatorios(INTERESES, 5, 5);

  // ── Rol y año de ingreso ──────────────────────────────────────────────────
  const rolUsuario   = faker.helpers.arrayElement(ROLES);
  const anioIngreso  = faker.number.int({ min: 2018, max: 2025 });

  // ── Objeto de perfil completo ─────────────────────────────────────────────
  const perfil = {
    // Identidad y autenticación
    nombre_completo:  `${nombre} ${apellido}`,
    email:            emailGenerado,
    password:         hashedPassword,
    emailVerificado:  true,

    // Datos personales
    telefono:         generarTelefonoCL(),
    bio:              faker.lorem.sentences(2),
    foto_perfil:      fotoUrl,
    fecha_nacimiento: faker.date.birthdate({ min: 18, max: 28, mode: 'age' }),
    sexo_biologico:   sexoBiologico,
    identidad_genero: '',

    // Perfil académico — campos exactos del perfilAcademicoSchema
    perfil_academico: {
      universidad:  universidadElegida.nombre,
      carrera:      carreraElegida,
      sede:         sedeElegida.nombre,
      anio_ingreso: anioIngreso,
    },

    // Ubicación de la sede — latitud y longitud vienen de sedes_nacionales.js
    ubicacion_sede: {
      latitud:   sedeElegida.lat,
      longitud:  sedeElegida.lng,
      direccion: direccionSede,
    },

    // Preferencias de convivencia
    preferencias_convivencia: preferencias,

    // Intereses y rol
    intereses: interesesUsuario,
    rol:       rolUsuario,

    // Filtros de búsqueda (valores por defecto)
    filtros: {
      soloMismaUniversidad: false,
      soloMismaCarrera:     false,
      generoPreferido:      'Indiferente',
    },
  };

  return perfil;
}

// ─── Función principal ────────────────────────────────────────────────────────

async function generarPerfiles(cantidad) {
  console.log('🔌 Conectando a MongoDB...');

  try {
    // await mongoose.connect(process.env.MONGODB_URI);
    // Reconectar a la base de datos de ROOMEET mañana
    await mongoose.connect('mongodb://alimarichapa_db_user:2FEpeIuZYajBbS0r@ac-i7u2zkl-shard-00-00.a8nicra.mongodb.net:27017,ac-i7u2zkl-shard-00-01.a8nicra.mongodb.net:27017,ac-i7u2zkl-shard-00-02.a8nicra.mongodb.net:27017/?ssl=true&replicaSet=atlas-u2d185-shard-0&authSource=admin&appName=RoomeetCluster');
    console.log('✅ Conexión exitosa.');

    // 1. Limpiar la colección para evitar acumulación de datos basura
    console.log('🧹 Limpiando usuarios anteriores...');
    const eliminados = await Usuario.deleteMany({});
    console.log(`✅ ${eliminados.deletedCount} usuarios eliminados.`);

    // 2. Generar hash reutilizable para todos los perfiles (eficiencia)
    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 3. Construir los perfiles en memoria
    console.log(`🌱 Construyendo ${cantidad} perfiles...`);
    const perfilesFalsos = [];

    for (let i = 0; i < cantidad; i++) {
      const perfil = construirPerfil(hashedPassword);
      perfilesFalsos.push(perfil);
    }

    // 4. Insertar en lote con ordered:false para tolerar emails duplicados
    const resultado = await Usuario.insertMany(perfilesFalsos, { ordered: false });
    console.log(`✅ ¡Éxito! ${resultado.length} estudiantes de todo Chile insertados en ROOMEET.`);

    // 5. Cerrar conexión limpiamente
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la siembra:');
    console.error(error.message || error);

    await mongoose.disconnect();
    process.exit(1);
  }
}

// ─── Punto de entrada ─────────────────────────────────────────────────────────

generarPerfiles(100);