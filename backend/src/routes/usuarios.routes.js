const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// 1. Importamos el middleware de seguridad que ya tenías
const { verificarToken } = require('../middlewares/verificarToken');

// 2. Importamos el middleware de subida de fotos que creamos recién
const upload = require('../middlewares/subirFoto');

// La ruta GET se mantiene igual
router.get('/', usuariosController.obtenerUsuarios);

// En la ruta PUT, agregamos el "upload" justo después de verificar el token
router.put(
    '/:id', 
    verificarToken, 
    upload.single('foto_perfil'), 
    usuariosController.actualizarPerfil
);

module.exports = router;