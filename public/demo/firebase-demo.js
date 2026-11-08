// Banco de mentira para o modo demonstração.
// Imita a parte do Firebase (login e Firestore) que o sistema usa. Os dados ficam só neste navegador
// (localStorage), então dá para testar à vontade sem tocar nos dados reais da Stéfany.
const CHAVE = 'smt-demo-banco';
const SAIU = 'smt-demo-saiu';
const USUARIO = { uid: 'demo', email: 'demo@exemplo.com', displayName: 'Demonstração' };

/* ---------- Timestamp e marcadores especiais ---------- */
export class Timestamp {
  constructor(seconds, nanoseconds = 0) { this.seconds = seconds; this.nanoseconds = nanoseconds; }
  static fromMillis(ms) { return new Timestamp(Math.floor(ms / 1000), Math.round((ms % 1000) * 1e6)); }
  static fromDate(d) { return Timestamp.fromMillis(d.getTime()); }
  static now() { return Timestamp.fromMillis(Date.now()); }
  toMillis() { return this.seconds * 1000 + Math.round(this.nanoseconds / 1e6); }
  toDate() { return new Date(this.toMillis()); }
  isEqual(o) { return o instanceof Timestamp && o.toMillis() === this.toMillis(); }
  valueOf() { return String(this.toMillis()).padStart(16, '0'); }
}
const SENT = Symbol('sentinela');
export const serverTimestamp = () => ({ [SENT]: 'ts' });
export const deleteField = () => ({ [SENT]: 'del' });
export const arrayUnion = (...v) => ({ [SENT]: 'union', v });
export const arrayRemove = (...v) => ({ [SENT]: 'remove', v });

/* ---------- guardar e ler ---------- */
const paraTexto = o => JSON.stringify(o, (k, v) => v instanceof Timestamp ? { __ts: v.toMillis() } : v);
const deTexto = s => JSON.parse(s, (k, v) => v && typeof v === 'object' && typeof v.__ts === 'number' && Object.keys(v).length === 1 ? Timestamp.fromMillis(v.__ts) : v);
const copia = o => o === undefined ? undefined : deTexto(paraTexto(o));

function inicial() {
  return { 'sistema/acesso': { donas: [USUARIO.uid], donasInfo: { [USUARIO.uid]: { email: USUARIO.email, nome: 'Demonstração' } }, criadoEm: new Date().toISOString() } };
}
let BANCO;
try { BANCO = deTexto(localStorage.getItem(CHAVE) || 'null'); } catch (e) { BANCO = null; }
if (!BANCO || typeof BANCO !== 'object') BANCO = inicial();
let salvarT;
function gravarLocal() {
  clearTimeout(salvarT);
  salvarT = setTimeout(() => { try { localStorage.setItem(CHAVE, paraTexto(BANCO)); } catch (e) { /* cheio ou bloqueado: segue só na memória */ } }, 150);
}
/** Apaga os dados de demonstração e começa de novo. */
export function recomecarDemo() {
  try { localStorage.removeItem(CHAVE); sessionStorage.removeItem(SAIU); } catch (e) { }
  BANCO = inicial();
}

/* ---------- referências ---------- */
const novoId = () => Array.from(crypto.getRandomValues(new Uint8Array(15)), b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]).join('').slice(0, 20);
const juntar = partes => partes.flatMap(p => String(p).split('/')).filter(Boolean).join('/');
export function collection(base, ...partes) {
  const path = base && base.type === 'doc' ? juntar([base.path, ...partes]) : juntar(partes);
  return { type: 'collection', path, id: path.split('/').pop() };
}
export function doc(base, ...partes) {
  let path;
  if (base && base.type === 'collection') path = juntar([base.path, partes.length ? partes.join('/') : novoId()]);
  else if (base && base.type === 'doc') path = juntar([base.path, ...partes]);
  else path = juntar(partes);
  return { type: 'doc', path, id: path.split('/').pop(), parent: { type: 'collection', path: path.split('/').slice(0, -1).join('/') } };
}
export const where = (campo, op, valor) => ({ campo, op, valor });
export function query(ref, ...filtros) { return { type: 'query', path: ref.path, filtros: [...(ref.filtros || []), ...filtros] }; }

