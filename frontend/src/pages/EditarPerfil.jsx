import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditarPerfil = () => {
  const navigate = useNavigate();

  // ESTADOS DEL MODAL
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // ESTADOS DEL PERFIL (Simulando datos cargados desde la Base de Datos)
  const [biografia, setBiografia] = useState('Busco compañeros tranquilos que respeten los horarios de estudio. Me gusta armar PCs los fines de semana.');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null); // Aquí iría la URL de la BD si el usuario ya tuviera foto

  // Hábitos
  const [fuma, setFuma] = useState(false);
  const [aceptaMascotas, setAceptaMascotas] = useState(true);
  const [bebeAlcohol, setBebeAlcohol] = useState('Socialmente');
  const [tipoDieta, setTipoDieta] = useState('Omnívoro');

  // Reglas
  const [nivelOrden, setNivelOrden] = useState(4);
  const [nivelRuido, setNivelRuido] = useState(2);
  const [visitasFrecuentes, setVisitasFrecuentes] = useState(false);
  const [aceptaParejasVisita, setAceptaParejasVisita] = useState(false);
  const [horarioPreferido, setHorarioPreferido] = useState('Diurno');

  // Filtros Excluyentes
  const [soloMismaUniversidad, setSoloMismaUniversidad] = useState(false);
  const [soloMismaCarrera, setSoloMismaCarrera] = useState(false);
  const [generoPreferido, setGeneroPreferido] = useState('Indiferente');

  // Intereses (Simulando que el usuario ya tenía 2 seleccionados en la BD)
  const [interesesSeleccionados, setInteresesSeleccionados] = useState(['Fútbol', 'Hardware & Gaming']);

  // MANEJO DE IMAGEN
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  // MANEJO DE INTERESES (Máximo 5)
  const handleInteresToggle = (interes) => {
    setInteresesSeleccionados(prev => {
      if (prev.includes(interes)) {
        return prev.filter(i => i !== interes);
      }
      if (prev.length < 5) {
        return [...prev, interes];
      }
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payloadActualizado = {
      biografia, fuma, aceptaMascotas, bebeAlcohol, tipoDieta,
      nivelOrden, nivelRuido, visitasFrecuentes, aceptaParejasVisita,
      horarioPreferido, soloMismaUniversidad, soloMismaCarrera,
      generoPreferido, interesesSeleccionados
    };
    console.log('Guardando cambios en BD (UPDATE):', payloadActualizado);
    navigate('/perfil');
  };

  const handleCancelarClick = () => setMostrarAlerta(true);
  const confirmarCancelar = () => navigate('/perfil');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 flex flex-col relative">
        
        {/* HEADER CON BOTÓN DE VOLVER */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={handleCancelarClick} className="text-gray-400 hover:text-blue-600 p-2 -ml-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-blue-900 text-center flex-1 -ml-4">Editar Perfil</h1>
        </div>
        <p className="text-sm text-gray-500 text-center mb-8">
          Actualiza tus preferencias para encontrar compañeros más afines a ti.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-8">
          
          {/* FOTO DE PERFIL */}
          <section className="flex flex-col items-center space-y-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold text-center px-2">Cambiar Foto</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-400">Actualiza tu foto de perfil</span>
          </section>

          {/* BIOGRAFÍA */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Sobre ti</h2>
            <div>
              <textarea 
                required 
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                rows="3" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              ></textarea>
            </div>
          </section>

          

          {/* HÁBITOS DE VIDA */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">Hábitos y Convivencia</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">¿Fumas?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={fuma === true} onChange={() => setFuma(true)} className="accent-blue-600" /> Sí</label>
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={fuma === false} onChange={() => setFuma(false)} className="accent-blue-600" /> No</label>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">Alcohol</span>
                <select value={bebeAlcohol} onChange={(e) => setBebeAlcohol(e.target.value)} className="w-full bg-transparent text-sm font-medium focus:outline-none">
                  <option value="Nunca">Nunca</option>
                  <option value="Socialmente">Socialmente</option>
                  <option value="Frecuente">Frecuente</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">Dieta</span>
                <select value={tipoDieta} onChange={(e) => setTipoDieta(e.target.value)} className="w-full bg-transparent text-sm font-medium focus:outline-none">
                  <option value="Omnívoro">Omnívoro</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                  <option value="Indiferente">Indiferente</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-700 mb-2">¿Mascotas?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={aceptaMascotas === true} onChange={() => setAceptaMascotas(true)} className="accent-blue-600" /> Sí</label>
                  <label className="flex items-center gap-1 text-sm font-medium"><input type="radio" checked={aceptaMascotas === false} onChange={() => setAceptaMascotas(false)} className="accent-blue-600" /> No</label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Nivel de Orden (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelOrden} onChange={(e) => setNivelOrden(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Relajado</span><span>Equilibrado</span><span>Estricto</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">Tolerancia al Ruido (1 al 5)</label>
              <input type="range" min="1" max="5" value={nivelRuido} onChange={(e) => setNivelRuido(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-1 uppercase">
                <span>Silencio total</span><span>Normal</span><span>Fiesta</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-colors ${visitasFrecuentes ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <span className="text-xs font-bold text-gray-700">Permitir visitas frecuentes de amigos</span>
                <input type="checkbox" checked={visitasFrecuentes} onChange={(e) => setVisitasFrecuentes(e.target.checked)} className="accent-blue-600 w-4 h-4" />
              </label>
              <label className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-colors ${aceptaParejasVisita ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <span className="text-xs font-bold text-gray-700">Permitir que la pareja se quede a dormir</span>
                <input type="checkbox" checked={aceptaParejasVisita} onChange={(e) => setAceptaParejasVisita(e.target.checked)} className="accent-blue-600 w-4 h-4" />
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Horario Preferido</label>
              <select value={horarioPreferido} onChange={(e) => setHorarioPreferido(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium">
                <option value="Diurno">Diurno (Activo de día, duermo de noche)</option>
                <option value="Nocturno">Nocturno (Estudio/Trabajo de noche)</option>
                <option value="Indiferente">Indiferente (Horarios flexibles)</option>
              </select>
            </div>
          </section>

          {/* INTERESES SEMILLA */}
          <section className="space-y-3">
            <div className="flex justify-between items-end border-b border-gray-100 pb-1">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Tus Intereses</h2>
              <span className="text-[10px] font-bold text-gray-400">{interesesSeleccionados.length}/5 max</span>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {[
                { id: 1, nombre: 'Fútbol', icono: '⚽' },
                { id: 2, nombre: 'Calistenia / Gym', icono: '💪' },
                { id: 3, nombre: 'Hardware & Gaming', icono: '💻' },
                { id: 4, nombre: 'Básquetbol', icono: '🏀' },
                { id: 5, nombre: 'Música', icono: '🎸' },
                { id: 6, nombre: 'Cine y Series', icono: '🎬' },
                { id: 7, nombre: 'Programación', icono: '🚀' },
                { id: 8, nombre: 'Cocina', icono: '🍳' },
                { id: 9, nombre: 'Automovilismo & Tuning', icono: '🚗' },
                { id: 10, nombre: 'Juegos de Mesa', icono: '🎲' }
              ].map((item) => {
                const isActive = interesesSeleccionados.includes(item.nombre);
                const isDisabled = !isActive && interesesSeleccionados.length >= 5;
                
                return (
                  <button
                    key={item.nombre}
                    type="button"
                    onClick={() => handleInteresToggle(item.nombre)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : isDisabled 
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span>{item.icono}</span>
                    {item.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Guardar Cambios
            </button>
            
            <button 
              type="button" 
              onClick={handleCancelarClick}
              className="w-full bg-transparent border-2 border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 font-bold py-3 rounded-2xl transition-all"
            >
              Cancelar
            </button>
          </div>
          
        </form>
      </div>

      {/* VENTANA EMERGENTE (MODAL) DE CANCELACIÓN */}
      {mostrarAlerta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-4 mx-auto shadow-sm">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Descartar cambios?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Los cambios que hiciste no se guardarán. Recuerda que mantener tu perfil detallado y actualizado aumenta significativamente tus posibilidades de encontrar al compañero ideal.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setMostrarAlerta(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Seguir editando
              </button>
              <button 
                onClick={confirmarCancelar}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Sí, salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditarPerfil;