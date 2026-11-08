// Decide quais avisos mandar para cada pessoa (sem ler nem gravar nada: recebe tudo pronto e devolve a lista).
// Usado pela rotina avisos.mjs (GitHub, de hora em hora) e pelos testes (testes/avisos.test.mjs).
// Os avisos não mostram nomes de clientes na tela bloqueada do celular.
//
// Tipos (cada pessoa liga ou desliga cada um no sistema, em Ajustes › Avisos no celular):
//   novidades  de hora em hora: pedido de horário, cancelamento, contrato aceito, cadastro, ficha de anamnese ou avaliação pelo link
//   concluir   às 20h: atendimentos de hoje que já terminaram e não foram concluídos
//   amanha     às 19h: atendimentos de amanhã e quantos ainda não confirmaram
//   contas     às 8h (proprietária e contador): contas que vencem hoje ou estão vencidas, DAS perto do dia 20
//   semana     segunda às 8h (proprietária): resumo da semana que passou
export const TIPOS = {
  novidades: { nome: 'Novidades das clientes pelo link', papeis: ['owner', 'parceira', 'recepcao'] },
  concluir: { nome: 'Atendimentos de hoje sem concluir (20h)', papeis: ['owner', 'parceira', 'recepcao'] },
  amanha: { nome: 'Agenda de amanhã (19h)', papeis: ['owner', 'parceira', 'recepcao'] },
  contas: { nome: 'Contas e DAS a pagar (8h)', papeis: ['owner', 'contador'] },
  semana: { nome: 'Resumo da semana (segunda, 8h)', papeis: ['owner'] }
};

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const addMonths = (k, n) => { const d = parse(k + '-01'); d.setMonth(d.getMonth() + n); return ymd(d).slice(0, 7); };
const hm = h => { const [a, b] = String(h || '0:0').split(':').map(Number); return a * 60 + (b || 0); };
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Contas a pagar (mesma conta do sistema: public/app.js, ocorrencias)
export function ocorrencias(contas, ate, hoje) {
  const out = [];
  for (const ct of contas) {
    const ini = ct.vencimento; if (!ini) continue; const dia = +ini.slice(8, 10);
    const ks = []; if (ct.recorrente === 'mensal') { for (let k = ini.slice(0, 7); k <= ate.slice(0, 7); k = addMonths(k, 1)) ks.push(k); } else ks.push(ini.slice(0, 7));
    for (const k of ks) {
      if (ct.ate && k > ct.ate.slice(0, 7)) continue;
      const last = new Date(+k.slice(0, 4), +k.slice(5, 7), 0).getDate(); const venc = `${k}-${pad(Math.min(dia, last))}`;
      const paga = !!(ct.pagas || {})[k]; out.push({ conta: ct, k, venc, paga, vencida: !paga && venc < hoje });
    }
  }
  return out.sort((a, b) => (a.venc < b.venc ? -1 : 1));
}

/**
 * @param p.pessoas   [{ uid, papel, tokens, prefs }]  quem ligou os avisos (prefs: { tipo: false } desliga)
 * @param p.agenda    atendimentos (data, hora, duracao, status)
 * @param p.novidades [{ id, tipo }] itens novos vindos das clientes pelo link (horario, cancelamento, contrato, cadastro, anamnese, avaliacao)
 * @param p.contas, p.privado  para contas e DAS
 * @param p.enviados  { chave: 'AAAA-MM-DD' } o que já foi enviado
 * @param p.agora     Date (horário de Brasília)
 * @returns { msgs: [{ uid, titulo, corpo, tag, url }], marcar: [chave] }
 */
