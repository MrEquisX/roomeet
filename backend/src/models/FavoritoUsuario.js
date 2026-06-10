const mongoose = require('mongoose');

const favoritoUsuarioSchema = new mongoose.Schema({
  id_usuario: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },
  id_usuario_favorito: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Usuario',
    required: true,
  },
}, { timestamps: true });

favoritoUsuarioSchema.index({ id_usuario: 1, id_usuario_favorito: 1 }, { unique: true });

module.exports = mongoose.model('FavoritoUsuario', favoritoUsuarioSchema);
