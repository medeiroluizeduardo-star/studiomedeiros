// Avisos no celular. Roda no GitHub Actions (rotina "Avisos no celular"), de hora em hora, das 7h às 22h.
// Lê o Firestore com a chave de serviço, decide os avisos (avisos-planejar.mjs) e envia pelo Firebase Cloud Messaging.
// Cada aviso vai uma vez só: o que já foi enviado fica marcado em avisosEstado/estado (esquecido depois de 15 dias).
// AVISOS_SO_TESTAR=1 mostra o que seria enviado, sem enviar nem marcar.
import { conectar, resumo } from './comum.mjs';
import { planejar, addDays } from './avisos-planejar.mjs';

process.env.TZ = process.env.TZ || 'America/Sao_Paulo';
const soTestar = process.env.AVISOS_SO_TESTAR === '1';
const { db, F } = await conectar();
const porId = qs => Object.fromEntries(qs.docs.map(x => [x.id, x.data()]));
const ms = x => (!x ? 0 : typeof x.toMillis === 'function' ? x.toMillis() : Date.parse(x) || 0);

const avisos = porId(await db.collection('avisos').get());
const comToken = Object.keys(avisos).filter(uid => (avisos[uid].tokens || []).length);
const estadoRef = db.doc('avisosEstado/estado');
if (!comToken.length) {
  if (!soTestar) await estadoRef.set({ ultimaExecucao: F.FieldValue.serverTimestamp(), ultimoResultado: { avisos: 0, entregues: 0, falhas: 0 }, aparelhos: 0, pessoas: 0 }, { merge: true });
  console.log('::notice::Ninguém ligou os avisos ainda. Nada a enviar.'); process.exit(0);
}

// Quem é da equipe e com qual perfil (quem saiu da equipe não recebe mais nada)
const acesso = (await db.doc('sistema/acesso').get()).data() || {};
const equipe = porId(await db.collection('equipe').get());
const papelDe = uid => ((acesso.donas || []).includes(uid) ? 'owner' : equipe[uid] && equipe[uid].ativo !== false ? equipe[uid].papel : null);
const pessoas = comToken.map(uid => ({ uid, papel: papelDe(uid), tokens: avisos[uid].tokens, prefs: avisos[uid].prefs || {} })).filter(p => p.papel);

const agora = new Date(), hoje = agora.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
// Agenda: da semana passada até amanhã (o resumo de segunda olha a semana que passou)
const agenda = (await db.collection('agenda').where('data', '>=', addDays(hoje, -7)).get()).docs.map(x => x.data()).filter(a => a.data <= addDays(hoje, 7));
// Novidades das clientes pelo link nas últimas 48 horas
const desde = Date.now() - 48 * 3600e3, tsDesde = F.Timestamp.fromMillis(desde);
const novidades = [];
// Confirmação de presença não vira aviso (o horário só passa a "confirmado"); pedido de horário sim.
(await db.collection('solicitacoes').where('criadoEm', '>=', tsDesde).get()).forEach(x => { const t = x.data().tipo || 'cancelamento'; if (t !== 'confirmacao') novidades.push({ id: 'sol:' + x.id, tipo: t === 'horario' ? 'horario' : 'cancelamento' }); });
(await db.collection('contratosLink').where('status', '==', 'aceito').get()).forEach(x => { if (ms(x.data().aceite && x.data().aceite.em) >= desde) novidades.push({ id: 'ctr:' + x.id, tipo: 'contrato' }); });
(await db.collection('cadastros').where('status', '==', 'enviado').get()).forEach(x => { if (ms(x.data().enviadoEm) >= desde) novidades.push({ id: 'cad:' + x.id, tipo: 'cadastro' }); });
(await db.collection('anamnesePortal').where('em', '>=', tsDesde).get()).forEach(x => novidades.push({ id: 'ana:' + x.id + ':' + ms(x.data().em), tipo: 'anamnese' }));
(await db.collection('avaliacoes').where('em', '>=', tsDesde).get()).forEach(x => novidades.push({ id: 'ava:' + x.id, tipo: 'avaliacao' }));
// Contas e DAS só se alguém com finanças ligou
const comFin = pessoas.some(p => p.papel === 'owner' || p.papel === 'contador');
const contas = comFin ? (await db.collection('contas').get()).docs.map(x => x.data()) : [];
const privado = comFin ? ((await db.doc('privado/config').get()).data() || {}) : {};

const enviados = ((await estadoRef.get()).data() || {}).enviados || {};
const { msgs, marcar } = planejar({ pessoas, agenda, novidades, contas, privado, enviados, agora });
console.log(`${pessoas.length} pessoa(s) com aviso ligado · ${msgs.length} aviso(s) para enviar · ${marcar.length} marca(s) nova(s).`);
msgs.forEach(m => console.log(`→ ${m.uid.slice(0, 6)}…: ${m.titulo} | ${m.corpo}`));
if (soTestar) { console.log('::notice::Só teste: nada foi enviado.'); process.exit(0); }

const { getMessaging } = await import('firebase-admin/messaging');
const fcm = getMessaging(); let ok = 0, falhas = 0;
for (const m of msgs) {
  const tokens = avisos[m.uid].tokens || [];
  const r = await fcm.sendEachForMulticast({ tokens, data: { titulo: m.titulo, corpo: m.corpo, tag: m.tag, url: m.url }, webpush: { headers: { Urgency: 'high', TTL: '21600' } } });
  const mortos = [];
  r.responses.forEach((x, i) => { if (x.success) ok++; else { falhas++; const c = x.error && x.error.code; if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument'].includes(c)) mortos.push(tokens[i]); } });
  if (mortos.length) await db.doc(`avisos/${m.uid}`).update({ tokens: F.FieldValue.arrayRemove(...mortos) });
}
const limite = addDays(hoje, -15); const novo = {};
for (const [k, v] of Object.entries(enviados)) if (typeof v === 'string' && v >= limite) novo[k] = v;
marcar.forEach(k => { novo[k] = hoje; });
await estadoRef.set({ enviados: novo, ultimaExecucao: F.FieldValue.serverTimestamp(), ultimoResultado: { avisos: msgs.length, entregues: ok, falhas }, aparelhos: pessoas.reduce((n, p) => n + p.tokens.length, 0), pessoas: pessoas.length });
resumo(`### Avisos no celular\n${msgs.length} aviso(s) · ${ok} entregue(s)${falhas ? ` · ${falhas} falha(s)` : ''} · ${pessoas.length} pessoa(s) com aviso ligado.`);
