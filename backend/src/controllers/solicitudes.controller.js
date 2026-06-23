const mongoose = require('mongoose');
const Solicitud = require('../models/Solicitud');
const Alojamiento = require('../models/Alojamiento');
const MatchUsuario = require('../models/MatchUsuario');

const obtenerIdDesdeToken = (req) =>
    req.usuario?.id ?? req.usuario?.id_usuario;

const mapEstadoEntrada = (estado) => {
    const normalizado = String(estado).toLowerCase();
    if (normalizado === 'aceptada' || normalizado === 'aceptado') return 'Aceptado';
    if (normalizado === 'rechazada' || normalizado === 'rechazado') return 'Rechazado';
    if (normalizado === 'pendiente') return 'Pendiente';
    return null;
};

const resolverUsuarioObjetivo = async (body) => {
    const { id_usuario_objetivo, id_alojamiento } = body;

    if (id_usuario_objetivo) {
        if (!mongoose.Types.ObjectId.isValid(id_usuario_objetivo)) {
            return { error: 'id_usuario_objetivo inválido' };
        }
        return { id_usuario_objetivo };
    }

    if (id_alojamiento) {
        if (!mongoose.Types.ObjectId.isValid(id_alojamiento)) {
            return { error: 'id_alojamiento inválido' };
        }
        const alojamiento = await Alojamiento.findById(id_alojamiento).select('id_anfitrion');
        if (!alojamiento) {
            return { error: 'Alojamiento no encontrado' };
        }
        return { id_usuario_objetivo: alojamiento.id_anfitrion };
    }

    return { error: 'Debes enviar id_usuario_objetivo o id_alojamiento' };
};

const enviarSolicitud = async (req, res) => {
    const id_usuario_interesado = obtenerIdDesdeToken(req);

    if (!id_usuario_interesado || !mongoose.Types.ObjectId.isValid(id_usuario_interesado)) {
        return res.status(401).json({ mensaje: 'Token inválido o usuario no identificado.' });
    }

    try {
        const resuelto = await resolverUsuarioObjetivo(req.body);
        if (resuelto.error) {
            return res.status(400).json({ mensaje: `Error: ${resuelto.error}` });
        }

        const { id_usuario_objetivo } = resuelto;

        if (String(id_usuario_interesado) === String(id_usuario_objetivo)) {
            return res.status(400).json({
                mensaje: 'Error: No puedes enviarte una solicitud a ti mismo.',
            });
        }

        const solicitudPrevia = await Solicitud.findOne({
            id_usuario_interesado,
            id_usuario_objetivo,
        });

        if (solicitudPrevia) {
            return res.status(409).json({
                mensaje: 'Error: Ya has enviado una solicitud a este usuario.',
            });
        }

        const nuevaSolicitud = await Solicitud.create({
            id_usuario_interesado,
            id_usuario_objetivo,
            estado: 'Pendiente',
        });

        const matchExistente = await MatchUsuario.findOne({
            id_usuario:      id_usuario_interesado,
            id_destinatario: id_usuario_objetivo,
        });

        if (!matchExistente) {
            const nuevoMatch = await MatchUsuario.create({
                id_usuario:      id_usuario_interesado,
                id_destinatario: id_usuario_objetivo,
                es_mutuo:        false,
            });

            const { emitirNotificacionPendiente } = require('./matches.controller');
            await emitirNotificacionPendiente(id_usuario_objetivo, nuevoMatch, id_usuario_interesado);
        }

        return res.status(201).json({
            exito: true,
            mensaje: '¡Solicitud enviada correctamente en Roomeet!',
            id_solicitud: nuevaSolicitud._id,
        });
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor al procesar tu solicitud.',
        });
    }
};

const obtenerMisSolicitudes = async (req, res) => {
    const id_usuario_objetivo = obtenerIdDesdeToken(req);

    if (!id_usuario_objetivo || !mongoose.Types.ObjectId.isValid(id_usuario_objetivo)) {
        return res.status(401).json({ mensaje: 'Token inválido o usuario no identificado.' });
    }

    try {
        const solicitudes = await Solicitud.find({ id_usuario_objetivo })
            .populate('id_usuario_interesado', 'nombre_completo email perfil_academico')
            .sort({ createdAt: -1 })
            .lean();

        const data = solicitudes.map((s) => ({
            id_solicitud: s._id,
            estado: s.estado,
            fecha_solicitud: s.createdAt,
            postulante: s.id_usuario_interesado?.nombre_completo ?? null,
            contacto_postulante: s.id_usuario_interesado?.email ?? null,
            universidad_postulante: s.id_usuario_interesado?.perfil_academico?.universidad ?? null,
            carrera_postulante: s.id_usuario_interesado?.perfil_academico?.carrera ?? null,
        }));

        return res.status(200).json({
            exito: true,
            data,
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return res.status(500).json({
            mensaje: 'Error interno al consultar las solicitudes recibidas.',
        });
    }
};

const responderSolicitud = async (req, res) => {
    const { id } = req.params;
    const nuevo_estado = req.body.estado;

    if (!nuevo_estado) {
        return res.status(400).json({
            mensaje: 'Error: Debes enviar el nuevo estado de la solicitud (aceptada o rechazada).',
        });
    }

    const estadoMapeado = mapEstadoEntrada(nuevo_estado);
    if (!estadoMapeado || estadoMapeado === 'Pendiente') {
        return res.status(400).json({
            mensaje: 'Error: Estado inválido. Usa aceptada o rechazada.',
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ mensaje: 'Error: ID de solicitud inválido.' });
    }

    const idAnfitrion = obtenerIdDesdeToken(req);

    try {
        const solicitud = await Solicitud.findById(id);

        if (!solicitud) {
            return res.status(404).json({
                mensaje: 'Error: La solicitud que intentas responder no existe.',
            });
        }

        if (String(solicitud.id_usuario_objetivo) !== String(idAnfitrion)) {
            return res.status(403).json({
                mensaje: 'Error: No tienes permiso para responder esta solicitud.',
            });
        }

        solicitud.estado = estadoMapeado;
        await solicitud.save();

        return res.status(200).json({
            exito: true,
            mensaje: `¡La solicitud ha sido marcada como ${estadoMapeado} en Roomeet!`,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                mensaje: 'Estado de solicitud inválido.',
                detalles: error.message,
            });
        }
        console.error('Error al responder solicitud:', error);
        return res.status(500).json({
            mensaje: 'Error interno al intentar actualizar la solicitud.',
        });
    }
};

module.exports = {
    enviarSolicitud,
    obtenerMisSolicitudes,
    responderSolicitud,
};