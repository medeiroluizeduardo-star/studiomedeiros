import { doc, getDoc, getDocs, collection, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FS, $, $$, esc, BRL, ic, marca, waLink, estado, dataBR, dataLonga, parse, primeiro, toMs, tokenDaUrl, toast, NIVEL_COR } from './publico.js';

const main = $('#pub');
const token = tokenDaUrl();
let P = null, PROX = [];
const MES3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ST = { agendado: ['', 'Agendado'], confirmado: ['good', 'Confirmado'], cancelado: ['', 'Cancelado'], concluido: ['good', 'Concluído'], faltou: ['bad', 'Faltou'] };
const CT = { aceito: ['good', 'aceito'], pendente: ['warn', 'aguardando você'], expirado: ['', 'link expirado'] };

function wa(msg) { return waLink(P.atelie && P.atelie.whatsapp, msg); }
function proxCard(a) {
  const d = parse(a.data); const lim = toMs(a.limiteCancelamento); const pode = !a.cancelado && Date.now() < lim;
  const quando = `${dataLonga(a.data)} às ${a.hora}`; const [cl, tx] = a.cancelado ? ['', 'Cancelado'] : ST[a.status] || ST.agendado;
  const wCanc = wa(`Oi! Aqui é ${P.nome}. Preciso cancelar meu horário de ${a.servico}, ${quando}.`);
  const wRem = wa(`Oi! Aqui é ${P.nome}. Gostaria de remarcar meu horário de ${a.servico}, ${quando}.`);
  return `<article class="prox-card ${a.cancelado ? 'cancelado' : ''}"><div class="prox-data"><b>${d.getDate()}</b><span>${MES3[d.getMonth()]}</span></div>
   <div style="min-width:0"><div class="row between"><b>${esc(a.servico)}</b><span class="badge ${cl}">${tx}</span></div>
    <div class="small muted">${esc(quando.replace(/^./, c => c.toUpperCase()))}${a.pacote ? ' · sessão do seu pacote' : ''}${a.sinal ? ` · sinal pago ${BRL(a.sinal)}` : ''}</div>
    ${a.cancelado ? '' : pode ? `<div class="small" style="margin-top:4px">Você pode cancelar por aqui até ${new Date(lim).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}.</div>`
      : `<div class="small" style="margin-top:4px">O prazo para cancelar por aqui terminou (${P.regras.prazoCancel} horas antes do horário). Avise direto pelo WhatsApp.</div>`}</div>
   ${a.cancelado ? '' : `<div class="actions">${pode ? `<button class="btn sm soft" data-cancelar="${a.id}">${ic('x')}Cancelar horário</button>` : (wCanc ? `<a class="btn sm primary" href="${wCanc}" target="_blank" rel="noopener">${ic('chat')}Avisar cancelamento no WhatsApp</a>` : '')}${wRem ? `<a class="btn sm ghost" href="${wRem}" target="_blank" rel="noopener">${ic('repeat')}Remarcar</a>` : ''}</div>`}</article>`;
}

