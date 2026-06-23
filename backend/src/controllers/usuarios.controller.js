const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const Alojamiento = require('../models/Alojamiento');
const {
    filtrarPorUmbralConContingencia,
    consultarCandidatosEmparejamiento,
    obtenerFallbackEmergencia,
    obtenerIdsExcluidosDelSwipe,
} = require('./matches.controller');

const obtenerIdDesdeToken = (req) => {
    if (req.usuario && req.usuario.id) {
        return req.usuario.id;
    }
    if (req.usuario && req.usuario.id_usuario) {
        return req.usuario.id_usuario;
    }
    return null;
};

const normalizarFumaRespuesta = (valor) => {
    if (valor === true) {
        return 'Sí';
    }
    if (valor === false) {
        return 'No';
    }
    if (valor === 'Ocasional') {
        return 'Ocasionalmente';
    }
    if (valor === 'Sí' || valor === 'No' || valor === 'Ocasionalmente') {
        return valor;
    }
    return 'No';
};

const normalizarBebeRespuesta = (valor) => {
    if (valor === 'Nunca') {
        return 'No';
    }
    if (valor === 'Socialmente' || valor === 'Frecuente') {
        return 'Ocasionalmente';
    }
    if (valor === 'Sí' || valor === 'No' || valor === 'Ocasionalmente') {
        return valor;
    }
    return 'No';
};

const normalizarMascotasRespuesta = (valor) => {
    if (valor === true) {
        return 'Sí';
    }
    if (valor === false) {
        return 'No';
    }
    if (valor === 'Sí' || valor === 'No') {
        return valor;
    }
    return 'No';
};

// --- FUNCIÓN PARA OBTENER (GET) ---
const obtenerUsuarios = async (req, res) => {
    try {
        const miId = obtenerIdDesdeToken(req);

        const queryFiltros = {};

        if (miId) {
            if (mongoose.Types.ObjectId.isValid(miId)) {
                queryFiltros._id = { $ne: new mongoose.Types.ObjectId(String(miId)) };
            }
        }

        const usuarios = await Usuario.find(queryFiltros)
            .select('-password')
            .lean();

        return res.status(200).json({
            exito: true,
            mensaje: 'Usuarios obtenidos correctamente',
            data: usuarios,
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
};

// --- FUNCIÓN PARA ACTUALIZAR PERFIL (PUT) ---
const actualizarPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const { telefono, universidad, carrera, biografia, rol } = req.body;

        // Bloquear IDOR: el usuario del token debe ser el dueño del perfil
        const tokenUserId = obtenerIdDesdeToken(req);
        if (!tokenUserId || tokenUserId.toString() !== id.toString()) {
            return res.status(403).json({ error: 'Prohibido: no tienes permiso para modificar este perfil.' });
        }

        let foto_perfil = req.body.foto_perfil;
        if (req.file) {
            foto_perfil = '/uploads/perfiles/' + req.file.filename;
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const actualizacion = {};

        if (universidad !== undefined || carrera !== undefined) {
            actualizacion.perfil_academico = {};
            if (universidad !== undefined) {
                actualizacion.perfil_academico.universidad = universidad;
            }
            if (carrera !== undefined) {
                actualizacion.perfil_academico.carrera = carrera;
            }
        }

        if (rol !== undefined) {
            actualizacion.rol = rol;
        }

        // Descomenta cuando agregues estos campos al schema Usuario:
        // if (telefono !== undefined) actualizacion.telefono = telefono;
        // if (biografia !== undefined) actualizacion.biografia = biografia;
        // if (foto_perfil !== undefined) actualizacion.foto_perfil = foto_perfil;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { $set: actualizacion },
            { new: true, runValidators: true }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: '¡Perfil actualizado correctamente en Roomeet!',
            urlImagen: foto_perfil,
            data: usuarioActualizado,
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos de perfil inválidos',
                detalles: Object.values(err.errors).map((e) => e.message),
            });
        }
        console.error('Error al actualizar perfil:', err);
        return res.status(500).json({ error: 'Hubo un problema al actualizar el perfil' });
    }
};

