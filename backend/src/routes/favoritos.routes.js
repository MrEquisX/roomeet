const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middlewares/verificarToken');

router.post('/', verificarToken, favoritosController.agregarFavorito);
router.get('/', verificarToken, favoritosController.obtenerMisFavoritos);
router.delete('/:id', verificarToken, favoritosController.eliminarFavorito);

module.exports = router;