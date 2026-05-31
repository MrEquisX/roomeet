const express = require('express');
const router = express.Router();

// Importamos el controlador
const alojamientosController = require('../controllers/alojamientos.controller');

// Importamos a nuestro guardia de seguridad
const { verificarToken } = require('../middlewares/verificarToken');

// Importamos el middleware de subida de fotos que creamos para Roomeet
const upload = require('../middlewares/subirFoto');

// Middleware reutilizable para mapear req.files → req.body.imagenes
const mapearImagenes = async (req, res, next) => {
    try {
        req.body.imagenes = req.files && Array.isArray(req.files)
            ? req.files.map(f => '/uploads/alojamientos/' + f.filename)
            : [];
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