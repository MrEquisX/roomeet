const mongoose = require('mongoose');
const Favorito = require('../models/Favorito');

const obtenerIdDesdeToken = (req) =>
    req.usuario?.id ?? req.usuario?.id_usuario;

// POST /api/favoritos
const agregarFavorito = async (req, res) => {
    const id_usuario = obtenerIdDesdeToken(req);
    const { id_alojamiento } = req.body;

    if (!id_alojamiento) {
        return res.status(400).json({ mensaje: 'ID de alojamiento obligatorio.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id_alojamiento)) {
        return res.status(400).json({ mensaje: 'ID de alojamiento inválido.' });
    }

    try {
        const nuevoFavorito = await Favorito.create({ id_usuario, id_alojamiento });

        return res.status(201).json({
            exito: true,
            mensaje: 'Alojamiento guardado en favoritos.',
            data: nuevoFavorito
        });

    } catch (error) {
        // Código 11000 → violación del índice único (ya es favorito)
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'Este alojamiento ya está en tus favoritos.' });
        }
        console.error('Error al agregar favorito:', error);
        return res.status(500).json({ mensaje: 'Error al agregar a favoritos.' });
    }
};

// GET /api/favoritos
const obtenerMisFavoritos = async (req, res) => {
    const id_usuario = obtenerIdDesdeToken(req);

    try {
        const favoritos = await Favorito.find({ id_usuario })
            .populate('id_alojamiento')
            .sort({ createdAt: -1 })
            .lean();

        const alojamientos = favoritos
            .map(f => f.id_alojamiento)
            .filter(Boolean);

        return res.status(200).json({
            exito: true,
            data: alojamientos
        });

    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return res.status(500).json({ mensaje: 'Error al obtener favoritos.' });
    }
};

// DELETE /api/favoritos/:id  (id = id_alojamiento)
const eliminarFavorito = async (req, res) => {
    const id_usuario = obtenerIdDesdeToken(req);
    const id_alojamiento = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id_alojamiento)) {
        return res.status(400).json({ mensaje: 'ID de alojamiento inválido.' });
    }

    try {
        const resultado = await Favorito.findOneAndDelete({ id_usuario, id_alojamiento });

        if (!resultado) {
            return res.status(404).json({ mensaje: 'El favorito no existe.' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: 'Eliminado de favoritos correctamente.'
        });

    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar favorito.' });
    }
};

module.exports = {
    agregarFavorito,
    obtenerMisFavoritos,
    eliminarFavorito
};
