const db = require('../db/connection'); 

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

    // Declaramos la variable para la foto
    let foto_alojamiento = null;

    // Si Multer interceptó un archivo de imagen, guardamos la ruta
    if (req.file) {
        foto_alojamiento = '/uploads/alojamientos/' + req.file.filename;
    }

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
            (id_anfitrion, titulo, descripcion, direccion, precio_mensual, capacidad_total, cupos_disponibles, foto_alojamiento) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            id_anfitrion, 
            titulo, 
            descripcion, 
            direccion, 
            precio_mensual, 
            capacidad_total, 
            cupos_disponibles,
            foto_alojamiento // Agregamos la foto a los valores a insertar
        ];

        const [resultado] = await db.query(queryInsertar, valores);

        return res.status(201).json({
            exito: true,
            mensaje: '¡Alojamiento publicado exitosamente en Roomeet!',
            id_alojamiento: resultado.insertId,
            urlImagen: foto_alojamiento
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
        // 1. Declaración explícita de filtros que vienen por la URL (Query Params)
        const precioMax = req.query.precioMax;
        const busqueda = req.query.busqueda;

        // 2. Base de la consulta SQL
        let querySql = "SELECT * FROM Alojamientos WHERE 1=1";
        let parametros = [];

        // 3. Si el usuario envía un precio máximo, lo agregamos al filtro
        if (precioMax) {
            querySql += " AND precio_mensual <= ?";
            parametros.push(Number(precioMax));
        }

        // 4. Si el usuario escribe algo en el buscador (título o dirección)
        if (busqueda) {
            querySql += " AND (titulo LIKE ? OR direccion LIKE ?)";
            const terminoBusqueda = `%${busqueda}%`;
            parametros.push(terminoBusqueda, terminoBusqueda);
        }

        // 5. Ordenamos por los más nuevos
        querySql += " ORDER BY fecha_creacion DESC";

        // Usamos db.query directamente como en la función de crear
        const [rows] = await db.query(querySql, parametros);

        return res.status(200).json({
            exito: true,
            cantidad: rows.length,
            data: rows
        });

    } catch (err) {
        console.error("Error al filtrar alojamientos:", err);
        return res.status(500).json({ error: "Error al consultar la base de datos" });
    }
};

module.exports = {
    crearAlojamiento,
    obtenerAlojamientos
};