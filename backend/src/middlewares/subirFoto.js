const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Garantiza que la carpeta exista antes de que Multer intente escribir en ella
const garantizarCarpeta = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.fieldname === 'foto_perfil'
            ? 'uploads/perfiles/'
            : 'uploads/alojamientos/';
        garantizarCarpeta(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Creamos un nombre único: idUsuario-fecha-nombreOriginal
        const idUsuario = req.usuario?.id ?? 'anonimo';
        const nombreUnico = idUsuario + '-' + Date.now() + path.extname(file.originalname);
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