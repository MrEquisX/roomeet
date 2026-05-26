import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

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

// 2. COMPONENTE PRINCIPAL
const AnadirVivienda = () => {
  const navigate = useNavigate();
  const [mostrarExito, setMostrarExito] = useState(false);
  const [errorServidor, setErrorServidor] = useState(null);

  // ESTADO DINÁMICO DEL ALOJAMIENTO
  const [datos, setDatos] = useState({
    titulo: '',
    descripcion: '',
    tipoPropiedad: 'Departamento',
    amoblado: 'Amoblado Completo',
    gastosComunes: 'Incluidos en el precio',
    locomocion: 'A menos de 5 min caminando',
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
  });

  const [imagenes, setImagenes] = useState([]);
  const [buscandoGPS, setBuscandoGPS] = useState(false);

  // CATÁLOGO EXPANDIDO Y CATEGORIZADO (Tipo Airbnb)
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
    const files = Array.from(e.target.files);
    setImagenes([...imagenes, ...files]);
  };

  const toggleServicio = (nombre) => {
    setDatos(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(nombre)
        ? prev.caracteristicas.filter(s => s !== nombre)
        : [...prev.caracteristicas, nombre]
    }));
  };

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) return alert('La geolocalización no está soportada.');
    setBuscandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDatos(prev => ({ ...prev, latitud: position.coords.latitude.toFixed(6), longitud: position.coords.longitude.toFixed(6) }));
        setBuscandoGPS(false);
      },
      (error) => {
        console.error('Error GPS:', error);
        setBuscandoGPS(false);
        alert('No se pudo acceder al GPS. Selecciona en el mapa manualmente.');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor(null);

    // 1. Capturar todos los campos ya está resuelto en el estado datos
    // 2. Extraer token de localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorServidor("No tienes sesión activa, inicia sesión para publicar.");
      return;
    }

    // 3. Elegir si se usan archivos (imagenes) -> FormData || JSON
    let url = "http://localhost:3000/api/alojamientos";
    let config = {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };
    let body;

    try {
      if (imagenes.length > 0) {
        // Usar FormData para imágenes + datos
        const formData = new FormData();
        formData.append('titulo', datos.titulo);
        formData.append('descripcion', datos.descripcion);
        formData.append('tipoPropiedad', datos.tipoPropiedad);
        formData.append('amoblado', datos.amoblado);
        formData.append('gastosComunes', datos.gastosComunes);
        formData.append('locomocion', datos.locomocion);
        formData.append('sector', datos.sector);
        formData.append('latitud', datos.latitud);
        formData.append('longitud', datos.longitud);
        formData.append('habitacionesTotales', datos.habitacionesTotales);
        formData.append('habitantesActuales', datos.habitantesActuales);
        formData.append('habitacionesDisponibles', datos.habitacionesDisponibles);

        // habitacionesOfrecidas (array de objetos), lo puedes serializar tipo json string
        formData.append('habitacionesOfrecidas', JSON.stringify(datos.habitacionesOfrecidas));
        // caracteristicas (array)
        formData.append('caracteristicas', JSON.stringify(datos.caracteristicas));
        // imágenes:
        imagenes.forEach((archivo, i) => {
          formData.append('imagenes', archivo);
        });

        body = formData;
        delete config.headers['Content-Type'];
        config.body = body;
      } else {
        // Enviar JSON plano
        config.headers['Content-Type'] = 'application/json';
        body = {
          ...datos,
          habitacionesOfrecidas: datos.habitacionesOfrecidas,
          caracteristicas: datos.caracteristicas
        };
        config.body = JSON.stringify(body);
      }

      // 4. Enviar petición POST
      const resp = await fetch(url, config);

      if (resp.status === 201) {
        setMostrarExito(true);
        setTimeout(() => {
          setMostrarExito(false);
          navigate("/");
        }, 2250);
      } else {
        // manejar distintos errores
        let mensajeBackend = "Error al guardar el alojamiento";
        try {
          const problemas = await resp.json();
          if (typeof problemas?.error === "string") {
            mensajeBackend = problemas.error;
          } else if (problemas?.message) {
            mensajeBackend = problemas.message;
          } else if (typeof problemas === "string") {
            mensajeBackend = problemas;
          }
        } catch (e) {}
        setErrorServidor(mensajeBackend);
      }
    } catch (err) {
      setErrorServidor("Error de red al conectar al servidor. Intenta luego.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-2xl bg-gray-50 rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-full shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">Publicar Vivienda</h1>
          <div className="w-10"></div>
        </div>

        {/* Mostrar error servidor si existe */}
        {errorServidor && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 text-center">{errorServidor}</div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6" encType={imagenes.length > 0 ? "multipart/form-data" : undefined}>

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
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-extrabold text-blue-600 mb-3 uppercase tracking-wider">2. Fotos del Espacio</h2>
            <div className="relative">
              <input type="file" id="file-upload" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <label htmlFor="file-upload" className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all">
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-xl">📸</span>
                </div>
                <span className="text-xs font-bold text-gray-500">Haz clic para subir fotos</span>
                {imagenes.length > 0 && <span className="text-[10px] text-blue-600 font-bold">{imagenes.length} archivos seleccionados</span>}
              </label>
            </div>
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
              <h2 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">5. Logística y Ubicación</h2>
              <div className="bg-yellow-100 text-yellow-700 text-[9px] font-extrabold px-2 py-1 rounded-md uppercase">Sector visible</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Comuna / Sector</label>
                <select required value={datos.sector} onChange={(e) => setDatos({ ...datos, sector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white text-sm font-bold text-gray-700">
                  <option value="">Selecciona zona...</option>
                  <option value="Viña del Mar - Plan">Viña del Mar - Plan</option>
                  <option value="Viña del Mar - Recreo">Viña del Mar - Recreo</option>
                  <option value="Valparaíso - Plan">Valparaíso - Plan</option>
                  <option value="Valparaíso - Placeres">Valparaíso - Placeres</option>
                  <option value="Valparaíso - Curauma">Valparaíso - Curauma</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase">Transporte / Locomoción</label>
                <select value={datos.locomocion} onChange={(e) => setDatos({ ...datos, locomocion: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white text-sm font-bold text-gray-700">
                  <option value="A menos de 5 min caminando">A menos de 5 min caminando</option>
                  <option value="A 10 min caminando">A 10 min caminando</option>
                  <option value="Hay que tomar colectivo/Uber">Hay que tomar colectivo/Uber</option>
                  <option value="Cerca de estación de Metro">Cerca de estación de Metro</option>
                </select>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <button type="button" onClick={obtenerUbicacionGPS} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                📍 {buscandoGPS ? 'Obteniendo coordenadas...' : 'Fijar mapa con mi GPS actual'}
              </button>
              <div className="w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-inner">
                <MapContainer center={[parseFloat(datos.latitud), parseFloat(datos.longitud)]} zoom={15} style={{ height: '220px', width: '100%', zIndex: 0 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OSM' />
                  <MapClickHandler setLatitud={(lat) => setDatos({ ...datos, latitud: lat })} setLongitud={(lng) => setDatos({ ...datos, longitud: lng })} />
                  <MapRecenter lat={datos.latitud} lng={datos.longitud} />
                  <Marker position={[parseFloat(datos.latitud), parseFloat(datos.longitud)]} icon={customIcon} />
                </MapContainer>
              </div>
            </div>
          </section>

          {/* BOTÓN SUBMIT */}
          <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all mt-4 text-lg">
            Publicar Vivienda
          </button>
        </form>

        {/* MODAL DE ÉXITO */}
        {mostrarExito && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¡Vivienda Publicada!</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">Tu espacio ya es visible en el buscador de Roomeet. Prepárate para recibir mensajes.</p>
            <button onClick={() => navigate('/')} className="w-full max-w-xs bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-black transition-all">
              Ir al Inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnadirVivienda;