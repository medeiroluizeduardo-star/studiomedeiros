import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FS, $, esc, BRL, ic, marca, waLink, estado, dataBR, primeiro, toMs, digits, tokenDaUrl, toast } from './publico.js';

const main = $('#pub');
const token = tokenDaUrl();
const ref = token ? doc(FS, 'contratosLink', token) : null;
let L = null, meio = 'assinatura', tinta = false;

const expirado = l => l.status !== 'aceito' && toMs(l.expiraEm) && toMs(l.expiraEm) < Date.now();
const quando = l => l.data ? ` em ${dataBR(l.data)}${l.hora ? ` às ${esc(l.hora)}` : ''}` : '';

function render() {
  const a = L.atelie || {}; const ac = L.aceite || {};
  const wa = waLink(a.whatsapp, `Oi! Sou ${L.nome}. Estou com uma dúvida sobre o contrato do meu atendimento.`);
  let topo = '';
  if (L.status === 'aceito') {
    topo = `<section class="card stack" style="gap:10px"><div class="row"><span class="badge good">${ic('check')}Contrato aceito</span></div>
      <p style="margin:0">Aceito por <b>${esc(ac.nome)}</b> em ${new Date(toMs(ac.em)).toLocaleString('pt-BR')}, ${ac.meio === 'assinatura' ? 'com assinatura' : 'marcando "Li e concordo"'}.</p>
      <p class="small muted" style="margin:0">${esc(primeiro(a.responsavel) || 'O ateliê')} já foi avisada e vai enviar o link de pagamento do sinal para garantir o seu horário.</p>
      <div class="row no-print"><button class="btn primary" id="btPdf">${ic('down')}Baixar contrato em PDF</button>${L.portalToken ? `<a class="btn soft" href="/cliente#${esc(L.portalToken)}">${ic('users')}Ver meu espaço</a>` : ''}</div></section>`;
  } else if (expirado(L)) {
    topo = `<div class="alert warn">${ic('alert')}<div>Este link expirou em ${new Date(toMs(L.expiraEm)).toLocaleDateString('pt-BR')}. Peça um novo link ao ateliê.</div></div>${wa ? `<a class="btn primary" href="${waLink(a.whatsapp, `Oi! Sou ${L.nome}. O link do meu contrato expirou, pode me enviar outro?`)}" target="_blank" rel="noopener">${ic('chat')}Pedir novo link</a>` : ''}`;
  }
  main.innerHTML = marca(a.nome) + `
  <section><div class="eyebrow">Contrato</div><h1 class="page-title">${L.status === 'aceito' ? 'Tudo <em>certo</em>' : 'Leia com <em>atenção</em>'}</h1>
   <p class="lede">Olá, ${esc(primeiro(L.nome))}! Este é o contrato do seu atendimento de <b>${esc(L.servico)}</b>${quando(L)}${L.valor ? ` (${BRL(L.valor)})` : ''}.${L.status === 'aceito' ? '' : ' Leia até o fim e confirme no final da página.'}</p></section>
  ${topo}
  <div class="doc-wrap">${L.html}</div>
  ${L.status !== 'aceito' && !expirado(L) ? `
  <form class="card aceite" id="fAceite">
    <h3>Confirmar o contrato <small>válido até ${new Date(toMs(L.expiraEm)).toLocaleDateString('pt-BR')}</small></h3>
    <div class="f2"><label class="fld">Nome completo<input id="acNome" required autocomplete="name" value="${esc(L.nome)}"></label><label class="fld">CPF<input id="acCpf" required inputmode="numeric" autocomplete="off" value="${esc(L.cpf)}" placeholder="000.000.000-00"></label></div>
    <div class="seg" role="tablist"><button type="button" data-meio="assinatura" aria-pressed="true">${ic('pen')} Assinar com o dedo</button><button type="button" data-meio="concordo" aria-pressed="false">${ic('check')} Só concordar</button></div>
    <div id="boxAss"><div class="row between small"><span class="muted">Assine no quadro abaixo</span><button type="button" class="btn sm ghost" id="limpar">Limpar</button></div><canvas class="sig" id="sig" style="background:#fff"></canvas></div>
    <label class="check"><input type="checkbox" id="acOk" required>Li o contrato inteiro e concordo com todas as cláusulas</label>
    <div id="acMsg" class="small" style="color:var(--bad)"></div>
    <button class="btn primary" style="justify-content:center">${ic('check')}Aceitar contrato</button>
    <p class="small muted" style="margin:0">Ao aceitar, registramos seu nome, CPF, a data e a hora, e a versão do contrato. Seus dados são usados só para este atendimento, conforme a LGPD.</p>
  </form>` : ''}
  ${wa && L.status !== 'aceito' ? `<p class="pub-foot no-print">Dúvidas? <a href="${wa}" target="_blank" rel="noopener">Fale com o ateliê pelo WhatsApp</a></p>` : ''}
  <p class="pub-foot">Código do documento: ${esc(String(L.hash || token).slice(0, 12))}</p>`;
  if ($('#btPdf')) $('#btPdf').onclick = baixarPdf;
  if ($('#fAceite')) ligarAceite();
}

