const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Mensaje = require('../models/Mensaje');
const Usuario = require('../models/Usuario');
const MatchUsuario = require('../models/MatchUsuario');
const { crearChatMutuo, verificarMatchMutuo } = require('./matches.controller');
const { getIO } = require('../socket');
const { sanitizarTexto, MAX_MENSAJE_LENGTH } = require('../utils/sanitize');

const obtenerIdDesdeToken = (req) => {
  return req.usuario?.id ?? req.usuario?.id_usuario;
};

const formatearHora = (fecha) => {
  if (!fecha) {
    return '';
  }
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
};

const formatearFechaUltimoMensaje = (fecha) => {
  if (!fecha) {
    return '';
  }
  const d = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  const mismaFecha = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  if (mismaFecha(d, hoy)) {
    return formatearHora(fecha);
  }

  if (mismaFecha(d, ayer)) {
    return 'Ayer';
  }

  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
};

const usuarioEsParticipante = (chat, idUsuario) => {
  const idStr = String(idUsuario);
  for (const p of chat.participantes) {
    if (String(p) === idStr || String(p._id) === idStr) {
      return true;
    }
  }
  return false;
};

const obtenerOtroParticipante = (chat, idUsuario) => {
  const idStr = String(idUsuario);
  for (const p of chat.participantes) {
    const pid = String(p._id || p);
    if (pid !== idStr) {
      return p;
    }
  }
  return null;
};

const obtenerOtroIdDesdeChat = (chat, idUsuario) => {
  for (const p of chat.participantes) {
    const pid = String(p._id || p);
    if (pid !== String(idUsuario)) {
      return p._id || p;
    }
  }
  return null;
};

// GET /api/chats — Solo conversaciones con match mutuo
const listarChats = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  try {
    const chats = await Chat.find({
      participantes: idUsuario,
      archivado:     false,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const resultado = [];

    for (const chat of chats) {
      const otroId = obtenerOtroIdDesdeChat(chat, idUsuario);
      if (!otroId) {
        continue;
      }

      const esMutuo = await verificarMatchMutuo(idUsuario, otroId);
      if (!esMutuo) {
        continue;
      }

      const otroUsuario = await Usuario.findById(otroId)
        .select('nombre_completo foto_perfil fecha_nacimiento')
        .lean();

      if (!otroUsuario) {
        continue;
      }

      const ultimoMensaje = await Mensaje.findOne({ id_chat: chat._id })
        .sort({ createdAt: -1 })
        .lean();

      let extractoUltimo = 'No hay mensajes aún';
      let horaUltimo = '';

      if (ultimoMensaje) {
        extractoUltimo = ultimoMensaje.texto;
        horaUltimo = formatearFechaUltimoMensaje(ultimoMensaje.createdAt);
      }

      resultado.push({
        id_chat:          chat._id,
        nombre:           otroUsuario.nombre_completo,
        foto:             otroUsuario.foto_perfil,
        fecha_nacimiento: otroUsuario.fecha_nacimiento,
        id_usuario:       otroUsuario._id,
        es_mutuo:         true,
        ultimoMensaje: {
          texto:     extractoUltimo,
          hora:      horaUltimo,
          createdAt: ultimoMensaje ? ultimoMensaje.createdAt : null,
        },
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al listar chats:', error);
    return res.status(500).json({ mensaje: 'Error al cargar chats.' });
  }
};

// GET /api/chats/:id — Detalle del chat + contacto + estado mutuo
const obtenerChat = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const chatId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ mensaje: 'ID de chat inválido.' });
  }

  try {
    const chat = await Chat.findById(chatId).populate(
      'participantes',
      'nombre_completo foto_perfil fecha_nacimiento'
    );

    if (!chat) {
      return res.status(404).json({ mensaje: 'Chat no encontrado.' });
    }

    if (!usuarioEsParticipante(chat, idUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes acceso a este chat.' });
    }

    const contacto = obtenerOtroParticipante(chat, idUsuario);
    const otroId = contacto?._id || contacto?.id;
    const esMutuo = otroId ? await verificarMatchMutuo(idUsuario, otroId) : false;

    return res.status(200).json({
      id_chat:         chat._id,
      contacto,
      es_mutuo:        esMutuo,
      chat_habilitado: esMutuo,
    });
  } catch (error) {
    console.error('Error al obtener chat:', error);
    return res.status(500).json({ mensaje: 'Error al obtener el chat.' });
  }
};

// GET /api/chats/:id/mensajes
const obtenerMensajes = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const chatId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ mensaje: 'ID de chat inválido.' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ mensaje: 'Chat no encontrado.' });
    }

    if (!usuarioEsParticipante(chat, idUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes acceso a este chat.' });
    }

    const otroId = obtenerOtroIdDesdeChat(chat, idUsuario);
    const esMutuo = otroId ? await verificarMatchMutuo(idUsuario, otroId) : false;

    if (!esMutuo) {
      return res.status(403).json({
        mensaje: 'Chat inhabilitado. Esperando a que el otro usuario acepte la solicitud.',
        chat_habilitado: false,
      });
    }

    const mensajes = await Mensaje.find({ id_chat: chatId })
      .sort({ createdAt: 1 })
      .lean();

    const formateados = mensajes.map((m) => {
      let remitente = 'otro';
      if (String(m.id_remitente) === String(idUsuario)) {
        remitente = 'yo';
      }

      return {
        id:        m._id,
        tipo:      m.tipo || 'texto',
        texto:     m.texto,
        remitente,
        hora:      formatearHora(m.createdAt),
        createdAt: m.createdAt,
      };
    });

    return res.status(200).json(formateados);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return res.status(500).json({ mensaje: 'Error al cargar mensajes.' });
  }
};

