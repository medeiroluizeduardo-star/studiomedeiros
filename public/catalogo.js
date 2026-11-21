import { doc, getDoc, getDocs, collection, query, where } from './fb.js';
import { FS, $, $$, esc, BRL, ic, braidMark, marca, waLink, estado, horariosPara, dataLonga, parse, NEGOCIO } from './publico.js';

const main = $('#pub');
const fotos = new Map();
let itens = [], vitrine = {}, filtro = 'todos', depo = null, HOR = null;
const IND = (new URLSearchParams(location.search).get('ind') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

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
  main.innerHTML = `<img class="cat-capa" src="/img/faixa.webp" width="1200" height="552" alt="${esc(NEGOCIO.nome)}" fetchpriority="high">
  <section><div class="eyebrow">Catálogo</div><h1 class="page-title">Escolha seu <em>modelo</em></h1><p class="lede">Veja o tempo médio de cada trança e toque no botão para agendar.</p></section>
  ${IND ? `<div class="ind-banner">${ic('gift')}<div class="small">Você veio por indicação de uma cliente 💕 ${vitrine.indBenefNova ? `Ganhe <b>${esc(vitrine.indBenefNova)}</b>.` : ''} Seu código <b>${esc(IND)}</b> já vai junto na mensagem.</div></div>` : ''}
  ${depo && (depo.lista || []).length ? `<section><div class="eyebrow">Quem fez, amou${depo.media ? ` · ${String(depo.media).replace('.', ',')} ★ em ${depo.total} avaliaç${depo.total === 1 ? 'ão' : 'ões'}` : ''}</div><div class="depo" style="margin-top:8px">${depo.lista.slice(0, 6).map(d => `<article><span class="estrelas">${'★'.repeat(d.nota)}${'☆'.repeat(5 - d.nota)}</span><p>"${esc(d.texto)}"</p><span class="small muted">${esc(d.nome)}${d.servico ? ` · ${esc(d.servico)}` : ''}</span></article>`).join('')}</div></section>` : ''}
  ${cats.length > 1 ? `<div class="cat-filtros">${[['todos', 'Todos'], ...cats.map(c => [c, c])].map(([k, n]) => `<button class="chip" data-f="${esc(k)}" aria-pressed="${filtro === k}">${esc(n)}</button>`).join('')}</div>` : ''}
  ${lista.length ? `<div class="pub-cat">${lista.map((x, i) => `<article class="pub-item" data-id="${x.id}" style="animation-delay:${Math.min(i, 8) * 50}ms">
      <div class="fotos" data-n="${(x.fotos || []).length}">${(x.fotos || []).length ? x.fotos.map(f => `<img data-foto="${esc(f)}" alt="${esc(x.nome)}" ${fotos.has(f) ? `src="${fotos.get(f)}"` : ''}>`).join('') : `<div class="foto-vazia">${braidMark(56)}</div>`}</div>
      ${(x.fotos || []).length > 1 ? `<div class="pontos">${x.fotos.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>` : ''}
      <div class="corpo"><h2>${esc(x.nome)}</h2>
        <div class="row" style="gap:6px">${x.tempo ? `<span class="badge">${ic('clock')}${esc(x.tempo)}</span>` : ''}${x.preco && x.mostrarPreco ? `<span class="badge">a partir de ${BRL(x.preco)}</span>` : ''}</div>
        ${x.descricao ? `<p>${esc(x.descricao)}</p>` : ''}
        ${antesDepois(x)}
        <div class="acoes-item"><button class="btn primary" data-quero="${x.id}">${ic('chat')}${esc(x.botao || 'Quero este modelo')}</button>${durDe(x) ? `<button class="btn soft" data-horarios="${x.id}">${ic('clock')}Horários livres</button>` : ''}</div></div></article>`).join('')}</div>`
      : `<div class="card empty">Nenhum modelo publicado ainda.</div>`}
  <p class="pub-foot">${esc(vitrine.nome || NEGOCIO.nome)}${vitrine.instagram ? ` · Instagram ${esc(vitrine.instagram)}` : ''}${vitrine.municipio ? ` · ${esc(vitrine.municipio)}` : ''}</p>`;
  $$('.pub-item').forEach(el => obs ? obs.observe(el) : carregaFotosDo(el));
  $$('.pub-item .fotos').forEach(f => f.addEventListener('scroll', () => {
    const k = Math.round(f.scrollLeft / f.clientWidth); $$('.pontos i', f.parentElement).forEach((p, j) => p.classList.toggle('on', j === k));
  }, { passive: true }));
}

function antesDepois(x) {
  const L = (x.antesDepois || []).filter(p => p.a && p.d); if (!L.length) return '';
  return `<details class="how ad"><summary>Antes e depois (${L.length})</summary><div class="ad-lista">${L.map(p => `<div class="ad-par"><figure><img data-adfoto="${esc(p.a)}" alt="Antes"><figcaption>antes</figcaption></figure><figure><img data-adfoto="${esc(p.d)}" alt="Depois"><figcaption>depois</figcaption></figure></div>`).join('')}</div></details>`;
}
// Fotos de antes e depois só são baixadas quando a cliente abre a seção.
main.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('details.ad') || !d.open) return; $$('img[data-adfoto]', d).forEach(i => { i.dataset.foto = i.dataset.adfoto; delete i.dataset.adfoto; }); carregaFotosDo(d); }, true);
const durDe = x => { const s = HOR && (HOR.servicos || []).find(v => v.id === x.id); return s ? s.dur : 0; };
function abrirHorarios(id, dia) {
  const x = itens.find(i => i.id === id); if (!x) return; const dias = horariosPara(HOR, durDe(x));
  const d0 = dias.find(z => z.d === dia) || dias[0];
  let back = $('.sheet-back.hor'); if (!back) { back = document.createElement('div'); back.className = 'sheet-back hor'; document.body.appendChild(back); document.body.style.overflow = 'hidden'; }
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Horários livres"><div class="grab"></div><div class="sheet-head"><h2>Horários livres</h2><button class="icon-btn" data-fechar aria-label="Fechar">${ic('x')}</button></div>
   <div class="form"><p class="small muted" style="margin:0">${esc(x.nome)} · próximas 2 semanas. Toque num horário para pedir pelo WhatsApp.</p>
   ${d0 ? `<div class="chips hor-dias">${dias.map(z => { const d = parse(z.d); return `<button class="chip" data-hdia="${z.d}" aria-pressed="${z.d === d0.d}">${dataLonga(z.d).split(',')[0].slice(0, 3)} ${d.getDate()}/${d.getMonth() + 1}</button>`; }).join('')}</div>
    <div class="chips hor-horas">${d0.horas.map(h => `<button class="chip" data-hora="${h}" data-d="${d0.d}">${h}</button>`).join('')}</div>` : '<div class="empty">Sem horários livres para este modelo nas próximas semanas. Chame no WhatsApp para entrar na lista de espera.</div>'}</div></div>`;
  back.onclick = e => {
    if (e.target === back || e.target.closest('[data-fechar]')) { back.remove(); document.body.style.overflow = ''; return; }
    const b = e.target.closest('[data-hdia]'); if (b) { abrirHorarios(id, b.dataset.hdia); return; }
    const h = e.target.closest('[data-hora]'); if (!h) return;
    let msg = `Olá! Vi no catálogo o modelo "${x.nome}" e quero pedir o horário de ${dataLonga(h.dataset.d)} às ${h.dataset.hora} 💕`; if (IND) msg += `\nCódigo de indicação: ${IND}`;
    const w = waLink(vitrine.whatsapp, msg); if (w) window.open(w, '_blank', 'noopener'); else h.textContent = 'Fale com o ateliê pelo Instagram';
  };
}

main.addEventListener('click', e => {
  const hb = e.target.closest('[data-horarios]'); if (hb) { abrirHorarios(hb.dataset.horarios); return; }
  const f = e.target.closest('[data-f]'); if (f) { filtro = f.dataset.f; render(); return; }
  const q = e.target.closest('[data-quero]'); if (!q) return;
  const x = itens.find(i => i.id === q.dataset.quero); if (!x) return;
  let destino = x.link || waLink(vitrine.whatsapp, `Olá! Vi no catálogo o modelo "${x.nome}" e quero agendar 💕`);
  if (destino && IND) { try { const u = new URL(destino); const t = u.searchParams.get('text') || `Olá! Vi no catálogo o modelo "${x.nome}" e quero agendar 💕`; u.searchParams.set('text', `${t}\nCódigo de indicação: ${IND}`); destino = u.toString(); } catch (e) { } }
  if (!destino) { q.textContent = 'Fale com o ateliê pelo Instagram'; return; }
  window.open(destino, '_blank', 'noopener');
});

(async () => {
  try {
    const [v, snap, dp, hr] = await Promise.all([getDoc(doc(FS, 'vitrine', 'config')), getDocs(query(collection(FS, 'catalogo'), where('ativo', '==', true))), getDoc(doc(FS, 'vitrine', 'depoimentos')).catch(() => null), getDoc(doc(FS, 'vitrine', 'horarios')).catch(() => null)]);
    HOR = hr && hr.exists() && hr.data().ligado !== false && (hr.data().dias || []).length ? hr.data() : null;
    depo = dp && dp.exists() ? dp.data() : null;
    vitrine = v.exists() ? v.data() : {};
    itens = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99) || String(a.nome).localeCompare(b.nome));
    render();
  } catch (e) {
    console.error(e);
    estado(main, 'Catálogo indisponível', 'Não foi possível carregar os modelos agora. Verifique a internet e tente de novo.');
  }
})();
