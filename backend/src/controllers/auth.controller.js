const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Agregamos JWT
const db = require('../db/connection'); 

const registrarUsuario = async (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = req.body.password;

    if (!nombre || !email || !password) {
        return res.status(400).json({ 
            mensaje: 'Error: Todos los campos son obligatorios.' 
        });
    }

    try {
        const queryVerificar = 'SELECT * FROM Usuarios WHERE email = ?';
        const [usuariosExistentes] = await db.query(queryVerificar, [email]);

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({ 
                mensaje: 'Error: El correo ingresado ya está registrado.' 
            });
        }

        const saltRounds = 10;
        const passwordHasheada = await bcrypt.hash(password, saltRounds);

        const queryInsertar = 'INSERT INTO Usuarios (nombre_completo, email, password) VALUES (?, ?, ?)';
        const valores = [nombre, email, passwordHasheada];
        
        const [resultado] = await db.query(queryInsertar, valores);

        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente.',
            idNuevoUsuario: resultado.insertId
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({ 
            mensaje: 'Error interno del servidor al intentar registrar el usuario.' 
        });
    }
};

const loginUsuario = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Validación de que vengan los datos
    if (!email || !password) {
        return res.status(400).json({
            mensaje: 'Error: El correo y la contraseña son obligatorios para ingresar.'
        });
    }

    try {
        // 1. Buscamos si el correo existe
        const queryBuscar = 'SELECT * FROM Usuarios WHERE email = ?';
        const [usuarios] = await db.query(queryBuscar, [email]);

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensaje: 'Error: Usuario no encontrado.'
            });
        }

        // Asignamos el usuario encontrado a una variable explícita
        const usuarioEncontrado = usuarios[0];

        // 2. Comparamos la contraseña plana con la encriptada
        const passwordValida = await bcrypt.compare(password, usuarioEncontrado.password);

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: 'Error: Contraseña incorrecta.'
            });
        }

        // 3. Generamos el "Carnet Virtual" (JWT)
        const payload = {
            id_usuario: usuarioEncontrado.id_usuario,
            rol: usuarioEncontrado.rol
        };
        
        // En un entorno de producción, esto iría en un archivo .env
        const firmaSecreta = 'llave_super_secreta_123'; 
        const token = jwt.sign(payload, firmaSecreta, { expiresIn: '2h' });

        return res.status(200).json({
            mensaje: '¡Inicio de sesión exitoso!',
            token: token
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor al intentar iniciar sesión.'
        });
    }
};

module.exports = { 
    registrarUsuario,
    loginUsuario // No olvides exportarla
};