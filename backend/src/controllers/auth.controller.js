const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Importamos nuestro nuevo modelo

const registrarUsuario = async (req, res) => {
    const { 
        nombre, 
        email, 
        password, 
        perfil_academico, 
        preferencias_convivencia, 
        intereses 
    } = req.body;

    // Validación de campos obligatorios básicos
    if (!nombre || !email || !password || !perfil_academico || !preferencias_convivencia) {
        return res.status(400).json({ mensaje: 'Error: Todos los campos son obligatorios (nombre, email, password, perfil_academico, preferencias_convivencia).' });
    }

    // Validar que nivel_orden exista dentro de preferencias_convivencia
    if (
        !Object.prototype.hasOwnProperty.call(preferencias_convivencia, "nivel_orden") ||
        preferencias_convivencia.nivel_orden === undefined ||
        preferencias_convivencia.nivel_orden === null
    ) {
        return res.status(400).json({ mensaje: "Error: El campo 'nivel_orden' en preferencias_convivencia es obligatorio." });
    }

    try {
        // Buscar usuario existente
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ mensaje: 'Error: El correo ingresado ya está registrado.' });
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        // Crear y guardar la instancia del usuario
        const nuevoUsuario = new Usuario({
            nombre_completo: nombre,
            email,
            password: passwordHasheada,
            perfil_academico,
            preferencias_convivencia,
            intereses
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente.',
            idNuevoUsuario: nuevoUsuario._id
        });

    } catch (error) {
        // Error de validación de Mongoose
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: "Error de validación (campos incompletos o inválidos)", detalles: error.message });
        }
        // Error de duplicado de clave única (correo)
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'Error: El correo ingresado ya está registrado.' });
        }
        console.error('Error en el registro:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Incluimos explícitamente la contraseña en la búsqueda
        const usuario = await Usuario.findOne({ email }).select('+password');
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Error: Usuario no encontrado.' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Error: Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({ mensaje: '¡Inicio de sesión exitoso!', token });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

module.exports = { registrarUsuario, loginUsuario };