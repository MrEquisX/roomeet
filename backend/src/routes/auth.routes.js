const express = require('express');
const router  = express.Router();

const {
    registrarUsuario,
    verificarEmail,
    loginUsuario,
    olvideMiPassword,
    resetPassword,
} = require('../controllers/auth.controller');

router.post('/registro',            registrarUsuario);
router.get ('/verificar-email',     verificarEmail);   // ← enlace que llega por correo
router.post('/login',               loginUsuario);

// Recuperación de contraseña
router.post('/recuperar-password',  olvideMiPassword);
router.post('/nueva-password',      resetPassword);

module.exports = router;
