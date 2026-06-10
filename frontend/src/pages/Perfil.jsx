import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/perfilHelpers';

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) {
    return null;
  }
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
};

const etiquetaRol = (rol) => {
  if (rol === 'Anfitrion') {
    return '🏠 Tengo vivienda';
  }
  return '🔍 Busco habitación';
};

const Perfil = () => {
  const navigate = useNavigate();
  const [mostrarModalVivienda, setMostrarModalVivienda] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alojamiento, setAlojamiento] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_BASE}/api/usuarios/mi-perfil`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.status === 401) {
          navigate('/login');
          return;
        }

        const data = await res.json();
        setUsuario(data);

        if (data.alojamientoId) {
          try {
            const resAloj = await fetch(`${API_BASE}/api/alojamientos/${data.alojamientoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resAloj.ok) {
              setAlojamiento(await resAloj.json());
            }
          } catch {
            // sin vivienda cargada
          }
        }
      } catch (error) {
        console.error(error);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };
    fetchPerfil();
  }, [navigate]);

  const confirmarAñadirVivienda = () => {
    setMostrarModalVivienda(false);
    navigate('/anadir-vivienda');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
        <span className="text-blue-800 font-bold text-lg">Cargando perfil...</span>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-500">
        <span>Hubo un error al cargar el perfil.</span>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold" onClick={() => { window.location.reload(); }}>
          Reintentar
        </button>
      </div>
    );
  }

  const nombre = usuario.nombre || '';
  const apellido = usuario.apellido || '';
  const correo = usuario.email || '';
  const telefono = usuario.telefono || '';
  const bio = usuario.bio || '';
  const carrera = usuario.carrera || '';
  const universidad = usuario.universidad || '';
  const sede = usuario.sede || '';
  const anioIngreso = usuario.anio_ingreso || null;
  const fechaNac = usuario.fecha_nacimiento || null;
  const sexo = usuario.sexo_biologico || '';
  const identidadGenero = usuario.identidad_genero || '';
  const rol = usuario.rol || '';
  const edad = calcularEdad(fechaNac);
  const intereses = usuario.intereses || [];
  const preferencias = usuario.preferencias || {};
  const filtros = usuario.filtros || {};
  const ubicacion = usuario.ubicacion_sede || {};

  const hayFiltros =
    filtros.soloMismaUniversidad ||
    filtros.soloMismaCarrera ||
    (filtros.generoPreferido && filtros.generoPreferido !== 'Indiferente');

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">

      <div className="bg-blue-600 h-32 rounded-b-[3rem] w-full relative shadow-sm">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            {usuario.fotoPerfilUrl ? (
              <img src={getImageUrl(usuario.fotoPerfilUrl)} alt="foto de perfil" className="w-full h-full object-cover rounded-[1.25rem]" />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold select-none uppercase">
                {nombre?.[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-bold text-blue-900">{nombre} {apellido}</h1>
        {carrera && (
          <p className="text-gray-500 text-sm mt-1">{carrera}</p>
        )}
        {rol && (
          <p className="text-gray-500 text-xs mt-1">{etiquetaRol(rol)}</p>
        )}

        <div className="grid gap-3 mt-6 grid-cols-2">
          <Link
            to="/editar-perfil"
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span className="text-sm">Editar Perfil</span>
          </Link>

          {usuario.alojamientoId ? (
            <Link
              to={`/editar-vivienda/${usuario.alojamientoId}`}
              className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-sm">Editar Vivienda</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setMostrarModalVivienda(true);
              }}
              className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-sm">Añadir Vivienda</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Datos Personales</h3>
          <div className="space-y-2 text-sm">
            {correo && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Correo:</span> {correo}</p>
            )}
            {telefono && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Teléfono:</span> {telefono}</p>
            )}
            {fechaNac && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Nacimiento:</span> {new Date(fechaNac).toLocaleDateString('es-CL')}</p>
            )}
            {sexo && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Sexo:</span> {sexo}</p>
            )}
            {identidadGenero && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Identidad de género:</span> {identidadGenero}</p>
            )}
            {(edad !== null) && (
              <p className="text-gray-600"><span className="font-bold text-gray-700">Edad:</span> {edad} años</p>
            )}
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Sobre mí</h3>
          {bio ? (
            <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">Sin descripción aún.</p>
          )}
        </section>

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Vida Académica</h3>
          <div className="space-y-3">
            {universidad && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">🏫</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Universidad</p>
                  <p className="text-sm font-semibold text-gray-700">{universidad}</p>
                </div>
              </div>
            )}
            {carrera && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📚</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carrera</p>
                  <p className="text-sm font-semibold text-gray-700">{carrera}</p>
                </div>
              </div>
            )}
            {sede && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📍</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sede / Campus</p>
                  <p className="text-sm font-semibold text-gray-700">{sede}</p>
                </div>
              </div>
            )}
            {anioIngreso && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📅</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Año de Ingreso</p>
                  <p className="text-sm font-semibold text-gray-700">{anioIngreso}</p>
                </div>
              </div>
            )}
            {(ubicacion.direccion || ubicacion.latitud) && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">🗺️</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ubicación</p>
                  {ubicacion.direccion && (
                    <p className="text-sm font-semibold text-gray-700">{ubicacion.direccion}</p>
                  )}
                  {ubicacion.latitud !== null && ubicacion.longitud !== null && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {ubicacion.latitud}, {ubicacion.longitud}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {alojamiento && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {alojamiento.imagenes?.length > 0 ? (
              <img src={getImageUrl(alojamiento.imagenes[0])} alt="portada vivienda" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-800 text-base leading-tight flex-1">{alojamiento.titulo || 'Mi Vivienda'}</h3>
                <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg whitespace-nowrap">
                  {alojamiento.tipoPropiedad || '—'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">📍 {alojamiento.sector || 'Ubicación no especificada'}</p>
              {alojamiento.comuna && (
                <p className="text-xs text-gray-400 mb-3">🏙 {alojamiento.comuna}</p>
              )}
              {alojamiento.habitacionesOfrecidas?.length > 0 && (
                <p className="text-sm font-bold text-blue-700 mb-4">
                  Desde ${Number(alojamiento.habitacionesOfrecidas[0].precio || 0).toLocaleString('es-CL')} / mes
                </p>
              )}
              <div className="flex gap-2">
                <Link to={`/detalle-vivienda/${alojamiento._id}`} className="flex-1 text-center py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all">
                  Ver Publicación
                </Link>
                <Link to={`/editar-vivienda/${alojamiento._id}`} className="flex-1 text-center py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all">
                  Editar Vivienda
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Estilo de Convivencia</h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🚬</span>
              <span className="text-[11px] font-bold">Fuma: {preferencias.fuma || 'No'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🍷</span>
              <span className="text-[11px] font-bold">Bebe: {preferencias.bebeAlcohol || 'No'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700 col-span-2">
              <span className="text-base">🐾</span>
              <span className="text-[11px] font-bold">Mascotas: {preferencias.mascotas || 'No'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Nivel de Orden</span>
                <span className="font-bold text-blue-600">{preferencias.orden ?? 0}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((preferencias.orden ?? 0) / 5) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Tolerancia al Ruido</span>
                <span className="font-bold text-blue-600">{preferencias.ruido ?? 0}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((preferencias.ruido ?? 0) / 5) * 100}%` }}></div>
              </div>
            </div>
            {preferencias.horarioPreferido && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-500">
                  <span className="font-bold text-gray-700">Horario:</span> {preferencias.horarioPreferido}
                </p>
              </div>
            )}
          </div>
        </section>

        {hayFiltros && (
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Busco compañeros que…</h3>
            <div className="flex flex-wrap gap-2">
              {filtros.soloMismaUniversidad && (
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">🎓 Sean de mi U</span>
              )}
              {filtros.soloMismaCarrera && (
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">📚 Sean de mi carrera</span>
              )}
              {filtros.generoPreferido && filtros.generoPreferido !== 'Indiferente' && (
                <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">👤 {filtros.generoPreferido}</span>
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-2">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {intereses.length === 0 && (
              <span className="text-xs text-gray-400">Sin intereses registrados</span>
            )}
            {intereses.map((interes, index) => {
              return (
                <span key={index} className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                  <span>{interes?.icono || '⭐'}</span>
                  {interes?.nombre || (typeof interes === 'string' ? interes : '')}
                </span>
              );
            })}
          </div>
        </section>

        <Link
          to="/login"
          className="w-full block text-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-100 transition-colors mt-4"
          onClick={() => {
            localStorage.removeItem('token');
          }}
        >
          Cerrar Sesión
        </Link>
      </div>

      {mostrarModalVivienda && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gray-900 mb-6 mx-auto shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">¿Tienes una vivienda?</h3>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Para encontrar a tu compañero ideal, primero añade las características de la vivienda que tienes disponible.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmarAñadirVivienda} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md">
                Sí, añadir datos
              </button>
              <button onClick={() => { setMostrarModalVivienda(false); }} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>
        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-medium">Chats</span>
        </Link>
        <Link to="/perfil" className="flex flex-col items-center text-blue-600 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default Perfil;
