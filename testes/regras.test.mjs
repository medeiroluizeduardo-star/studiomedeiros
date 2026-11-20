// Testes das regras de segurança do Firestore (firestore.rules), perfil por perfil, no emulador do Firebase.
// Rodar: cd testes && npm install && npm run regras   (precisa do Java instalado)
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

let env;
const DONA = 'dona', DIRETOR = 'dir', PARCEIRA = 'parc', RECEPCAO = 'recep', CONTADOR = 'cont', INATIVA = 'inat', ESTRANHA = 'estranha';

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-stefany',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') }
  });
});
after(async () => { await env?.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    const futuro = Timestamp.fromMillis(Date.now() + 864e5), passado = Timestamp.fromMillis(Date.now() - 864e5);
    await setDoc(doc(db, 'sistema/acesso'), { donas: [DONA] });
    await setDoc(doc(db, 'equipe', PARCEIRA), { papel: 'parceira', ativo: true });
    await setDoc(doc(db, 'equipe', RECEPCAO), { papel: 'recepcao', ativo: true });
    await setDoc(doc(db, 'equipe', CONTADOR), { papel: 'contador', ativo: true });
    await setDoc(doc(db, 'equipe', DIRETOR), { papel: 'diretor', ativo: true });
    await setDoc(doc(db, 'pedidos', ESTRANHA), { email: 'x@x.com', nome: 'Nova', pedidoEm: '2026-01-01' });
    await setDoc(doc(db, 'equipe', INATIVA), { papel: 'parceira', ativo: false });
    await setDoc(doc(db, 'clientes/c1'), { nome: 'Cliente Teste' });
    await setDoc(doc(db, 'agenda/a1'), { clienteId: 'c1', data: '2026-01-01' });
    await setDoc(doc(db, 'anamneses/c1'), { obs: 'dado de saúde' });
    await setDoc(doc(db, 'lancamentos/l1'), { valor: 10 });
    await setDoc(doc(db, 'catalogo/m1'), { nome: 'Box braids', ativo: true });
    await setDoc(doc(db, 'aceites/s1'), { tipo: 'servico' });
    await setDoc(doc(db, 'aceites/n1'), { tipo: 'anamnese' });
    await setDoc(doc(db, 'contratosLink/tok1'), { status: 'pendente', expiraEm: futuro, nome: 'Cliente Teste' });
    await setDoc(doc(db, 'contratosLink/velho'), { status: 'pendente', expiraEm: passado });
    await setDoc(doc(db, 'portal/p1'), { nome: 'Cliente', avaliaveis: ['a1'] });
    await setDoc(doc(db, 'portal/p1/proximos/a2'), { cancelado: false, limiteCancelamento: futuro });
    await setDoc(doc(db, 'portal/p1/proximos/a3'), { cancelado: false, limiteCancelamento: passado });
  });
});

const db = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

test('quem não entrou: lê só o catálogo, nada de clientes, agenda ou finanças', async () => {
  const a = db(null);
  await assertSucceeds(getDoc(doc(a, 'catalogo/m1')));
  await assertFails(getDoc(doc(a, 'clientes/c1')));
  await assertFails(getDoc(doc(a, 'agenda/a1')));
  await assertFails(getDoc(doc(a, 'lancamentos/l1')));
  await assertFails(setDoc(doc(a, 'catalogo/m2'), { nome: 'x' }));
});

test('conta sem perfil na equipe não vê nada', async () => {
  const e = db(ESTRANHA);
  await assertFails(getDoc(doc(e, 'clientes/c1')));
  await assertFails(getDoc(doc(e, 'equipe', PARCEIRA)));
  await assertSucceeds(getDoc(doc(e, 'equipe', ESTRANHA)));
});

