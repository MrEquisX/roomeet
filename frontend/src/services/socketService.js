import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

let socketInstance = null;
const reconnectCallbacks = new Set();

export function onSocketReconnect(callback) {
  reconnectCallbacks.add(callback);
  return () => reconnectCallbacks.delete(callback);
}

function notificarReconexion() {
  reconnectCallbacks.forEach((cb) => {
    try {
      cb();
    } catch (error) {
      console.error('[socketService] Error en callback de reconexión:', error);
    }
  });
}

function crearSocket(token) {
  const socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    if (socket.recovered === false && socket.io.engine?.prevSocket) {
      notificarReconexion();
    }
  });

  socket.io.on('reconnect', () => {
    notificarReconexion();
  });

  socket.on('connect_error', (error) => {
    const mensaje = error?.message || '';
    if (mensaje.includes('Token') || mensaje.includes('token') || mensaje.includes('Acceso denegado')) {
      disconnectSocket();
    }
  });

  return socket;
}

export function getSocket() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = crearSocket(token);
    return socketInstance;
  }

  const tokenActual = socketInstance.auth?.token;
  if (tokenActual !== token) {
    socketInstance.disconnect();
    socketInstance = crearSocket(token);
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function subscribeSocketEvent(evento, handler) {
  const socket = getSocket();
  if (!socket) {
    return () => {};
  }

  socket.on(evento, handler);

  return () => {
    socket.off(evento, handler);
  };
}

export function joinChatRoom(chatId) {
  const socket = getSocket();
  if (socket && chatId) {
    socket.emit('joinChat', String(chatId));
  }
}
