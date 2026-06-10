const mongoose = require('mongoose');
const FavoritoUsuario = require('../models/FavoritoUsuario');
const Usuario = require('../models/Usuario');

const obtenerIdDesdeToken = (req) => {
  return req.usuario?.id ?? req.usuario?.id_usuario;
};

// POST /api/favoritos/usuario
const agregarFavoritoUsuario = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const { id_usuario_favorito } = req.body;

  if (!idUsuario) {
    return res.status(401).json({ mensaje: 'Usuario autenticado no identificado.' });
  }

  if (!id_usuario_favorito) {
    return res.status(400).json({ mensaje: 'id_usuario_favorito es obligatorio.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id_usuario_favorito)) {
    return res.status(400).json({ mensaje: 'ID de usuario inválido.' });
  }

  if (String(id_usuario_favorito) === String(idUsuario)) {
    return res.status(400).json({ mensaje: 'No puedes guardarte a ti mismo como favorito.' });
  }

  try {
    const existe = await Usuario.findById(id_usuario_favorito).select('_id');
    if (!existe) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const favorito = await FavoritoUsuario.create({
      id_usuario:          idUsuario,
      id_usuario_favorito: id_usuario_favorito,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario guardado en favoritos.',
      data: favorito,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'Este usuario ya está en tus favoritos.' });
    }
    console.error('Error al agregar favorito de usuario:', error);
    return res.status(500).json({ mensaje: 'Error al agregar a favoritos.' });
  }
};

// GET /api/favoritos/usuario
const obtenerFavoritosUsuario = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  if (!idUsuario) {
    return res.status(401).json({ mensaje: 'Usuario autenticado no identificado.' });
  }

  try {
    const favoritos = await FavoritoUsuario.find({ id_usuario: idUsuario })
      .populate('id_usuario_favorito', 'nombre_completo foto_perfil fecha_nacimiento perfil_academico rol')
      .sort({ createdAt: -1 })
      .lean();

    const usuarios = favoritos
      .map((f) => f.id_usuario_favorito)
      .filter(Boolean);

    return res.status(200).json({
      exito: true,
      data: usuarios,
    });
  } catch (error) {
    console.error('Error al obtener favoritos de usuario:', error);
    return res.status(500).json({ mensaje: 'Error al obtener favoritos.' });
  }
};

// DELETE /api/favoritos/usuario/:id
const eliminarFavoritoUsuario = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const idFavorito = req.params.id;

  if (!idUsuario) {
    return res.status(401).json({ mensaje: 'Usuario autenticado no identificado.' });
  }

  if (!mongoose.Types.ObjectId.isValid(idFavorito)) {
    return res.status(400).json({ mensaje: 'ID inválido.' });
  }

  try {
    const resultado = await FavoritoUsuario.findOneAndDelete({
      id_usuario:           idUsuario,
      id_usuario_favorito: idFavorito,
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Favorito no encontrado.' });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Eliminado de favoritos.',
    });
  } catch (error) {
    console.error('Error al eliminar favorito de usuario:', error);
    return res.status(500).json({ mensaje: 'Error al eliminar favorito.' });
  }
};

module.exports = {
  agregarFavoritoUsuario,
  obtenerFavoritosUsuario,
  eliminarFavoritoUsuario,
};
