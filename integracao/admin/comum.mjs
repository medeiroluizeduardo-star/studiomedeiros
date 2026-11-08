// Partes comuns das rotinas de administração (rodam no GitHub Actions com a chave de serviço).
import fs from 'node:fs';
import zlib from 'node:zlib';

export async function conectar() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  const { initializeApp, cert } = await import('firebase-admin/app');
  const F = await import('firebase-admin/firestore');
  // Nos testes automáticos (emulador do Firebase), não há chave: usa o projeto de teste.
  if (!sa && process.env.FIRESTORE_EMULATOR_HOST) {
    const projeto = process.env.GCLOUD_PROJECT || 'demo-stefany';
    initializeApp({ projectId: projeto });
    return { db: F.getFirestore(), F, projeto };
  }
  if (!sa) { console.error('::error::Falta o segredo FIREBASE_SERVICE_ACCOUNT.'); process.exit(1); }
  const credencial = JSON.parse(sa);
  initializeApp({ credential: cert(credencial) });
  return { db: F.getFirestore(), F, projeto: credencial.project_id };
}

// Resumo que aparece na página da execução no GitHub.
export function resumo(md) {
  console.log(md.replace(/[*`]/g, ''));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
}

// JSON que guarda também os tipos do Firestore (data/hora, referência, bytes, ponto).
export function codificar(v, F) {
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof F.Timestamp) return { __tipo: 'data', s: v.seconds, n: v.nanoseconds };
  if (v instanceof F.DocumentReference) return { __tipo: 'ref', p: v.path };
  if (v instanceof F.GeoPoint) return { __tipo: 'ponto', lat: v.latitude, lng: v.longitude };
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return { __tipo: 'bytes', b64: Buffer.from(v).toString('base64') };
  if (Array.isArray(v)) return v.map(x => codificar(x, F));
  const o = {};
  for (const [k, x] of Object.entries(v)) o[k] = codificar(x, F);
  return o;
}
export function decodificar(v, F, db) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(x => decodificar(x, F, db));
  switch (v.__tipo) {
    case 'data': return new F.Timestamp(v.s, v.n);
    case 'ref': return db.doc(v.p);
    case 'ponto': return new F.GeoPoint(v.lat, v.lng);
    case 'bytes': return Buffer.from(v.b64, 'base64');
  }
  const o = {};
  for (const [k, x] of Object.entries(v)) o[k] = decodificar(x, F, db);
  return o;
}

export const gravarGz = (arq, obj) => fs.writeFileSync(arq, zlib.gzipSync(JSON.stringify(obj)));
export const lerGz = arq => JSON.parse(zlib.gunzipSync(fs.readFileSync(arq)).toString('utf8'));
export const tamanho = b => (b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
// JSON com as chaves em ordem, para comparar o conteúdo sem depender da ordem dos campos.
export const estavel = v => (v && typeof v === 'object' ? (Array.isArray(v) ? '[' + v.map(estavel).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + estavel(v[k])).join(',') + '}') : JSON.stringify(v));
