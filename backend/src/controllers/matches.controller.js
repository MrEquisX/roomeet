const mongoose = require('mongoose');
const MatchUsuario = require('../models/MatchUsuario');
const Chat = require('../models/Chat');
const Usuario = require('../models/Usuario');

const obtenerIdDesdeToken = (req) => {
  return req.usuario?.id ?? req.usuario?.id_usuario;
};

const ordenarParticipantes = (idA, idB) => {
  const strA = String(idA);
  const strB = String(idB);
  if (strA < strB) {
    return [idA, idB];
  }
  return [idB, idA];
};

const buscarOCrearChat = async (idUsuario, idOtro) => {
  let chat = await Chat.findOne({
    participantes: { $all: [idUsuario, idOtro], $size: 2 },
  });
  if (!chat) {
    const [p1, p2] = ordenarParticipantes(idUsuario, idOtro);
    chat = await Chat.create({ participantes: [p1, p2] });
  }
  return chat;
};

const calcularEsMutuo = async (idUsuario, idDestinatario) => {
  const reciproco = await MatchUsuario.findOne({
    id_usuario:      idDestinatario,
    id_destinatario: idUsuario,
  });
  return !!reciproco;
};

// POST /api/matches  — Aceptar perfil (swipe derecha)
const crearMatch = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const { id_destinatario } = req.body;

  if (!id_destinatario) {
    return res.status(400).json({ mensaje: 'id_destinatario es obligatorio.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id_destinatario)) {
    return res.status(400).json({ mensaje: 'id_destinatario inválido.' });
  }

  if (String(id_destinatario) === String(idUsuario)) {
    return res.status(400).json({ mensaje: 'No puedes hacer match contigo mismo.' });
  }

  try {
    const destinatarioExiste = await Usuario.findById(id_destinatario).select('_id');
    if (!destinatarioExiste) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    let match = await MatchUsuario.findOne({
      id_usuario:      idUsuario,
      id_destinatario: id_destinatario,
    });

    if (!match) {
      match = await MatchUsuario.create({
        id_usuario:      idUsuario,
        id_destinatario: id_destinatario,
        es_mutuo:        false,
      });
    }

    const esMutuo = await calcularEsMutuo(idUsuario, id_destinatario);
    if (esMutuo && !match.es_mutuo) {
      match.es_mutuo = true;
      await match.save();
      await MatchUsuario.updateOne(
        { id_usuario: id_destinatario, id_destinatario: idUsuario },
        { es_mutuo: true }
      );
    }

    const chat = await buscarOCrearChat(idUsuario, id_destinatario);

    return res.status(201).json({
      exito: true,
      mensaje: 'Match registrado. Ya puedes chatear.',
      data: {
        match,
        chatId: chat._id,
        es_mutuo: esMutuo,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const chat = await buscarOCrearChat(idUsuario, id_destinatario);
      return res.status(200).json({
        exito: true,
        mensaje: 'Ya habías aceptado a este usuario.',
        data: { chatId: chat._id },
      });
    }
    console.error('Error al crear match:', error);
    return res.status(500).json({ mensaje: 'Error al registrar el match.' });
  }
};

// GET /api/matches — Lista de usuarios aceptados por mí (para chats)
const obtenerMisMatches = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  try {
    const matches = await MatchUsuario.find({ id_usuario: idUsuario })
      .populate('id_destinatario', 'nombre_completo foto_perfil fecha_nacimiento')
      .sort({ createdAt: -1 })
      .lean();

    const resultado = [];

    for (const item of matches) {
      const otro = item.id_destinatario;
      if (!otro) {
        continue;
      }

      const chat = await buscarOCrearChat(idUsuario, otro._id);

      resultado.push({
        matchId:   item._id,
        chatId:    chat._id,
        es_mutuo:  item.es_mutuo,
        usuario:   otro,
      });
    }

    return res.status(200).json({
      exito: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Error al obtener matches:', error);
    return res.status(500).json({ mensaje: 'Error al obtener matches.' });
  }
};

module.exports = {
  crearMatch,
  obtenerMisMatches,
  buscarOCrearChat,
  ordenarParticipantes,
};
