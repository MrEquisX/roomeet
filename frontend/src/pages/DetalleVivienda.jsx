import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Icono personalizado para Leaflet
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente auxiliar para recentrar el mapa al cargar
const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const DetalleVivienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado para el Carrusel de Imágenes
  const [imagenActiva, setImagenActiva] = useState(0);

  // SIMULACIÓN DE BASE DE DATOS (Este objeto refleja exactamente lo que envía AnadirVivienda.jsx)
  const vivienda = {
    id: id || "123",
    titulo: "Amplio depto a pasos de la PUCV",
    descripcion: "Buscamos a alguien tranquilo/a para compartir depto. Somos dos estudiantes de ingeniería, nos gusta el orden y mantener los espacios comunes limpios. A veces nos juntamos a estudiar o ver series en el living. El edificio es súper seguro.",
    tipoPropiedad: "Departamento",
    amoblado: "Amoblado Completo",
    gastosComunes: "Incluidos en el precio",
    locomocion: "A menos de 5 min caminando",
    sector: "Viña del Mar - Plan",
    latitud: -33.0245, 
    longitud: -71.5518,
    habitacionesTotales: 3,
    habitantesActuales: 2,
    habitacionesDisponibles: 1,
    // Detalle de lo que se arrienda
    habitacionesOfrecidas: [
      { id: 1, precio: "180000", tipoBano: "Privado (Dentro de la pieza)" }
    ],
    // Categorías de amenities
    caracteristicas: [
      "Wi-Fi Fibra Óptica", "Cocina Equipada", "Lavadora", "Ascensor", "Conserjería 24/7"
    ],
    // Fotos del anuncio
    imagenes: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1e525044c7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    // Información del anunciante
    anunciante: {
      id: "u-456",
      nombre: "Nicolás M.",
      verificado: true,
      foto: "NM"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">
      
      {/* HEADER FLOTANTE (Botón Atrás) */}
      <div className="absolute top-6 left-4 z-50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>

      {/* 1. CARRUSEL DE IMÁGENES */}
      <div className="relative w-full h-72 md:h-96 bg-gray-200 overflow-hidden">
        <img 
          src={vivienda.imagenes[imagenActiva]} 
          alt={`Foto ${imagenActiva + 1}`} 
          className="w-full h-full object-cover animate-in fade-in duration-300"
        />
        
        {/* Puntos del Carrusel */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {vivienda.imagenes.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setImagenActiva(idx)}
              className={`w-2 h-2 rounded-full transition-all shadow-sm ${imagenActiva === idx ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL BLANCO (Sube un poco sobre la imagen) */}
      <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-20 px-6 pt-8 pb-6 shadow-sm">
        
        {/* 2. ENCABEZADO Y ANUNCIANTE */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {vivienda.tipoPropiedad}
              </span>
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Disponible
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{vivienda.titulo}</h1>
            <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-1">
              📍 {vivienda.sector}
            </p>
          </div>
          
          <Link to={`/usuario/${vivienda.anunciante.id}`} className="flex flex-col items-center group flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform relative">
              {vivienda.anunciante.foto}
              {vivienda.anunciante.verificado && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-600 mt-1 uppercase">Ver Perfil</span>
          </Link>
        </div>

        {/* 3. BLOQUE DE PRECIO Y PIEZAS (Lo que busca el usuario) */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Se Arrienda</h3>
          
          {vivienda.habitacionesOfrecidas.map((hab) => (
            <div key={hab.id} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                  Habitación {hab.id} • {hab.tipoBano.includes('Privado') ? 'Baño Privado' : 'Baño Compartido'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">${parseFloat(hab.precio).toLocaleString('es-CL')}</span>
                  <span className="text-xs font-medium text-blue-100">/ mes</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. SÚPER FILTROS UNIVERSITARIOS (Grid de highlights) */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">🛋️</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Estado</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.amoblado}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">💡</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Gastos Comunes</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.gastosComunes}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">🚌</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Locomoción</p>
            <p className="text-xs font-bold text-gray-800">{vivienda.locomocion}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xl mb-1 block">👥</span>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase">Convivencia</p>
            <p className="text-xs font-bold text-gray-800">
              Viven {vivienda.habitantesActuales} de {vivienda.habitacionesTotales} pers.
            </p>
          </div>
        </div>

        {/* 5. DESCRIPCIÓN */}
        <div className="mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Sobre el hogar</h3>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {vivienda.descripcion}
          </p>
        </div>

        {/* 6. AMENITIES (Lo que incluye) */}
        <div className="mb-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Equipamiento</h3>
          <div className="flex flex-wrap gap-2">
            {vivienda.caracteristicas.map((caract, index) => (
              <span key={index} className="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm">
                ✓ {caract}
              </span>
            ))}
          </div>
        </div>

        {/* 7. MAPA EXACTO */}
        <div className="mb-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">Ubicación</h3>
          <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
            <MapContainer 
              center={[vivienda.latitud, vivienda.longitud]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false} // Quitamos botones para dejarlo limpio en móviles
              dragging={false} // Desactivamos el arrastre para que sea solo de lectura rápida
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <MapRecenter lat={vivienda.latitud} lng={vivienda.longitud} />
              <Marker position={[vivienda.latitud, vivienda.longitud]} icon={customIcon} />
            </MapContainer>
          </div>
        </div>

      </div>

      {/* BOTÓN FLOTANTE "CONTACTAR" (Anclado abajo) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <Link 
          to={`/chat/nuevo-${vivienda.anunciante.id}`} 
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Contactar Anunciante
        </Link>
      </div>

    </div>
  );
};

export default DetalleVivienda;