const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

const obtenerIdDesdeToken = (req) => req.usuario?.id;

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

        // Bloquear IDOR: el usuario del token debe ser el dueño del perfil
        const tokenUserId = obtenerIdDesdeToken(req);
        if (!tokenUserId || tokenUserId.toString() !== id.toString()) {
            return res.status(403).json({ error: 'Prohibido: no tienes permiso para modificar este perfil.' });
        }

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

// --- FUNCIÓN PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO (GET /mi-perfil) ---
const obtenerMiPerfil = async (req, res) => {
    try {
        const id = obtenerIdDesdeToken(req);

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(401).json({ mensaje: 'Token inválido o sin ID de usuario.' });
        }

        const usuario = await Usuario.findById(id).select('-password').lean();

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Separar nombre_completo en nombre y apellido
        const partes = (usuario.nombre_completo || '').trim().split(' ');
        const nombre = partes[0] || '';
        const apellido = partes.slice(1).join(' ');

        const conv = usuario.preferencias_convivencia || {};

        const perfilNormalizado = {
            _id: usuario._id,
            nombre,
            apellido,
            email: usuario.email,
            universidad: usuario.perfil_academico?.universidad || '',
            carrera: usuario.perfil_academico?.carrera || '',
            sede: usuario.sede || '',
            telefono: usuario.telefono || '',
            bio: usuario.bio || '',
            fotoPerfilUrl: usuario.foto_perfil || '',
            rol: usuario.rol,
            alojamientoId: usuario.alojamientoId || null,
            preferencias: {
                fuma: conv.fuma ?? false,
                mascotas: conv.mascotas ?? false,
                orden: conv.nivel_orden ?? 0,
                ruido: conv.nivel_ruido ?? 0,
                bebeAlcohol: conv.bebe_alcohol || 'N/D',
                tipoDieta: conv.tipo_dieta || 'N/D',
                visitasFrecuentes: conv.visitas_frecuentes ?? false,
                aceptaParejasVisita: conv.acepta_parejas_visita ?? false,
                horarioPreferido: conv.horario_preferido || 'N/D',
            },
            filtros: usuario.filtros || {},
            intereses: (usuario.intereses || []).map((i) =>
                typeof i === 'string' ? { nombre: i, icono: '⭐' } : i
            ),
        };

        return res.status(200).json(perfilNormalizado);
    } catch (err) {
        console.error('Error al obtener mi perfil:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// --- FUNCIÓN PARA EDITAR EL PERFIL DEL USUARIO AUTENTICADO (PUT /editar) ---
const editarMiPerfil = async (req, res) => {
    try {
        const id = obtenerIdDesdeToken(req);
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(401).json({ mensaje: 'Token inválido.' });
        }

        const {
            biografia, fuma, aceptaMascotas, bebeAlcohol, tipoDieta,
            nivelOrden, nivelRuido, visitasFrecuentes, aceptaParejasVisita,
            horarioPreferido, soloMismaUniversidad, soloMismaCarrera, generoPreferido,
        } = req.body;

        // Convierte string 'true'/'false' (FormData) o booleanos (JSON)
        const parseBool = (v) => (v === 'true' || v === true);

        const actualizacion = {};

        if (biografia !== undefined) actualizacion.bio = biografia;

        // Mapear al esquema de MongoDB usando notación de punto para subdocumentos
        const convMap = {
            fuma:                  fuma                  !== undefined ? parseBool(fuma)                  : undefined,
            mascotas:              aceptaMascotas        !== undefined ? parseBool(aceptaMascotas)        : undefined,
            nivel_orden:           nivelOrden            !== undefined ? Number(nivelOrden)               : undefined,
            nivel_ruido:           nivelRuido            !== undefined ? Number(nivelRuido)               : undefined,
            bebe_alcohol:          bebeAlcohol           !== undefined ? bebeAlcohol                      : undefined,
            tipo_dieta:            tipoDieta             !== undefined ? tipoDieta                        : undefined,
            visitas_frecuentes:    visitasFrecuentes     !== undefined ? parseBool(visitasFrecuentes)     : undefined,
            acepta_parejas_visita: aceptaParejasVisita   !== undefined ? parseBool(aceptaParejasVisita)   : undefined,
            horario_preferido:     horarioPreferido      !== undefined ? horarioPreferido                 : undefined,
        };
        for (const [k, v] of Object.entries(convMap)) {
            if (v !== undefined) actualizacion[`preferencias_convivencia.${k}`] = v;
        }

        const filtrosMap = {
            soloMismaUniversidad: soloMismaUniversidad !== undefined ? parseBool(soloMismaUniversidad) : undefined,
            soloMismaCarrera:     soloMismaCarrera     !== undefined ? parseBool(soloMismaCarrera)     : undefined,
            generoPreferido:      generoPreferido      !== undefined ? generoPreferido                 : undefined,
        };
        for (const [k, v] of Object.entries(filtrosMap)) {
            if (v !== undefined) actualizacion[`filtros.${k}`] = v;
        }

        // Intereses: acepta JSON (array) o FormData (campo[] repetido)
        const rawIntereses =
            req.body.interesesSeleccionados ??
            req.body['interesesSeleccionados[]'];
        if (rawIntereses !== undefined) {
            actualizacion.intereses = [].concat(rawIntereses);
        }

        // Foto de perfil subida por Multer
        if (req.file) {
            actualizacion.foto_perfil = '/uploads/perfiles/' + req.file.filename;
        }

        if (Object.keys(actualizacion).length === 0) {
            return res.status(400).json({ mensaje: 'No se enviaron campos para actualizar.' });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { $set: actualizacion },
            { new: true, runValidators: false }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: '¡Perfil actualizado correctamente!',
            data: usuarioActualizado,
        });
    } catch (err) {
        console.error('══════ ERROR EXACTO editarMiPerfil ══════');
        console.error('Nombre:', err.name);
        console.error('Mensaje:', err.message);
        if (err.name === 'ValidationError') {
            console.error('Campos inválidos:', JSON.stringify(err.errors, null, 2));
        }
        console.error('Body recibido:', JSON.stringify(req.body));
        console.error('File recibido:', req.file ? req.file.originalname : 'ninguno');
        console.error('Stack:', err.stack);
        return res.status(500).json({ mensaje: 'Error interno al actualizar el perfil.' });
    }
};

module.exports = {
    obtenerUsuarios,
    actualizarPerfil,
    obtenerMiPerfil,
    editarMiPerfil,
};