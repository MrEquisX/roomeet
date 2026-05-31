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
// Cambiamos a upload.array('imagenes', 5) para permitir múltiples imágenes
router.post(
    '/',
    verificarToken,
    upload.array('imagenes', 5),
    // Middleware intermedio para adaptar req.files para el controlador
    async (req, res, next) => {
        try {
            // Mapear a un array de rutas/urls relativas (ajustar según lo que uses para guardado)
            if (req.files && Array.isArray(req.files)) {
                // Por ejemplo, almacenar la ruta relativa o URL de cada imagen
                req.body.imagenes = req.files.map(file => file.path || file.location || file.filename);
            } else {
                req.body.imagenes = [];
            }
            // Pasamos al controlador
            next();
        } catch (error) {
            res.status(400).json({ error: 'Error procesando imágenes.' });
        }
    },
    alojamientosController.crearAlojamiento
);

module.exports = router;