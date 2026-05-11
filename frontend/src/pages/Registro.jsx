import { Link } from 'react-router-dom';

const Registro = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col">
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-2">Crea tu Perfil</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Únete a Roomeet y define tu estilo de vida
        </p>

        <form className="w-full space-y-8">
          
          {/* SECCIÓN 1: TABLA USUARIOS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">1. Datos Personales</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Nombre Completo</label>
              <input type="text" placeholder="Ej. André Limari" className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Correo Institucional</label>
              <input type="email" placeholder="estudiante@pucv.cl" className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">¿Qué buscas en Roomeet?</label>
              <select className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="buscador">Busco una pieza o compañeros</option>
                <option value="anfitrion">Soy Anfitrión (Tengo una pieza para arrendar)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1 ml-1">Esto define tu Rol en la plataforma.</p>
            </div>
          </section>

          {/* SECCIÓN 2: TABLA PREFERENCIAS_CONVIVENCIA */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">2. Preferencias de Convivencia</h2>
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Fumas?</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="fuma" value="true" /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="fuma" value="false" defaultChecked /> No</label>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Aceptas mascotas?</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="mascotas" value="true" defaultChecked /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="mascotas" value="false" /> No</label>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">¿Visitas frecuentes?</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="visitas" value="true" /> Sí</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="visitas" value="false" defaultChecked /> No</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Nivel de Orden (1 al 5)</label>
              <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                <span>Relajado</span>
                <span>Estricto</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Tolerancia al Ruido (1 al 5)</label>
              <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                <span>Silencio total</span>
                <span>Fiesta</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Horario Preferido</label>
              <select className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="diurno">Diurno (Mañanero)</option>
                <option value="nocturno">Nocturno (Búho)</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
          </section>

          {/* Botón Principal */}
          <button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4"
          >
            Completar Registro
          </button>
        </form>

        {/* Volver */}
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Registro;