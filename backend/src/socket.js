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
  ioInstance.to(salaUsuario(userId)).emit(evento, payload);
};

module.exports = {
  setIO,
  getIO,
  salaUsuario,
  emitirAUsuario,
};
