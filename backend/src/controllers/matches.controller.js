const mongoose = require('mongoose');
const MatchUsuario = require('../models/MatchUsuario');
const RechazoUsuario = require('../models/RechazoUsuario');
const Chat = require('../models/Chat');
const Usuario = require('../models/Usuario');
const { emitirAUsuario } = require('../socket');

const obtenerIdDesdeToken = (req) => {
  return req.usuario?.id ?? req.usuario?.id_usuario;
};

const ordenarParticipantes = (idA, idB) => {
  const strA = String(idA);
  const strB = String(idB);
  if (strA < strB) {
    return [idA, idB];
  }
  return [idB, idA];
};

const crearChatMutuo = async (idUsuario, idOtro) => {
  const [p1, p2] = ordenarParticipantes(idUsuario, idOtro);
  let chat = await Chat.findOne({
    participantes: { $all: [p1, p2], $size: 2 },
  });
  if (!chat) {
    chat = await Chat.create({ participantes: [p1, p2] });
  }
  return chat;
};

const calcularEsMutuo = async (idUsuario, idDestinatario) => {
  const reciproco = await MatchUsuario.findOne({
    id_usuario:      idDestinatario,
    id_destinatario: idUsuario,
  });
  return !!reciproco;
};

const marcarMatchMutuo = async (idUsuario, idDestinatario) => {
  await MatchUsuario.updateOne(
    { id_usuario: idUsuario, id_destinatario: idDestinatario },
    { es_mutuo: true }
  );
  await MatchUsuario.updateOne(
    { id_usuario: idDestinatario, id_destinatario: idUsuario },
    { es_mutuo: true }
  );
};

const verificarMatchMutuo = async (idUsuario, idOtro) => {
  const matchDirecto = await MatchUsuario.findOne({
    id_usuario:      idUsuario,
    id_destinatario: idOtro,
    es_mutuo:        true,
  });
  const matchReciproco = await MatchUsuario.findOne({
    id_usuario:      idOtro,
    id_destinatario: idUsuario,
    es_mutuo:        true,
  });
  return !!(matchDirecto && matchReciproco);
};

const formatearUsuarioNotificacion = (usuario) => ({
  _id:            usuario._id,
  nombre_completo: usuario.nombre_completo,
  foto_perfil:    usuario.foto_perfil || '',
  fecha_nacimiento: usuario.fecha_nacimiento,
});

const primerNombre = (nombreCompleto) => {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    return 'Alguien';
  }
  const partes = nombreCompleto.trim().split(/\s+/);
  return partes[0] || 'Alguien';
};

const emitirNotificacionMatch = (userId, payload) => {
  if (!userId || !payload?.mensaje) {
    return;
  }

  try {
    emitirAUsuario(userId, 'notificacion_match', payload);
  } catch (error) {
    console.error('[emitirNotificacionMatch] Error:', error.message);
  }
};

const emitirNotificacionPendiente = async (idDestinatario, match, idRemitente) => {
  const remitente = await Usuario.findById(idRemitente)
    .select('nombre_completo foto_perfil fecha_nacimiento')
    .lean();

  if (!remitente) {
    return;
  }

  const from = formatearUsuarioNotificacion(remitente);
  const payloadBase = {
    tipo:      'solicitud',
    matchId:   match._id,
    from,
    createdAt: match.createdAt || new Date(),
  };

  emitirAUsuario(idDestinatario, 'nueva_notificacion', {
    ...payloadBase,
    tipo: 'solicitud_match',
  });

  emitirNotificacionMatch(idDestinatario, {
    ...payloadBase,
    mensaje: `${primerNombre(from.nombre_completo)} te envió una solicitud de match.`,
  });
};

