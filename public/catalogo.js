import { doc, getDoc, getDocs, collection, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FS, $, $$, esc, BRL, ic, braidMark, marca, waLink, estado } from './publico.js';

const main = $('#pub');
const fotos = new Map();
let itens = [], vitrine = {}, filtro = 'todos';

async function carregaFotosDo(el) {
  for (const img of $$('img[data-foto]:not([src])', el)) {
    const id = img.dataset.foto;
    try {
      if (!fotos.has(id)) { const s = await getDoc(doc(FS, 'catalogoFotos', id)); if (s.exists()) fotos.set(id, s.data().data); }
      if (fotos.has(id)) img.src = fotos.get(id);
    } catch (e) { /* foto indisponível */ }
  }
}
const obs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { obs.unobserve(e.target); carregaFotosDo(e.target); } }), { rootMargin: '300px' }) : null;

function render() {
  const cats = [...new Set(itens.map(i => i.categoria).filter(Boolean))];
  const lista = itens.filter(i => filtro === 'todos' || i.categoria === filtro);
  main.innerHTML = `<img class="cat-capa" src="/img/faixa.webp" width="1200" height="552" alt="Stéfany Medeiros" fetchpriority="high">
  <section><div class="eyebrow">Catálogo</div><h1 class="page-title">Escolha seu <em>modelo</em></h1><p class="lede">Veja o tempo médio de cada trança e toque no botão para agendar.</p></section>
  ${cats.length > 1 ? `<div class="cat-filtros">${[['todos', 'Todos'], ...cats.map(c => [c, c])].map(([k, n]) => `<button class="chip" data-f="${esc(k)}" aria-pressed="${filtro === k}">${esc(n)}</button>`).join('')}</div>` : ''}
  ${lista.length ? `<div class="pub-cat">${lista.map((x, i) => `<article class="pub-item" data-id="${x.id}" style="animation-delay:${Math.min(i, 8) * 50}ms">
      <div class="fotos" data-n="${(x.fotos || []).length}">${(x.fotos || []).length ? x.fotos.map(f => `<img data-foto="${esc(f)}" alt="${esc(x.nome)}" ${fotos.has(f) ? `src="${fotos.get(f)}"` : ''}>`).join('') : `<div class="foto-vazia">${braidMark(56)}</div>`}</div>
      ${(x.fotos || []).length > 1 ? `<div class="pontos">${x.fotos.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>` : ''}
      <div class="corpo"><h2>${esc(x.nome)}</h2>
        <div class="row" style="gap:6px">${x.tempo ? `<span class="badge">${ic('clock')}${esc(x.tempo)}</span>` : ''}${x.preco && x.mostrarPreco ? `<span class="badge">a partir de ${BRL(x.preco)}</span>` : ''}</div>
        ${x.descricao ? `<p>${esc(x.descricao)}</p>` : ''}
        <button class="btn primary" data-quero="${x.id}">${ic('chat')}${esc(x.botao || 'Quero este modelo')}</button></div></article>`).join('')}</div>`
      : `<div class="card empty">Nenhum modelo publicado ainda.</div>`}
  <p class="pub-foot">${esc(vitrine.nome || 'Stéfany Medeiros Trancista')}${vitrine.instagram ? ` · Instagram ${esc(vitrine.instagram)}` : ''}${vitrine.municipio ? ` · ${esc(vitrine.municipio)}` : ''}</p>`;
  $$('.pub-item').forEach(el => obs ? obs.observe(el) : carregaFotosDo(el));
  $$('.pub-item .fotos').forEach(f => f.addEventListener('scroll', () => {
    const k = Math.round(f.scrollLeft / f.clientWidth); $$('.pontos i', f.parentElement).forEach((p, j) => p.classList.toggle('on', j === k));
  }, { passive: true }));
}

main.addEventListener('click', e => {
  const f = e.target.closest('[data-f]'); if (f) { filtro = f.dataset.f; render(); return; }
  const q = e.target.closest('[data-quero]'); if (!q) return;
  const x = itens.find(i => i.id === q.dataset.quero); if (!x) return;
  const destino = x.link || waLink(vitrine.whatsapp, `Olá! Vi no catálogo o modelo "${x.nome}" e quero agendar 💕`);
  if (!destino) { q.textContent = 'Fale com o ateliê pelo Instagram'; return; }
  window.open(destino, '_blank', 'noopener');
});

(async () => {
  try {
    const [v, snap] = await Promise.all([getDoc(doc(FS, 'vitrine', 'config')), getDocs(query(collection(FS, 'catalogo'), where('ativo', '==', true)))]);
    vitrine = v.exists() ? v.data() : {};
    itens = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99) || String(a.nome).localeCompare(b.nome));
    render();
  } catch (e) {
    console.error(e);
    estado(main, 'Catálogo indisponível', 'Não foi possível carregar os modelos agora. Verifique a internet e tente de novo.');
  }
})();
