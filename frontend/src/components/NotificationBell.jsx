import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import {
  getSocket,
  subscribeSocketEvent,
  onSocketReconnect,
} from '../services/socketService';
import { API_BASE } from '../config/env.js';
import Toast from './Toast.jsx';

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const getIniciales = (nombre) => {
  if (!nombre) {
    return '?';
  }
  return nombre.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

function NotificationBell() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [toast, setToast] = useState(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const cerrarToast = useCallback(() => setToast(null), []);

  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const respuesta = await apiClient.get('/matches/notificaciones');
      const lista = Array.isArray(respuesta?.data) ? respuesta.data : [];
      setNotificaciones(lista);
    } catch (error) {
      setNotificaciones([]);
      setErrorCarga(error?.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    getSocket();

    const desuscribirNueva = subscribeSocketEvent('nueva_notificacion', (payload) => {
      if (!payload?.from?._id) {
        cargarNotificaciones();
        return;
      }

      setNotificaciones((prev) => {
        const yaExiste = prev.some((n) => String(n.from?._id) === String(payload.from._id));
        if (yaExiste) {
          return prev;
        }
        return [{
          matchId: payload.matchId,
          createdAt: payload.createdAt,
          from: payload.from,
        }, ...prev];
      });
    });

    const desuscribirMutuo = subscribeSocketEvent('match_mutuo', (payload) => {
      if (payload?.usuario?._id) {
        setNotificaciones((prev) => {
          return prev.filter((n) => String(n.from?._id) !== String(payload.usuario._id));
        });
      }
    });

    const desuscribirReconnect = onSocketReconnect(() => {
      cargarNotificaciones();
    });

    return () => {
      desuscribirNueva();
      desuscribirMutuo();
      desuscribirReconnect();
    };
  }, [cargarNotificaciones]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setAbierto(false);
      }
    };

    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [abierto]);

  const aceptarSolicitud = async (usuarioId) => {
    if (!usuarioId || procesandoId) {
      return;
    }

    setProcesandoId(String(usuarioId));
    try {
      const respuesta = await apiClient.post('/matches', { id_destinatario: String(usuarioId) });

      setNotificaciones((prev) => {
        return prev.filter((n) => String(n.from?._id) !== String(usuarioId));
      });

      if (respuesta?.data?.es_mutuo && respuesta?.data?.chatId) {
        setToast({ type: 'success', message: '¡Match mutuo! Abriendo chat...' });
        navigate(`/chat/${respuesta.data.chatId}`);
      } else {
        setToast({ type: 'success', message: 'Solicitud aceptada.' });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error?.message || 'No se pudo aceptar la solicitud.',
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const rechazarSolicitud = async (usuarioId) => {
    if (!usuarioId || procesandoId) {
      return;
    }

    setProcesandoId(String(usuarioId));
    try {
      await apiClient.post('/matches/rechazar', { id_destinatario: String(usuarioId) });
      setNotificaciones((prev) => {
        return prev.filter((n) => String(n.from?._id) !== String(usuarioId));
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error?.message || 'No se pudo rechazar la solicitud.',
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const total = notificaciones.length;

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={cerrarToast} />
      )}

      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => {
            setAbierto((prev) => !prev);
            if (!abierto) {
              cargarNotificaciones();
            }
          }}
          className="relative w-10 h-10 rounded-2xl bg-gray-100 hover:bg-blue-50 border border-gray-200 flex items-center justify-center transition-colors"
          aria-label="Notificaciones"
        >
          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {total > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {total > 9 ? '9+' : total}
            </span>
          )}
        </button>

        {abierto && (
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Solicitudes pendientes</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Acepta o rechaza para conectar</p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {cargando && (
                <p className="text-center text-xs text-gray-400 py-6">Cargando...</p>
              )}

              {!cargando && errorCarga && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-red-600 mb-2">{errorCarga}</p>
                  <button
                    type="button"
                    onClick={cargarNotificaciones}
                    className="text-xs font-bold text-blue-600 underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!cargando && !errorCarga && notificaciones.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8 px-4">
                  No tienes solicitudes pendientes
                </p>
              )}

              {!cargando && !errorCarga && notificaciones.map((item) => {
                const usuario = item.from || {};
                const usuarioId = usuario._id;
                const fotoUrl = getImageUrl(usuario.foto_perfil);
                const nombre = usuario.nombre_completo || 'Estudiante';
                const estaProcesando = procesandoId === String(usuarioId);

                return (
                  <div key={item.matchId || usuarioId} className="px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt={nombre} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {getIniciales(nombre)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{nombre}</p>
                        <p className="text-[11px] text-gray-500">Quiere conectar contigo</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() => rechazarSolicitud(usuarioId)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() => aceptarSolicitud(usuarioId)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {estaProcesando ? '...' : 'Aceptar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBell;
