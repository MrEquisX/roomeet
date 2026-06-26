const express = require('express');
const router  = express.Router();

const {
    registrarUsuario,
    verificarEmail,
    loginUsuario,
    olvideMiPassword,
    recuperarRedirect,
    testSmtp,
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
router.get ('/recuperar-redirect',  authGeneralLimiter, recuperarRedirect);
router.get ('/test-smtp',           authGeneralLimiter, testSmtp);
router.post('/nueva-password',      authGeneralLimiter, resetPassword);

module.exports = router;