function render() {
  const n = P.nivel || {}; const cor = NIVEL_COR[n.chave] || 'var(--lv-nova)';
  const pct = n.prox && n.prox.faltam ? Math.max(4, Math.min(100, Math.round(n.score / (n.score + n.prox.faltam) * 100))) : 100;
  const wAg = wa(`Oi! Aqui é ${P.nome}. Quero agendar um horário 💕`);
  const hj = new Date(); const hoje = `${hj.getFullYear()}-${String(hj.getMonth() + 1).padStart(2, '0')}-${String(hj.getDate()).padStart(2, '0')}`;
  const prox = PROX.filter(a => a.data >= hoje).sort((a, b) => (a.data + a.hora) < (b.data + b.hora) ? -1 : 1);
  const leigo = t => String(t || '').replace(/\b(a|à) CONTRATANTE\b/g, 'você').replace(/CONTRATANTE/g, 'você').replace(/CONTRATADA/g, 'o ateliê');
  const r0 = P.regras || {}; const r = { ...r0, sinalCancel: leigo(r0.sinalCancel), falta: leigo(r0.falta) }; const c = P.cadastro || {};
  main.innerHTML = marca(P.atelie && P.atelie.nome) + `
  <section class="pub-hero"><div style="flex:1;min-width:220px"><div class="eyebrow">Seu espaço</div><h1 class="hello">Olá, <em>${esc(primeiro(P.nome))}</em></h1><p class="lede">Aqui você acompanha seus horários, seus contratos e o seu nível de fidelidade.</p></div></section>
  <section class="card nivel-card"><div class="nivel-selo" style="--lv:${cor}"><div><b>${n.score ?? 0}</b><span>pontos</span></div></div>
   <div style="min-width:0"><div class="eyebrow">Seu nível</div><div style="font-family:var(--f-display);font-size:1.6rem;line-height:1.1">${esc(n.nome || 'Nova')}</div>
    <p class="small" style="margin:6px 0">${ic('gift')} ${esc(n.beneficio || '')}</p>
    ${n.prox ? (n.prox.faltam ? `<div class="bar thin"><span style="width:${pct}%"></span></div><div class="small muted" style="margin-top:4px">Faltam ${n.prox.faltam} pontos para o nível ${esc(n.prox.nome)}.</div>` : `<div class="small muted">${esc(n.prox.texto || '')}</div>`) : '<div class="small muted">Você está no nível mais alto. Obrigada pela confiança!</div>'}</div>
   <details class="how" style="grid-column:1/-1"><summary>Como ganhar pontos</summary><p>Contamos os últimos 12 meses: cada atendimento vale 7 pontos (até 35), o valor investido vale até 30, voltar com frequência vale até 20 e cada amiga indicada vale 5 (até 15). Faltar sem avisar tira 10 pontos.</p></details></section>
  <section class="card"><h3>Próximos horários <small>${prox.filter(a => !a.cancelado).length}</small></h3>
   ${prox.length ? `<div class="stack" style="gap:10px">${prox.map(proxCard).join('')}</div>` : `<div class="empty">Nenhum horário marcado.</div>`}
   <div class="row" style="margin-top:12px">${wAg ? `<a class="btn primary" href="${wAg}" target="_blank" rel="noopener">${ic('cal')}Agendar pelo WhatsApp</a>` : ''}<a class="btn soft" href="/catalogo">${ic('image')}Ver catálogo de modelos</a></div></section>
  ${(P.contratos || []).length ? `<section class="card"><h3>Meus contratos</h3><div class="list">${P.contratos.map(k => { const [cl, tx] = CT[k.status] || CT.aceito; const inner = `<div class="avatar" style="--lv:var(--rose)">${ic('file')}</div><div class="grow"><div class="t">${esc(k.servico || 'Contrato de serviço')}</div><div class="s">${k.data ? `atendimento em ${dataBR(k.data)} · ` : ''}${k.presencial ? 'assinado no ateliê' : `enviado em ${dataBR(k.criadoEm)}`}</div></div><span class="badge ${cl}">${tx}</span>`;
      return k.token ? `<a class="item" href="/contrato#${esc(k.token)}" style="text-decoration:none;color:inherit">${inner}</a>` : `<div class="item">${inner}</div>`; }).join('')}</div></section>` : ''}
  ${(P.pacotes || []).length ? `<section class="card"><h3>Meus pacotes</h3><div class="list">${P.pacotes.map(p => `<div class="item"><div class="avatar" style="--lv:var(--lv-ouro)">${ic('ticket')}</div><div class="grow"><div class="t">${esc(p.nome)}</div><div class="s">${p.saldo} sessão(ões) disponível(is)${p.validade ? ` · válido até ${dataBR(p.validade)}` : ''}</div></div></div>`).join('')}</div></section>` : ''}
  <section class="card"><h3>Últimos atendimentos</h3>${(P.ultimos || []).length ? `<div class="list">${P.ultimos.map(u => { const [cl, tx] = ST[u.status] || ST.concluido; return `<div class="item"><span class="time">${dataBR(u.data).slice(0, 5)}</span><div class="grow"><div class="t">${esc(u.servico)}</div><div class="s">${u.data.slice(0, 4)}${u.pacote ? ' · pacote' : ''}</div></div><span class="badge ${cl}">${tx}</span></div>`; }).join('')}</div>` : '<div class="empty">Seu histórico aparece aqui depois do primeiro atendimento.</div>'}</section>
  <section class="card"><h3>Meus dados</h3><div class="dados">
   <div><span>Nome</span>${esc(c.nome)}</div>${c.telefone ? `<div><span>WhatsApp</span>${esc(c.telefone)}</div>` : ''}${c.cpf ? `<div><span>CPF</span>${esc(c.cpf)}</div>` : ''}${c.aniversario ? `<div><span>Aniversário</span>${esc(c.aniversario)}</div>` : ''}${c.instagram ? `<div><span>Instagram</span>${esc(c.instagram)}</div>` : ''}</div>
   ${wa('') ? `<a class="btn sm ghost" style="margin-top:10px" href="${wa(`Oi! Aqui é ${P.nome}. Preciso corrigir meus dados de cadastro.`)}" target="_blank" rel="noopener">${ic('chat')}Corrigir meus dados</a>` : ''}</section>
  <section class="card"><h3>Combinados do ateliê</h3><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:6px">
   <li>Cancelamento ou remarcação com pelo menos <b>${r.prazoCancel} horas</b> de antecedência. Nesse caso, o sinal ${esc(r.sinalCancel)}.</li>
   ${r.tolerancia ? `<li>Tolerância de atraso: <b>${r.tolerancia} minutos</b>.</li>` : ''}${r.preparo ? `<li>Venha ${esc(r.preparo)}.</li>` : ''}${r.falta ? `<li>Falta sem aviso: ${esc(r.falta)}.</li>` : ''}</ul></section>
  <p class="pub-foot">${ic('lock')} Este link é pessoal. Não compartilhe.<br>${esc((P.atelie && P.atelie.nome) || '')}${P.atelie && P.atelie.instagram ? ` · ${esc(P.atelie.instagram)}` : ''}</p>`;
}