function ligarAceite() {
  const c = $('#sig'); const r = c.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
  c.width = Math.max(280, r.width) * dpr; c.height = 170 * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  x.lineWidth = 2.4; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#2B1A20';
  let on = false; const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.addEventListener('pointerdown', e => { on = true; c.setPointerCapture(e.pointerId); const [a, b] = pos(e); x.beginPath(); x.moveTo(a, b); });
  c.addEventListener('pointermove', e => { if (!on) return; const [a, b] = pos(e); x.lineTo(a, b); x.stroke(); tinta = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => c.addEventListener(t, () => { on = false; }));
  $('#limpar').onclick = () => { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.restore(); tinta = false; };
  document.querySelectorAll('[data-meio]').forEach(b => b.onclick = () => {
    meio = b.dataset.meio; document.querySelectorAll('[data-meio]').forEach(o => o.setAttribute('aria-pressed', o === b)); $('#boxAss').hidden = meio !== 'assinatura';
  });
  $('#fAceite').onsubmit = async e => {
    e.preventDefault(); const msg = $('#acMsg'); msg.textContent = '';
    const nome = $('#acNome').value.trim().replace(/\s+/g, ' '); const cpf = $('#acCpf').value.trim();
    if (nome.length < 5 || !nome.includes(' ')) { msg.textContent = 'Escreva o nome completo.'; return; }
    if (digits(cpf).length !== 11) { msg.textContent = 'Confira o CPF: são 11 números.'; return; }
    if (meio === 'assinatura' && !tinta) { msg.textContent = 'Falta a assinatura no quadro.'; return; }
    if (!$('#acOk').checked) { msg.textContent = 'Marque que leu e concorda com o contrato.'; return; }
    const bt = $('#fAceite button:not([type])'); bt.disabled = true; bt.textContent = 'Enviando…';
    const aceite = { nome, cpf, meio, em: serverTimestamp(), dispositivo: navigator.userAgent.slice(0, 180) };
    if (meio === 'assinatura') aceite.assinatura = c.toDataURL('image/png');
    try { await updateDoc(ref, { status: 'aceito', aceite }); const s = await getDoc(ref); L = s.data(); render(); toast('Contrato aceito. Obrigada!'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (err) { console.error(err); bt.disabled = false; bt.textContent = 'Aceitar contrato'; msg.textContent = 'Não foi possível registrar agora. Confira a internet e tente de novo. Se o link expirou, peça um novo ao ateliê.'; }
  };
}

function carregaJsPdf() {
  return new Promise((res, rej) => { if (window.jspdf) return res(window.jspdf); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = () => res(window.jspdf); s.onerror = rej; document.head.appendChild(s); });
}
const latin = t => String(t || '').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/•/g, '-').replace(/…/g, '...').replace(/[^\x00-\xFF]/g, '');

async function baixarPdf() {
  const bt = $('#btPdf'); bt.disabled = true; bt.textContent = 'Gerando PDF…';
  try {
    const { jsPDF } = await carregaJsPdf(); const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const M = 18, W = 174, H = 297; let y = 20; const ac = L.aceite || {};
    const linha = (txt, size = 10, bold = false, gap = 4.6) => { pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); for (const l of pdf.splitTextToSize(latin(txt), W)) { if (y > H - 22) { pdf.addPage(); y = 20; } pdf.text(l, M, y); y += gap; } };
    pdf.setTextColor(122, 65, 35); linha((L.atelie && L.atelie.nome) || 'Stéfany Medeiros Trancista', 11, true, 6); pdf.setTextColor(59, 34, 22);
    for (const par of String(L.texto || '').split('\n')) { if (!par.trim()) { y += 2; continue; } const titulo = /^(Contrato|Cláusula|Partes)/i.test(par.trim()); linha(par, titulo ? 11 : 10, titulo, titulo ? 5.6 : 4.6); }
    if (y > H - 70) { pdf.addPage(); y = 20; }
    y += 4; pdf.setDrawColor(200, 137, 94); pdf.line(M, y, M + W, y); y += 7;
    linha('Aceite eletrônico', 12, true, 6);
    linha(`Nome: ${ac.nome || ''}`); linha(`CPF: ${ac.cpf || ''}`);
    linha(`Forma: ${ac.meio === 'assinatura' ? 'assinatura no aparelho' : 'confirmação "Li e concordo"'}`);
    linha(`Data e hora: ${new Date(toMs(ac.em)).toLocaleString('pt-BR')}`);
    linha(`Código do documento: ${L.hash || token}`); linha(`Endereço do contrato: ${location.origin}/contrato#${token}`, 8);
    if (ac.assinatura) { y += 2; if (y > H - 40) { pdf.addPage(); y = 20; } pdf.addImage(ac.assinatura, 'PNG', M, y, 70, 22); y += 24; pdf.setFontSize(8); pdf.text(latin(ac.nome || ''), M, y); }
    const n = pdf.getNumberOfPages(); for (let i = 1; i <= n; i++) { pdf.setPage(i); pdf.setFontSize(8); pdf.setTextColor(134, 104, 90); pdf.text(`Página ${i} de ${n}`, M + W, H - 10, { align: 'right' }); }
    pdf.save(`contrato-${latin(primeiro(L.nome)).toLowerCase() || 'cliente'}-${(L.data || new Date().toISOString().slice(0, 10))}.pdf`);
  } catch (e) { console.error(e); toast('Não foi possível gerar o PDF. Tente de novo.', true); }
  bt.disabled = false; bt.innerHTML = `${ic('down')}Baixar contrato em PDF`;
}

(async () => {
  if (!ref) { estado(main, 'Link incompleto', 'Abra o link exatamente como recebeu no WhatsApp.'); return; }
  try { const s = await getDoc(ref); if (!s.exists()) { estado(main, 'Link inválido ou cancelado', 'Peça um novo link ao ateliê.'); return; } L = s.data(); render(); }
  catch (e) { console.error(e); estado(main, 'Não foi possível abrir', 'Verifique a internet e tente de novo.'); }
})();
