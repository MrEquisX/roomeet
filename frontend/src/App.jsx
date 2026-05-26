import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} /> {/* <-- Nueva ruta */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/chat/:id" element={<Conversacion />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/nueva-password" element={<NuevaPassword />} />
        <Route path="/anadir-vivienda" element={<AnadirVivienda />} />
        <Route path="/usuario/:id" element={<PerfilPublico />} />
        <Route path="/chats-archivados" element={<ChatsArchivados />} />
        <Route path="/detalle-vivienda" element={<DetalleVivienda />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;