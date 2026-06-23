const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matches.controller');
const { verificarToken } = require('../middlewares/verificarToken');

router.post('/', verificarToken, matchesController.crearMatch);
router.post('/rechazar', verificarToken, matchesController.rechazarMatch);
router.get('/notificaciones', verificarToken, matchesController.obtenerNotificacionesPendientes);
router.get('/', verificarToken, matchesController.obtenerMisMatches);

module.exports = router;
