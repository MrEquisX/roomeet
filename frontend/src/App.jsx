import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; 
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Explorar from './pages/Explorar';
import Chats from './pages/Chats'; 
import Publicar from './pages/Publicar'; // <-- Importamos la pantalla de Anfitrión

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/publicar" element={<Publicar />} /> {/* <-- Nueva ruta */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;