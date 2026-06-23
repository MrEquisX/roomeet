const mongoose = require('mongoose');
const Chat = require('./models/Chat');
const { verificarMatchMutuo } = require('./controllers/matches.controller');

const usuarioEsParticipante = (chat, userId) => {
  const idStr = String(userId);
  return chat.participantes.some((p) => String(p) === idStr);
};

const obtenerOtroParticipanteId = (chat, userId) => {
  for (const p of chat.participantes) {
    const pid = String(p);
    if (pid !== String(userId)) {
      return p;
    }
  }
  return null;
};

const autorizarAccesoChat = async (userId, chatId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return { autorizado: false, motivo: 'ID de chat inválido.' };
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return { autorizado: false, motivo: 'Chat no encontrado.' };
  }

  if (!usuarioEsParticipante(chat, userId)) {
    return { autorizado: false, motivo: 'No eres participante de este chat.' };
  }

  const otroId = obtenerOtroParticipanteId(chat, userId);
  if (!otroId) {
    return { autorizado: false, motivo: 'Chat inválido.' };
  }

  const esMutuo = await verificarMatchMutuo(userId, otroId);
  if (!esMutuo) {
    return { autorizado: false, motivo: 'Match mutuo requerido para acceder al chat.' };
  }

  return { autorizado: true, chat };
};

const registrarHandlersSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.usuario?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('joinChat', async (chatId) => {
      try {
        const { autorizado, motivo } = await autorizarAccesoChat(userId, chatId);

        if (!autorizado) {
          socket.emit('error_chat', { mensaje: motivo || 'Acceso denegado al chat.' });
          return;
        }

        socket.join(String(chatId));
      } catch (error) {
        console.error('[socket joinChat] Error:', error.message);
        socket.emit('error_chat', { mensaje: 'No se pudo unir a la sala de chat.' });
      }
    });

    // Los mensajes en tiempo real se emiten desde el REST POST /chats/:id/mensajes
    // para evitar spoofing y garantizar persistencia antes del broadcast.
  });
};

module.exports = {
  autorizarAccesoChat,
  registrarHandlersSocket,
};
