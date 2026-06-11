const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Alojamiento = require('../models/Alojamiento');

const obtenerIdDesdeToken = (req) => req.usuario?.id;

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
            intereses: (usuario.intereses || []).map((i) =>
                typeof i === 'string' ? { nombre: i, icono: '⭐' } : i
            ),
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
 * Calcula la puntuación de compatibilidad entre dos usuarios.
 * Escala: 0 a 100 puntos.
 * Función pura y síncrona — no realiza consultas a la base de datos.
 *
 * Componentes del puntaje:
 *   Bloque A — Afinidad Académica ........... máx. 30 pts
 *   Bloque B — Nivel de Orden ............... máx. 20 pts
 *   Bloque C — Visitas Frecuentes ........... máx. 20 pts
 *   Bloque D — Hábitos Generales ............ máx. 30 pts
 *              (alcohol 10 + horario 10 + dieta 10)
 *
 * NOTA: El componente "presupuesto" se implementará cuando el campo
 *       `presupuesto` sea añadido al esquema Usuario y al modelo Alojamiento.
 *       Por ahora, el Bloque D cubre esos 30 puntos con compatibilidad de hábitos.
 *
 * @param {Object} yo        - Lean document del usuario autenticado
 * @param {Object} candidato - Lean document del candidato a evaluar
 * @returns {number}         - Puntuación entera entre 0 y 100
 */
