import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; 
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Explorar from './pages/Explorar';
import Chats from './pages/Chats'; 
import Publicar from './pages/Publicar';
import RecuperarPassword from './pages/RecuperarPassword'; 
import Perfil from './pages/Perfil'; 
import Conversacion from './pages/Conversacion';
import EditarPerfil from './pages/EditarPerfil';

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
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/chat/:id" element={<Conversacion />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;