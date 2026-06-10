const express = require('express');
const router = express.Router();
const chatsController = require('../controllers/chats.controller');
const { verificarToken } = require('../middlewares/verificarToken');

router.get('/archivados', verificarToken, chatsController.listarArchivados);
router.get('/con-usuario/:otroUsuarioId', verificarToken, chatsController.obtenerChatConUsuario);
router.get('/:id/mensajes', verificarToken, chatsController.obtenerMensajes);
router.post('/:id/mensajes', verificarToken, chatsController.enviarMensaje);
router.get('/:id', verificarToken, chatsController.obtenerChat);
router.get('/', verificarToken, chatsController.listarChats);

module.exports = router;
