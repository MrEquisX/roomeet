/**
 * Limpia chats y mensajes creados antes del refactor de match mutuo.
 *
 * Uso:
 *   node scripts/limpiar-datos-huerfanos.js --dry-run   # solo muestra qué se borraría
 *   node scripts/limpiar-datos-huerfanos.js               # ejecuta la limpieza
 *
 * Requiere MONGODB_URI en backend/.env (o variables de entorno de producción).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Chat = require('../src/models/Chat');
const Mensaje = require('../src/models/Mensaje');
const MatchUsuario = require('../src/models/MatchUsuario');

async function esMatchMutuo(idA, idB) {
  const [m1, m2] = await Promise.all([
    MatchUsuario.findOne({ id_usuario: idA, id_destinatario: idB, es_mutuo: true }),
    MatchUsuario.findOne({ id_usuario: idB, id_destinatario: idA, es_mutuo: true }),
  ]);
  return !!(m1 && m2);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está definida.');
    process.exit(1);
  }

  console.log(dryRun ? '🔍 Modo simulación (--dry-run)\n' : '🧹 Iniciando limpieza...\n');

  await mongoose.connect(process.env.MONGODB_URI);

  const chats = await Chat.find({}).lean();
  let chatsEliminados = 0;
  let mensajesEliminados = 0;
  let chatsIrregulares = 0;

  for (const chat of chats) {
    const participantes = chat.participantes || [];

    if (participantes.length !== 2) {
      chatsIrregulares++;
      console.log(`⚠ Chat ${chat._id} tiene ${participantes.length} participante(s) — revisar manualmente`);
      continue;
    }

    const [p1, p2] = participantes;
    const mutuo = await esMatchMutuo(p1, p2);

    if (mutuo) {
      continue;
    }

    const countMensajes = await Mensaje.countDocuments({ id_chat: chat._id });
    console.log(`🗑 Chat huérfano ${chat._id} → ${countMensajes} mensaje(s)`);

    if (!dryRun) {
      const resMensajes = await Mensaje.deleteMany({ id_chat: chat._id });
      mensajesEliminados += resMensajes.deletedCount;
      await Chat.deleteOne({ _id: chat._id });
      chatsEliminados++;
    } else {
      chatsEliminados++;
      mensajesEliminados += countMensajes;
    }
  }

  const matchesPendientes = await MatchUsuario.countDocuments({ es_mutuo: false });
  const matchesMutuos = await MatchUsuario.countDocuments({ es_mutuo: true });

  console.log('\n── Resumen ──');
  console.log(`Chats huérfanos ${dryRun ? 'detectados' : 'eliminados'}: ${chatsEliminados}`);
  console.log(`Mensajes ${dryRun ? 'a eliminar' : 'eliminados'}:       ${mensajesEliminados}`);
  console.log(`Chats irregulares (sin acción): ${chatsIrregulares}`);
  console.log(`Matches pendientes (conservados): ${matchesPendientes}`);
  console.log(`Matches mutuos (conservados):     ${matchesMutuos}`);

  if (dryRun) {
    console.log('\nEjecuta sin --dry-run para aplicar los cambios.');
  } else {
    console.log('\n✅ Limpieza completada.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
