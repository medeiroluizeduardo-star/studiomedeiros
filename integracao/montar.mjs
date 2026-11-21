// Monta o site de outro estúdio numa pasta separada, sem mexer em public/ (que é o site da Stéfany).
// Copia public/, põe por cima os arquivos de negocios/<estudio>/ e troca o nome do negócio nas páginas,
// no ícone do celular (manifest) e no aviso padrão (sw.js). As trocas de texto do negocio.js dele valem para
// todas as páginas, scripts e estilos; se sobrar alguma palavra de proibidas, a montagem para com a lista.
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

  // Arquivos que vieram da pasta do estúdio já estão do jeito dele: não recebem trocas.
  const proprios = new Set(await listar(pasta));
  const textos = (await listar(saida)).filter(f => /\.(html|js|mjs|css|webmanifest)$/.test(f));
  const nome = [[base.nome, novo.nome], [base.curto, novo.curto],
    [`"sp-nome">${base.marca[0]}<`, `"sp-nome">${novo.marca[0]}<`], [`"sp-sub">${base.marca[1]}<`, `"sp-sub">${novo.marca[1]}<`]];
  const usadas = new Set();
  for (const f of textos) {
    if (proprios.has(f)) continue;
    const p = join(saida, f); const antes = await readFile(p, 'utf8'); let txt = antes;
    for (const [de, para] of novo.trocas || []) if (txt.includes(de)) { usadas.add(de); txt = txt.split(de).join(para); }
    if (/\.(html|webmanifest)$/.test(f) || f === 'sw.js') for (const [de, para] of nome) txt = txt.split(de).join(para);
    if (txt !== antes) await writeFile(p, txt);
  }
  // Troca que não achou nada = o texto original mudou e a troca precisa ser atualizada.
  const sobrando = (novo.trocas || []).map(([de]) => de).filter(de => !usadas.has(de));
  if (sobrando.length) throw new Error(`Trocas de negocios/${estudio}/negocio.js que não acharam o texto:\n- ${sobrando.join('\n- ')}`);
  // Palavras do outro negócio que não podem aparecer no site deste (linhas só de comentário não contam).
  const achados = [];
  for (const f of textos) {
    if (f === 'negocio.js') continue;
    const linhas = (await readFile(join(saida, f), 'utf8')).split('\n');
    linhas.forEach((l, i) => { if (/^\s*(\/\/|\/\*|\*)/.test(l)) return; for (const w of novo.proibidas || []) if (l.toLowerCase().includes(w.toLowerCase())) achados.push(`${f}:${i + 1} "${w}": ${l.trim().slice(0, 140)}`); });
  }
  if (achados.length) throw new Error(`Sobrou texto do outro negócio no site de ${novo.nome}:\n${achados.slice(0, 60).join('\n')}${achados.length > 60 ? `\n… e mais ${achados.length - 60}` : ''}`);
  return { saida, novo };
}

async function listar(dir, base = '') {
  const out = [];
  for (const e of await readdir(join(dir, base), { withFileTypes: true })) {
    const r = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...await listar(dir, r)); else out.push(r);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [estudio, saida] = process.argv.slice(2);
  if (!estudio || !saida) { console.error('Uso: node integracao/montar.mjs <estudio> <pasta de saída>'); process.exit(1); }
  montar(estudio, saida).then(r => console.log(`Site de ${r.novo.nome} montado em ${r.saida}`)).catch(e => { console.error(e.message); process.exit(1); });
}
