const express = require('express');
const router  = express.Router();

const {
    registrarUsuario,
    loginUsuario,
    olvideMiPassword,
    resetPassword,
} = require('../controllers/auth.controller');

router.post('/registro',           registrarUsuario);
router.post('/login',              loginUsuario);

// Recuperación de contraseña
// Paso 1: el usuario pide el enlace → se envía email con token
router.post('/recuperar-password', olvideMiPassword);
// Paso 2: el usuario llegó desde el enlace y envía la nueva clave
router.post('/nueva-password',     resetPassword);

module.exports = router;