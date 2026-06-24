import { useState, useEffect, useCallback } from 'react';
import Toast from './Toast.jsx';
import {
  getSocket,
  subscribeSocketEvent,
  onSocketReconnect,
} from '../services/socketService.js';

function resolverTipoToast(tipo) {
  if (tipo === 'match_mutuo') {
    return 'success';
  }
  if (tipo === 'rechazo') {
    return 'error';
  }
  if (tipo === 'confirmacion') {
    return 'success';
  }
  return 'info';
}

function MatchToastListener() {
  const [toast, setToast] = useState(null);
  const cerrarToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    getSocket();

    const mostrarDesdePayload = (payload) => {
      if (!payload?.mensaje || typeof payload.mensaje !== 'string') {
        return;
      }

      setToast({
        message: payload.mensaje,
        type: resolverTipoToast(payload.tipo),
      });
    };

    const desuscribirMatch = subscribeSocketEvent('notificacion_match', mostrarDesdePayload);

    const desuscribirMutuo = subscribeSocketEvent('match_mutuo', (payload) => {
      const nombre = payload?.usuario?.nombre_completo?.split(' ')[0] || 'tu match';
      mostrarDesdePayload({
        tipo: 'match_mutuo',
        mensaje: `¡Match mutuo con ${nombre}! Ya pueden chatear.`,
      });
    });

    const desuscribirNueva = subscribeSocketEvent('nueva_notificacion', (payload) => {
      const nombre = payload?.from?.nombre_completo?.split(' ')[0] || 'Alguien';
      mostrarDesdePayload({
        tipo: 'solicitud',
        mensaje: `${nombre} te envió una solicitud de match.`,
      });
    });

    const desuscribirReconnect = onSocketReconnect(() => {
      getSocket();
    });

    return () => {
      desuscribirMatch();
      desuscribirMutuo();
      desuscribirNueva();
      desuscribirReconnect();
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={cerrarToast}
    />
  );
}

export default MatchToastListener;