test('ninguém se promove a proprietária', async () => {
  await assertFails(updateDoc(doc(db(PARCEIRA), 'sistema/acesso'), { donas: [DONA, PARCEIRA] }));
  await assertFails(setDoc(doc(db(ESTRANHA), 'sistema/acesso'), { donas: [ESTRANHA] }));
  await assertFails(setDoc(doc(db(PARCEIRA), 'equipe', PARCEIRA), { papel: 'parceira', ativo: true, extra: 1 }));
  await assertSucceeds(updateDoc(doc(db(DONA), 'sistema/acesso'), { donas: [DONA, PARCEIRA] }));
});

test('pedido de acesso: cada um cria o próprio e só com os campos permitidos', async () => {
  await assertSucceeds(setDoc(doc(db(ESTRANHA), 'pedidos', ESTRANHA), { email: 'a@b.c', nome: 'A', pedidoEm: 'x' }));
  await assertFails(setDoc(doc(db(ESTRANHA), 'pedidos', 'outra'), { email: 'a@b.c', nome: 'A', pedidoEm: 'x' }));
  await assertFails(setDoc(doc(db(ESTRANHA), 'pedidos', ESTRANHA), { email: 'a@b.c', papel: 'owner' }));
});

test('perfil inativo perde o acesso', async () => {
  await assertFails(getDoc(doc(db(INATIVA), 'clientes/c1')));
});

test('dados de saúde (anamnese): só proprietária e trancista parceira', async () => {
  await assertSucceeds(getDoc(doc(db(DONA), 'anamneses/c1')));
  await assertSucceeds(getDoc(doc(db(PARCEIRA), 'anamneses/c1')));
  await assertFails(getDoc(doc(db(RECEPCAO), 'anamneses/c1')));
  await assertFails(getDoc(doc(db(CONTADOR), 'anamneses/c1')));
  await assertSucceeds(getDoc(doc(db(RECEPCAO), 'aceites/s1')));
  await assertFails(getDoc(doc(db(RECEPCAO), 'aceites/n1')));
});

test('finanças: proprietária altera, contador(a) só lê, equipe não vê', async () => {
  await assertSucceeds(setDoc(doc(db(DONA), 'lancamentos/l2'), { valor: 5 }));
  await assertSucceeds(getDoc(doc(db(CONTADOR), 'lancamentos/l1')));
  await assertFails(setDoc(doc(db(CONTADOR), 'lancamentos/l2'), { valor: 5 }));
  await assertFails(getDoc(doc(db(PARCEIRA), 'lancamentos/l1')));
  await assertFails(getDoc(doc(db(RECEPCAO), 'lancamentos/l1')));
});

test('clientes e agenda: equipe de atendimento cria e altera, só a proprietária apaga', async () => {
  await assertSucceeds(setDoc(doc(db(RECEPCAO), 'clientes/c2'), { nome: 'Nova' }));
  await assertFails(deleteDoc(doc(db(RECEPCAO), 'clientes/c1')));
  await assertFails(getDoc(doc(db(CONTADOR), 'clientes/c1')));
  await assertSucceeds(getDoc(doc(db(CONTADOR), 'agenda/a1')));
  await assertFails(setDoc(doc(db(CONTADOR), 'agenda/a2'), { data: '2026-01-02' }));
  await assertSucceeds(deleteDoc(doc(db(DONA), 'clientes/c1')));
});

test('aceite de contrato registrado não muda mais', async () => {
  await assertFails(updateDoc(doc(db(DONA), 'aceites/s1'), { tipo: 'outro' }));
});

test('contrato por link: quem tem o link aceita uma vez, dentro da validade, sem mexer em outros campos', async () => {
  const a = db(null);
  const aceite = { nome: 'Cliente Teste', cpf: '', meio: 'concordo', em: serverTimestamp(), dispositivo: 'teste' };
  await assertSucceeds(getDoc(doc(a, 'contratosLink/tok1')));
  await assertFails(getDocs(collection(a, 'contratosLink')));
  await assertFails(updateDoc(doc(a, 'contratosLink/tok1'), { status: 'aceito', aceite, nome: 'Outro nome' }));
  await assertFails(updateDoc(doc(a, 'contratosLink/velho'), { status: 'aceito', aceite }));
  await assertSucceeds(updateDoc(doc(a, 'contratosLink/tok1'), { status: 'aceito', aceite }));
  await assertFails(updateDoc(doc(a, 'contratosLink/tok1'), { status: 'aceito', aceite: { ...aceite, nome: 'Trocado' } }));
});

