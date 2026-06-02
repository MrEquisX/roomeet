import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { apiClient } from '../services/apiClient'; // NUEVO: importar apiClient

// 1. CONFIGURACIÓN DEL MAPA
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapClickHandler = ({ setLatitud, setLongitud }) => {
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

const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([parseFloat(lat), parseFloat(lng)], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const API_BASE = 'http://localhost:3000';
const getImageUrl = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  return `${API_BASE}${ruta}`;
};

// 2. COMPONENTE PRINCIPAL
const AnadirVivienda = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const esEdicion = !!paramId;

  const [mostrarExito, setMostrarExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState(null);
  // Modo edición: imágenes ya guardadas en el servidor (no son File objects)
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [cargandoPrecarga, setCargandoPrecarga] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Estado inicial que se puede reutilizar para limpiar el formulario tras éxito
  const datosIniciales = {
    titulo: '',
    descripcion: '',
    tipoPropiedad: 'Departamento',
    amoblado: 'Amoblado Completo',
    gastosComunes: 'Incluidos en el precio',
    sector: '',
    latitud: '-33.047238',
    longitud: '-71.612688',
    habitacionesTotales: 3,
    habitantesActuales: 1,
    habitacionesDisponibles: 1,
    habitacionesOfrecidas: [
      { id: 1, precio: '', tipoBano: 'Público/Compartido (Fuera de la pieza)' }
    ],
    caracteristicas: []
  };

  const [datos, setDatos] = useState(datosIniciales);

  // Cada entrada: { file: File, preview: string (object URL) }
  const [imagenes, setImagenes] = useState([]);
  const [buscandoGPS, setBuscandoGPS] = useState(false);

  // Buscador de direcciones (Nominatim)
  const [busquedaDireccion, setBusquedaDireccion] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Precarga de datos cuando se abre en modo edición
  useEffect(() => {
    if (!esEdicion) return;
    const cargarVivienda = async () => {
      setCargandoPrecarga(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/alojamientos/${paramId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo cargar la vivienda.');
        const data = await res.json();
        setDatos({
          titulo:               data.titulo                  || '',
          descripcion:          data.descripcion             || '',
          tipoPropiedad:        data.tipoPropiedad           || 'Departamento',
          amoblado:             data.amoblado                || 'Amoblado Completo',
          gastosComunes:        data.gastosComunes           || 'Incluidos en el precio',
          sector:               data.sector                  || '',
          latitud:              data.latitud  != null ? String(data.latitud)  : '-33.047238',
          longitud:             data.longitud != null ? String(data.longitud) : '-71.612688',
          habitacionesTotales:  data.habitacionesTotales     || 3,
          habitantesActuales:   data.habitantesActuales      || 1,
          habitacionesDisponibles: data.habitacionesOfrecidas?.length || 1,
          habitacionesOfrecidas: (data.habitacionesOfrecidas || []).map((h, i) => ({
            id:       i + 1,
            precio:   h.precio   || '',
            tipoBano: h.tipoBano || 'Público/Compartido (Fuera de la pieza)',
          })),
          caracteristicas: data.caracteristicas || [],
        });
        setBusquedaDireccion(data.sector || '');
        setImagenesExistentes(data.imagenes || []);
      } catch (err) {
        setErrorServidor('No se pudo cargar la vivienda: ' + (err.message || ''));
      } finally {
        setCargandoPrecarga(false);
      }
    };
    cargarVivienda();
    // eslint-disable-next-line
  }, [esEdicion, paramId]);

  // CATEGORÍAS
  const categoriasServicios = [
    {
      categoria: "Básicos & Estudio",
      items: [
        { id: 'wifi', nombre: 'Wi-Fi Fibra Óptica', icono: '🌐' },
        { id: 'escritorio', nombre: 'Espacio de Estudio / Escritorio', icono: '💻' },
        { id: 'cocina', nombre: 'Cocina Equipada', icono: '🍳' },
        { id: 'lavadora', nombre: 'Lavadora', icono: '🧺' }
      ]
    },
    {
      categoria: "Edificio & Extras",
      items: [
        { id: 'ascensor', nombre: 'Ascensor', icono: '🛗' },
        { id: 'conserje', nombre: 'Conserjería 24/7', icono: '👮' },
        { id: 'gym', nombre: 'Gimnasio', icono: '🏋️' },
        { id: 'bici', nombre: 'Estacionamiento Bici', icono: '🚲' }
      ]
    },
    {
      categoria: "Climatización",
      items: [
        { id: 'calefaccion', nombre: 'Calefacción', icono: '🔥' },
        { id: 'ventilador', nombre: 'Ventilador / AC', icono: '❄️' }
      ]
    }
  ];

  // LÓGICA MATEMÁTICA ESTRICTA PARA HABITACIONES DISPONIBLES
  const handleHabitacionesDisponiblesChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const max = Math.max(0, datos.habitacionesTotales - datos.habitantesActuales);
    const validNum = value > max ? max : (value < 1 ? 1 : value);

    setDatos(prev => {
      let nuevasHabitaciones = [...prev.habitacionesOfrecidas];

      if (validNum > nuevasHabitaciones.length) {
        for (let i = nuevasHabitaciones.length; i < validNum; i++) {
          nuevasHabitaciones.push({ id: i + 1, precio: '', tipoBano: 'Público/Compartido (Fuera de la pieza)' });
        }
      } else if (validNum < nuevasHabitaciones.length) {
        nuevasHabitaciones = nuevasHabitaciones.slice(0, validNum);
      }

      return { ...prev, habitacionesDisponibles: validNum, habitacionesOfrecidas: nuevasHabitaciones };
    });
  };

  const handleHabitantesActualesChange = (e) => {
    const viven = parseInt(e.target.value) || 1;
    const validViven = viven > datos.habitacionesTotales ? datos.habitacionesTotales : (viven < 1 ? 1 : viven);

    setDatos(prev => {
      const nuevoMaxDisponibles = Math.max(0, prev.habitacionesTotales - validViven);
      let nuevasDisp = prev.habitacionesDisponibles;
      let nuevasOfrecidas = [...prev.habitacionesOfrecidas];

      if (nuevasDisp > nuevoMaxDisponibles) {
        nuevasDisp = nuevoMaxDisponibles;
        nuevasOfrecidas = nuevasOfrecidas.slice(0, nuevasDisp);
      }

      return {
        ...prev,
        habitantesActuales: validViven,
        habitacionesDisponibles: nuevasDisp,
        habitacionesOfrecidas: nuevasOfrecidas
      };
    });
  };

  const handleHabitacionDetalleChange = (index, campo, valor) => {
    setDatos(prev => {
      const nuevasHabitaciones = [...prev.habitacionesOfrecidas];
      nuevasHabitaciones[index] = { ...nuevasHabitaciones[index], [campo]: valor };
      return { ...prev, habitacionesOfrecidas: nuevasHabitaciones };
    });
  };

  const handleImageChange = (e) => {
    const nuevas = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImagenes(prev => [...prev, ...nuevas]);
    // Resetear input para poder seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleServicio = (nombre) => {
    setDatos(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(nombre)
        ? prev.caracteristicas.filter(s => s !== nombre)
        : [...prev.caracteristicas, nombre]
    }));
  };

  const eliminarImagenExistente = (index) => {
    setImagenesExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await apiClient.delete(`/alojamientos/${paramId}`);
      setMostrarModalEliminar(false);
      navigate('/perfil');
    } catch (err) {
      setErrorServidor('No se pudo eliminar: ' + (err.message || ''));
      setMostrarModalEliminar(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setEliminando(false);
    }
  };

  const buscarDireccion = async () => {
    const q = busquedaDireccion.trim();
    if (!q) return;
    setBuscandoDireccion(true);
    setSugerencias([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&countrycodes=cl&viewbox=-72.5,-33.5,-71.0,-32.5&bounded=0`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      const results = await res.json();
      setSugerencias(results);
      setMostrarSugerencias(true);
    } catch {
      setErrorServidor('No se pudo consultar el buscador de direcciones.');
    } finally {
      setBuscandoDireccion(false);
    }
  };

  const seleccionarDireccion = (resultado) => {
    const addr = resultado.address || {};
    const sectorTexto =
      addr.suburb || addr.neighbourhood || addr.city_district ||
      addr.city || addr.town || addr.village || resultado.display_name;
    setDatos(prev => ({
      ...prev,
      latitud:  parseFloat(resultado.lat).toFixed(6),
      longitud: parseFloat(resultado.lon).toFixed(6),
      sector:   sectorTexto,
    }));
    setBusquedaDireccion(resultado.display_name);
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      setErrorServidor('La geolocalización no está soportada.');
      return;
    }
    setBuscandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDatos(prev => ({ ...prev, latitud: position.coords.latitude.toFixed(6), longitud: position.coords.longitude.toFixed(6) }));
        setBuscandoGPS(false);
      },
      (error) => {
        setBuscandoGPS(false);
        setErrorServidor('No se pudo acceder al GPS. Selecciona en el mapa manualmente.');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const limpiarFormulario = () => {
    imagenes.forEach(img => URL.revokeObjectURL(img.preview));
    setDatos(datosIniciales);
    setImagenes([]);
    setBusquedaDireccion('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor(null);
    setMensajeExito('');

    if (!datos.sector) {
      setErrorServidor('Debes buscar una dirección o hacer clic en el mapa para fijar la ubicación.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorServidor('No tienes sesión activa, inicia sesión para publicar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo',               datos.titulo);
      formData.append('descripcion',          datos.descripcion);
      formData.append('tipoPropiedad',        datos.tipoPropiedad);
      formData.append('amoblado',             datos.amoblado);
      formData.append('gastosComunes',        datos.gastosComunes);
      formData.append('sector',               datos.sector);
      formData.append('latitud',              datos.latitud);
      formData.append('longitud',             datos.longitud);
      formData.append('habitacionesTotales',  datos.habitacionesTotales);
      formData.append('habitantesActuales',   datos.habitantesActuales);
      formData.append('habitacionesOfrecidas', JSON.stringify(datos.habitacionesOfrecidas));
      formData.append('caracteristicas',       JSON.stringify(datos.caracteristicas));
      // En edición: enviar URLs existentes para que el backend las combine con las nuevas
      if (esEdicion) {
        formData.append('imagenesExistentes', JSON.stringify(imagenesExistentes));
      }
      imagenes.forEach((img) => formData.append('imagenes', img.file));

      if (esEdicion) {
        await apiClient.put(`/alojamientos/${paramId}`, formData);
        setMensajeExito('¡Vivienda actualizada correctamente!');
        setMostrarExito(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setMostrarExito(false);
          navigate('/perfil');
        }, 2000);
      } else {
        await apiClient.post('/alojamientos', formData);
        limpiarFormulario();
        setMensajeExito('¡Vivienda publicada exitosamente!');
        setMostrarExito(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setMostrarExito(false);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      let mensajeBackend = 'Error al guardar el alojamiento';
      if (typeof error?.message === 'string') mensajeBackend = error.message;
      else if (typeof error === 'string') mensajeBackend = error;
      setErrorServidor(mensajeBackend);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-2xl bg-gray-50 rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-full shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">
            {esEdicion ? 'Editar Vivienda' : 'Publicar Vivienda'}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Spinner de carga inicial (modo edición) */}
        {cargandoPrecarga && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700 font-bold">Cargando datos de la vivienda...</span>
          </div>
        )}

        {/* Mostrar error servidor si existe */}
        {errorServidor && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 text-center">{errorServidor}</div>
        )}

        {!cargandoPrecarga && <form onSubmit={handleSubmit} className="w-full space-y-6">

          {/* SECCIÓN 1: PRESENTACIÓN (Propiedad, Amoblado, GGCC y Locomoción) */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">1. Detalles Principales</h2>

            {/* TIPO DE PROPIEDAD */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDatos({ ...datos, tipoPropiedad: 'Departamento' })}
                className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${datos.tipoPropiedad === 'Departamento' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-100 text-gray-500 bg-white hover:bg-gray-50'}`}
              >
                🏢 Departamento
              </button>
              <button
                type="button"
                onClick={() => setDatos({ ...datos, tipoPropiedad: 'Casa' })}
                className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${datos.tipoPropiedad === 'Casa' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-100 text-gray-500 bg-white hover:bg-gray-50'}`}
              >
                🏠 Casa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Estado del Inmueble</label>
                <select
                  value={datos.amoblado}
                  onChange={(e) => setDatos({ ...datos, amoblado: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white text-sm font-bold text-gray-700"
                >
                  <option value="Amoblado Completo">Amoblado Completo</option>
                  <option value="Semi Amoblado (Solo espacios comunes)">Semi Amoblado (Espacios comunes)</option>
                  <option value="Sin Amoblar">Sin Amoblar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Gastos Comunes (Luz, Agua, Wi-Fi)</label>
                <select
                  value={datos.gastosComunes}
                  onChange={(e) => setDatos({ ...datos, gastosComunes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white text-sm font-bold text-gray-700"
                >
                  <option value="Incluidos en el precio">Incluidos en el precio</option>
                  <option value="Se dividen aparte">Se dividen aparte</option>
                  <option value="Solo algunos incluidos">Solo algunos incluidos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Título del Anuncio</label>
              <input required type="text" value={datos.titulo} onChange={(e) => setDatos({ ...datos, titulo: e.target.value })} placeholder="Ej. Amplio depto a pasos de la U" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-800" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Descripción y Reglas</label>
              <textarea required rows="3" value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} placeholder="Describe el ambiente, si las piezas tienen buena luz, cómo es la convivencia..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-700"></textarea>
            </div>
          </section>

          {/* SECCIÓN 2: FOTOS */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">2. Fotos del Espacio</h2>
              {imagenes.length > 0 && (
                <span className="text-[10px] font-bold text-gray-400">{imagenes.length}/5 fotos</span>
              )}
            </div>

            {/* Zona de carga */}
            <div>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
              >
                <div className="bg-blue-100 p-2.5 rounded-full">
                  <span className="text-lg">📸</span>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {imagenes.length === 0 ? 'Haz clic para subir fotos' : 'Agregar más fotos'}
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG o WEBP · Máx 5MB c/u</span>
              </label>
            </div>

            {/* Fotos guardadas en el servidor (modo edición) */}
            {imagenesExistentes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Fotos actuales</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagenesExistentes.map((url, i) => (
                    <div key={`ex-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-blue-200 shadow-sm">
                      <img
                        src={getImageUrl(url)}
                        alt={`existente-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarImagenExistente(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-extrabold opacity-0 group-hover:opacity-100 transition-all"
                        title="Quitar foto"
                      >
                        ✕
                      </button>
                      {i === 0 && imagenes.length === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                          Portada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cuadrícula de miniaturas nuevas */}
            {imagenes.length > 0 && (
              <div>
                {imagenesExistentes.length > 0 && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Fotos nuevas</p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {imagenes.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src={img.preview}
                        alt={`foto-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarImagen(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-extrabold opacity-0 group-hover:opacity-100 transition-all"
                        title="Eliminar foto"
                      >
                        ✕
                      </button>
                      {i === 0 && imagenesExistentes.length === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                          Portada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECCIÓN 3: LOGÍSTICA DINÁMICA DE HABITACIONES */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">3. Habitaciones y Valores</h2>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase truncate">Piezas Totales</label>
                <input
                  required type="number" min="1"
                  value={datos.habitacionesTotales}
                  onChange={(e) => setDatos({ ...datos, habitacionesTotales: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase truncate">Ya viven allí</label>
                <input
                  required type="number" min="0" max={datos.habitacionesTotales}
                  value={datos.habitantesActuales}
                  onChange={handleHabitantesActualesChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-blue-600 mb-1 ml-1 uppercase truncate">Busco Arrendar</label>
                <input
                  required type="number" min="1"
                  max={Math.max(0, datos.habitacionesTotales - datos.habitantesActuales)}
                  value={datos.habitacionesDisponibles}
                  onChange={handleHabitacionesDisponiblesChange}
                  disabled={datos.habitacionesTotales - datos.habitantesActuales <= 0}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-900 text-sm font-black text-center focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                />
              </div>
            </div>

            {datos.habitacionesTotales - datos.habitantesActuales <= 0 && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
                <p className="text-[11px] text-red-600 font-bold text-center">No quedan habitaciones disponibles matemáticamente. Ajusta las piezas totales o los habitantes.</p>
              </div>
            )}

            {datos.habitacionesDisponibles > 0 && (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-gray-500 font-bold border-b border-gray-100 pb-2">Detalle por habitación disponible:</p>
                {datos.habitacionesOfrecidas.map((habitacion, index) => (
                  <div key={habitacion.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm relative">
                    <span className="absolute -top-3 -left-2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-lg border-2 border-white shadow-sm">
                      Habitación {habitacion.id}
                    </span>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Valor Mensual</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                          <input
                            required type="number" placeholder="Ej. 180000"
                            value={habitacion.precio}
                            onChange={(e) => handleHabitacionDetalleChange(index, 'precio', e.target.value)}
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-800 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Baño de la pieza</label>
                        <select
                          required
                          value={habitacion.tipoBano}
                          onChange={(e) => handleHabitacionDetalleChange(index, 'tipoBano', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-[11px] font-bold text-gray-800 bg-white"
                        >
                          <option value="Privado (Dentro de la pieza)">Privado (Dentro de la pieza)</option>
                          <option value="Público/Compartido (Fuera de la pieza)">Compartido (Fuera de la pieza)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN 4: AMENITIES CATEGORIZADAS */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">4. Equipamiento (Amenities)</h2>
            {categoriasServicios.map((categoria, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-gray-500 mb-2">{categoria.categoria}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoria.items.map(servicio => {
                    const activo = datos.caracteristicas.includes(servicio.nombre);
                    return (
                      <button key={servicio.id} type="button" onClick={() => toggleServicio(servicio.nombre)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${activo ? 'bg-blue-600 text-white shadow-md border border-blue-600' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                        <span className="text-sm">{servicio.icono}</span> {servicio.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* SECCIÓN 5: UBICACIÓN Y MAPA */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">5. Ubicación</h2>
              <div className="bg-yellow-100 text-yellow-700 text-[9px] font-extrabold px-2 py-1 rounded-md uppercase">Sector visible</div>
            </div>

            {/* BUSCADOR DE DIRECCIÓN */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Buscar dirección</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busquedaDireccion}
                  onChange={(e) => setBusquedaDireccion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarDireccion(); } }}
                  placeholder="Ej. Av. Argentina 180, Valparaíso"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-800"
                />
                <button
                  type="button"
                  onClick={buscarDireccion}
                  disabled={buscandoDireccion}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {buscandoDireccion ? '...' : '🔍'}
                </button>
              </div>

              {/* Dropdown de sugerencias */}
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {sugerencias.map((s) => (
                    <li
                      key={s.place_id}
                      onClick={() => seleccionarDireccion(s)}
                      className="px-4 py-3 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 leading-snug"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {mostrarSugerencias && sugerencias.length === 0 && !buscandoDireccion && (
                <p className="mt-1 text-xs text-gray-400 font-medium ml-1">Sin resultados. Intenta con otro término.</p>
              )}
            </div>

            {/* Sector detectado */}
            {datos.sector && (
              <p className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                📍 Sector: {datos.sector}
              </p>
            )}

            <div className="space-y-3 pt-1">
              <button type="button" onClick={obtenerUbicacionGPS} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                📍 {buscandoGPS ? 'Obteniendo coordenadas...' : 'Usar mi GPS actual'}
              </button>
              <p className="text-[10px] text-gray-400 font-medium text-center">O haz clic en el mapa para mover el pin manualmente</p>
              <div className="w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-inner">
                <MapContainer center={[parseFloat(datos.latitud), parseFloat(datos.longitud)]} zoom={15} style={{ height: '220px', width: '100%', zIndex: 0 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OSM' />
                  <MapClickHandler setLatitud={(lat) => setDatos(prev => ({ ...prev, latitud: lat }))} setLongitud={(lng) => setDatos(prev => ({ ...prev, longitud: lng }))} />
                  <MapRecenter lat={datos.latitud} lng={datos.longitud} />
                  <Marker position={[parseFloat(datos.latitud), parseFloat(datos.longitud)]} icon={customIcon} />
                </MapContainer>
              </div>
            </div>
          </section>

          {/* BOTONES SUBMIT / ELIMINAR */}
          <div className="flex flex-col gap-3 mt-4">
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-lg">
              {esEdicion ? 'Actualizar Vivienda' : 'Publicar Vivienda'}
            </button>
            {esEdicion && (
              <button
                type="button"
                onClick={() => setMostrarModalEliminar(true)}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-2xl border border-red-200 transition-all text-sm"
              >
                🗑️ Eliminar Publicación
              </button>
            )}
          </div>
        </form>}

        {/* MODAL DE ÉXITO */}
        {mostrarExito && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{mensajeExito}</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              {esEdicion
                ? 'Los cambios en tu publicación ya están visibles en Roomeet.'
                : 'Tu espacio ya es visible en el buscador de Roomeet. Prepárate para recibir mensajes.'}
            </p>
            <button
              onClick={() => navigate(esEdicion ? '/perfil' : '/dashboard')}
              className="w-full max-w-xs bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-black transition-all"
            >
              {esEdicion ? 'Ir a mi Perfil' : 'Ir al Panel'}
            </button>
          </div>
        )}

        {/* MODAL CONFIRMAR ELIMINACIÓN */}
        {mostrarModalEliminar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100">
              <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-red-100 mb-6 mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Eliminar publicación?</h3>
              <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                Esta acción no se puede deshacer. Tu vivienda dejará de aparecer en el buscador.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEliminar}
                  disabled={eliminando}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={() => setMostrarModalEliminar(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnadirVivienda;