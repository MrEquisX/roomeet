const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

const obtenerIdDesdeToken = (req) =>
    req.usuario?.id ?? req.usuario?.id_usuario;

// --- FUNCIÓN PARA OBTENER (GET) ---
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find()
            .select('-password')
            .lean();

        return res.status(200).json({
            exito: true,
            mensaje: 'Usuarios obtenidos correctamente',
            data: usuarios,
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
};

// --- FUNCIÓN PARA ACTUALIZAR PERFIL (PUT) ---
const actualizarPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const { telefono, universidad, carrera, biografia, rol } = req.body;

        let foto_perfil = req.body.foto_perfil;
        if (req.file) {
            foto_perfil = '/uploads/perfiles/' + req.file.filename;
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const actualizacion = {};

        if (universidad !== undefined || carrera !== undefined) {
            actualizacion.perfil_academico = {};
            if (universidad !== undefined) {
                actualizacion.perfil_academico.universidad = universidad;
            }
            if (carrera !== undefined) {
                actualizacion.perfil_academico.carrera = carrera;
            }
        }

        if (rol !== undefined) {
            actualizacion.rol = rol;
        }

        // Descomenta cuando agregues estos campos al schema Usuario:
        // if (telefono !== undefined) actualizacion.telefono = telefono;
        // if (biografia !== undefined) actualizacion.biografia = biografia;
        // if (foto_perfil !== undefined) actualizacion.foto_perfil = foto_perfil;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { $set: actualizacion },
            { new: true, runValidators: true }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: '¡Perfil actualizado correctamente en Roomeet!',
            urlImagen: foto_perfil,
            data: usuarioActualizado,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos de perfil inválidos',
                detalles: Object.values(err.errors).map((e) => e.message),
            });
        }
        console.error('Error al actualizar perfil:', err);
        return res.status(500).json({ error: 'Hubo un problema al actualizar el perfil' });
    }
};

module.exports = {
    obtenerUsuarios,
    actualizarPerfil,
};