const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Importamos el middleware que acabamos de crear
const { verificarToken } = require('../middlewares/verificarToken');

// La ruta GET queda pública (cualquiera puede ver la lista de usuarios)
router.get('/', usuariosController.obtenerUsuarios);

// Ponemos el verificarToken justo en el medio para proteger la ruta PUT
router.put('/:id', verificarToken, usuariosController.actualizarPerfil);

module.exports = router;