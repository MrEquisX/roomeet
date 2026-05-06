const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importamos nuestras rutas
const usuariosRoutes = require('./src/routes/usuarios.routes');
// --- LO NUEVO: Importamos las rutas de Auth y Alojamientos ---
const authRoutes = require('./src/routes/auth.routes');
const alojamientosRoutes = require('./src/routes/alojamientos.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');
const app = express();

app.use(cors());
app.use(express.json());

// 2. Le decimos a Express que use nuestras rutas
// Todo lo que empiece con '/api/usuarios' se va a ir a usuarios.routes.js
app.use('/api/usuarios', usuariosRoutes);

// --- LO NUEVO: Conectamos los endpoints ---
// Todo lo que empiece con '/api/auth' (ej. /api/auth/login) se va a auth.routes.js
app.use('/api/auth', authRoutes);

// Todo lo que empiece con '/api/alojamientos' se va a alojamientos.routes.js
app.use('/api/alojamientos', alojamientosRoutes);

app.use('/api/solicitudes', solicitudesRoutes);

// Ruta de bienvenida opcional
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de Roomeet!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Roomeet corriendo en http://localhost:${PORT}`);
});