/* ---------- consultas ---------- */
const cmp = v => v instanceof Timestamp ? v.toMillis() : v;
const pegar = (o, campo) => campo.split('.').reduce((x, k) => x == null ? undefined : x[k], o);
function passa(dados, { campo, op, valor }) {
  const a = cmp(pegar(dados, campo)), b = Array.isArray(valor) ? valor.map(cmp) : cmp(valor);
  switch (op) {
    case '==': return a === b; case '!=': return a !== undefined && a !== b;
    case '>=': return a !== undefined && a >= b; case '>': return a !== undefined && a > b;
    case '<=': return a !== undefined && a <= b; case '<': return a !== undefined && a < b;
    case 'in': return b.includes(a); case 'not-in': return a !== undefined && !b.includes(a);
    case 'array-contains': return Array.isArray(a) && a.includes(b);
    case 'array-contains-any': return Array.isArray(a) && a.some(x => b.includes(x));
    default: return true;
  }
}
function fotoDoc(path) {
  const d = BANCO[path]; const id = path.split('/').pop();
  return { id, ref: doc(null, path), exists: () => d !== undefined, data: () => copia(d), get: c => copia(pegar(d || {}, c)) };
}
function fotoConsulta(ref) {
  const n = ref.path.split('/').length + 1;
  const docs = Object.keys(BANCO).filter(p => p.startsWith(ref.path + '/') && p.split('/').length === n)
    .filter(p => (ref.filtros || []).every(f => passa(BANCO[p], f))).sort().map(fotoDoc);
  return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn) };
}

/* ---------- avisar quem está ouvindo ---------- */
const OUVINTES = new Set();
let avisoT = null;
function avisar() {
  if (avisoT) return;
  avisoT = setTimeout(() => { avisoT = null; for (const o of [...OUVINTES]) o.rodar(); }, 0);
}
export function onSnapshot(ref, prox, erro) {
  if (prox && typeof prox === 'object') ({ next: prox, error: erro } = prox);
  let ultimo = null; let antes = new Map();
  const o = {
    rodar() {
      try {
        const f = ref.type === 'doc' ? fotoDoc(ref.path) : fotoConsulta(ref);
        const marca = ref.type === 'doc' ? paraTexto(BANCO[ref.path] ?? null) : paraTexto(f.docs.map(d => [d.id, BANCO[d.ref.path]]));
        if (marca === ultimo) return; ultimo = marca;
        if (ref.type !== 'doc') {
          // como no Firebase: docChanges() lista só o que entrou, mudou ou saiu desde a última vez
          const agora = new Map(f.docs.map(d => [d.id, paraTexto(BANCO[d.ref.path])])); const mud = [];
          f.docs.forEach(d => { const a = antes.get(d.id); if (a === undefined) mud.push({ type: 'added', doc: d }); else if (a !== agora.get(d.id)) mud.push({ type: 'modified', doc: d }); });
          antes.forEach((_, id) => { if (!agora.has(id)) mud.push({ type: 'removed', doc: fotoDoc(ref.path + '/' + id) }); });
          antes = agora; f.docChanges = () => mud;
        }
        prox && prox(f);
      } catch (e) { console.error(e); erro && erro(e); }
    }
  };
  OUVINTES.add(o); setTimeout(() => OUVINTES.has(o) && o.rodar(), 0);
  return () => OUVINTES.delete(o);
}

