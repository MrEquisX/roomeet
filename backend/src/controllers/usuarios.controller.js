const pool = require('../../database');

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

        conn = await pool.getConnection();

        const query = `
            INSERT INTO Usuarios 
            (nombre_completo, email, password, telefono, foto_perfil, fecha_nacimiento, sexo_biologico, identidad_genero, universidad, carrera, anio_ingreso, biografia, rol) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await conn.query(query, [
            nombre_completo, email, password, telefono, foto_perfil, 
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

module.exports = {
    obtenerUsuarios,
    crearUsuario
};