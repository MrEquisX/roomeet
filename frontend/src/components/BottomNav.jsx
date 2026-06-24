import { Link } from 'react-router-dom';
import { useUnreadChats } from '../hooks/useUnreadChats';

function BottomNav({ active = null }) {
  const { hasUnread } = useUnreadChats();

  const claseInicio = active === 'inicio'
    ? 'flex flex-col items-center text-blue-600 w-16'
    : 'flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors';

  const claseChats = active === 'chats'
    ? 'flex flex-col items-center text-blue-600 relative w-16 transition-colors'
    : 'flex flex-col items-center text-gray-400 hover:text-blue-500 relative w-16 transition-colors';

  const clasePerfil = active === 'perfil'
    ? 'flex flex-col items-center text-blue-600 w-16 transition-colors'
    : 'flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors';

  const etiquetaActiva = 'text-[10px] font-bold';
  const etiquetaInactiva = 'text-[10px] font-medium';

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50 pb-safe">
      <Link to="/dashboard" className={claseInicio}>
        <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className={active === 'inicio' ? etiquetaActiva : etiquetaInactiva}>Inicio</span>
      </Link>

      <Link to="/chats" className={claseChats}>
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {hasUnread && (
          <span
            className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
            aria-label="Mensajes no leídos"
          />
        )}
        <span className={active === 'chats' ? etiquetaActiva : etiquetaInactiva}>Chats</span>
      </Link>

      <Link to="/perfil" className={clasePerfil}>
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className={active === 'perfil' ? etiquetaActiva : etiquetaInactiva}>Perfil</span>
      </Link>
    </div>
  );
}

export default BottomNav;
