import { Link, useNavigate } from 'react-router-dom';

const Registro = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/completar-perfil');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col">
        
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-2">Crea tu Cuenta</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Ingresa tus datos principales para unirte a Roomeet
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* SECCIÓN: CUENTA */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">1. Credenciales</h2>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Correo Institucional</label>
              <input required type="email" placeholder="estudiante@pucv.cl" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Contraseña</label>
              <input required type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </section>

          {/* SECCIÓN: DATOS PERSONALES */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">2. Datos Personales</h2>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nombre Completo</label>
              <input required type="text" placeholder="Ej. André Limari" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Teléfono</label>
                <input required type="tel" placeholder="+56 9..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Nacimiento</label>
                <input required type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Sexo Biológico</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Identidad de Género</label>
                <input type="text" placeholder="Opcional" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
          </section>

          {/* SECCIÓN: PERFIL ACADÉMICO */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 border-b border-gray-100 pb-1 uppercase tracking-wider">3. Perfil Académico</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Universidad</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  <option value="PUCV">PUCV</option>
                  <option value="UTFSM">UTFSM</option>
                  <option value="UV">UV</option>
                  <option value="UPLA">UPLA</option>
                  <option value="OTRA">Otra...</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Ingreso</label>
                <input required type="number" placeholder="2020" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Carrera</label>
              <input required type="text" placeholder="Ej. Ingeniería en Informática" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

          </section>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-6"
          >
            Continuar
          </button>
        </form>

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