const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// 1. Importamos el middleware de seguridad que ya tenías
const { verificarToken } = require('../middlewares/verificarToken');

// 2. Importamos el middleware de subida de fotos que creamos recién
const upload = require('../middlewares/subirFoto');

// ── Rutas protegidas (requieren token) ────────────────────────────────────────
router.get('/', verificarToken, usuariosController.obtenerUsuarios);

// Perfil del usuario autenticado
router.get('/mi-perfil', verificarToken, usuariosController.obtenerMiPerfil);

// Motor de emparejamiento — DEBE ir antes de /:id para evitar conflicto de rutas
// Express interpretaría "matches" como un ID si esta ruta fuera después
router.get('/matches', verificarToken, usuariosController.obtenerMatches);

// Editar perfil propio (sin ID en URL, el ID se extrae del token)
router.put(
    '/editar',
    verificarToken,
    upload.single('foto_perfil'),
    usuariosController.editarMiPerfil
);

// Actualizar perfil por ID (IDOR-protegido dentro del controlador)
router.put(
    '/:id',
    verificarToken,
    upload.single('foto_perfil'),
    usuariosController.actualizarPerfil
);

// Perfil público de otro usuario — DEBE ir después de /mi-perfil y /matches
// para que Express no interprete esas palabras clave como valores de :id
router.get('/:id', verificarToken, usuariosController.obtenerPerfilPublico);

module.exports = router;