// POST /api/chats/:id/mensajes — Solo con match mutuo
const enviarMensaje = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const chatId = req.params.id;
  const { texto } = req.body;
  const textoSanitizado = sanitizarTexto(texto);

  if (!textoSanitizado) {
    return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío.' });
  }

  if (String(texto).trim().length > MAX_MENSAJE_LENGTH) {
    return res.status(400).json({
      mensaje: `El mensaje no puede superar ${MAX_MENSAJE_LENGTH} caracteres.`,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ mensaje: 'ID de chat inválido.' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ mensaje: 'Chat no encontrado.' });
    }

    if (!usuarioEsParticipante(chat, idUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes acceso a este chat.' });
    }

    const otroId = obtenerOtroIdDesdeChat(chat, idUsuario);
    const esMutuo = otroId ? await verificarMatchMutuo(idUsuario, otroId) : false;

    if (!esMutuo) {
      return res.status(403).json({
        mensaje: 'Chat inhabilitado. Esperando a que el otro usuario acepte la solicitud.',
        chat_habilitado: false,
      });
    }

    const mensaje = await Mensaje.create({
      id_chat:      chatId,
      id_remitente: idUsuario,
      texto:        textoSanitizado,
      tipo:         'texto',
    });

    await Chat.updateOne({ _id: chatId }, { updatedAt: new Date() });

    const formateado = {
      id:        mensaje._id,
      tipo:      'texto',
      texto:     mensaje.texto,
      remitente: 'yo',
      hora:      formatearHora(mensaje.createdAt),
      createdAt: mensaje.createdAt,
    };

    const payloadReceptor = {
      ...formateado,
      remitente: 'otro',
    };

    const io = getIO();
    if (io) {
      io.to(String(chatId)).emit('nuevoMensaje', payloadReceptor);
    }

    return res.status(201).json(formateado);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ mensaje: 'Error al enviar el mensaje.' });
  }
};

// GET /api/chats/con-usuario/:otroUsuarioId — Solo si hay match mutuo
const obtenerChatConUsuario = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const otroId = req.params.otroUsuarioId;

  if (!mongoose.Types.ObjectId.isValid(otroId)) {
    return res.status(400).json({ mensaje: 'ID de usuario inválido.' });
  }

  try {
    const esMutuo = await verificarMatchMutuo(idUsuario, otroId);

    if (!esMutuo) {
      const yoLoAcepte = await MatchUsuario.findOne({
        id_usuario:      idUsuario,
        id_destinatario: otroId,
      });
      const ellosMeAceptaron = await MatchUsuario.findOne({
        id_usuario:      otroId,
        id_destinatario: idUsuario,
      });

      let mensaje = 'Debes tener un match mutuo para chatear.';
      if (yoLoAcepte && !ellosMeAceptaron) {
        mensaje = 'Esperando a que el otro usuario acepte tu solicitud.';
      } else if (ellosMeAceptaron && !yoLoAcepte) {
        mensaje = 'Este usuario te envió una solicitud. Respóndela desde tus notificaciones.';
      }

      return res.status(403).json({
        mensaje,
        chat_habilitado: false,
        es_mutuo: false,
      });
    }

    const chat = await crearChatMutuo(idUsuario, otroId);
    const contacto = await Usuario.findById(otroId)
      .select('nombre_completo foto_perfil fecha_nacimiento')
      .lean();

    return res.status(200).json({
      id_chat:         chat._id,
      contacto,
      es_mutuo:        true,
      chat_habilitado: true,
    });
  } catch (error) {
    console.error('Error al obtener chat con usuario:', error);
    return res.status(500).json({ mensaje: 'Error al abrir el chat.' });
  }
};

const listarArchivados = async (req, res) => {
  return res.status(200).json([]);
};

module.exports = {
  listarChats,
  obtenerChat,
  obtenerMensajes,
  enviarMensaje,
  obtenerChatConUsuario,
  listarArchivados,
};
