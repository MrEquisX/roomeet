import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Perfil = () => {
  const navigate = useNavigate();
  const [mostrarModalVivienda, setMostrarModalVivienda] = useState(false);

  // Datos simulados (Espejo exacto de las nuevas tablas de MariaDB)
  const usuario = {
    nombre: "André",
    apellido: "Limari",
    carrera: "Ing. en Informática",
    universidad: "PUCV",
    sede: "Campus Curauma",
    bio: "Busco compañeros tranquilos que respeten los horarios de estudio. Me gusta armar PCs los fines de semana y entrenar.",
    filtros: {
      soloMismaUniversidad: true,
      soloMismaCarrera: false,
      generoPreferido: "Mixto"
    },
    preferencias: {
      fuma: false,
      mascotas: true,
      bebeAlcohol: "Socialmente",
      tipoDieta: "Omnívoro",
      visitasFrecuentes: false,
      aceptaParejasVisita: false,
      horarioPreferido: "Diurno",
      orden: 4, 
      ruido: 2  
    },
    intereses: [
      { nombre: 'Fútbol', icono: '⚽' },
      { nombre: 'Hardware & Gaming', icono: '💻' },
      { nombre: 'Entrenamiento en Casa', icono: '💪' }
    ]
  };

  const confirmarAñadirVivienda = () => {
    setMostrarModalVivienda(false);
    navigate('/anadir-vivienda');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">
      
      {/* HEADER / PORTADA */}
      <div className="bg-blue-600 h-32 rounded-b-[3rem] w-full relative shadow-sm">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            <div className="w-full h-full bg-gray-800 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold">
              {usuario.nombre[0]}
            </div>
          </div>
        </div>
      </div>

      {/* INFO BÁSICA Y BOTONES */}
      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-bold text-blue-900">{usuario.nombre} {usuario.apellido}</h1>
        <p className="text-gray-500 text-sm mt-1">{usuario.carrera}</p>
        <p className="text-blue-600 font-bold text-xs mt-0.5">{usuario.universidad} - {usuario.sede}</p>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link 
            to="/editar-perfil" 
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span className="text-sm">Editar Perfil</span>
          </Link>

          <button 
            onClick={() => setMostrarModalVivienda(true)}
            className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-sm">Añadir Vivienda</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        
        {/* FILTROS EXCLUYENTES */}
        {(usuario.filtros.soloMismaUniversidad || usuario.filtros.soloMismaCarrera || usuario.filtros.generoPreferido !== 'Indiferente') && (
          <div className="flex flex-wrap gap-2 justify-center">
            {usuario.filtros.soloMismaUniversidad && (
              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">🎓 Solo mi U</span>
            )}
            {usuario.filtros.soloMismaCarrera && (
              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">📚 Solo mi Carrera</span>
            )}
            {usuario.filtros.generoPreferido !== 'Indiferente' && (
              <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">👤 {usuario.filtros.generoPreferido}</span>
            )}
          </div>
        )}

        {/* BIOGRAFÍA */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Sobre mí</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{usuario.bio}</p>
        </section>

        {/* REGLAS DE CASA Y HÁBITOS */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Estilo de Convivencia</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${usuario.preferencias.fuma ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
              <span className="text-base">{usuario.preferencias.fuma ? '🚬' : '🚭'}</span>
              <span className="text-[11px] font-bold">{usuario.preferencias.fuma ? 'Permite Fumar' : 'Libre de humo'}</span>
            </div>
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${usuario.preferencias.mascotas ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <span className="text-base">{usuario.preferencias.mascotas ? '🐾' : '🚫'}</span>
              <span className="text-[11px] font-bold">{usuario.preferencias.mascotas ? 'Pet friendly' : 'Sin mascotas'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🍷</span>
              <span className="text-[11px] font-bold leading-tight">Alcohol: {usuario.preferencias.bebeAlcohol}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-gray-50 border-gray-100 text-gray-700">
              <span className="text-base">🥗</span>
              <span className="text-[11px] font-bold leading-tight">Dieta: {usuario.preferencias.tipoDieta}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-600">Visitas de amigos</span>
              <span className={`text-[11px] font-extrabold px-2 py-1 rounded-md ${usuario.preferencias.visitasFrecuentes ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {usuario.preferencias.visitasFrecuentes ? 'PERMITIDAS' : 'RESTRINGIDAS'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-600">Pareja a dormir</span>
              <span className={`text-[11px] font-extrabold px-2 py-1 rounded-md ${usuario.preferencias.aceptaParejasVisita ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {usuario.preferencias.aceptaParejasVisita ? 'PERMITIDO' : 'RESTRINGIDO'}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Nivel de Orden</span>
                <span className="font-bold text-blue-600">{usuario.preferencias.orden}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(usuario.preferencias.orden/5)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Tolerancia al Ruido</span>
                <span className="font-bold text-blue-600">{usuario.preferencias.ruido}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(usuario.preferencias.ruido/5)*100}%` }}></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[11px] text-gray-500"><span className="font-bold text-gray-700">Horario Principal:</span> {usuario.preferencias.horarioPreferido}</p>
            </div>
          </div>
        </section>

        {/* INTERESES (Actualizado a Iconos) */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-2">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {usuario.intereses.map((interes, index) => (
              <span key={index} className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                <span>{interes.icono}</span>
                {interes.nombre}
              </span>
            ))}
          </div>
        </section>

        {/* BOTÓN CERRAR SESIÓN */}
        <Link 
          to="/login" 
          className="w-full block text-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-100 transition-colors mt-4"
        >
          Cerrar Sesión
        </Link>
      </div>

      {/* MODAL DE CONFIRMACIÓN AÑADIR DEPTO */}
      {mostrarModalVivienda && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] px-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gray-900 mb-6 mx-auto shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">¿Tienes una vivienda?</h3>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Para encontrar a tu compañero ideal, primero añade las características de la vivienda que tienes disponible para dividir los gastos.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmarAñadirVivienda}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md"
              >
                Sí, añadir datos
              </button>
              <button 
                onClick={() => setMostrarModalVivienda(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ INFERIOR */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>

        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-medium">Chats</span>
        </Link>

        <Link to="/perfil" className="flex flex-col items-center text-blue-600 w-16 transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default Perfil;