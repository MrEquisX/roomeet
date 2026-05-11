const db = require('../db/connection');

const agregarFavorito = async (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const id_alojamiento = req.body.id_alojamiento;

    if (!id_alojamiento) {
        return res.status(400).json({ mensaje: 'ID de alojamiento obligatorio.' });
    }

    try {
        const query = 'INSERT INTO Favoritos (id_usuario, id_alojamiento) VALUES (?, ?)';
        await db.query(query, [id_usuario, id_alojamiento]);

        return res.status(201).json({
            exito: true,
            mensaje: 'Alojamiento guardado en favoritos.'
        });
    } catch (error) {
        // El error 1062 es por el UNIQUE (ya es favorito)
        if (error.errno === 1062) {
            return res.status(409).json({ mensaje: 'Este alojamiento ya está en tus favoritos.' });
        }
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al agregar a favoritos.' });
    }
};

const obtenerMisFavoritos = async (req, res) => {
    const id_usuario = req.usuario.id_usuario;

    try {
        const query = `
            SELECT a.* FROM Alojamientos a
            INNER JOIN Favoritos f ON a.id_alojamiento = f.id_alojamiento
            WHERE f.id_usuario = ?
        `;
        const [favoritos] = await db.query(query, [id_usuario]);

        return res.status(200).json({
            exito: true,
            data: favoritos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener favoritos.' });
    }
};

const eliminarFavorito = async (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const id_alojamiento = req.params.id;

    try {
        const query = 'DELETE FROM Favoritos WHERE id_usuario = ? AND id_alojamiento = ?';
        const [result] = await db.query(query, [id_usuario, id_alojamiento]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'El favorito no existe.' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: 'Eliminado de favoritos correctamente.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al eliminar favorito.' });
    }
};

module.exports = {
    agregarFavorito,
    obtenerMisFavoritos,
    eliminarFavorito
};