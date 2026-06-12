const mongoose = require('mongoose');
const MatchUsuario = require('../models/MatchUsuario');
const Chat = require('../models/Chat');
const Usuario = require('../models/Usuario');

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

const buscarOCrearChat = async (idUsuario, idOtro) => {
  let chat = await Chat.findOne({
    participantes: { $all: [idUsuario, idOtro], $size: 2 },
  });
  if (!chat) {
    const [p1, p2] = ordenarParticipantes(idUsuario, idOtro);
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

const UMBRAL_AFINIDAD_IDEAL = 18;
const MAX_PERFILES_CONTINGENCIA = 50;

/**
 * Si ningún perfil supera el umbral ideal, devuelve los de mayor puntuación
 * para que el Dashboard nunca quede vacío en demostraciones.
 */
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

/**
 * Consulta todos los candidatos excepto el usuario actual (con o sin vivienda, cualquier rol).
 */
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
  const puntuacion = minimo + aleatorio;
  return puntuacion;
};

/**
 * Plan B de emergencia: devuelve hasta 15 usuarios aleatorios con afinidad simulada 40–70%.
 */
const obtenerFallbackEmergencia = async (miObjectId) => {
  const usuariosRescate = await Usuario.find({
    _id: { $ne: miObjectId },
  })
    .select('-password')
    .limit(CANTIDAD_RESCATE_EMERGENCIA)
    .lean();

  const resultadosRescate = [];

  for (const candidato of usuariosRescate) {
    const puntuacion = generarPuntuacionRescateAleatoria();

    const entrada = {
      matchScore:         puntuacion,
      porcentajeAfinidad: puntuacion,
      compatibilidad:     `${puntuacion}%`,
      esRescate:          true,
      usuario:            candidato,
    };

    resultadosRescate.push(entrada);
  }

  resultadosRescate.sort(function (a, b) {
    return b.matchScore - a.matchScore;
  });

  return resultadosRescate;
};

// POST /api/matches  — Aceptar perfil (swipe derecha)
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
    const destinatarioExiste = await Usuario.findById(id_destinatario).select('_id');
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
    if (esMutuo && !match.es_mutuo) {
      match.es_mutuo = true;
      await match.save();
      await MatchUsuario.updateOne(
        { id_usuario: id_destinatario, id_destinatario: idUsuario },
        { es_mutuo: true }
      );
    }

    const chat = await buscarOCrearChat(idUsuario, id_destinatario);

    return res.status(201).json({
      exito: true,
      mensaje: 'Match registrado. Ya puedes chatear.',
      data: {
        match,
        chatId: chat._id,
        es_mutuo: esMutuo,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const chat = await buscarOCrearChat(idUsuario, id_destinatario);
      return res.status(200).json({
        exito: true,
        mensaje: 'Ya habías aceptado a este usuario.',
        data: { chatId: chat._id },
      });
    }
    console.error('Error al crear match:', error);
    return res.status(500).json({ mensaje: 'Error al registrar el match.' });
  }
};

// GET /api/matches — Lista de usuarios aceptados por mí (para chats)
const obtenerMisMatches = async (req, res) => {
  const idUsuario = obtenerIdDesdeToken(req);

  try {
    const matches = await MatchUsuario.find({ id_usuario: idUsuario })
      .populate('id_destinatario', 'nombre_completo foto_perfil fecha_nacimiento')
      .sort({ createdAt: -1 })
      .lean();

    const resultado = [];

    for (const item of matches) {
      const otro = item.id_destinatario;
      if (!otro) {
        continue;
      }

      const chat = await buscarOCrearChat(idUsuario, otro._id);

      resultado.push({
        matchId:   item._id,
        chatId:    chat._id,
        es_mutuo:  item.es_mutuo,
        usuario:   otro,
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
  obtenerMisMatches,
  buscarOCrearChat,
  ordenarParticipantes,
  filtrarPorUmbralConContingencia,
  consultarCandidatosEmparejamiento,
  obtenerFallbackEmergencia,
  UMBRAL_AFINIDAD_IDEAL,
};
