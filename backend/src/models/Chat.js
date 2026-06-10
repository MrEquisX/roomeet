const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Usuario',
  }],
  archivado: {
    type:    Boolean,
    default: false,
  },
}, { timestamps: true });

chatSchema.index({ participantes: 1 });

module.exports = mongoose.model('Chat', chatSchema);
