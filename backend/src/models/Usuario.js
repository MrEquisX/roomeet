const mongoose = require('mongoose');

// ─── Sub-esquemas ─────────────────────────────────────────────────────────────

const perfilAcademicoSchema = new mongoose.Schema({
  universidad:  { type: String, required: true,  trim: true },
  carrera:      { type: String, required: true,  trim: true },
  sede:         { type: String, default: '',      trim: true },
  anio_ingreso: { type: Number, min: 2000, max: 2040 },
}, { _id: false });

// Coordenadas del campus del usuario (para cálculo de distancia a viviendas)
const ubicacionSedeSchema = new mongoose.Schema({
  latitud:  { type: Number },
  longitud: { type: Number },
  direccion: { type: String, default: '', trim: true },
}, { _id: false });

const preferenciasConvivenciaSchema = new mongoose.Schema({
  fuma:                  { type: String, enum: ['Sí', 'No', 'Ocasionalmente'], default: 'No' },
  mascotas:              { type: String, enum: ['Sí', 'No'], default: 'No' },
  nivel_orden:           { type: Number,  min: 1, max: 5, required: true },
  nivel_ruido:           { type: Number,  min: 1, max: 5, default: 3 },
  bebe_alcohol:          { type: String, enum: ['Sí', 'No', 'Ocasionalmente'], default: 'No' },
  horario_preferido:     { type: String,  default: 'Indiferente' },
}, { _id: false });

// Filtros que el usuario aplica al buscar compañeros
const filtrosSchema = new mongoose.Schema({
  soloMismaUniversidad: { type: Boolean, default: false },
  soloMismaCarrera:     { type: Boolean, default: false },
  generoPreferido:      { type: String,  default: 'Indiferente' },
}, { _id: false });

// ─── Esquema principal ────────────────────────────────────────────────────────

const usuarioSchema = new mongoose.Schema({

  // ── Identidad ──────────────────────────────────────────────────────────────
  nombre_completo: {
    type:     String,
    required: [true, 'El nombre completo es obligatorio'],
    trim:     true,
  },
  email: {
    type:      String,
    required:  [true, 'El email es obligatorio'],
    unique:    true,
    trim:      true,
    lowercase: true,
    match:     [/.+@.+\..+/, 'Correo electrónico no válido'],
  },
  password: {
    type:      String,
    required:  [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select:    false,
  },

  // ── Datos personales ───────────────────────────────────────────────────────
  telefono:          { type: String, default: '', trim: true },
  fecha_nacimiento:  { type: Date },
  sexo_biologico:    { type: String, enum: ['Masculino', 'Femenino', 'Otro', ''], default: '' },
  identidad_genero:  { type: String, default: '', trim: true },
  bio:               { type: String, default: '', trim: true },
  foto_perfil:       { type: String, default: '' },

  // ── Perfil académico ───────────────────────────────────────────────────────
  perfil_academico: {
    type:     perfilAcademicoSchema,
    required: true,
  },

  // ── Ubicación del campus (para matching por distancia) ─────────────────────
  ubicacion_sede: {
    type:    ubicacionSedeSchema,
    default: () => ({}),
  },

  // ── Preferencias de convivencia ────────────────────────────────────────────
  preferencias_convivencia: {
    type:     preferenciasConvivenciaSchema,
    required: true,
  },

  // ── Intereses (máx. 5) ─────────────────────────────────────────────────────
  intereses: {
    type: [String],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length <= 5,
      message: 'Máximo 5 intereses permitidos',
    },
    default: [],
  },

  // ── Rol en la plataforma ───────────────────────────────────────────────────
  rol: {
    type:     String,
    enum:     ['Buscador', 'Anfitrion'],
    default:  'Buscador',
    required: true,
  },

  // ── Filtros de búsqueda ────────────────────────────────────────────────────
  filtros: { type: filtrosSchema, default: () => ({}) },

  // ── Alojamiento vinculado (si es Anfitrion) ────────────────────────────────
  alojamientoId: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Alojamiento',
    default: null,
  },

  // ── Verificación de email ──────────────────────────────────────────────────
  // null  → usuario antiguo (anterior a esta feature); se permite login
  // false → registrado pero sin verificar
  // true  → cuenta verificada
  emailVerificado:          { type: Boolean, default: null },
  emailVerificacionToken:   { type: String,  select: false },
  emailVerificacionExpires: { type: Date,    select: false },

  // ── Recuperación de contraseña ─────────────────────────────────────────────
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },

}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
