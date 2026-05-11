const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importamos nuestras rutas
const usuariosRoutes = require('./src/routes/usuarios.routes');
const authRoutes = require('./src/routes/auth.routes');
const alojamientosRoutes = require('./src/routes/alojamientos.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');
// --- LO NUEVO: Importamos las rutas de Favoritos ---
const favoritosRoutes = require('./src/routes/favoritos.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Definición de Endpoints
// Gestión de usuarios y perfiles
app.use('/api/usuarios', usuariosRoutes);

// Autenticación (Login y Registro)
app.use('/api/auth', authRoutes);

// Gestión de publicaciones de alojamientos
app.use('/api/alojamientos', alojamientosRoutes);

// Gestión de solicitudes entre roomies
app.use('/api/solicitudes', solicitudesRoutes);

// --- LO NUEVO: Conectamos el endpoint de Favoritos ---
app.use('/api/favoritos', favoritosRoutes);


// Ruta de bienvenida opcional
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de Roomeet!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Roomeet corriendo en http://localhost:${PORT}`);
});