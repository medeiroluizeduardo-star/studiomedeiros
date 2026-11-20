import { doc, getDoc, getDocs, setDoc, updateDoc, collection, writeBatch, serverTimestamp } from './fb.js';
import { FS, $, $$, esc, BRL, ic, marca, waLink, estado, dataBR, dataLonga, parse, primeiro, toMs, tokenDaUrl, toast, NIVEL_COR, horariosPara } from './publico.js';

const main = $('#pub');
const token = tokenDaUrl();
let P = null, PROX = [], HOR = null, HOR_SERV = '', HOR_DIA = '';
const CONFIRMADOS = new Set(), PEDIDOS = new Set();
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
   ${!a.cancelado && a.pix ? `<div class="pix-box"><div class="small"><b>Sinal para garantir o horário: ${BRL(a.sinalFalta)}</b><br>Copie o código e cole no app do seu banco, em Pix › Copia e cola. Depois mande o comprovante no WhatsApp.</div><button class="btn sm primary" data-pix="${esc(a.pix)}">${ic('copy')}Copiar código Pix</button></div>` : ''}
   ${a.cancelado ? '' : `<div class="actions">${a.status === 'agendado' ? (CONFIRMADOS.has(a.id) ? '<span class="badge good">confirmação enviada</span>' : `<button class="btn sm primary" data-confirmar="${a.id}">${ic('check')}Confirmar presença</button>`) : ''}<button class="btn sm ghost" data-ics="${a.id}">${ic('cal')}Salvar na agenda do celular</button>${pode ? `<button class="btn sm soft" data-cancelar="${a.id}">${ic('x')}Cancelar horário</button>` : (wCanc ? `<a class="btn sm primary" href="${wCanc}" target="_blank" rel="noopener">${ic('chat')}Avisar cancelamento no WhatsApp</a>` : '')}${wRem ? `<a class="btn sm ghost" href="${wRem}" target="_blank" rel="noopener">${ic('repeat')}Remarcar</a>` : ''}</div>`}</article>`;
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
   ${pontosBloco(n)}
   <details class="how" style="grid-column:1/-1"><summary>Como ganhar pontos</summary><p>Contamos os últimos 12 meses: cada atendimento vale 7 pontos (até 35), o valor investido vale até 30, voltar com frequência vale até 20 e cada amiga indicada vale 5 (até 15). Faltar sem avisar tira 10 pontos.</p></details></section>
  <section class="card"><h3>Próximos horários <small>${prox.filter(a => !a.cancelado).length}</small></h3>
   ${prox.length ? `<div class="stack" style="gap:10px">${prox.map(proxCard).join('')}</div>` : `<div class="empty">Nenhum horário marcado.</div>`}
   <div class="row" style="margin-top:12px">${wAg ? `<a class="btn primary" href="${wAg}" target="_blank" rel="noopener">${ic('cal')}Agendar pelo WhatsApp</a>` : ''}<a class="btn soft" href="/catalogo">${ic('image')}Ver catálogo de modelos</a></div></section>
  ${horariosCard()}
  ${googleCard()}
  ${avaliarCard()}
  ${minhasAvalCard()}
  ${cuidadosCard()}
  ${anamCard()}
  ${indicacaoCard()}
  ${(P.contratos || []).length ? `<section class="card"><h3>Meus contratos</h3><div class="list">${P.contratos.map(k => { const [cl, tx] = CT[k.status] || CT.aceito; const inner = `<div class="avatar" style="--lv:var(--rose)">${ic('file')}</div><div class="grow"><div class="t">${esc(k.servico || 'Contrato de serviço')}</div><div class="s">${k.data ? `atendimento em ${dataBR(k.data)} · ` : ''}${k.presencial ? 'assinado no ateliê' : `enviado em ${dataBR(k.criadoEm)}`}</div></div><span class="badge ${cl}">${tx}</span>`;
      return k.token ? `<a class="item" href="/contrato#${esc(k.token)}" style="text-decoration:none;color:inherit">${inner}</a>` : `<div class="item">${inner}</div>`; }).join('')}</div></section>` : ''}
  ${(P.pacotes || []).length ? `<section class="card"><h3>Meus pacotes</h3><div class="list">${P.pacotes.map(p => `<div class="item"><div class="avatar" style="--lv:var(--lv-ouro)">${ic('ticket')}</div><div class="grow"><div class="t">${esc(p.nome)}</div><div class="s">${p.saldo} sessão(ões) disponível(is)${p.validade ? ` · válido até ${dataBR(p.validade)}` : ''}</div></div></div>`).join('')}</div></section>` : ''}
  <section class="card"><h3>Últimos atendimentos</h3>${(P.ultimos || []).length ? `<div class="list">${P.ultimos.map(u => { const [cl, tx] = ST[u.status] || ST.concluido; return `<div class="item"><span class="time">${dataBR(u.data).slice(0, 5)}</span><div class="grow"><div class="t">${esc(u.servico)}</div><div class="s">${u.data.slice(0, 4)}${u.pacote ? ' · pacote' : ''}</div></div>${u.status === 'concluido' && minhaAval(u.id) ? `<button class="btn sm ghost" data-avaliar="${esc(u.id)}">${ic('pen')}Editar</button>` : u.avaliar && !AVALIADOS.has(u.id) ? `<button class="btn sm soft" data-avaliar="${esc(u.id)}">${ic('star')}Avaliar</button>` : `<span class="badge ${cl}">${tx}</span>`}</div>`; }).join('')}</div>` : '<div class="empty">Seu histórico aparece aqui depois do primeiro atendimento.</div>'}</section>
  <section class="card"><h3>Meus dados</h3><div class="dados">
   <div><span>Nome</span>${esc(c.nome)}</div>${c.telefone ? `<div><span>WhatsApp</span>${esc(c.telefone)}</div>` : ''}${c.cpf ? `<div><span>CPF</span>${esc(c.cpf)}</div>` : ''}${c.aniversario ? `<div><span>Aniversário</span>${esc(c.aniversario)}</div>` : ''}${c.instagram ? `<div><span>Instagram</span>${esc(c.instagram)}</div>` : ''}</div>
   ${wa('') ? `<a class="btn sm ghost" style="margin-top:10px" href="${wa(`Oi! Aqui é ${P.nome}. Preciso corrigir meus dados de cadastro.`)}" target="_blank" rel="noopener">${ic('chat')}Corrigir meus dados</a>` : ''}</section>
  <section class="card"><h3>Combinados do ateliê</h3><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:6px">
   <li>Cancelamento ou remarcação com pelo menos <b>${r.prazoCancel} horas</b> de antecedência. Nesse caso, o sinal ${esc(r.sinalCancel)}.</li>
   ${r.tolerancia ? `<li>Tolerância de atraso: <b>${r.tolerancia} minutos</b>.</li>` : ''}${r.preparo ? `<li>Venha ${esc(r.preparo)}.</li>` : ''}${r.falta ? `<li>Falta sem aviso: ${esc(r.falta)}.</li>` : ''}</ul></section>
  <p class="pub-foot">${ic('lock')} Este link é pessoal. Não compartilhe.<br>${esc((P.atelie && P.atelie.nome) || '')}${P.atelie && P.atelie.instagram ? ` · ${esc(P.atelie.instagram)}` : ''}</p>`;
}