const emitirMatchMutuo = async (idUsuario, idDestinatario, chatId) => {
  const [usuarioA, usuarioB] = await Promise.all([
    Usuario.findById(idUsuario).select('nombre_completo foto_perfil fecha_nacimiento').lean(),
    Usuario.findById(idDestinatario).select('nombre_completo foto_perfil fecha_nacimiento').lean(),
  ]);

  if (usuarioA) {
    const usuarioFormateado = formatearUsuarioNotificacion(usuarioA);

    emitirAUsuario(idDestinatario, 'match_mutuo', {
      tipo:     'match_mutuo',
      chatId,
      es_mutuo: true,
      usuario:  usuarioFormateado,
    });

    emitirNotificacionMatch(idDestinatario, {
      tipo:     'match_mutuo',
      chatId,
      es_mutuo: true,
      usuario:  usuarioFormateado,
      mensaje:  `¡Match mutuo con ${primerNombre(usuarioA.nombre_completo)}! Ya pueden chatear.`,
    });
  }

  if (usuarioB) {
    const usuarioFormateado = formatearUsuarioNotificacion(usuarioB);

    emitirAUsuario(idUsuario, 'match_mutuo', {
      tipo:     'match_mutuo',
      chatId,
      es_mutuo: true,
      usuario:  usuarioFormateado,
    });

    emitirNotificacionMatch(idUsuario, {
      tipo:     'match_mutuo',
      chatId,
      es_mutuo: true,
      usuario:  usuarioFormateado,
      mensaje:  `¡Match mutuo con ${primerNombre(usuarioB.nombre_completo)}! Ya pueden chatear.`,
    });
  }
};

/**
 * IDs que no deben aparecer en el mazo de swipe del usuario autenticado.
 */
const obtenerIdsExcluidosDelSwipe = async (miId) => {
  const miObjectId = new mongoose.Types.ObjectId(String(miId));
  const excluidos = new Set();

  const [aceptadosPorMi, rechazadosPorMi, likesRecibidos, rechazosRecibidos, mutuos] = await Promise.all([
    MatchUsuario.find({ id_usuario: miObjectId }).select('id_destinatario').lean(),
    RechazoUsuario.find({ id_usuario: miObjectId }).select('id_destinatario').lean(),
    MatchUsuario.find({ id_destinatario: miObjectId, es_mutuo: false }).select('id_usuario').lean(),
    RechazoUsuario.find({ id_destinatario: miObjectId }).select('id_usuario').lean(),
    MatchUsuario.find({ $or: [{ id_usuario: miObjectId }, { id_destinatario: miObjectId }], es_mutuo: true })
      .select('id_usuario id_destinatario')
      .lean(),
  ]);

  for (const item of aceptadosPorMi) {
    excluidos.add(String(item.id_destinatario));
  }
  for (const item of rechazadosPorMi) {
    excluidos.add(String(item.id_destinatario));
  }
  for (const item of likesRecibidos) {
    excluidos.add(String(item.id_usuario));
  }
  for (const item of rechazosRecibidos) {
    excluidos.add(String(item.id_usuario));
  }
  for (const item of mutuos) {
    const otro = String(item.id_usuario) === String(miId)
      ? String(item.id_destinatario)
      : String(item.id_usuario);
    excluidos.add(otro);
  }

  return excluidos;
};

const UMBRAL_AFINIDAD_IDEAL = 18;
const MAX_PERFILES_CONTINGENCIA = 50;

const filtrarPorUmbralConContingencia = (resultados) => {
  const sobreUmbral = [];

  for (const entrada of resultados) {
    const score = entrada.matchScore;
    if (score >= UMBRAL_AFINIDAD_IDEAL) {
      sobreUmbral.push(entrada);
    }
  }

  if (sobreUmbral.length > 0) {
    return sobreUmbral;
  }

  const copiaOrdenada = [...resultados];
  copiaOrdenada.sort(function (a, b) {
    return b.matchScore - a.matchScore;
  });

  const contingencia = [];
  const limite = Math.min(copiaOrdenada.length, MAX_PERFILES_CONTINGENCIA);

  for (let i = 0; i < limite; i++) {
    contingencia.push(copiaOrdenada[i]);
  }

  return contingencia;
};

const consultarCandidatosEmparejamiento = async (yo, miObjectId) => {
  const candidatos = await Usuario.find({
    _id: { $ne: miObjectId },
  })
    .select('-password')
    .lean();

  return candidatos;
};

const CANTIDAD_RESCATE_EMERGENCIA = 15;

const generarPuntuacionRescateAleatoria = () => {
  const minimo = 40;
  const maximo = 70;
  const rango = maximo - minimo + 1;
  const aleatorio = Math.floor(Math.random() * rango);
  return minimo + aleatorio;
};

