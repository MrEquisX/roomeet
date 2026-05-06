const db = require('../db/connection'); // Asegúrate de que esta ruta coincida con tu estructura

const crearAlojamiento = async (req, res) => {
    // Extraemos el ID directamente del token (el middleware verificarToken lo puso aquí)
    const id_anfitrion = req.usuario.id_usuario; 

    // Declaración explícita de los datos del formulario
    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion;
    const direccion = req.body.direccion;
    const precio_mensual = req.body.precio_mensual;
    const capacidad_total = req.body.capacidad_total;
    const cupos_disponibles = req.body.cupos_disponibles;

    // Validación de campos obligatorios
    if (!titulo) {
        return res.status(400).json({ mensaje: 'Error: El título es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'Error: La dirección es obligatoria.' });
    }
    if (!precio_mensual) {
        return res.status(400).json({ mensaje: 'Error: El precio es obligatorio.' });
    }

    try {
        const queryInsertar = `
            INSERT INTO Alojamientos 
            (id_anfitrion, titulo, descripcion, direccion, precio_mensual, capacidad_total, cupos_disponibles) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            id_anfitrion, 
            titulo, 
            descripcion, 
            direccion, 
            precio_mensual, 
            capacidad_total, 
            cupos_disponibles
        ];

        const [resultado] = await db.query(queryInsertar, valores);

        return res.status(201).json({
            exito: true,
            mensaje: '¡Alojamiento publicado exitosamente en Roomeet!',
            id_alojamiento: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear alojamiento:', error);
        return res.status(500).json({ 
            mensaje: 'Error interno del servidor al publicar el alojamiento.' 
        });
    }
};

const obtenerAlojamientos = async (req, res) => {
    try {
        // Aquí podríamos hacer un JOIN para traer el nombre del anfitrión también
        const queryBuscar = 'SELECT * FROM Alojamientos ORDER BY fecha_creacion DESC';
        const [alojamientos] = await db.query(queryBuscar);

        return res.status(200).json({
            exito: true,
            data: alojamientos
        });

    } catch (error) {
        console.error('Error al obtener alojamientos:', error);
        return res.status(500).json({ 
            mensaje: 'Error al consultar los alojamientos disponibles.' 
        });
    }
};

module.exports = {
    crearAlojamiento,
    obtenerAlojamientos
};