// Base compartilhada das páginas abertas às clientes (catálogo, contrato e espaço da cliente).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

export const FS = getFirestore(initializeApp(firebaseConfig));
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const BRL = v => (+v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMX = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const pad = n => String(n).padStart(2, '0');
export const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
export const dataBR = s => s ? `${pad(parse(s).getDate())}/${pad(parse(s).getMonth() + 1)}/${String(s).slice(0, 4)}` : '';
export const dataLonga = s => { const d = parse(s); return `${SEMX[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
export const primeiro = n => String(n || '').trim().split(/\s+/)[0] || '';
export const toMs = x => !x ? 0 : typeof x.toMillis === 'function' ? x.toMillis() : x.seconds ? x.seconds * 1000 : Date.parse(x) || 0;
export const digits = s => String(s || '').replace(/\D/g, '');
export function waLink(tel, msg) { let d = digits(tel); if (!d) return null; if (d.length <= 11) d = '55' + d; return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`; }
export const tokenDaUrl = () => decodeURIComponent((location.hash || '').slice(1)).replace(/[^A-Za-z0-9_-]/g, '');

const I = {
  cal: 'M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 5 5z',
  chat: 'M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z', check: 'M5 12.5l4.5 4.5L19 7.5', x: 'M6 6l12 12M18 6 6 18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', down: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  file: 'M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8zM14 3v5h5M8.5 13h7M8.5 16.5h5',
  pen: 'M3 21c3-1 5-3 7-6l7-7a2.1 2.1 0 0 0-3-3l-7 7c-3 2-5 4-6 7zM14 6l4 4', alert: 'M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM9 12l2 2 4-4', gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1s3 1 5 1zM12 7c1.5-3 5-3.5 5-1s-3 1-5 1z',
  image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01', ticket: 'M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a2 2 0 0 1 0-4 2 2 0 0 0 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zM14 6v2M14 11v2M14 16v2',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
  left: 'M15 18l-6-6 6-6', right: 'M9 6l6 6-6 6', lock: 'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11', repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3'
};
export const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[n]}"/></svg>`;
export function braidMark(size = 34) {
  const cols = ['var(--accent)', 'var(--accent-ink)', 'var(--gold)']; let paths = '';
  for (let k = 0; k < 3; k++) { let d = ''; for (let i = 0; i <= 28; i++) { const y = 3 + i * (34 / 28); const x = 14 + 7 * Math.sin(i / 28 * Math.PI * 3 + k * 2 * Math.PI / 3); d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2); } paths += `<path d="${d}" stroke="${cols[k]}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`; }
  return `<svg width="${size * .7}" height="${size}" viewBox="0 0 28 40" aria-hidden="true">${paths}</svg>`;
}
export function marca() {
  return `<header class="pub-top"><img class="marca" src="/img/marca.webp" width="46" height="46" alt="" decoding="async"><div><div class="brand-name">Stéfany</div><div class="brand-sub">Medeiros · Trancista</div></div></header>`;
}
export function toast(m, erro) { const t = document.createElement('div'); t.className = 'toast' + (erro ? ' erro' : ''); t.innerHTML = ic(erro ? 'alert' : 'check'); const sp = document.createElement('span'); sp.textContent = m; t.appendChild(sp); document.body.appendChild(t); setTimeout(() => t.remove(), erro ? 4200 : 2900); }
export const NIVEL_COR = { perola: 'var(--lv-perola)', ouro: 'var(--lv-ouro)', prata: 'var(--lv-prata)', bronze: 'var(--lv-bronze)', nova: 'var(--lv-nova)' };
export function estado(main, titulo, texto, extra = '') { main.innerHTML = `<div class="pub-estado card"><img class="marca" src="/img/marca.webp" width="72" height="72" alt=""><h1 class="page-title" style="font-size:1.5rem">${titulo}</h1><p class="muted" style="margin:0">${texto}</p>${extra}</div>`; }
