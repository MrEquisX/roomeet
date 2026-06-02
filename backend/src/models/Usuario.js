const mongoose = require('mongoose');

const perfilAcademicoSchema = new mongoose.Schema({
  universidad: {
    type: String,
    required: true,
    trim: true,
  },
  carrera: {
    type: String,
    required: true,
    trim: true,
  }
}, { _id: false });

const preferenciasConvivenciaSchema = new mongoose.Schema({
  fuma:                  { type: Boolean, default: false },
  mascotas:              { type: Boolean, default: false },
  nivel_orden:           { type: Number, min: 1, max: 5, required: true },
  nivel_ruido:           { type: Number, min: 1, max: 5, default: 3 },
  bebe_alcohol:          { type: String, default: 'Nunca' },
  tipo_dieta:            { type: String, default: 'Omnívoro' },
  visitas_frecuentes:    { type: Boolean, default: false },
  acepta_parejas_visita: { type: Boolean, default: false },
  horario_preferido:     { type: String, default: 'Diurno' },
}, { _id: false });

const filtrosSchema = new mongoose.Schema({
  soloMismaUniversidad: { type: Boolean, default: false },
  soloMismaCarrera:     { type: Boolean, default: false },
  generoPreferido:      { type: String,  default: 'Indiferente' },
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  nombre_completo: {
    type: String,
    required: [true, "El nombre completo es obligatorio"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Correo electrónico no válido"]
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    trim: true,
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
    select: false
  },
  perfil_academico: {
    type: perfilAcademicoSchema,
    required: true
  },
  preferencias_convivencia: {
    type: preferenciasConvivenciaSchema,
    required: true
  },
  intereses: {
    type: [String],
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length <= 5;
      },
      message: "Máximo 5 intereses permitidos"
    },
    default: []
  },
  rol: {
    type: String,
    enum: ['Buscador', 'Anfitrion'],
    default: 'Buscador',
    required: true
  },
  bio:          { type: String, default: '' },
  foto_perfil:  { type: String, default: '' },
  telefono:     { type: String, default: '' },
  filtros:      { type: filtrosSchema, default: () => ({}) },
  alojamientoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alojamiento',
    default: null
  },
  // Recuperación de contraseña
  resetPasswordToken:   { type: String,  select: false },
  resetPasswordExpires: { type: Date,    select: false }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);