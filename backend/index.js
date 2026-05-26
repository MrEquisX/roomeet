const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la función de conexión a MongoDB
const { connectDB } = require('./database');

// 1. Importamos nuestras rutas
//const usuariosRoutes = require('./src/routes/usuarios.routes');
const authRoutes = require('./src/routes/auth.routes');
//const alojamientosRoutes = require('./src/routes/alojamientos.routes');
//const solicitudesRoutes = require('./src/routes/solicitudes.routes');
//const favoritosRoutes = require('./src/routes/favoritos.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Definición de Endpoints
// Gestión de usuarios y perfiles
//app.use('/api/usuarios', usuariosRoutes);

// Autenticación (Login y Registro)
app.use('/api/auth', authRoutes);

// Gestión de publicaciones de alojamientos
//app.use('/api/alojamientos', alojamientosRoutes);

// Gestión de solicitudes entre roomies
//app.use('/api/solicitudes', solicitudesRoutes);

// Conectamos el endpoint de Favoritos
//app.use('/api/favoritos', favoritosRoutes);

// Ruta de bienvenida opcional
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de Roomeet!');
});

// Función asíncrona para inicializar la BD y arrancar el servidor de forma segura
const startServer = async () => {
    try {
        // Esperamos a que la conexión a MongoDB sea exitosa
        await connectDB();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor de Roomeet corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`❌ Error crítico al iniciar el ecosistema del backend: ${error.message}`);
        process.exit(1);
    }
};

// Ejecutamos el arranque seguro
startServer();