// --- FUNCIÓN PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO (GET /mi-perfil) ---
const obtenerMiPerfil = async (req, res) => {
    try {
        const id = obtenerIdDesdeToken(req);

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(401).json({ mensaje: 'Token inválido o sin ID de usuario.' });
        }

        const usuario = await Usuario.findById(id).select('-password').lean();

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Separar nombre_completo en nombre y apellido
        const partes = (usuario.nombre_completo || '').trim().split(' ');
        const nombre = partes[0] || '';
        const apellido = partes.slice(1).join(' ');

        const conv = usuario.preferencias_convivencia || {};

        const perfilNormalizado = {
            _id: usuario._id,
            nombre,
            apellido,
            email: usuario.email,
            universidad: usuario.perfil_academico?.universidad || '',
            carrera: usuario.perfil_academico?.carrera || '',
            sede: usuario.perfil_academico?.sede || '',
            anio_ingreso: usuario.perfil_academico?.anio_ingreso || null,
            fecha_nacimiento: usuario.fecha_nacimiento || null,
            sexo_biologico: usuario.sexo_biologico || '',
            identidad_genero: usuario.identidad_genero || '',
            telefono: usuario.telefono || '',
            bio: usuario.bio || '',
            fotoPerfilUrl: usuario.foto_perfil || '',
            rol: usuario.rol,
            alojamientoId: usuario.alojamientoId || null,
            preferencias: {
                fuma: normalizarFumaRespuesta(conv.fuma),
                mascotas: normalizarMascotasRespuesta(conv.mascotas),
                orden: conv.nivel_orden ?? 0,
                ruido: conv.nivel_ruido ?? 0,
                bebeAlcohol: normalizarBebeRespuesta(conv.bebe_alcohol),
                horarioPreferido: conv.horario_preferido || 'Indiferente',
            },
            filtros: usuario.filtros || {},
            intereses: usuario.intereses || [],
            // Coordenadas del campus — necesarias para el cálculo de distancia en el frontend
            ubicacion_sede: {
                latitud:   usuario.ubicacion_sede?.latitud   ?? null,
                longitud:  usuario.ubicacion_sede?.longitud  ?? null,
                direccion: usuario.ubicacion_sede?.direccion ?? '',
            },
        };

        return res.status(200).json(perfilNormalizado);
    } catch (err) {
        console.error('Error al obtener mi perfil:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// --- FUNCIÓN PARA EDITAR EL PERFIL DEL USUARIO AUTENTICADO (PUT /editar) ---
const editarMiPerfil = async (req, res) => {
    try {
        const id = obtenerIdDesdeToken(req);
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(401).json({ mensaje: 'Token inválido.' });
        }

        const {
            nombre, biografia, telefono,
            fecha_nacimiento, sexo_biologico, identidad_genero, rol,
            fuma, mascotas, bebeAlcohol,
            nivelOrden, nivelRuido,
            horarioPreferido, soloMismaUniversidad, soloMismaCarrera, generoPreferido,
            universidad, carrera, sede, anio_ingreso,
            ubicacion_sede,
        } = req.body;

        const parseBool = (v) => {
            return v === 'true' || v === true;
        };

        const actualizacion = {};

        if (nombre !== undefined) {
            actualizacion.nombre_completo = nombre;
        }
        if (biografia !== undefined) {
            actualizacion.bio = biografia;
        }
        if (telefono !== undefined) {
            actualizacion.telefono = telefono;
        }
        if (fecha_nacimiento !== undefined && fecha_nacimiento !== '') {
            actualizacion.fecha_nacimiento = fecha_nacimiento;
        }
        if (sexo_biologico !== undefined) {
            actualizacion.sexo_biologico = sexo_biologico;
        }
        if (identidad_genero !== undefined) {
            actualizacion.identidad_genero = identidad_genero;
        }
        if (rol !== undefined) {
            actualizacion.rol = rol;
        }

        // ubicacion_sede — latitud, longitud y dirección del campus del usuario
        let ubicacionParsed = ubicacion_sede;
        if (typeof ubicacion_sede === 'string') {
            try {
                ubicacionParsed = JSON.parse(ubicacion_sede);
            } catch {
                ubicacionParsed = null;
            }
        }
        if (ubicacionParsed && typeof ubicacionParsed === 'object') {
            if (ubicacionParsed.latitud !== undefined && ubicacionParsed.latitud !== null) {
                actualizacion['ubicacion_sede.latitud'] = Number(ubicacionParsed.latitud);
            }
            if (ubicacionParsed.longitud !== undefined && ubicacionParsed.longitud !== null) {
                actualizacion['ubicacion_sede.longitud'] = Number(ubicacionParsed.longitud);
            }
            if (ubicacionParsed.direccion !== undefined) {
                actualizacion['ubicacion_sede.direccion'] = ubicacionParsed.direccion;
            }
        }

        if (universidad !== undefined) actualizacion['perfil_academico.universidad'] = universidad;
        if (carrera     !== undefined) actualizacion['perfil_academico.carrera']     = carrera;
        if (sede        !== undefined) actualizacion['perfil_academico.sede']         = sede;
        if (anio_ingreso !== undefined && anio_ingreso !== '') {
            actualizacion['perfil_academico.anio_ingreso'] = Number(anio_ingreso);
        }

        // Mapear al esquema de MongoDB usando notación de punto para subdocumentos
        const convMap = {
            fuma:              fuma             !== undefined ? fuma             : undefined,
            mascotas:          mascotas         !== undefined ? mascotas         : undefined,
            nivel_orden:       nivelOrden       !== undefined ? Number(nivelOrden) : undefined,
            nivel_ruido:       nivelRuido       !== undefined ? Number(nivelRuido) : undefined,
            bebe_alcohol:      bebeAlcohol      !== undefined ? bebeAlcohol      : undefined,
            horario_preferido: horarioPreferido !== undefined ? horarioPreferido : undefined,
        };
        for (const [k, v] of Object.entries(convMap)) {
            if (v !== undefined) actualizacion[`preferencias_convivencia.${k}`] = v;
        }

        const filtrosMap = {
            soloMismaUniversidad: soloMismaUniversidad !== undefined ? parseBool(soloMismaUniversidad) : undefined,
            soloMismaCarrera:     soloMismaCarrera     !== undefined ? parseBool(soloMismaCarrera)     : undefined,
            generoPreferido:      generoPreferido      !== undefined ? generoPreferido                 : undefined,
        };
        for (const [k, v] of Object.entries(filtrosMap)) {
            if (v !== undefined) actualizacion[`filtros.${k}`] = v;
        }

        // Intereses: acepta JSON (array) o FormData (campo[] repetido)
        let rawIntereses =
            req.body.interesesSeleccionados ??
            req.body['interesesSeleccionados[]'];
        if (typeof rawIntereses === 'string') {
            try {
                rawIntereses = JSON.parse(rawIntereses);
            } catch {
                // mantener como string único
            }
        }
        if (rawIntereses !== undefined) {
            actualizacion.intereses = [].concat(rawIntereses);
        }

        // Foto de perfil subida por Multer
        if (req.file) {
            actualizacion.foto_perfil = '/uploads/perfiles/' + req.file.filename;
        }

        if (Object.keys(actualizacion).length === 0) {
            return res.status(400).json({ mensaje: 'No se enviaron campos para actualizar.' });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { $set: actualizacion },
            { new: true, runValidators: false }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        return res.status(200).json({
            exito: true,
            mensaje: '¡Perfil actualizado correctamente!',
            data: usuarioActualizado,
        });
    } catch (err) {
        console.error('══════ ERROR EXACTO editarMiPerfil ══════');
        console.error('Nombre:', err.name);
        console.error('Mensaje:', err.message);
        if (err.name === 'ValidationError') {
            console.error('Campos inválidos:', JSON.stringify(err.errors, null, 2));
        }
        console.error('Body recibido:', JSON.stringify(req.body));
        console.error('File recibido:', req.file ? req.file.originalname : 'ninguno');
        console.error('Stack:', err.stack);
        return res.status(500).json({ mensaje: 'Error interno al actualizar el perfil.' });
    }
};

// ─── MOTOR DE EMPAREJAMIENTO ───────────────────────────────────────────────────

/**
 * Extrae nombres de intereses desde documento MongoDB (string u objeto).
 */
function extraerInteresesDesdeUsuario(usuario) {
    const resultado = [];
    const crudos = usuario.intereses || [];

    for (const item of crudos) {
        if (typeof item === 'string') {
            resultado.push(item);
        } else if (item && item.nombre) {
            resultado.push(String(item.nombre));
        }
    }

    return resultado;
}

function calcularPuntosHabitoTernario(valorYo, valorCandidato) {
    let valorA = '';
    if (valorYo) {
        valorA = String(valorYo);
    }

    let valorB = '';
    if (valorCandidato) {
        valorB = String(valorCandidato);
    }

    if (valorA.length === 0 || valorB.length === 0) {
        return 0;
    }

    if (valorA === valorB) {
        return 7;
    }

    let esOpuesto = false;
    if (valorA === 'Sí' && valorB === 'No') {
        esOpuesto = true;
    }
    if (valorA === 'No' && valorB === 'Sí') {
        esOpuesto = true;
    }

    if (esOpuesto) {
        return 0;
    }

    if (valorA === 'Ocasionalmente' || valorB === 'Ocasionalmente') {
        return 3;
    }

    return 0;
}

function calcularPuntosPorDiferenciaEscala(diferencia) {
    if (diferencia === 0) {
        return 8;
    }

    if (diferencia === 1) {
        return 5;
    }

    if (diferencia === 2) {
        return 2;
    }

    return 0;
}

/**
 * Calcula la puntuación de compatibilidad suavizada entre dos usuarios (0–100).
 */
function calcularMatchScore(yo, candidato) {
    const miAcad = yo.perfil_academico || {};
    const suAcad = candidato.perfil_academico || {};
    const misPref = yo.preferencias_convivencia || {};
    const susPref = candidato.preferencias_convivencia || {};
    const misFiltros = yo.filtros || {};

    let miUniversidad = '';
    if (miAcad.universidad) {
        miUniversidad = String(miAcad.universidad).toLowerCase().trim();
    }

    let suUniversidad = '';
    if (suAcad.universidad) {
        suUniversidad = String(suAcad.universidad).toLowerCase().trim();
    }

    let miCarrera = '';
    if (miAcad.carrera) {
        miCarrera = String(miAcad.carrera).toLowerCase().trim();
    }

    let suCarrera = '';
    if (suAcad.carrera) {
        suCarrera = String(suAcad.carrera).toLowerCase().trim();
    }

    if (misFiltros.soloMismaUniversidad === true) {
        if (miUniversidad.length === 0 || suUniversidad.length === 0) {
            return 0;
        }
        if (miUniversidad !== suUniversidad) {
            return 0;
        }
    }

    if (misFiltros.soloMismaCarrera === true) {
        if (miCarrera.length === 0 || suCarrera.length === 0) {
            return 0;
        }
        if (miCarrera !== suCarrera) {
            return 0;
        }
    }

    let puntajeTotal = 20;
    let puntajeAcademico = 0;
    let puntajeHabitos = 0;
    let puntajeConvivencia = 0;
    let puntajeIntereses = 0;

    if (miUniversidad.length > 0 && suUniversidad.length > 0) {
        if (miUniversidad === suUniversidad) {
            puntajeAcademico = puntajeAcademico + 10;
        }
    }

    let miSede = '';
    if (miAcad.sede) {
        miSede = String(miAcad.sede).toLowerCase().trim();
    }

    let suSede = '';
    if (suAcad.sede) {
        suSede = String(suAcad.sede).toLowerCase().trim();
    }

    if (miSede.length > 0 && suSede.length > 0) {
        if (miSede === suSede) {
            puntajeAcademico = puntajeAcademico + 6;
        }
    }

    if (miCarrera.length > 0 && suCarrera.length > 0) {
        if (miCarrera === suCarrera) {
            puntajeAcademico = puntajeAcademico + 4;
        }
    }

    if (puntajeAcademico > 20) {
        puntajeAcademico = 20;
    }

    let puntosFuma = calcularPuntosHabitoTernario(misPref.fuma, susPref.fuma);
    puntajeHabitos = puntajeHabitos + puntosFuma;

    let puntosBebe = calcularPuntosHabitoTernario(misPref.bebe_alcohol, susPref.bebe_alcohol);
    puntajeHabitos = puntajeHabitos + puntosBebe;

    let puntosMascotas = 0;
    let miMascotas = '';
    if (misPref.mascotas) {
        miMascotas = String(misPref.mascotas);
    }

    let suMascotas = '';
    if (susPref.mascotas) {
        suMascotas = String(susPref.mascotas);
    }

    if (miMascotas.length > 0 && suMascotas.length > 0) {
        if (miMascotas === suMascotas) {
            puntosMascotas = 7;
        }
    }

    puntajeHabitos = puntajeHabitos + puntosMascotas;

    if (puntajeHabitos > 21) {
        puntajeHabitos = 21;
    }

    let miOrden = null;
    if (misPref.nivel_orden !== null && misPref.nivel_orden !== undefined) {
        miOrden = Number(misPref.nivel_orden);
    }

    let suOrden = null;
    if (susPref.nivel_orden !== null && susPref.nivel_orden !== undefined) {
        suOrden = Number(susPref.nivel_orden);
    }

    if (miOrden !== null && suOrden !== null) {
        const diferenciaOrden = Math.abs(miOrden - suOrden);
        const puntosOrden = calcularPuntosPorDiferenciaEscala(diferenciaOrden);
        puntajeConvivencia = puntajeConvivencia + puntosOrden;
    }

    let miRuido = null;
    if (misPref.nivel_ruido !== null && misPref.nivel_ruido !== undefined) {
        miRuido = Number(misPref.nivel_ruido);
    }

    let suRuido = null;
    if (susPref.nivel_ruido !== null && susPref.nivel_ruido !== undefined) {
        suRuido = Number(susPref.nivel_ruido);
    }

    if (miRuido !== null && suRuido !== null) {
        const diferenciaRuido = Math.abs(miRuido - suRuido);
        const puntosRuido = calcularPuntosPorDiferenciaEscala(diferenciaRuido);
        puntajeConvivencia = puntajeConvivencia + puntosRuido;
    }

    let miHorario = '';
    if (misPref.horario_preferido) {
        miHorario = String(misPref.horario_preferido);
    }

    let suHorario = '';
    if (susPref.horario_preferido) {
        suHorario = String(susPref.horario_preferido);
    }

    let horarioCompatible = false;

    if (miHorario.length > 0 && suHorario.length > 0) {
        if (miHorario === suHorario) {
            horarioCompatible = true;
        }
    }

    if (miHorario === 'Indiferente') {
        horarioCompatible = true;
    }

    if (suHorario === 'Indiferente') {
        horarioCompatible = true;
    }

    if (horarioCompatible) {
        puntajeConvivencia = puntajeConvivencia + 8;
    }

    if (puntajeConvivencia > 24) {
        puntajeConvivencia = 24;
    }

    const interesesYo = extraerInteresesDesdeUsuario(yo);
    const interesesSu = extraerInteresesDesdeUsuario(candidato);
    let cantidadCompartidos = 0;

    for (let i = 0; i < interesesYo.length; i++) {
        const interesActual = interesesYo[i];
        let encontrado = false;

        for (let j = 0; j < interesesSu.length; j++) {
            const otroInteres = interesesSu[j];

            if (interesActual === otroInteres) {
                encontrado = true;
                break;
            }
        }

        if (encontrado) {
            cantidadCompartidos = cantidadCompartidos + 1;
        }
    }

    puntajeIntereses = cantidadCompartidos * 5;

    if (puntajeIntereses > 15) {
        puntajeIntereses = 15;
    }

    puntajeTotal = puntajeTotal + puntajeAcademico;
    puntajeTotal = puntajeTotal + puntajeHabitos;
    puntajeTotal = puntajeTotal + puntajeConvivencia;
    puntajeTotal = puntajeTotal + puntajeIntereses;

    if (puntajeTotal > 100) {
        puntajeTotal = 100;
    }

    if (puntajeTotal < 0) {
        puntajeTotal = 0;
    }

    return Math.round(puntajeTotal);
}

// ─── ENDPOINT DE MATCHES (GET /api/usuarios/matches) ──────────────────────────

/**
 * Devuelve los perfiles compatibles con el usuario autenticado,
 * ordenados de mayor a menor porcentaje de afinidad (matchScore).
 *
 * Flujo:
 *   1. Obtener el perfil completo del usuario autenticado.
 *   2. Consultar todos los candidatos (con o sin vivienda, cualquier rol).
 *   3. Calcular matchScore suavizado para cada candidato.
 *   4. Ordenar y devolver el arreglo de resultados.
 */
const obtenerMatches = async (req, res) => {
    try {
        const miId = obtenerIdDesdeToken(req);

        if (!miId) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }

        if (!mongoose.Types.ObjectId.isValid(miId)) {
            return res.status(401).json({ mensaje: 'ID de usuario inválido en el token.' });
        }

        // ── 1. Perfil completo del usuario autenticado ────────────────────────
        const yo = await Usuario.findById(miId)
            .select('-password')
            .lean();

        if (!yo) {
            return res.status(404).json({ mensaje: 'Usuario autenticado no encontrado.' });
        }

        // ── 2. Consultar candidatos (sin filtrar por rol ni alojamiento) ──────

        // ── 3. Consultar candidatos ───────────────────────────────────────────
        const miObjectId = new mongoose.Types.ObjectId(String(miId));
        const idsExcluidos = await obtenerIdsExcluidosDelSwipe(miId);
        const candidatos = await consultarCandidatosEmparejamiento(yo, miObjectId);
        const candidatosFiltrados = candidatos.filter((candidato) => {
            return !idsExcluidos.has(String(candidato._id));
        });

        // ── 4. Cargar viviendas publicadas para calcular distancia en el frontend ──
        const idsAlojamientos = [];
        for (const candidato of candidatosFiltrados) {
            if (candidato.alojamientoId) {
                idsAlojamientos.push(candidato.alojamientoId);
            }
        }

        const mapaViviendas = {};
        if (idsAlojamientos.length > 0) {
            const viviendas = await Alojamiento.find({ _id: { $in: idsAlojamientos } })
                .select('_id latitud longitud titulo sector comuna')
                .lean();

            for (const vivienda of viviendas) {
                mapaViviendas[String(vivienda._id)] = vivienda;
            }
        }

        // ── 5. Calcular matchScore para cada candidato en memoria ──────────────
        const resultados = [];

        for (const candidato of candidatosFiltrados) {
            const idCandidato = String(candidato._id);

            if (idCandidato === String(miId)) {
                continue;
            }

            let puntuacion = 0;

            try {
                puntuacion = calcularMatchScore(yo, candidato);
            } catch (errCalculo) {
                console.error('Error al calcular matchScore para candidato:', idCandidato, errCalculo.message);
                puntuacion = 20;
            }

            let viviendaPublicada = null;

            if (candidato.alojamientoId) {
                const claveVivienda = String(candidato.alojamientoId);
                if (mapaViviendas[claveVivienda]) {
                    viviendaPublicada = mapaViviendas[claveVivienda];
                }
            }

            const usuarioEnriquecido = {
                ...candidato,
                vivienda: viviendaPublicada,
            };

            const entrada = {
                matchScore:         puntuacion,
                porcentajeAfinidad: puntuacion,
                compatibilidad:     `${puntuacion}%`,
                usuario:            usuarioEnriquecido,
            };

            resultados.push(entrada);
        }

        // ── 6. Ordenar de mayor a menor y aplicar umbral con plan de contingencia ─
        resultados.sort(function (a, b) {
            return b.matchScore - a.matchScore;
        });

        let resultadosFinales = filtrarPorUmbralConContingencia(resultados);

        if (resultadosFinales.length === 0) {
            resultadosFinales = await obtenerFallbackEmergencia(miObjectId, idsExcluidos);

            const idsAlojamientosRescate = [];
            for (const entradaRescate of resultadosFinales) {
                const usuarioRescate = entradaRescate.usuario;
                if (usuarioRescate && usuarioRescate.alojamientoId) {
                    idsAlojamientosRescate.push(usuarioRescate.alojamientoId);
                }
            }

            if (idsAlojamientosRescate.length > 0) {
                const viviendasRescate = await Alojamiento.find({
                    _id: { $in: idsAlojamientosRescate },
                })
                    .select('_id latitud longitud titulo sector comuna')
                    .lean();

                const mapaViviendasRescate = {};
                for (const viviendaRescate of viviendasRescate) {
                    mapaViviendasRescate[String(viviendaRescate._id)] = viviendaRescate;
                }

                for (let r = 0; r < resultadosFinales.length; r++) {
                    const entradaActual = resultadosFinales[r];
                    const candidatoRescate = entradaActual.usuario;

                    if (!candidatoRescate) {
                        continue;
                    }

                    if (!candidatoRescate.alojamientoId) {
                        continue;
                    }

                    const claveRescate = String(candidatoRescate.alojamientoId);
                    const viviendaRescate = mapaViviendasRescate[claveRescate] || null;

                    entradaActual.usuario = {
                        ...candidatoRescate,
                        vivienda: viviendaRescate,
                    };
                }
            }
        }

        return res.status(200).json({
            exito:   true,
            miRol:   yo.rol,
            total:   resultadosFinales.length,
            data:    resultadosFinales,
        });

    } catch (err) {
        console.error('Error en obtenerMatches:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// ─── PERFIL PÚBLICO DE OTRO USUARIO (GET /api/usuarios/:id) ───────────────────
/**
 * Devuelve el perfil normalizado de cualquier usuario por su _id.
 * Reutiliza exactamente el mismo formato que obtenerMiPerfil para que
 * PerfilPublico.jsx consuma los mismos nombres de campo.
 */
const obtenerPerfilPublico = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ mensaje: 'El parámetro ID es obligatorio.' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ mensaje: 'ID de usuario inválido.' });
        }

        const usuario = await Usuario.findById(id).select('-password').lean();

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Separar nombre_completo en nombre y apellido (mismo criterio que obtenerMiPerfil)
        const partes   = (usuario.nombre_completo || '').trim().split(' ');
        const nombre   = partes[0] || '';
        const apellido = partes.slice(1).join(' ');

        const conv = usuario.preferencias_convivencia || {};

        let vivienda = null;
        if (usuario.alojamientoId) {
            const alojamiento = await Alojamiento.findById(usuario.alojamientoId).lean();
            if (alojamiento) {
                vivienda = {
                    _id:                   alojamiento._id,
                    titulo:                alojamiento.titulo || '',
                    sector:                alojamiento.sector || '',
                    comuna:                alojamiento.comuna || '',
                    tipoPropiedad:         alojamiento.tipoPropiedad || '',
                    imagenes:              alojamiento.imagenes || [],
                    habitacionesOfrecidas: alojamiento.habitacionesOfrecidas || [],
                };
            }
        }

        const perfilPublico = {
            _id:           usuario._id,
            nombre,
            apellido,
            bio:           usuario.bio || '',
            fotoPerfilUrl: usuario.foto_perfil || '',
            rol:           usuario.rol,
            universidad:   usuario.perfil_academico?.universidad || '',
            carrera:       usuario.perfil_academico?.carrera     || '',
            sede:          usuario.perfil_academico?.sede        || '',
            anio_ingreso:  usuario.perfil_academico?.anio_ingreso || null,
            alojamientoId: usuario.alojamientoId || null,
            vivienda,
            preferencias: {
                fuma:             normalizarFumaRespuesta(conv.fuma),
                mascotas:         normalizarMascotasRespuesta(conv.mascotas),
                orden:            conv.nivel_orden      ?? 0,
                ruido:            conv.nivel_ruido      ?? 0,
                bebeAlcohol:      normalizarBebeRespuesta(conv.bebe_alcohol),
                horarioPreferido: conv.horario_preferido || 'Indiferente',
            },
            filtros: usuario.filtros || {},
            intereses: usuario.intereses || [],
        };

        return res.status(200).json(perfilPublico);

    } catch (err) {
        console.error('[obtenerPerfilPublico] Error:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

// ─── CAMBIAR CONTRASEÑA (usuario autenticado) ────────────────────────────────
// PUT /api/usuarios/cambiar-password
// Body: { contrasenaActual, nuevaContrasena }
const cambiarPassword = async (req, res) => {
    const contrasenaActual = req.body.contrasenaActual;
    const nuevaContrasena = req.body.nuevaContrasena;

    if (!contrasenaActual || !nuevaContrasena) {
        return res.status(400).json({
            mensaje: 'La contraseña actual y la nueva contraseña son obligatorias.',
        });
    }

    if (typeof nuevaContrasena !== 'string' || nuevaContrasena.length < 8) {
        return res.status(400).json({
            mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.',
        });
    }

    if (contrasenaActual === nuevaContrasena) {
        return res.status(400).json({
            mensaje: 'La nueva contraseña debe ser diferente a la actual.',
        });
    }

    const idUsuario = obtenerIdDesdeToken(req);

    if (!idUsuario) {
        return res.status(401).json({
            mensaje: 'No se pudo identificar al usuario autenticado.',
        });
    }

    if (!mongoose.Types.ObjectId.isValid(idUsuario)) {
        return res.status(400).json({
            mensaje: 'Identificador de usuario no válido.',
        });
    }

    try {
        const usuario = await Usuario.findById(idUsuario).select('+password');

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado.',
            });
        }

        const contrasenaCoincide = await bcrypt.compare(contrasenaActual, usuario.password);

        if (!contrasenaCoincide) {
            return res.status(401).json({
                mensaje: 'La contraseña actual es incorrecta.',
            });
        }

        const nuevaContrasenaHasheada = await bcrypt.hash(nuevaContrasena, 10);

        usuario.password = nuevaContrasenaHasheada;
        await usuario.save({ validateBeforeSave: false });

        return res.status(200).json({
            mensaje: '¡Tu contraseña se actualizó correctamente!',
        });

    } catch (err) {
        console.error('[cambiarPassword] Error:', err);
        return res.status(500).json({
            mensaje: 'Error interno del servidor.',
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    obtenerUsuarios,
    actualizarPerfil,
    obtenerMiPerfil,
    editarMiPerfil,
    obtenerMatches,
    obtenerPerfilPublico,
    cambiarPassword,
};