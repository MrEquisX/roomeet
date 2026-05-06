const express = require('express');
const router = express.Router();

// Importamos ambas funciones que guardamos en el controlador
const { registrarUsuario, loginUsuario } = require('../controllers/auth.controller');

// Creamos el endpoint para registro (Ej: http://localhost:3000/api/auth/registro)
router.post('/registro', registrarUsuario);

// Creamos el endpoint para inicio de sesión (Ej: http://localhost:3000/api/auth/login)
router.post('/login', loginUsuario);

module.exports = router;