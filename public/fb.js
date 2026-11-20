// Ponto único de acesso ao Firebase.
// No modo demonstração (endereço com ?demo, ou a prévia de uma proposta) usa um banco de mentira,
// guardado só neste navegador, com clientes fictícias. Nada é lido nem gravado nos dados reais.
const V = '10.12.2'; // se mudar, mude também em index.html (pedido antecipado do Firebase)
const BASE = `https://www.gstatic.com/firebasejs/${V}`;
import { appCheckChave } from './firebase-config.js';

function detectarDemo() {
  const q = new URLSearchParams(location.search);
  // Prévia de proposta (canal do Firebase Hosting: projeto--pr12-abc.web.app) sempre abre em demonstração.
  if (/--[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/i.test(location.hostname)) return true;
  try {
    if (q.has('demo')) {
      const on = q.get('demo') !== '0';
      if (on) sessionStorage.setItem('smt-demo', '1'); else sessionStorage.removeItem('smt-demo');
      return on;
    }
    return sessionStorage.getItem('smt-demo') === '1';
  } catch (e) { return q.has('demo') && q.get('demo') !== '0'; }
}
export const DEMO = detectarDemo();

let app, auth, fs;
if (DEMO) {
  const m = await import('./demo/firebase-demo.js');
  app = m; auth = m; fs = m;
} else {
  // As páginas abertas às clientes (catálogo, espaço da cliente, contrato, cadastro) não usam login:
  // não baixam a parte de login do Firebase, e abrem mais rápido no celular delas.
  const publica = /^\/(catalogo|cliente|contrato|cadastro)(\.html)?$/.test(location.pathname);
  let ac;
  [app, auth, fs, ac] = await Promise.all([
    import(`${BASE}/firebase-app.js`),
    publica ? {} : import(`${BASE}/firebase-auth.js`),
    import(`${BASE}/firebase-firestore.js`),
    appCheckChave ? import(`${BASE}/firebase-app-check.js`) : null
  ]);
  // App Check: com a chave do reCAPTCHA preenchida em firebase-config.js, o Firebase só atende pedidos vindos
  // deste site (e não de programas copiando a configuração). Sem a chave, segue como antes.
  if (ac) {
    const ini = app.initializeApp;
    app = { ...app, initializeApp: (...a) => { const x = ini(...a); try { ac.initializeAppCheck(x, { provider: new ac.ReCaptchaV3Provider(appCheckChave), isTokenAutoRefreshEnabled: true }); } catch (e) { console.error('App Check', e); } return x; } };
  }
}

export const { initializeApp } = app;
export const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword } = auth;
export const {
  initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, getDocs, updateDoc, query, where,
  Timestamp, arrayUnion, arrayRemove, deleteField, writeBatch, serverTimestamp
} = fs;

// Avisos no celular (Firebase Cloud Messaging): carregado só quando alguém abre a parte de avisos.
export async function mensagens() {
  if (DEMO) return import('./demo/firebase-demo.js').then(m => m.mensagensDemo);
  const m = await import(`${BASE}/firebase-messaging.js`);
  return { getMessaging: m.getMessaging, getToken: m.getToken, deleteToken: m.deleteToken, suportado: m.isSupported };
}
