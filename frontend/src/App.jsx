import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Explorar from './pages/Explorar';
import Chats from './pages/Chats';
import RecuperarPassword from './pages/RecuperarPassword';
import Perfil from './pages/Perfil';
import Conversacion from './pages/Conversacion';
import EditarPerfil from './pages/EditarPerfil';
import CompletarPerfil from './pages/CompletarPerfil';
import NuevaPassword from './pages/NuevaPassword';
import AnadirVivienda from './pages/AnadirVivienda';
import PerfilPublico from './pages/PerfilPublico';
import ChatsArchivados from './pages/ChatsArchivados';
import DetalleVivienda from './pages/DetalleVivienda';

// Componente ProtectedRoute que verifica el token y redirige si no existe
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children ? children : <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/nueva-password" element={<NuevaPassword />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/chat/:id" element={<Conversacion />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/completar-perfil" element={<CompletarPerfil />} />
          <Route path="/anadir-vivienda" element={<AnadirVivienda />} />
          <Route path="/editar-vivienda/:id" element={<AnadirVivienda />} />
          <Route path="/usuario/:id" element={<PerfilPublico />} />
          <Route path="/chats-archivados" element={<ChatsArchivados />} />
          <Route path="/detalle-vivienda/:id" element={<DetalleVivienda />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;