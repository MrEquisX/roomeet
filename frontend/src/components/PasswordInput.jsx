import { useState } from 'react';

function PasswordInput(props) {
  const valor = props.value;
  const alCambiar = props.onChange;
  const placeholder = props.placeholder || '••••••••';
  const deshabilitado = props.disabled || false;
  const className = props.className || '';
  const autoComplete = props.autoComplete || 'current-password';
  const requerido = props.required || false;
  const nombre = props.name;
  const id = props.id;

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const alternarVisibilidad = () => {
    if (mostrarPassword) {
      setMostrarPassword(false);
    } else {
      setMostrarPassword(true);
    }
  };

  let tipoInput = 'password';
  if (mostrarPassword) {
    tipoInput = 'text';
  }

  let etiquetaBoton = 'Mostrar contraseña';
  if (mostrarPassword) {
    etiquetaBoton = 'Ocultar contraseña';
  }

  const clasesInput = `${className} pr-12`;

  return (
    <div className="relative">
      <input
        type={tipoInput}
        value={valor}
        onChange={alCambiar}
        placeholder={placeholder}
        disabled={deshabilitado}
        required={requerido}
        name={nombre}
        id={id}
        autoComplete={autoComplete}
        className={clasesInput}
      />

      <button
        type="button"
        onClick={alternarVisibilidad}
        disabled={deshabilitado}
        aria-label={etiquetaBoton}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
      >
        {mostrarPassword && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 3.03a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
        {!mostrarPassword && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
