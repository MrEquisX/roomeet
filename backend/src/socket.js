let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

const salaUsuario = (userId) => `user:${String(userId)}`;

const emitirAUsuario = (userId, evento, payload) => {
  if (!ioInstance || !userId) {
    return;
  }

  try {
    ioInstance.to(salaUsuario(userId)).emit(evento, payload);
  } catch (error) {
    console.error(`[socket] Error al emitir "${evento}":`, error.message);
  }
};

module.exports = {
  setIO,
  getIO,
  salaUsuario,
  emitirAUsuario,
};
