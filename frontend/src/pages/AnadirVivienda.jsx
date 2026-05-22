import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AnadirVivienda = () => {
  const navigate = useNavigate();

  // Estados del formulario
  const [sector, setSector] = useState('');
  const [precio, setPrecio] = useState('');
  const [habitaciones, setHabitaciones] = useState(1);
  const [banos, setBanos] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [imagenes, setImagenes] = useState([]); // Para guardar las fotos seleccionadas
  
  // Estado para la pantalla de éxito
  const [mostrarExito, setMostrarExito] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes([...imagenes, ...files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la conexión al backend
    setMostrarExito(true); 
  };

  const finalizarProceso = () => {
    navigate('/perfil');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans justify-center relative">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-8"></div>
          <h1 className="text-xl font-bold text-gray-900 text-center flex-1">Añadir Vivienda</h1>
          <Link to="/perfil" className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </Link>
        </div>

        {/* Banner Privacidad */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
            Solo pediremos el sector general. Tu dirección exacta jamás se mostrará.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* SECCIÓN 1: FOTOS */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1 uppercase tracking-wider">1. Fotos de la vivienda</h2>
            <div className="relative">
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
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
              >
                <div className="bg-blue-50 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-500">Subir fotos o abrir cámara</span>
                {imagenes.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-bold">{imagenes.length} archivos seleccionados</span>
                )}
              </label>
            </div>
          </section>

          {/* SECCIÓN 2: UBICACIÓN */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1 uppercase tracking-wider">2. Ubicación General</h2>
            <select 
              required
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-sm"
            >
              <option value="">Selecciona comuna y sector...</option>
              <option value="vina_centro">Viña del Mar - Plan</option>
              <option value="recreo">Viña del Mar - Recreo</option>
              <option value="valpo_plan">Valparaíso - Plan</option>
              <option value="curauma">Valparaíso - Curauma</option>
            </select>
          </section>

          {/* SECCIÓN 3: DETALLES */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1 uppercase tracking-wider">3. Detalles</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">Valor Mensual (CLP)</label>
                <input 
                  type="number" required value={precio} onChange={(e) => setPrecio(e.target.value)}
                  placeholder="$ 250.000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">Piezas</label>
                <select value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm">
                  <option value="1">1</option><option value="2">2</option><option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">Baño</label>
                <select value={banos} onChange={(e) => setBanos(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm">
                  <option value="privado">Privado</option><option value="compartido">Compartido</option>
                </select>
              </div>
            </div>
            <textarea 
              rows="2" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción breve..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            ></textarea>
          </section>

          <button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
          >
            Guardar Vivienda
          </button>
        </form>

        {/* MODAL DE ÉXITO */}
        {mostrarExito && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¡Vivienda Guardada!</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Tu vivienda ya es visible para la comunidad. Ahora puedes recibir mensajes de interesados.
            </p>
            <button 
              onClick={finalizarProceso}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-black transition-all"
            >
              Ir a mi Perfil
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnadirVivienda;