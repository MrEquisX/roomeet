const mongoose = require('mongoose');
const Alojamiento = require('../models/Alojamiento');

// GET /api/alojamientos
const obtenerAlojamientos = async (req, res) => {
    try {
        const { busqueda, sector } = req.query;
        const filtro = {};

        if (busqueda) {
            filtro.$or = [
                { titulo: { $regex: busqueda, $options: 'i' } },
                { sector: { $regex: busqueda, $options: 'i' } },
                { descripcion: { $regex: busqueda, $options: 'i' } }
            ];
        }

        if (sector && sector !== 'Todas') {
            filtro.sector = { $regex: sector, $options: 'i' };
        }

        const alojamientos = await Alojamiento.find(filtro)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(alojamientos);

    } catch (err) {
        console.error('Error al obtener alojamientos:', err);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
};

// GET /api/alojamientos/:id
const obtenerAlojamientoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de alojamiento inválido' });
        }

        const alojamiento = await Alojamiento.findById(id).lean();

        if (!alojamiento) {
            return res.status(404).json({ error: 'Alojamiento no encontrado' });
        }

        return res.status(200).json(alojamiento);

    } catch (err) {
        console.error('Error al obtener alojamiento:', err);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
};

// POST /api/alojamientos
const crearAlojamiento = async (req, res) => {
    try {
        const {
            titulo, descripcion, tipoPropiedad, amoblado,
            gastosComunes, locomocion, sector,
            latitud, longitud,
            habitacionesTotales, habitantesActuales,
            caracteristicas, habitacionesOfrecidas,
            imagenes
        } = req.body;

        if (!titulo) {
            return res.status(400).json({ mensaje: 'Error: El título es obligatorio.' });
        }
        if (!sector) {
            return res.status(400).json({ mensaje: 'Error: El sector es obligatorio.' });
        }

        const nuevoAlojamiento = new Alojamiento({
            id_anfitrion: req.usuario.id,
            titulo,
            descripcion,
            tipoPropiedad,
            amoblado,
            gastosComunes,
            locomocion,
            sector,
            latitud:             latitud             !== undefined ? Number(latitud)             : undefined,
            longitud:            longitud            !== undefined ? Number(longitud)            : undefined,
            habitacionesTotales: habitacionesTotales !== undefined ? Number(habitacionesTotales) : undefined,
            habitantesActuales:  habitantesActuales  !== undefined ? Number(habitantesActuales)  : undefined,
            caracteristicas:        Array.isArray(caracteristicas)        ? caracteristicas        : [],
            habitacionesOfrecidas:  Array.isArray(habitacionesOfrecidas)  ? habitacionesOfrecidas  : [],
            imagenes:               Array.isArray(imagenes)               ? imagenes               : []
        });

        await nuevoAlojamiento.save();

        return res.status(201).json({
            exito: true,
            mensaje: '¡Alojamiento publicado exitosamente en Roomeet!',
            data: nuevoAlojamiento
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos de alojamiento inválidos',
                detalles: Object.values(err.errors).map(e => e.message)
            });
        }
        console.error('Error al crear alojamiento:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor al publicar el alojamiento.' });
    }
};

// PUT /api/alojamientos/:id
const actualizarAlojamiento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de alojamiento inválido' });
        }

        const alojamiento = await Alojamiento.findById(id);
        if (!alojamiento) {
            return res.status(404).json({ error: 'Alojamiento no encontrado' });
        }

        if (alojamiento.id_anfitrion.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({ error: 'Prohibido: solo el anfitrión puede editar este alojamiento.' });
        }

        const {
            titulo, descripcion, tipoPropiedad, amoblado,
            gastosComunes, locomocion, sector,
            latitud, longitud,
            habitacionesTotales, habitantesActuales,
            caracteristicas, habitacionesOfrecidas,
            imagenes
        } = req.body;

        const campos = {
            titulo, descripcion, tipoPropiedad, amoblado,
            gastosComunes, locomocion, sector
        };

        const actualizacion = {};

        for (const [clave, valor] of Object.entries(campos)) {
            if (valor !== undefined) actualizacion[clave] = valor;
        }

        if (latitud             !== undefined) actualizacion.latitud             = Number(latitud);
        if (longitud            !== undefined) actualizacion.longitud            = Number(longitud);
        if (habitacionesTotales !== undefined) actualizacion.habitacionesTotales = Number(habitacionesTotales);
        if (habitantesActuales  !== undefined) actualizacion.habitantesActuales  = Number(habitantesActuales);
        if (Array.isArray(caracteristicas))       actualizacion.caracteristicas       = caracteristicas;
        if (Array.isArray(habitacionesOfrecidas)) actualizacion.habitacionesOfrecidas = habitacionesOfrecidas;
        if (Array.isArray(imagenes))              actualizacion.imagenes              = imagenes;

        const actualizado = await Alojamiento.findByIdAndUpdate(
            id,
            { $set: actualizacion },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            exito: true,
            mensaje: 'Alojamiento actualizado correctamente.',
            data: actualizado
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos inválidos',
                detalles: Object.values(err.errors).map(e => e.message)
            });
        }
        console.error('Error al actualizar alojamiento:', err);
        return res.status(500).json({ error: 'Error al actualizar el alojamiento.' });
    }
};

// DELETE /api/alojamientos/:id
const eliminarAlojamiento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de alojamiento inválido' });
        }

        const alojamiento = await Alojamiento.findById(id);
        if (!alojamiento) {
            return res.status(404).json({ error: 'Alojamiento no encontrado' });
        }

        if (alojamiento.id_anfitrion.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({ error: 'Prohibido: solo el anfitrión puede eliminar este alojamiento.' });
        }

        await Alojamiento.findByIdAndDelete(id);

        return res.status(200).json({
            exito: true,
            mensaje: 'Alojamiento eliminado correctamente.'
        });

    } catch (err) {
        console.error('Error al eliminar alojamiento:', err);
        return res.status(500).json({ error: 'Error al eliminar el alojamiento.' });
    }
};

module.exports = {
    obtenerAlojamientos,
    obtenerAlojamientoPorId,
    crearAlojamiento,
    actualizarAlojamiento,
    eliminarAlojamiento
};