export function planejar({ pessoas, agenda = [], novidades = [], contas = [], privado = {}, enviados = {}, agora }) {
  const hoje = ymd(agora), amanha = addDays(hoje, 1), h = agora.getHours(), min = h * 60 + agora.getMinutes();
  const msgs = [], marcar = new Set();
  const quer = (pe, tipo) => TIPOS[tipo].papeis.includes(pe.papel) && (pe.prefs || {})[tipo] !== false;
  const uma = (chave, fn) => { if (enviados[chave]) return; const r = fn(); if (r) marcar.add(chave); };
  const ativos = a => a.status === 'agendado' || a.status === 'confirmado';

  // novidades pelo link: cada item uma vez só, juntando num aviso por pessoa
  const novas = novidades.filter(n => !enviados['nov|' + n.id]);
  if (novas.length) {
    const cont = {}; novas.forEach(n => { cont[n.tipo] = (cont[n.tipo] || 0) + 1; });
    const partes = [
      cont.horario && plural(cont.horario, 'pedido de horário', 'pedidos de horário'),
      cont.cancelamento && plural(cont.cancelamento, 'cancelamento', 'cancelamentos'),
      cont.contrato && plural(cont.contrato, 'contrato aceito', 'contratos aceitos'),
      cont.cadastro && plural(cont.cadastro, 'cadastro novo', 'cadastros novos'),
      cont.anamnese && plural(cont.anamnese, 'ficha de anamnese', 'fichas de anamnese'),
      cont.avaliacao && plural(cont.avaliacao, 'avaliação nova', 'avaliações novas')
    ].filter(Boolean);
    for (const pe of pessoas) if (quer(pe, 'novidades')) msgs.push({ uid: pe.uid, titulo: 'Novidades das clientes', corpo: partes.join(', ') + '. Toque para ver.', tag: 'novidades', url: '/#inicio' });
    novas.forEach(n => marcar.add('nov|' + n.id));
  }

  // 20h: atendimentos de hoje que já terminaram e não foram concluídos
  if (h >= 20) uma('concluir|' + hoje, () => {
    const n = agenda.filter(a => a.data === hoje && ativos(a) && hm(a.hora) + (+a.duracao || 60) <= min).length;
    if (!n) return true;
    for (const pe of pessoas) if (quer(pe, 'concluir')) msgs.push({ uid: pe.uid, titulo: 'Atendimentos para concluir', corpo: `${plural(n, 'atendimento de hoje ainda não foi concluído', 'atendimentos de hoje ainda não foram concluídos')}. Registre o pagamento no sistema.`, tag: 'concluir', url: '/#inicio' });
    return true;
  });

  // 19h: agenda de amanhã
  if (h >= 19) uma('amanha|' + hoje, () => {
    const am = agenda.filter(a => a.data === amanha && ativos(a)).sort((a, b) => (a.hora < b.hora ? -1 : 1));
    if (!am.length) return true;
    const sem = am.filter(a => a.status === 'agendado').length;
    const corpo = `${plural(am.length, 'atendimento', 'atendimentos')}, o primeiro às ${am[0].hora}.${sem ? ` ${plural(sem, 'cliente ainda não confirmou', 'clientes ainda não confirmaram')}.` : ' Todas confirmadas.'}`;
    for (const pe of pessoas) if (quer(pe, 'amanha')) msgs.push({ uid: pe.uid, titulo: 'Agenda de amanhã', corpo, tag: 'amanha', url: '/#agenda' });
    return true;
  });

  // 8h: contas e DAS
  if (h >= 8) uma('contas|' + hoje, () => {
    const oc = ocorrencias(contas, hoje, hoje).filter(o => !o.paga && o.venc <= hoje);
    const vencidas = oc.filter(o => o.venc < hoje).length, hojeN = oc.length - vencidas;
    const partes = [];
    if (hojeN) partes.push(plural(hojeN, 'conta vence hoje', 'contas vencem hoje'));
    if (vencidas) partes.push(plural(vencidas, 'conta vencida', 'contas vencidas'));
    const dasMes = addMonths(hoje.slice(0, 7), -1), dia = +hoje.slice(8, 10);
    const temMovimento = agenda.length > 0;
    if (temMovimento && !((privado.dasPagos || {})[dasMes]) && [15, 19, 20, 21].includes(dia)) partes.push(`DAS de ${MESES[+dasMes.slice(5) - 1]} ${dia < 20 ? `vence dia 20` : dia === 20 ? 'vence hoje' : 'venceu dia 20'}`);
    if (!partes.length) return true;
    for (const pe of pessoas) if (quer(pe, 'contas')) msgs.push({ uid: pe.uid, titulo: 'Contas a pagar', corpo: partes.join(' · ') + '.', tag: 'contas', url: '/#financeiro' });
    return true;
  });

  // segunda, 8h: resumo da semana que passou (segunda a domingo)
  if (h >= 8 && agora.getDay() === 1) uma('semana|' + hoje, () => {
    const ini = addDays(hoje, -7), fim = addDays(hoje, -1);
    const sem = agenda.filter(a => a.data >= ini && a.data <= fim);
    const feitos = sem.filter(a => a.status === 'concluido').length, faltas = sem.filter(a => a.status === 'faltou').length, canc = sem.filter(a => a.status === 'cancelado').length;
    const prox = agenda.filter(a => a.data >= hoje && a.data <= addDays(hoje, 6) && ativos(a)).length;
    const corpo = `Semana passada: ${plural(feitos, 'atendimento concluído', 'atendimentos concluídos')}${faltas ? `, ${plural(faltas, 'falta', 'faltas')}` : ''}${canc ? `, ${plural(canc, 'cancelamento', 'cancelamentos')}` : ''}. Esta semana: ${plural(prox, 'horário marcado', 'horários marcados')}.`;
    for (const pe of pessoas) if (quer(pe, 'semana')) msgs.push({ uid: pe.uid, titulo: 'Resumo da semana', corpo, tag: 'semana', url: '/#inicio' });
    return true;
  });

  return { msgs, marcar: [...marcar] };
}
