import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {
  universidadesChile,
  API_BASE,
  ANIO_ACTUAL,
  ANIO_MIN_INGRESO,
  EDAD_MINIMA,
  EDAD_MAXIMA,
  buscarUniversidad,
  validarTelefono9Digitos,
  validarFechaNacimiento,
  validarAnioIngreso,
  extraerDigitosTelefono,
  buscarDireccionesNominatim,
  obtenerFechaMaxNacimiento,
  obtenerFechaMinNacimiento,
} from '../utils/perfilHelpers';

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

const Registro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: '',
    nacimiento: '',
    sexoBiologico: '',
    identidadGenero: '',
    universidad: '',
    carrera: '',
    sede: '',
    ingreso: '',
    latitud: '-33.047238',
    longitud: '-71.612688',
    direccion: '',
  });

  const [backendError, setBackendError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [buscandoGPS, setBuscandoGPS] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [sugerenciasDireccion, setSugerenciasDireccion] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const universidadData = useMemo(() => {
    return buscarUniversidad(universidadesChile, form.universidad);
  }, [form.universidad]);

  const sedesDisponibles = universidadData?.sedes ?? [];
  const carrerasDisponibles = universidadData?.carreras ?? [];

  const fechaMaxNacimiento = obtenerFechaMaxNacimiento();
  const fechaMinNacimiento = obtenerFechaMinNacimiento();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const actualizado = { ...prev, [name]: value };
      if (name === 'universidad') {
        actualizado.carrera = '';
        actualizado.sede = '';
      }
      if (name === 'sede') {
        const sedeElegida = sedesDisponibles.find((s) => {
          return s.nombre === value;
        });
        if (sedeElegida) {
          actualizado.latitud = String(sedeElegida.lat);
          actualizado.longitud = String(sedeElegida.lng);
          actualizado.direccion = `${sedeElegida.nombre}, ${sedeElegida.comuna}, Chile`;
        }
      }
      return actualizado;
    });
    setBackendError('');
  };

  const handleTelefonoChange = (e) => {
    const digitos = extraerDigitosTelefono(e.target.value).slice(0, 9);
    setForm((prev) => ({
      ...prev,
      telefono: digitos,
    }));
    setBackendError('');
  };

  const handleIngresoChange = (e) => {
    const valor = e.target.value;
    setForm((prev) => {
      return {
        ...prev,
        ingreso: valor,
      };
    });
    setBackendError('');
  };

  useEffect(() => {
    const buscarSugerencias = async () => {
      const texto = (form.direccion || '').trim();
      if (texto.length < 3) {
        setSugerenciasDireccion([]);
        return;
      }
      setBuscandoDireccion(true);
      try {
        const resultados = await buscarDireccionesNominatim(texto);
        setSugerenciasDireccion(resultados);
      } catch (error) {
        console.error('Error al buscar direcciones:', error);
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
  }, [form.direccion, mostrarSugerencias]);

  const seleccionarDireccion = (resultado) => {
    setForm((prev) => ({
      ...prev,
      latitud: parseFloat(resultado.lat).toFixed(6),
      longitud: parseFloat(resultado.lon).toFixed(6),
      direccion: resultado.display_name,
    }));
    setSugerenciasDireccion([]);
    setMostrarSugerencias(false);
  };

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      setBackendError('La geolocalización no está soportada por este navegador.');
      return;
    }
    setBuscandoGPS(true);
    setBackendError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitud: position.coords.latitude.toFixed(6),
          longitud: position.coords.longitude.toFixed(6),
        }));
        setBuscandoGPS(false);
      },
      (error) => {
        console.error('Error GPS:', error);
        setBuscandoGPS(false);
        setBackendError('No se pudo acceder al GPS. Usa el buscador de ubicación o el mapa.');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const validarFormulario = () => {
    if (!form.nombre || !form.email || !form.password || !form.universidad || !form.carrera || !form.sede) {
      setBackendError('Debes completar todos los campos requeridos.');
      return false;
    }
    if (!validarTelefono9Digitos(form.telefono)) {
      setBackendError('El teléfono debe tener exactamente 9 dígitos.');
      return false;
    }
    if (!validarFechaNacimiento(form.nacimiento)) {
      setBackendError(
        `La fecha de nacimiento debe ser válida y corresponder a una edad entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años (${fechaMinNacimiento} – ${fechaMaxNacimiento}).`
      );
      return false;
    }
    if (form.nacimiento < fechaMinNacimiento || form.nacimiento > fechaMaxNacimiento) {
      setBackendError(
        `Debes tener al menos ${EDAD_MINIMA} años. La fecha debe estar entre ${fechaMinNacimiento} y ${fechaMaxNacimiento}.`
      );
      return false;
    }
    if (!validarAnioIngreso(form.ingreso)) {
      setBackendError(`El año de ingreso debe estar entre ${ANIO_MIN_INGRESO} y ${ANIO_ACTUAL}.`);
      return false;
    }
    const anioIngresoNum = Number(form.ingreso);
    if (Number.isNaN(anioIngresoNum) || anioIngresoNum < ANIO_MIN_INGRESO || anioIngresoNum > ANIO_ACTUAL) {
      setBackendError(`El año de ingreso debe estar entre ${ANIO_MIN_INGRESO} y ${ANIO_ACTUAL}.`);
      return false;
    }
    if (form.password.length < 8) {
      setBackendError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    if (!form.sexoBiologico) {
      setBackendError('Selecciona tu sexo.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setBackendError('');
    setEnviando(true);

    const payload = {
      nombre: form.nombre,
      email: form.email,
      password: form.password,
      telefono: form.telefono,
      fecha_nacimiento: form.nacimiento,
      sexo_biologico: form.sexoBiologico,
      identidad_genero: form.identidadGenero || '',

      perfil_academico: {
        universidad: form.universidad,
        carrera: form.carrera,
        sede: form.sede,
        anio_ingreso: Number(form.ingreso),
      },

      ubicacion_sede: {
        latitud: Number(form.latitud),
        longitud: Number(form.longitud),
        direccion: form.direccion || '',
      },

      preferencias_convivencia: {
        fuma: 'No',
        mascotas: 'No',
        bebe_alcohol: 'No',
        nivel_orden: 3,
        nivel_ruido: 3,
        horario_preferido: 'Indiferente',
      },

      intereses: [],
    };

    try {
      const res = await fetch(`${API_BASE}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }),
        });

        const loginData = await loginRes.json().catch(() => ({}));

        if (loginRes.status === 200 && loginData.token) {
          localStorage.setItem('token', loginData.token);
          navigate('/completar-perfil');
          return;
        }

        setBackendError('Cuenta creada, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente.');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setBackendError(data?.mensaje || data?.message || data?.error || 'Error al registrar usuario.');
      }
    } catch {
      setBackendError('No se pudo conectar al servidor. Intenta nuevamente.');
    } finally {
      setEnviando(false);
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

          {backendError && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl mb-2 text-xs font-semibold text-center">
              {backendError}
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
                placeholder="Ej. María González"
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
                  inputMode="numeric"
                  placeholder="912345678"
                  maxLength={9}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.telefono}
                  onChange={handleTelefonoChange}
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Exactamente 9 dígitos</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nacimiento</label>
                <input
                  required
                  type="date"
                  name="nacimiento"
                  min={fechaMinNacimiento}
                  max={fechaMaxNacimiento}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600"
                  value={form.nacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sexo</label>
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
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">
              3. Perfil Académico
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Universidad</label>
                <select
                  required
                  name="universidad"
                  value={form.universidad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="">Selecciona tu universidad...</option>
                  {universidadesChile.map((u) => {
                    return (
                      <option key={u.nombre} value={u.nombre}>
                        {u.nombre} ({u.abreviacion})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Ingreso</label>
                <input
                  required
                  type="number"
                  name="ingreso"
                  min={ANIO_MIN_INGRESO}
                  max={ANIO_ACTUAL}
                  placeholder={String(ANIO_ACTUAL)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.ingreso}
                  onChange={handleIngresoChange}
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">{ANIO_MIN_INGRESO}–{ANIO_ACTUAL}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sede / Campus</label>
              <select
                required
                name="sede"
                value={form.sede}
                onChange={handleChange}
                disabled={!form.universidad}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {form.universidad ? 'Selecciona tu sede...' : 'Primero elige una universidad'}
                </option>
                {sedesDisponibles.map((s) => {
                  return (
                    <option key={s.nombre} value={s.nombre}>
                      {s.nombre} — {s.comuna}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Carrera</label>
              <select
                required
                name="carrera"
                value={form.carrera}
                onChange={handleChange}
                disabled={!form.universidad}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {form.universidad ? 'Selecciona tu carrera...' : 'Primero elige una universidad'}
                </option>
                {carrerasDisponibles.map((c) => {
                  return (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-gray-700 block">📍 Ubicación (calle / dirección)</span>
              <p className="text-[10px] text-gray-400">
                Busca tu dirección para fijar coordenadas precisas del campus o punto de referencia.
              </p>

              <div className="relative">
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  onFocus={() => {
                    setMostrarSugerencias(true);
                  }}
                  placeholder="Ej: Av. Brasil 2241, Valparaíso"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {buscandoDireccion && (
                  <span className="absolute right-3 top-3.5 text-[10px] text-gray-400 animate-pulse">Buscando...</span>
                )}
                {mostrarSugerencias && sugerenciasDireccion.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {sugerenciasDireccion.map((item) => {
                      return (
                        <li key={item.place_id}>
                          <button
                            type="button"
                            onClick={() => {
                              seleccionarDireccion(item);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-50 last:border-0"
                          >
                            {item.display_name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

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
                  onClick={() => {
                    setMostrarMapa(!mostrarMapa);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    mostrarMapa
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
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
                      attribution="&copy; OSM"
                    />
                    <MapClickHandler
                      setLatitud={(lat) => {
                        setForm((prev) => {
                          return { ...prev, latitud: lat };
                        });
                      }}
                      setLongitud={(lng) => {
                        setForm((prev) => {
                          return { ...prev, longitud: lng };
                        });
                      }}
                    />
                    <MapRecenter lat={form.latitud} lng={form.longitud} />
                    <Marker
                      position={[parseFloat(form.latitud), parseFloat(form.longitud)]}
                      icon={customIcon}
                    />
                  </MapContainer>
                </div>
              )}

              <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="text-xl">📍</div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Coordenadas</span>
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {form.latitud}, {form.longitud}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-6 active:scale-95 disabled:opacity-60"
          >
            {enviando ? 'Creando cuenta...' : 'Continuar'}
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