/* ---------- gravar ---------- */
function resolver(v, antigo) {
  if (v && typeof v === 'object' && v[SENT]) {
    const t = v[SENT];
    if (t === 'ts') return Timestamp.now();
    if (t === 'union') { const a = Array.isArray(antigo) ? [...antigo] : []; v.v.forEach(x => { if (!a.some(y => paraTexto(y) === paraTexto(x))) a.push(x); }); return a; }
    if (t === 'remove') return (Array.isArray(antigo) ? antigo : []).filter(y => !v.v.some(x => paraTexto(x) === paraTexto(y)));
  }
  if (v instanceof Timestamp || v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(x => resolver(x));
  const o = {}; for (const [k, x] of Object.entries(v)) { if (x && x[SENT] === 'del') continue; if (x !== undefined) o[k] = resolver(x, antigo && antigo[k]); } return o;
}
function fundir(alvo, novo) {
  const o = { ...(alvo || {}) };
  for (const [k, v] of Object.entries(novo)) {
    if (v && v[SENT] === 'del') { delete o[k]; continue; }
    if (v === undefined) continue;
    const simples = v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Timestamp) && !v[SENT];
    o[k] = simples ? fundir(o[k] && typeof o[k] === 'object' ? o[k] : {}, v) : resolver(v, o[k]);
  }
  return o;
}
function aplicarSet(path, dados, opc) {
  if (dados == null || typeof dados !== 'object') throw new Error('Dados inválidos');
  BANCO[path] = opc && opc.merge ? fundir(BANCO[path], dados) : resolver(dados);
}
function aplicarUpdate(path, dados) {
  if (BANCO[path] === undefined) { const e = new Error('Documento não existe: ' + path); e.code = 'not-found'; throw e; }
  const d = copia(BANCO[path]);
  for (const [chave, v] of Object.entries(dados)) {
    const ks = chave.split('.'); let o = d;
    for (const k of ks.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
    const k = ks[ks.length - 1];
    if (v && v[SENT] === 'del') delete o[k]; else if (v !== undefined) o[k] = resolver(v, o[k]);
  }
  BANCO[path] = d;
}
const depois = fn => new Promise((ok, falha) => setTimeout(() => { try { fn(); gravarLocal(); avisar(); ok(); } catch (e) { falha(e); } }, 0));
export const setDoc = (ref, dados, opc) => depois(() => aplicarSet(ref.path, dados, opc));
export const updateDoc = (ref, dados) => depois(() => aplicarUpdate(ref.path, dados));
export const deleteDoc = ref => depois(() => { delete BANCO[ref.path]; });
export const getDoc = ref => Promise.resolve(fotoDoc(ref.path));
export const getDocs = ref => Promise.resolve(fotoConsulta(ref));
export async function addDoc(colRef, dados) { const r = doc(colRef); await setDoc(r, dados); return r; }
export function writeBatch() {
  const ops = [];
  const b = {
    set(ref, d, opc) { ops.push(() => aplicarSet(ref.path, d, opc)); return b; },
    update(ref, d) { ops.push(() => aplicarUpdate(ref.path, d)); return b; },
    delete(ref) { ops.push(() => { delete BANCO[ref.path]; }); return b; },
    commit() { return depois(() => { const antes = copia(BANCO); try { ops.forEach(f => f()); } catch (e) { BANCO = antes; throw e; } }); }
  };
  return b;
}

/* ---------- app, banco e login ---------- */
const APP = { name: '[demo]', options: {} };
export const initializeApp = () => APP;
const FS = { type: 'firestore', app: APP, demo: true };
export const initializeFirestore = () => FS;
export const getFirestore = () => FS;
export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});

let saiu = false;
try { saiu = sessionStorage.getItem(SAIU) === '1'; } catch (e) { }
const AUTH = { app: APP, currentUser: saiu ? null : { ...USUARIO } };
const OUV_LOGIN = new Set();
const avisarLogin = () => OUV_LOGIN.forEach(fn => setTimeout(() => fn(AUTH.currentUser), 0));
export const getAuth = () => AUTH;
export function onAuthStateChanged(auth, fn) { OUV_LOGIN.add(fn); setTimeout(() => OUV_LOGIN.has(fn) && fn(AUTH.currentUser), 0); return () => OUV_LOGIN.delete(fn); }
export async function signInWithEmailAndPassword(auth, email, senha) {
  if (!email || !senha) { const e = new Error('Faltou e-mail ou senha'); e.code = 'auth/invalid-credential'; throw e; }
  AUTH.currentUser = { ...USUARIO };
  try { sessionStorage.removeItem(SAIU); } catch (e) { }
  avisarLogin(); return { user: AUTH.currentUser };
}
export async function signOut() {
  AUTH.currentUser = null;
  try { sessionStorage.setItem(SAIU, '1'); } catch (e) { }
  avisarLogin();
}
export async function sendPasswordResetEmail() { }

// Avisos no celular: no modo demonstração não liga de verdade (não há servidor para mandar).
export const mensagensDemo = {
  getMessaging: () => ({}),
  getToken: async () => { throw new Error('No modo demonstração os avisos não são ligados de verdade. Use "Testar neste aparelho" para ver como ficam.'); },
  deleteToken: async () => true,
  suportado: async () => 'Notification' in self && 'serviceWorker' in navigator
};
