import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  INTERESES_OPCIONES,
  OPCIONES_FUMA,
  OPCIONES_BEBE,
  OPCIONES_MASCOTAS,
  perfilCompletarIncompleto,
} from '../utils/perfilHelpers';
import { API_URL } from '../config/env.js';

const OPCIONES_PREFERENCIA_ACADEMICA = [
  { valor: 'indiferente', etiqueta: 'Indiferente' },
  { valor: 'misma',       etiqueta: 'Sí, de mi misma institución' },
  { valor: 'otra',        etiqueta: 'No, prefiero de otra' },
];

const preferenciaAcademicaABoolean = (valor) => {
  if (valor === 'misma') {
    return true;
  }
  return false;
};

const CompletarPerfil = (props) => {
  const navigate = useNavigate();

  const CROP_SIZE = 280;

  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('error');
  const [enviando, setEnviando] = useState(false);
  const [mostrarAlertaIncompleto, setMostrarAlertaIncompleto] = useState(false);

  const [biografia, setBiografia] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [imagenCrudaURL, setImagenCrudaURL] = useState(null);
  const [mostrarModalCrop, setMostrarModalCrop] = useState(false);
  const [imgDisplaySize, setImgDisplaySize] = useState({ w: CROP_SIZE, h: CROP_SIZE });
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [ultimaPos, setUltimaPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [fuma, setFuma] = useState('No');
  const [bebeAlcohol, setBebeAlcohol] = useState('No');
  const [mascotas, setMascotas] = useState('No');
  const [nivelOrden, setNivelOrden] = useState(3);
  const [nivelRuido, setNivelRuido] = useState(3);
  const [horarioPreferido, setHorarioPreferido] = useState('Indiferente');

  const [preferenciaUniversidad, setPreferenciaUniversidad] = useState('indiferente');
  const [preferenciaCarrera, setPreferenciaCarrera] = useState('indiferente');
  const [generoPreferido, setGeneroPreferido] = useState('Indiferente');

  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);

  const fileInputRef = useRef(null);
  const cropImgRef = useRef(null);

  useEffect(() => {
    setImgOffset((prev) => {
      return {
        x: Math.max(-(imgDisplaySize.w * zoom - CROP_SIZE), Math.min(0, prev.x)),
        y: Math.max(-(imgDisplaySize.h * zoom - CROP_SIZE), Math.min(0, prev.y)),
      };
    });
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMensaje('Selecciona un archivo de imagen válido (JPG, PNG, etc.).');
      setTipoMensaje('error');
      return;
    }

    setMensaje('');

    const url = URL.createObjectURL(file);
    setImagenCrudaURL(url);
    setImgOffset({ x: 0, y: 0 });
    setZoom(1);
    setMostrarModalCrop(true);
    e.target.value = '';
  };

  const handleCropImageLoad = () => {
    const img = cropImgRef.current;
    if (!img) {
      return;
    }

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    let w = CROP_SIZE;
    let h = CROP_SIZE;

    if (naturalWidth <= naturalHeight) {
      w = CROP_SIZE;
      h = Math.round(naturalHeight * CROP_SIZE / naturalWidth);
    } else {
      h = CROP_SIZE;
      w = Math.round(naturalWidth * CROP_SIZE / naturalHeight);
    }

    setImgDisplaySize({ w: w, h: h });
    setImgOffset({
      x: -Math.round((w - CROP_SIZE) / 2),
      y: -Math.round((h - CROP_SIZE) / 2),
    });
  };

  const clampOffset = (x, y, w, h) => {
    return {
      x: Math.max(-(w - CROP_SIZE), Math.min(0, x)),
      y: Math.max(-(h - CROP_SIZE), Math.min(0, y)),
    };
  };

  const zoomedSize = () => {
    return {
      w: imgDisplaySize.w * zoom,
      h: imgDisplaySize.h * zoom,
    };
  };

  const handleCropMouseDown = (e) => {
    setArrastrando(true);
    setUltimaPos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleCropMouseMove = (e) => {
    if (!arrastrando) {
      return;
    }

    const dx = e.clientX - ultimaPos.x;
    const dy = e.clientY - ultimaPos.y;
    const tamanioZoom = zoomedSize();

    setImgOffset((prev) => {
      return clampOffset(prev.x + dx, prev.y + dy, tamanioZoom.w, tamanioZoom.h);
    });
    setUltimaPos({ x: e.clientX, y: e.clientY });
  };

  const handleCropMouseUp = () => {
    setArrastrando(false);
  };

  const handleCropTouchStart = (e) => {
    const t = e.touches[0];
    setArrastrando(true);
    setUltimaPos({ x: t.clientX, y: t.clientY });
  };

  const handleCropTouchMove = (e) => {
    if (!arrastrando) {
      return;
    }

    const t = e.touches[0];
    const dx = t.clientX - ultimaPos.x;
    const dy = t.clientY - ultimaPos.y;
    const tamanioZoom = zoomedSize();

    setImgOffset((prev) => {
      return clampOffset(prev.x + dx, prev.y + dy, tamanioZoom.w, tamanioZoom.h);
    });
    setUltimaPos({ x: t.clientX, y: t.clientY });
  };

  const aplicarCrop = () => {
    const img = cropImgRef.current;
    if (!img) {
      return;
    }

    const displayW = imgDisplaySize.w * zoom;
    const displayH = imgDisplaySize.h * zoom;
    const scaleX = img.naturalWidth / displayW;
    const scaleY = img.naturalHeight / displayH;
    const srcX = -imgOffset.x;
    const srcY = -imgOffset.y;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    canvas.getContext('2d').drawImage(
      img,
      srcX * scaleX,
      srcY * scaleY,
      CROP_SIZE * scaleX,
      CROP_SIZE * scaleY,
      0,
      0,
      400,
      400
    );

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], 'foto_perfil.jpg', { type: 'image/jpeg' });

      if (fotoPreview && fotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(fotoPreview);
      }

      setFotoPerfil(croppedFile);
      setFotoPreview(URL.createObjectURL(blob));
      setMostrarModalCrop(false);
      setZoom(1);

      if (imagenCrudaURL) {
        URL.revokeObjectURL(imagenCrudaURL);
      }

      setImagenCrudaURL(null);
    }, 'image/jpeg', 0.92);
  };

  const cancelarCrop = () => {
    setMostrarModalCrop(false);

    if (imagenCrudaURL) {
      URL.revokeObjectURL(imagenCrudaURL);
    }

    setImagenCrudaURL(null);
    setZoom(1);
  };

  const abrirSelectorFoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInteresToggle = (interes) => {
    setInteresesSeleccionados((prev) => {
      if (prev.includes(interes)) {
        return prev.filter((i) => {
          return i !== interes;
        });
      }
      if (prev.length < 5) {
        return [...prev, interes];
      }
      return prev;
    });
  };

  const guardarPerfil = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('No has iniciado sesión.');
      setTipoMensaje('error');
      return false;
    }

    setEnviando(true);
    setMensaje('');

    const soloMismaUniversidad = preferenciaAcademicaABoolean(preferenciaUniversidad);
    const soloMismaCarrera     = preferenciaAcademicaABoolean(preferenciaCarrera);

    const payload = {
      biografia,
      fuma,
      mascotas,
      bebeAlcohol,
      nivelOrden,
      nivelRuido,
      horarioPreferido,
      soloMismaUniversidad,
      soloMismaCarrera,
      generoPreferido,
      interesesSeleccionados,
    };

    try {
      let respuesta;

      if (fotoPerfil) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(
              key,
              typeof value === 'object' ? JSON.stringify(value) : value
            );
          }
        });
        formData.append('foto_perfil', fotoPerfil);

        respuesta = await fetch(`${API_URL}/usuarios/editar`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        respuesta = await fetch(`${API_URL}/usuarios/editar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (respuesta.ok) {
        return true;
      }

      let textoError = 'Error al actualizar el perfil.';
      try {
        const errJson = await respuesta.json();
        textoError = errJson?.mensaje || errJson?.message || textoError;
        if (errJson?.detalles?.length) {
          textoError += ': ' + errJson.detalles.join(', ');
        }
      } catch {
        // mantener mensaje genérico
      }
      setMensaje(textoError);
      setTipoMensaje('error');
      return false;
    } catch {
      setMensaje('Ocurrió un error de red al actualizar tu perfil.');
      setTipoMensaje('error');
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const irAlDashboard = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const incompleto = perfilCompletarIncompleto({
      biografia,
      fotoPerfil,
      fotoPreview,
      interesesSeleccionados,
    });

    if (incompleto) {
      setMostrarAlertaIncompleto(true);
      return;
    }

    const ok = await guardarPerfil();
    if (ok) {
      irAlDashboard();
    }
  };

  const confirmarContinuarIncompleto = async () => {
    setMostrarAlertaIncompleto(false);
    const ok = await guardarPerfil();
    if (ok) {
      irAlDashboard();
    } else {
      irAlDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 flex flex-col relative">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">¡Casi listo! 🎉</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Completa estas preferencias para que nuestro algoritmo encuentre a tus roomies ideales.
        </p>

        {mensaje && (
          <div
            className={`mb-4 text-center py-2 px-4 rounded-xl font-bold transition-all ${
              tipoMensaje === 'exito'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-8">

          <section className="flex flex-col items-center space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={abrirSelectorFoto}
              className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            >
              <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Vista previa de tu foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Subir Foto</span>
              </div>
            </button>

            <span className="text-xs font-semibold text-gray-400">Añade una foto para dar confianza</span>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Sobre ti</h2>
            <textarea
              value={biografia}
              onChange={(e) => {
                setBiografia(e.target.value);
              }}
              rows="3"
              placeholder="Busco un ambiente tranquilo para estudiar, me gusta armar PCs los fines de semana..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Hábitos y Convivencia</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Fumas?</span>
                <select
                  value={fuma}
                  onChange={(e) => {
                    setFuma(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm font-medium focus:outline-none"
                >
                  {OPCIONES_FUMA.map((op) => {
                    return (
                      <option key={op} value={op}>{op}</option>
                    );
                  })}
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Bebes?</span>
                <select
                  value={bebeAlcohol}
                  onChange={(e) => {
                    setBebeAlcohol(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm font-medium focus:outline-none"
                >
                  {OPCIONES_BEBE.map((op) => {
                    return (
                      <option key={op} value={op}>{op}</option>
                    );
                  })}
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Mascotas?</span>
                <select
                  value={mascotas}
                  onChange={(e) => {
                    setMascotas(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm font-medium focus:outline-none"
                >
                  {OPCIONES_MASCOTAS.map((op) => {
                    return (
                      <option key={op} value={op}>{op}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Nivel de Orden (1 al 5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={nivelOrden}
                onChange={(e) => {
                  setNivelOrden(Number(e.target.value));
                }}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Relajado</span><span>Equilibrado</span><span>Estricto</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Tolerancia al Ruido (1 al 5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={nivelRuido}
                onChange={(e) => {
                  setNivelRuido(Number(e.target.value));
                }}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Silencio total</span><span>Normal</span><span>Fiesta</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Horario Preferido</label>
              <select
                value={horarioPreferido}
                onChange={(e) => {
                  setHorarioPreferido(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
              >
                <option value="Diurno">Diurno (Activo de día, duermo de noche)</option>
                <option value="Nocturno">Nocturno (Estudio/Trabajo de noche)</option>
                <option value="Indiferente">Indiferente (Horarios flexibles)</option>
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">
              Busco compañeros que…
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">
                🎓 Universidad
              </label>
              <select
                value={preferenciaUniversidad}
                onChange={(e) => {
                  setPreferenciaUniversidad(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
              >
                {OPCIONES_PREFERENCIA_ACADEMICA.map((opcion) => {
                  return (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.etiqueta}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">
                📚 Carrera
              </label>
              <select
                value={preferenciaCarrera}
                onChange={(e) => {
                  setPreferenciaCarrera(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
              >
                {OPCIONES_PREFERENCIA_ACADEMICA.map((opcion) => {
                  return (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.etiqueta}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Género preferido</label>
              <select
                value={generoPreferido}
                onChange={(e) => {
                  setGeneroPreferido(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
              >
                <option value="Indiferente">Indiferente</option>
                <option value="Solo Mujeres">Solo Mujeres</option>
                <option value="Solo Hombres">Solo Hombres</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-end border-b border-gray-100 pb-1">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Tus Intereses</h2>
              <span className="text-[10px] font-bold text-gray-400">{interesesSeleccionados.length}/5 max</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {INTERESES_OPCIONES.map((item) => {
                const isActive = interesesSeleccionados.includes(item.nombre);
                const isDisabled = !isActive && interesesSeleccionados.length >= 5;
                return (
                  <button
                    key={item.nombre}
                    type="button"
                    onClick={() => {
                      handleInteresToggle(item.nombre);
                    }}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isDisabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span>{item.icono}</span>
                    {item.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="pt-6">
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviando && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {enviando ? 'Guardando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>

      {mostrarAlertaIncompleto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-4 mx-auto shadow-sm">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Perfil incompleto</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Tus coincidencias pueden ser menos precisas si no completas tu biografía, foto o intereses.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarAlertaIncompleto(false);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Volver a editar
              </button>
              <button
                onClick={confirmarContinuarIncompleto}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Continuar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalCrop && imagenCrudaURL && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onMouseMove={handleCropMouseMove}
          onMouseUp={handleCropMouseUp}
          onMouseLeave={handleCropMouseUp}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Encuadra tu foto</h3>
            <div
              className="relative overflow-hidden border-4 border-blue-500"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                borderRadius: '50%',
                cursor: arrastrando ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleCropMouseDown}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={() => {
                setArrastrando(false);
              }}
            >
              <img
                ref={cropImgRef}
                src={imagenCrudaURL}
                alt="recorte"
                draggable={false}
                onLoad={handleCropImageLoad}
                style={{
                  width: imgDisplaySize.w * zoom,
                  height: imgDisplaySize.h * zoom,
                  transform: `translate(${imgOffset.x}px, ${imgOffset.y}px)`,
                  maxWidth: 'none',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="w-full mt-4 accent-blue-600"
            />
            <div className="flex gap-3 mt-4 w-full">
              <button
                type="button"
                onClick={cancelarCrop}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-2xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={aplicarCrop}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletarPerfil;
