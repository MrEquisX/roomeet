import { apiClient } from './apiClient';
import { getSocket, subscribeSocketEvent, onSocketReconnect } from './socketService';

const STORAGE_KEY = 'roomeet_chats_leidos';

let hasUnread = false;
let unreadCount = 0;
const listeners = new Set();
let initialized = false;

function emitChange() {
  const snapshot = { hasUnread, unreadCount };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('[unreadChatsService] Error en listener:', error);
    }
  });
}

function getLeidosMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function normalizarListaChats(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  return [];
}

function chatTieneNoLeidos(item) {
  const ultimo = item?.ultimoMensaje;
  if (!ultimo?.es_de_otro) {
    return false;
  }

  const chatId = String(item.id_chat || item._id || '');
  if (!chatId) {
    return false;
  }

  const leidoAt = getLeidosMap()[chatId];
  if (!leidoAt) {
    return true;
  }

  if (!ultimo.createdAt) {
    return true;
  }

  return new Date(ultimo.createdAt) > new Date(leidoAt);
}

export function markChatAsRead(chatId) {
  if (!chatId) {
    return;
  }

  const map = getLeidosMap();
  map[String(chatId)] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  refreshUnreadCount();
}

export async function refreshUnreadCount() {
  const token = localStorage.getItem('token');
  if (!token) {
    hasUnread = false;
    unreadCount = 0;
    emitChange();
    return;
  }

  try {
    const data = await apiClient.get('/chats');
    const lista = normalizarListaChats(data);
    unreadCount = lista.filter(chatTieneNoLeidos).length;
    hasUnread = unreadCount > 0;
  } catch {
    hasUnread = false;
    unreadCount = 0;
  }

  emitChange();
}

export function subscribeUnreadChats(listener) {
  listeners.add(listener);
  listener({ hasUnread, unreadCount });
  return () => {
    listeners.delete(listener);
  };
}

export function initUnreadChatsListener() {
  if (initialized) {
    return;
  }
  initialized = true;

  getSocket();
  refreshUnreadCount();

  subscribeSocketEvent('mensaje_no_leido', () => {
    refreshUnreadCount();
  });

  onSocketReconnect(() => {
    refreshUnreadCount();
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    });
  }
}
