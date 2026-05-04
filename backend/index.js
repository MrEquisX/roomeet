const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importamos nuestras rutas
const usuariosRoutes = require('./src/routes/usuarios.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Le decimos a Express que use nuestras rutas
// Todo lo que empiece con '/api/usuarios' se va a ir a usuarios.routes.js
app.use('/api/usuarios', usuariosRoutes);

// Ruta de bienvenida opcional
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de Roomeet!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Roomeet corriendo en http://localhost:${PORT}`);
});