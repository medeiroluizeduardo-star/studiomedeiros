// Monta o site de outro estúdio numa pasta separada, sem mexer em public/ (que é o site da Stéfany).
// Copia public/, põe por cima os arquivos de negocios/<estudio>/ e troca o nome do negócio nas páginas,
// no ícone do celular (manifest) e no aviso padrão (sw.js).
// Uso: node integracao/montar.mjs <estudio> <pasta de saída>
import { cp, rm, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

export async function montar(estudio, saida) {
  if (!/^[a-z0-9-]+$/.test(estudio || '')) throw new Error('Nome do estúdio inválido: use letras minúsculas, números e hífen.');
  const pasta = join(RAIZ, 'negocios', estudio);
  try { await stat(join(pasta, 'negocio.js')); } catch { throw new Error(`Falta negocios/${estudio}/negocio.js`); }
  saida = resolve(saida);
  if (saida === resolve(RAIZ, 'public') || saida === resolve(RAIZ)) throw new Error('A pasta de saída não pode ser public/ nem a raiz do repositório.');

  const { NEGOCIO: base } = await import(pathToFileURL(join(RAIZ, 'public', 'negocio.js')).href);
  const { NEGOCIO: novo } = await import(pathToFileURL(join(pasta, 'negocio.js')).href + '?t=' + Date.now());
  const faltam = Object.keys(base).filter(k => !(k in novo));
  if (faltam.length) throw new Error(`negocios/${estudio}/negocio.js sem os campos: ${faltam.join(', ')}`);

  await rm(saida, { recursive: true, force: true });
  await cp(join(RAIZ, 'public'), saida, { recursive: true });
  await cp(pasta, saida, { recursive: true, force: true });

  const trocas = [[base.nome, novo.nome], [base.curto, novo.curto],
    [`"sp-nome">${base.marca[0]}<`, `"sp-nome">${novo.marca[0]}<`], [`"sp-sub">${base.marca[1]}<`, `"sp-sub">${novo.marca[1]}<`]];
  const alvos = (await readdir(saida)).filter(f => /\.(html|webmanifest)$/.test(f) || f === 'sw.js');
  for (const f of alvos) {
    const p = join(saida, f); let txt = await readFile(p, 'utf8');
    for (const [de, para] of trocas) txt = txt.split(de).join(para);
    await writeFile(p, txt);
  }
  return { saida, novo };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [estudio, saida] = process.argv.slice(2);
  if (!estudio || !saida) { console.error('Uso: node integracao/montar.mjs <estudio> <pasta de saída>'); process.exit(1); }
  montar(estudio, saida).then(r => console.log(`Site de ${r.novo.nome} montado em ${r.saida}`)).catch(e => { console.error(e.message); process.exit(1); });
}
