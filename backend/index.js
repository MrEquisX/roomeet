const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa http de Node y Server de socket.io
const http = require('http');
const { Server } = require('socket.io');

// Importamos la función de conexión a MongoDB
const { connectDB } = require('./database');

// 1. Importamos todas nuestras rutas de la carpeta src/routes
const usuariosRoutes = require('./src/routes/usuarios.routes');
const authRoutes = require('./src/routes/auth.routes');
const alojamientosRoutes = require('./src/routes/alojamientos.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');
const favoritosRoutes = require('./src/routes/favoritos.routes');

const app = express();

// Configuración de CORS
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

// Conectamos el endpoint de Favoritos
app.use('/api/favoritos', favoritosRoutes);

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

        // 2. Crea un servidor HTTP envolviendo la app de Express
        const server = http.createServer(app);

        // 3. Inicializa Socket.io pasando el server
        const io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        // 4. Bloque de conexión y eventos de chat
        io.on('connection', (socket) => {
            // Unirse a una sala específica de chat
            socket.on('joinChat', (chatId) => {
                socket.join(chatId);
            });

            // Recibe un mensaje y lo retransmite SOLO a la sala correspondiente
            socket.on('enviarMensaje', (data) => {
                // data debe tener: { chatId, mensaje }
                if (data && data.chatId && data.mensaje) {
                    // Retraenmitir a todos los usuarios en esa sala MENOS al que lo envió
                    socket.to(data.chatId).emit('mensajeNuevo', data.mensaje);
                }
            });
        });

        // 5. Cambia de app.listen a server.listen
        server.listen(PORT, () => {
            console.log(`🚀 Servidor de Roomeet corriendo en http://localhost:${PORT}`);
            console.log(`🪢 Socket.io corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`❌ Error crítico al iniciar el ecosistema del backend: ${error.message}`);
        process.exit(1);
    }
};

// Ejecutamos el arranque seguro
startServer();