function calcularMatchScore(yo, candidato) {
    let score = 0;

    const misPref    = yo.preferencias_convivencia        || {};
    const susPref    = candidato.preferencias_convivencia || {};
    const miAcad     = yo.perfil_academico                || {};
    const suAcad     = candidato.perfil_academico         || {};
    const misFiltros = yo.filtros                         || {};

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOQUE A — Afinidad Académica (máx. 30 pts)
    // ═══════════════════════════════════════════════════════════════════════════

    const miUniversidad = (miAcad.universidad || '').toLowerCase().trim();
    const suUniversidad = (suAcad.universidad || '').toLowerCase().trim();
    const miSede        = (miAcad.sede        || '').toLowerCase().trim();
    const suSede        = (suAcad.sede        || '').toLowerCase().trim();
    const miCarrera     = (miAcad.carrera     || '').toLowerCase().trim();
    const suCarrera     = (suAcad.carrera     || '').toLowerCase().trim();

    const coincideUniversidad = (miUniversidad.length > 0) && (miUniversidad === suUniversidad);
    const coincideSede        = (miSede.length > 0)        && (miSede        === suSede);
    const coincideCarrera     = (miCarrera.length > 0)     && (miCarrera     === suCarrera);

    if (coincideUniversidad && coincideSede) {
        // Misma universidad y misma sede: compatibilidad académica completa
        score = score + 30;
    } else if (coincideUniversidad) {
        // Solo misma universidad: compatibilidad académica parcial
        score = score + 15;
    }

    // Penalización si el filtro soloMismaUniversidad está activo y no coinciden
    if (misFiltros.soloMismaUniversidad === true) {
        if (!coincideUniversidad) {
            score = score - 10;
        }
    }

    // Penalización si el filtro soloMismaCarrera está activo y no coinciden
    if (misFiltros.soloMismaCarrera === true) {
        if (!coincideCarrera) {
            score = score - 5;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOQUE B — Nivel de Orden (máx. 20 pts)
    // ═══════════════════════════════════════════════════════════════════════════

    const miOrden  = misPref.nivel_orden || 0;
    const suOrden  = susPref.nivel_orden || 0;

    const diferenciaOrden = Math.abs(miOrden - suOrden);

    if (diferenciaOrden === 0) {
        // Orden idéntico: compatibilidad perfecta
        score = score + 20;
    } else if (diferenciaOrden === 1) {
        // Diferencia mínima: compatibilidad aceptable
        score = score + 10;
    }
    // Si diferenciaOrden >= 2: 0 pts — incompatibilidad notable de hábitos

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOQUE C — Compatibilidad de alcohol (máx. 20 pts)
    // ═══════════════════════════════════════════════════════════════════════════

    const miAlcohol = misPref.bebe_alcohol || '';
    const suAlcohol = susPref.bebe_alcohol || '';

    if (miAlcohol.length > 0 && miAlcohol === suAlcohol) {
        score = score + 20;
    } else if (
        (miAlcohol === 'Ocasionalmente' && suAlcohol === 'No') ||
        (miAlcohol === 'No' && suAlcohol === 'Ocasionalmente')
    ) {
        score = score + 10;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOQUE D — Compatibilidad de horario (máx. 10 pts)
    // ═══════════════════════════════════════════════════════════════════════════
    const miHorario  = misPref.horario_preferido || '';
    const suHorario  = susPref.horario_preferido || '';

    let horarioCompatible = false;

    if (miHorario === suHorario) {
        horarioCompatible = true;
    }
    if (miHorario === 'Indiferente') {
        horarioCompatible = true;
    }
    if (suHorario === 'Indiferente') {
        horarioCompatible = true;
    }

    if (horarioCompatible) {
        score = score + 10;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NORMALIZACIÓN: garantizar rango estricto 0–100
    // ═══════════════════════════════════════════════════════════════════════════

    if (score < 0) {
        score = 0;
    }

    if (score > 100) {
        score = 100;
    }

    return score;
}

// ─── ENDPOINT DE MATCHES (GET /api/usuarios/matches) ──────────────────────────

/**
 * Devuelve los perfiles compatibles con el usuario autenticado,
 * ordenados de mayor a menor porcentaje de afinidad (matchScore).
 *
 * Flujo:
 *   1. Obtener el perfil completo del usuario autenticado.
 *   2. Determinar el rol opuesto (Buscador ↔ Anfitrion).
 *   3. Aplicar dealbreakers a nivel de consulta MongoDB (fuma, mascotas).
 *   4. Calcular matchScore para cada candidato superviviente.
 *   5. Ordenar y devolver el arreglo de resultados.
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

        // ── 2. Determinar el rol opuesto ──────────────────────────────────────
        let rolOpuesto;

        if (yo.rol === 'Buscador') {
            rolOpuesto = 'Anfitrion';
        } else {
            rolOpuesto = 'Buscador';
        }

        // ── 3. Construir filtros de MongoDB (dealbreakers en base de datos) ────
        // Filtrar directamente en la consulta es más eficiente que hacerlo en memoria
        const miObjectId = new mongoose.Types.ObjectId(String(miId));

        const queryFiltros = {
            _id: { $ne: miObjectId },
            rol: rolOpuesto,
        };

        const misPref = yo.preferencias_convivencia || {};

        // Dealbreaker: ambiente libre de humo
        if (misPref.fuma === 'No') {
            queryFiltros['preferencias_convivencia.fuma'] = { $ne: 'Sí' };
        }

        // Dealbreaker: mascotas
        if (misPref.mascotas === 'Sí') {
            queryFiltros['preferencias_convivencia.mascotas'] = 'Sí';
        }

        // ── 4. Consultar candidatos supervivientes de los dealbreakers ─────────
        const candidatos = await Usuario.find(queryFiltros)
            .select('-password')
            .lean();

        // ── 4b. Cargar viviendas publicadas para calcular distancia en el frontend ──
        const idsAlojamientos = [];
        for (const candidato of candidatos) {
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

        for (const candidato of candidatos) {
            const idCandidato = String(candidato._id);

            if (idCandidato === String(miId)) {
                continue;
            }

            const puntuacion = calcularMatchScore(yo, candidato);

            let viviendaPublicada = null;
            if (candidato.alojamientoId) {
                const claveVivienda = String(candidato.alojamientoId);
                viviendaPublicada = mapaViviendas[claveVivienda] || null;
            }

            const usuarioEnriquecido = {
                ...candidato,
                vivienda: viviendaPublicada,
            };

            const entrada = {
                matchScore:     puntuacion,
                compatibilidad: `${puntuacion}%`,
                usuario:        usuarioEnriquecido,
            };

            resultados.push(entrada);
        }

        // ── 6. Ordenar de mayor a menor porcentaje de afinidad ─────────────────
        resultados.sort(function (a, b) {
            return b.matchScore - a.matchScore;
        });

        return res.status(200).json({
            exito:   true,
            miRol:   yo.rol,
            total:   resultados.length,
            data:    resultados,
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
            intereses: (usuario.intereses || []).map((i) => {
                if (typeof i === 'string') {
                    return { nombre: i, icono: '⭐' };
                }
                return i;
            }),
        };

        return res.status(200).json(perfilPublico);

    } catch (err) {
        console.error('[obtenerPerfilPublico] Error:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
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
};