import { Link } from 'react-router-dom';

const Perfil = () => {
  // Datos simulados (pronto vendrán de tu MariaDB)
  const usuario = {
    nombre: "André",
    apellido: "Pérez",
    carrera: "Ing. Civil Informática",
    universidad: "PUCV",
    bio: "Busco compañeros tranquilos que respeten los horarios de estudio. Me gusta el básquet y los videojuegos.",
    preferencias: {
      fuma: false,
      mascotas: true,
      orden: 4, // Escala 1-5
      ruido: 2  // Escala 1-5
    },
    intereses: ["Música", "Deportes", "Gaming", "Cocina"]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      
      {/* Header / Portada */}
      <div className="bg-blue-600 h-32 rounded-b-[3rem] w-full relative">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-lg p-1">
            <div className="w-full h-full bg-gray-800 rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-bold">
              {usuario.nombre[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Info Básica */}
      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-bold text-blue-900">{usuario.nombre} {usuario.apellido}</h1>
        <p className="text-gray-500 text-sm">{usuario.carrera}</p>
        <p className="text-blue-600 font-semibold text-xs mt-1">{usuario.universidad}</p>
        
        <div className="flex justify-center gap-4 mt-6">
          <Link to="/editar-perfil" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md inline-block text-center">
            Editar Perfil
          </Link>
          <button className="bg-white text-gray-400 p-2 rounded-xl border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Biografía */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Sobre mí</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {usuario.bio}
          </p>
        </section>

        {/* Convivencia */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Estilo de Convivencia</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-2 p-3 rounded-2xl border ${usuario.preferencias.fuma ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
              <span className="text-lg">{usuario.preferencias.fuma ? '🚬' : '🚭'}</span>
              <span className="text-xs font-bold">{usuario.preferencias.fuma ? 'Fumador' : 'No fumador'}</span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-2xl border ${usuario.preferencias.mascotas ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <span className="text-lg">{usuario.preferencias.mascotas ? '🐶' : '🚫'}</span>
              <span className="text-xs font-bold">{usuario.preferencias.mascotas ? 'Pet friendly' : 'Sin mascotas'}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Nivel de Orden</span>
                <span className="font-bold text-blue-600">{usuario.preferencias.orden}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(usuario.preferencias.orden/5)*100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Tolerancia al Ruido</span>
                <span className="font-bold text-blue-600">{usuario.preferencias.ruido}/5</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(usuario.preferencias.ruido/5)*100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Intereses */}
        <section>
          <h3 className="font-bold text-gray-800 mb-3 ml-2">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {usuario.intereses.map((interes, index) => (
              <span key={index} className="bg-white px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-100 shadow-sm">
                {interes}
              </span>
            ))}
          </div>
        </section>

        {/* Botón Cerrar Sesión CORREGIDO */}
        <Link 
          to="/login" 
          className="w-full block text-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-3xl border border-red-100 transition-colors mt-4"
        >
          Cerrar Sesión
        </Link>
        
      </div> {/* <-- ESTE ES EL DIV QUE FALTABA */}

      {/* MENÚ INFERIOR UNIFICADO - PERFIL ACTIVO */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        
        {/* 1. Descubrir - INACTIVO */}
        <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Descubrir</span>
        </Link>

        {/* 2. Explorar - INACTIVO */}
        <Link to="/explorar" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium">Explorar</span>
        </Link>
        
        {/* 3. Chats - INACTIVO */}
        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[10px] font-medium">Chats</span>
        </Link>

        {/* 4. Perfil - ACTIVO */}
        <Link to="/perfil" className="flex flex-col items-center text-blue-600">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </div>

    </div>
  );
};

export default Perfil;