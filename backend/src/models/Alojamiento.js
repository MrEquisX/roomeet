const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
    precio: Number,
    tipoBano: String
});

const alojamientoSchema = new mongoose.Schema({
    id_anfitrion: { type: mongoose.Schema.Types.ObjectId, required: true },
    titulo: { type: String, required: true },
    descripcion: String,
    tipoPropiedad: String,
    amoblado: String,
    gastosComunes: String,
    locomocion: String,
    sector: { type: String, required: true },
    latitud: Number,
    longitud: Number,
    habitacionesTotales: Number,
    habitantesActuales: Number,
    caracteristicas: [String],
    habitacionesOfrecidas: [habitacionSchema],
    imagenes: [String]
}, { timestamps: true });

module.exports = mongoose.model('Alojamiento', alojamientoSchema);