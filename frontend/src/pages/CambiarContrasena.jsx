import { useState } from 'react';
import { apiClient } from '../services/apiClient';

const CambiarContrasena = (props) => {
  const onClose = props.onClose;
  const onExito = props.onExito;

  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiarFormulario = () => {
    setContrasenaActual('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    setMensajeExito('');
    setMensajeError('');

    if (!contrasenaActual) {
      setMensajeError('Debes ingresar tu contraseña actual.');
      return;
    }

    if (!nuevaContrasena) {
      setMensajeError('Debes ingresar una nueva contraseña.');
      return;
    }

    if (!confirmarContrasena) {
      setMensajeError('Debes confirmar la nueva contraseña.');
      return;
    }

    if (nuevaContrasena.length < 8) {
      setMensajeError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMensajeError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (contrasenaActual === nuevaContrasena) {
      setMensajeError('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setEnviando(true);

    try {
      const cuerpoPeticion = {
        contrasenaActual: contrasenaActual,
        nuevaContrasena: nuevaContrasena,
      };

      const respuesta = await apiClient.put('/usuarios/cambiar-password', cuerpoPeticion);

      if (!respuesta) {
        setMensajeError('Tu sesión expiró. Inicia sesión nuevamente.');
        return;
      }

      const textoExito = respuesta.mensaje || '¡Tu contraseña se actualizó correctamente!';
      setMensajeExito(textoExito);
      limpiarFormulario();

      if (onExito) {
        onExito(textoExito);
      }

    } catch (error) {
      let textoError = 'No se pudo cambiar la contraseña. Inténtalo nuevamente.';

      if (error && error.message) {
        textoError = error.message;
      }

      setMensajeError(textoError);

    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full">
      {mensajeExito && (
        <div className="mb-5 text-green-700 text-center font-bold bg-green-50 rounded-xl p-3 border border-green-200">
          <span className="text-xl mr-2">✅</span>
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mb-5 text-red-600 text-center font-bold bg-red-50 rounded-xl p-3 border border-red-200">
          <span className="text-xl mr-2">❌</span>
          {mensajeError}
        </div>
      )}

      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-4 mx-auto">
        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-blue-900 text-center mb-2">Cambiar Contraseña</h3>
      <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
        Ingresa tu contraseña actual y elige una nueva clave segura de al menos 8 caracteres.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
            Contraseña Actual
          </label>
          <input
            type="password"
            value={contrasenaActual}
            onChange={(evento) => {
              setContrasenaActual(evento.target.value);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={enviando}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
            Nueva Contraseña
          </label>
          <input
            type="password"
            value={nuevaContrasena}
            onChange={(evento) => {
              setNuevaContrasena(evento.target.value);
            }}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={enviando}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            value={confirmarContrasena}
            onChange={(evento) => {
              setConfirmarContrasena(evento.target.value);
            }}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={enviando}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>

          <button
            type="button"
            onClick={handleCancelar}
            disabled={enviando}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CambiarContrasena;
