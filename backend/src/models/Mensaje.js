const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  id_chat: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Chat',
    required: true,
  },
  id_remitente: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },
  texto: {
    type:     String,
    required: true,
    trim:   true,
  },
  tipo: {
    type:    String,
    enum:    ['texto', 'imagen', 'audio'],
    default: 'texto',
  },
}, { timestamps: true });

mensajeSchema.index({ id_chat: 1, createdAt: 1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);
