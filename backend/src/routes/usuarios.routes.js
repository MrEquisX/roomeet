const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// 1. Importamos el middleware de seguridad que ya tenías
const { verificarToken } = require('../middlewares/verificarToken');

// 2. Importamos el middleware de subida de fotos que creamos recién
const upload = require('../middlewares/subirFoto');

// La ruta GET se mantiene igual
router.get('/', usuariosController.obtenerUsuarios);

// Perfil del usuario autenticado (requiere token)
router.get('/mi-perfil', verificarToken, usuariosController.obtenerMiPerfil);

// Editar perfil propio — sin ID en URL, usa el token
router.put('/editar', verificarToken, upload.single('foto_perfil'), usuariosController.editarMiPerfil);

// Actualizar perfil por ID (admin/IDOR-protegido)
router.put(
    '/:id', 
    verificarToken, 
    upload.single('foto_perfil'), 
    usuariosController.actualizarPerfil
);

module.exports = router;