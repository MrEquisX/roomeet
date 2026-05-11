const express = require('express');
const router = express.Router();

// Importamos el controlador
const alojamientosController = require('../controllers/alojamientos.controller');

// Importamos a nuestro guardia de seguridad
const { verificarToken } = require('../middlewares/verificarToken');

// Importamos el middleware de subida de fotos que creamos para Roomeet
const upload = require('../middlewares/subirFoto');

// Ruta pública: Cualquiera puede ver la lista de alojamientos
router.get('/', alojamientosController.obtenerAlojamientos);

// Ruta protegida: Solo usuarios con token válido pueden publicar
// Añadimos upload.single('foto_alojamiento') justo después del token
router.post(
    '/', 
    verificarToken, 
    upload.single('foto_alojamiento'), 
    alojamientosController.crearAlojamiento
);

module.exports = router;