// Arquivo de calendário (.ics): abre na agenda do celular com lembrete um dia antes e duas horas antes.
function salvarNaAgenda(id) {
  const a = PROX.find(x => x.id === id); if (!a) return;
  const [y, m, d] = a.data.split('-').map(Number); const [hh, mm] = String(a.hora || '09:00').split(':').map(Number);
  const ini = new Date(y, m - 1, d, hh || 0, mm || 0); const fim = new Date(ini.getTime() + (a.duracao || 120) * 60e3);
  const z = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const tx = t => String(t || '').replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');
  const at = P.atelie || {}; const local = [at.endereco, at.municipio].filter(Boolean).join(', ');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atelie//Horario//PT', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${id}@${location.hostname}`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(ini)}`, `DTEND:${z(fim)}`,
    `SUMMARY:${tx(`${a.servico} · ${at.nome || 'Ateliê'}`)}`, local ? `LOCATION:${tx(local)}` : '', `DESCRIPTION:${tx(`Seu horário de ${a.servico}.${P.regras && P.regras.preparo ? ` Venha ${P.regras.preparo}.` : ''} Seu espaço: ${location.href}`)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã é o seu horário', 'END:VALARM', 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Seu horário é daqui a 2 horas', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const l = document.createElement('a'); l.href = url; l.download = `horario-${a.data}.ics`; document.body.appendChild(l); l.click(); l.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60e3); toast('Abra o arquivo para salvar na sua agenda');
}
async function confirmarPresenca(id) {
  const a = PROX.find(x => x.id === id); if (!a) return;
  try {
    await setDoc(doc(collection(FS, 'solicitacoes')), { token, agendaId: id, tipo: 'confirmacao', criadoEm: serverTimestamp(), motivo: '' });
    CONFIRMADOS.add(id); render(); toast('Presença confirmada. Obrigada! 💕');
  } catch (e) { console.error(e); toast('Não foi possível confirmar agora. Tente de novo.', true); }
}
function horariosCard() {
  const S = (HOR && HOR.servicos) || []; if (!HOR || !S.length) return '';
  if (!S.some(x => x.id === HOR_SERV)) HOR_SERV = S[0].id;
  const sv = S.find(x => x.id === HOR_SERV); const dias = horariosPara(HOR, sv.dur);
  if (!dias.some(x => x.d === HOR_DIA)) HOR_DIA = dias.length ? dias[0].d : '';
  const dia = dias.find(x => x.d === HOR_DIA);
  return `<section class="card" id="horLivres"><h3>${ic('clock')} Horários livres <small>próximas 2 semanas</small></h3>
   <label class="fld">Serviço<select id="horServ">${S.map(x => `<option value="${esc(x.id)}" ${x.id === HOR_SERV ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
   ${dias.length ? `<div class="chips hor-dias">${dias.map(x => { const d = parse(x.d); return `<button class="chip" data-hdia="${x.d}" aria-pressed="${x.d === HOR_DIA}">${dataLonga(x.d).split(',')[0].slice(0, 3)} ${d.getDate()}/${d.getMonth() + 1}</button>`; }).join('')}</div>
    <div class="chips hor-horas">${dia.horas.map(h => { const k = `${dia.d} ${h}`; return `<button class="chip" data-hpedir="${h}" ${PEDIDOS.has(k) ? 'aria-pressed="true" disabled' : ''}>${h}${PEDIDOS.has(k) ? ' · pedido enviado' : ''}</button>`; }).join('')}</div>
    <p class="small muted" style="margin:8px 0 0">Toque num horário para pedir. O ateliê confirma com você pelo WhatsApp.</p>`
    : '<div class="empty">Sem horários livres para este serviço nas próximas semanas. Fale com o ateliê pelo WhatsApp para entrar na lista de espera.</div>'}</section>`;
}
async function pedirHorario(h) {
  const S = (HOR && HOR.servicos) || []; const sv = S.find(x => x.id === HOR_SERV); if (!sv || !HOR_DIA) return;
  const quando = `${dataLonga(HOR_DIA)} às ${h}`;
  const back = document.createElement('div'); back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Pedir horário"><div class="grab"></div><div class="sheet-head"><h2>Pedir este horário?</h2><button class="icon-btn" data-fechar aria-label="Fechar">${ic('x')}</button></div>
   <div class="form"><p style="margin:0"><b>${esc(sv.nome)}</b>, ${esc(quando)}.</p><p class="small muted" style="margin:0">O horário só fica garantido depois que o ateliê confirmar${P.regras && P.regras.prazoCancel ? ' e você pagar o sinal' : ''}.</p>
   <label class="fld">Quer deixar um recado? (opcional)<textarea id="hMsg" maxlength="280" placeholder="Ex.: cor do cabelo, comprimento"></textarea></label>
   <div id="hErr" class="small" style="color:var(--bad)"></div>
   <div class="form-actions"><button class="btn ghost" data-fechar>Voltar</button><button class="btn primary" id="hOk">${ic('check')}Enviar pedido</button></div></div></div>`;
  document.body.appendChild(back); document.body.style.overflow = 'hidden';
  const fechar = () => { back.remove(); document.body.style.overflow = ''; };
  back.addEventListener('click', e => { if (e.target === back || e.target.closest('[data-fechar]')) fechar(); });
  $('#hOk', back).onclick = async () => {
    const bt = $('#hOk', back); bt.disabled = true; bt.textContent = 'Enviando…';
    try {
      await setDoc(doc(collection(FS, 'solicitacoes')), { token, agendaId: '', tipo: 'horario', criadoEm: serverTimestamp(), motivo: $('#hMsg', back).value.trim().slice(0, 280), pedido: { data: HOR_DIA, hora: h, servico: String(sv.nome).slice(0, 80), servicoId: String(sv.sid || '').slice(0, 64), duracao: Math.round(+sv.dur || 120) } });
      PEDIDOS.add(`${HOR_DIA} ${h}`); fechar(); render(); toast('Pedido enviado. O ateliê vai confirmar com você 💕');
    } catch (e) {
      console.error(e); bt.disabled = false; bt.innerHTML = `${ic('check')}Enviar pedido`;
      const w = wa(`Oi! Aqui é ${P.nome}. Quero pedir o horário de ${sv.nome}, ${quando}.`);
      $('#hErr', back).innerHTML = `Não foi possível enviar por aqui.${w ? ` <a href="${w}" target="_blank" rel="noopener">Pedir pelo WhatsApp</a>` : ''}`;
    }
  };
}

function anamCard() {
  const A = P.anamnese; if (!A || !(A.perguntas || []).length) return '';
  const em = ANAM_ENVIADA || A.em; const idade = em ? Math.floor((Date.now() - parse(String(em).slice(0, 10)).getTime()) / 864e5) : null;
  const vencida = idade !== null && idade > 180;
  return `<section class="card anam-card"><div class="row between"><h3 style="margin:0">${ic('shield')} Ficha de saúde (anamnese)</h3>${em && !vencida ? `<span class="badge good">${ic('check')}em dia</span>` : `<span class="badge warn">${vencida ? 'atualize' : 'pendente'}</span>`}</div>
   <p class="small muted" style="margin:6px 0 10px">${em ? (ANAM_ENVIADA ? 'Recebemos a sua ficha agora. Obrigada!' : `Última atualização em ${dataBR(String(em).slice(0, 10))}.`) + (vencida ? ' Já faz mais de 6 meses: atualize antes do próximo atendimento.' : ' Se algo mudou na sua saúde, atualize antes do próximo atendimento.') : 'Responda antes do seu atendimento. São perguntas rápidas que ajudam a cuidar do seu couro cabeludo com segurança.'}</p>
   <button class="btn ${em && !vencida ? 'soft' : 'primary'}" data-anam>${ic('pen')}${em ? 'Atualizar minha ficha' : 'Preencher minha ficha'}</button></section>`;
}
let ANAM_ENVIADA = '';
function abrirAnamnese() {
  const A = P.anamnese; const c = P.cadastro || {};
  const back = document.createElement('div'); back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet sheet-alta" role="dialog" aria-modal="true" aria-label="Ficha de anamnese"><div class="grab"></div><div class="sheet-head"><h2>Ficha de saúde</h2><button class="icon-btn" data-fechar aria-label="Fechar">${ic('x')}</button></div>
   <form class="form" id="fAnam" novalidate>
    <p class="small muted" style="margin:0">Marque <b>Sim</b> ou <b>Não</b>. Quando for sim, conte rapidinho o que é.</p>
    <div class="anam-q">${A.perguntas.map(({ k, q }) => `<div class="qa"><span class="small">${esc(q)}</span><div class="seg" data-q="${esc(k)}"><button type="button" data-v="0" aria-pressed="false">Não</button><button type="button" data-v="1" aria-pressed="false">Sim</button></div><input class="fld-in" id="det_${esc(k)}" maxlength="300" placeholder="Qual? Desde quando?" hidden></div>`).join('')}</div>
    <label class="check"><input type="checkbox" id="anMenor">Sou menor de 18 anos (o responsável preenche junto)</label>
    <div class="f2" id="anResp" hidden><label class="fld">Nome do responsável<input id="rNome" maxlength="120"></label><label class="fld">CPF do responsável<input id="rCpf" inputmode="numeric" maxlength="14"></label><label class="fld">Parentesco<input id="rPar" maxlength="40"></label></div>
    <label class="check"><input type="checkbox" id="anImg">Autorizo fotos e vídeos das minhas tranças para divulgação do ateliê</label>
    <details class="how"><summary>Ler a declaração e o consentimento</summary><div class="small" style="white-space:pre-wrap">${esc(A.termo || '')}</div></details>
    <div class="f2"><label class="fld">Seu nome completo<input id="anNome" required maxlength="120" value="${esc(c.nome || P.nome || '')}"></label><label class="fld">CPF<input id="anCpf" inputmode="numeric" maxlength="14" value="${esc(String(c.cpf || '').includes('*') ? '' : c.cpf || '')}"></label></div>
    <label class="check"><input type="checkbox" id="anDecl">Declaro que as informações são verdadeiras e completas.</label>
    <label class="check"><input type="checkbox" id="anLgpd">Autorizo o uso destes dados de saúde só para a segurança do meu atendimento (LGPD, art. 11).</label>
    <div id="anMsg" class="small" style="color:var(--bad)" role="alert"></div>
    <button class="btn primary" style="justify-content:center">${ic('check')}Enviar ficha</button>
   </form></div>`;
  document.body.appendChild(back); document.body.style.overflow = 'hidden';
  const fechar = () => { back.remove(); document.body.style.overflow = ''; };
  back.addEventListener('click', e => {
    if (e.target === back || e.target.closest('[data-fechar]')) { fechar(); return; }
    const b = e.target.closest('.seg[data-q] button'); if (b) { const sg = b.parentElement; $$('button', sg).forEach(x => x.setAttribute('aria-pressed', x === b)); sg.classList.remove('falta'); $('#det_' + sg.dataset.q, back).hidden = b.dataset.v !== '1'; }
  });
  $('#anMenor', back).onchange = e => { $('#anResp', back).hidden = !e.target.checked; };
  $('#fAnam', back).onsubmit = async e => {
    e.preventDefault(); const msg = $('#anMsg', back); msg.textContent = ''; const respostas = {}; let faltam = 0;
    $$('.seg[data-q]', back).forEach(sg => { const sel = $('button[aria-pressed="true"]', sg); if (!sel) { faltam++; sg.classList.add('falta'); return; } const sim = sel.dataset.v === '1'; respostas[sg.dataset.q] = { sim, det: sim ? $('#det_' + sg.dataset.q, back).value.trim().slice(0, 300) : '' }; });
    if (faltam) { msg.textContent = `Responda todas as perguntas (falta${faltam > 1 ? 'm' : ''} ${faltam}).`; $('.seg.falta', back).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const nome = $('#anNome', back).value.trim().replace(/\s+/g, ' ');
    if (nome.length < 5 || !nome.includes(' ')) { msg.textContent = 'Digite seu nome e sobrenome.'; return; }
    const menor = $('#anMenor', back).checked;
    if (menor && $('#rNome', back).value.trim().length < 5) { msg.textContent = 'Informe o nome do responsável.'; return; }
    if (!$('#anDecl', back).checked || !$('#anLgpd', back).checked) { msg.textContent = 'Para enviar, marque a declaração e a autorização.'; return; }
    const bt = $('button.primary', back); bt.disabled = true; bt.textContent = 'Enviando…';
    try {
      await setDoc(doc(FS, 'anamnesePortal', token), { respostas, nome, cpf: $('#anCpf', back).value.trim().slice(0, 20), menor, responsavel: menor ? { nome: $('#rNome', back).value.trim(), cpf: $('#rCpf', back).value.trim(), parentesco: $('#rPar', back).value.trim() } : {}, imagem: $('#anImg', back).checked, declaracao: true, consentimento: true, em: serverTimestamp(), dispositivo: navigator.userAgent.slice(0, 200) });
      ANAM_ENVIADA = new Date().toISOString(); fechar(); render(); toast('Ficha enviada. Obrigada!');
    } catch (err) { console.error(err); bt.disabled = false; bt.innerHTML = `${ic('check')}Enviar ficha`; msg.textContent = 'Não foi possível enviar. Verifique a internet e tente de novo.'; }
  };
}


/* De onde vêm os pontos da cliente e o que ela pode fazer para subir de nível. */
function pontosBloco(n) {
  const p = n.pts; if (!p || n.chave === 'nova') return '';
  const linhas = [['Atendimentos no ano', p.freq, 35], ['Valor investido', p.valor, 30], ['Voltar com frequência', p.rec, 20], ['Amigas indicadas', p.ind, 15]];
  const dicas = [];
  if (p.rec < 20) dicas.push(n.dias != null && n.dias > 45 ? `Voltar logo vale até <b>+${20 - p.rec}</b> pontos: o último atendimento foi há ${n.dias} dias, e quem volta em até 45 dias ganha o máximo.` : `Voltar em até 45 dias depois de cada atendimento vale até <b>+${20 - p.rec}</b> pontos.`);
  if (p.freq < 35) dicas.push(`Cada novo atendimento nos próximos 12 meses vale <b>+7</b> pontos.`);
  if (p.ind < 15 && P.indicacao && P.indicacao.codigo) dicas.push(`Cada amiga que vier pelo seu código e for atendida vale <b>+5</b> pontos.`);
  if (p.pen) dicas.push(`Faltas sem aviso tiraram <b>${p.pen}</b> pontos. Avisando antes, isso não acontece.`);
  return `<div style="grid-column:1/-1"><div class="eyebrow" style="margin:4px 0 8px">Seus pontos</div><div class="pontos-grid">${linhas.map(([t, v, m]) => `<div><div class="row between small"><span>${t}</span><span class="muted">${v} de ${m}</span></div><div class="bar thin"><span style="width:${Math.round(v / m * 100)}%"></span></div></div>`).join('')}</div>
   ${p.pen ? `<div class="small" style="color:var(--bad);margin-top:6px">Faltas: −${p.pen} pontos</div>` : ''}
   ${n.prox && dicas.length ? `<div class="eyebrow" style="margin:12px 0 6px">Como subir para ${esc(n.prox.nome)}</div><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">${dicas.slice(0, 3).map(d => `<li>${d}</li>`).join('')}</ul>` : ''}</div>`;
}
const AVALIADOS = new Set();
const MINHAS = {}; // avaliações feitas ou editadas nesta visita (o espaço só se atualiza quando o ateliê abre o sistema)
function minhaAval(id) { return MINHAS[id] || (P.minhasAval || []).find(x => x.id === id) || null; }
function minhasLista() {
  const m = new Map((P.minhasAval || []).map(x => [x.id, x])); Object.values(MINHAS).forEach(x => m.set(x.id, { ...m.get(x.id), ...x }));
  return [...m.values()].sort((a, b) => a.data < b.data ? 1 : -1);
}
function paraAvaliar() { return (P.paraAvaliar || (P.ultimos || []).filter(x => x.avaliar)).filter(x => !AVALIADOS.has(x.id) && !MINHAS[x.id]); }
function estrelasTxt(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
function minhasAvalCard() {
  const L = minhasLista(); const falta = paraAvaliar();
  if (!L.length && falta.length <= 1) return '';
  return `<section class="card"><h3>${ic('star')} Minhas avaliações <small>${L.length}</small></h3>
   ${L.length ? `<div class="list">${L.map(a => `<div class="item wrap"><span class="time">${dataBR(a.data).slice(0, 5)}</span><div class="grow"><div class="t"><span style="color:var(--lv-ouro);letter-spacing:1px">${estrelasTxt(a.nota)}</span> · ${esc(a.servico)}</div>${a.texto ? `<div class="s" style="white-space:normal">"${esc(a.texto)}"</div>` : ''}<div class="s">${a.autorizaPublicar ? (a.noCatalogo ? 'aparece no catálogo' : 'pode aparecer no catálogo') : 'só o ateliê vê'}</div></div><button class="btn sm ghost" data-avaliar="${esc(a.id)}">${ic('pen')}Editar</button></div>`).join('')}</div>` : '<p class="small muted" style="margin:0">Você ainda não avaliou nenhum atendimento.</p>'}
   ${falta.length > 1 ? `<div class="eyebrow" style="margin:14px 0 6px">Ainda sem avaliação</div><div class="list">${falta.slice(1).map(u => `<div class="item"><span class="time">${dataBR(u.data).slice(0, 5)}</span><div class="grow"><div class="t">${esc(u.servico)}</div><div class="s">${u.data.slice(0, 4)}</div></div><button class="btn sm soft" data-avaliar="${esc(u.id)}">${ic('star')}Avaliar</button></div>`).join('')}</div>` : ''}</section>`;
}
let GOOGLE_PEDIR = null; // { texto } depois de uma nota 4 ou 5, enquanto a página estiver aberta
function googleCard() {
  const g = P.atelie && P.atelie.google; if (!g || !GOOGLE_PEDIR) return '';
  return `<section class="card aval-card"><h3>${ic('star')} Que bom que você gostou!</h3>
   <p class="small" style="margin:4px 0 10px">Pode deixar a sua avaliação também no Google? Leva um minutinho e ajuda outras mulheres a encontrarem o ateliê.${GOOGLE_PEDIR.texto ? ' Já copiamos o seu comentário: é só colar lá.' : ''}</p>
   <div class="row"><a class="btn primary" href="${esc(g)}" target="_blank" rel="noopener" data-google>${ic('star')}Avaliar no Google</a><button class="btn ghost" data-google-fechar>Agora não</button></div></section>`;
}
function avaliarCard() {
  const u = paraAvaliar()[0]; if (!u) return '';
  return `<section class="card aval-card"><h3>${ic('star')} Como foi o seu atendimento?</h3><p class="small muted" style="margin:4px 0 10px">${esc(u.servico)} em ${dataBR(u.data)}. Sua opinião ajuda o ateliê a melhorar sempre.</p>
   <div class="estrelas-in" role="radiogroup" aria-label="Nota">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="false" aria-label="${n} estrela${n > 1 ? 's' : ''}" data-nota="${n}" data-ag="${esc(u.id)}">★</button>`).join('')}</div></section>`;
}
function cuidadosCard() {
  const c = P.cuidados; if (!c) return '';
  const hj = new Date(); hj.setHours(0, 0, 0, 0); const ate = parse(c.manutAte); const dias = Math.round((ate - hj) / 864e5);
  const ini = parse(c.data); const tot = Math.max(1, Math.round((ate - ini) / 864e5)); const pct = Math.max(0, Math.min(100, Math.round((tot - Math.max(0, dias)) / tot * 100)));
  const w = wa(`Oi! Aqui é ${P.nome}. Quero agendar a manutenção da minha ${c.servico} 💕`);
  return `<section class="card cuid-card"><h3>${ic('heart')} Cuidados com as suas tranças</h3>
   <p class="small muted" style="margin:4px 0 10px">${esc(c.servico)} feita em ${dataBR(c.data)}.</p>
   <div class="cuid-prazo"><div class="row between small"><span>Manutenção ideal até <b>${dataBR(c.manutAte)}</b></span><b style="color:${dias < 0 ? 'var(--bad)' : dias <= 7 ? 'var(--warn)' : 'var(--good)'}">${dias < 0 ? `vencida há ${-dias} dia${dias === -1 ? '' : 's'}` : dias === 0 ? 'é hoje' : `faltam ${dias} dia${dias === 1 ? '' : 's'}`}</b></div><div class="bar thin"><span style="width:${pct}%"></span></div></div>
   <p class="small" style="white-space:pre-wrap;margin:12px 0">${esc(c.texto)}</p>
   ${!c.temFuturo && w && dias <= 14 ? `<a class="btn primary" href="${w}" target="_blank" rel="noopener">${ic('cal')}Agendar manutenção</a>` : ''}</section>`;
}
function indicacaoCard() {
  const i = P.indicacao; if (!i || !i.codigo) return '';
  const link = `${location.origin}/catalogo?ind=${encodeURIComponent(i.codigo)}`;
  const txt = `Amiga, conheça o ateliê da ${(P.atelie && primeiro(P.atelie.responsavel)) || 'Stéfany'} 💕 Usando o meu código ${i.codigo} você ganha ${i.beneficioNova}. Veja os modelos: ${link}`;
  return `<section class="card ind-card"><h3>${ic('gift')} Indique e ganhe</h3>
   <p class="small" style="margin:4px 0 10px">Cada amiga que vier pelo seu código e fizer o atendimento vale <b>${esc(i.beneficio)}</b>. Ela ganha <b>${esc(i.beneficioNova)}</b>.</p>
   <div class="ind-cod"><span class="small muted">Seu código</span><b>${esc(i.codigo)}</b></div>
   <div class="row" style="margin-top:10px"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${ic('chat')}Indicar pelo WhatsApp</a><button class="btn soft" data-copiar="${esc(txt)}">${ic('file')}Copiar convite</button></div>
   ${i.indicadas ? `<p class="small muted" style="margin:10px 0 0">Você já indicou ${i.indicadas} amiga${i.indicadas > 1 ? 's' : ''}. Obrigada! 💕</p>` : ''}</section>`;
}
function abrirAvaliacao(agId, nota) {
  const ja = minhaAval(agId);
  const u = ja || (P.paraAvaliar || []).find(x => x.id === agId) || (P.ultimos || []).find(x => x.id === agId); if (!u) return;
  if (ja && !nota) nota = ja.nota;
  const back = document.createElement('div'); back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Avaliar atendimento"><div class="grab"></div><div class="sheet-head"><h2>${ja ? 'Editar avaliação' : 'Avaliar atendimento'}</h2><button class="icon-btn" data-fechar aria-label="Fechar">${ic('x')}</button></div>
   <form class="form" id="fAv"><p class="small muted" style="margin:0">${esc(u.servico)} em ${dataBR(u.data)}</p>
    <div class="estrelas-in grande" role="radiogroup" aria-label="Nota">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${n === nota}" data-n="${n}" class="${n <= nota ? 'on' : ''}">★</button>`).join('')}</div>
    <label class="fld">Conte como foi (opcional)<textarea id="avTxt" maxlength="600" placeholder="O que você mais gostou? Algo que podemos melhorar?">${esc(ja ? ja.texto : '')}</textarea></label>
    <label class="check"><input type="checkbox" id="avPub" ${ja && ja.autorizaPublicar ? 'checked' : ''}>Autorizo mostrar meu comentário no catálogo do ateliê</label>
    <label class="fld" id="avNomeBox" ${ja && ja.autorizaPublicar ? '' : 'hidden'}>Nome que aparece<input id="avNome" maxlength="60" value="${esc((ja && ja.nomeExibicao) || primeiro(P.nome))}"></label>
    ${ja && ja.noCatalogo ? '<p class="small muted" style="margin:0">Ao salvar a edição, o comentário sai do catálogo até o ateliê revisar.</p>' : ''}
    <div id="avMsg" class="small" style="color:var(--bad)"></div>
    <button class="btn primary" style="justify-content:center">${ic('check')}${ja ? 'Salvar alterações' : 'Enviar avaliação'}</button></form></div>`;
  document.body.appendChild(back); document.body.style.overflow = 'hidden'; let n = nota;
  const fechar = () => { back.remove(); document.body.style.overflow = ''; };
  back.addEventListener('click', e => { if (e.target === back || e.target.closest('[data-fechar]')) { fechar(); return; }
    const b = e.target.closest('[data-n]'); if (b) { n = +b.dataset.n; $$('[data-n]', back).forEach(x => { x.classList.toggle('on', +x.dataset.n <= n); x.setAttribute('aria-checked', +x.dataset.n === n); }); } });
  $('#avPub', back).onchange = e => { $('#avNomeBox', back).hidden = !e.target.checked; };
  $('#fAv', back).onsubmit = async e => { e.preventDefault(); if (!n) { $('#avMsg', back).textContent = 'Escolha de 1 a 5 estrelas.'; return; }
    const bt = $('button.primary', back); bt.disabled = true; bt.textContent = 'Enviando…'; const pub = $('#avPub', back).checked;
    // Copia o comentário já no toque (o navegador só deixa copiar logo após um toque), para colar no Google depois.
    const txt = $('#avTxt', back).value.trim(); const copia = n >= 4 && P.atelie && P.atelie.google && txt && navigator.clipboard ? navigator.clipboard.writeText(txt).then(() => true, () => false) : Promise.resolve(false);
    try {
      const d = { nota: n, texto: txt.slice(0, 600), autorizaPublicar: pub, nomeExibicao: pub ? ($('#avNome', back).value.trim().slice(0, 60) || primeiro(P.nome)) : '' };
      if (ja) await updateDoc(doc(FS, 'avaliacoes', `${token}_${agId}`), { ...d, editadoEm: serverTimestamp(), visto: false, publicado: false });
      else await setDoc(doc(FS, 'avaliacoes', `${token}_${agId}`), { token, agendaId: agId, ...d, servico: String(u.servico || '').slice(0, 80), em: serverTimestamp() });
      MINHAS[agId] = { id: agId, data: u.data, servico: u.servico, ...d, noCatalogo: false };
      AVALIADOS.add(agId); if (!ja && n >= 4 && P.atelie && P.atelie.google) GOOGLE_PEDIR = { texto: await copia };
      fechar(); render(); toast(ja ? 'Avaliação atualizada. Obrigada! 💕' : n >= 4 ? 'Obrigada pelo carinho! 💕' : 'Obrigada! Vamos usar sua opinião para melhorar.');
      if (GOOGLE_PEDIR) setTimeout(() => document.querySelector('[data-google]')?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    } catch (err) { console.error(err); bt.disabled = false; bt.innerHTML = `${ic('check')}Enviar avaliação`; $('#avMsg', back).textContent = 'Não foi possível enviar. Tente de novo em instantes.'; }
  };
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

main.addEventListener('change', e => { if (e.target.id === 'horServ') { HOR_SERV = e.target.value; HOR_DIA = ''; render(); } });
main.addEventListener('click', e => { const b = e.target.closest('[data-cancelar]'); if (b) pedirCancelamento(b.dataset.cancelar); if (e.target.closest('[data-anam]')) abrirAnamnese();
  if (e.target.closest('[data-google-fechar]') || e.target.closest('[data-google]')) { GOOGLE_PEDIR = null; setTimeout(render, 50); if (e.target.closest('[data-google-fechar]')) return; }
  const st = e.target.closest('[data-nota]'); if (st) abrirAvaliacao(st.dataset.ag, +st.dataset.nota);
  const av = e.target.closest('[data-avaliar]'); if (av) abrirAvaliacao(av.dataset.avaliar, 0);
  const px = e.target.closest('[data-pix]'); if (px) navigator.clipboard.writeText(px.dataset.pix).then(() => toast('Código Pix copiado. Cole no app do seu banco.'), () => toast('Não foi possível copiar', true));
  const ics = e.target.closest('[data-ics]'); if (ics) salvarNaAgenda(ics.dataset.ics);
  const cf = e.target.closest('[data-confirmar]'); if (cf) { cf.disabled = true; confirmarPresenca(cf.dataset.confirmar); }
  const hd = e.target.closest('[data-hdia]'); if (hd) { HOR_DIA = hd.dataset.hdia; render(); $('#horLivres') && $('#horLivres').scrollIntoView({ block: 'nearest' }); }
  const hp = e.target.closest('[data-hpedir]'); if (hp) pedirHorario(hp.dataset.hpedir);
  const cp = e.target.closest('[data-copiar]'); if (cp) navigator.clipboard.writeText(cp.dataset.copiar).then(() => toast('Convite copiado'), () => toast('Não foi possível copiar', true)); });

async function carregar() {
  const s = await getDoc(doc(FS, 'portal', token));
  if (!s.exists()) { estado(main, 'Link inválido', 'Este link não está mais ativo. Peça um novo link ao ateliê.'); return false; }
  P = s.data();
  const q = await getDocs(collection(FS, 'portal', token, 'proximos'));
  PROX = q.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!HOR) HOR = await getDoc(doc(FS, 'vitrine', 'horarios')).then(x => x.exists() && x.data().ligado !== false ? x.data() : null).catch(() => null);
  render(); return true;
}
(async () => {
  if (!token) { estado(main, 'Link incompleto', 'Abra o link exatamente como recebeu no WhatsApp.'); return; }
  try { await carregar(); } catch (e) { console.error(e); estado(main, 'Não foi possível abrir', 'Verifique a internet e tente de novo.'); }
})();