test('espaço da cliente: abre pelo link, não dá para listar, cancela só dentro do prazo', async () => {
  const a = db(null);
  await assertSucceeds(getDoc(doc(a, 'portal/p1')));
  await assertFails(getDocs(collection(a, 'portal')));
  await assertFails(updateDoc(doc(a, 'portal/p1/proximos/a3'), { cancelado: true, canceladoEm: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(a, 'portal/p1/proximos/a2'), { cancelado: true, canceladoEm: serverTimestamp() }));
});

test('avaliação: só de atendimento liberado no espaço e com nota de 1 a 5', async () => {
  const a = db(null);
  const av = (ag, nota) => ({ token: 'p1', agendaId: ag, nota, texto: 'Amei', autorizaPublicar: true, nomeExibicao: 'C.', servico: 'Box', em: serverTimestamp() });
  await assertFails(setDoc(doc(a, 'avaliacoes/p1_a1'), av('a1', 9)));
  await assertFails(setDoc(doc(a, 'avaliacoes/p1_zz'), av('zz', 5)));
  await assertSucceeds(setDoc(doc(a, 'avaliacoes/p1_a1'), av('a1', 5)));
  await assertFails(getDoc(doc(a, 'avaliacoes/p1_a1')));
});

test('avaliação: a cliente edita a dela, volta para revisão e não mexe no resto', async () => {
  const a = db(null);
  await assertSucceeds(setDoc(doc(a, 'avaliacoes/p1_a1'), { token: 'p1', agendaId: 'a1', nota: 5, texto: 'Amei', autorizaPublicar: true, nomeExibicao: 'C.', servico: 'Box', em: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(db(DONA), 'avaliacoes/p1_a1'), { publicado: true, visto: true }));
  const ed = { nota: 4, texto: 'Gostei muito', autorizaPublicar: false, nomeExibicao: '', editadoEm: serverTimestamp(), visto: false, publicado: false };
  await assertFails(updateDoc(doc(a, 'avaliacoes/p1_a1'), { ...ed, nota: 7 }));
  await assertFails(updateDoc(doc(a, 'avaliacoes/p1_a1'), { ...ed, publicado: true }));
  await assertFails(updateDoc(doc(a, 'avaliacoes/p1_a1'), { ...ed, visto: true }));
  await assertFails(updateDoc(doc(a, 'avaliacoes/p1_a1'), { ...ed, servico: 'Outro' }));
  await assertFails(updateDoc(doc(a, 'avaliacoes/p1_a1'), { ...ed, agendaId: 'zz' }));
  await assertSucceeds(updateDoc(doc(a, 'avaliacoes/p1_a1'), ed));
  await assertFails(deleteDoc(doc(a, 'avaliacoes/p1_a1')));
});

test('qualquer coleção fora da lista fica fechada', async () => {
  await assertFails(setDoc(doc(db(DONA), 'qualquer/x'), { a: 1 }));
  await assertFails(getDoc(doc(db(DONA), 'qualquer/x')));
});

test('erros nos aparelhos: equipe grava só os próprios; só a proprietária lê e apaga', async () => {
  const erro = uid => ({ quando: serverTimestamp(), uid, msg: 'TypeError: x', onde: 'app.js:10', tela: 'agenda', versao: 'smt-v10', aparelho: 'Android 14', vezes: 1 });
  await assertSucceeds(setDoc(doc(db(RECEPCAO), 'erros/e1'), erro(RECEPCAO)));
  await assertFails(setDoc(doc(db(RECEPCAO), 'erros/e2'), erro(PARCEIRA)));
  await assertFails(setDoc(doc(db(ESTRANHA), 'erros/e3'), erro(ESTRANHA)));
  await assertFails(setDoc(doc(db(null), 'erros/e4'), erro('x')));
  await assertFails(setDoc(doc(db(RECEPCAO), 'erros/e5'), { ...erro(RECEPCAO), senha: '123' }));
  await assertFails(setDoc(doc(db(RECEPCAO), 'erros/e6'), { ...erro(RECEPCAO), msg: 'x'.repeat(301) }));
  await assertFails(getDoc(doc(db(RECEPCAO), 'erros/e1')));
  await assertFails(updateDoc(doc(db(RECEPCAO), 'erros/e1'), { vezes: 2 }));
  await assertSucceeds(getDoc(doc(db(DONA), 'erros/e1')));
  await assertSucceeds(deleteDoc(doc(db(DONA), 'erros/e1')));
});

test('avisos no celular: cada pessoa da equipe mexe só nos próprios; estado da rotina só a proprietária lê', async () => {
  await assertSucceeds(setDoc(doc(db(RECEPCAO), 'avisos', RECEPCAO), { tokens: ['t'], prefs: { amanha: false } }));
  await assertSucceeds(getDoc(doc(db(RECEPCAO), 'avisos', RECEPCAO)));
  await assertFails(setDoc(doc(db(RECEPCAO), 'avisos', PARCEIRA), { tokens: ['t'] }));
  await assertFails(getDoc(doc(db(PARCEIRA), 'avisos', RECEPCAO)));
  await assertFails(setDoc(doc(db(ESTRANHA), 'avisos', ESTRANHA), { tokens: ['t'] }));
  await assertFails(setDoc(doc(db(INATIVA), 'avisos', INATIVA), { tokens: ['t'] }));
  await assertSucceeds(getDoc(doc(db(DONA), 'avisosEstado/estado')));
  await assertFails(getDoc(doc(db(RECEPCAO), 'avisosEstado/estado')));
  await assertFails(setDoc(doc(db(DONA), 'avisosEstado/estado'), { enviados: {} }));
});

// O sistema lê agenda e lançamentos só a partir de um corte de data (histórico sob demanda).
test('agenda e lançamentos a partir de uma data: cada perfil lê o que já podia ler', async () => {
  const desde = (uid, c) => getDocs(query(collection(db(uid), c), where('data', '>=', '2025-01-01')));
  for (const uid of [DONA, PARCEIRA, RECEPCAO, CONTADOR]) await assertSucceeds(desde(uid, 'agenda'));
  for (const uid of [DONA, CONTADOR]) await assertSucceeds(desde(uid, 'lancamentos'));
  for (const uid of [PARCEIRA, RECEPCAO, null]) await assertFails(desde(uid, 'lancamentos'));
  await assertFails(desde(null, 'agenda'));
});

test('espaço da cliente: confirmar presença e pedir horário livre, só com o link e só os campos previstos', async () => {
  const a = db(null); const s = () => doc(collection(a, 'solicitacoes'));
  const base = { token: 'p1', criadoEm: serverTimestamp(), motivo: '' };
  // confirmação: só de horário que existe no espaço e não foi cancelado (mesmo depois do prazo de cancelar)
  await assertSucceeds(setDoc(s(), { ...base, agendaId: 'a3', tipo: 'confirmacao' }));
  await assertFails(setDoc(s(), { ...base, agendaId: 'nao-existe', tipo: 'confirmacao' }));
  await assertFails(setDoc(s(), { ...base, token: 'outro', agendaId: 'a2', tipo: 'confirmacao' }));
  await assertFails(setDoc(s(), { ...base, agendaId: 'a2', tipo: 'confirmacao', extra: 1 }));
  // cancelamento continua preso ao prazo
  await assertFails(setDoc(s(), { ...base, agendaId: 'a3', tipo: 'cancelamento' }));
  // pedido de horário: precisa de um espaço válido e do formato certo
  const pedido = { data: '2026-12-01', hora: '09:00', servico: 'Box braids', servicoId: 's1', duracao: 300 };
  await assertSucceeds(setDoc(s(), { ...base, agendaId: '', tipo: 'horario', pedido }));
  await assertFails(setDoc(s(), { ...base, token: 'inexistente', agendaId: '', tipo: 'horario', pedido }));
  await assertFails(setDoc(s(), { ...base, agendaId: '', tipo: 'horario', pedido: { ...pedido, nome: 'x' } }));
  await assertFails(setDoc(s(), { ...base, agendaId: '', tipo: 'horario', pedido: { ...pedido, duracao: '300' } }));
  await assertFails(setDoc(s(), { ...base, agendaId: '', tipo: 'outro', pedido }));
  await assertFails(getDocs(collection(a, 'solicitacoes')));
});

test('horários livres: todos leem; equipe de atendimento grava; contador(a) e visitante não', async () => {
  const h = { ligado: true, dias: [{ d: '2026-12-01', livres: [{ i: 540, f: 720 }] }], servicos: [{ id: 'm1', nome: 'Box', dur: 300 }], atualizadoEm: 'x' };
  await assertSucceeds(setDoc(doc(db(RECEPCAO), 'vitrine/horarios'), h));
  await assertSucceeds(setDoc(doc(db(PARCEIRA), 'vitrine/horarios'), h));
  await assertSucceeds(getDoc(doc(db(null), 'vitrine/horarios')));
  await assertFails(setDoc(doc(db(null), 'vitrine/horarios'), h));
  await assertFails(setDoc(doc(db(CONTADOR), 'vitrine/horarios'), h));
  await assertFails(setDoc(doc(db(RECEPCAO), 'vitrine/horarios'), { ...h, clientes: ['Ana'] }));
  await assertFails(setDoc(doc(db(RECEPCAO), 'vitrine/config'), { nome: 'x' }));
});

test('diretor: finanças, contratos e dados do negócio; sem fichas de saúde, estoque, preços e catálogo', async () => {
  const d = db(DIRETOR);
  // finanças com edição
  await assertSucceeds(getDoc(doc(d, 'lancamentos/l1')));
  await assertSucceeds(setDoc(doc(d, 'lancamentos/l2'), { valor: 5 }));
  await assertSucceeds(setDoc(doc(d, 'contas/c1'), { descricao: 'Aluguel' }));
  await assertSucceeds(setDoc(doc(d, 'privado/config'), { das: 80 }));
  await assertSucceeds(setDoc(doc(d, 'publico/config'), { nome: 'Ateliê' }));
  // consulta clientes e agenda, mas não altera
  await assertSucceeds(getDoc(doc(d, 'clientes/c1')));
  await assertSucceeds(getDoc(doc(d, 'agenda/a1')));
  await assertFails(setDoc(doc(d, 'clientes/c2'), { nome: 'x' }));
  await assertFails(updateDoc(doc(d, 'agenda/a1'), { valor: 1 }));
  // dados de saúde, estoque, preços e catálogo ficam fora
  await assertFails(getDoc(doc(d, 'anamneses/c1')));
  await assertFails(getDoc(doc(d, 'aceites/n1')));
  await assertSucceeds(getDoc(doc(d, 'aceites/s1')));
  await assertFails(getDoc(doc(d, 'estoque/e1')));
  await assertFails(setDoc(doc(d, 'servicos/s1'), { nome: 'Box', preco: 1 }));
  await assertFails(setDoc(doc(d, 'catalogo/m2'), { nome: 'x' }));
  // contratos por link
  await assertSucceeds(getDocs(collection(d, 'contratosLink')));
  await assertSucceeds(setDoc(doc(d, 'contratosLink/tok2'), { status: 'pendente', expiraEm: Timestamp.fromMillis(Date.now() + 864e5) }));
  // erros dos aparelhos
  await assertSucceeds(getDocs(collection(d, 'erros')));
});

test('diretor: aprova acessos comuns, mas não o próprio, outro diretor nem proprietária', async () => {
  const d = db(DIRETOR);
  await assertSucceeds(getDocs(collection(d, 'pedidos')));
  await assertSucceeds(getDocs(collection(d, 'equipe')));
  await assertSucceeds(setDoc(doc(d, 'equipe', ESTRANHA), { papel: 'recepcao', ativo: true }));
  await assertSucceeds(deleteDoc(doc(d, 'pedidos', ESTRANHA)));
  await assertSucceeds(updateDoc(doc(d, 'equipe', RECEPCAO), { papel: 'contador' }));
  await assertFails(updateDoc(doc(d, 'equipe', PARCEIRA), { papel: 'diretor' }));
  await assertFails(setDoc(doc(d, 'equipe', 'novo'), { papel: 'diretor', ativo: true }));
  await assertFails(updateDoc(doc(d, 'equipe', DIRETOR), { papel: 'parceira' }));
  await assertFails(deleteDoc(doc(d, 'equipe', DIRETOR)));
  await assertFails(updateDoc(doc(d, 'sistema/acesso'), { donas: [DONA, DIRETOR] }));
  // a proprietária continua definindo qualquer perfil, inclusive o de diretor
  await assertSucceeds(setDoc(doc(db(DONA), 'equipe', 'novo'), { papel: 'diretor', ativo: true }));
  // as outras pessoas da equipe continuam sem ver a equipe
  await assertFails(getDocs(collection(db(RECEPCAO), 'equipe')));
});

test('jurídico: só proprietária e diretor', async () => {
  await assertSucceeds(setDoc(doc(db(DIRETOR), 'juridico/alvara'), { tipo: 'documento', nome: 'Alvará', validade: '2027-01-01' }));
  await assertSucceeds(getDoc(doc(db(DONA), 'juridico/alvara')));
  for (const u of [PARCEIRA, RECEPCAO, CONTADOR, ESTRANHA, null]) {
    await assertFails(getDoc(doc(db(u), 'juridico/alvara')));
    await assertFails(setDoc(doc(db(u), 'juridico/x'), { nome: 'x' }));
  }
});

test('registro de alterações: grava em nome próprio, ninguém altera nem apaga, só proprietária e diretor leem', async () => {
  const linha = uid => ({ quem: uid, nome: 'Fulana', col: 'servicos', docId: 's1', acao: 'alterou', resumo: 'Serviço "Box": preço R$ 280 → R$ 300', em: serverTimestamp() });
  await assertSucceeds(setDoc(doc(db(PARCEIRA), 'registro/r1'), linha(PARCEIRA)));
  await assertSucceeds(setDoc(doc(db(DONA), 'registro/r2'), linha(DONA)));
  await assertFails(setDoc(doc(db(RECEPCAO), 'registro/r3'), linha(DONA)));
  await assertFails(setDoc(doc(db(PARCEIRA), 'registro/r4'), { ...linha(PARCEIRA), em: Timestamp.fromMillis(Date.now() - 864e5) }));
  await assertFails(setDoc(doc(db(PARCEIRA), 'registro/r5'), { ...linha(PARCEIRA), acao: 'apagou tudo' }));
  await assertFails(setDoc(doc(db(PARCEIRA), 'registro/r6'), { ...linha(PARCEIRA), extra: 1 }));
  await assertFails(setDoc(doc(db(CONTADOR), 'registro/r7'), linha(CONTADOR)));
  await assertSucceeds(getDoc(doc(db(DIRETOR), 'registro/r1')));
  await assertSucceeds(getDoc(doc(db(DONA), 'registro/r1')));
  await assertFails(getDoc(doc(db(PARCEIRA), 'registro/r1')));
  await assertFails(updateDoc(doc(db(DONA), 'registro/r1'), { resumo: 'outra coisa' }));
  await assertFails(deleteDoc(doc(db(DONA), 'registro/r1')));
  await assertFails(deleteDoc(doc(db(DIRETOR), 'registro/r1')));
});
