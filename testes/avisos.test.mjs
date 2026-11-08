// Testa a decisão dos avisos no celular (integracao/admin/avisos-planejar.mjs), sem banco e sem enviar nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planejar } from '../integracao/admin/avisos-planejar.mjs';

const dona = { uid: 'd', papel: 'owner', tokens: ['t1'] };
const recep = { uid: 'r', papel: 'recepcao', tokens: ['t2'] };
const cont = { uid: 'c', papel: 'contador', tokens: ['t3'] };
const em = (dia, h, m = 0) => new Date(2026, 10, dia, h, m);   // novembro de 2026 (dia 9 = segunda)
const ag = (data, hora, status = 'agendado', duracao = 120) => ({ data, hora, status, duracao });

test('19h: agenda de amanhã para quem atende, sem nomes; contador não recebe', () => {
  const r = planejar({ pessoas: [dona, recep, cont], agenda: [ag('2026-11-11', '09:00'), ag('2026-11-11', '14:00', 'confirmado'), ag('2026-11-11', '16:00', 'cancelado')], agora: em(10, 19, 5) });
  const m = r.msgs.filter(x => x.tag === 'amanha');
  assert.deepEqual(m.map(x => x.uid).sort(), ['d', 'r']);
  assert.equal(m[0].corpo, '2 atendimentos, o primeiro às 09:00. 1 cliente ainda não confirmou.');
  assert.ok(r.marcar.includes('amanha|2026-11-10'));
  // antes das 19h, nada; e não repete depois de marcado
  assert.equal(planejar({ pessoas: [dona], agenda: [ag('2026-11-11', '09:00')], agora: em(10, 18) }).msgs.length, 0);
  assert.equal(planejar({ pessoas: [dona], agenda: [ag('2026-11-11', '09:00')], enviados: { 'amanha|2026-11-10': '2026-11-10' }, agora: em(10, 21) }).msgs.length, 0);
});

test('20h: atendimentos de hoje que terminaram e não foram concluídos', () => {
  const r = planejar({ pessoas: [dona], agenda: [ag('2026-11-10', '09:00'), ag('2026-11-10', '13:00', 'confirmado'), ag('2026-11-10', '10:00', 'concluido'), ag('2026-11-10', '19:00')], agora: em(10, 20, 5) });
  const m = r.msgs.find(x => x.tag === 'concluir');
  assert.match(m.corpo, /^2 atendimentos de hoje ainda não foram concluídos/);
});

test('novidades pelo link: cada item uma vez só, juntando num aviso', () => {
  const novidades = [{ id: 'sol:1', tipo: 'cancelamento' }, { id: 'ctr:1', tipo: 'contrato' }, { id: 'ctr:2', tipo: 'contrato' }];
  const r = planejar({ pessoas: [dona, recep, cont], novidades, agora: em(10, 10) });
  const m = r.msgs.filter(x => x.tag === 'novidades');
  assert.equal(m.length, 2);
  assert.equal(m[0].corpo, '1 cancelamento, 2 contratos aceitos. Toque para ver.');
  const r2 = planejar({ pessoas: [dona], novidades, enviados: Object.fromEntries(r.marcar.map(k => [k, '2026-11-10'])), agora: em(10, 11) });
  assert.equal(r2.msgs.length, 0);
});

test('8h: contas vencendo e vencidas, só para proprietária e contador', () => {
  const contas = [{ descricao: 'Aluguel', vencimento: '2026-08-10', recorrente: 'mensal', pagas: { '2026-08': 'x', '2026-09': 'x', '2026-10': 'x' } }, { descricao: 'Internet', vencimento: '2026-11-05', recorrente: 'unica', pagas: {} }];
  const r = planejar({ pessoas: [dona, recep, cont], contas, agora: em(10, 8, 5) });
  const m = r.msgs.filter(x => x.tag === 'contas');
  assert.deepEqual(m.map(x => x.uid).sort(), ['c', 'd']);
  assert.equal(m[0].corpo, '1 conta vence hoje · 1 conta vencida.');
});

test('DAS perto do dia 20 quando não está pago', () => {
  const r = planejar({ pessoas: [dona], agenda: [ag('2026-11-01', '09:00', 'concluido')], privado: { dasPagos: {} }, agora: em(19, 9) });
  assert.match(r.msgs.find(x => x.tag === 'contas').corpo, /DAS de outubro vence dia 20/);
  const pago = planejar({ pessoas: [dona], agenda: [ag('2026-11-01', '09:00', 'concluido')], privado: { dasPagos: { '2026-10': true } }, agora: em(19, 9) });
  assert.equal(pago.msgs.length, 0);
});

test('segunda 8h: resumo da semana só para a proprietária', () => {
  const agenda = [ag('2026-11-03', '09:00', 'concluido'), ag('2026-11-05', '09:00', 'concluido'), ag('2026-11-06', '09:00', 'faltou'), ag('2026-11-10', '09:00')];
  const r = planejar({ pessoas: [dona, recep], agenda, agora: em(9, 8, 5) });
  const m = r.msgs.filter(x => x.tag === 'semana');
  assert.equal(m.length, 1);
  assert.equal(m[0].corpo, 'Semana passada: 2 atendimentos concluídos, 1 falta. Esta semana: 1 horário marcado.');
});

test('quem desligou um tipo não recebe aquele tipo', () => {
  const r = planejar({ pessoas: [{ ...dona, prefs: { amanha: false } }], agenda: [ag('2026-11-11', '09:00')], agora: em(10, 19, 5) });
  assert.equal(r.msgs.length, 0);
  assert.ok(r.marcar.includes('amanha|2026-11-10'));
});

test('pedido de horário pelo espaço da cliente entra nas novidades', () => {
  const r = planejar({ pessoas: [dona], novidades: [{ id: 'sol:9', tipo: 'horario' }], agora: em(10, 10) });
  const m = r.msgs.find(x => x.tag === 'novidades');
  assert.ok(m && /1 pedido de horário/.test(m.corpo));
});
