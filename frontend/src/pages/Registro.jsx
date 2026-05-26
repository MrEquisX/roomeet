import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

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

const Registro = () => {
  const navigate = useNavigate();

  // ----------- NUEVOS ESTADOS PARA EL FORMULARIO DE REGISTRO -----------
  // Estado único para todos los campos
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: '',
    nacimiento: '',
    sexoBiologico: '',
    identidadGenero: '',
    universidad: 'PUCV',
    carrera: '',
    sede: '',
    ingreso: '',
    latitud: '-33.047238',
    longitud: '-71.612688',
    fuma: 'No',
    mascotas: 'No',
    nivelOrden: 'Medio'
  });
  // Error backend/muestra de error
  const [backendError, setBackendError] = useState('');
  // Mensaje de éxito bonito (UX mejorado)
  const [mensajeExito, setMensajeExito] = useState('');
  // MAPA
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [buscandoGPS, setBuscandoGPS] = useState(false);

  // NUEVOS ESTADOS PARA REVERSE GEOCODING
  const [direccionLegible, setDireccionLegible] = useState('Buscando dirección...');
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  // Cambio centralizado para formularios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setBackendError('');
    setMensajeExito('');
  };

  // EFECTO: Traducir Coordenadas a Calle con la API de OpenStreetMap
  useEffect(() => {
    const traducirCoordenadas = async () => {
      setBuscandoDireccion(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${form.latitud}&lon=${form.longitud}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.address) {
          const calle = data.address.road || '';
          const numero = data.address.house_number || '';
          const barrio = data.address.suburb || data.address.neighbourhood || '';
          const ciudad = data.address.city || data.address.town || data.address.village || '';
          let direccionLimpia = `${calle} ${numero}`.trim();
          if (barrio) direccionLimpia += `, ${barrio}`;
          if (ciudad) direccionLimpia += `, ${ciudad}`;
          setDireccionLegible(direccionLimpia || data.display_name || 'Ubicación sin calle registrada');
        } else {
          setDireccionLegible('Dirección desconocida');
        }
      } catch (error) {
        console.error('Error al traducir dirección:', error);
        setDireccionLegible('Error de conexión con el mapa');
      } finally {
        setBuscandoDireccion(false);
      }
    };
    const timeoutId = setTimeout(() => {
      if (form.latitud && form.longitud) {
        traducirCoordenadas();
      }
    }, 800);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [form.latitud, form.longitud]);

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      setBackendError('La geolocalización no está soportada por este navegador.');
      setMensajeExito('');
      return;
    }
    setBuscandoGPS(true);
    setBackendError('');
    setMensajeExito('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitud: position.coords.latitude.toFixed(6),
          longitud: position.coords.longitude.toFixed(6)
        }));
        setBuscandoGPS(false);
      },
      (error) => {
        console.error('Error GPS:', error);
        setBuscandoGPS(false);
        setBackendError('No se pudo acceder al GPS. Usa el mapa manualmente para fijar la sede.');
        setMensajeExito('');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // ------------ HANDLE SUBMIT PARA POST A BACKEND --------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple de campos obligatorios
    if (
      !form.nombre ||
      !form.email ||
      !form.password ||
      !form.universidad ||
      !form.carrera
    ) {
      setBackendError('Debes completar todos los campos requeridos.');
      setMensajeExito('');
      return;
    }
    setBackendError('');
    setMensajeExito('');

    // Formatear payload, puedes ajustarlo según el backend
    const payload = {
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      telefono: form.telefono,
      nacimiento: form.nacimiento,
      sexoBiologico: form.sexoBiologico,
      identidadGenero: form.identidadGenero,
      universidad: form.universidad,
      carrera: form.carrera,
      sede: form.sede,
      ingreso: form.ingreso,
      latitud: form.latitud,
      longitud: form.longitud,
      direccion: direccionLegible,
      fuma: form.fuma,
      mascotas: form.mascotas,
      nivelOrden: form.nivelOrden
    };

    try {
      const res = await fetch('http://localhost:3000/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 201) {
        // Paso 1: mostrar mensaje bonito inmediato UX
        setMensajeExito('Registro exitoso. Iniciando sesión automáticamente...');
        setBackendError('');

        // Paso 2: Auto-login inmediato
        try {
          const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: form.email, password: form.password })
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            const token = data.token || data.accessToken;
            if (token) {
              localStorage.setItem('token', token);
              setTimeout(() => {
                navigate('/');
              }, 850); // Deja ver el mensaje 850ms antes de redirigir
            } else {
              setBackendError('Ocurrió un problema al recibir el token. Intenta iniciar sesión manualmente.');
              setMensajeExito('');
            }
          } else {
            // Manejo de error de login
            let msg = 'Registro exitoso, pero error en login automático.';
            try {
              const d = await loginRes.json();
              msg = d?.error || d?.message || msg;
            } catch {}
            setBackendError(msg);
            setMensajeExito('');
          }
        } catch (err) {
          setBackendError('Registro exitoso, pero no se pudo conectar para auto-login.');
          setMensajeExito('');
        }
      } else {
        // Intentar extraer mensaje del backend si lo hay
        let msg = 'Error al registrar usuario.';
        try {
          const data = await res.json();
          msg = data?.error || data?.message || msg;
        } catch (_) {
          // Ignore
        }
        setBackendError(msg);
        setMensajeExito('');
      }
    } catch (err) {
      setBackendError('No se pudo conectar al servidor. Intente nuevamente.');
      setMensajeExito('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-2">Crea tu Cuenta</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Ingresa tus datos principales para unirte a Roomeet
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">

          {/* Error del backend visible */}
          {backendError && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl mb-2 text-xs font-semibold text-center">
              {backendError}
            </div>
          )}

          {/* Mensaje de éxito UX mejorado */}
          {mensajeExito && (
            <div className="bg-green-50 border border-green-300 text-green-700 p-3 rounded-xl mb-2 text-xs font-semibold text-center shadow transition-all animate-fade-in">
              <span className="text-base inline-block align-middle mr-2">✅</span> {mensajeExito}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">1. Credenciales</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Correo Institucional</label>
              <input
                required
                type="email"
                name="email"
                placeholder="estudiante@pucv.cl"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Contraseña</label>
              <input
                required
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">2. Datos Personales</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nombre Completo</label>
              <input
                required
                type="text"
                name="nombre"
                placeholder="Ej. André Limari"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Teléfono</label>
                <input
                  required
                  type="tel"
                  name="telefono"
                  placeholder="+56 9..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nacimiento</label>
                <input
                  required
                  type="date"
                  name="nacimiento"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600"
                  value={form.nacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sexo Biológico</label>
                <select
                  required
                  name="sexoBiologico"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  value={form.sexoBiologico}
                  onChange={handleChange}
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
                  name="identidadGenero"
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.identidadGenero}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">3. Perfil Académico</h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Universidad</label>
                <select
                  name="universidad"
                  value={form.universidad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="PUCV">PUCV</option>
                  <option value="UTFSM">UTFSM</option>
                  <option value="UV">UV</option>
                  <option value="UPLA">UPLA</option>
                  <option value="OTRA">Otra...</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Ingreso</label>
                <input
                  required
                  type="number"
                  name="ingreso"
                  placeholder="2020"
                  min="2000"
                  max="2030"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.ingreso}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sede / Campus</label>
                <input
                  required
                  type="text"
                  name="sede"
                  value={form.sede}
                  onChange={handleChange}
                  placeholder="Ej. Campus Curauma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Carrera</label>
                <input
                  required
                  type="text"
                  name="carrera"
                  value={form.carrera}
                  onChange={handleChange}
                  placeholder="Ej. Ing. en Informática"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Preferencias de convivencia (NUEVO) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 mt-3 space-y-2">
              <span className="text-xs text-gray-700 font-bold">Preferencias de Convivencia</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">¿Fumas?</label>
                  <select
                    required
                    name="fuma"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                    value={form.fuma}
                    onChange={handleChange}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                    <option value="Ocasional">Ocasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">¿Mascotas?</label>
                  <select
                    required
                    name="mascotas"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                    value={form.mascotas}
                    onChange={handleChange}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                    <option value="Indiferente">Indiferente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nivel de Orden</label>
                <select
                  required
                  name="nivelOrden"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                  value={form.nivelOrden}
                  onChange={handleChange}
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
            </div>

            {/* MAPA INTERACTIVO REAL CON REVERSE GEOCODING */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-gray-700 block">Ubicación Geográfica de la Sede</span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={obtenerUbicacionGPS}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  📍 {buscandoGPS ? 'Ubicando...' : 'Mi GPS Actual'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarMapa(!mostrarMapa)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${mostrarMapa ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  🗺️ {mostrarMapa ? 'Ocultar Mapa' : 'Abrir Mapa'}
                </button>
              </div>

              {mostrarMapa && (
                <div className="w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-inner">
                  <MapContainer
                    center={[parseFloat(form.latitud), parseFloat(form.longitud)]}
                    zoom={15}
                    style={{ height: '250px', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OSM'
                    />
                    <MapClickHandler
                      setLatitud={lat => setForm(prev => ({ ...prev, latitud: lat }))}
                      setLongitud={lng => setForm(prev => ({ ...prev, longitud: lng }))}
                    />
                    <MapRecenter lat={form.latitud} lng={form.longitud} />
                    <Marker position={[parseFloat(form.latitud), parseFloat(form.longitud)]} icon={customIcon} />
                  </MapContainer>
                </div>
              )}

              <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 mt-2 flex items-center gap-3">
                <div className="text-xl">📍</div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dirección Seleccionada</span>
                  {buscandoDireccion ? (
                    <span className="text-sm font-bold text-gray-400 animate-pulse truncate">Calculando calle...</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-800 truncate" title={direccionLegible}>{direccionLegible}</span>
                  )}
                </div>
              </div>
            </div>

          </section>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-6 active:scale-95"
          >
            Continuar
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registro;