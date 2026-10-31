import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FS, $, esc, ic, marca, waLink, estado, primeiro, toMs, digits, tokenDaUrl, toast } from './publico.js';

const main = $('#pub');
const token = tokenDaUrl();
const ref = token ? doc(FS, 'cadastros', token) : null;
const ORIGENS_PADRAO = ['Instagram', 'Indicação', 'TikTok', 'WhatsApp', 'Google', 'Passou no ateliê', 'Outro'];
let X = null;
const IND = (new URLSearchParams(location.search).get('ind') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

const mascaraTel = v => { const d = digits(v).slice(0, 11); if (d.length <= 2) return d; if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`; if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; };
const mascaraCpf = v => { const d = digits(v).slice(0, 11); return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4'); };
function cpfValido(c) { const d = digits(c); if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false; for (const t of [9, 10]) { let s = 0; for (let i = 0; i < t; i++) s += +d[i] * (t + 1 - i); if (((s * 10) % 11) % 10 !== +d[t]) return false; } return true; }

function obrigado() {
  const a = X.atelie || {};
  estado(main, 'Cadastro <em>enviado</em>', `Obrigada${X.dados?.nome ? `, ${esc(primeiro(X.dados.nome))}` : ''}! ${esc(primeiro(a.responsavel) || 'O ateliê')} recebeu seus dados e vai confirmar tudo com você.`,
    a.instagram ? `<a class="btn soft" href="https://instagram.com/${esc(String(a.instagram).replace(/^@/, ''))}" target="_blank" rel="noopener">Ver trabalhos no Instagram</a>` : '');
}

function render() {
  const a = X.atelie || {}; const pv = X.previo || {}; const orig = Array.isArray(X.origens) && X.origens.length ? X.origens : ORIGENS_PADRAO;
  const wa = waLink(a.whatsapp, 'Oi! Estou com uma dúvida sobre o meu cadastro.');
  main.innerHTML = marca(a.nome) + `
  <section><div class="eyebrow">Cadastro</div><h1 class="page-title">Seja <em>bem-vinda</em></h1>
   <p class="lede">${X.nome ? `Olá, ${esc(primeiro(X.nome))}! ` : ''}Preencha seus dados para agilizar o atendimento. Leva menos de um minuto.</p></section>
  <form class="card form" id="fCad" novalidate>
   <label class="fld">Nome completo *<input id="nome" required autocomplete="name" maxlength="120" value="${esc(X.nome)}"></label>
   <div class="f2"><label class="fld">WhatsApp *<input id="tel" required inputmode="tel" autocomplete="tel" maxlength="16" placeholder="(27) 99999-9999" value="${esc(mascaraTel(X.telefone))}"></label>
    <label class="fld">Data de nascimento<input id="aniv" type="date" max="${new Date().toISOString().slice(0, 10)}" value="${esc(pv.aniversario)}"></label></div>
   <div class="f2"><label class="fld">CPF <small class="muted">(usado nos contratos)</small><input id="cpf" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" value="${esc(mascaraCpf(pv.cpf || ''))}"></label>
    <label class="fld">Instagram<input id="ig" maxlength="60" placeholder="@seuusuario" autocapitalize="off" value="${esc(pv.instagram)}"></label></div>
   <div class="f2"><label class="fld">Como conheceu o ateliê<select id="orig"><option value="">Selecione…</option>${orig.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>
    <label class="fld" id="indBox" hidden>Quem indicou?<input id="ind" maxlength="120" placeholder="Nome de quem indicou"></label></div>
   <label class="fld" id="codBox" ${IND ? '' : 'hidden'}>Código de indicação <small class="muted">(se recebeu de uma amiga)</small><input id="cod" maxlength="12" autocapitalize="characters" style="text-transform:uppercase" value="${esc(IND)}"></label>
   <label class="fld">Seu cabelo hoje<input id="cab" maxlength="120" placeholder="Ex.: crespo, na altura do ombro" value="${esc(pv.cabelo)}"></label>
   <label class="fld">Algo que a gente deva saber?<textarea id="obs" maxlength="300" placeholder="Opcional. Ex.: preferência de horário, couro cabeludo sensível"></textarea></label>
   <label class="check"><input type="checkbox" id="img">Autorizo fotos e vídeos do meu cabelo para divulgação do ateliê</label>
   <label class="check"><input type="checkbox" id="lgpd" required>Concordo com o uso destes dados para agendamentos, contratos e contato sobre meus atendimentos (LGPD). *</label>
   <div id="msg" class="small" style="color:var(--bad)" role="alert"></div>
   <button class="btn primary" style="justify-content:center">${ic('check')}Enviar cadastro</button>
   <p class="small muted" style="margin:0">Seus dados ficam guardados com segurança e só a equipe do ateliê tem acesso. Você pode pedir a correção ou exclusão a qualquer momento.</p>
  </form>
  ${wa ? `<p class="pub-foot">Dúvidas? <a href="${wa}" target="_blank" rel="noopener">Fale com o ateliê pelo WhatsApp</a></p>` : ''}`;
  $('#tel').addEventListener('input', e => { e.target.value = mascaraTel(e.target.value); });
  $('#cpf').addEventListener('input', e => { e.target.value = mascaraCpf(e.target.value); });
  $('#orig').addEventListener('change', e => { $('#indBox').hidden = $('#codBox').hidden = e.target.value !== 'Indicação' && !IND; });
  $('#fCad').addEventListener('submit', enviar);
}

async function enviar(e) {
  e.preventDefault(); const v = id => $('#' + id).value.trim(); const msg = $('#msg'); msg.textContent = '';
  const nome = v('nome').replace(/\s+/g, ' ');
  if (nome.length < 5 || !nome.includes(' ')) { msg.textContent = 'Digite seu nome e sobrenome.'; $('#nome').focus(); return; }
  if (digits(v('tel')).length < 10) { msg.textContent = 'Confira o número do WhatsApp com DDD.'; $('#tel').focus(); return; }
  if (v('cpf') && !cpfValido(v('cpf'))) { msg.textContent = 'O CPF parece incorreto. Confira ou deixe em branco.'; $('#cpf').focus(); return; }
  if (!$('#lgpd').checked) { msg.textContent = 'Para enviar, marque a concordância com o uso dos dados.'; return; }
  const dados = { nome, telefone: v('tel'), cpf: v('cpf'), aniversario: v('aniv'), instagram: v('ig'), origem: v('orig'), indicadaPor: v('orig') === 'Indicação' ? v('ind') : '', codigoIndicacao: v('cod').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12), cabelo: v('cab'), obs: v('obs'), imagem: $('#img').checked, consentimento: true };
  const bt = $('#fCad button.primary'); bt.disabled = true; bt.textContent = 'Enviando…';
  try { await updateDoc(ref, { status: 'enviado', dados, enviadoEm: serverTimestamp() }); X.dados = dados; obrigado(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  catch (err) { console.error(err); bt.disabled = false; bt.innerHTML = `${ic('check')}Enviar cadastro`; toast('Não foi possível enviar. Verifique a internet e tente de novo.', true); }
}

(async () => {
  if (!ref) { estado(main, 'Link incompleto', 'Abra o link exatamente como recebeu no WhatsApp.'); return; }
  try {
    const s = await getDoc(ref);
    if (!s.exists()) { estado(main, 'Link inválido ou cancelado', 'Peça um novo link ao ateliê.'); return; }
    X = s.data();
    if (X.status !== 'convite') { obrigado(); return; }
    if (toMs(X.expiraEm) && toMs(X.expiraEm) < Date.now()) { const w = waLink((X.atelie || {}).whatsapp, 'Oi! O meu link de cadastro expirou, pode me enviar outro?'); estado(main, 'Link expirado', 'Este link de cadastro não vale mais. Peça um novo ao ateliê.', w ? `<a class="btn primary" href="${w}" target="_blank" rel="noopener">${ic('chat')}Pedir novo link</a>` : ''); return; }
    render();
  } catch (e) { console.error(e); estado(main, 'Não foi possível abrir', 'Verifique a internet e tente de novo.'); }
})();
