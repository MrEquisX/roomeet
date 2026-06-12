const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const path    = require('path');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('❌ SEGURIDAD: JWT_SECRET no está definido en .env. El servidor no puede arrancar de forma insegura.');
    process.exit(1);
}

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
const matchesRoutes   = require('./src/routes/matches.routes');
const chatsRoutes     = require('./src/routes/chats.routes');

const corsOptions = {
    origin: [
        'https://roomeet-owsw.vercel.app',
        'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

console.log('[CORS] Orígenes autorizados:', corsOptions.origin.join(', '));

app.use(cors(corsOptions));
app.use(express.json());

// Servir imágenes subidas: GET /uploads/perfiles/... o /uploads/alojamientos/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Matches (aceptar perfil → chat) y conversaciones
app.use('/api/matches', matchesRoutes);
app.use('/api/chats', chatsRoutes);

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

        // 3. Inicializa Socket.io con las mismas opciones CORS que Express
        const io = new Server(server, {
            cors: corsOptions,
        });

        // 4. Middleware de autenticación: rechaza conexiones sin token válido
        io.use((socket, next) => {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error('Acceso denegado: se requiere un token de autenticación.'));
            }

            try {
                socket.usuario = jwt.verify(token, process.env.JWT_SECRET);
                next();
            } catch (err) {
                next(new Error('Token inválido o expirado.'));
            }
        });

        // 5. Bloque de conexión y eventos de chat
        io.on('connection', (socket) => {
            socket.on('joinChat', (chatId) => {
                socket.join(chatId);
            });

            socket.on('enviarMensaje', (data) => {
                if (data && data.chatId && data.mensaje) {
                    socket.to(data.chatId).emit('nuevoMensaje', data.mensaje);
                }
            });
        });

        // 6. Arranque del servidor HTTP + WebSockets
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
