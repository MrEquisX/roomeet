const mongoose = require('mongoose');

const matchUsuarioSchema = new mongoose.Schema({
  id_usuario: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },
  id_destinatario: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },
  es_mutuo: {
    type:    Boolean,
    default: false,
  },
}, { timestamps: true });

matchUsuarioSchema.index({ id_usuario: 1, id_destinatario: 1 }, { unique: true });

module.exports = mongoose.model('MatchUsuario', matchUsuarioSchema);
