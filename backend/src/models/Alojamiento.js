const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
  precio:   { type: Number, required: true },
  tipoBano: { type: String, default: 'Compartido' }, // 'Privado' | 'Compartido'
}, { _id: false });

const alojamientoSchema = new mongoose.Schema({

  // ── Anunciante ─────────────────────────────────────────────────────────────
  id_anfitrion: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },

  // ── Datos principales ──────────────────────────────────────────────────────
  titulo:         { type: String, required: true, trim: true },
  descripcion:    { type: String, default: '',    trim: true },
  tipoPropiedad:  { type: String, default: '' },   // 'Casa', 'Departamento', 'Pieza', ...
  amoblado:       { type: String, default: '' },   // 'Amoblado', 'Sin amoblar', 'Semi-amoblado'

  // ── Ubicación ──────────────────────────────────────────────────────────────
  sector:   { type: String, required: true, trim: true },
  comuna:   { type: String, default: '',    trim: true },  // ej: 'Valparaíso', 'Viña del Mar'
  latitud:  { type: Number },
  longitud: { type: Number },

  // ── Condiciones económicas ─────────────────────────────────────────────────
  gastosComunes: { type: String, default: '' }, // 'Incluidos', 'No incluidos'
  locomocion:    { type: String, default: '' }, // descripción acceso transporte

  // ── Disponibilidad ─────────────────────────────────────────────────────────
  habitacionesTotales:  { type: Number, default: 0 },
  habitantesActuales:   { type: Number, default: 0 },

  // ── Equipamiento y servicios ───────────────────────────────────────────────
  caracteristicas: { type: [String], default: [] }, // ['WiFi', 'Lavadora', 'Estacionamiento', ...]

  // ── Habitaciones ofrecidas en arriendo ────────────────────────────────────
  habitacionesOfrecidas: { type: [habitacionSchema], default: [] },

  // ── Imágenes ───────────────────────────────────────────────────────────────
  imagenes: { type: [String], default: [] },

}, { timestamps: true });

module.exports = mongoose.model('Alojamiento', alojamientoSchema);
