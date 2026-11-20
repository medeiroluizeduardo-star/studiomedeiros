// Passa por todas as telas do sistema no modo demonstração, no computador (1366) e no celular (390).
// Confere: erro de JavaScript, arquivo que não abre (404), tela em branco e rolagem para o lado.
// As abas vêm do próprio menu do sistema: aba nova entra no teste sozinha.
// Roda no site da Stéfany (public/) e no site montado de cada outro estúdio (negocios/<estudio>).
// Para rodar no computador: cd testes && npm install && npx playwright install chromium && npm run telas
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { iniciar } from './servidor.mjs';
import { montar } from '../integracao/montar.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// require (e não import) para achar o Playwright também pelo NODE_PATH, como na CI.
const { chromium } = createRequire(import.meta.url)('playwright');

let srv, nav, tmp;
// Cada site: nome no teste, primeira linha da marca esperada no topo e o servidor que o serve.
const SITES = [{ nome: 'Stéfany', marca: 'Stéfany' }, { nome: 'Raquel', marca: 'Raquel Zaban', estudio: 'raquel' }];
before(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'sites-'));
  for (const s of SITES) s.srv = s.estudio ? await iniciar(0, (await montar(s.estudio, join(tmp, s.estudio))).saida) : await iniciar();
  srv = SITES[0].srv; nav = await chromium.launch();
});
after(async () => { await nav?.close(); for (const s of SITES) await s.srv?.fechar(); if (tmp) await rm(tmp, { recursive: true, force: true }); });

const TAMANHOS = [['computador', { width: 1366, height: 860 }], ['celular', { width: 390, height: 844 }]];