function pedirCancelamento(id) {
  const a = PROX.find(x => x.id === id); if (!a) return;
  const back = document.createElement('div'); back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Cancelar horário"><div class="grab"></div><div class="sheet-head"><h2>Cancelar horário?</h2><button class="icon-btn" data-fechar aria-label="Fechar">${ic('x')}</button></div>
   <div class="form"><p style="margin:0"><b>${esc(a.servico)}</b>, ${esc(dataLonga(a.data))} às ${esc(a.hora)}.</p>
   ${a.sinal ? `<div class="alert info">${ic('info')}<div>Sobre o sinal de ${BRL(a.sinal)}: como você está cancelando dentro do prazo, ele ${esc(String(P.regras.sinalCancel || '').replace(/\b(a|à) CONTRATANTE\b/g, 'você').replace(/CONTRATANTE/g, 'você'))}.</div></div>` : ''}
   <label class="fld">Quer contar o motivo? (opcional)<textarea id="motivo" maxlength="280"></textarea></label>
   <div id="cMsg" class="small" style="color:var(--bad)"></div>
   <div class="form-actions"><button class="btn ghost" data-fechar>Voltar</button><button class="btn primary" id="confirma">${ic('x')}Confirmar cancelamento</button></div></div></div>`;
  document.body.appendChild(back); document.body.style.overflow = 'hidden';
  const fechar = () => { back.remove(); document.body.style.overflow = ''; };
  back.addEventListener('click', e => { if (e.target === back || e.target.closest('[data-fechar]')) fechar(); });
  $('#confirma', back).onclick = async () => {
    const bt = $('#confirma', back); bt.disabled = true; bt.textContent = 'Cancelando…';
    try {
      const b = writeBatch(FS);
      b.update(doc(FS, 'portal', token, 'proximos', id), { cancelado: true, canceladoEm: serverTimestamp() });
      b.set(doc(collection(FS, 'solicitacoes')), { token, agendaId: id, tipo: 'cancelamento', criadoEm: serverTimestamp(), motivo: $('#motivo', back).value.trim().slice(0, 280) });
      await b.commit(); fechar(); await carregar(); toast('Horário cancelado. O ateliê já foi avisado.');
    } catch (e) {
      console.error(e); bt.disabled = false; bt.innerHTML = `${ic('x')}Confirmar cancelamento`;
      const w = wa(`Oi! Aqui é ${P.nome}. Preciso cancelar meu horário de ${a.servico}, ${dataLonga(a.data)} às ${a.hora}.`);
      $('#cMsg', back).innerHTML = `Não foi possível cancelar por aqui. Se o prazo terminou, avise pelo WhatsApp.${w ? ` <a href="${w}" target="_blank" rel="noopener">Abrir WhatsApp</a>` : ''}`;
    }
  };
}

main.addEventListener('click', e => { const b = e.target.closest('[data-cancelar]'); if (b) pedirCancelamento(b.dataset.cancelar); });

async function carregar() {
  const s = await getDoc(doc(FS, 'portal', token));
  if (!s.exists()) { estado(main, 'Link inválido', 'Este link não está mais ativo. Peça um novo link ao ateliê.'); return false; }
  P = s.data();
  const q = await getDocs(collection(FS, 'portal', token, 'proximos'));
  PROX = q.docs.map(d => ({ id: d.id, ...d.data() }));
  render(); return true;
}
(async () => {
  if (!token) { estado(main, 'Link incompleto', 'Abra o link exatamente como recebeu no WhatsApp.'); return; }
  try { await carregar(); } catch (e) { console.error(e); estado(main, 'Não foi possível abrir', 'Verifique a internet e tente de novo.'); }
})();
