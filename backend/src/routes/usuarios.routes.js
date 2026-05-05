const express = require('express');
const router = express.Router();

// Importamos el controlador
const usuariosController = require('../controllers/usuarios.controller');

// Cuando alguien haga un GET (Pedir lista de usuarios)
router.get('/', usuariosController.obtenerUsuarios);

// --- NUEVA RUTA: Cuando alguien haga un POST (Crear usuario nuevo) ---
router.post('/', usuariosController.crearUsuario);

router.put('/:id', usuariosController.actualizarPerfil);

module.exports = router;