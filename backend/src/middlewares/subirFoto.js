const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Decidimos la carpeta según el tipo de imagen
        if (file.fieldname === "foto_perfil") {
            cb(null, 'uploads/perfiles/');
        } else {
            cb(null, 'uploads/alojamientos/');
        }
    },
    filename: (req, file, cb) => {
        // Creamos un nombre único: idUsuario-fecha-nombreOriginal
        const id_usuario = req.usuario.id_usuario;
        const nombreUnico = id_usuario + '-' + Date.now() + path.extname(file.originalname);
        cb(null, nombreUnico);
    }
});

// Filtro para aceptar solo imágenes
const filtroImagen = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extension = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeType = tiposPermitidos.test(file.mimetype);

    if (extension && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: filtroImagen,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

module.exports = upload;