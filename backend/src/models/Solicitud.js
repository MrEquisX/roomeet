const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    id_usuario_interesado: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    id_usuario_objetivo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Aceptado', 'Rechazado'], 
        default: 'Pendiente' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Solicitud', solicitudSchema);