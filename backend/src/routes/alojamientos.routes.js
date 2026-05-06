const express = require('express');
const router = express.Router();

// Importamos el controlador
const alojamientosController = require('../controllers/alojamientos.controller');

// Importamos a nuestro guardia de seguridad
const { verificarToken } = require('../middlewares/verificarToken');

// Ruta pública: Cualquiera puede ver la lista de alojamientos
router.get('/', alojamientosController.obtenerAlojamientos);

// Ruta protegida: Solo usuarios con token válido pueden publicar
router.post('/', verificarToken, alojamientosController.crearAlojamiento);

module.exports = router;