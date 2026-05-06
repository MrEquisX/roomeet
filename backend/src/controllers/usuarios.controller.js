const pool = require('../../database');

// --- FUNCIÓN PARA OBTENER (GET) ---
const obtenerUsuarios = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM Usuarios");
        
        return res.status(200).json({
            exito: true,
            mensaje: "Usuarios obtenidos correctamente",
            data: rows
        });
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        return res.status(500).json({ error: "Error al consultar la base de datos" });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// --- FUNCIÓN PARA ACTUALIZAR PERFIL (PUT) ---
const actualizarPerfil = async (req, res) => {
    let conn;
    try {
        // Declaración explícita de variables entrantes
        const id = req.params.id;
        const telefono = req.body.telefono;
        const foto_perfil = req.body.foto_perfil;
        const universidad = req.body.universidad;
        const carrera = req.body.carrera;
        const biografia = req.body.biografia;
        const rol = req.body.rol;

        conn = await pool.getConnection();

        const query = `
            UPDATE Usuarios 
            SET telefono = ?, foto_perfil = ?, universidad = ?, carrera = ?, biografia = ?, rol = ?
            WHERE id_usuario = ?
        `;
        
        const result = await conn.query(query, [
            telefono, foto_perfil, universidad, carrera, biografia, rol, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.status(200).json({
            exito: true,
            mensaje: "¡Perfil actualizado correctamente en Roomeet!"
        });

    } catch (err) {
        console.error("Error al actualizar perfil:", err);
        return res.status(500).json({ error: "Hubo un problema al actualizar el perfil" });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Exportamos solo las dos funciones que quedaron
module.exports = {
    obtenerUsuarios,
    actualizarPerfil
};