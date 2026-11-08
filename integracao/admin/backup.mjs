// Cópia de segurança do Firestore. Roda pelo GitHub (Actions › Cópia de segurança), todo dia de madrugada.
// Cada execução gera um pacote (artefato) com um arquivo por coleção, guardado no GitHub.
//   BACKUP_TIPO = diaria    tudo, menos as fotos do catálogo e os erros dos aparelhos  (guardada 30 dias)
//               = semanal   tudo, inclusive as fotos do catálogo                       (guardada 90 dias)
// Inclui as subcoleções (ex.: portal/{código}/proximos). Cada documento é guardado pelo caminho completo.
// Cada documento lido conta 1 leitura na cota grátis do Firestore (50 mil por dia). O resumo mostra quantas foram.
import fs from 'node:fs';
import path from 'node:path';
import { conectar, codificar, gravarGz, resumo, tamanho } from './comum.mjs';

const tipo = process.env.BACKUP_TIPO || 'diaria';
if (!['diaria', 'semanal'].includes(tipo)) { console.error('::error::BACKUP_TIPO deve ser diaria ou semanal.'); process.exit(1); }
const destino = path.resolve(process.env.BACKUP_PASTA || 'copia');
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

const SO_SEMANAL = ['catalogoFotos'];
const NUNCA = ['erros'];
const entra = c => !NUNCA.includes(c) && (tipo === 'semanal' || !SO_SEMANAL.includes(c));

const { db, F, projeto } = await conectar();
const todas = (await db.listCollections()).map(c => c.id).sort();
const POR_PARTE = 300;
const man = { projeto, tipo, inicio: new Date().toISOString(), colecoes: {}, fora: todas.filter(c => !entra(c)) };
let leituras = 0, bytes = 0;

// Lê uma coleção (e as subcoleções de cada documento) em partes, guardando { caminho: dados }.
async function lerColecao(ref, docs) {
  let ultimo = null;
  for (;;) {
    let q = ref.orderBy(F.FieldPath.documentId()).limit(POR_PARTE);
    if (ultimo) q = q.startAfter(ultimo);
    const s = await q.get();
    if (s.empty) break;
    for (const d of s.docs) {
      docs[d.ref.path] = codificar(d.data(), F);
      for (const sub of await d.ref.listCollections()) await lerColecao(sub, docs);
    }
    leituras += s.size;
    ultimo = s.docs[s.docs.length - 1];
    if (s.size < POR_PARTE) break;
  }
}

for (const c of todas.filter(entra)) {
  const docs = {};
  await lerColecao(db.collection(c), docs);
  // Documentos que existem só por causa de uma subcoleção (sem dados) também são listados.
  for (const d of await db.collection(c).listDocuments()) {
    if (docs[d.path]) continue;
    for (const sub of await d.listCollections()) await lerColecao(sub, docs);
  }
  const caminhos = Object.keys(docs);
  for (let i = 0, parte = 0; i < caminhos.length || parte === 0; i += 500, parte++) {
    const arq = path.join(destino, `${c}.${String(parte).padStart(3, '0')}.json.gz`);
    gravarGz(arq, Object.fromEntries(caminhos.slice(i, i + 500).map(p => [p, docs[p]])));
    bytes += fs.statSync(arq).size;
    man.colecoes[c] = { documentos: caminhos.length, partes: parte + 1 };
    if (!caminhos.length) break;
  }
}
man.fim = new Date().toISOString();
man.leituras = leituras;
fs.writeFileSync(path.join(destino, 'manifesto.json'), JSON.stringify(man, null, 2));

resumo([
  `### Cópia de segurança ${tipo} (${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`,
  `**${leituras.toLocaleString('pt-BR')} documentos lidos** (contam na cota grátis de 50 mil leituras por dia) · pacote com ${tamanho(bytes)}`,
  '',
  '| Coleção | Documentos |', '|---|---|',
  ...Object.entries(man.colecoes).map(([c, x]) => `| ${c} | ${x.documentos.toLocaleString('pt-BR')} |`),
  '',
  man.fora.length ? `Fora desta cópia: ${man.fora.join(', ')}.` : 'Todas as coleções entraram.',
  '',
  'Para voltar dados desta cópia: Actions › **Restaurar cópia de segurança** › Run workflow, informando o número desta execução: `' + (process.env.GITHUB_RUN_ID || '?') + '`.'
].join('\n'));
