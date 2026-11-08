// Testa as rotinas do GitHub (cópia de segurança e restauração) no emulador do Firebase.
// Roda junto com as regras: cd testes && npm run regras
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const ADMIN = fileURLToPath(new URL('../integracao/admin/', import.meta.url));
const PROJ = 'demo-rotinas';
let env, tmp;

before(async () => {
  env = await initializeTestEnvironment({ projectId: PROJ, firestore: { rules: 'service cloud.firestore { match /{d=**} { allow read, write: if false; } }' } });
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rotinas-'));
});
after(async () => { await env?.cleanup(); fs.rmSync(tmp, { recursive: true, force: true }); });

const rodar = (arq, extra) => execFileSync(process.execPath, [path.join(ADMIN, arq)], {
  cwd: tmp, encoding: 'utf8',
  env: { ...process.env, FIREBASE_SERVICE_ACCOUNT: '', GCLOUD_PROJECT: PROJ, GITHUB_STEP_SUMMARY: '', ...extra }
});
const comoAdmin = fn => env.withSecurityRulesDisabled(ctx => fn(ctx.firestore()));

test('cópia de segurança e restauração, com subcoleções e datas', async () => {
  const limite = Timestamp.fromMillis(Date.UTC(2026, 10, 20, 12));
  await env.clearFirestore();
  await comoAdmin(async db => {
    await setDoc(doc(db, 'clientes/c1'), { nome: 'Cliente Um', tags: ['a'] });
    await setDoc(doc(db, 'clientes/c2'), { nome: 'Cliente Dois' });
    await setDoc(doc(db, 'portal/tok/proximos/ag1'), { cancelado: false, limiteCancelamento: limite });
    await setDoc(doc(db, 'catalogoFotos/f1'), { data: 'x' });
    await setDoc(doc(db, 'erros/e1'), { msg: 'teste' });
  });

  const saida = rodar('backup.mjs', { BACKUP_TIPO: 'diaria', BACKUP_PASTA: 'copia' });
  const man = JSON.parse(fs.readFileSync(path.join(tmp, 'copia/manifesto.json'), 'utf8'));
  assert.equal(man.colecoes.clientes.documentos, 2);
  assert.equal(man.colecoes.portal.documentos, 1, 'subcoleção do portal entrou');
  assert.ok(!man.colecoes.catalogoFotos && man.fora.includes('catalogoFotos'), 'fotos só na semanal');
  assert.ok(!man.colecoes.erros, 'erros dos aparelhos não entram');
  assert.match(saida, /documentos lidos/);

  // estragar: muda um, apaga outro, apaga a subcoleção e cria um novo
  await comoAdmin(async db => {
    await setDoc(doc(db, 'clientes/c1'), { nome: 'ERRADO' });
    await deleteDoc(doc(db, 'clientes/c2'));
    await deleteDoc(doc(db, 'portal/tok/proximos/ag1'));
    await setDoc(doc(db, 'clientes/c3'), { nome: 'Criada depois' });
  });

  // só conferir: nada muda
  const conf = rodar('restaurar.mjs', { RESTAURAR_PASTA: 'copia', RESTAURAR_COLECOES: 'clientes,portal', RESTAURAR_APAGAR: '1' });
  assert.match(conf, /só conferência/);
  await comoAdmin(async db => assert.equal((await getDoc(doc(db, 'clientes/c1'))).data().nome, 'ERRADO'));

  // aplicar
  rodar('restaurar.mjs', { RESTAURAR_PASTA: 'copia', RESTAURAR_COLECOES: 'clientes,portal', RESTAURAR_APAGAR: '1', RESTAURAR_APLICAR: '1' });
  await comoAdmin(async db => {
    assert.deepEqual((await getDoc(doc(db, 'clientes/c1'))).data(), { nome: 'Cliente Um', tags: ['a'] });
    assert.equal((await getDoc(doc(db, 'clientes/c2'))).data().nome, 'Cliente Dois');
    assert.equal((await getDoc(doc(db, 'clientes/c3'))).exists(), false);
    const ag = (await getDoc(doc(db, 'portal/tok/proximos/ag1'))).data();
    assert.ok(ag.limiteCancelamento.isEqual(limite), 'data volta como data');
  });
  assert.ok(fs.existsSync(path.join(tmp, 'antes/manifesto.json')), 'guardou o estado de antes');
});

test('restaurar um documento só', async () => {
  await comoAdmin(async db => { await setDoc(doc(db, 'clientes/c1'), { nome: 'Mudou' }); await setDoc(doc(db, 'clientes/c2'), { nome: 'Também mudou' }); });
  rodar('restaurar.mjs', { RESTAURAR_PASTA: 'copia', RESTAURAR_COLECOES: 'clientes', RESTAURAR_DOCUMENTOS: 'c1', RESTAURAR_APLICAR: '1' });
  await comoAdmin(async db => {
    assert.equal((await getDoc(doc(db, 'clientes/c1'))).data().nome, 'Cliente Um');
    assert.equal((await getDoc(doc(db, 'clientes/c2'))).data().nome, 'Também mudou');
  });
});
