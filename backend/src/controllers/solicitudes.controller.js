const db = require('../db/connection');

const enviarSolicitud = async (req, res) => {
    // El ID del usuario que postula lo sacamos de su "Carnet Virtual" (Token)
    const id_usuario = req.usuario.id_usuario;
    
    // Declaración explícita de los datos que vienen del frontend
    const id_alojamiento = req.body.id_alojamiento;
    const mensaje = req.body.mensaje;

    // Validación de datos obligatorios
    if (!id_alojamiento) {
        return res.status(400).json({
            mensaje: 'Error: Debes especificar a qué alojamiento estás postulando.'
        });
    }

    try {
        // Primero, verificamos si el usuario ya envió una solicitud a este lugar
        const queryVerificar = `
            SELECT * FROM Solicitudes 
            WHERE id_usuario = ? AND id_alojamiento = ?
        `;
        const [solicitudesPrevias] = await db.query(queryVerificar, [id_usuario, id_alojamiento]);

        if (solicitudesPrevias.length > 0) {
            return res.status(409).json({
                mensaje: 'Error: Ya has enviado una solicitud para este alojamiento.'
            });
        }

        // Si no hay solicitudes previas, la insertamos
        const queryInsertar = `
            INSERT INTO Solicitudes (id_usuario, id_alojamiento, mensaje) 
            VALUES (?, ?, ?)
        `;
        const valores = [id_usuario, id_alojamiento, mensaje];

        const [resultado] = await db.query(queryInsertar, valores);

        return res.status(201).json({
            exito: true,
            mensaje: '¡Solicitud enviada al anfitrión correctamente en Roomeet!',
            id_solicitud: resultado.insertId
        });

    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor al procesar tu solicitud.'
        });
    }
};

const obtenerMisSolicitudes = async (req, res) => {
    // El ID del anfitrión lo sacamos de su token
    const id_anfitrion = req.usuario.id_usuario;

    try {
        // Hacemos JOIN para traer los datos útiles (quién postula y a qué lugar)
        const query = `
            SELECT s.id_solicitud, s.estado, s.mensaje, s.fecha_solicitud,
                   a.titulo AS alojamiento,
                   u.nombre_completo AS postulante, u.email AS contacto_postulante
            FROM Solicitudes s
            INNER JOIN Alojamientos a ON s.id_alojamiento = a.id_alojamiento
            INNER JOIN Usuarios u ON s.id_usuario = u.id_usuario
            WHERE a.id_anfitrion = ?
            ORDER BY s.fecha_solicitud DESC
        `;
        
        const [solicitudes] = await db.query(query, [id_anfitrion]);

        return res.status(200).json({
            exito: true,
            data: solicitudes
        });

    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return res.status(500).json({
            mensaje: 'Error interno al consultar las solicitudes recibidas.'
        });
    }
};

const responderSolicitud = async (req, res) => {
    // Declaración explícita de variables
    const id_solicitud = req.params.id;
    const nuevo_estado = req.body.estado; // Aquí vendrá 'aceptada' o 'rechazada'

    if (!nuevo_estado) {
        return res.status(400).json({
            mensaje: 'Error: Debes enviar el nuevo estado de la solicitud (aceptada o rechazada).'
        });
    }

    try {
        const queryUpdate = 'UPDATE Solicitudes SET estado = ? WHERE id_solicitud = ?';
        const [resultado] = await db.query(queryUpdate, [nuevo_estado, id_solicitud]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Error: La solicitud que intentas responder no existe.'
            });
        }

        return res.status(200).json({
            exito: true,
            mensaje: `¡La solicitud ha sido marcada como ${nuevo_estado}!`
        });

    } catch (error) {
        console.error('Error al responder solicitud:', error);
        return res.status(500).json({
            mensaje: 'Error interno al intentar actualizar la solicitud.'
        });
    }
};

module.exports = {
    enviarSolicitud,
    obtenerMisSolicitudes,
    responderSolicitud
};