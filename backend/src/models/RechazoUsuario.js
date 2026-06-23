const mongoose = require('mongoose');

const rechazoUsuarioSchema = new mongoose.Schema({
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
}, { timestamps: true });

rechazoUsuarioSchema.index({ id_usuario: 1, id_destinatario: 1 }, { unique: true });

module.exports = mongoose.model('RechazoUsuario', rechazoUsuarioSchema);
