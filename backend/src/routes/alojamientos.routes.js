const express = require('express');
const router = express.Router();

// Importamos el controlador
const alojamientosController = require('../controllers/alojamientos.controller');

// Importamos a nuestro guardia de seguridad
const { verificarToken } = require('../middlewares/verificarToken');

// Importamos el middleware de subida de fotos que creamos para Roomeet
const upload = require('../middlewares/subirFoto');

// Mapea req.files → req.body.imagenes SOLO si hay archivos nuevos.
// Si no hay archivos, no toca req.body.imagenes para no borrar las existentes.
const mapearImagenes = async (req, res, next) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.imagenes = req.files.map(f => '/uploads/alojamientos/' + f.filename);
        }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Error procesando imágenes.' });
    }
};

// Rutas públicas
router.get('/', alojamientosController.obtenerAlojamientos);
router.get('/:id', alojamientosController.obtenerAlojamientoPorId);

// Rutas protegidas
router.post('/', verificarToken, upload.array('imagenes', 5), mapearImagenes, alojamientosController.crearAlojamiento);
router.put('/:id', verificarToken, upload.array('imagenes', 5), mapearImagenes, alojamientosController.actualizarAlojamiento);
router.delete('/:id', verificarToken, alojamientosController.eliminarAlojamiento);

module.exports = router;