async function abrir(viewport, srv = SITES[0].srv) {
  const ctx = await nav.newContext({ viewport, serviceWorkers: 'block', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const pg = await ctx.newPage();
  const problemas = [];
  pg.on('pageerror', e => problemas.push('Erro de JavaScript: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) problemas.push('Erro no console: ' + m.text()); });
  pg.on('response', r => { const u = r.url(); if (r.status() >= 400 && u.startsWith(srv.url)) problemas.push(`Arquivo não abriu (${r.status()}): ${u.replace(srv.url, '')}`); });
  pg.on('requestfailed', r => { const u = r.url(); if (u.startsWith(srv.url)) problemas.push('Falhou: ' + u.replace(srv.url, '')); });
  return { ctx, pg, problemas };
}

async function semRolagemLateral(pg, onde) {
  const { sw, w } = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
  assert.ok(sw <= w + 1, `${onde}: a página rola para o lado (${sw}px numa tela de ${w}px)`);
}

for (const site of SITES) for (const [nome, viewport] of TAMANHOS) {
  test(`${site.nome} · sistema no modo demonstração · ${nome}`, async t => {
    const srv = site.srv;
    const { ctx, pg, problemas } = await abrir(viewport, srv);
    try {
      await pg.goto(srv.url + '/?demo');
      await pg.waitForSelector('.demo-faixa', { timeout: 15000 });
      await pg.waitForSelector('#view', { timeout: 15000 });
      // os dados de exemplo entram sozinhos na primeira abertura
      await pg.waitForFunction(() => /Ana Beatriz|Jéssica|Camila/.test(document.body.innerText), null, { timeout: 15000 });
      assert.ok((await pg.$$eval('.brand-name', es => es.map(e => e.textContent))).includes(site.marca), `o nome ${site.marca} não aparece no topo`);
      const abas = await pg.$$eval('#navSide [data-act="go"]', bs => bs.map(b => [b.dataset.v, b.textContent.trim()]));
      assert.ok(abas.length >= 8, `menu com poucas abas (${abas.length})`);
      for (const [v, rotulo] of abas) {
        await t.test(rotulo, async () => {
          const antes = problemas.length;
          await pg.evaluate(v => document.querySelector(`#navSide [data-act="go"][data-v="${v}"]`).click(), v);
          await pg.waitForFunction(v => document.querySelector(`#navSide [data-v="${v}"][aria-current="page"]`), v, { timeout: 5000 });
          await pg.waitForTimeout(250);
          const txt = await pg.$eval('#view', el => el.innerText.trim());
          assert.ok(txt.length > 20, `${rotulo}: tela em branco`);
          await semRolagemLateral(pg, rotulo);
          assert.deepEqual(problemas.slice(antes), [], `${rotulo}: ${problemas.slice(antes).join(' | ')}`);
        });
      }
      assert.deepEqual(problemas, []);
    } finally { await ctx.close(); }
  });

  test(`${site.nome} · catálogo público no modo demonstração · ${nome}`, async () => {
    const srv = site.srv;
    const { ctx, pg, problemas } = await abrir(viewport, srv);
    try {
      await pg.goto(srv.url + '/catalogo?demo');
      await pg.waitForSelector('main', { timeout: 15000 });
      await pg.waitForTimeout(800);
      const txt = await pg.$eval('body', el => el.innerText.trim());
      assert.ok(txt.length > 20, 'catálogo em branco');
      await semRolagemLateral(pg, 'catálogo');
      assert.deepEqual(problemas, []);
    } finally { await ctx.close(); }
  });
}

// Perfis separados: com um Diretor ativo, a proprietária fica só com o dia a dia nas finanças, e o Diretor vê a parte
// administrativa (finanças, contratos e ajustes), sem agenda, clientes, fichas de saúde, estoque e catálogo.
const ESPERADO = {
  proprietaria: { menuTem: ['inicio', 'agenda', 'clientes', 'financeiro', 'estoque', 'juridico', 'ajustes'], menuSem: [], fin: ['caixa', 'sinais', 'serv'] },
  diretor: { menuTem: ['financeiro', 'contratos', 'juridico', 'ajustes'], menuSem: ['inicio', 'agenda', 'clientes', 'estoque', 'catalogo'], fin: ['visao', 'caixa', 'lanc', 'contas', 'sinais', 'mei', 'rel', 'serv'] }
};
for (const [perfil, esp] of Object.entries(ESPERADO)) for (const [nome, viewport] of TAMANHOS) {
  test(`Stéfany · ver como ${perfil} · ${nome}`, async t => {
    const { ctx, pg, problemas } = await abrir(viewport);
    try {
      await pg.goto(srv.url + '/?demo');
      await pg.waitForFunction(() => /Ana Beatriz|Jéssica|Camila/.test(document.body.innerText), null, { timeout: 15000 });
      await pg.waitForTimeout(400);
      await pg.goto(srv.url + '/?demo&perfil=' + perfil);
      await pg.waitForSelector('#navSide [data-act="go"]', { state: 'attached', timeout: 15000 });
      await pg.waitForFunction(() => document.querySelector('#view') && document.querySelector('#view').innerText.trim().length > 20, null, { timeout: 15000 });
      const abas = await pg.$$eval('#navSide [data-act="go"]', bs => bs.map(b => b.dataset.v));
      for (const v of esp.menuTem) assert.ok(abas.includes(v), `${perfil}: falta a aba ${v} (tem ${abas.join(', ')})`);
      for (const v of esp.menuSem) assert.ok(!abas.includes(v), `${perfil}: não devia ver a aba ${v}`);
      for (const v of abas) {
        await t.test(v, async () => {
          const antes = problemas.length;
          await pg.evaluate(v => document.querySelector(`#navSide [data-act="go"][data-v="${v}"]`).click(), v);
          await pg.waitForFunction(v => document.querySelector(`#navSide [data-v="${v}"][aria-current="page"]`), v, { timeout: 5000 });
          await pg.waitForTimeout(200);
          // passa também pelas abas internas (Finanças, Contratos, Ajustes)
          const internas = await pg.$$eval('#view [data-act$="Tab"][data-t]', bs => bs.map(b => [b.dataset.act, b.dataset.t]));
          if (v === 'financeiro') assert.deepEqual(internas.filter(x => x[0] === 'finTab').map(x => x[1]).filter(k => k !== 'repasse'), esp.fin, `${perfil}: abas de Finanças erradas`);
          for (const [act, k] of internas) {
            await pg.evaluate(([act, k]) => { const b = document.querySelector(`#view [data-act="${act}"][data-t="${k}"]`); if (b) b.click(); }, [act, k]);
            await pg.waitForTimeout(150);
            assert.ok((await pg.$eval('#view', el => el.innerText.trim())).length > 20, `${v} › ${k}: tela em branco`);
            await semRolagemLateral(pg, `${v} › ${k}`);
          }
          assert.deepEqual(problemas.slice(antes), [], `${v}: ${problemas.slice(antes).join(' | ')}`);
        });
      }
      assert.deepEqual(problemas, []);
    } finally { await ctx.close(); }
  });
}

// Registro de alterações: mudar os dados do negócio aparece em Jurídico › Quem alterou, com quem fez e o quê.
test('registro de alterações mostra quem mudou o quê', async () => {
  const { ctx, pg, problemas } = await abrir({ width: 1366, height: 860 });
  try {
    await pg.goto(srv.url + '/?demo&perfil=dona');
    await pg.waitForFunction(() => /Ana Beatriz|Jéssica|Camila/.test(document.body.innerText), null, { timeout: 15000 });
    await pg.evaluate(() => document.querySelector('#navSide [data-v="ajustes"]').click());
    await pg.evaluate(() => document.querySelector('#view [data-act="ajTab"][data-t="negocio"]').click());
    await pg.waitForSelector('#gMun');
    await pg.fill('#gMun', 'Vitória - ES');
    await pg.evaluate(() => document.querySelector('#fCfg button.primary').click());
    await pg.waitForTimeout(500);
    await pg.evaluate(() => document.querySelector('#navSide [data-v="juridico"]').click());
    await pg.evaluate(() => document.querySelector('#view [data-act="jurTab"][data-t="registro"]').click());
    await pg.waitForFunction(() => /Dados do negócio.*Vitória - ES/.test(document.querySelector('#view').innerText), null, { timeout: 5000 });
    assert.deepEqual(problemas, []);
  } finally { await ctx.close(); }
});

// A tela se redesenha quando chega novidade de outro aparelho. O que estava sendo digitado (e ainda não foi salvo)
// não pode sumir, e uma caixa aberta não pode fechar sozinha.
test('texto digitado não some quando chega novidade', async () => {
  const { ctx, pg, problemas } = await abrir({ width: 390, height: 844 });
  try {
    await pg.goto(srv.url + '/?demo');
    await pg.waitForFunction(() => /Ana Beatriz|Jéssica|Camila/.test(document.body.innerText), null, { timeout: 15000 });
    const novidade = () => pg.evaluate(async () => {
      const m = await import('/demo/firebase-demo.js');
      await m.setDoc(m.doc(null, 'agenda/teste-' + Math.random().toString(36).slice(2)), { clienteId: '', data: '2030-01-02', hora: '10:00', status: 'agendado', valor: 0 });
      await new Promise(r => setTimeout(r, 300));
    });
    await pg.evaluate(() => document.querySelector('#navSide [data-v="ajustes"]').click());
    await pg.evaluate(() => document.querySelector('#view [data-act="ajTab"][data-t="negocio"]').click());
    await pg.waitForSelector('#gEnd');
    await pg.fill('#gEnd', 'Rua do Teste, 10');
    await novidade();
    assert.equal(await pg.$eval('#gEnd', e => e.value), 'Rua do Teste, 10', 'o endereço digitado sumiu');
    await pg.evaluate(() => document.querySelector('#navSide [data-v="clientes"]').click());
    await pg.evaluate(() => { document.querySelector('#view details').open = true; });
    await novidade();
    assert.ok(await pg.$eval('#view details', d => d.open), 'a caixa aberta fechou sozinha');
    assert.deepEqual(problemas, []);
  } finally { await ctx.close(); }
});
