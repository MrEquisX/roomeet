const express = require('express');
const router = express.Router();

// Importamos el controlador completo
const solicitudesController = require('../controllers/solicitudes.controller');
const { verificarToken } = require('../middlewares/verificarToken');

// 1. POST: Un estudiante envía una solicitud (Esta ya la tenías)
router.post('/', verificarToken, solicitudesController.enviarSolicitud);

// 2. GET: El anfitrión revisa su bandeja de entrada (Quién quiere ser su roomie)
router.get('/recibidas', verificarToken, solicitudesController.obtenerMisSolicitudes);

// 3. PUT: El anfitrión acepta o rechaza una solicitud específica
router.put('/:id/estado', verificarToken, solicitudesController.responderSolicitud);

module.exports = router;