// Volta dados de uma cópia de segurança. Roda pelo GitHub: Actions › Restaurar cópia de segurança › Run workflow.
//   RESTAURAR_PASTA       pasta com o pacote baixado da cópia (manifesto.json + <coleção>.NNN.json.gz)
//   RESTAURAR_COLECOES    "todas" ou nomes separados por vírgula (ex.: clientes,agenda)
//   RESTAURAR_DOCUMENTOS  opcional: só estes documentos (ids separados por vírgula), para voltar um item só
//   RESTAURAR_APAGAR      "1" apaga, nas coleções escolhidas, o que foi criado depois da cópia
//   RESTAURAR_APLICAR     "1" grava de verdade; sem isso, só mostra o que mudaria (padrão)
// Antes de gravar, guarda o estado atual dos documentos que vão mudar (pasta "antes"), para dar para desfazer.
import fs from 'node:fs';
import path from 'node:path';
import { conectar, codificar, decodificar, gravarGz, lerGz, resumo, estavel } from './comum.mjs';

const pasta = path.resolve(process.env.RESTAURAR_PASTA || 'copia');
const aplicar = process.env.RESTAURAR_APLICAR === '1';
const apagar = process.env.RESTAURAR_APAGAR === '1';
const lista = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
const pedidas = lista(process.env.RESTAURAR_COLECOES || 'todas');
const soDocs = new Set(lista(process.env.RESTAURAR_DOCUMENTOS));
const manArq = path.join(pasta, 'manifesto.json');
if (!fs.existsSync(manArq)) { console.error('::error::Pacote da cópia não encontrado (falta manifesto.json). Confira o número da execução.'); process.exit(1); }
const man = JSON.parse(fs.readFileSync(manArq, 'utf8'));
const naCopia = Object.keys(man.colecoes);
const colecoes = pedidas.includes('todas') ? naCopia : pedidas;
const faltam = colecoes.filter(c => !naCopia.includes(c));
if (faltam.length) { console.error(`::error::Não estão nesta cópia: ${faltam.join(', ')}. Na cópia: ${naCopia.join(', ')}.`); process.exit(1); }
if (soDocs.size && colecoes.length !== 1) { console.error('::error::Para escolher documentos, informe uma coleção só.'); process.exit(1); }

const { db, F, projeto } = await conectar();
if (man.projeto && man.projeto !== projeto) { console.error(`::error::A cópia é do projeto ${man.projeto} e a chave é do projeto ${projeto}.`); process.exit(1); }

// Estado atual de uma coleção, com as subcoleções, pelo caminho completo.
async function lerAtual(ref, out) {
  for (const d of (await ref.get()).docs) out[d.ref.path] = codificar(d.data(), F);
  for (const d of await ref.listDocuments()) for (const sub of await d.listCollections()) await lerAtual(sub, out);
}
// "Documento" escolhido = o documento da coleção e tudo que está debaixo dele.
const doEscolhido = (c, p) => !soDocs.size || [...soDocs].some(id => p === `${c}/${id}` || p.startsWith(`${c}/${id}/`));

const antesPasta = path.resolve('antes');
fs.mkdirSync(antesPasta, { recursive: true });
const manAntes = { projeto, tipo: 'estado antes da restauração', inicio: new Date().toISOString(), colecoes: {} };
const linhas = [];
let totGravar = 0, totApagar = 0;

for (const c of colecoes) {
  const copia = {};
  for (const f of fs.readdirSync(pasta).filter(f => f.startsWith(c + '.') && f.endsWith('.json.gz')).sort()) Object.assign(copia, lerGz(path.join(pasta, f)));
  const atual = {};
  await lerAtual(db.collection(c), atual);
  const gravar = [];
  let iguais = 0;
  for (const p of Object.keys(copia).filter(p => doEscolhido(c, p))) {
    if (p in atual && estavel(atual[p]) === estavel(copia[p])) iguais++; else gravar.push(p);
  }
  if (soDocs.size) for (const id of soDocs) if (!(`${c}/${id}` in copia)) console.log(`::warning::${c}/${id} não está na cópia.`);
  const novos = apagar ? Object.keys(atual).filter(p => !(p in copia) && doEscolhido(c, p)) : [];
  const voltam = gravar.filter(p => !(p in atual)).length;
  linhas.push(`| ${c} | ${gravar.length - voltam} | ${voltam} | ${iguais} | ${apagar ? novos.length : '—'} |`);
  totGravar += gravar.length; totApagar += novos.length;

  if (!aplicar || (!gravar.length && !novos.length)) continue;
  const mexidos = [...gravar, ...novos].filter(p => p in atual);
  gravarGz(path.join(antesPasta, `${c}.000.json.gz`), Object.fromEntries(mexidos.map(p => [p, atual[p]])));
  manAntes.colecoes[c] = { documentos: mexidos.length, partes: 1 };
  const ops = [...gravar.map(p => ['set', p]), ...novos.map(p => ['del', p])];
  for (let i = 0; i < ops.length; i += 400) {
    const b = db.batch();
    for (const [op, p] of ops.slice(i, i + 400)) { if (op === 'set') b.set(db.doc(p), decodificar(copia[p], F, db)); else b.delete(db.doc(p)); }
    await b.commit();
  }
}

if (aplicar) fs.writeFileSync(path.join(antesPasta, 'manifesto.json'), JSON.stringify(manAntes, null, 2));
resumo([
  aplicar ? '### Restauração aplicada' : '### Restauração · só conferência (nada foi gravado)',
  `Cópia ${man.tipo} de ${new Date(man.inicio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}${soDocs.size ? ` · documentos: ${[...soDocs].join(', ')}` : ''}`,
  '',
  '| Coleção | Voltam ao que era | Voltam a existir | Já iguais | Apagados (criados depois) |', '|---|---|---|---|---|',
  ...linhas,
  '',
  aplicar
    ? `${totGravar + totApagar} documento(s) alterado(s). O estado de antes ficou no pacote **estado-antes-da-restauracao** desta execução; para desfazer, restaure informando o número desta execução.`
    : `Para aplicar, rode de novo com **Aplicar de verdade** marcado. Seriam ${totGravar + totApagar} gravação(ões) (a cota grátis é de 20 mil por dia).`
].join('\n'));
