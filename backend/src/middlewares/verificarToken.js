const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Declaración explícita de la cabecera
    const cabeceraAuth = req.headers['authorization'];

    if (!cabeceraAuth) {
        return res.status(403).json({
            mensaje: 'Error: No se proporcionó un token de acceso.'
        });
    }

    // El token suele venir con la palabra "Bearer " adelante. Lo separamos.
    const token = cabeceraAuth.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            mensaje: 'Error: Formato de token inválido.'
        });
    }

    try {
        // Obtenemos la llave desde el archivo .env (y dejamos un fallback de emergencia)
        const firmaSecreta = process.env.JWT_SECRET || 'llave_super_secreta_123';
        
        const usuarioDecodificado = jwt.verify(token, firmaSecreta);

        // Si el token es válido, guardamos los datos del usuario en la petición
        req.usuario = usuarioDecodificado;

        // Le decimos a Express que deje pasar al usuario a la ruta solicitada
        next();

    } catch (error) {
        return res.status(401).json({
            mensaje: 'Error: Token inválido o ha expirado.'
        });
    }
};

module.exports = { verificarToken };