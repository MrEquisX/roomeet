import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {
  universidadesChile,
  ANIO_ACTUAL,
  ANIO_MIN_INGRESO,
  INTERESES_OPCIONES,
  OPCIONES_FUMA,
  OPCIONES_BEBE,
  OPCIONES_MASCOTAS,
  buscarUniversidad,
  validarTelefono9Digitos,
  validarFechaNacimiento,
  validarAnioIngreso,
  extraerDigitosTelefono,
  buscarDireccionesNominatim,
  normalizarFumaLegacy,
  normalizarBebeLegacy,
  normalizarMascotasLegacy,
  obtenerFechaMaxNacimiento,
  obtenerFechaMinNacimiento,
  EDAD_MINIMA,
  EDAD_MAXIMA,
} from '../utils/perfilHelpers';
import { API_BASE, API_URL } from '../config/env.js';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapClickHandler = (props) => {
  const setLatitud = props.setLatitud;
  const setLongitud = props.setLongitud;

  useMapEvents({
    click(e) {
      if (e && e.latlng) {
        setLatitud(e.latlng.lat.toFixed(6));
        setLongitud(e.latlng.lng.toFixed(6));
      }
    },
  });
  return null;
};

const MapRecenter = (props) => {
  const lat = props.lat;
  const lng = props.lng;
  const map = useMap();

  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([parseFloat(lat), parseFloat(lng)], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const EditarPerfil = () => {
  const navigate = useNavigate();

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(true);

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState('');
  const [identidadGenero, setIdentidadGenero] = useState('');

  const [universidad, setUniversidad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [sede, setSede] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [latitud, setLatitud] = useState('-33.047238');
  const [longitud, setLongitud] = useState('-71.612688');
  const [direccion, setDireccion] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [sugerenciasDireccion, setSugerenciasDireccion] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  const [rol, setRol] = useState('Buscador');
  const [biografia, setBiografia] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [fuma, setFuma] = useState('No');
  const [bebeAlcohol, setBebeAlcohol] = useState('No');
  const [mascotas, setMascotas] = useState('No');
  const [nivelOrden, setNivelOrden] = useState(3);
  const [nivelRuido, setNivelRuido] = useState(3);
  const [horarioPreferido, setHorarioPreferido] = useState('Indiferente');

  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);

  const CROP_SIZE = 280;
  const [imagenCrudaURL, setImagenCrudaURL] = useState(null);
  const [mostrarModalCrop, setMostrarModalCrop] = useState(false);
  const [imgDisplaySize, setImgDisplaySize] = useState({ w: CROP_SIZE, h: CROP_SIZE });
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [ultimaPos, setUltimaPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const cropImgRef = useRef(null);

  const universidadData = useMemo(() => {
    return buscarUniversidad(universidadesChile, universidad);
  }, [universidad]);

  const sedesDisponibles = universidadData?.sedes ?? [];
  const carrerasDisponibles = universidadData?.carreras ?? [];

  const fechaMaxNacimiento = obtenerFechaMaxNacimiento();
  const fechaMinNacimiento = obtenerFechaMinNacimiento();

  useEffect(() => {
    setImgOffset((prev) => {
      return {
        x: Math.max(-(imgDisplaySize.w * zoom - CROP_SIZE), Math.min(0, prev.x)),
        y: Math.max(-(imgDisplaySize.h * zoom - CROP_SIZE), Math.min(0, prev.y)),
      };
    });
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/usuarios/mi-perfil`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('No se pudo cargar el perfil');
        }
        const data = await res.json();

        const pref = data.preferencias || {};
        const intereses = Array.isArray(data.intereses) ? data.intereses : [];
        const ubic = data.ubicacion_sede || {};

        setEmail(data.email || '');
        setNombre([data.nombre, data.apellido].filter(Boolean).join(' '));
        setTelefono(extraerDigitosTelefono(data.telefono || ''));
        if (data.fecha_nacimiento) {
          const fecha = new Date(data.fecha_nacimiento);
          const iso = fecha.toISOString().slice(0, 10);
          setNacimiento(iso);
        }
        setSexoBiologico(data.sexo_biologico || '');
        setIdentidadGenero(data.identidad_genero || '');

        setUniversidad(data.universidad || '');
        setCarrera(data.carrera || '');
        setSede(data.sede || '');
        setIngreso(data.anio_ingreso ? String(data.anio_ingreso) : '');

        if (ubic.latitud !== null && ubic.latitud !== undefined) {
          setLatitud(String(ubic.latitud));
        }
        if (ubic.longitud !== null && ubic.longitud !== undefined) {
          setLongitud(String(ubic.longitud));
        }
        setDireccion(ubic.direccion || '');

        setRol(data.rol || 'Buscador');
        setBiografia(data.bio || '');
        setFuma(normalizarFumaLegacy(pref.fuma));
        setBebeAlcohol(normalizarBebeLegacy(pref.bebeAlcohol));
        setMascotas(normalizarMascotasLegacy(pref.mascotas));
        setNivelOrden(typeof pref.orden === 'number' ? pref.orden : 3);
        setNivelRuido(typeof pref.ruido === 'number' ? pref.ruido : 3);
        setHorarioPreferido(pref.horarioPreferido || 'Indiferente');
        setInteresesSeleccionados(
          intereses.map((i) => {
            if (typeof i === 'string') {
              return i;
            }
            return i.nombre;
          }).filter(Boolean)
        );

        if (data.fotoPerfilUrl) {
          const url = data.fotoPerfilUrl.startsWith('http')
            ? data.fotoPerfilUrl
            : `${API_BASE}${data.fotoPerfilUrl}`;
          setFotoPreview(url);
        }
        setCargando(false);
      } catch {
        setMensajeError('No se pudieron cargar tus datos. Intenta más tarde.');
        setCargando(false);
      }
    };
    fetchUsuario();
  }, []);

  useEffect(() => {
    const buscarSugerencias = async () => {
      const texto = (direccion || '').trim();
      if (texto.length < 3) {
        setSugerenciasDireccion([]);
        return;
      }
      setBuscandoDireccion(true);
      try {
        const resultados = await buscarDireccionesNominatim(texto);
        setSugerenciasDireccion(resultados);
      } catch {
        setSugerenciasDireccion([]);
      } finally {
        setBuscandoDireccion(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (mostrarSugerencias) {
        buscarSugerencias();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [direccion, mostrarSugerencias]);

  const handleUniversidadChange = (e) => {
    setUniversidad(e.target.value);
    setCarrera('');
    setSede('');
  };

  const handleSedeChange = (e) => {
    const valor = e.target.value;
    setSede(valor);
    const sedeElegida = sedesDisponibles.find((s) => {
      return s.nombre === valor;
    });
    if (sedeElegida) {
      setLatitud(String(sedeElegida.lat));
      setLongitud(String(sedeElegida.lng));
      setDireccion(`${sedeElegida.nombre}, ${sedeElegida.comuna}, Chile`);
    }
  };

  const seleccionarDireccion = (resultado) => {
    setLatitud(parseFloat(resultado.lat).toFixed(6));
    setLongitud(parseFloat(resultado.lon).toFixed(6));
    setDireccion(resultado.display_name);
    setSugerenciasDireccion([]);
    setMostrarSugerencias(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
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
    const { naturalWidth, naturalHeight } = img;
    let w;
    let h;
    if (naturalWidth <= naturalHeight) {
      w = CROP_SIZE;
      h = Math.round(naturalHeight * CROP_SIZE / naturalWidth);
    } else {
      h = CROP_SIZE;
      w = Math.round(naturalWidth * CROP_SIZE / naturalHeight);
    }
    setImgDisplaySize({ w, h });
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
    return { w: imgDisplaySize.w * zoom, h: imgDisplaySize.h * zoom };
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
    const { w, h } = zoomedSize();
    setImgOffset((prev) => {
      return clampOffset(prev.x + dx, prev.y + dy, w, h);
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
    const { w, h } = zoomedSize();
    setImgOffset((prev) => {
      return clampOffset(prev.x + dx, prev.y + dy, w, h);
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
      srcX * scaleX, srcY * scaleY,
      CROP_SIZE * scaleX, CROP_SIZE * scaleY,
      0, 0, 400, 400
    );
    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], 'foto_perfil.jpg', { type: 'image/jpeg' });
      setFotoPerfil(croppedFile);
      setFotoPreview(URL.createObjectURL(blob));
      setMostrarModalCrop(false);
      setZoom(1);
      URL.revokeObjectURL(imagenCrudaURL);
      setImagenCrudaURL(null);
    }, 'image/jpeg', 0.92);
  };

  const cancelarCrop = () => {
    setMostrarModalCrop(false);
    URL.revokeObjectURL(imagenCrudaURL);
    setImagenCrudaURL(null);
    setZoom(1);
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

  const validarFormulario = () => {
    if (!nombre.trim()) {
      setMensajeError('El nombre es obligatorio.');
      return false;
    }
    if (!validarTelefono9Digitos(telefono)) {
      setMensajeError('El teléfono debe tener exactamente 9 dígitos.');
      return false;
    }
    if (nacimiento && !validarFechaNacimiento(nacimiento)) {
      setMensajeError(
        `La fecha de nacimiento debe ser válida y corresponder a una edad entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años (${fechaMinNacimiento} – ${fechaMaxNacimiento}).`
      );
      return false;
    }
    if (nacimiento && (nacimiento < fechaMinNacimiento || nacimiento > fechaMaxNacimiento)) {
      setMensajeError(
        `Debes tener al menos ${EDAD_MINIMA} años. La fecha debe estar entre ${fechaMinNacimiento} y ${fechaMaxNacimiento}.`
      );
      return false;
    }
    if (ingreso && !validarAnioIngreso(ingreso)) {
      setMensajeError(`El año de ingreso debe estar entre ${ANIO_MIN_INGRESO} y ${ANIO_ACTUAL}.`);
      return false;
    }
    if (ingreso) {
      const anioIngresoNum = Number(ingreso);
      if (Number.isNaN(anioIngresoNum) || anioIngresoNum < ANIO_MIN_INGRESO || anioIngresoNum > ANIO_ACTUAL) {
        setMensajeError(`El año de ingreso debe estar entre ${ANIO_MIN_INGRESO} y ${ANIO_ACTUAL}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');

    if (!validarFormulario()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensajeError('No hay sesión activa.');
      return;
    }

    const payload = {
      nombre,
      telefono,
      fecha_nacimiento: nacimiento || undefined,
      sexo_biologico: sexoBiologico,
      identidad_genero: identidadGenero,
      universidad,
      carrera,
      sede,
      anio_ingreso: ingreso || undefined,
      ubicacion_sede: {
        latitud: Number(latitud),
        longitud: Number(longitud),
        direccion,
      },
      rol,
      biografia,
      fuma,
      mascotas,
      bebeAlcohol,
      nivelOrden,
      nivelRuido,
      horarioPreferido,
      interesesSeleccionados,
    };

    try {
      setCargando(true);
      let response;

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
        response = await fetch(`${API_URL}/usuarios/editar`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/usuarios/editar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.status === 200) {
        setMensajeExito('¡Tu perfil se actualizó correctamente!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate('/perfil');
        }, 1500);
      } else {
        const resJson = await response.json();
        setMensajeError(resJson.mensaje || 'No se pudieron guardar tus cambios');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setMensajeError('Ocurrió un error inesperado al actualizar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarClick = () => {
    setMostrarAlerta(true);
  };

  const confirmarCancelar = () => {
    navigate('/perfil');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 flex flex-col relative">

        {mensajeExito && (
          <div className="mb-5 text-green-700 text-center font-bold bg-green-50 rounded-xl p-3 border border-green-200">
            <span className="text-xl mr-2">✅</span>{mensajeExito}
          </div>
        )}
        {mensajeError && (
          <div className="mb-5 text-red-600 text-center font-bold bg-red-50 rounded-xl p-3 border border-red-200">
            <span className="text-xl mr-2">❌</span>{mensajeError}
          </div>
        )}

        {cargando && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-3xl">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <button onClick={handleCancelarClick} className="text-gray-400 hover:text-blue-600 p-2 -ml-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-blue-900 text-center flex-1 -ml-4">Editar Perfil</h1>
        </div>
        <p className="text-sm text-gray-500 text-center mb-8">
          Actualiza todos tus datos para encontrar compañeros más afines a ti.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-8">

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Credenciales</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Correo</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Datos Personales</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Teléfono</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(extraerDigitosTelefono(e.target.value).slice(0, 9));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nacimiento</label>
                <input
                  type="date"
                  min={fechaMinNacimiento}
                  max={fechaMaxNacimiento}
                  value={nacimiento}
                  onChange={(e) => {
                    setNacimiento(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sexo</label>
                <select
                  value={sexoBiologico}
                  onChange={(e) => {
                    setSexoBiologico(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Identidad de Género</label>
                <input
                  type="text"
                  value={identidadGenero}
                  onChange={(e) => {
                    setIdentidadGenero(e.target.value);
                  }}
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Perfil Académico</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Universidad</label>
                <select
                  value={universidad}
                  onChange={handleUniversidadChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="">Selecciona...</option>
                  {universidadesChile.map((u) => {
                    return (
                      <option key={u.nombre} value={u.nombre}>{u.nombre}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Ingreso</label>
                <input
                  type="number"
                  min={ANIO_MIN_INGRESO}
                  max={ANIO_ACTUAL}
                  value={ingreso}
                  onChange={(e) => {
                    setIngreso(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sede / Campus</label>
              <select
                value={sede}
                onChange={handleSedeChange}
                disabled={!universidad}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100"
              >
                <option value="">Selecciona...</option>
                {sedesDisponibles.map((s) => {
                  return (
                    <option key={s.nombre} value={s.nombre}>{s.nombre} — {s.comuna}</option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Carrera</label>
              <select
                value={carrera}
                onChange={(e) => {
                  setCarrera(e.target.value);
                }}
                disabled={!universidad}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100"
              >
                <option value="">Selecciona...</option>
                {carrerasDisponibles.map((c) => {
                  return (
                    <option key={c} value={c}>{c}</option>
                  );
                })}
              </select>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-gray-700 block">📍 Ubicación</span>
              <div className="relative">
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                  }}
                  onFocus={() => {
                    setMostrarSugerencias(true);
                  }}
                  placeholder="Buscar calle o dirección..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {buscandoDireccion && (
                  <span className="absolute right-3 top-3.5 text-[10px] text-gray-400">Buscando...</span>
                )}
                {mostrarSugerencias && sugerenciasDireccion.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {sugerenciasDireccion.map((item) => {
                      return (
                        <li key={item.place_id}>
                          <button
                            type="button"
                            onClick={() => {
                              seleccionarDireccion(item);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                          >
                            {item.display_name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMostrarMapa(!mostrarMapa);
                }}
                className="w-full py-2 text-xs font-bold text-blue-700 bg-white border border-blue-200 rounded-xl"
              >
                {mostrarMapa ? 'Ocultar mapa' : 'Abrir mapa'}
              </button>
              {mostrarMapa && (
                <div className="w-full rounded-xl overflow-hidden border border-gray-300">
                  <MapContainer center={[parseFloat(latitud), parseFloat(longitud)]} zoom={15} style={{ height: '200px', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OSM" />
                    <MapClickHandler setLatitud={setLatitud} setLongitud={setLongitud} />
                    <MapRecenter lat={latitud} lng={longitud} />
                    <Marker position={[parseFloat(latitud), parseFloat(longitud)]} icon={customIcon} />
                  </MapContainer>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col items-center space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => { fileInputRef.current?.click(); }} className="relative group focus:outline-none">
              <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-white text-xs font-bold">Cambiar Foto</span>
              </div>
            </button>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Sobre ti</h2>
            <textarea
              value={biografia}
              onChange={(e) => {
                setBiografia(e.target.value);
              }}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Hábitos y Convivencia</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Fumas?</span>
                <select value={fuma} onChange={(e) => { setFuma(e.target.value); }} className="w-full bg-transparent text-sm font-medium">
                  {OPCIONES_FUMA.map((op) => {
                    return <option key={op} value={op}>{op}</option>;
                  })}
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Bebes?</span>
                <select value={bebeAlcohol} onChange={(e) => { setBebeAlcohol(e.target.value); }} className="w-full bg-transparent text-sm font-medium">
                  {OPCIONES_BEBE.map((op) => {
                    return <option key={op} value={op}>{op}</option>;
                  })}
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <span className="text-xs font-semibold text-gray-700 mb-2 block">¿Mascotas?</span>
                <select value={mascotas} onChange={(e) => { setMascotas(e.target.value); }} className="w-full bg-transparent text-sm font-medium">
                  {OPCIONES_MASCOTAS.map((op) => {
                    return <option key={op} value={op}>{op}</option>;
                  })}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Nivel de Orden (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelOrden} onChange={(e) => { setNivelOrden(Number(e.target.value)); }} className="w-full accent-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Tolerancia al Ruido (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelRuido} onChange={(e) => { setNivelRuido(Number(e.target.value)); }} className="w-full accent-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Horario Preferido</label>
              <select value={horarioPreferido} onChange={(e) => { setHorarioPreferido(e.target.value); }} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="Diurno">Diurno</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Indiferente">Indiferente</option>
              </select>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-end border-b border-gray-100 pb-1">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Tus Intereses</h2>
              <span className="text-[10px] font-bold text-gray-400">{interesesSeleccionados.length}/5</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
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
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold ${
                      isActive ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <span>{item.icono}</span>{item.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="pt-4 flex flex-col gap-3">
            <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50">
              Guardar Cambios
            </button>
            <button type="button" onClick={handleCancelarClick} className="w-full border-2 border-gray-300 text-gray-500 font-bold py-3 rounded-2xl">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {mostrarAlerta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Descartar cambios?</h3>
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => { setMostrarAlerta(false); }} className="py-3 bg-blue-600 text-white font-bold rounded-xl">Seguir editando</button>
              <button onClick={confirmarCancelar} className="py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Salir sin guardar</button>
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
              style={{ width: CROP_SIZE, height: CROP_SIZE, borderRadius: '50%', cursor: arrastrando ? 'grabbing' : 'grab' }}
              onMouseDown={handleCropMouseDown}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={() => { setArrastrando(false); }}
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
            <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => { setZoom(Number(e.target.value)); }} className="w-full mt-4 accent-blue-600" />
            <div className="flex gap-3 mt-4 w-full">
              <button type="button" onClick={cancelarCrop} className="flex-1 py-3 bg-gray-100 font-bold rounded-2xl">Cancelar</button>
              <button type="button" onClick={aplicarCrop} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl">Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfil;
