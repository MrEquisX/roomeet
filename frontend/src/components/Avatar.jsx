import { useEffect, useState } from 'react';
import { getImageUrl, getInicialesAvatar } from '../utils/mediaUrl';

function Avatar({
  src,
  nombre = '',
  alt,
  className = '',
  imgClassName = 'object-cover',
  fallbackClassName = '',
}) {
  const [falloCarga, setFalloCarga] = useState(false);
  const urlResuelta = getImageUrl(src);
  const iniciales = getInicialesAvatar(nombre);
  const textoAlt = alt || (nombre ? `Foto de ${nombre}` : 'Avatar');

  useEffect(() => {
    setFalloCarga(false);
  }, [src]);

  const clasesFallback = [
    'flex items-center justify-center bg-linear-to-tr from-gray-700 to-gray-900 text-white font-bold select-none uppercase',
    className,
    fallbackClassName,
  ].filter(Boolean).join(' ');

  if (!urlResuelta || falloCarga) {
    return (
      <div className={clasesFallback} aria-label={textoAlt}>
        {iniciales}
      </div>
    );
  }

  return (
    <img
      src={urlResuelta}
      alt={textoAlt}
      className={[className, imgClassName].filter(Boolean).join(' ')}
      loading="lazy"
      decoding="async"
      onError={() => setFalloCarga(true)}
    />
  );
}

export default Avatar;
