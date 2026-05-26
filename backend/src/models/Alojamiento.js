const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
    precio: Number,
    tipoBano: String
});

const alojamientoSchema = new mongoose.Schema({
    id_anfitrion: { type: mongoose.Schema.Types.ObjectId, required: true },
    titulo: String,
    descripcion: String,
    tipoPropiedad: String,
    amoblado: String,
    gastosComunes: String,
    locomocion: String,
    sector: String,
    latitud: Number,
    longitud: Number,
    habitacionesTotales: Number,
    habitantesActuales: Number,
    caracteristicas: [String],
    habitacionesOfrecidas: [habitacionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Alojamiento', alojamientoSchema);