import { useEffect } from 'react';

const STYLES = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-blue-600 text-white',
};

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] px-4 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-start gap-3 ${STYLES[type] || STYLES.info}`}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-80 hover:opacity-100"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
