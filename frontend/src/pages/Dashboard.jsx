import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header / Perfil Usuario */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm rounded-b-3xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">Hola, André</h2>
            <p className="text-xs text-gray-500">PUCV - Ing. Informática</p>
          </div>
        </div>
        <button className="relative p-2 text-gray-400 hover:text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Sección: Mejores Matches */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Mejores Matches</h3>
            <Link to="/explorar" className="text-sm text-blue-600 font-medium hover:underline">Ver todos</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Tarjeta Match 1 */}
            <div className="min-w-[140px] bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center relative">
              <div className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">92%</div>
              <div className="w-16 h-16 bg-gray-200 rounded-xl mb-2"></div>
              <p className="font-bold text-gray-800 text-sm">Sarah C.</p>
            </div>
            {/* Tarjeta Match 2 */}
            <div className="min-w-[140px] bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center relative">
              <div className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">87%</div>
              <div className="w-16 h-16 bg-gray-200 rounded-xl mb-2"></div>
              <p className="font-bold text-gray-800 text-sm">Sara M.</p>
            </div>
          </div>
        </section>

        {/* Sección: Gastos Recientes */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Gastos Recientes</h3>
            <span className="text-green-500">↗</span>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total del mes</p>
                <p className="text-2xl font-bold text-gray-900">$310.000</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Ahorro vs mes anterior</p>
                <p className="text-sm font-bold text-green-500">-$40.000</p>
              </div>
            </div>
            {/* Gráfico Simulado (Barras) */}
            <div className="flex items-end justify-between h-24 gap-2">
              <div className="w-full bg-blue-100 rounded-t-md h-3/6"></div>
              <div className="w-full bg-blue-100 rounded-t-md h-4/6"></div>
              <div className="w-full bg-blue-100 rounded-t-md h-full"></div>
              <div className="w-full bg-blue-400 rounded-t-md h-5/6"></div>
              <div className="w-full bg-blue-600 rounded-t-md h-4/6"></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span>
            </div>
          </div>
        </section>

      </div>

      {/* Menú de Navegación Inferior (Mobile-First) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/dashboard" className="flex flex-col items-center text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] font-bold">Descubrir</span>
        </Link>
        <Link to="/explorar" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-medium">Explorar</span>
        </Link>
        <Link to="/gastos" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-[10px] font-medium">Gastos</span>
        </Link>
        <Link to="/chats" className="flex flex-col items-center text-gray-400 hover:text-blue-500 relative">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[10px] font-medium">Chats</span>
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;