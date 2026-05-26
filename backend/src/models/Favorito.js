const mongoose = require('mongoose');

const favoritoSchema = new mongoose.Schema({
    // ref: 'Usuario' enlaza este campo con tu modelo de Usuarios
    id_usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    // ref: 'Alojamiento' enlaza con la propiedad guardada
    id_alojamiento: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alojamiento', 
        required: true 
    }
}, { timestamps: true });

// REGLA DE ORO: Un usuario no puede guardar el mismo alojamiento dos veces
favoritoSchema.index({ id_usuario: 1, id_alojamiento: 1 }, { unique: true });

module.exports = mongoose.model('Favorito', favoritoSchema);