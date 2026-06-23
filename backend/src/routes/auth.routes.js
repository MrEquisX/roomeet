const express = require('express');
const router  = express.Router();

const {
    registrarUsuario,
    verificarEmail,
    loginUsuario,
    olvideMiPassword,
    resetPassword,
} = require('../controllers/auth.controller');

const {
    authStrictLimiter,
    authGeneralLimiter,
} = require('../middlewares/rateLimiter');

router.post('/registro',            authGeneralLimiter, registrarUsuario);
router.get ('/verificar-email',     authGeneralLimiter, verificarEmail);
router.post('/login',               authStrictLimiter,  loginUsuario);
router.post('/recuperar-password',  authStrictLimiter,  olvideMiPassword);
router.post('/nueva-password',      authGeneralLimiter, resetPassword);

module.exports = router;