const obtenerFallbackEmergencia = async (miObjectId, idsExcluidos) => {
  const usuariosRescate = await Usuario.find({
    _id: { $ne: miObjectId },
  })
    .select('-password')
    .limit(CANTIDAD_RESCATE_EMERGENCIA * 3)
    .lean();

  const resultadosRescate = [];

  for (const candidato of usuariosRescate) {
    if (idsExcluidos.has(String(candidato._id))) {
      continue;
    }

    const puntuacion = generarPuntuacionRescateAleatoria();
    resultadosRescate.push({
      matchScore:         puntuacion,
      porcentajeAfinidad: puntuacion,
      compatibilidad:     `${puntuacion}%`,
      esRescate:          true,
      usuario:            candidato,
    });

    if (resultadosRescate.length >= CANTIDAD_RESCATE_EMERGENCIA) {
      break;
    }
  }

  resultadosRescate.sort(function (a, b) {
    return b.matchScore - a.matchScore;
  });

  return resultadosRescate;
};

// POST /api/matches — Aceptar perfil (swipe derecha o campana de notificaciones)
const crearMatch = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const { id_destinatario } = req.body;

  if (!id_destinatario) {
    return res.status(400).json({ mensaje: 'id_destinatario es obligatorio.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id_destinatario)) {
    return res.status(400).json({ mensaje: 'id_destinatario inválido.' });
  }

  if (String(id_destinatario) === String(idUsuario)) {
    return res.status(400).json({ mensaje: 'No puedes hacer match contigo mismo.' });
  }

  try {
    const rechazoPrevio = await RechazoUsuario.findOne({
      id_usuario:      idUsuario,
      id_destinatario: id_destinatario,
    });
    if (rechazoPrevio) {
      return res.status(409).json({ mensaje: 'Ya rechazaste a este usuario.' });
    }

    const destinatarioExiste = await Usuario.findById(id_destinatario).select('_id nombre_completo foto_perfil');
    if (!destinatarioExiste) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    let match = await MatchUsuario.findOne({
      id_usuario:      idUsuario,
      id_destinatario: id_destinatario,
    });

    if (!match) {
      match = await MatchUsuario.create({
        id_usuario:      idUsuario,
        id_destinatario: id_destinatario,
        es_mutuo:        false,
      });
    }

    const esMutuo = await calcularEsMutuo(idUsuario, id_destinatario);
    let chat = null;

    if (esMutuo) {
      await marcarMatchMutuo(idUsuario, id_destinatario);
      match.es_mutuo = true;
      await match.save();
      chat = await crearChatMutuo(idUsuario, id_destinatario);
      await emitirMatchMutuo(idUsuario, id_destinatario, chat._id);
    } else {
      await emitirNotificacionPendiente(id_destinatario, match, idUsuario);

      emitirNotificacionMatch(idUsuario, {
        tipo:    'confirmacion',
        mensaje: `Solicitud enviada a ${primerNombre(destinatarioExiste.nombre_completo)}.`,
      });
    }

    const mensaje = esMutuo
      ? '¡Match mutuo! Ya pueden chatear.'
      : 'Solicitud enviada. Espera a que el otro usuario acepte.';

    return res.status(201).json({
      exito: true,
      mensaje,
      data: {
        match,
        chatId: chat ? chat._id : null,
        es_mutuo: esMutuo,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const matchExistente = await MatchUsuario.findOne({
        id_usuario:      idUsuario,
        id_destinatario: id_destinatario,
      });
      const esMutuo = matchExistente?.es_mutuo || await verificarMatchMutuo(idUsuario, id_destinatario);
      let chatId = null;
      if (esMutuo) {
        const chat = await crearChatMutuo(idUsuario, id_destinatario);
        chatId = chat._id;
      }
      return res.status(200).json({
        exito: true,
        mensaje: 'Ya habías aceptado a este usuario.',
        data: { chatId, es_mutuo: esMutuo },
      });
    }
    console.error('Error al crear match:', error);
    return res.status(500).json({ mensaje: 'Error al registrar el match.' });
  }
};

// POST /api/matches/rechazar — Rechazar perfil (swipe izquierda o campana)
const rechazarMatch = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);
  const { id_destinatario } = req.body;

  if (!id_destinatario) {
    return res.status(400).json({ mensaje: 'id_destinatario es obligatorio.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id_destinatario)) {
    return res.status(400).json({ mensaje: 'id_destinatario inválido.' });
  }

  if (String(id_destinatario) === String(idUsuario)) {
    return res.status(400).json({ mensaje: 'Operación inválida.' });
  }

  try {
    await RechazoUsuario.updateOne(
      { id_usuario: idUsuario, id_destinatario: id_destinatario },
      { id_usuario: idUsuario, id_destinatario: id_destinatario },
      { upsert: true }
    );

    try {
      const quienRechaza = await Usuario.findById(idUsuario)
        .select('nombre_completo')
        .lean();

      emitirNotificacionMatch(id_destinatario, {
        tipo:    'rechazo',
        mensaje: `${primerNombre(quienRechaza?.nombre_completo)} no aceptó tu solicitud.`,
      });
    } catch (notifError) {
      console.error('[rechazarMatch] Error al emitir notificación:', notifError.message);
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Perfil rechazado.',
    });
  } catch (error) {
    console.error('Error al rechazar match:', error);
    return res.status(500).json({ mensaje: 'Error al registrar el rechazo.' });
  }
};

// GET /api/matches/notificaciones — Solicitudes pendientes (alguien te aceptó, tú aún no respondes)
const obtenerNotificacionesPendientes = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  try {
    const likesRecibidos = await MatchUsuario.find({
      id_destinatario: idUsuario,
      es_mutuo:        false,
    })
      .populate('id_usuario', 'nombre_completo foto_perfil fecha_nacimiento perfil_academico')
      .sort({ createdAt: -1 })
      .lean();

    const [misAceptaciones, misRechazos] = await Promise.all([
      MatchUsuario.find({ id_usuario: idUsuario }).select('id_destinatario').lean(),
      RechazoUsuario.find({ id_usuario: idUsuario }).select('id_destinatario').lean(),
    ]);

    const idsRespondidos = new Set();
    for (const item of misAceptaciones) {
      idsRespondidos.add(String(item.id_destinatario));
    }
    for (const item of misRechazos) {
      idsRespondidos.add(String(item.id_destinatario));
    }

    const pendientes = [];

    for (const item of likesRecibidos) {
      const remitente = item.id_usuario;
      if (!remitente) {
        continue;
      }
      if (idsRespondidos.has(String(remitente._id))) {
        continue;
      }

      pendientes.push({
        matchId:   item._id,
        createdAt: item.createdAt,
        from: {
          _id:             remitente._id,
          nombre_completo: remitente.nombre_completo,
          foto_perfil:     remitente.foto_perfil,
          fecha_nacimiento: remitente.fecha_nacimiento,
          perfil_academico: remitente.perfil_academico,
        },
      });
    }

    return res.status(200).json({
      exito: true,
      total: pendientes.length,
      data:  pendientes,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ mensaje: 'Error al cargar notificaciones.' });
  }
};

// GET /api/matches — Matches mutuos confirmados (para chats)
const obtenerMisMatches = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  try {
    const matches = await MatchUsuario.find({
      id_usuario: idUsuario,
      es_mutuo:   true,
    })
      .populate('id_destinatario', 'nombre_completo foto_perfil fecha_nacimiento')
      .sort({ createdAt: -1 })
      .lean();

    const resultado = [];

    for (const item of matches) {
      const otro = item.id_destinatario;
      if (!otro) {
        continue;
      }

      const esMutuo = await verificarMatchMutuo(idUsuario, otro._id);
      if (!esMutuo) {
        continue;
      }

      const chat = await crearChatMutuo(idUsuario, otro._id);

      resultado.push({
        matchId:  item._id,
        chatId:   chat._id,
        es_mutuo: true,
        usuario:  otro,
      });
    }

    return res.status(200).json({
      exito: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Error al obtener matches:', error);
    return res.status(500).json({ mensaje: 'Error al obtener matches.' });
  }
};

module.exports = {
  crearMatch,
  rechazarMatch,
  obtenerNotificacionesPendientes,
  obtenerMisMatches,
  crearChatMutuo,
  ordenarParticipantes,
  verificarMatchMutuo,
  obtenerIdsExcluidosDelSwipe,
  filtrarPorUmbralConContingencia,
  consultarCandidatosEmparejamiento,
  obtenerFallbackEmergencia,
  emitirNotificacionPendiente,
  UMBRAL_AFINIDAD_IDEAL,
};
