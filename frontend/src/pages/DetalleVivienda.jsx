import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { API_BASE, API_URL } from '../config/env.js';
import { apiClient } from '../services/apiClient';

const getImageUrl = (ruta) => {
  if (!ruta) {
    return null;
  }
  if (ruta.startsWith('http')) {
    return ruta;
  }
  return `${API_BASE}${ruta}`;
};

// Icono personalizado para Leaflet
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente auxiliar para recentrar el mapa al cargar
const MapRecenter = (props) => {
  const lat = props.lat;
  const lng = props.lng;
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const DetalleVivienda = (props) => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const [indiceFotoActual, setIndiceFotoActual] = useState(0);

  // Estado para los datos reales del alojamiento
  const [vivienda, setVivienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para contacto/postulación
  const [contactando, setContactando] = useState(false);
  const [contactarError, setContactarError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/alojamientos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la vivienda');
        }
        const data = await response.json();
        setVivienda(data);
      } catch (err) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (vivienda) {
      setIndiceFotoActual(0);
    }
  }, [vivienda]);

  const obtenerFotosVivienda = () => {
    if (!vivienda) {
      return [];
    }
    if (vivienda.fotos && vivienda.fotos.length > 0) {
      return vivienda.fotos;
    }
    if (vivienda.imagenes && vivienda.imagenes.length > 0) {
      return vivienda.imagenes;
    }
    return [];
  };

  const fotoAnterior = () => {
    const fotos = obtenerFotosVivienda();
    let nuevoIndice = 0;

    if (indiceFotoActual === 0) {
      nuevoIndice = fotos.length - 1;
    } else {
      nuevoIndice = indiceFotoActual - 1;
    }

    setIndiceFotoActual(nuevoIndice);
  };

  const fotoSiguiente = () => {
    const fotos = obtenerFotosVivienda();
    const ultimoIndice = fotos.length - 1;
    let nuevoIndice = 0;

    if (indiceFotoActual === ultimoIndice) {
      nuevoIndice = 0;
    } else {
      nuevoIndice = indiceFotoActual + 1;
    }

    setIndiceFotoActual(nuevoIndice);
  };

  const irAFoto = (indice) => {
    setIndiceFotoActual(indice);
  };

  // Postulación/contactar: crea la solicitud y navega al chat con el anfitrión
  const handleContactar = async () => {
    if (!vivienda) {
      return;
    }

    const idAnfitrion = vivienda.id_anfitrion;
    if (!idAnfitrion) {
      setContactarError('No se pudo identificar al anunciante. Intenta recargar la página.');
      return;
    }

    setContactarError('');
    setContactando(true);

    try {
      const idAlojamiento = vivienda._id || vivienda.id;
      const payload = {
        id_alojamiento: String(idAlojamiento),
      };

      await apiClient.post('/solicitudes', payload);

      const respuestaChat = await apiClient.get('/chats/con-usuario/' + String(idAnfitrion));

      let chatId = null;
      if (respuestaChat) {
        if (respuestaChat.id_chat) {
          chatId = respuestaChat.id_chat;
        }
      }

      if (!chatId) {
        throw new Error('No se pudo abrir el chat con el anunciante.');
      }

      navigate('/chat/' + String(chatId));
    } catch (err) {
      setContactarError(err.message || 'Error al contactar. Intenta de nuevo.');
    } finally {
      setContactando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <span className="text-gray-400 text-lg">Cargando vivienda...</span>
      </div>
    );
  }

  if (error || !vivienda) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white px-6 py-4 rounded-xl shadow-md border border-red-200 flex flex-col items-center">
          <span className="text-red-600 text-lg font-bold mb-2">Error</span>
          <span className="text-gray-600">{error || "No se encontró la vivienda."}</span>
          <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded font-bold" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const fotos = obtenerFotosVivienda();

  let idAnfitrionPerfil = '';
  if (vivienda.id_anfitrion) {
    idAnfitrionPerfil = String(vivienda.id_anfitrion);
  }

  let mostrarFlechasCarrusel = false;
  if (fotos.length > 1) {
    mostrarFlechasCarrusel = true;
  }

  let urlFotoPrincipal = null;
  if (fotos.length > 0) {
    const rutaFoto = fotos[indiceFotoActual];
    urlFotoPrincipal = getImageUrl(rutaFoto);
  }

  let textoIndicadorFotos = '';
  if (fotos.length > 0) {
    const numeroActual = indiceFotoActual + 1;
    const totalFotos = fotos.length;
    textoIndicadorFotos = `${numeroActual} / ${totalFotos}`;
  }

  let bloqueFlechasCarrusel = null;
  if (mostrarFlechasCarrusel) {
    bloqueFlechasCarrusel = (
      <>
        <button
          type="button"
          onClick={fotoAnterior}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Foto anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={fotoSiguiente}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Foto siguiente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </>
    );
  }

  const puntosCarrusel = [];
  for (let idx = 0; idx < fotos.length; idx = idx + 1) {
    let clasePunto = 'w-2 h-2 rounded-full transition-all shadow-sm bg-white/50';
    if (indiceFotoActual === idx) {
      clasePunto = 'w-4 h-2 rounded-full transition-all shadow-sm bg-white';
    }

    puntosCarrusel.push(
      <button
        key={idx}
        type="button"
        onClick={() => irAFoto(idx)}
        className={clasePunto}
        aria-label={`Ir a foto ${idx + 1}`}
      />
    );
  }

  let bloqueImagenCarrusel = null;
  if (urlFotoPrincipal) {
    bloqueImagenCarrusel = (
      <img
        src={urlFotoPrincipal}
        alt={`Foto ${indiceFotoActual + 1}`}
        className="w-full h-full object-cover"
      />
    );
  } else {
    bloqueImagenCarrusel = (
      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm font-medium">
        Sin fotos disponibles
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">
      
      {/* HEADER FLOTANTE (Botón Atrás) */}
      <div className="absolute top-6 left-4 z-50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>

      {/* 1. CARRUSEL DE IMÁGENES */}
      <div className="relative w-full h-64 md:h-96 bg-zinc-200 rounded-lg overflow-hidden">
        {bloqueImagenCarrusel}
        {bloqueFlechasCarrusel}

        {fotos.length > 0 && (
          <div className="absolute bottom-4 left-0 right-0 z-10 flex flex-col items-center gap-2">
            <span className="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {textoIndicadorFotos}
            </span>
            {fotos.length > 1 && (
              <div className="flex justify-center gap-2">
                {puntosCarrusel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENEDOR PRINCIPAL BLANCO (Sube un poco sobre la imagen) */}
      <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-20 px-6 pt-8 pb-6 shadow-sm">
        
        {/* 2. ENCABEZADO Y ANUNCIANTE */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {vivienda.tipoPropiedad || 'Alojamiento'}
              </span>
              {/* Puedes agregar lógica de disponibilidad según backend */}
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Disponible
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{vivienda.titulo}</h1>
            <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-1">
              📍 {vivienda.sector || ''}
            </p>
            {vivienda.comuna && (
              <p className="text-gray-400 text-xs mt-0.5">🏙 {vivienda.comuna}</p>
            )}
          </div>
          
          {idAnfitrionPerfil && (
            <Link to={'/usuario/' + idAnfitrionPerfil} className="flex flex-col items-center group flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform relative">
                {
                  typeof vivienda.anunciante?.foto === 'string'
                    ? vivienda.anunciante.foto
                    : (vivienda.anunciante?.nombre || 'US')
                }
                {vivienda.anunciante?.verificado && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-600 mt-1 uppercase">Ver Perfil</span>
            </Link>
          )}
        </div>

        {/* 3. BLOQUE DE PRECIO Y PIEZAS */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Se Arrienda</h3>
          {(vivienda.habitacionesOfrecidas || []).length > 0 ? (
            vivienda.habitacionesOfrecidas.map((hab, i) => (
              <div key={hab.id || hab._id || i} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                    Habitación {hab.id || hab._id || i+1} • {hab.tipoBano?.includes('Privado') || hab.bano === 'Privado' ? 'Baño Privado' : 'Baño Compartido'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">
                      $
                      {(typeof hab.precio === 'number' ? hab.precio : parseFloat(hab.precio)).toLocaleString('es-CL')}
                    </span>
                    <span className="text-xs font-medium text-blue-100">/ mes</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg text-center">
              <span className="font-bold">Precio: ${vivienda.precio ? parseFloat(vivienda.precio).toLocaleString('es-CL') : '—'}</span>
            </div>
          )}
        </div>

        {/* 4. SÚPER FILTROS UNIVERSITARIOS */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">🛋️</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Estado</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.amoblado || 'No especificado'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">💡</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Gastos Comunes</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.gastosComunes || 'No especificado'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">🚌</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Locomoción</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.locomocion || 'No especificado'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">👥</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Convivencia</p>
            <p className="text-xs font-bold text-gray-800">
              Viven {vivienda.habitantesActuales ?? '-'} de {vivienda.habitacionesTotales ?? '-'} pers.
            </p>
          </div>
        </div>

        {/* 5. DESCRIPCIÓN */}
        <div className="mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Sobre el hogar</h3>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {vivienda.descripcion || 'Sin descripción.'}
          </p>
        </div>

        {/* 6. AMENITIES (Lo que incluye) */}
        <div className="mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Equipamiento</h3>
          <div className="flex flex-wrap gap-2">
            {(vivienda.caracteristicas || []).length > 0
              ? vivienda.caracteristicas.map((caract, index) => (
                <span key={index} className="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm">
                  ✓ {caract}
                </span>
              ))
              : <span className="text-gray-400 text-xs">No informado por anunciante</span>
            }
          </div>
        </div>

        {/* 7. MAPA EXACTO */}
        <div className="mb-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Ubicación</h3>
          {/* Renderizar el mapa solo si hay coordenadas */}
          {vivienda.latitud && vivienda.longitud ? (
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
              <MapContainer
                center={[vivienda.latitud, vivienda.longitud]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <MapRecenter lat={vivienda.latitud} lng={vivienda.longitud} />
                <Marker position={[vivienda.latitud, vivienda.longitud]} icon={customIcon} />
              </MapContainer>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl flex items-center justify-center h-48 text-gray-400">Sin ubicación disponible</div>
          )}
        </div>

      </div>


      {/* BOTÓN FLOTANTE "CONTACTAR" (Anclado abajo) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <button
          className={`w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg ${contactando ? 'opacity-60 pointer-events-none' : ''}`}
          onClick={handleContactar}
          disabled={contactando}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {contactando ? "Enviando..." : "Contactar Anunciante"}
        </button>
        {contactarError && (
          <div className="text-red-600 text-sm font-bold mt-2">{contactarError}</div>
        )}
      </div>

    </div>
  );
};

export default DetalleVivienda;