// Ponto único de acesso ao Firebase.
// No modo demonstração (endereço com ?demo, ou a prévia de uma proposta) usa um banco de mentira,
// guardado só neste navegador, com clientes fictícias. Nada é lido nem gravado nos dados reais.
const V = '10.12.2';
const BASE = `https://www.gstatic.com/firebasejs/${V}`;

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
  [app, auth, fs] = await Promise.all([
    import(`${BASE}/firebase-app.js`),
    import(`${BASE}/firebase-auth.js`),
    import(`${BASE}/firebase-firestore.js`)
  ]);
}

export const { initializeApp } = app;
export const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = auth;
export const {
  initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, getDocs, updateDoc, query, where,
  Timestamp, arrayUnion, arrayRemove, deleteField, writeBatch, serverTimestamp
} = fs;
