const pool = require('../../database');
const bcrypt = require('bcrypt');

// --- FUNCIÓN PARA OBTENER (GET) ---
const obtenerUsuarios = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Traemos todos los datos de la tabla Usuarios
        const rows = await conn.query("SELECT * FROM Usuarios");
        
        res.status(200).json({
            exito: true,
            mensaje: "Usuarios obtenidos correctamente",
            data: rows
        });
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    } finally {
        if (conn) conn.release();
    }
};

// --- FUNCIÓN PARA CREAR (POST) ---
const crearUsuario = async (req, res) => {
    let conn;
    try {
        const { 
            nombre_completo, email, password, telefono, foto_perfil, 
            fecha_nacimiento, sexo_biologico, identidad_genero, 
            universidad, carrera, anio_ingreso, biografia, rol 
        } = req.body;
        
        const saltRounds = 10;
        const passwordEncriptada = await bcrypt.hash(password, saltRounds);

        conn = await pool.getConnection();

        const query = `
            INSERT INTO Usuarios 
            (nombre_completo, email, password, telefono, foto_perfil, fecha_nacimiento, sexo_biologico, identidad_genero, universidad, carrera, anio_ingreso, biografia, rol) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await conn.query(query, [
            nombre_completo, email, passwordEncriptada, telefono, foto_perfil, 
            fecha_nacimiento, sexo_biologico, identidad_genero, 
            universidad, carrera, anio_ingreso, biografia, rol
        ]);

        res.status(201).json({
            exito: true,
            mensaje: "¡Usuario registrado con éxito con perfil completo!",
            usuarioId: result.insertId.toString()
        });

    } catch (err) {
        console.error("Error al crear usuario:", err);
        res.status(500).json({ error: "No se pudo registrar al usuario" });
    } finally {
        if (conn) conn.release();
    }
};

// --- FUNCIÓN PARA ACTUALIZAR PERFIL (PUT) ---
const actualizarPerfil = async (req, res) => {
    let conn;
    try {
        // 1. Capturamos el ID que viene en la URL (ej: /api/usuarios/1)
        const { id } = req.params; 
        
        // 2. Capturamos los datos nuevos que vienen en el Body desde Postman/Frontend
        const { telefono, foto_perfil, universidad, carrera, biografia, rol } = req.body;

        conn = await pool.getConnection();

        // 3. Preparamos nuestra consulta UPDATE de SQL
        const query = `
            UPDATE Usuarios 
            SET telefono = ?, foto_perfil = ?, universidad = ?, carrera = ?, biografia = ?, rol = ?
            WHERE id_usuario = ?
        `;
        
        // 4. Ejecutamos pasando los datos, IMPORTANTE: el 'id' siempre va al final porque es el último '?'
        const result = await conn.query(query, [
            telefono, foto_perfil, universidad, carrera, biografia, rol, id
        ]);

        // Si affectedRows es 0, significa que el ID no existe en la base de datos
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({
            exito: true,
            mensaje: "¡Perfil actualizado correctamente en Roomeet!"
        });

    } catch (err) {
        console.error("Error al actualizar perfil:", err);
        res.status(500).json({ error: "Hubo un problema al actualizar el perfil" });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarPerfil
};