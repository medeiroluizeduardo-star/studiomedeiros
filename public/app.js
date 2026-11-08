import { DEMO, mensagens, initializeApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, updateDoc, query, where, Timestamp, arrayUnion, arrayRemove, deleteField, serverTimestamp } from './fb.js';
import { firebaseConfig } from './firebase-config.js';
/* Stéfany Medeiros Trancista · sistema de gestão (Firebase) */
/* ================= utilidades ================= */
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const addMonths=(k,n)=>{const d=parse(k+'-01');d.setMonth(d.getMonth()+n);return ymd(d).slice(0,7)};
const diffDays=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const ym=s=>String(s||'').slice(0,7);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const BRL=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const pct=v=>(isFinite(v)?v:0).toLocaleString('pt-BR',{style:'percent',maximumFractionDigits:0});
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MES3=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const SEM=['dom','seg','ter','qua','qui','sex','sáb'];
const SEMX=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const cap=s=>String(s).replace(/^./,c=>c.toUpperCase());
const dataLonga=s=>{const d=parse(s);return `${SEMX[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`};
const dataExt=s=>{const d=parse(s);return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`};
const dataCurta=s=>{const d=parse(s);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}`};
const dataBR=s=>s?`${dataCurta(s)}/${String(s).slice(0,4)}`:'';
const mesNome=k=>{const[y,m]=k.split('-');return `${MESES[+m-1]} de ${y}`};
const hm2min=h=>{const[a,b]=String(h||'0:0').split(':').map(Number);return a*60+(b||0)};
const min2hm=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
const durTxt=m=>{m=+m||0;return `${Math.floor(m/60)}h${m%60?pad(m%60):''}`};
const iniciais=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();
const primeiro=n=>String(n||'').trim().split(/\s+/)[0]||'';
const digits=s=>String(s||'').replace(/\D/g,'');
const waLink=(tel,msg)=>{let d=digits(tel);if(!d)return null;if(d.length<=11)d='55'+d;return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`};
const soma=a=>a.reduce((s,l)=>s+(+l.valor||0),0);
const nowIso=()=>new Date().toISOString();

const I={
 home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
 cal:'M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 5 5z',
 users:'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.87M15.5 3.13a3.5 3.5 0 0 1 0 6.75',
 wallet:'M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3M3 7.5V17a2 2 0 0 0 2 2h15V8H5.5A2.5 2.5 0 0 1 3 5.5M16.5 13.5h.01',
 spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
 gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
 plus:'M12 5v14M5 12h14',chat:'M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z',
 check:'M5 12.5l4.5 4.5L19 7.5',x:'M6 6l12 12M18 6 6 18',left:'M15 18l-6-6 6-6',right:'M9 6l6 6-6 6',
 search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',edit:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
 trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
 down:'M12 4v11M7 10l5 5 5-5M5 20h14',gift:'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1s3 1 5 1zM12 7c1.5-3 5-3.5 5-1s-3 1-5 1z',
 alert:'M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
 send:'M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z',copy:'M9 9h11v11H9zM5 15H4V4h11v1',up:'M12 20V9M7 14l5-5 5 5M5 4h14',info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
 file:'M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8zM14 3v5h5M8.5 13h7M8.5 16.5h5',
 box:'M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9',
 ticket:'M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a2 2 0 0 1 0-4 2 2 0 0 0 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zM14 6v2M14 11v2M14 16v2',
 shield:'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM9 12l2 2 4-4',
 grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
 list:'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',pen:'M3 21c3-1 5-3 7-6l7-7a2.1 2.1 0 0 0-3-3l-7 7c-3 2-5 4-6 7zM14 6l4 4',
 image:'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',lock:'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
 sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',moon:'M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z',auto:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M12 7h4.5M12 11h6M12 15h5.5M12 19h2.5',receipt:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',repeat:'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3'
};
const ic=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[n]}"/></svg>`;
const marcaImg=(n=34)=>`<img class="marca" src="/img/marca.webp" width="${n}" height="${n}" alt="" decoding="async">`;
const MARCA_TXT='<div><div class="brand-name">Stéfany</div><div class="brand-sub">Medeiros · Trancista</div></div>';
function braidMark(size=34,spin=false){
  const cols=['var(--accent)','var(--accent-ink)','var(--gold)'];let paths='';
  for(let k=0;k<3;k++){let d='';for(let i=0;i<=28;i++){const y=3+i*(34/28);const x=14+7*Math.sin(i/28*Math.PI*3+k*2*Math.PI/3);d+=(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)}
    paths+=`<path d="${d}" stroke="${cols[k]}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`}
  return `<svg class="${spin?'braid-spin':''}" width="${size*.7}" height="${size}" viewBox="0 0 28 40" aria-hidden="true">${paths}</svg>`;
}

/* ================= constantes ================= */
const CAT_REC=['Serviço de trança','Manutenção','Retirada','Sinal','Pacotes','Vale-presente','Venda de produto','Outras receitas'];
const CAT_DES=['Cabelo / fibra','Materiais (pomada, linha, elástico)','DAS-MEI','Aluguel / espaço','Transporte','Marketing e redes','Equipamentos','Cursos','Taxas de maquininha','Retirada pró-labore','Outras despesas'];
const FORMAS=['Pix','Dinheiro','Cartão de débito','Cartão de crédito','Transferência'];
const CAT_EST=['Cabelo / fibra','Pomadas e finalizadores','Linhas e elásticos','Miçangas e acessórios','Higiene e descartáveis','Outros'];
const ORIGENS=['Instagram','Indicação','TikTok','WhatsApp','Google','Passou no ateliê','Outro'];
const STATUS={agendado:{n:'Agendado',c:'var(--accent)'},confirmado:{n:'Confirmado',c:'var(--good)'},concluido:{n:'Concluído',c:'var(--accent-ink)'},cancelado:{n:'Cancelado',c:'var(--muted)'},faltou:{n:'Faltou',c:'var(--bad)'}};
const NIVEIS={
 perola:{n:'Pérola',c:'var(--lv-perola)',min:75,b:'10% em todos os serviços, prioridade na agenda e mimo de aniversário.'},
 ouro:{n:'Ouro Rosé',c:'var(--lv-ouro)',min:50,b:'5% de desconto e manutenção com valor especial.'},
 prata:{n:'Prata',c:'var(--lv-prata)',min:25,b:'Brinde (finalizador ou acessório) a cada 3 atendimentos.'},
 bronze:{n:'Bronze',c:'var(--lv-bronze)',min:0,b:'Cupom de retorno válido por 60 dias para trazer de volta.'},
 nova:{n:'Nova',c:'var(--lv-nova)',min:-1,b:'Boas-vindas: 5% na segunda visita.'}
};
const PAPEIS={owner:'Proprietária',parceira:'Trancista parceira',recepcao:'Recepção',contador:'Contador(a)'};
const DEF_PUB={nome:'Stéfany Medeiros Trancista',responsavel:'Stéfany Medeiros',cnpj:'',municipio:'Serra - ES',endereco:'',whatsapp:'',abre:'08:00',fecha:'20:00',dias:[1,2,3,4,5,6],intervaloIni:'',intervaloFim:'',folgas:[],instagram:'',descAniv:10,started:false};
const DEF_PRIV={das:86.05,limite:81000,inicioMei:'',meta:4000,dasPagos:{},taxaDebito:1.99,taxaCredito:4.98,taxaParcelado:9.9};
const ANAM_Q=[
 ['couro','Sente sensibilidade ou dor no couro cabeludo?'],
 ['dermatite','Tem dermatite, psoríase, caspa intensa ou feridas no couro cabeludo?'],
 ['queda','Tem queda acentuada, falhas ou alopecia (inclusive por tração)?'],
 ['quimica','Fez química nos últimos 30 dias (alisamento, relaxamento, coloração, descoloração)?'],
 ['alergia','Tem alergia a produtos, fibras sintéticas, pomadas ou fragrâncias?'],
 ['gestante','Está gestante ou amamentando?'],
 ['medic','Usa medicamento contínuo ou faz tratamento dermatológico?'],
 ['cirurgia','Fez cirurgia, procedimento ou tem pontos recentes na cabeça?'],
 ['cefaleia','Tem enxaqueca ou dor de cabeça frequente?']
];

/* ================= armazenamento (Firestore) e perfis ================= */
const ALL_COLS=['clientes','servicos','agenda','estoque','pacotes','vales','espera','anamneses','aceites','ideias','publico','equipe','pedidos','lancamentos','contas','privado','catalogo','contratosLink','solicitacoes','cadastros','anamnesePortal','avaliacoes','erros'];
const COLS_POR_PAPEL={
  owner:ALL_COLS,
  parceira:['clientes','servicos','agenda','estoque','pacotes','vales','espera','anamneses','aceites','ideias','publico','catalogo','contratosLink','solicitacoes','cadastros','anamnesePortal','avaliacoes'],
  recepcao:['clientes','servicos','agenda','pacotes','vales','espera','aceites','ideias','publico','catalogo','contratosLink','solicitacoes','cadastros','avaliacoes'],
  contador:['servicos','agenda','pacotes','vales','publico','lancamentos','contas','privado']
};
const S={};ALL_COLS.forEach(c=>S[c]=new Map());
let MODE='db',ROLE='carregando',ME=null,EMAIL='',APP=null,AUTH=null,FS=null,ACESSO=null;const ctl={acesso:null,equipe:null,avisos:null,avEstado:null};let MEUS_AVISOS=null,AV_ESTADO=null;
let NEED=new Set();const loaded=new Set();const OUV=new Map();
/* Histórico sob demanda: agenda e lançamentos vêm só a partir de 1º de janeiro do ano passado (cobre fidelidade de
   12 meses, limite do MEI do ano e do anterior, retornos). Cada abertura do sistema relê do Firebase só esse período,
   e não tudo desde o começo; isso poupa a cota grátis de leituras. Os anos anteriores são buscados quando alguém abre
   um mês antigo (Finanças, Agenda, Datas), pede o histórico de uma cliente ou baixa a cópia de segurança. */
const JANELA=new Set(['agenda','lancamentos']);
const corte=()=>(+today().slice(0,4)-1)+'-01-01';
let HIST=false,histProm=null;
let DATAV=0;const MEMO=new Map();
// a versão inclui o dia: depois da meia-noite os cálculos que usam "hoje" são refeitos
const memo=(k,fn)=>{const v=DATAV+'|'+today();const m=MEMO.get(k);if(m&&m.v===v)return m.r;const r=fn();MEMO.set(k,{v,r});return r};
const arr=c=>[...S[c].values()];
const isOwner=()=>ROLE==='owner';
function pode(f){const own=isOwner(),r=ROLE;
  switch(f){
    case 'fin':return own||r==='contador';
    case 'finEdit':case 'custos':case 'equipe':case 'politicaEdit':case 'precos':case 'seed':return own;
    case 'anamnese':case 'estoque':return own||r==='parceira';
    case 'contratos':case 'base':case 'portal':return own||r==='parceira'||r==='recepcao';
    case 'catalogoEdit':return own;
    default:return own;
  }}
const pub=()=>({...DEF_PUB,...(S.publico.get('config')||{})});
const priv=()=>({...DEF_PRIV,...(S.privado.get('config')||{})});

function limpaUndef(o){return JSON.parse(JSON.stringify(o))}
function save(col,id,data,{quiet}={}){
  id=id||uid();const rec=limpaUndef({...data});delete rec.id;
  rec.atualizadoEm=nowIso();rec.atualizadoPor=ME||'';
  S[col].set(id,{id,...rec});touch(col);
  // Não esperamos a confirmação do servidor: sem internet, o Firestore guarda e envia depois.
  setDoc(doc(FS,col,id),rec).catch(e=>{if(!quiet)dbErr(e)});
  return Promise.resolve(id);
}
function del(col,id){S[col].delete(id);touch(col);deleteDoc(doc(FS,col,id)).catch(dbErr);return Promise.resolve()}
async function pool(tasks,n=8){const q=[...tasks];const run=async()=>{while(q.length){const t=q.shift();try{await t()}catch(e){}}};await Promise.all([...Array(n)].map(run))}
function dbErr(e){const c=e&&e.code;toast(c==='permission-denied'?'Seu perfil não tem permissão para esta alteração.':c==='resource-exhausted'?'Limite diário do plano gratuito atingido. Tente amanhã ou mude de plano.':'Não foi possível salvar. Verifique a internet e tente de novo.','erro');console.error(e)}
// Os cálculos guardados (memo) só dependem destas coleções; mudança nas outras (ideias, estoque, erros, avisos…)
// redesenha a tela sem refazer fidelidade, finanças e retornos de todas as clientes.
const MEMO_COLS=new Set(['clientes','agenda','servicos','lancamentos','pacotes','vales','privado','publico']);
function touch(col){if(!col||MEMO_COLS.has(col))DATAV++;schedule()}

function pararDados(){OUV.forEach(u=>{try{u()}catch(e){}});OUV.clear();loaded.clear();HIST=false;histProm=null;ALL_COLS.forEach(c=>S[c]=new Map());NEED=new Set()}
function pararTudo(){pararDados();MEUS_AVISOS=null;AV_ESTADO=null;['acesso','equipe','avisos','avEstado'].forEach(k=>{if(ctl[k]){try{ctl[k]()}catch(e){}ctl[k]=null}});ACESSO=null}
function consulta(c){let q=collection(FS,c);
  if(c==='aceites'&&ROLE==='recepcao')q=query(q,where('tipo','in',['servico','politica']));
  if(c==='contratosLink')q=query(q,where('criadoEm','>=',addDays(today(),-120)));
  if(c==='cadastros')q=query(q,where('criadoEm','>=',addDays(today(),-90)));
  if(JANELA.has(c)&&!HIST)q=query(q,where('data','>=',corte()));
  return q}
function ouvir(c,pronto){
  // Na primeira leitura monta a coleção inteira; depois só aplica o que mudou (uma agenda com milhares de
  // atendimentos não é refeita inteira a cada horário marcado).
  // quem espera o histórico (pronto) precisa saber quando a resposta veio do servidor, e não só do aparelho
  const u=onSnapshot(consulta(c),{includeMetadataChanges:!!pronto},snap=>{
      if(pronto&&snap.metadata&&snap.metadata.fromCache&&loaded.has(c)&&snap.docChanges&&!snap.docChanges().length)return;
      if(loaded.has(c)&&typeof snap.docChanges==='function')snap.docChanges().forEach(ch=>{if(ch.type==='removed')S[c].delete(ch.doc.id);else S[c].set(ch.doc.id,{id:ch.doc.id,...ch.doc.data()})});
      else{const m=new Map();snap.docs.forEach(d=>m.set(d.id,{id:d.id,...d.data()}));S[c]=m}
      loaded.add(c);touch(c);agendaProcessar();if(pronto&&!(snap.metadata&&snap.metadata.fromCache)){pronto();pronto=null}},
    err=>{console.error(c,err);loaded.add(c);touch(c);if(pronto)pronto();if(err.code==='permission-denied')toast('Seu acesso mudou. Entre novamente.')});
  const antigo=OUV.get(c);OUV.set(c,u);if(antigo)try{antigo()}catch(e){}}
function subscribe(cols){NEED=new Set(cols);cols.forEach(c=>ouvir(c))}
/** Busca também os anos anteriores ao corte (uma vez por abertura). Responde quando chegaram (ou em até 15 s). */
function carregarHistorico(){if(histProm)return histProm;if(HIST||!FS)return Promise.resolve();HIST=true;
  const cs=[...JANELA].filter(c=>NEED.has(c));if(cs.length)toast('Buscando os anos anteriores…');
  histProm=Promise.all(cs.map(c=>new Promise(ok=>{const t=setTimeout(ok,15000);ouvir(c,()=>{clearTimeout(t);ok()})}))).then(()=>{touch()});
  return histProm}
const histAte=()=>HIST?'':corte();
/* telas que mostram um período antes do corte pedem o histórico sozinhas */
function histPelaTela(){if(HIST)return;const cm=corte().slice(0,7);
  if((UI.view==='financeiro'&&UI.finMes<cm)||(UI.view==='calendario'&&UI.calMes<cm)||(UI.view==='agenda'&&UI.agDia<corte()))carregarHistorico()}
const configPendente=()=>!DEMO&&!firebaseConfig||!firebaseConfig.apiKey||/COLE|SUA_/i.test(firebaseConfig.apiKey);

function virarPapel(papel){if(ROLE===papel)return;pararDados();ROLE=papel;errEnviar();vigiarAvisos();if(COLS_POR_PAPEL[papel]){if(!visiveis().some(v=>v[0]===UI.view))UI.view=visiveis()[0][0];subscribe(COLS_POR_PAPEL[papel])}render()}
function vigiarEquipe(user){
  if(ctl.equipe)return;
  ctl.equipe=onSnapshot(doc(FS,'equipe',ME),s=>{
    if(ROLE==='owner')return;
    const d=s.exists()?s.data():null;const papel=d&&d.ativo!==false&&COLS_POR_PAPEL[d.papel]&&d.papel!=='owner'?d.papel:null;
    if(papel)virarPapel(papel);
    else if(ROLE!=='pendente'){virarPapel('pendente');setDoc(doc(FS,'pedidos',ME),{email:EMAIL,nome:user.displayName||'',pedidoEm:nowIso()}).catch(()=>{})}
  },()=>virarPapel('pendente'));
}
/* ================= avisos no celular =================
   Cada pessoa liga no próprio aparelho (Ajustes). O token do aparelho fica em avisos/{uid}; a rotina "Avisos no celular"
   do GitHub decide e envia (integracao/admin/avisos.mjs). A chave Web Push (pública) fica em publico/avisos. */
const AV_TIPOS={novidades:['Novidades das clientes pelo link',['owner','parceira','recepcao']],concluir:['Atendimentos de hoje sem concluir (20h)',['owner','parceira','recepcao']],amanha:['Agenda de amanhã (19h)',['owner','parceira','recepcao']],contas:['Contas e DAS a pagar (8h)',['owner','contador']],semana:['Resumo da semana (segunda, 8h)',['owner']]};
const AV_LS='smt-aviso-token';
function vigiarAvisos(){['avisos','avEstado'].forEach(k=>{if(ctl[k]){try{ctl[k]()}catch(e){}ctl[k]=null}});MEUS_AVISOS=null;AV_ESTADO=null;
  if(!FS||!ME||!PAPEIS[ROLE])return;
  ctl.avisos=onSnapshot(doc(FS,'avisos',ME),s=>{MEUS_AVISOS=s.exists()?s.data():{};touch('avisos')},()=>{});
  if(ROLE==='owner')ctl.avEstado=onSnapshot(doc(FS,'avisosEstado','estado'),s=>{AV_ESTADO=s.exists()?s.data():null;touch('avisos')},()=>{})}
const avToken=()=>{try{return localStorage.getItem(AV_LS)||''}catch(e){return ''}};
const avLigadoAqui=()=>{const t=avToken();return !!t&&!!(MEUS_AVISOS&&(MEUS_AVISOS.tokens||[]).includes(t))};
const avPrefs=()=>(MEUS_AVISOS&&MEUS_AVISOS.prefs)||{};
async function avLigar(){try{
    const vapid=(S.publico.get('avisos')||{}).vapid;if(!vapid&&!DEMO)throw new Error(isOwner()?'Primeiro cole a chave Web Push abaixo e salve.':'A proprietária ainda não configurou os avisos.');
    const M=await mensagens();
    if(!('Notification' in window)||!('serviceWorker' in navigator)||!(await M.suportado()))throw new Error('Este navegador não recebe avisos. No iPhone, primeiro use Compartilhar › Adicionar à Tela de Início e abra o sistema por esse ícone.');
    const perm=await Notification.requestPermission();
    if(perm!=='granted')throw new Error('Os avisos estão bloqueados neste aparelho. Libere nas configurações do navegador (cadeado ao lado do endereço › Notificações).');
    const reg=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;
    const token=await M.getToken(M.getMessaging(APP),{vapidKey:vapid,serviceWorkerRegistration:reg});
    if(!token)throw new Error('Não foi possível ligar os avisos neste aparelho.');
    try{localStorage.setItem(AV_LS,token)}catch(e){}
    await setDoc(doc(FS,'avisos',ME),{tokens:arrayUnion(token),prefs:avPrefs(),atualizadoEm:serverTimestamp()},{merge:true});
    toast('Avisos ligados neste aparelho')}catch(e){toast(e.message||'Não foi possível ligar os avisos.','erro');console.error(e)}}
async function avDesligar(){const t=avToken();try{localStorage.removeItem(AV_LS)}catch(e){}
  try{const M=await mensagens();await M.deleteToken(M.getMessaging(APP))}catch(e){}
  try{await setDoc(doc(FS,'avisos',ME),{tokens:((MEUS_AVISOS&&MEUS_AVISOS.tokens)||[]).filter(x=>x!==t),atualizadoEm:serverTimestamp()},{merge:true});toast('Avisos desligados neste aparelho')}catch(e){dbErr(e)}}
async function avTestar(){try{if(!('Notification' in window))throw new Error('Este navegador não mostra avisos.');
    if(Notification.permission!=='granted'&&(await Notification.requestPermission())!=='granted')throw new Error('Os avisos estão bloqueados neste aparelho.');
    const reg=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;
    await reg.showNotification('Stéfany Trancista',{body:'Assim chegam os avisos neste aparelho.',icon:'icon-192.png',badge:'icon-192.png',tag:'teste',data:{url:'/#inicio'}});
  }catch(e){toast(e.message||'Não foi possível testar.','erro')}}
function cardAvisos(){if(!PAPEIS[ROLE])return '';const own=isOwner();const vapid=(S.publico.get('avisos')||{}).vapid||'';const aqui=avLigadoAqui();const pr=avPrefs();
  const tipos=Object.entries(AV_TIPOS).filter(([,[,ps]])=>ps.includes(ROLE));
  const est=AV_ESTADO;const quando=est&&toMs(est.ultimaExecucao)?new Date(toMs(est.ultimaExecucao)):null;
  return `<section class="card"><h3>Avisos no celular <small>${aqui?'ligados neste aparelho':'desligados neste aparelho'}</small></h3>
   <p class="small muted" style="margin-top:0">Recebe no celular o que é do seu perfil, sem nomes de clientes na tela bloqueada. No iPhone, primeiro use Compartilhar › Adicionar à Tela de Início e abra o sistema por esse ícone.</p>
   <div class="row">${aqui?`<button class="btn soft" data-act="avDesligar">${ic('x')}Desligar neste aparelho</button>`:`<button class="btn primary" data-act="avLigar">${ic('send')}Ligar avisos neste aparelho</button>`}<button class="btn ghost" data-act="avTestar">Testar neste aparelho</button></div>
   ${tipos.length?`<div class="stack" style="gap:6px;margin-top:12px">${tipos.map(([k,[n]])=>`<label class="row" style="gap:8px;font-size:.9rem"><input type="checkbox" data-avpref="${k}" ${pr[k]!==false?'checked':''}> ${esc(n)}</label>`).join('')}</div>`:''}
   ${own?`<form class="form" id="fAvChave" style="margin-top:14px"><label class="fld">Chave Web Push (só a proprietária, uma vez)<input id="avChave" value="${esc(vapid)}" placeholder="começa com B…" autocomplete="off"></label><div class="small muted">Firebase › Configurações do projeto › Cloud Messaging › Certificados push da Web › Gerar par de chaves. É uma chave pública.</div><div class="row"><button class="btn soft">Salvar chave</button></div></form>
   <p class="small muted" style="margin-bottom:0">${quando?`Rotina do GitHub rodou ${dataCurta(ymd(quando))} às ${pad(quando.getHours())}:${pad(quando.getMinutes())}: ${est.pessoas||0} pessoa(s) e ${est.aparelhos||0} aparelho(s) com aviso ligado, ${((est.ultimoResultado||{}).entregues)||0} aviso(s) entregue(s) na última vez.`:'A rotina "Avisos no celular" do GitHub ainda não rodou.'}</p>`:''}</section>`}

/* ================= erros nos aparelhos =================
   Quando uma tela falha no celular ou no computador de alguém da equipe, o erro fica anotado na coleção "erros"
   (só a proprietária vê, em Ajustes › Conta e dados). No máximo 5 registros por abertura, o mesmo erro uma vez só
   (as repetições viram "vezes"), sem nada do que foi digitado, e nada de erros de extensões do navegador ou de internet. */
const ERR={vistos:new Map(),gravados:0,t:null,versao:''};
try{caches.keys().then(k=>{ERR.versao=(k.find(n=>n.startsWith('smt-'))||'').slice(0,40)}).catch(()=>{})}catch(e){}
const ERR_IGNORA=/ResizeObserver loop|Script error\.?$|Failed to fetch|NetworkError|Load failed|network-request-failed|unavailable|offline|AbortError|The operation was aborted|QuotaExceeded/i;
const corta=(x,n)=>String(x==null?'':x).replace(/\s+/g,' ').trim().slice(0,n);
function errAparelho(){const ua=navigator.userAgent||'';
  const so=(/Android [\d.]+/.exec(ua)||[])[0]||((/iPhone OS [\d_]+/.exec(ua)||[])[0]||'').replace(/_/g,'.')||(/Windows/.test(ua)?'Windows':/Mac OS X/.test(ua)?'Mac':/Linux/.test(ua)?'Linux':'');
  const nav=((/(Edg|SamsungBrowser|Chrome|Firefox|Version)\/\d+/.exec(ua)||[])[0]||'').replace('Version','Safari');
  return corta(`${so} · ${nav} · ${innerWidth}x${innerHeight}`,200)}
function errAnotar(msg,onde){msg=corta(msg,300);onde=corta(onde,200);
  if(!msg||ERR_IGNORA.test(msg))return;
  if(onde&&/^(chrome|moz|safari)-extension:|^https?:/.test(onde)&&!onde.includes(location.host))return;
  const k=msg+'|'+onde;const v=ERR.vistos.get(k);if(v){v.dados.vezes=Math.min(1000,v.dados.vezes+1);return}
  if(ERR.vistos.size>=50)return;
  ERR.vistos.set(k,{dados:{msg,onde:onde.replace(location.origin+'/',''),tela:corta(typeof UI!=='undefined'?UI.view:'',40),aparelho:errAparelho(),vezes:1},gravado:false});errEnviar()}
function errEnviar(){if(ERR.t||!FS||!ME||!PAPEIS[ROLE])return;
  // espera um pouco para juntar repetições do mesmo erro num registro só
  ERR.t=setTimeout(()=>{ERR.t=null;if(!FS||!ME||!PAPEIS[ROLE])return;for(const v of ERR.vistos.values()){if(v.gravado||ERR.gravados>=5)continue;v.gravado=true;ERR.gravados++;
    setDoc(doc(collection(FS,'erros')),{quando:serverTimestamp(),uid:ME,...v.dados,versao:ERR.versao}).catch(()=>{})}},3000)}
window.addEventListener('error',ev=>{if(!ev.error&&!ev.message)return;const er=ev.error;
  const onde=ev.filename?`${ev.filename}:${ev.lineno||0}`:er&&er.stack?(String(er.stack).split('\n')[1]||'').trim():'';
  errAnotar(er instanceof Error?`${er.name}: ${er.message}`:String(ev.message||er),onde)});
window.addEventListener('unhandledrejection',ev=>{const r=ev.reason;if(!r||(r.code&&!(r instanceof Error)))return;
  errAnotar(r instanceof Error?`${r.name}: ${r.message}`:String(r),r&&r.stack?(String(r.stack).split('\n')[1]||'').trim():'')});
function cardErros(){const L=arr('erros').sort((a,b)=>toMs(b.quando)-toMs(a.quando));
  const quando=x=>{const ms=toMs(x.quando);if(!ms)return '';const d=new Date(ms);return `${dataCurta(ymd(d))} ${pad(d.getHours())}:${pad(d.getMinutes())}`};
  return `<section class="card"><h3>Erros nos aparelhos <small>${L.length?`${L.length} registro(s)`:'nenhum'}</small></h3><p class="small muted" style="margin-top:0">Quando uma tela falha no celular ou no computador de alguém da equipe, fica anotado aqui (a tela, o tipo de aparelho e a mensagem técnica). Sem nada do que foi digitado. Serve para corrigir o sistema.</p>
   ${L.length?`<div class="list">${L.slice(0,30).map(x=>`<div class="item"><div class="avatar" style="--lv:var(--bad)">${ic('alert')}</div><div class="grow" style="min-width:0"><div class="t" style="overflow-wrap:anywhere">${esc(x.msg)}</div><div class="s" style="overflow-wrap:anywhere">${esc(quando(x))} · ${esc(nomePessoa(x.uid)||'—')}${x.tela?` · tela ${esc(x.tela)}`:''}${x.vezes>1?` · ${x.vezes} vezes`:''}<br>${esc(x.aparelho||'')}${x.onde?` · ${esc(x.onde)}`:''}</div></div></div>`).join('')}</div>
   <div class="row" style="margin-top:10px"><button class="btn danger soft" data-act="errosApagar">${ic('trash')}Apagar todos</button></div>`:''}</section>`}
async function boot(){
  if(configPendente()){ROLE='config';render();return}
  APP=initializeApp(firebaseConfig);AUTH=getAuth(APP);
  try{FS=initializeFirestore(APP,{ignoreUndefinedProperties:true,localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}
  catch(e){FS=initializeFirestore(APP,{ignoreUndefinedProperties:true})}
  window.addEventListener('online',schedule);window.addEventListener('offline',schedule);
  onAuthStateChanged(AUTH,async user=>{
    pararTudo();
    if(!user){ME=null;EMAIL='';ROLE='login';render();return}
    ME=user.uid;EMAIL=user.email||'';ROLE='carregando';render();
    ctl.acesso=onSnapshot(doc(FS,'sistema','acesso'),s=>{
      ACESSO=s.exists()?s.data():null;
      if(!ACESSO){if(ctl.equipe){ctl.equipe();ctl.equipe=null}virarPapel('primeiro');return}
      const dona=(ACESSO.donas||[]).includes(ME);
      if(dona){if(ctl.equipe){ctl.equipe();ctl.equipe=null}virarPapel('owner');
        const info=(ACESSO.donasInfo||{})[ME];if(!info||info.email!==EMAIL)updateDoc(doc(FS,'sistema','acesso'),{['donasInfo.'+ME]:{email:EMAIL,nome:(info&&info.nome)||user.displayName||''}}).catch(()=>{});
        touch()}
      else{if(ROLE==='owner'||ROLE==='carregando'||ROLE==='primeiro'){if(ROLE==='owner'){pararDados();ROLE='carregando'}vigiarEquipe(user)}touch()}
    },err=>{console.error(err);ROLE='erro';render()});
  });
}
async function virarDona(){try{await setDoc(doc(FS,'sistema','acesso'),{donas:[ME],donasInfo:{[ME]:{email:EMAIL,nome:''}},criadoEm:nowIso()});toast('Pronto! Esta conta é a proprietária.')}
  catch(e){toast('Não foi possível. Outra conta já é a proprietária.','erro');console.error(e)}}
async function tornarDona(u){const e=S.equipe.get(u)||{},p=S.pedidos.get(u)||{};
  try{await updateDoc(doc(FS,'sistema','acesso'),{donas:arrayUnion(u),['donasInfo.'+u]:{email:e.email||p.email||'',nome:e.apelido||p.nome||''}});
    if(S.equipe.has(u))await del('equipe',u);if(S.pedidos.has(u))await del('pedidos',u);toast('Acesso de proprietária liberado')}catch(err){dbErr(err)}}
async function removerDona(u){const ds=(ACESSO&&ACESSO.donas)||[];if(u===ME){toast('Você não pode remover o seu próprio acesso.','erro');return}if(ds.length<2){toast('O sistema precisa de pelo menos uma proprietária.','erro');return}
  try{await updateDoc(doc(FS,'sistema','acesso'),{donas:arrayRemove(u),['donasInfo.'+u]:deleteField()});toast('Acesso de proprietária removido')}catch(err){dbErr(err)}}

/* nomes da equipe */
function nomePessoa(id){if(!id)return '';if(id===ME)return 'Você';if(id==='link')return 'Cliente, pelo link';const di=ACESSO&&ACESSO.donasInfo&&ACESSO.donasInfo[id];if(di)return di.nome||di.email||'Proprietária';
  const e=S.equipe.get(id);if(e&&(e.apelido||e.email))return e.apelido||e.email;const p=S.pedidos.get(id);if(p)return p.nome||p.email;
  return isOwner()?'Proprietária ou equipe':'Pessoa da equipe'}

/* download e impressão (fora do Claude, o navegador baixa normalmente) */
function salvarArquivo(nome,conteudo){const blob=conteudo instanceof Blob?conteudo:new Blob([conteudo],{type:/\.csv$/.test(nome)?'text/csv;charset=utf-8':/\.html$/.test(nome)?'text/html;charset=utf-8':/\.json$/.test(nome)?'application/json':/\.xlsx$/.test(nome)?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/octet-stream'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('Arquivo baixado');return true}

/* ================= regras de negócio ================= */
const nomeCli=id=>S.clientes.get(id)?.nome||'Cliente avulsa';
const nomeServ=id=>S.servicos.get(id)?.nome||'Serviço';
const servsAg=a=>[a.servicoId,...(Array.isArray(a.extras)?a.extras:[])].filter(Boolean);
const nomeAg=a=>a.servicoNome&&!a.servicoId?a.servicoNome:servsAg(a).map(nomeServ).join(' + ')||'Serviço';
function catServ(sid){const n=nomeServ(sid);return /manuten/i.test(n)?'Manutenção':/retirada/i.test(n)?'Retirada':'Serviço de trança'}
const ehComercio=l=>l.categoria==='Venda de produto';

const agPorCli=()=>memo('agCli',()=>{const m=new Map();arr('agenda').forEach(a=>{if(!m.has(a.clienteId))m.set(a.clienteId,[]);m.get(a.clienteId).push(a)});return m});
const indPorCli=()=>memo('indCli',()=>{const m=new Map();arr('clientes').forEach(c=>{if(c.indicadaPor)m.set(c.indicadaPor,(m.get(c.indicadaPor)||0)+1)});return m});
function fidelidade(cli,ref=today()){const cache=memo('fid',()=>new Map());const k=cli.id+'|'+ref;if(cache.has(k))return cache.get(k);const r=calcFidelidade(cli,ref);cache.set(k,r);return r}
function calcFidelidade(cli,ref){
  const umAno=addDays(ref,-365);
  const ag=agPorCli().get(cli.id)||[];
  const concl=ag.filter(a=>a.status==='concluido'&&a.data<=ref).sort((a,b)=>a.data<b.data?1:-1);
  const conc12=concl.filter(a=>a.data>=umAno);
  const faltas=ag.filter(a=>a.status==='faltou'&&a.data>=umAno).length;
  const gasto=conc12.reduce((s,a)=>s+(+a.valor||0),0);
  const ult=concl[0]?.data||null;const dias=ult?diffDays(ult,ref):null;
  const ind=indPorCli().get(cli.id)||0;
  const p={freq:Math.min(35,conc12.length*7),valor:Math.min(30,Math.round(gasto/1500*30)),rec:dias==null?0:dias<=45?20:dias<=90?12:dias<=180?5:0,ind:Math.min(15,ind*5),pen:faltas*10};
  const score=Math.max(0,Math.min(100,p.freq+p.valor+p.rec+p.ind-p.pen));
  const nivel=concl.length===0?'nova':score>=75?'perola':score>=50?'ouro':score>=25?'prata':'bronze';
  const total=concl.reduce((s,a)=>s+(+a.valor||0),0);
  return {score,nivel,p,visitas12:conc12.length,visitas:concl.length,gasto,total,ult,dias,ind,faltas,risco:concl.length>=2&&dias>90,ticket:concl.length?total/concl.length:0};
}

/* receitas derivadas de pagamentos registrados na agenda, pacotes e vales */
function pagVirtuais(){return memo('pv',()=>{const out=[];
  const v=(col,doc,p,cat,desc,cli)=>out.push({id:`${col}:${doc.id}:${p.id}`,virtual:true,origem:col,origemId:doc.id,tipo:'receita',data:p.data,valor:+p.valor||0,categoria:cat,descricao:desc,forma:p.forma,parcelas:+p.parcelas||1,nf:!!p.nf,clienteId:cli,exemplo:doc.exemplo});
  arr('agenda').forEach(a=>(a.pagamentos||[]).forEach(p=>{if(+p.valor>0)v('agenda',a,p,p.tipo==='sinal'?'Sinal':catServ(a.servicoId),`${p.tipo==='sinal'?'Sinal · ':''}${nomeAg(a)} · ${nomeCli(a.clienteId)}`,a.clienteId)}));
  arr('pacotes').forEach(k=>(k.pagamentos||[]).forEach(p=>v('pacotes',k,p,'Pacotes',`Pacote ${k.nome} · ${nomeCli(k.clienteId)}`,k.clienteId)));
  arr('vales').forEach(x=>(x.pagamentos||[]).forEach(p=>v('vales',x,p,'Vale-presente',`Vale-presente ${x.codigo} · ${x.compradora||''}`)));
  return out})}
function taxaDe(l){const c=priv();if(l.forma==='Cartão de débito')return (+c.taxaDebito||0)/100;if(l.forma==='Cartão de crédito')return ((+l.parcelas||1)>1?+c.taxaParcelado:+c.taxaCredito)/100||0;return 0}
function todasReceitas(){return memo('rec',()=>[...arr('lancamentos').filter(l=>l.tipo==='receita'),...pagVirtuais()])}
function taxasVirtuais(){return memo('tx',()=>todasReceitas().filter(l=>taxaDe(l)>0).map(l=>({id:'taxa:'+l.id,virtual:true,origem:'taxa',tipo:'despesa',data:l.data,valor:Math.round(l.valor*taxaDe(l)*100)/100,categoria:'Taxas de maquininha',descricao:`Taxa ${l.forma.toLowerCase()}${l.parcelas>1?` ${l.parcelas}x`:''} · ${l.descricao}`,forma:l.forma,exemplo:l.exemplo})))}
function todasDespesas(){return memo('des',()=>[...arr('lancamentos').filter(l=>l.tipo==='despesa'),...taxasVirtuais()])}
const receitas=f=>f?todasReceitas().filter(f):todasReceitas();
const despesas=f=>f?todasDespesas().filter(f):todasDespesas();

function limiteAno(ano){const c=priv();const lim=+c.limite||81000;
  if(c.inicioMei&&c.inicioMei.slice(0,4)===String(ano)){const m=+c.inicioMei.slice(5,7);return lim/12*(12-m+1)}return lim}

/* contas a receber (cartões) */
function aReceber(){return memo('arec',()=>{const out=[];const c=priv();
  todasReceitas().forEach(l=>{const t=taxaDe(l);
    if(l.forma==='Cartão de crédito'){const n=Math.max(1,+l.parcelas||1);for(let i=1;i<=n;i++)out.push({data:addDays(l.data,30*i),bruto:l.valor/n,liquido:l.valor/n*(1-t),desc:l.descricao,parc:`${i}/${n}`,forma:l.forma})}
    else if(l.forma==='Cartão de débito')out.push({data:addDays(l.data,1),bruto:l.valor,liquido:l.valor*(1-t),desc:l.descricao,parc:'',forma:l.forma})});
  return out.sort((a,b)=>a.data<b.data?-1:1)})}
/* contas a pagar */
function ocorrencias(ate){const out=[];const t=today();
  arr('contas').forEach(ct=>{const ini=ct.vencimento;if(!ini)return;const dia=+ini.slice(8,10);
    const keys=ct.recorrente==='mensal'?(()=>{const ks=[];let k=ym(ini);while(k<=ym(ate)){ks.push(k);k=addMonths(k,1)}return ks})():[ym(ini)];
    keys.forEach(k=>{if(ct.ate&&k>ym(ct.ate))return;const last=new Date(+k.slice(0,4),+k.slice(5,7),0).getDate();const venc=`${k}-${pad(Math.min(dia,last))}`;
      const paga=(ct.pagas||{})[k];out.push({conta:ct,k,venc,paga:!!paga,vencida:!paga&&venc<t})})});
  return out.sort((a,b)=>a.venc<b.venc?-1:1)}

/* estoque, pacotes, vales */
const baixo=it=>(+it.qtd||0)<=(+it.minimo||0);
function pacoteUso(p){const ag=arr('agenda').filter(a=>a.pacoteId===p.id);return {usadas:ag.filter(a=>a.status==='concluido').length,reservadas:ag.filter(a=>a.status==='agendado'||a.status==='confirmado').length}}
function pacoteSaldo(p){const u=pacoteUso(p);return (+p.sessoes||0)-u.usadas-u.reservadas}
const pacoteAtivo=p=>p.status!=='encerrado'&&(!p.validade||p.validade>=today())&&pacoteSaldo(p)>0;
const valeSaldo=v=>(+v.valor||0)-(v.usos||[]).reduce((s,u)=>s+(+u.valor||0),0);
const valeAtivo=v=>valeSaldo(v)>0&&(!v.validade||v.validade>=today())&&(v.pagamentos||[]).length>0;
function novoCodigo(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='SM-';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s}

/* horários livres */
const DIA_PADRAO={on:true,ini:'08:00',fim:'20:00',pIni:'',pFim:''};
function semana(){const pb=pub();if(Array.isArray(pb.semana)&&pb.semana.length===7)return pb.semana.map(x=>({...DIA_PADRAO,...x}));
  const dias=Array.isArray(pb.dias)&&pb.dias.length?pb.dias:[1,2,3,4,5,6];
  return [0,1,2,3,4,5,6].map(i=>({on:dias.includes(i),ini:pb.abre||'08:00',fim:pb.fecha||'20:00',pIni:pb.intervaloIni||'',pFim:pb.intervaloFim||''}))}
const diasTrabalho=()=>semana().map((x,i)=>x.on?i:-1).filter(i=>i>=0);
const nthDow=d=>{const x=parse(d);const n=Math.ceil(x.getDate()/7);const ult=x.getDate()+7>new Date(x.getFullYear(),x.getMonth()+1,0).getDate();return {n,ult}};
function excRecorre(f,d){if(d<f.ini||(f.fim&&d>f.fim))return false;const x=parse(d);if(x.getDay()!==+f.dow)return false;if(f.rec==='semanal')return true;
  const k=nthDow(d);return +f.nth===-1?k.ult:k.n===+f.nth}
const excecoesDe=d=>(pub().folgas||[]).filter(f=>f.rec?excRecorre(f,d):d>=f.ini&&d<=(f.fim||f.ini));
const NTH=['','primeira','segunda','terceira','quarta'];
const recTexto=f=>f.rec==='semanal'?`toda ${SEMX[f.dow]}`:`${+f.nth===-1?'última':NTH[f.nth]} ${SEMX[f.dow]} do mês`;
function expediente(d){const ex=excecoesDe(d);const fe=ex.find(f=>(f.tipo||'fechado')==='fechado');if(fe)return {aberto:false,motivo:fe.motivo||'Agenda bloqueada'};
  const es=ex.find(f=>f.tipo==='horario'&&f.abre&&f.fecha);if(es)return {aberto:true,abre:es.abre,fecha:es.fecha,pausa:null,especial:es.motivo||'Horário especial'};
  const x=semana()[parse(d).getDay()];if(!x.on)return {aberto:false,motivo:'Fora do expediente'};
  const pausa=x.pIni&&x.pFim&&x.pFim>x.pIni?[hm2min(x.pIni),hm2min(x.pFim)]:null;return {aberto:true,abre:x.ini,fecha:x.fim,pausa}}
function diaFechado(d){const e=expediente(d);return e.aberto?'':e.motivo}
const textoExpediente=e=>e.aberto?`${e.abre}–${e.fecha}${e.pausa?` · pausa ${min2hm(e.pausa[0])}–${min2hm(e.pausa[1])}`:''}${e.especial?` · ${e.especial}`:''}`:e.motivo;
function livresDia(d,minDur=60){const e=expediente(d);if(!e.aberto)return [];let cur=hm2min(e.abre);const fim=hm2min(e.fecha);const out=[];
  if(d<today())return [];
  if(d===today()){const n=new Date();cur=Math.max(cur,Math.ceil((n.getHours()*60+n.getMinutes())/30)*30)}
  const ocup=arr('agenda').filter(a=>a.data===d&&a.status!=='cancelado'&&a.status!=='faltou').map(a=>{const s=hm2min(a.hora);return [s,s+(+a.duracao||120)]});
  if(e.pausa)ocup.push(e.pausa);
  ocup.sort((a,b)=>a[0]-b[0]).forEach(([s,e])=>{if(s-cur>=minDur)out.push([cur,Math.min(s,fim)]);cur=Math.max(cur,e)});
  if(fim-cur>=minDur)out.push([cur,fim]);return out.filter(([a,b])=>b-a>=minDur)}

/* anamnese */
const anamDe=cid=>S.anamneses.get(cid);
function anamAlertas(an){if(!an)return [];return ANAM_Q.filter(([k])=>an.respostas?.[k]?.sim).map(([k,q])=>({k,q,det:an.respostas[k].det||''}))}
const anamVencida=an=>!an||!an.atualizadaEm||diffDays(an.atualizadaEm.slice(0,10),today())>365;

/* datas comemorativas */
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function nth(y,mo,wd,n){const d=new Date(y,mo,1);let c=0;while(true){if(d.getDay()===wd){c++;if(c===n)return new Date(d)}d.setDate(d.getDate()+1)}}
const DATAS_CACHE={};
function datasAno(y){
  if(DATAS_CACHE[y])return DATAS_CACHE[y];
  const L=[];const add=(d,nome,ideia,tipo='com')=>L.push({data:typeof d==='string'?d:ymd(d),nome,ideia,tipo});
  const p=pascoa(y);const carn=new Date(p);carn.setDate(p.getDate()-47);const preCarn=new Date(carn);preCarn.setDate(carn.getDate()-14);
  const bf=nth(y,10,4,4);bf.setDate(bf.getDate()+1);
  add(`${y}-01-01`,'Ano Novo','Abra a agenda de janeiro com pacote "Tranças para o verão": modelos leves para praia e piscina.');
  add(`${y}-01-20`,'Férias de verão','Promoção de tranças infantis nas férias. Leve duas crianças da mesma família com desconto.');
  add(`${y}-02-01`,'Volta às aulas','Pacote escola: tranças práticas que duram semanas. Divulgue fotos de antes e depois das pequenas.');
  add(preCarn,'Agenda de Carnaval','Duas semanas antes: abra horários extras e ofereça tranças coloridas, fios com brilho e acessórios.');
  add(carn,'Carnaval','Stories com looks de tranças para bloquinho. Venda de anéis e cordões para tranças.');
  add(`${y}-03-08`,'Dia Internacional da Mulher','Homenageie suas clientes nas redes (com autorização) e ofereça mimo para quem agendar na semana.');
  add(`${y}-03-15`,'Dia do Consumidor','Condição especial de 1 dia: manutenção com valor reduzido para clientes da casa.');
  add(`${y}-03-21`,'Dia Internacional contra a Discriminação Racial','Conteúdo educativo sobre a história das tranças e seu valor cultural.');
  add(p,'Páscoa','Sorteio entre clientes que agendarem na semana; brinde de chocolate no atendimento.');
  add(`${y}-05-13`,'Abolição da escravatura','Post de reflexão sobre ancestralidade e resistência ligada às tranças.');
  add(nth(y,4,0,2),'Dia das Mães','Vale-presente de tranças: filhas presenteiam as mães. Pacote mãe e filha com desconto.');
  add(`${y}-05-25`,'Dia da África','Série de posts sobre a origem dos estilos (nagô, fulani, box braids) e seus significados.');
  add(`${y}-06-12`,'Dia dos Namorados','Penteado especial para encontro e sorteio de um atendimento entre quem marcar a pessoa amada.');
  add(`${y}-06-24`,'São João','Tranças com laços e flores para festas juninas; parceria com escolas e quadrilhas.');
  add(`${y}-07-15`,'Férias de julho','Agenda infantil reforçada e pacote de tranças duradouras para viagem.');
  add(`${y}-07-25`,'Dia da Mulher Negra Latino-Americana e Caribenha','Data de Tereza de Benguela. Destaque histórias de clientes e mulheres negras inspiradoras.');
  add(`${y}-07-26`,'Dia do Orgulho Crespo','Campanha de valorização do cabelo crespo com ensaio de fotos das clientes.');
  add(nth(y,7,0,2),'Dia dos Pais','Tranças masculinas e infantis: pacote pai e filho(a).');
  add(`${y}-09-15`,'Dia da Cliente','Agradeça às clientes Pérola e Ouro Rosé com um mimo ou desconto exclusivo.');
  add(`${y}-10-12`,'Dia das Crianças','Tranças infantis com miçangas coloridas e um pequeno presente para cada criança.');
  add(`${y}-11-01`,'Mês da Consciência Negra','Programação do mês: conteúdos diários, parceria com outras empreendedoras negras.');
  add(`${y}-11-20`,'Dia da Consciência Negra','Feriado nacional. Ação especial com fotos e depoimentos das clientes.');
  add(bf,'Black Friday','Venda antecipada de horários e vales-presente de dezembro com desconto no Pix.');
  add(`${y}-12-01`,'Temporada de fim de ano','Abra a agenda de dezembro cedo, cobre sinal para garantir horário e use a lista de espera.');
  add(`${y}-12-25`,'Natal','Vale-presente de tranças para quem quer presentear alguém.');
  add(`${y}-12-31`,'Réveillon','Tranças com fios dourados ou brancos para a virada.');
  for(let m=0;m<12;m++)add(`${y}-${pad(m+1)}-20`,'Vencimento do DAS-MEI',`Pague o DAS de ${MESES[(m+11)%12]} e preencha o relatório mensal de receitas.`,'fiscal');
  add(`${y}-05-31`,'Prazo da DASN-SIMEI','Declaração anual do MEI referente ao ano anterior.','fiscal');
  L.sort((a,b)=>a.data<b.data?-1:1);return DATAS_CACHE[y]=L;
}
function datasEntre(a,b){const out=[];for(let y=+a.slice(0,4);y<=+b.slice(0,4);y++)out.push(...datasAno(y).filter(d=>d.data>=a&&d.data<=b&&(d.tipo!=='fiscal'||pode('fin'))));return out}
function aniversariosEntre(a,b){const out=[];arr('clientes').forEach(c=>{if(!c.aniversario)return;const md=c.aniversario.slice(5);
  for(let y=+a.slice(0,4);y<=+b.slice(0,4);y++){const d=`${y}-${md}`;if(d>=a&&d<=b)out.push({data:d,cli:c})}});return out.sort((x,y)=>x.data<y.data?-1:1)}

/* ================= política da empresa e contratos ================= */
const POL_CAMPOS=[
 {k:'sinalPct',g:'Agendamento e sinal',r:'Sinal para reservar o horário',t:'num',p:30,suf:'% do valor do serviço'},
 {k:'sinalCancel',g:'Agendamento e sinal',r:'Sinal quando a cliente cancela dentro do prazo',t:'sel',o:['será convertido em crédito válido por 60 (sessenta) dias para remarcação ou, se a CONTRATANTE preferir, devolvido integralmente','será devolvido integralmente','será convertido em crédito válido por 60 (sessenta) dias para remarcação']},
 {k:'prazoCancel',g:'Agendamento e sinal',r:'Antecedência mínima para cancelar ou remarcar',t:'num',p:48,suf:'horas'},
 {k:'remarcacoes',g:'Agendamento e sinal',r:'Remarcações sem custo por agendamento',t:'num',p:1,suf:'vez(es)'},
 {k:'tolerancia',g:'Atrasos e faltas',r:'Tolerância de atraso',t:'num',p:20,suf:'minutos'},
 {k:'atrasoRegra',g:'Atrasos e faltas',r:'Atraso acima da tolerância',t:'sel',o:['o serviço poderá ser adaptado ao tempo restante, sem redução de valor, ou remarcado uma única vez, a critério da CONTRATADA, mantendo-se o sinal','o atendimento será remarcado e o sinal mantido como crédito para a nova data','o atendimento será considerado não comparecimento, aplicando-se a regra de falta']},
 {k:'falta',g:'Atrasos e faltas',r:'Falta sem aviso ou cancelamento fora do prazo',t:'sel',o:['o sinal será retido a título de arras, como compensação pelo horário reservado, sem nenhuma outra multa','o sinal será retido a título de arras e um novo agendamento exigirá pagamento antecipado de 50% (cinquenta por cento) do valor']},
 {k:'cabelo',g:'Serviço',r:'Cabelo sintético e materiais',t:'sel',o:['não estão incluídos no preço; a CONTRATADA informará previamente quantidade, tipo e cor e poderá fornecê-los mediante acréscimo informado no orçamento','estão incluídos no preço do serviço','serão fornecidos pela CONTRATANTE, conforme orientação prévia da CONTRATADA quanto a quantidade, tipo e cor']},
 {k:'preparo',g:'Serviço',r:'Como a cliente deve chegar',t:'txt',p:'com o cabelo lavado, seco e desembaraçado, sem óleos ou cremes pesados'},
 {k:'semanasMax',g:'Serviço',r:'Tempo máximo recomendado com as tranças',t:'num',p:8,suf:'semanas'},
 {k:'garantiaDias',g:'Garantia',r:'Prazo para retoque gratuito',t:'num',p:7,suf:'dias'},
 {k:'garantiaCobre',g:'Garantia',r:'O que a garantia cobre',t:'txt',p:'tranças que se soltarem ou se desfizerem por falha na execução'},
 {k:'garantiaExclui',g:'Garantia',r:'O que a garantia não cobre',t:'txt',p:'desgaste natural, crescimento do cabelo, aplicação de química, falta dos cuidados orientados, manipulação ou retirada parcial por terceiros'},
 {k:'parcelas',g:'Pagamento',r:'Parcelamento máximo no cartão de crédito',t:'num',p:3,suf:'vezes'},
 {k:'parcelaMin',g:'Pagamento',r:'Valor mínimo do serviço para parcelar',t:'num',p:200,suf:'reais'},
 {k:'jurosParc',g:'Pagamento',r:'Taxa do parcelamento',t:'sel',o:['sem acréscimo para a CONTRATANTE','com repasse da taxa da operadora, informada antes do pagamento']},
 {k:'domicilio',g:'Pagamento',r:'Atendimento a domicílio',t:'txt',p:'mediante taxa de deslocamento informada no orçamento, conforme a distância'},
 {k:'menores',g:'Pessoas e imagem',r:'Atendimento de menores de 18 anos',t:'sel',o:['somente com autorização por escrito e presença de responsável legal durante todo o atendimento','somente com autorização por escrito do responsável legal, que deverá acompanhar ao menos o início e o fim do atendimento']},
 {k:'acompanhantes',g:'Pessoas e imagem',r:'Acompanhantes',t:'txt',p:'é permitido 1 (um) acompanhante, salvo combinação prévia'},
 {k:'imagem',g:'Pessoas e imagem',r:'Fotos e vídeos das clientes',t:'sel',o:['somente com autorização expressa em termo próprio, que pode ser revogada a qualquer tempo, sem custo','não são feitos registros de imagem das clientes']},
 {k:'foro',g:'Disposições finais',r:'Foro',t:'sel',o:['o do domicílio da CONTRATANTE, conforme o art. 101, I, do Código de Defesa do Consumidor','o da comarca de {municipio}, ressalvado o direito da CONTRATANTE de demandar em seu domicílio (art. 101, I, do Código de Defesa do Consumidor)']},
 {k:'adicionais',g:'Disposições finais',r:'Cláusulas adicionais da empresa',t:'area',p:''}
];
function pol(){const d=S.publico.get('politica')||{};const campos={};
  POL_CAMPOS.forEach(f=>{const v=d.campos?.[f.k];campos[f.k]=v!=null&&v!==''?v:(f.t==='sel'?f.o[0]:f.p)});
  const rev=d.revisados||{};const pend=POL_CAMPOS.filter(f=>f.t!=='area'&&!rev[f.k]).length;
  return {campos,rev,versao:d.versao||0,atualizadaEm:d.atualizadaEm||'',pend}}
function polV(P,k,pb){let v=String(P.campos[k]??'');if(pb)v=v.replace('{municipio}',pb.municipio||'____');const t=esc(v);return P.rev[k]?t:`<span class="rev" title="Item ainda não revisado">${t}</span>`}
const linha=v=>v?esc(v):'______________________';

function docServico(cli,ag){
  const P=pol(),pb=pub(),V=k=>polV(P,k,pb);const s=ag?S.servicos.get(ag.servicoId):null;
  const valor=ag?+ag.valor||0:0;const sinal=valor*(+P.campos.sinalPct||0)/100;
  return `<article class="doc"><h1>Contrato de Prestação de Serviços de Tranças</h1>${P.versao?`<div class="sub">Política versão ${P.versao}${P.atualizadaEm?` · atualizada em ${dataBR(P.atualizadaEm.slice(0,10))}`:''}</div>`:''}
  <h2>Partes</h2>
  <p><b>CONTRATADA:</b> ${esc(pb.responsavel||pb.nome)}, microempreendedora individual, nome empresarial ${esc(pb.nome)}, CNPJ ${linha(pb.cnpj)}, com endereço em ${linha(pb.endereco||pb.municipio)}, WhatsApp ${linha(pb.whatsapp)}.</p>
  <p><b>CONTRATANTE:</b> ${linha(cli?.nome)}, CPF ${linha(cli?.cpf)}, telefone ${linha(cli?.telefone)}.</p>
  <h2>Cláusula 1 – Objeto</h2>
  <p>Prestação do serviço de <b>${linha(ag&&servsAg(ag).length>1?nomeAg(ag):s?.nome||ag?.servicoNome)}</b>, na data ${ag&&ag.data?`<b>${dataExt(ag.data)}</b>${ag.hora?`, às <b>${esc(ag.hora)}</b>`:''}`:'a combinar entre as partes'}, com duração estimada de ${s||ag?.duracao?durTxt(ag.duracao||s.duracao):'____'}, ${pb.endereco?`no endereço ${esc(pb.endereco)}`:'no local combinado entre as partes'}.</p>
  <h2>Cláusula 2 – Preço e pagamento</h2>
  <p>2.1. O valor total do serviço é de <b>${ag?BRL(valor):'R$ ________'}</b>. Para reservar o horário, a CONTRATANTE paga sinal de ${V('sinalPct')}% (${ag?BRL(sinal):'R$ ______'}), que será abatido do valor final.</p>
  <p>2.2. Formas aceitas: Pix, dinheiro e cartões de débito e crédito. O parcelamento no cartão de crédito é possível em até ${V('parcelas')} vezes para serviços a partir de R$ ${V('parcelaMin')}, ${V('jurosParc')}.</p>
  <p>2.3. Cabelo sintético e materiais ${V('cabelo')}.</p>
  <p>2.4. Atendimento a domicílio: ${V('domicilio')}.</p>
  <h2>Cláusula 3 – Cancelamento e remarcação</h2>
  <p>3.1. A CONTRATANTE pode cancelar ou remarcar com no mínimo ${V('prazoCancel')} horas de antecedência. Nesse caso, o sinal ${V('sinalCancel')}. São permitidas ${V('remarcacoes')} remarcação(ões) sem custo por agendamento.</p>
  <p>3.2. Em caso de não comparecimento sem aviso, ou de cancelamento com antecedência menor que a prevista no item 3.1, ${V('falta')}, nos termos dos arts. 417 a 420 do Código Civil.</p>
  <p>3.3. Se a CONTRATADA precisar cancelar ou remarcar por motivo próprio, avisará com a maior antecedência possível e a CONTRATANTE poderá escolher entre nova data ou devolução integral do sinal.</p>
  <h2>Cláusula 4 – Atrasos</h2>
  <p>A tolerância de atraso é de ${V('tolerancia')} minutos. Acima disso, ${V('atrasoRegra')}.</p>
  <h2>Cláusula 5 – Deveres da CONTRATANTE</h2>
  <ol><li>Comparecer ${V('preparo')}.</li><li>Preencher com veracidade a ficha de anamnese, informando alergias, sensibilidade, uso de química e condições do couro cabeludo.</li><li>Seguir os cuidados de manutenção orientados pela CONTRATADA.</li><li>Acompanhantes: ${V('acompanhantes')}.</li></ol>
  <h2>Cláusula 6 – Deveres da CONTRATADA</h2>
  <ol><li>Executar o serviço com técnica adequada, respeitando a saúde do couro cabeludo e evitando tensão excessiva.</li><li>Utilizar materiais em boas condições e manter higiene dos instrumentos e do ambiente.</li><li>Informar de forma clara os cuidados, a durabilidade e os riscos do procedimento, conforme o art. 6º, III, do Código de Defesa do Consumidor.</li><li>Interromper ou recusar o procedimento se identificar condição que coloque em risco a saúde da CONTRATANTE.</li></ol>
  <h2>Cláusula 7 – Durabilidade e cuidados</h2>
  <p>Recomenda-se não permanecer com as tranças por mais de ${V('semanasMax')} semanas, para evitar danos aos fios e alopecia por tração. Dor intensa, vermelhidão persistente, coceira forte ou feridas devem ser comunicadas imediatamente à CONTRATADA, e, se necessário, a CONTRATANTE deve procurar um(a) dermatologista.</p>
  <h2>Cláusula 8 – Garantia</h2>
  <p>8.1. A CONTRATADA oferece retoque gratuito em até ${V('garantiaDias')} dias após o atendimento para ${V('garantiaCobre')}.</p>
  <p>8.2. A garantia não cobre ${V('garantiaExclui')}.</p>
  <p>8.3. Esta garantia não substitui os direitos da CONTRATANTE previstos no Código de Defesa do Consumidor, inclusive o prazo de reclamação por vício do serviço (art. 26).</p>
  <h2>Cláusula 9 – Imagem</h2>
  <p>Fotos e vídeos da CONTRATANTE: ${V('imagem')}.</p>
  <h2>Cláusula 10 – Dados pessoais</h2>
  <p>Os dados pessoais da CONTRATANTE são tratados conforme a Lei nº 13.709/2018 (LGPD), apenas para agendamento, execução do serviço, comunicação e cumprimento de obrigações legais e fiscais. Dados de saúde da ficha de anamnese são tratados mediante consentimento específico. A CONTRATANTE pode solicitar acesso, correção ou eliminação dos seus dados pelo WhatsApp ${linha(pb.whatsapp)}, respeitados os prazos legais de guarda.</p>
  <h2>Cláusula 11 – Menores de idade</h2>
  <p>O atendimento de menores de 18 anos é realizado ${V('menores')}. O responsável assina este contrato e o termo de anamnese em nome da pessoa menor.</p>
  ${P.campos.adicionais?`<h2>Cláusula 12 – Disposições adicionais</h2><p>${V('adicionais').replace(/\n/g,'<br>')}</p>`:''}
  <h2>Cláusula ${P.campos.adicionais?13:12} – Foro</h2>
  <p>Fica eleito ${V('foro')}, para resolver eventuais questões deste contrato.</p>
  <p style="margin-top:16px">${esc(pb.municipio)}, ${dataExt(today())}.</p>
  <div class="ass"><div>CONTRATADA<br>${esc(pb.responsavel||pb.nome)}</div><div>CONTRATANTE<br>${linha(cli?.nome)}</div></div></article>`;
}

function docAnamnese(cli,an){
  const P=pol(),pb=pub();const r=an?.respostas||{};const resp=an?.responsavel||{};
  return `<article class="doc"><h1>Ficha de Anamnese e Termo de Consentimento</h1><div class="sub">${esc(pb.nome)} · CNPJ ${linha(pb.cnpj)}</div>
  <h2>Identificação</h2><p><b>Cliente:</b> ${linha(cli?.nome)} · <b>CPF:</b> ${linha(cli?.cpf)} · <b>Nascimento/aniversário:</b> ${cli?.aniversario?dataBR(cli.aniversario):'________'} · <b>Telefone:</b> ${linha(cli?.telefone)}</p>
  ${an?.menor?`<p><b>Responsável legal:</b> ${linha(resp.nome)} · CPF ${linha(resp.cpf)} · ${linha(resp.parentesco)}</p>`:''}
  <p><b>Cabelo:</b> ${linha(cli?.cabelo)}</p>
  <h2>Questionário de saúde</h2>
  <table>${ANAM_Q.map(([k,q])=>`<tr><td>${esc(q)}</td><td style="white-space:nowrap"><b>${r[k]?.sim?'Sim':an?'Não':'( ) Sim ( ) Não'}</b>${r[k]?.det?` – ${esc(r[k].det)}`:''}</td></tr>`).join('')}</table>
  ${an?.obs?`<p style="margin-top:8px"><b>Observações da profissional:</b> ${esc(an.obs)}</p>`:''}
  <h2>Declaração</h2>
  <p>Declaro que as informações acima são verdadeiras e completas, e que fui informada sobre os cuidados, a durabilidade recomendada (até ${polV(P,'semanasMax')} semanas) e os riscos do procedimento, como sensibilidade, desconforto nas primeiras horas e queda de fios por tração quando os cuidados não são seguidos. Comprometo-me a comunicar qualquer alteração no meu estado de saúde antes de novos atendimentos.</p>
  <h2>Consentimento para dados de saúde (LGPD)</h2>
  <p>Autorizo, de forma livre, informada e específica, que ${esc(pb.nome)} trate os dados de saúde informados nesta ficha (dados pessoais sensíveis, art. 11, I, da Lei nº 13.709/2018) exclusivamente para avaliar a segurança e executar os serviços de tranças. Esses dados não serão compartilhados com terceiros, ficam acessíveis apenas às profissionais que me atendem e serão eliminados a meu pedido ou ao fim da finalidade, ressalvadas obrigações legais. Posso revogar este consentimento a qualquer momento.</p>
  ${an?.menor?`<p>Por se tratar de pessoa menor de idade, este consentimento é dado pelo responsável legal identificado acima (art. 14 da LGPD).</p>`:''}
  <h2>Uso de imagem</h2>
  <p>${an?(an.imagem?'<b>( X ) Autorizo</b> ( ) Não autorizo':'( ) Autorizo <b>( X ) Não autorizo</b>'):'( ) Autorizo ( ) Não autorizo'} o uso de fotos e vídeos das minhas tranças, com ou sem meu rosto, nas redes sociais e materiais de divulgação de ${esc(pb.nome)}, sem remuneração e por prazo indeterminado, podendo revogar esta autorização a qualquer momento pelo WhatsApp, sem custo (art. 20 do Código Civil).</p>
  <p style="margin-top:16px">${esc(pb.municipio)}, ${dataExt(today())}.</p>
  <div class="ass"><div>${an?.menor?'RESPONSÁVEL LEGAL':'CLIENTE'}<br>${linha(an?.menor?resp.nome:cli?.nome)}</div><div>PROFISSIONAL<br>${esc(pb.responsavel||pb.nome)}</div></div></article>`;
}

function docPolitica(){
  const P=pol(),pb=pub(),V=k=>polV(P,k,pb);
  return `<article class="doc"><h1>Política do Ateliê</h1><div class="sub">${esc(pb.nome)} · versão ${P.versao||'—'}</div>
  <h2>Para as clientes</h2>
  <ol>
   <li><b>Agendamento:</b> o horário é confirmado com sinal de ${V('sinalPct')}% do valor, abatido no dia do atendimento.</li>
   <li><b>Cancelamento:</b> avise com pelo menos ${V('prazoCancel')} horas; nesse caso o sinal ${V('sinalCancel')}. Permitimos ${V('remarcacoes')} remarcação(ões) sem custo.</li>
   <li><b>Falta ou aviso em cima da hora:</b> ${V('falta')}.</li>
   <li><b>Atraso:</b> tolerância de ${V('tolerancia')} minutos. Depois disso, ${V('atrasoRegra')}.</li>
   <li><b>Como chegar:</b> ${V('preparo')}.</li>
   <li><b>Cabelo e materiais:</b> ${V('cabelo')}.</li>
   <li><b>Pagamento:</b> Pix, dinheiro e cartões. Parcelamento em até ${V('parcelas')}x a partir de R$ ${V('parcelaMin')}, ${V('jurosParc')}.</li>
   <li><b>Garantia:</b> retoque gratuito em até ${V('garantiaDias')} dias para ${V('garantiaCobre')}. Não cobre ${V('garantiaExclui')}.</li>
   <li><b>Cuidados:</b> recomendamos ficar no máximo ${V('semanasMax')} semanas com as tranças.</li>
   <li><b>Menores de 18 anos:</b> atendidos ${V('menores')}.</li>
   <li><b>Acompanhantes:</b> ${V('acompanhantes')}.</li>
   <li><b>Fotos:</b> ${V('imagem')}.</li>
   <li><b>Privacidade:</b> seus dados são usados só para o atendimento e obrigações legais, conforme a LGPD.</li>
  </ol>
  <h2>Para a equipe</h2>
  <ol>
   <li><b>Sigilo:</b> dados de clientes, especialmente a ficha de anamnese, são confidenciais. Não fotografe telas, não repasse contatos e não comente informações de saúde.</li>
   <li><b>Acesso ao sistema:</b> cada pessoa usa a própria conta. Nunca compartilhe login. O acesso é encerrado ao fim da parceria.</li>
   <li><b>Anamnese:</b> confira a ficha antes de todo atendimento. Diante de ferida, inflamação ou dor intensa, não realize o procedimento e chame a proprietária.</li>
   <li><b>Biossegurança:</b> higienize pentes, presilhas e bancada entre atendimentos; use materiais descartáveis quando indicado.</li>
   <li><b>Valores e descontos:</b> siga a tabela de preços; descontos fora dos níveis de fidelidade só com autorização da proprietária.</li>
   <li><b>Registros:</b> todo pagamento recebido e todo material usado deve ser lançado no sistema no mesmo dia.</li>
   <li><b>Imagem:</b> fotos de clientes só com autorização registrada na ficha.</li>
  </ol>
  ${P.campos.adicionais?`<h2>Disposições adicionais</h2><p>${V('adicionais').replace(/\n/g,'<br>')}</p>`:''}
  </article>`;
}
async function hashTexto(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16)}catch(e){return ''}}

/* ================= interface: casca ================= */
const UI={view:'inicio',agDia:today(),calMes:ym(today()),calDia:today(),finTab:'visao',finMes:ym(today()),lanTipo:'todos',cliBusca:'',cliLim:60,cliNivel:'todos',cliOrd:'score',ctTab:'links',agVis:'dia',reatTodos:false,ajTab:'horarios',cliTab:'lista',ctTipo:'servico',ctCli:'',ctAg:'',acFiltro:'todos',pkTab:'pacotes',relPer:6,lastView:null};
const VIEWS=[['inicio','Início','home',()=>pode('base')],['agenda','Agenda','cal',()=>pode('base')],['clientes','Clientes','users',()=>pode('base')],['catalogo','Catálogo','image',()=>pode('base')],['financeiro','Finanças','wallet',()=>pode('fin')],['contratos','Contratos','file',()=>pode('contratos')],['pacotes','Pacotes e vales','ticket',()=>pode('base')],['estoque','Estoque','box',()=>pode('estoque')],['calendario','Datas e ideias','spark',()=>pode('base')],['ajustes','Ajustes','gear',()=>true]];
const visiveis=()=>VIEWS.filter(v=>v[3]());
let rq=0;function schedule(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;render()})}
function go(v){if(!visiveis().some(x=>x[0]===v))v=visiveis()[0][0];UI.view=v;try{history.replaceState(null,'','#'+v)}catch(e){}window.scrollTo({top:0,behavior:'smooth'});closeSheet(true);render()}

function shell(){
  const vs=visiveis();
  $('#brandSide').innerHTML=`${marcaImg(46)}${MARCA_TXT}`;
  const GR=[['Atendimento',['inicio','agenda','clientes','contratos']],['Vitrine e marketing',['catalogo','pacotes','calendario']],['Gestão',['financeiro','estoque']],['',['ajustes']]];
  const bt=([k,n,i])=>`<button class="nav" data-act="go" data-v="${k}" ${UI.view===k?'aria-current="page"':''}>${ic(i)}${n}</button>`;
  $('#navSide').innerHTML=GR.map(([g,ks])=>{const it=ks.map(k=>vs.find(v=>v[0]===k)).filter(Boolean);return it.length?`${g?`<div class="nav-grupo">${g}</div>`:'<div class="nav-sep"></div>'}${it.map(bt).join('')}`:''}).join('');
  const tabs=vs.filter(v=>['inicio','agenda','clientes'].includes(v[0]));tabs.push(vs.find(v=>v[0]==='financeiro')||vs.find(v=>v[0]==='contratos')||vs.find(v=>v[0]==='pacotes'));
  const inTabs=tabs.some(t=>t[0]===UI.view);
  $('#tabbar').innerHTML=tabs.map(([k,n,i])=>`<button class="tab" data-act="go" data-v="${k}" ${UI.view===k?'aria-current="page"':''}>${ic(i)}<span>${k==='financeiro'?'Finanças':n}</span></button>`).join('')+`<button class="tab" data-act="mais" ${!inTabs?'aria-current="page"':''}>${ic('grid')}<span>Mais</span></button>`;
  const on=navigator.onLine!==false;$('#syncSide').innerHTML=`<i></i>${on?'Sincronizado':'Sem internet · salvando no aparelho'} · ${PAPEIS[ROLE]||''}`;$('#syncSide').classList.toggle('local',!on);
  return `<div class="topbar"><div class="brand">${marcaImg(38)}${MARCA_TXT}</div><div class="row">${navigator.onLine===false?'<span class="sync local"><i></i>Sem internet</span>':''}<span class="role">${esc(PAPEIS[ROLE]||'')}</span>${pode('base')?`<button class="icon-btn" data-act="busca" aria-label="Buscar (atalho /)" title="Buscar (atalho /)">${ic('search')}</button>`:''}<button class="icon-btn" data-act="tema" aria-label="Tema: ${{sistema:'automático',claro:'claro',escuro:'escuro'}[temaAtual()]}" title="Tema: ${{sistema:'automático',claro:'claro',escuro:'escuro'}[temaAtual()]}">${ic({sistema:'auto',claro:'sun',escuro:'moon'}[temaAtual()])}</button></div></div>`;
}
function render(){VEZ++;
  const main=$('#main');
  if(['config','login','primeiro','pendente','erro'].includes(ROLE)){$('#tabbar').innerHTML='';$('#navSide').innerHTML='';$('#syncSide').innerHTML='';if(!main.dataset.gate||main.dataset.gate!==ROLE){main.dataset.gate=ROLE;main.innerHTML=demoFaixa()+gate()}return}
  main.dataset.gate='';
  if(ROLE==='carregando'||[...NEED].some(c=>!loaded.has(c))){if(!$('#loadMark')){main.innerHTML=`<div class="sk-wrap" aria-busy="true" aria-label="Carregando"><div id="loadMark" class="row" style="gap:12px">${marcaImg(40)}<div class="sk" style="width:180px;height:28px"></div></div><div class="sk" style="height:96px"></div><div class="kpis">${'<div class="sk" style="height:84px"></div>'.repeat(4)}</div><div class="grid g2"><div class="sk" style="height:220px"></div><div class="sk" style="height:220px"></div></div></div>`}return}
  if(!visiveis().some(v=>v[0]===UI.view))UI.view=visiveis()[0][0];
  if(DEMO&&!DEMO_SEMEADO&&isOwner()&&!pub().started&&S.clientes.size===0){DEMO_SEMEADO=true;setTimeout(()=>seed(true),0)}
  histPelaTela();
  const top=shell();
  const fn={inicio:vInicio,agenda:vAgenda,clientes:vClientes,catalogo:vCatalogo,financeiro:vFinanceiro,contratos:vContratos,pacotes:vPacotes,estoque:vEstoque,calendario:vCalendario,ajustes:vAjustes}[UI.view]||vInicio;
  const changed=UI.lastView!==UI.view;UI.lastView=UI.view;const y=window.scrollY;
  const ae=document.activeElement;const aid=ae&&main.contains(ae)?ae.id:null;let pos=null;try{pos=aid?ae.selectionStart:null}catch(_){}
  const tela=changed?null:guardarTela();
  main.innerHTML=demoFaixa()+top+`<div class="stack ${changed?'enter':''}" id="view">${fn()}</div>`;
  if(tela)devolverTela(tela);
  if(changed)countUps();else window.scrollTo(0,y);
  if(aid){const el=document.getElementById(aid);if(el&&el.focus){el.focus();if(pos!=null)try{el.setSelectionRange(pos,pos)}catch(_){}}}
  afterRender();
}
/* A tela inteira é redesenhada quando chega novidade (de outro aparelho, de um link de cliente…).
   O que a pessoa digitou e ainda não salvou, e as caixas que ela abriu, voltam para o lugar depois do redesenho.
   Ao enviar o formulário (Salvar), o campo deixa de ser "rascunho" e volta a mostrar o que está salvo. */
const marcaRascunho=e=>{const el=e.target;if(el&&el.id&&el.id!=='cliBusca'&&el.closest&&el.closest('#view'))el.dataset.sujo='1'};
document.addEventListener('input',marcaRascunho,true);document.addEventListener('change',marcaRascunho,true);
document.addEventListener('submit',e=>{const f=e.target;if(f&&f.querySelectorAll)f.querySelectorAll('[data-sujo]').forEach(el=>delete el.dataset.sujo)},true);
const chaveCaixa=d=>((d.querySelector('summary')||{}).textContent||'').trim();
function guardarTela(){const v=document.getElementById('view');if(!v)return null;
  const campos=[...v.querySelectorAll('[data-sujo]')].map(el=>[el.id,el.type==='checkbox'||el.type==='radio'?{c:el.checked}:{v:el.value}]);
  const caixas=new Map([...v.querySelectorAll('details')].map(d=>[chaveCaixa(d),d.open]));
  return {campos,caixas}}
function devolverTela({campos,caixas}){
  campos.forEach(([id,x])=>{const el=document.getElementById(id);if(!el||!el.closest('#view'))return;if('c' in x)el.checked=x.c;else el.value=x.v;el.dataset.sujo='1'});
  if(caixas.size)document.querySelectorAll('#view details').forEach(d=>{const k=chaveCaixa(d);if(caixas.has(k))d.open=caixas.get(k)})}
/* modo demonstração (?demo e prévias): faixa no topo para ninguém confundir com o sistema real */
let DEMO_SEMEADO=false;
const DEMO_PREVIA=/--[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/i.test(location.hostname);
function demoFaixa(){if(!DEMO)return '';return `<div class="demo-faixa" role="note">${ic('info')}<span class="grow"><b>Modo demonstração.</b> Clientes e valores fictícios, guardados só neste aparelho. Nada vai para o sistema real.${ROLE==='login'?' Entre com qualquer e-mail e senha.':''}</span><button class="btn ghost sm" data-act="demoRecomecar">Recomeçar</button>${DEMO_PREVIA?'':'<a class="btn ghost sm" href="/?demo=0">Sair</a>'}</div>`}
function afterRender(){const c=$('#sigPad');if(c&&!c.dataset.on)sigInit(c);carregaFotos()}
function gate(){
  const card=(t,body)=>`<div class="gate"><div class="stack" style="align-items:stretch;max-width:420px;width:100%"><img class="gate-logo" src="/img/logo.webp" width="420" height="280" alt="Stéfany Medeiros"><div class="card stack" style="align-items:center;width:100%"><h2 class="page-title" style="font-size:1.6rem">${t}</h2>${body}</div></div></div>`;
  if(ROLE==='config')return card('Falta configurar o Firebase',`<p class="muted" style="margin:0">Abra o arquivo <b>public/firebase-config.js</b> e cole os dados do seu projeto, como explicado no guia (LEIA-ME.md). Depois publique de novo.</p>`);
  if(ROLE==='erro')return card('Não foi possível conectar',`<p class="muted" style="margin:0">Confira se o Firestore foi criado no console do Firebase e se as regras foram publicadas. Depois recarregue a página.</p><button class="btn soft" data-act="sair">Sair</button>`);
  if(ROLE==='login')return card('Entrar',`<form class="form" id="fLogin" style="width:100%;text-align:left"><label class="fld">E-mail<input id="lgEmail" type="email" autocomplete="username" required></label><label class="fld">Senha<input id="lgSenha" type="password" autocomplete="current-password" required></label><div id="lgMsg" class="small" style="color:var(--bad)"></div><button class="btn primary" style="justify-content:center">Entrar</button><button type="button" class="btn ghost" data-act="esqueci" style="justify-content:center">Esqueci minha senha</button></form><p class="small muted" style="margin:0">Não tem acesso? Peça para a proprietária criar seu usuário.</p>`);
  if(ROLE==='primeiro')return card('Primeiro acesso',`<p class="muted" style="margin:0">Nenhuma proprietária foi definida ainda. Se esta é a conta da <b>Stéfany</b> (${esc(EMAIL)}), confirme para torná-la a dona do sistema. Isso só pode ser feito uma vez.</p><button class="btn primary" data-act="virarDona">${ic('shield')}Esta é a conta da proprietária</button><button class="btn ghost" data-act="sair">Sair</button>`);
  return card('Acesso aguardando liberação',`<p class="muted" style="margin:0">Você entrou como ${esc(EMAIL)}. A proprietária precisa definir seu perfil; assim que ela fizer isso, o sistema abre aqui automaticamente.</p><button class="btn ghost" data-act="sair">Sair</button>`);
}
function countUps(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$$('[data-count]').forEach(el=>{const to=+el.dataset.count;const f=el.dataset.fmt;const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/900);const v=to*(1-Math.pow(1-k,3));el.textContent=f==='brl'?BRL(v):Math.round(v);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
const cnt=(v,f='brl')=>`<span data-count="${v}" data-fmt="${f}">${f==='brl'?BRL(v):Math.round(v)}</span>`;
const head=(eb,title,lede,actions='')=>`<div class="section-head"><div><div class="eyebrow">${eb}</div><h1 class="page-title">${title}</h1>${lede?`<p class="lede">${lede}</p>`:''}</div><div class="row">${actions}</div></div>`;
const seg=(act,cur,opts,attr='t')=>`<div class="seg" role="tablist">${opts.map(([k,n])=>`<button data-act="${act}" data-${attr}="${k}" aria-pressed="${cur===k}">${n}</button>`).join('')}</div>`;
const bars=(rows,max,color)=>rows.map(([k,v,txt])=>`<div style="margin-bottom:10px"><div class="row between small"><span>${esc(k)}</span><b class="num">${txt??BRL(v)}</b></div><div class="bar thin"><span style="width:${max?v/max*100:0}%;${color?`background:${color}`:''}"></span></div></div>`).join('');

/* ================= INÍCIO ================= */
function vInicio(){
  const pb=pub();const t=today();const h=new Date().getHours();const own=isOwner();
  const saud=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  const nomeMe=own?primeiro(pb.responsavel)||'Stéfany':primeiro(nomePessoa(ME))||'';
  const vazio=own&&!pb.started&&S.clientes.size===0&&S.agenda.size===0;
  const hoje=arr('agenda').filter(a=>a.data===t&&a.status!=='cancelado').sort((a,b)=>a.hora<b.hora?-1:1);
  const prox=datasEntre(t,addDays(t,30)).filter(d=>d.tipo==='com').slice(0,3);
  const aniv=aniversariosEntre(t,addDays(t,14));
  const risco=arr('clientes').map(cl=>({cl,f:fidelidade(cl)})).filter(x=>x.f.risco).sort((a,b)=>b.f.total-a.f.total).slice(0,4);
  const esp=arr('espera').filter(e=>e.status==='aguardando');
  const est=pode('estoque')?arr('estoque').filter(baixo):[];
  let out=`<section class="hero"><div style="flex:1;min-width:220px"><div class="eyebrow">${esc(dataLonga(t))}</div><h1 class="hello">${saud}${nomeMe?`, <em>${esc(nomeMe)}</em>`:''}</h1>
    <p class="lede">${hoje.length?`${hoje.length} atendimento${hoje.length>1?'s':''} hoje.`:'Nenhum atendimento marcado para hoje.'}</p></div>`;
  if(own){const c=priv();const mes=ym(t);const rec=soma(receitas(l=>ym(l.data)===mes));const pm=+c.meta?Math.min(1,rec/c.meta):0;const C=2*Math.PI*40;
    out+=`<svg class="ring" viewBox="0 0 96 96" role="img" aria-label="Meta do mês: ${pct(pm)}"><circle class="bg" cx="48" cy="48" r="40"/><circle class="fg" cx="48" cy="48" r="40" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pm)}"/><text x="48" y="54" text-anchor="middle">${Math.round(pm*100)}%</text></svg>`}
  out+=`</section>`;
  if(vazio)out+=`<section class="card"><h3>Bem-vinda ao seu sistema</h3><p class="muted small" style="margin-top:0">Comece com serviços e estoque sugeridos. Para ver tudo funcionando antes, carregue dados de exemplo: eles ficam marcados e podem ser apagados em Ajustes.</p>
    <div class="row"><button class="btn primary" data-act="seed" data-ex="1">${ic('spark')}Ver com dados de exemplo</button><button class="btn soft" data-act="seed" data-ex="0">Começar do zero</button></div></section>`;
  out+=`<section class="quick"><button data-act="novoAg">${ic('cal')}Agendar</button><button data-act="novaCli">${ic('users')}Nova cliente</button>${own?`<button data-act="novoLan">${ic('wallet')}Lançar valor</button>`:`<button data-act="novaEspera">${ic('list')}Lista de espera</button>`}</section>`;
  out+=agoraCard(t,own,est);
  if(own){const c=priv();const mes=ym(t);const rec=soma(receitas(l=>ym(l.data)===mes));const des=soma(despesas(l=>ym(l.data)===mes));const ano=t.slice(0,4);const recAno=soma(receitas(l=>l.data.slice(0,4)===ano));const lim=limiteAno(ano);
    out+=`<section class="kpis"><div class="kpi"><div class="l">Receita em ${MESES[+mes.slice(5)-1]}</div><div class="v">${cnt(rec)}</div><div class="d">Meta ${BRL(c.meta)}</div></div>
    <div class="kpi"><div class="l">Lucro do mês</div><div class="v" style="color:${rec-des>=0?'var(--good)':'var(--bad)'}">${cnt(rec-des)}</div><div class="d">Despesas ${BRL(des)}</div></div>
    <div class="kpi"><div class="l">Limite MEI ${ano}</div><div class="v">${pct(recAno/lim)}</div><div class="bar thin" style="margin-top:6px"><span style="width:${Math.min(100,recAno/lim*100)}%;background:${recAno/lim>.9?'var(--bad)':recAno/lim>.75?'var(--warn)':'var(--accent)'}"></span></div></div>
    <div class="kpi"><div class="l">A receber (30 dias)</div><div class="v">${cnt(soma(aReceber().filter(r=>r.data>=t&&r.data<=addDays(t,30)).map(r=>({valor:r.liquido}))))}</div><div class="d">cartões, já sem taxa</div></div></section>`}
  const amanha=arr('agenda').filter(a=>a.data===addDays(t,1)&&a.status==='agendado').sort((a,b)=>a.hora<b.hora?-1:1);
  out+=avisosPortal();
  if(amanha.length)out+=`<section class="card" id="confAmanha"><h3>Confirmar amanhã <small>${amanha.length} sem confirmação</small></h3><div class="list">${amanha.map(confirmarRow).join('')}</div></section>`;
  const ret=retornos().slice(0,6);
  if(ret.length)out+=`<section class="card"><h3>Hora da manutenção ou retirada <small>sem horário marcado</small></h3><div class="list">${ret.map(retornoRow).join('')}</div><p class="small muted" style="margin-bottom:0">Baseado no tempo máximo recomendado na política (${pol().campos.semanasMax} semanas).</p></section>`;
  out+=`<div class="grid g2">
   <section class="card"><h3>Hoje <button class="btn sm soft" data-act="go" data-v="agenda">Agenda</button></h3>${linhaTempo(t)}${hoje.length?`<div class="list">${hoje.map(apptRow).join('')}</div>`:`<div class="empty">Dia livre. Que tal divulgar os horários vagos?<br><button class="btn soft sm" style="margin-top:8px" data-act="divulgar">${ic('image')}Divulgar horários</button></div>`}</section>
   <section class="card"><h3>Lista de espera <small>${esp.length} aguardando</small></h3>${esp.length?`<div class="list">${esp.slice(0,4).map(esperaRow).join('')}</div>`:`<div class="empty">Ninguém na lista de espera.</div>`}</section>
   <section class="card"><h3>Próximas datas <small>30 dias</small></h3>${prox.length?`<div class="stack" style="gap:8px">${prox.map(d=>`<div class="event"><span class="when">${dataCurta(d.data)} · faltam ${diffDays(t,d.data)} dias</span><b>${esc(d.nome)}</b><p>${esc(d.ideia)}</p></div>`).join('')}</div>`:`<div class="empty">Sem datas especiais nos próximos 30 dias.</div>`}</section>
   <section class="card"><h3>Aniversariantes <small>próximos 14 dias</small></h3>${aniv.length?`<div class="list">${aniv.map(a=>{const l=waLink(a.cli.telefone,`Feliz aniversário, ${primeiro(a.cli.nome)}! 🎉 Desejo um ano lindo pra você. Seu presente: ${pb.descAniv}% de desconto no próximo atendimento este mês. Beijos, ${primeiro(pb.responsavel)}`);
     return `<div class="item"><div class="avatar" style="--lv:var(--gold)">${ic('gift')}</div><div class="grow"><div class="t">${esc(a.cli.nome)}</div><div class="s">${a.data===t?'Hoje!':dataLonga(a.data)}</div></div>${l?`<a class="btn sm soft" href="${l}" target="_blank" rel="noopener">${ic('chat')}Parabéns</a>`:''}</div>`}).join('')}</div>`:`<div class="empty">Nenhum aniversário nas próximas duas semanas.</div>`}</section>
   <section class="card"><h3>Para reconquistar <small>sem voltar há 90+ dias</small></h3>${risco.length?`<div class="list">${risco.map(({cl,f})=>{const l=waLink(cl.telefone,`Oi, ${primeiro(cl.nome)}! Tudo bem? Estou com saudade de cuidar das suas tranças 💕 Separei uma condição especial para você voltar este mês. Quer ver um horário?`);
     return `<div class="item"><div class="avatar" style="--lv:${NIVEIS[f.nivel].c}">${iniciais(cl.nome)}</div><div class="grow"><div class="t">${esc(cl.nome)}</div><div class="s">Última visita há ${f.dias} dias · ${f.visitas} atendimentos</div></div>${l?`<a class="btn sm soft" href="${l}" target="_blank" rel="noopener">${ic('chat')}Chamar</a>`:''}</div>`}).join('')}</div>`:`<div class="empty">Todas as clientes frequentes voltaram recentemente.</div>`}</section>
  </div>`;
  return out;
}

/* ---------- Agora: o que resolver primeiro (até 3 itens, do mais urgente; o resto fica em "Mais") ---------- */
function agoraItens(t,own,est){const it=[];const agora=new Date();const minAgora=agora.getHours()*60+agora.getMinutes();
  const add=(pri,tipo,icone,txt,botao)=>it.push({pri,tipo,icone,txt,botao});
  const bt=(act,attrs,rot,cls='primary')=>`<button class="btn sm ${cls}" data-act="${act}" ${attrs}>${rot}</button>`;
  const hoje=arr('agenda').filter(a=>a.data===t&&(a.status==='agendado'||a.status==='confirmado')).sort((a,b)=>a.hora<b.hora?-1:1);
  // atendimentos de hoje que já terminaram e não foram concluídos
  hoje.filter(a=>hm2min(a.hora)+(+a.duracao||60)<=minAgora).forEach(a=>add(10,'bad','check',`<b>Concluir ${esc(primeiro(nomeCli(a.clienteId)))}</b> · ${esc(a.hora)}, ${esc(nomeAg(a))}. Registre o pagamento.`,bt('concluir',`data-id="${a.id}"`,`${ic('check')}Concluir`)));
  // hoje, ainda sem confirmação
  hoje.filter(a=>a.status==='agendado'&&hm2min(a.hora)>minAgora).forEach(a=>{const cli=S.clientes.get(a.clienteId);const w=cli?waLink(cli.telefone,`Oi, ${primeiro(cli.nome)}! Tudo certo para hoje às ${a.hora}?`):null;
    add(30,'warn','clock',`<b>${esc(primeiro(nomeCli(a.clienteId)))} hoje às ${esc(a.hora)}</b> ainda não confirmou.`,(w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Perguntar</a>`:'')+bt('stAg',`data-id="${a.id}" data-s="confirmado"`,`${ic('check')}Confirmada`))});
  const amanha=arr('agenda').filter(a=>a.data===addDays(t,1)&&a.status==='agendado').length;
  if(amanha)add(45,'info','cal',`<b>${amanha} horário${amanha>1?'s':''} de amanhã</b> sem confirmação.`,bt('rolar','data-alvo="#confAmanha"','Confirmar','soft'));
  if(avisosPortal())add(50,'info','users','<b>Novidades das clientes</b> pelo link (contratos aceitos, cancelamentos, fichas, cadastros).',bt('rolar','data-alvo=".aviso-portal"','Ver','soft'));
  if(own){const c=priv();const dasMes=ym(addDays(t.slice(0,8)+'01',-1));const diasDas=diffDays(t,t.slice(0,8)+'20');
    if(!(c.dasPagos||{})[dasMes]&&(S.agenda.size||S.lancamentos.size)&&diasDas<=10)add(diasDas<0?15:diasDas<=3?35:60,diasDas<0?'bad':'warn','alert',`<b>DAS de ${MESES[+dasMes.slice(5)-1]}</b> ${diasDas<0?'venceu dia 20 e não está marcado como pago.':diasDas===0?'vence hoje.':`vence em ${diasDas} dia${diasDas>1?'s':''} (dia 20).`}`,bt('finTab','data-t="mei"','Ver obrigações','soft'));
    const venc=ocorrencias(addDays(t,7)).filter(o=>!o.paga&&o.venc<=addDays(t,7));const atras=venc.filter(o=>o.venc<t);
    if(venc.length)add(atras.length?20:55,atras.length?'bad':'warn','clock',`<b>${venc.length} conta${venc.length>1?'s':''} a pagar</b>${atras.length?` (${atras.length} vencida${atras.length>1?'s':''})`:''}: ${venc.slice(0,3).map(o=>`${esc(o.conta.descricao)} (${dataCurta(o.venc)})`).join(', ')}.`,bt('finTab','data-t="contas"','Abrir contas','soft'));
    const ped=arr('pedidos');if(ped.length)add(40,'info','lock',`<b>${ped.length} pedido${ped.length>1?'s':''} de acesso</b> aguardando você definir o perfil.`,bt('go','data-v="ajustes"','Ver equipe','soft'));
    if(pol().pend)add(80,'info','shield',`<b>Política da empresa:</b> ${pol().pend} itens dos contratos ainda não foram revisados.`,bt('ctTab','data-t="politica"','Revisar','soft'));}
  if(est.length)add(65,'warn','box',`<b>Estoque baixo:</b> ${est.slice(0,4).map(i=>`${esc(i.nome)} (${i.qtd} ${esc(i.unidade||'')})`).join(', ')}${est.length>4?'…':''}`,bt('go','data-v="estoque"','Ver estoque','soft'));
  const reat=pode('base')?paraReativar():[];
  if(reat.length)add(70,'info','repeat',`<b>${reat.length} cliente${reat.length===1?'':'s'} para reativar:</b> ${reat.slice(0,3).map(x=>esc(primeiro(x.c.nome))).join(', ')}${reat.length>3?'…':''} (manutenção vencida ou sumidas).`,bt('go','data-v="clientes"','Convidar','soft'));
  return it.sort((a,b)=>a.pri-b.pri);
}
function agoraCard(t,own,est){const it=agoraItens(t,own,est);
  const linha=x=>`<div class="agora-item ${x.tipo}"><span class="agora-ic">${ic(x.icone)}</span><div class="grow">${x.txt}</div><div class="row agora-bt">${x.botao}</div></div>`;
  if(!it.length)return `<section class="card agora"><h3>Agora</h3><div class="agora-item ok"><span class="agora-ic">${ic('check')}</span><div class="grow">Tudo em dia. Nada urgente para resolver agora.</div></div></section>`;
  const mais=it.slice(3);
  return `<section class="card agora"><h3>Agora <small>${it.length===1?'1 coisa para resolver':`${it.length} coisas para resolver`}</small></h3>${it.slice(0,3).map(linha).join('')}
   ${mais.length?`<details class="agora-mais"${UI.agoraMais?' open':''}><summary data-act="agoraMais">Mais ${mais.length}</summary>${mais.map(linha).join('')}</details>`:''}</section>`}

/* ================= AGENDA ================= */
function apptRow(a){const st=STATUS[a.status]||STATUS.agendado;
  return `<button class="item" data-act="agDia" data-d="${a.data}"><span class="time">${esc(a.hora||'--:--')}</span><span class="dot" style="background:${st.c}"></span><div class="grow"><div class="t">${esc(nomeCli(a.clienteId))}</div><div class="s">${esc(nomeAg(a))} · ${a.pacoteId?'pacote':BRL(a.valor)}</div></div><span class="badge">${st.n}</span></button>`}
function esperaRow(e){const cli=S.clientes.get(e.clienteId);const nome=cli?.nome||e.nome;const tel=cli?.telefone||e.telefone;
  const s=S.servicos.get(e.servicoId);let sug=null;for(let i=0;i<14&&!sug;i++){const d=addDays(today(),i);const l=livresDia(d,+s?.duracao||120);if(l.length)sug={d,h:min2hm(l[0][0])}}
  const w=sug?waLink(tel,`Oi, ${primeiro(nome)}! Abriu um horário para ${s?.nome||'suas tranças'}: ${dataLonga(sug.d)} às ${sug.h}. Quer que eu reserve para você?`):null;
  return `<div class="item"><div class="avatar" style="--lv:var(--lv-perola)">${iniciais(nome)}</div><div class="grow"><div class="t">${esc(nome)}</div><div class="s">${esc(s?.nome||'Qualquer serviço')} · ${esc(e.preferencia||'qualquer horário')} · desde ${dataCurta(e.desde)}</div></div>${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener" title="Sugere ${dataCurta(sug.d)} às ${sug.h}">${ic('chat')}Avisar</a>`:''}<button class="icon-btn" data-act="editEspera" data-id="${e.id}" aria-label="Editar">${ic('edit')}</button></div>`}
function agVisSeg(){return `<div class="tabs-scroll ag-vis">${seg('agVis',UI.agVis,[['dia','Dia'],['semana','Semana'],['mes','Mês']])}</div>`}
function vAgenda(){if(UI.agVis==='semana')return vAgendaSemana();if(UI.agVis==='mes')return vAgendaMes();
  const d=UI.agDia;const base=parse(d);const ini=addDays(d,-base.getDay());const t=today();const pb=pub();
  const ag=arr('agenda');const dias=[...Array(7)].map((_,i)=>addDays(ini,i));
  const doDia=ag.filter(a=>a.data===d).sort((a,b)=>a.hora<b.hora?-1:1);
  const ativos=doDia.filter(a=>a.status!=='cancelado'&&a.status!=='faltou');
  const livres=livresDia(d,60);const esp=arr('espera').filter(e=>e.status==='aguardando').sort((a,b)=>a.desde<b.desde?-1:1);
  let out=head('Agenda',esc(cap(dataLonga(d))),`${ativos.length} atendimento${ativos.length===1?'':'s'} · previsto ${BRL(soma(ativos))}`,
   `<button class="icon-btn" data-act="agNav" data-n="-7" aria-label="Semana anterior">${ic('left')}</button><button class="btn sm soft" data-act="agHoje">Hoje</button><button class="icon-btn" data-act="agNav" data-n="7" aria-label="Próxima semana">${ic('right')}</button><button class="btn soft" data-act="divulgar">${ic('image')}Divulgar</button><button class="btn primary" data-act="novoAg">${ic('plus')}Agendar</button>`)+agVisSeg();
  out+=`<div class="week">${dias.map(x=>{const n=ag.filter(a=>a.data===x&&a.status!=='cancelado').length;const dd=parse(x);
    const exd=expediente(x);const fe=exd.aberto?'':exd.motivo;return `<button class="day ${x===t?'today':''} ${fe?'fechado':''} ${exd.especial?'especial':''}" data-act="agDia" data-d="${x}" aria-pressed="${x===d}" title="${esc(fe)}"><span class="w">${SEM[dd.getDay()]}</span><span class="n">${dd.getDate()}</span><span class="c">${fe&&!n?'<span class="fx">fechado</span>':'<i></i>'.repeat(Math.min(n,4))}</span></button>`}).join('')}</div>`;
  out+=`<section class="card" style="padding:14px 16px">${linhaTempo(d)}</section>`;
  out+=`<div class="grid g2"><section class="stack" style="gap:10px">${doDia.length?doDia.map(apptCard).join(''):`<div class="card empty">Nenhum atendimento neste dia.<br><button class="btn soft" style="margin-top:10px" data-act="novoAg" data-d="${d}">${ic('plus')}Marcar horário</button></div>`}</section>
  <section class="stack"><div class="card"><h3>Horários livres <small>${esc(textoExpediente(expediente(d)))}</small></h3>${diaFechado(d)?`<div class="empty">${esc(diaFechado(d))}: sem horários livres para oferecer.<br><button class="btn sm ghost" style="margin-top:6px" data-act="novoAg" data-d="${d}">Agendar mesmo assim</button></div>`:d<today()?'<div class="empty">Dia que já passou.</div>':livres.length?`<div class="row">${livres.map(([a,b])=>`<button class="free" data-act="novoAg" data-d="${d}" data-h="${min2hm(a)}">${min2hm(a)} às ${min2hm(b)}</button>`).join('')}</div>`:`<div class="empty">Dia cheio.</div>`}</div>
  <div class="card"><h3>Lista de espera <button class="btn sm soft" data-act="novaEspera">${ic('plus')}Adicionar</button></h3>${esp.length?`<div class="list">${esp.map(esperaRow).join('')}</div><p class="small muted" style="margin-bottom:0">O botão Avisar já sugere o primeiro horário livre que comporta o serviço.</p>`:'<div class="empty">Ninguém aguardando. Quando a agenda lotar, anote aqui quem quer um encaixe.</div>'}</div>
  <div class="card"><h3>Próximos 7 dias</h3><div class="list">${ag.filter(a=>a.data>d&&a.data<=addDays(d,7)&&a.status!=='cancelado').sort((a,b)=>(a.data+a.hora)<(b.data+b.hora)?-1:1).slice(0,6).map(a=>`<button class="item" data-act="agDia" data-d="${a.data}"><span class="time">${dataCurta(a.data)}</span><div class="grow"><div class="t">${esc(nomeCli(a.clienteId))}</div><div class="s">${esc(a.hora)} · ${esc(nomeAg(a))}</div></div></button>`).join('')||'<div class="empty">Nada marcado.</div>'}</div></div></section></div>`;
  return out;
}

/* ---------- agenda: semana e mês ---------- */
const agAtivo=a=>a.status!=='cancelado';
const durCampo=(id,min)=>{const v=Math.max(0,Math.round(+min||0));const h=Math.floor(v/60),m=v%60;const ms=[0,5,10,15,20,25,30,35,40,45,50,55];if(!ms.includes(m))ms.push(m);
  return `<span class="dur-in" data-dur="${id}"><input type="number" class="dur-h" min="0" max="24" inputmode="numeric" value="${v?h:''}" placeholder="0" aria-label="Horas"><span>h</span><select class="dur-m" aria-label="Minutos">${ms.sort((a,b)=>a-b).map(x=>`<option value="${x}" ${x===m?'selected':''}>${String(x).padStart(2,'0')}</option>`).join('')}</select><span>min</span><input type="hidden" id="${id}" value="${v||''}"></span>`};
function setDur(id,min){const box=document.querySelector(`[data-dur="${id}"]`);if(!box)return;const v=Math.max(0,Math.round(+min||0));const h=box.querySelector('.dur-h'),m=box.querySelector('.dur-m');h.value=v?Math.floor(v/60):'';
  if(![...m.options].some(o=>+o.value===v%60))m.insertAdjacentHTML('beforeend',`<option value="${v%60}">${String(v%60).padStart(2,'0')}</option>`);m.value=String(v%60);box.querySelector('input[type=hidden]').value=v||''}
document.addEventListener('input',e=>{const box=e.target.closest&&e.target.closest('.dur-in');if(!box)return;const h=Math.max(0,+box.querySelector('.dur-h').value||0),m=+box.querySelector('.dur-m').value||0;const hid=box.querySelector('input[type=hidden]');hid.value=h*60+m||'';hid.dispatchEvent(new Event('change',{bubbles:true}))});
document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('dur-m'))e.target.dispatchEvent(new Event('input',{bubbles:true}))});
const custoFicha=cons=>(cons||[]).reduce((t,c)=>{const it=S.estoque.get(c.itemId);return t+(+c.qtd||0)*(+it?.custo||0)},0);
const custoServ=s=>s?((s.consumo||[]).length&&custoFicha(s.consumo)>0?custoFicha(s.consumo):+s.custo||0):0;
function ocupacao(dias){let aberto=0,ocup=0;dias.forEach(x=>{const e=expediente(x);if(!e.aberto)return;const ini=hm2min(e.abre),fim=hm2min(e.fecha);aberto+=fim-ini-(e.pausa?e.pausa[1]-e.pausa[0]:0);
  arr('agenda').filter(a=>a.data===x&&a.status!=='cancelado'&&a.status!=='faltou').forEach(a=>{const h=hm2min(a.hora);ocup+=Math.max(0,Math.min(fim,h+(+a.duracao||60))-Math.max(ini,h))})});return aberto?Math.min(100,Math.round(ocup/aberto*100)):0}
function agBotoes(n,lbl){return `<button class="icon-btn" data-act="agNav" data-n="-${n}" aria-label="${lbl} anterior">${ic('left')}</button><button class="btn sm soft" data-act="agHoje">Hoje</button><button class="icon-btn" data-act="agNav" data-n="${n}" aria-label="Próxima ${lbl.toLowerCase()}">${ic('right')}</button><button class="btn primary" data-act="novoAg">${ic('plus')}Agendar</button>`}
function vAgendaSemana(){const d=UI.agDia;const ini=addDays(d,-parse(d).getDay());const dias=[...Array(7)].map((_,i)=>addDays(ini,i));const t=today();
  const porDia=dias.map(x=>arr('agenda').filter(a=>a.data===x&&agAtivo(a)).sort((a,b)=>a.hora<b.hora?-1:1));
  const tot=porDia.flat();const prev=soma(tot.filter(a=>a.status!=='faltou'));
  const exps=dias.map(expediente);const abertos=exps.filter(e=>e.aberto);
  let h0=Math.min(...abertos.map(e=>hm2min(e.abre)),...tot.map(a=>hm2min(a.hora)),8*60),h1=Math.max(...abertos.map(e=>hm2min(e.fecha)),...tot.map(a=>hm2min(a.hora)+(+a.duracao||60)),18*60);
  h0=Math.floor(h0/60)*60;h1=Math.ceil(h1/60)*60;const PX=0.8;const alt=(h1-h0)*PX;
  const f1=parse(dias[0]),f7=parse(dias[6]);const titulo=f1.getMonth()===f7.getMonth()?`${f1.getDate()} a ${f7.getDate()} de ${MESES[f7.getMonth()]}`:`${f1.getDate()} de ${MESES[f1.getMonth()]} a ${f7.getDate()} de ${MESES[f7.getMonth()]}`;
  let out=head('Agenda',`Semana de <em>${titulo}</em>`,`${tot.length} atendimento${tot.length===1?'':'s'} · previsto ${BRL(prev)} · agenda ${ocupacao(dias)}% ocupada`,agBotoes(7,'Semana'))+agVisSeg();
  const horas=[];for(let m=h0;m<=h1;m+=60)horas.push(m);
  out+=`<section class="card sem-grade mostra-pc" style="--alt:${alt}px"><div class="sg-horas">${horas.map(m=>`<span style="top:${(m-h0)*PX}px">${min2hm(m)}</span>`).join('')}</div>
   ${dias.map((x,i)=>{const e=exps[i];const dd=parse(x);return `<div class="sg-col ${x===t?'hoje':''} ${e.aberto?'':'fechado'}"><button class="sg-cab" data-act="agVerDia" data-d="${x}"><span>${SEM[dd.getDay()]}</span><b>${dd.getDate()}</b>${e.especial?'<i class="sg-esp" title="Horário especial"></i>':''}</button>
     <div class="sg-corpo">${horas.slice(1).map(m=>`<i class="sg-linha" style="top:${(m-h0)*PX}px"></i>`).join('')}
      ${e.aberto?`${hm2min(e.abre)>h0?`<i class="sg-off" style="top:0;height:${(hm2min(e.abre)-h0)*PX}px"></i>`:''}${hm2min(e.fecha)<h1?`<i class="sg-off" style="top:${(hm2min(e.fecha)-h0)*PX}px;bottom:0"></i>`:''}${e.pausa?`<i class="sg-off pausa" style="top:${(e.pausa[0]-h0)*PX}px;height:${(e.pausa[1]-e.pausa[0])*PX}px"></i>`:''}`:`<span class="sg-fechado">${esc(e.motivo)}</span>`}
      ${porDia[i].map(a=>{const st=STATUS[a.status]||STATUS.agendado;const ini=hm2min(a.hora);const du=Math.max(30,+a.duracao||60);return `<button class="sg-ag" style="--st:${st.c};top:${(ini-h0)*PX}px;height:${du*PX-2}px" data-act="editAg" data-id="${a.id}" title="${esc(a.hora)} · ${esc(nomeCli(a.clienteId))} · ${esc(nomeAg(a))}"><b>${esc(a.hora)}</b> ${esc(primeiro(nomeCli(a.clienteId)))}<small>${esc(nomeAg(a))}</small></button>`}).join('')}
      ${x>=t&&e.aberto?livresDia(x,60).map(([a,b])=>`<button class="sg-livre" style="top:${(a-h0)*PX}px;height:${(b-a)*PX-2}px" data-act="novoAg" data-d="${x}" data-h="${min2hm(a)}" aria-label="Agendar ${dataCurta(x)} às ${min2hm(a)}">${b-a>=60?`livre ${min2hm(a)}`:''}</button>`).join(''):''}
     </div></div>`}).join('')}</section>`;
  out+=`<div class="stack mostra-mob">${dias.map((x,i)=>{const e=exps[i];const dd=parse(x);const l=x>=t&&e.aberto?livresDia(x,60):[];
    return `<section class="card sm-dia ${x===t?'hoje':''}"><div class="row between"><button class="sm-cab" data-act="agVerDia" data-d="${x}"><b>${cap(SEMX[dd.getDay()])}, ${dd.getDate()}</b> <span class="small muted">${esc(textoExpediente(e))}</span></button>${e.aberto&&x>=t?`<button class="btn sm ghost" data-act="novoAg" data-d="${x}">${ic('plus')}</button>`:''}</div>
     ${porDia[i].length?`<div class="list">${porDia[i].map(a=>{const st=STATUS[a.status]||STATUS.agendado;return `<button class="item" data-act="editAg" data-id="${a.id}"><span class="time">${esc(a.hora)}</span><span class="dot" style="background:${st.c}"></span><div class="grow"><div class="t">${esc(nomeCli(a.clienteId))}</div><div class="s">${esc(nomeAg(a))} · ${st.n}</div></div></button>`}).join('')}</div>`:''}
     ${l.length?`<div class="row" style="margin-top:8px">${l.map(([a,b])=>`<button class="free" data-act="novoAg" data-d="${x}" data-h="${min2hm(a)}">${min2hm(a)} às ${min2hm(b)}</button>`).join('')}</div>`:!porDia[i].length?`<div class="small muted" style="margin-top:4px">${e.aberto?(x<t?'Sem atendimentos.':'Dia cheio.'):''}</div>`:''}</section>`}).join('')}</div>`;
  return out}
function vAgendaMes(){const d=UI.agDia;const m=ym(d);const [Y,M]=m.split('-').map(Number);const prim=`${m}-01`;const ini=addDays(prim,-parse(prim).getDay());const t=today();
  const nDias=new Date(Y,M,0).getDate();const fim=`${m}-${String(nDias).padStart(2,'0')}`;
  const cel=[];for(let x=ini;cel.length<42&&(x<=fim||cel.length%7);x=addDays(x,1))cel.push(x);
  const doMes=arr('agenda').filter(a=>ym(a.data)===m&&agAtivo(a));const conc=doMes.filter(a=>a.status==='concluido');
  let livresN=0,diasAbertos=0;for(let i=1;i<=nDias;i++){const x=`${m}-${String(i).padStart(2,'0')}`;if(expediente(x).aberto){diasAbertos++;if(x>=t&&livresDia(x,120).length)livresN++}}
  let out=head('Agenda',`<em>${cap(MESES[M-1])}</em> de ${Y}`,`${doMes.length} atendimento${doMes.length===1?'':'s'} · previsto ${BRL(soma(doMes.filter(a=>a.status!=='faltou')))}`,
    `<button class="icon-btn" data-act="agMes" data-n="-1" aria-label="Mês anterior">${ic('left')}</button><button class="btn sm soft" data-act="agHoje">Hoje</button><button class="icon-btn" data-act="agMes" data-n="1" aria-label="Próximo mês">${ic('right')}</button><button class="btn primary" data-act="novoAg">${ic('plus')}Agendar</button>`)+agVisSeg();
  out+=`<section class="card mes-grade"><div class="mg-sem">${SEM.map(x=>`<span>${x}</span>`).join('')}</div><div class="mg-dias">${cel.map(x=>{const fora=ym(x)!==m;const e=expediente(x);const l=doMes.filter(a=>a.data===x).sort((a,b)=>a.hora<b.hora?-1:1);
    return `<button class="mg-dia ${fora?'fora':''} ${x===t?'hoje':''} ${e.aberto?'':'fechado'} ${x===d?'sel':''}" data-act="agVerDia" data-d="${x}" aria-label="${dataLonga(x)}: ${l.length} atendimento(s)"><span class="mg-n">${parse(x).getDate()}${e.especial?'<i class="sg-esp"></i>':''}</span>
      ${l.slice(0,3).map(a=>`<span class="mg-ag" style="--st:${(STATUS[a.status]||STATUS.agendado).c}"><b>${esc(a.hora)}</b> ${esc(primeiro(nomeCli(a.clienteId)))}</span>`).join('')}${l.length>3?`<span class="mg-mais">+${l.length-3}</span>`:''}
      <span class="mg-pts">${l.slice(0,4).map(a=>`<i style="background:${(STATUS[a.status]||STATUS.agendado).c}"></i>`).join('')}</span>${!e.aberto&&!fora&&!l.length?'<span class="mg-fx">fechado</span>':''}</button>`}).join('')}</div>
   <div class="mg-leg small muted">${['agendado','confirmado','concluido','faltou'].map(k=>`<span><i style="background:${STATUS[k].c}"></i>${STATUS[k].n}</span>`).join('')}</div></section>`;
  out+=`<div class="kpis"><div class="kpi"><div class="l">Atendimentos</div><div class="v">${doMes.length}</div><div class="s">${conc.length} concluído${conc.length===1?'':'s'}</div></div><div class="kpi"><div class="l">Dias de atendimento</div><div class="v">${diasAbertos}</div><div class="s">no mês</div></div><div class="kpi"><div class="l">Ocupação</div><div class="v">${ocupacao([...Array(nDias)].map((_,i)=>`${m}-${String(i+1).padStart(2,'0')}`))}%</div><div class="s">das horas de atendimento</div></div><div class="kpi"><div class="l">Dias com vaga</div><div class="v">${livresN}</div><div class="s">2h livres ou mais</div></div>${pode('fin')?`<div class="kpi"><div class="l">Concluído no mês</div><div class="v">${BRL(soma(conc))}</div><div class="s">valor dos serviços</div></div>`:''}</div>`;
  return out}

/* ---------- v8: cuidados, avaliações, indicação, sinais, reativar, relatório ---------- */
const CUIDADOS_PADRAO='Lave o couro cabeludo a cada 7 a 10 dias com xampu diluído, secando bem as tranças. Durma com touca ou fronha de cetim. Hidrate o couro com tônico leve, sem óleos pesados. Evite prender com muita tensão nos primeiros dias.';
const IND_PADRAO=['10% de desconto no próximo atendimento para cada amiga atendida','5% de desconto no primeiro atendimento'];
const catDoServ=sid=>arr('catalogo').find(x=>x.servicoId===sid);
const manutDe=sid=>{const c=catDoServ(sid);return +c?.manutSem||+pol().campos.semanasMax||8};
function novoCodigoInd(c){const base=String(primeiro(c.nome)).normalize('NFD').replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,6)||'AMIGA';const usados=new Set(arr('clientes').map(x=>x.indicacaoCodigo));
  let k;do{k=base+String(Math.floor(100+Math.random()*900))}while(usados.has(k));return k}
const cliPorCodigo=cod=>{const k=String(cod||'').trim().toUpperCase();return k?arr('clientes').find(c=>c.indicacaoCodigo===k):null};
const estrelas=n=>'★'.repeat(n)+'☆'.repeat(5-n);
/* avaliações */
function avaliacoesBloco(){const L=arr('avaliacoes').sort((a,b)=>toMs(b.em)-toMs(a.em));if(!L.length)return '';const own=pode('catalogoEdit');
  const media=L.reduce((t,a)=>t+(+a.nota||0),0)/L.length;
  return `<section class="card"><h3>Avaliações das clientes <small>${media.toFixed(1).replace('.',',')} ★ · ${L.length} avaliação${L.length===1?'':'ões'}</small></h3>
   <div class="list">${L.slice(0,UI.avTodas?99:6).map(a=>`<div class="item wrap"><div class="avatar" style="--lv:var(--lv-ouro)">${+a.nota||0}★</div><div class="grow"><div class="t" style="white-space:normal"><span class="estrelas">${estrelas(+a.nota||0)}</span> ${esc(a.nomeExibicao||nomeCli(S.agenda.get(a.agendaId)?.clienteId)||'Cliente')} · ${esc(a.servico||'')}</div>${a.texto?`<div class="s" style="white-space:normal">"${esc(a.texto)}"</div>`:''}<div class="s">${new Date(toMs(a.em)).toLocaleDateString('pt-BR')}${a.autorizaPublicar?'':' · não autorizou divulgar'}</div></div>
    ${own&&a.autorizaPublicar&&a.texto?`<button class="btn sm ${a.publicado?'primary':'soft'}" data-act="avPub" data-id="${a.id}">${a.publicado?`${ic('check')}No catálogo`:'Mostrar no catálogo'}</button>`:''}</div>`).join('')}</div>
   ${L.length>6?`<button class="btn sm ghost" data-act="avTodas">${UI.avTodas?'Mostrar menos':`Ver todas (${L.length})`}</button>`:''}
   <p class="small muted" style="margin-bottom:0">As clientes avaliam pelo espaço delas. Só aparecem no catálogo as que autorizaram e que você escolher.</p></section>`}
async function publicarDepoimentos(){if(!pode('catalogoEdit'))return;const lista=arr('avaliacoes').filter(a=>a.publicado&&a.autorizaPublicar&&a.texto).sort((a,b)=>toMs(b.em)-toMs(a.em)).slice(0,12)
  .map(a=>({nome:String(a.nomeExibicao||'Cliente').slice(0,60),nota:+a.nota||5,texto:String(a.texto).slice(0,600),servico:String(a.servico||'').slice(0,80),data:new Date(toMs(a.em)).toISOString().slice(0,10)}));
  const todas=arr('avaliacoes');const media=todas.length?todas.reduce((t,a)=>t+(+a.nota||0),0)/todas.length:0;
  await setDoc(doc(FS,'vitrine','depoimentos'),{lista,media:Math.round(media*10)/10,total:todas.length,atualizadoEm:nowIso()}).catch(dbErr)}
function avisosAvaliacao(){return arr('avaliacoes').filter(a=>!a.visto).map(a=>`<div class="item"><div class="avatar" style="--lv:var(--lv-ouro)">${+a.nota||0}★</div><div class="grow"><div class="t" style="white-space:normal">${esc(a.nomeExibicao||'Uma cliente')} avaliou ${esc(a.servico||'o atendimento')}: <span class="estrelas">${estrelas(+a.nota||0)}</span></div>${a.texto?`<div class="s" style="white-space:normal">"${esc(a.texto)}"</div>`:''}</div>${pode('catalogoEdit')&&a.autorizaPublicar&&a.texto&&!a.publicado?`<button class="btn sm soft" data-act="avPub" data-id="${a.id}">Mostrar no catálogo</button>`:''}<button class="btn sm ghost" data-act="avisoVisto" data-k="aval" data-id="${a.id}">Ok</button></div>`)}
/* indicação */
function avisosIndicacao(){return arr('clientes').filter(c=>c.indicadaPor&&!c.indAvisado&&S.clientes.has(c.indicadaPor)&&(agPorCli().get(c.id)||[]).some(a=>a.status==='concluido')).map(c=>{const r=S.clientes.get(c.indicadaPor);const pb=pub();
  const w=waLink(r.telefone,`Oi, ${primeiro(r.nome)}! 💕 A ${primeiro(c.nome)}, que você indicou, já fez o atendimento dela. Obrigada! Você ganhou: ${pb.indBenef||IND_PADRAO[0]}. É só me lembrar no seu próximo horário.`);
  return `<div class="item"><div class="avatar" style="--lv:var(--lv-perola)">${ic('gift')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(primeiro(r.nome))} ganhou o benefício de indicação</div><div class="s" style="white-space:normal">${esc(primeiro(c.nome))}, indicada por ela, fez o primeiro atendimento</div></div>${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Avisar</a>`:''}<button class="btn sm ghost" data-act="indVisto" data-id="${c.id}">Ok</button></div>`})}
/* clientes para reativar */
function paraReativar(){return memo('reat',()=>{const t=today();const out=[];
  arr('clientes').forEach(c=>{if(c.reativadoEm&&c.reativadoEm>=addDays(t,-30))return;const ag=agPorCli().get(c.id)||[];
    if(ag.some(a=>a.data>=t&&(a.status==='agendado'||a.status==='confirmado')))return;
    const ult=ag.filter(a=>a.status==='concluido'&&a.data<=t).sort((a,b)=>a.data<b.data?1:-1)[0];if(!ult)return;
    const dias=diffDays(ult.data,t);const m=manutDe(ult.servicoId);const venc=addDays(ult.data,m*7);
    if(venc<=t&&dias<=m*7+60)out.push({c,ult,dias,motivo:'manutencao',txt:`manutenção vencida desde ${dataCurta(venc)}`});
    else if(dias>90)out.push({c,ult,dias,motivo:'sumida',txt:`sem voltar há ${dias} dias`})});
  return out.sort((a,b)=>a.motivo===b.motivo?b.dias-a.dias:a.motivo==='manutencao'?-1:1)})}
function msgReativar(x){const pb=pub();const n=primeiro(x.c.nome);return x.motivo==='manutencao'
  ?`Oi, ${n}! 💕 Já está na hora da manutenção da sua ${nomeAg(x.ult)}, para manter o couro cabeludo saudável e as tranças bonitas. Quer que eu reserve um horário para você esta semana?`
  :`Oi, ${n}! Que saudade! 💕 Faz um tempinho que você não vem ao ateliê. Tenho horários livres nos próximos dias. Quer que eu reserve um para você? Beijos, ${primeiro(pb.responsavel)}`}
function reativarBloco(){if(!pode('base'))return '';const L=paraReativar();if(!L.length)return '';const ver=UI.reatTodos?L:L.slice(0,5);
  return `<section class="card reat"><h3>${ic('repeat')} Para reativar <small>${L.length} cliente${L.length===1?'':'s'}</small></h3><div class="list">${ver.map(x=>{const w=waLink(x.c.telefone,msgReativar(x));
    return `<div class="item wrap"><div class="avatar" style="--lv:${x.motivo==='manutencao'?'var(--lv-ouro)':'var(--lv-bronze)'}">${iniciais(x.c.nome)}</div><div class="grow"><div class="t">${esc(x.c.nome)}</div><div class="s">${esc(x.txt)} · ${esc(nomeAg(x.ult))}</div></div>${w?`<a class="btn sm primary" href="${w}" target="_blank" rel="noopener" data-act="reatFeito" data-id="${x.c.id}">${ic('chat')}Convidar</a>`:''}<button class="btn sm ghost" data-act="reatFeito" data-id="${x.c.id}" title="Some da lista por 30 dias">Já falei</button></div>`}).join('')}</div>
   ${L.length>5?`<button class="btn sm ghost" data-act="reatTodos">${UI.reatTodos?'Mostrar menos':`Ver todas (${L.length})`}</button>`:''}</section>`}
/* sinais */
function inicioMs(a){const [h,m]=String(a.hora||'00:00').split(':').map(Number);const d=parse(a.data);d.setHours(h||0,m||0,0,0);return d.getTime()}
function finSinais(){const P=pol();const pct=+P.campos.sinalPct||0;const prazoH=+P.campos.prazoCancel||48;const t=today();const m=UI.finMes;
  const sinalDe=a=>soma((a.pagamentos||[]).filter(p=>p.tipo==='sinal'));
  const fut=arr('agenda').filter(a=>a.data>=t&&a.data<=addDays(t,45)&&(a.status==='agendado'||a.status==='confirmado')&&!a.pacoteId).sort((a,b)=>(a.data+a.hora)<(b.data+b.hora)?-1:1);
  const esp=a=>Math.round((+a.valor||0)*pct)/100;const sem=fut.filter(a=>sinalDe(a)<=0),parc=fut.filter(a=>sinalDe(a)>0&&sinalDe(a)<esp(a)-0.01),ok=fut.filter(a=>sinalDe(a)>0&&sinalDe(a)>=esp(a)-0.01);
  const rec=arr('agenda').flatMap(a=>(a.pagamentos||[]).filter(p=>p.tipo==='sinal'&&ym(p.data)===m).map(p=>+p.valor||0)).reduce((x,y)=>x+y,0);
  const perdidos=arr('agenda').filter(a=>(a.status==='cancelado'||a.status==='faltou')&&sinalDe(a)>0).map(a=>{let sit;
    if(a.sinalDevolvido)sit='devolvido';else if(a.sinalRetido)sit='retido';else if(a.status==='faltou')sit='retido';
    else if(a.canceladoEm){sit=inicioMs(a)-Date.parse(a.canceladoEm)>=prazoH*3600e3?'verificar':'retido'}else sit='verificar';return {a,sit,v:sinalDe(a)}});
  const retMes=perdidos.filter(x=>x.sit==='retido'&&ym(x.a.data)===m),verif=perdidos.filter(x=>x.sit==='verificar');
  const row=(a,extra='')=>{const cli=S.clientes.get(a.clienteId);return `<div class="item wrap"><span class="time">${dataCurta(a.data)}</span><div class="grow"><div class="t">${esc(nomeCli(a.clienteId))}</div><div class="s">${esc(a.hora)} · ${esc(nomeAg(a))} · serviço ${BRL(a.valor)} · sinal ${BRL(sinalDe(a))} de ${BRL(esp(a))}</div></div>${extra}</div>`};
  const cobrar=a=>{const cli=S.clientes.get(a.clienteId);const falta=Math.max(0,esp(a)-sinalDe(a));const w=cli&&pode('finEdit')?waLink(cli.telefone,`Oi, ${primeiro(cli.nome)}! 💕 Para garantir seu horário de ${nomeAg(a)} ${dataLonga(a.data)} às ${a.hora}, falta o sinal de ${BRL(falta)}. Te mando o link de pagamento?`):null;
    return `${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Cobrar</a>`:''}${pode('finEdit')?`<button class="btn sm ghost" data-act="editAg" data-id="${a.id}">Registrar</button>`:''}`};
  return `<section class="kpis"><div class="kpi"><div class="l">Sinais recebidos no mês</div><div class="v">${cnt(rec)}</div><div class="d">${esc(cap(mesNome(m)))}</div></div>
   <div class="kpi"><div class="l">Sem sinal (próx. 45 dias)</div><div class="v" style="color:${sem.length?'var(--warn)':'inherit'}">${sem.length}</div><div class="d">${BRL(soma(sem.map(a=>({valor:esp(a)}))))} a receber</div></div>
   <div class="kpi"><div class="l">Retidos no mês</div><div class="v">${cnt(soma(retMes.map(x=>({valor:x.v}))))}</div><div class="d">faltas e cancelamentos fora do prazo</div></div>
   <div class="kpi"><div class="l">Para verificar</div><div class="v" style="color:${verif.length?'var(--warn)':'inherit'}">${verif.length}</div><div class="d">cancelados no prazo ou sem data</div></div></section>
  ${verif.length?`<section class="card"><h3>Sinais para decidir <small>a política diz: no prazo, o sinal ${esc(String(P.campos.sinalCancel||'segue a política'))}</small></h3><div class="list">${verif.map(x=>row(x.a,pode('finEdit')?`<button class="btn sm soft" data-act="sinalDev" data-id="${x.a.id}">Devolvi</button><button class="btn sm ghost" data-act="sinalRet" data-id="${x.a.id}">Ficou retido</button>`:'')).join('')}</div></section>`:''}
  <section class="card"><h3>Sem sinal <small>${sem.length} atendimento${sem.length===1?'':'s'} · sinal de ${pct}%</small></h3>${sem.length?`<div class="list">${sem.map(a=>row(a,cobrar(a))).join('')}</div>`:'<div class="empty">Todos os próximos atendimentos têm sinal.</div>'}</section>
  ${parc.length?`<section class="card"><h3>Sinal parcial <small>${parc.length}</small></h3><div class="list">${parc.map(a=>row(a,cobrar(a))).join('')}</div></section>`:''}
  <section class="card"><h3>Com sinal pago <small>${ok.length} · ${BRL(soma(ok.map(a=>({valor:sinalDe(a)}))))}</small></h3>${ok.length?`<div class="list">${ok.slice(0,12).map(a=>row(a,'<span class="badge good">ok</span>')).join('')}</div>`:'<div class="empty">Nenhum ainda.</div>'}</section>
  ${perdidos.filter(x=>x.sit!=='verificar').length?`<section class="card"><h3>Histórico de sinais de cancelamentos e faltas</h3><div class="list">${perdidos.filter(x=>x.sit!=='verificar').sort((a,b)=>a.a.data<b.a.data?1:-1).slice(0,15).map(x=>row(x.a,`<span class="badge ${x.sit==='retido'?'':'good'}">${x.sit==='retido'?(x.a.status==='faltou'?'retido · falta':'retido'):'devolvido'}</span>`)).join('')}</div></section>`:''}`}
/* relatório para a contabilidade */
function relatorioContador(){const m=UI.finMes;const pb=pub(),c=priv();const ano=m.slice(0,4);const R=receitas(l=>ym(l.data)===m),D=despesas(l=>ym(l.data)===m);const r=soma(R),d=soma(D);
  const agg=(L,k)=>{const o={};L.forEach(l=>o[l[k]||'Outro']=(o[l[k]||'Outro']||0)+(+l.valor||0));return Object.entries(o).sort((a,b)=>b[1]-a[1])};
  const nf=R.filter(l=>l.nf),serv=R.filter(l=>!ehComercio(l)),com=R.filter(l=>ehComercio(l));
  const recAno=soma(receitas(l=>l.data.slice(0,4)===ano&&l.data<=`${m}-31`));const lim=limiteAno(ano);const dasPago=!!(c.dasPagos||{})[m];
  const oc=ocorrencias(`${m}-31`).filter(o=>ym(o.venc)===m);
  const tab=(rows,tot)=>`<table><tbody>${rows.map(([k,v])=>`<tr><td>${esc(k)}</td><td style="text-align:right;white-space:nowrap">${BRL(v)}</td></tr>`).join('')}${tot!=null?`<tr><td><b>Total</b></td><td style="text-align:right"><b>${BRL(tot)}</b></td></tr>`:''}</tbody></table>`;
  const lan=[...R.map(l=>({...l,t:'Receita'})),...D.map(l=>({...l,t:'Despesa'}))].sort((a,b)=>a.data<b.data?-1:1);
  return `<article class="doc"><h1>Relatório mensal do MEI</h1><div class="sub">${esc(pb.nome)} · CNPJ ${esc(pb.cnpj||'não informado')} · ${esc(pb.municipio||'')}<br>Competência: <b>${esc(cap(mesNome(m)))}</b> · gerado em ${dataBR(today())}</div>
   <h2>Resumo</h2>${tab([['Receita bruta',r],['Despesas',d],['Resultado do mês',r-d]])}
   <h2>Receita bruta por natureza (base da DASN-SIMEI)</h2>${tab([['Prestação de serviços com nota fiscal',soma(serv.filter(l=>l.nf))],['Prestação de serviços sem nota fiscal',soma(serv.filter(l=>!l.nf))],['Comércio (venda de produtos) com nota fiscal',soma(com.filter(l=>l.nf))],['Comércio (venda de produtos) sem nota fiscal',soma(com.filter(l=>!l.nf))]],r)}
   <h2>Receitas por categoria</h2>${tab(agg(R,'categoria'),r)}
   <h2>Recebimentos por forma de pagamento</h2>${tab(agg(R,'forma'))}
   <h2>Despesas por categoria</h2>${D.length?tab(agg(D,'categoria'),d):'<p>Sem despesas no mês.</p>'}
   <h2>Limite anual e DAS</h2>${tab([[`Faturamento acumulado em ${ano} (até ${MES3[+m.slice(5)-1]})`,recAno],['Limite anual do MEI',lim]])}<p>Uso do limite: <b>${lim?Math.round(recAno/lim*1000)/10:0}%</b>. DAS da competência: <b>${dasPago?'pago':'não marcado como pago'}</b> (vencimento dia 20 do mês seguinte). Notas fiscais emitidas no mês: <b>${nf.length}</b> (${BRL(soma(nf))}).</p>
   ${oc.length?`<h2>Contas do mês</h2><table><tbody>${oc.map(o=>`<tr><td>${dataBR(o.venc)} · ${esc(o.conta.descricao)}</td><td>${o.paga?'paga':'em aberto'}</td><td style="text-align:right">${BRL(o.conta.valor)}</td></tr>`).join('')}</tbody></table>`:''}
   <h2>Lançamentos do mês</h2><table><tbody>${lan.map(l=>`<tr><td style="white-space:nowrap">${dataBR(l.data)}</td><td>${l.t}</td><td>${esc(l.descricao||l.categoria||'')}${l.nf?' · NF':''}</td><td style="text-align:right;white-space:nowrap">${l.t==='Despesa'?'−':''}${BRL(l.valor)}</td></tr>`).join('')||'<tr><td>Sem lançamentos.</td></tr>'}</tbody></table>
   <p class="sub" style="margin-top:18px">Relatório gerencial gerado pelo sistema do ateliê. Não substitui a escrituração nem a orientação da contabilidade.</p></article>`}
function abrirRelatorioContador(){sheet('Relatório para a contabilidade',`<div class="stack"><div id="reciboBox">${relatorioContador()}</div><div class="row"><button class="btn primary" data-act="imprimirArea">${ic('file')}Imprimir ou salvar PDF</button></div><p class="small muted" style="margin:0">No celular, escolha "Salvar como PDF" na tela de impressão e envie para a contabilidade.</p></div>`)}
function apptCard(a){
  const st=STATUS[a.status]||STATUS.agendado;const cli=S.clientes.get(a.clienteId);const fim=min2hm(hm2min(a.hora)+(+a.duracao||0));const pb=pub();
  const pago=soma(a.pagamentos||[]);const msg=`Oi, ${primeiro(cli?.nome)}! 💕 Confirmando seu horário de ${nomeAg(a)} ${dataLonga(a.data)} às ${a.hora}. Lembre de vir ${pol().campos.preparo}. Qualquer imprevisto, me avise com ${pol().campos.prazoCancel}h de antecedência. Beijos, ${primeiro(pb.responsavel)}`;
  const l=cli?waLink(cli.telefone,msg):null;const aberto=a.status==='agendado'||a.status==='confirmado';
  const an=pode('anamnese')?anamDe(a.clienteId):null;const al=anamAlertas(an);
  const anTag=pode('anamnese')?(!an?`<span class="badge warn">sem anamnese</span>`:anamVencida(an)?`<span class="badge warn">anamnese vencida</span>`:al.length?`<span class="badge bad" title="${esc(al.map(x=>x.q+(x.det?': '+x.det:'')).join(' | '))}">atenção: ${esc(al.map(x=>x.k==='alergia'?'alergia':x.k==='quimica'?'química recente':x.k==='couro'?'sensibilidade':x.k).join(', '))}</span>`:`<span class="badge good">anamnese ok</span>`):'';
  return `<article class="appt" style="--st:${st.c}"><div><div class="time">${esc(a.hora)}</div><div class="small muted num">${fim}</div></div>
   <div style="min-width:0"><div class="row between"><b>${esc(nomeCli(a.clienteId))}</b><span class="badge">${st.n}</span></div><div class="small muted">${esc(nomeAg(a))} · ${a.pacoteId?'sessão de pacote':BRL(a.valor)}${pago?` · recebido ${BRL(pago)}`:''}</div>
   <div class="row" style="gap:6px;margin-top:6px">${anTag}${contratoTag(a)}${a.canceladoPor?`<span class="badge">cancelado pela cliente</span>`:''}</div>${a.obs?`<div class="small" style="margin-top:4px">${esc(a.obs)}</div>`:''}</div>
   <div class="actions">${aberto?`<button class="btn sm primary" data-act="concluir" data-id="${a.id}">${ic('check')}Concluir</button>`:''}${a.status==='agendado'?`<button class="btn sm soft" data-act="stAg" data-id="${a.id}" data-s="confirmado">Confirmada</button>`:''}${l&&aberto?`<a class="btn sm soft" href="${l}" target="_blank" rel="noopener">${ic('chat')}Lembrete</a>`:''}${aberto&&!contratoDoAg(a.id)?`<button class="btn sm ghost" data-act="linkContrato" data-c="${a.clienteId}" data-a="${a.id}">${ic('file')}Enviar contrato</button>`:''}${a.status==='concluido'?`<button class="btn sm soft" data-act="recibo" data-id="${a.id}">${ic('receipt')}Recibo</button><button class="btn sm ghost" data-act="retorno" data-id="${a.id}">${ic('repeat')}Agendar retorno</button>`:''}<button class="btn sm ghost" data-act="editAg" data-id="${a.id}">${ic('edit')}Editar</button></div></article>`;
}

/* ================= CLIENTES ================= */
function vClientes(){
  const lista=arr('clientes').map(c=>({c,f:fidelidade(c)}));const cont={};lista.forEach(x=>cont[x.f.nivel]=(cont[x.f.nivel]||0)+1);
  const q=UI.cliBusca.toLowerCase();
  const fl=lista.filter(x=>(UI.cliNivel==='todos'||x.f.nivel===UI.cliNivel||(UI.cliNivel==='risco'&&x.f.risco))&&(!q||x.c.nome.toLowerCase().includes(q)||(digits(q)&&digits(x.c.telefone).includes(digits(q)))));
  fl.sort({score:(a,b)=>b.f.score-a.f.score,nome:(a,b)=>a.c.nome.localeCompare(b.c.nome),gasto:(a,b)=>b.f.total-a.f.total,recente:(a,b)=>(b.f.ult||'')>(a.f.ult||'')?1:-1}[UI.cliOrd]);
  const ch=[['todos','Todas',lista.length],...Object.entries(NIVEIS).map(([k,v])=>[k,v.n,cont[k]||0]),['risco','Em risco',lista.filter(x=>x.f.risco).length]];
  return head('Clientes','Suas <em>clientes</em>','Fidelidade calculada pelos últimos 12 meses.',`<div class="row">${pode('base')?`<button class="btn soft" data-act="cadLink">${ic('send')}Link de cadastro</button>`:''}<button class="btn primary" data-act="novaCli">${ic('plus')}Nova cliente</button></div>`)+cadastrosBloco()+reativarBloco()+
  `<div class="row"><label class="searchbox">${ic('search')}<input id="cliBusca" type="search" placeholder="Buscar por nome ou telefone" value="${esc(UI.cliBusca)}" aria-label="Buscar cliente"></label>${seg('cliOrd',UI.cliOrd,[['score','Fidelidade'],['gasto','Mais gastou'],['recente','Recentes'],['nome','A–Z']],'o')}</div>
  <div class="chips">${ch.map(([k,n,q])=>`<button class="chip" data-act="cliNivel" data-n="${k}" aria-pressed="${UI.cliNivel===k}">${n} · ${q}</button>`).join('')}</div>
  <section class="card" style="padding:8px 14px">${fl.length?`<div class="list">${fl.slice(0,UI.cliLim).map(({c,f})=>`<button class="item" data-act="verCli" data-id="${c.id}"><div class="avatar" style="--lv:${NIVEIS[f.nivel].c}">${iniciais(c.nome)}</div><div class="grow"><div class="t">${esc(c.nome)}${c.exemplo?' <span class="badge">exemplo</span>':''}</div><div class="s">${f.ult?`Última visita ${dataCurta(f.ult)} · `:''}${f.visitas} atendimento${f.visitas===1?'':'s'}${pode('fin')?` · ${BRL(f.total)}`:''}</div></div>${f.risco?'<span class="badge warn">em risco</span>':''}<span class="badge lv" style="--lv:${NIVEIS[f.nivel].c}">${NIVEIS[f.nivel].n} · ${f.score}</span></button>`).join('')}</div>${fl.length>UI.cliLim?`<div class="row" style="justify-content:center;padding:10px 0 4px"><button class="btn soft" data-act="cliMais">Ver mais clientes (faltam ${fl.length-UI.cliLim})</button></div>`:''}`:`<div class="empty">Nenhuma cliente encontrada.</div>`}</section>
  <details class="how card"><summary>Como funciona a pontuação de fidelidade</summary>
  <p>Cada cliente recebe de 0 a 100 pontos, recalculados automaticamente com base nos últimos 12 meses:</p>
  <table><tr><td><b>Frequência</b></td><td>7 pontos por atendimento concluído, até 35.</td></tr><tr><td><b>Valor</b></td><td>R$ 1.500 gastos no ano valem 30 pontos (máximo), proporcional.</td></tr>
  <tr><td><b>Recência</b></td><td>Última visita até 45 dias: 20 · até 90: 12 · até 180: 5 · mais: 0.</td></tr><tr><td><b>Indicações</b></td><td>5 pontos por cliente indicada, até 15.</td></tr><tr><td><b>Faltas</b></td><td>−10 pontos por falta sem aviso.</td></tr></table>
  <p>${Object.entries(NIVEIS).filter(([k])=>k!=='nova').map(([k,v])=>`<b>${v.n}</b> ${v.min}+ pontos: ${v.b}`).join('<br>')}<br><b>Nova</b>: ainda sem atendimento concluído. ${NIVEIS.nova.b}<br><b>Em risco</b>: 2+ atendimentos e sem voltar há mais de 90 dias.</p></details>`;
}

/* ================= FINANÇAS ================= */
function vFinanceiro(){
  const tabs=[['visao','Visão geral'],['lanc','Lançamentos'],['contas','Contas'],['sinais','Sinais'],['mei','MEI e impostos'],['rel','Relatórios'],['serv','Serviços e preços']];
  const comMes=['visao','lanc','mei','sinais'].includes(UI.finTab);
  return head('Finanças','Controle <em>financeiro</em>',comMes?esc(cap(mesNome(UI.finMes))):'',
    `${comMes?`<button class="icon-btn" data-act="finMes" data-n="-1" aria-label="Mês anterior">${ic('left')}</button><button class="icon-btn" data-act="finMes" data-n="1" aria-label="Próximo mês">${ic('right')}</button>`:''}${['visao','mei'].includes(UI.finTab)?`<button class="btn soft" data-act="relContador">${ic('file')}Relatório do mês</button>`:''}${!pode('finEdit')?'<span class="badge">somente leitura</span>':UI.finTab==='serv'?`<button class="btn primary" data-act="novoServ">${ic('plus')}Serviço</button>`:UI.finTab==='contas'?`<button class="btn primary" data-act="novaConta">${ic('plus')}Conta a pagar</button>`:`<button class="btn primary" data-act="novoLan">${ic('plus')}Lançar</button>`}`)+
  `<div style="overflow-x:auto">${seg('finTab',UI.finTab,tabs)}</div>`+({visao:finVisao,lanc:finLanc,contas:finContas,sinais:finSinais,mei:finMei,rel:finRel,serv:finServ}[UI.finTab]||finVisao)();
}
function finVisao(){
  const m=UI.finMes;const R=receitas(l=>ym(l.data)===m),D=despesas(l=>ym(l.data)===m);const r=soma(R),d=soma(D);
  const atend=arr('agenda').filter(a=>ym(a.data)===m&&a.status==='concluido');const rp=soma(receitas(l=>ym(l.data)===addMonths(m,-1)));const varr=rp?(r-rp)/rp:null;
  const meses=[...Array(12)].map((_,i)=>addMonths(m,i-11));const serie=meses.map(k=>({k,r:soma(receitas(l=>ym(l.data)===k)),d:soma(despesas(l=>ym(l.data)===k))}));
  const agg=(L,key)=>{const o={};L.forEach(l=>o[l[key]||'Outro']=(o[l[key]||'Outro']||0)+(+l.valor||0));return Object.entries(o).sort((a,b)=>b[1]-a[1])};
  const sd=agg(D,'categoria'),sr=agg(R,'forma'),sc=agg(R,'categoria');const pro=soma(D.filter(l=>l.categoria==='Retirada pró-labore'));
  const comAtend=atend.filter(a=>!a.pacoteId);
  return `<section class="kpis"><div class="kpi"><div class="l">Receita bruta</div><div class="v">${cnt(r)}</div><div class="d">${varr==null?'sem mês anterior':`${varr>=0?'+':''}${pct(varr)} vs. mês anterior`}</div></div>
   <div class="kpi"><div class="l">Despesas</div><div class="v">${cnt(d)}</div><div class="d">${pro?`inclui ${BRL(pro)} de pró-labore`:'sem retiradas'}</div></div>
   <div class="kpi"><div class="l">Lucro</div><div class="v" style="color:${r-d>=0?'var(--good)':'var(--bad)'}">${cnt(r-d)}</div><div class="d">Margem ${r?pct((r-d)/r):'—'}</div></div>
   <div class="kpi"><div class="l">Atendimentos</div><div class="v">${cnt(atend.length,'n')}</div><div class="d">Ticket médio ${BRL(comAtend.length?soma(comAtend)/comAtend.length:0)}</div></div></section>
  <section class="card"><h3>Últimos 12 meses <small><span class="dot" style="background:var(--accent)"></span> receita &nbsp;<span class="dot" style="background:var(--lv-prata)"></span> despesa</small></h3>${grafico(serie,m)}</section>
  <div class="grid g3"><section class="card"><h3>Receitas por tipo</h3>${sc.length?bars(sc,sc[0][1]):'<div class="empty">Sem receitas.</div>'}</section>
  <section class="card"><h3>Despesas por categoria</h3>${sd.length?bars(sd,sd[0][1],'var(--lv-prata)'):'<div class="empty">Sem despesas.</div>'}</section>
  <section class="card"><h3>Recebimentos por forma</h3>${sr.length?bars(sr.map(([k,v])=>[k,v,`${BRL(v)} · ${pct(v/r)}`]),sr[0][1]):'<div class="empty">Sem receitas.</div>'}</section></div>
  <div class="alert info">${ic('info')}<div>Os pagamentos registrados na agenda, nos pacotes e nos vales entram aqui automaticamente, e as taxas de cartão viram despesa sozinhas. O que vai para você entra como <b>Retirada pró-labore</b>.</div></div>`;
}
function grafico(s,cur,{key2=true,fmt}={}){
  const W=Math.max(560,s.length*56),H=220,pl=56,pb=26,pt=10;const mx=Math.max(key2?100:1,...s.map(x=>Math.max(x.r,key2?x.d:0)));
  const step=Math.pow(10,Math.floor(Math.log10(mx)));const nice=[1,2,2.5,5,10].map(k=>k*step).find(v=>mx/v<=5)||step*10;const top=Math.ceil(mx/nice)*nice;
  const y=v=>pt+(H-pt-pb)*(1-v/top);const bw=(W-pl)/s.length;const b=Math.min(key2?16:26,bw/(key2?3.2:2));
  let g='';for(let v=0;v<=top+.001;v+=nice)g+=`<line class="grid-l" x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end">${fmt?fmt(v):v>=1000?(v/1000).toLocaleString('pt-BR')+' mil':v}</text>`;
  s.forEach((x,i)=>{const cx=pl+bw*i+bw/2;const isC=x.k===cur;
    g+=`<rect class="bar-a ${isC?'cur':'rec'}" x="${key2?cx-b-1:cx-b/2}" y="${y(x.r)}" width="${b}" height="${H-pb-y(x.r)}" rx="3" style="animation-delay:${i*30}ms"><title>${esc(x.lab||x.k)}: ${fmt?fmt(x.r):BRL(x.r)}</title></rect>`;
    if(key2)g+=`<rect class="bar-a des" x="${cx+1}" y="${y(x.d)}" width="${b}" height="${H-pb-y(x.d)}" rx="3" style="animation-delay:${i*30+60}ms"><title>${esc(x.k)}: despesa ${BRL(x.d)}</title></rect>`;
    g+=`<text x="${cx}" y="${H-8}" text-anchor="middle" style="${isC?'fill:var(--fg);font-weight:700':''}">${esc(x.lab||MES3[+x.k.slice(5)-1])}</text>`});
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" style="min-width:${Math.min(W,560)}px" role="img">${g}</svg></div>`;
}
function finLanc(){
  const m=UI.finMes;let L=[...receitas(),...despesas()].filter(l=>ym(l.data)===m);if(UI.lanTipo!=='todos')L=L.filter(l=>l.tipo===UI.lanTipo);
  L.sort((a,b)=>a.data<b.data?1:a.data>b.data?-1:0);const grp={};L.forEach(l=>(grp[l.data]=grp[l.data]||[]).push(l));
  const orig={agenda:'via agenda',pacotes:'via pacote',vales:'via vale-presente',taxa:'automático'};
  return `<div class="row between"><div class="chips">${[['todos','Todos'],['receita','Receitas'],['despesa','Despesas']].map(([k,n])=>`<button class="chip" data-act="lanTipo" data-t="${k}" aria-pressed="${UI.lanTipo===k}">${n}</button>`).join('')}</div><button class="btn sm soft" data-act="csvLanc">${ic('down')}Exportar CSV</button></div>
  <section class="card" style="padding:8px 14px">${L.length?Object.entries(grp).map(([d,ls])=>`<div class="eyebrow" style="padding:12px 4px 2px">${esc(dataLonga(d))}</div><div class="list">${ls.map(l=>`<button class="item" data-act="${l.virtual?'abrirOrigem':'editLan'}" data-id="${esc(l.id)}" data-o="${l.origem||''}" data-oid="${l.origemId||''}"><span class="dot" style="background:${l.tipo==='receita'?'var(--good)':'var(--bad)'}"></span><div class="grow"><div class="t">${esc(l.descricao||l.categoria)}</div><div class="s">${esc(l.categoria)} · ${esc(l.forma||'')}${l.parcelas>1?` ${l.parcelas}x`:''}${l.nf?' · com NF':''}${l.virtual?` · ${orig[l.origem]}`:''}${l.exemplo?' · exemplo':''}</div></div><b class="num" style="color:${l.tipo==='receita'?'var(--good)':'var(--bad)'}">${l.tipo==='receita'?'+':'−'} ${BRL(l.valor)}</b></button>`).join('')}</div>`).join(''):'<div class="empty">Nenhum lançamento neste mês.</div>'}</section>`;
}
function finContas(){
  const t=today();const oc=ocorrencias(addDays(t,60));const pend=oc.filter(o=>!o.paga);const venc=pend.filter(o=>o.vencida);
  const prox=pend.filter(o=>!o.vencida&&o.venc<=addDays(t,60));const pagas=oc.filter(o=>o.paga&&o.k>=addMonths(ym(t),-2)).reverse().slice(0,8);
  const rec=aReceber().filter(r=>r.data>=t);const rec30=rec.filter(r=>r.data<=addDays(t,30));
  const futAg=arr('agenda').filter(a=>a.data>=t&&a.data<=addDays(t,30)&&(a.status==='agendado'||a.status==='confirmado')&&!a.pacoteId);
  const prevAg=futAg.reduce((s,a)=>s+Math.max(0,(+a.valor||0)-soma(a.pagamentos||[])),0);
  const sai30=soma(pend.filter(o=>o.venc<=addDays(t,30)).map(o=>({valor:o.conta.valor})));
  const row=o=>`<div class="item"><span class="time">${dataCurta(o.venc)}</span><div class="grow"><div class="t">${esc(o.conta.descricao)}</div><div class="s">${esc(o.conta.categoria)}${o.conta.recorrente==='mensal'?' · mensal':''}</div></div><b class="num">${BRL(o.conta.valor)}</b>${!pode('finEdit')?`<span class="badge ${o.paga?'good':o.vencida?'bad':''}">${o.paga?'paga':o.vencida?'vencida':'a vencer'}</span>`:o.paga?`<button class="btn sm ghost" data-act="pagarConta" data-id="${o.conta.id}" data-k="${o.k}">Desfazer</button>`:`<button class="btn sm ${o.vencida?'primary':'soft'}" data-act="pagarConta" data-id="${o.conta.id}" data-k="${o.k}">${ic('check')}Paguei</button>`}${pode('finEdit')?`<button class="icon-btn" data-act="editConta" data-id="${o.conta.id}" aria-label="Editar conta">${ic('edit')}</button>`:''}</div>`;
  return `<section class="kpis"><div class="kpi"><div class="l">Entradas previstas (30 dias)</div><div class="v">${cnt(soma(rec30.map(r=>({valor:r.liquido})))+prevAg)}</div><div class="d">cartões ${BRL(soma(rec30.map(r=>({valor:r.liquido}))))} + agenda ${BRL(prevAg)}</div></div>
   <div class="kpi"><div class="l">Saídas previstas (30 dias)</div><div class="v">${cnt(sai30)}</div><div class="d">${pend.filter(o=>o.venc<=addDays(t,30)).length} contas</div></div>
   <div class="kpi"><div class="l">Saldo previsto</div><div class="v" style="color:${soma(rec30.map(r=>({valor:r.liquido})))+prevAg-sai30>=0?'var(--good)':'var(--bad)'}">${cnt(soma(rec30.map(r=>({valor:r.liquido})))+prevAg-sai30)}</div><div class="d">sem contar o saldo atual em conta</div></div>
   <div class="kpi"><div class="l">Contas vencidas</div><div class="v" style="color:${venc.length?'var(--bad)':'inherit'}">${cnt(venc.length,'n')}</div><div class="d">${BRL(soma(venc.map(o=>({valor:o.conta.valor}))))}</div></div></section>
  <div class="grid g2"><section class="card"><h3>A pagar</h3>${venc.length||prox.length?`<div class="list">${[...venc,...prox].map(row).join('')}</div>`:'<div class="empty">Nenhuma conta nos próximos 60 dias. Cadastre aluguel, internet, fornecedores e parcelas.</div>'}
   ${pagas.length?`<div class="eyebrow" style="margin-top:14px">Pagas recentemente</div><div class="list">${pagas.map(row).join('')}</div>`:''}</section>
  <section class="card"><h3>A receber dos cartões <small>valor líquido</small></h3>${rec.length?`<div class="list">${rec.slice(0,12).map(r=>`<div class="item"><span class="time">${dataCurta(r.data)}</span><div class="grow"><div class="t">${esc(r.desc)}</div><div class="s">${esc(r.forma)}${r.parc?` · parcela ${r.parc}`:''} · bruto ${BRL(r.bruto)}</div></div><b class="num">${BRL(r.liquido)}</b></div>`).join('')}</div>`:'<div class="empty">Nada a receber de cartões.</div>'}
   <p class="small muted" style="margin-bottom:0">Prazos usados: débito em 1 dia; crédito em 30 dias por parcela. Taxas em Ajustes: débito ${String(priv().taxaDebito).replace('.',',')}%, crédito ${String(priv().taxaCredito).replace('.',',')}%, parcelado ${String(priv().taxaParcelado).replace('.',',')}%.</p></section></div>`;
}
function finMei(){
  const c=priv(),pb=pub();const m=UI.finMes;const ano=m.slice(0,4);const t=today();
  const recAno=soma(receitas(l=>l.data.slice(0,4)===ano));const lim=limiteAno(ano);const p=recAno/lim;
  const mp=ano===t.slice(0,4)?+t.slice(5,7):12;const proj=recAno/Math.max(1,mp)*12;
  const R=receitas(l=>ym(l.data)===m);const v=f=>soma(R.filter(f));
  const servCom=v(l=>!ehComercio(l)&&l.nf),servSem=v(l=>!ehComercio(l)&&!l.nf),comCom=v(l=>ehComercio(l)&&l.nf),comSem=v(l=>ehComercio(l)&&!l.nf);
  const pagos=c.dasPagos||{};
  const das=[...Array(12)].map((_,i)=>{const k=`${ano}-${pad(i+1)}`;const venc=ymd(new Date(+ano,i+1,20));const pago=!!pagos[k];return {k,venc,pago,atras:!pago&&venc<t,fut:k>ym(t)}});
  let alertaLim='';
  if(recAno>lim*1.2)alertaLim=`<div class="alert bad">${ic('alert')}<div>O faturamento passou 20% do limite. Isso leva ao desenquadramento retroativo a janeiro: procure um contador agora.</div></div>`;
  else if(recAno>lim)alertaLim=`<div class="alert bad">${ic('alert')}<div>Limite ultrapassado em até 20%: você segue MEI até dezembro, paga DAS complementar sobre o excesso e passa a microempresa no ano seguinte. Converse com um contador.</div></div>`;
  else if(proj>lim)alertaLim=`<div class="alert warn">${ic('alert')}<div>No ritmo atual, o ano fecha em cerca de ${BRL(proj)}, acima do limite de ${BRL(lim)}. Planeje com antecedência.</div></div>`;
  return `<div class="grid g2"><section class="card"><h3>Limite anual do MEI <small>${ano}</small></h3>
   <div class="row between"><span class="num" style="font-size:1.5rem;font-weight:700">${BRL(recAno)}</span><span class="badge ${p>=1?'bad':p>=.8?'warn':'good'}">${pct(p)} usado</span></div>
   <div class="bar" style="margin:10px 0 6px"><span style="width:${Math.min(100,p*100)}%;background:${p>=1?'var(--bad)':p>=.8?'var(--warn)':'var(--accent)'}"></span></div>
   <div class="small muted">Limite ${c.inicioMei&&c.inicioMei.startsWith(ano)?'proporcional ':''}${BRL(lim)} · resta ${BRL(Math.max(0,lim-recAno))} · projeção para dezembro <b class="num">${BRL(proj)}</b></div>${alertaLim}</section>
  <section class="card"><h3>DAS-MEI ${ano} <small>${BRL(c.das)}/mês · vence dia 20</small></h3>
   <div class="das">${das.map(x=>`<button class="${x.pago?'pago':x.atras?'atras':''}" data-act="das" data-k="${x.k}" aria-pressed="${x.pago}" ${x.fut||!pode('finEdit')?'disabled':''} style="${x.fut?'opacity:.45':''}"><span>${MES3[+x.k.slice(5)-1]}</span><b>${x.pago?'Pago':x.atras?'Atrasado':x.fut?'—':'Em aberto'}</b><span class="muted num">vence ${dataCurta(x.venc)}</span></button>`).join('')}</div>
   <p class="small muted" style="margin-bottom:0">Toque no mês para marcar como pago; a despesa é lançada automaticamente. Emita a guia no Portal do Empreendedor ou no App MEI.</p></section></div>
  <section class="card"><h3>Relatório mensal de receitas brutas <small>${esc(mesNome(m))}</small></h3>
   <div class="scroll-x"><table class="rep"><tbody><tr><td colspan="2"><b>CNPJ:</b> ${esc(pb.cnpj||'não informado')} &nbsp; <b>Empreendedora:</b> ${esc(pb.responsavel)}</td></tr>
   <tr class="sec"><td colspan="2">Revenda de mercadorias (comércio)</td></tr><tr><td>I – Com dispensa de emissão de documento fiscal</td><td class="v">${BRL(comSem)}</td></tr><tr><td>II – Com documento fiscal emitido</td><td class="v">${BRL(comCom)}</td></tr><tr class="tot"><td>III – Total (I + II)</td><td class="v">${BRL(comSem+comCom)}</td></tr>
   <tr class="sec"><td colspan="2">Venda de produtos industrializados (indústria)</td></tr><tr><td>IV – Com dispensa de documento fiscal</td><td class="v">${BRL(0)}</td></tr><tr><td>V – Com documento fiscal emitido</td><td class="v">${BRL(0)}</td></tr><tr class="tot"><td>VI – Total (IV + V)</td><td class="v">${BRL(0)}</td></tr>
   <tr class="sec"><td colspan="2">Prestação de serviços</td></tr><tr><td>VII – Com dispensa de emissão de documento fiscal</td><td class="v">${BRL(servSem)}</td></tr><tr><td>VIII – Com documento fiscal emitido</td><td class="v">${BRL(servCom)}</td></tr><tr class="tot"><td>IX – Total (VII + VIII)</td><td class="v">${BRL(servSem+servCom)}</td></tr>
   <tr class="tot"><td>X – Total geral das receitas brutas no mês (III + VI + IX)</td><td class="v">${BRL(comSem+comCom+servSem+servCom)}</td></tr><tr><td colspan="2" class="muted">${esc(pb.municipio)}, ____/____/______ · Assinatura: ______________________</td></tr></tbody></table></div>
   <div class="row" style="margin-top:12px"><button class="btn soft sm" data-act="csvRel">${ic('down')}Baixar relatório (CSV)</button><button class="btn ghost sm" data-act="copyRel">${ic('copy')}Copiar texto</button></div>
   <p class="small muted" style="margin-bottom:0">Preencha até o dia 20 do mês seguinte e guarde junto com as notas fiscais. Vendas de produto exigem atividade de comércio no seu CNPJ.</p></section>
  <section class="card"><h3>Pacote do contador</h3><p class="small muted" style="margin-top:0">Planilha com tudo o que a contabilidade precisa. O(a) contador(a) com login próprio também pode gerar.</p>
   <div class="row"><label class="fld" style="max-width:140px">Ano<select id="ctdAno">${[0,1,2].map(i=>`<option>${+t.slice(0,4)-i}</option>`).join('')}</select></label><button class="btn primary" data-act="pacoteContador">${ic('down')}Gerar planilha Excel</button></div>
   <p class="small muted" style="margin-bottom:0">Inclui: lançamentos do ano, relatório mensal de receitas brutas dos 12 meses, resumo para a DASN-SIMEI, DAS pagos e contas pagas.</p></section>
  <section class="card"><h3>Obrigações do MEI</h3><div class="list">
   ${[['clock','DAS mensal','Até o dia 20 de cada mês, referente ao mês anterior. Garante INSS e benefícios.'],['wallet','Relatório mensal de receitas brutas','Até o dia 20 do mês seguinte. Este sistema gera automaticamente.'],['cal','DASN-SIMEI (declaração anual)',`Até 31 de maio, com o faturamento de ${+ano-1}: ${BRL(soma(receitas(l=>l.data.slice(0,4)===String(+ano-1))))} registrados aqui.`],['check','Nota fiscal','Obrigatória quando a cliente é empresa (CNPJ). Para pessoa física é opcional, salvo exigência do município.'],['users','Funcionário','O MEI pode contratar 1 empregado. Trancista parceira deve ter contrato próprio (Lei do Salão-Parceiro).'],['info','Guarde comprovantes','Notas, recibos e relatórios por 5 anos.']].map(([i,t,s])=>`<div class="item"><div class="avatar" style="--lv:var(--rose)">${ic(i)}</div><div class="grow"><div class="t" style="white-space:normal">${t}</div><div class="s" style="white-space:normal">${s}</div></div></div>`).join('')}
  </div><p class="small muted" style="margin-bottom:0">Referência 2026: limite anual de R$ 81.000 e DAS de serviços de R$ 86,05. Se a lei mudar, atualize em Ajustes.</p></section>`;
}
function finRel(){
  const t=today();const ini=addMonths(ym(t),-UI.relPer+1)+'-01';const c=priv();
  const ag=arr('agenda').filter(a=>a.data>=ini&&a.data<=t);const concl=ag.filter(a=>a.status==='concluido');
  const porServ={};concl.forEach(a=>{const s=S.servicos.get(a.servicoId);const k=s?.nome||'Outro';const o=porServ[k]=porServ[k]||{n:0,rec:0,custo:0,min:0};o.n++;o.rec+=+a.valor||0;o.custo+=a.custoMaterial!=null&&a.custoMaterial>0?+a.custoMaterial:custoServ(s);o.min+=+a.duracao||+s?.duracao||0});
  const servRows=Object.entries(porServ).map(([k,o])=>({k,...o,lucro:o.rec-o.custo,hora:o.min?(o.rec-o.custo)/(o.min/60):0})).sort((a,b)=>b.lucro-a.lucro);
  const semana=[0,0,0,0,0,0,0];concl.forEach(a=>semana[parse(a.data).getDay()]++);const mxs=Math.max(1,...semana);
  // retorno em até 90 dias
  const base=concl.filter(a=>a.data<=addDays(t,-90));let volt=0;base.forEach(a=>{if(arr('agenda').some(b=>b.clienteId===a.clienteId&&b.status==='concluido'&&b.data>a.data&&b.data<=addDays(a.data,90)))volt++});
  const retorno=base.length?volt/base.length:null;
  const prim={};arr('agenda').filter(a=>a.status==='concluido').forEach(a=>{if(!prim[a.clienteId]||a.data<prim[a.clienteId])prim[a.clienteId]=a.data});
  const novas=Object.entries(prim).filter(([,d])=>d>=ini);const meses=[...Array(UI.relPer)].map((_,i)=>addMonths(ym(t),i-UI.relPer+1));
  const novasSerie=meses.map(k=>({k,r:novas.filter(([,d])=>ym(d)===k).length}));
  const orig={};novas.forEach(([id])=>{const o=S.clientes.get(id)?.origem||'Não informado';orig[o]=(orig[o]||0)+1});const so=Object.entries(orig).sort((a,b)=>b[1]-a[1]);
  const metaSerie=meses.map(k=>({k,r:soma(receitas(l=>ym(l.data)===k))}));const bat=metaSerie.filter(x=>x.r>=+c.meta).length;const melhor=[...metaSerie].sort((a,b)=>b.r-a.r)[0];
  const faltas=ag.filter(a=>a.status==='faltou').length,canc=ag.filter(a=>a.status==='cancelado').length;
  return `<div class="row between"><div class="chips">${[[3,'3 meses'],[6,'6 meses'],[12,'12 meses']].map(([k,n])=>`<button class="chip" data-act="relPer" data-n="${k}" aria-pressed="${UI.relPer===k}">${n}</button>`).join('')}</div></div>
  <section class="kpis"><div class="kpi"><div class="l">Taxa de retorno</div><div class="v">${retorno==null?'—':pct(retorno)}</div><div class="d">voltaram em até 90 dias</div></div>
   <div class="kpi"><div class="l">Clientes novas</div><div class="v">${cnt(novas.length,'n')}</div><div class="d">primeiro atendimento no período</div></div>
   <div class="kpi"><div class="l">Meta batida</div><div class="v">${bat} de ${UI.relPer}</div><div class="d">melhor mês: ${melhor?`${MES3[+melhor.k.slice(5)-1]} (${BRL(melhor.r)})`:'—'}</div></div>
   <div class="kpi"><div class="l">Faltas e cancelamentos</div><div class="v">${faltas+canc}</div><div class="d">${faltas} faltas · ${canc} cancelados · ${ag.length?pct((faltas+canc)/ag.length):'—'}</div></div></section>
  <section class="card"><h3>Lucro por serviço <small>valor cobrado − material (real da ficha técnica quando registrado)</small></h3>${servRows.length?`<div class="scroll-x"><table class="tbl"><thead><tr><th>Serviço</th><th class="v">Feitos</th><th class="v">Receita</th><th class="v">Material</th><th class="v">Lucro</th><th class="v">Lucro/hora</th></tr></thead><tbody>${servRows.map((r,i)=>`<tr><td>${i===0?'<b>':''}${esc(r.k)}${i===0?'</b>':''}</td><td class="v">${r.n}</td><td class="v">${BRL(r.rec)}</td><td class="v">${BRL(r.custo)}</td><td class="v"><b>${BRL(r.lucro)}</b></td><td class="v">${BRL(r.hora)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Sem atendimentos concluídos no período.</div>'}</section>
  <div class="grid g3"><section class="card"><h3>Dias mais cheios</h3>${semana.map((n,i)=>`<div class="hbar"><span>${SEM[i]}</span><div class="bar thin"><span style="width:${n/mxs*100}%;${n===mxs&&n?'background:var(--accent-ink)':''}"></span></div><b class="num" style="text-align:right">${n}</b></div>`).join('')}</section>
  <section class="card"><h3>De onde vêm as clientes novas</h3>${so.length?bars(so.map(([k,v])=>[k,v,`${v} · ${pct(v/novas.length)}`]),so[0][1]):'<div class="empty">Sem clientes novas no período.</div>'}<p class="small muted" style="margin-bottom:0">Preencha "Como conheceu" no cadastro para este gráfico ficar preciso.</p></section>
  <section class="card"><h3>Clientes novas por mês</h3>${grafico(novasSerie,ym(t),{key2:false,fmt:v=>Math.round(v)})}</section></div>
  <section class="card"><h3>Receita x meta mensal <small>meta ${BRL(c.meta)}</small></h3>${grafico(metaSerie,ym(t),{key2:false})}</section>`;
}
function finServ(){
  const sv=arr('servicos').sort((a,b)=>a.nome.localeCompare(b.nome));const ag=arr('agenda').filter(a=>a.status==='concluido');
  if(!sv.length)return `<section class="card empty">Nenhum serviço cadastrado. Os serviços aparecem na agenda, nos contratos e no catálogo.<div class="row" style="justify-content:center;margin-top:10px"><button class="btn primary" data-act="servSug">${ic('spark')}Adicionar serviços sugeridos</button><button class="btn soft" data-act="novoServ">${ic('plus')}Cadastrar um serviço</button></div></section>`;
  return `<section class="card" style="padding:8px 14px">${sv.length?`<div class="list">${sv.map(s=>{const lucro=(+s.preco||0)-custoServ(s);const hora=s.duracao?lucro/(s.duracao/60):0;
   return `<button class="item" data-act="editServ" data-id="${s.id}"><div class="grow"><div class="t">${esc(s.nome)}</div><div class="s">${durTxt(s.duracao)} · material ${BRL(custoServ(s))}${(s.consumo||[]).length&&custoFicha(s.consumo)>0?' (ficha técnica)':''} · lucro/hora ${BRL(hora)} · ${ag.filter(a=>a.servicoId===s.id).length} feitos${(s.consumo||[]).length?` · baixa ${s.consumo.length} item(ns) do estoque`:''}</div></div><b class="num">${BRL(s.preco)}</b></button>`}).join('')}</div>`:'<div class="empty">Nenhum serviço cadastrado.</div>'}</section>
  <div class="alert info">${ic('info')}<div><b>Precificação:</b> o lucro por hora mostra quanto cada serviço rende depois do material. Cadastre o consumo de estoque em cada serviço para a baixa automática.</div></div>`;
}

/* ================= CONTRATOS ================= */
function vContratos(){
  const tabs=[['links','Enviar por link'],['emitir','Emitir documento'],['aceites','Aceites registrados'],['politica','Política da empresa']];const P=pol();
  return head('Contratos','Contratos e <em>termos</em>',`${P.versao?`Política versão ${P.versao}`:'Política ainda não salva'}${P.pend?` · ${P.pend} itens a revisar`:' · revisada'}`)+
  `<div class="alert info">${ic('shield')}<div>Os modelos seguem o Código de Defesa do Consumidor, o Código Civil e a LGPD, mas são um ponto de partida. <b>Peça a um(a) advogado(a) para revisar</b> antes de usar. Trechos em destaque amarelo ainda não foram revisados na política da empresa.</div></div>`+
  `<div style="overflow-x:auto">${seg('ctTab',UI.ctTab,tabs)}</div>`+({links:ctLinks,emitir:ctEmitir,aceites:ctAceites,politica:ctPolitica}[UI.ctTab]||ctLinks)();
}
function ctTipos(){const t=[['servico','Contrato de serviço'],['politica','Política do ateliê']];if(pode('anamnese'))t.splice(1,0,['anamnese','Anamnese e consentimento']);return t}
function ctEmitir(){
  const tipos=ctTipos();if(!tipos.some(x=>x[0]===UI.ctTipo))UI.ctTipo='servico';
  const cls=arr('clientes').sort((a,b)=>a.nome.localeCompare(b.nome));const cli=S.clientes.get(UI.ctCli);
  const ags=cli?arr('agenda').filter(a=>a.clienteId===cli.id&&a.status!=='cancelado').sort((a,b)=>a.data<b.data?1:-1):[];
  if(UI.ctAg&&!ags.some(a=>a.id===UI.ctAg))UI.ctAg='';const ag=S.agenda.get(UI.ctAg)||null;
  let doc='';if(UI.ctTipo==='servico')doc=docServico(cli,ag);else if(UI.ctTipo==='anamnese')doc=docAnamnese(cli,anamDe(cli?.id));else doc=docPolitica();
  const precisaCli=UI.ctTipo!=='politica';const an=cli?anamDe(cli.id):null;
  return `<section class="card"><div class="f2">
   <label class="fld">Documento<select id="ctTipo">${tipos.map(([k,n])=>`<option value="${k}" ${k===UI.ctTipo?'selected':''}>${n}</option>`).join('')}</select></label>
   <label class="fld">Cliente${precisaCli?'':' (opcional)'}<select id="ctCli"><option value="">Selecione…</option>${cls.map(c=>`<option value="${c.id}" ${c.id===UI.ctCli?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></label>
   ${UI.ctTipo==='servico'?`<label class="fld">Atendimento<select id="ctAg"><option value="">Sem atendimento definido</option>${ags.map(a=>`<option value="${a.id}" ${a.id===UI.ctAg?'selected':''}>${dataBR(a.data)} ${esc(a.hora)} · ${esc(nomeAg(a))}</option>`).join('')}</select></label>`:''}</div>
   ${UI.ctTipo==='anamnese'&&cli&&!an?`<div class="alert warn" style="margin-top:10px">${ic('alert')}<div>${esc(primeiro(cli.nome))} ainda não tem ficha preenchida. <button class="btn sm soft" data-act="anamnese" data-id="${cli.id}">Preencher ficha</button></div></div>`:''}
   ${cli&&!cli.cpf&&precisaCli?`<p class="small muted" style="margin-bottom:0">Dica: cadastre o CPF da cliente para o contrato sair completo.</p>`:''}
   <div class="row" style="margin-top:12px"><button class="btn primary" data-act="aceite" ${precisaCli&&!cli?'disabled':''}>${ic('pen')}Coletar aceite</button><button class="btn soft" data-act="copyDoc">${ic('copy')}Copiar texto</button><button class="btn soft" data-act="imprimirDoc">${ic('file')}Imprimir ou salvar PDF</button><button class="btn ghost" data-act="baixarDoc">${ic('down')}Baixar</button>${cli?.telefone?`<a class="btn ghost" href="${waLink(cli.telefone,`Oi, ${primeiro(cli.nome)}! Segue ${UI.ctTipo==='servico'?'o contrato do seu atendimento':UI.ctTipo==='anamnese'?'sua ficha de anamnese':'a política do ateliê'} para leitura. Se estiver de acordo, responda "Li e aceito".`)}" target="_blank" rel="noopener">${ic('chat')}Avisar no WhatsApp</a>`:''}</div></section>
  <div id="docBox">${doc}</div>`;
}
function ctAceites(){
  const L=arr('aceites').filter(a=>(UI.acFiltro==='todos'||a.tipo===UI.acFiltro)&&(a.tipo!=='anamnese'||pode('anamnese'))).sort((a,b)=>a.aceitoEm<b.aceitoEm?1:-1);
  const nomes={servico:'Contrato de serviço',anamnese:'Anamnese e consentimento',politica:'Política do ateliê'};
  return `<div class="chips">${[['todos','Todos'],...ctTipos()].map(([k,n])=>`<button class="chip" data-act="acFiltro" data-t="${k}" aria-pressed="${UI.acFiltro===k}">${n}</button>`).join('')}</div>
  <section class="card" style="padding:8px 14px">${L.length?`<div class="list">${L.map(a=>`<button class="item" data-act="verAceite" data-id="${a.id}"><div class="avatar" style="--lv:var(--lv-perola)">${ic(a.meio==='Assinatura no aparelho'?'pen':a.meio==='Aceite por WhatsApp'?'chat':'file')}</div><div class="grow"><div class="t">${esc(a.nomeAssinante||nomeCli(a.clienteId))}</div><div class="s">${nomes[a.tipo]||a.tipo} · ${esc(a.meio)} · ${dataBR(a.aceitoEm.slice(0,10))} ${a.aceitoEm.slice(11,16)} · política v${a.versao||'—'}</div></div><span class="badge good">aceito</span></button>`).join('')}</div>`:'<div class="empty">Nenhum aceite registrado ainda.</div>'}</section>
  <p class="small muted">Cada aceite guarda uma cópia exata do texto aceito, a versão da política, a data, o meio e um código de verificação. Se a política mudar, os aceites antigos continuam valendo com o texto da época.</p>`;
}
function ctPolitica(){
  const P=pol();const ed=pode('politicaEdit');const grupos=[...new Set(POL_CAMPOS.map(f=>f.g))];
  if(!ed)return `<div class="alert info">${ic('lock')}<div>Só a proprietária altera a política. Abaixo está a versão em vigor.</div></div>${docPolitica()}`;
  return `<form class="stack" id="fPol">${grupos.map(g=>`<section class="card form"><h3>${g}</h3>${POL_CAMPOS.filter(f=>f.g===g).map(f=>{const v=P.campos[f.k];const id='pol_'+f.k;
    const inp=f.t==='num'?`<input id="${id}" type="number" min="0" value="${esc(v)}">`:f.t==='sel'?`<select id="${id}">${f.o.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select>`:f.t==='area'?`<textarea id="${id}" placeholder="Ex.: regras de pagamento de pacotes, uso do espaço, outras condições">${esc(v)}</textarea>`:`<input id="${id}" value="${esc(v)}">`;
    return `<div class="stack" style="gap:6px"><label class="fld" for="${id}">${f.r}${f.suf?` <span style="font-weight:400">(${f.suf})</span>`:''}${inp}</label>${f.t!=='area'?`<label class="check small"><input type="checkbox" id="rev_${f.k}" ${P.rev[f.k]?'checked':''}>Revisado e aprovado</label>`:''}</div>`}).join('')}</section>`).join('')}
   <div class="form-actions" style="position:sticky;bottom:calc(84px + env(safe-area-inset-bottom,0px))"><button class="btn primary" type="submit">${ic('check')}Salvar nova versão da política</button></div></form>
   <p class="small muted">Salvar cria a versão ${P.versao+1}. Documentos aceitos antes continuam guardados com o texto da versão anterior.</p>`;
}

/* ================= PACOTES E VALES ================= */
function vPacotes(){
  return head('Vendas','Pacotes e <em>vales-presente</em>','',`<button class="btn primary" data-act="${UI.pkTab==='vales'?'novoVale':'novoPacote'}">${ic('plus')}${UI.pkTab==='vales'?'Vale-presente':'Pacote'}</button>`)+
  seg('pkTab',UI.pkTab,[['pacotes','Pacotes'],['vales','Vales-presente']])+(UI.pkTab==='vales'?pkVales():pkPacotes());
}
function pkPacotes(){
  const L=arr('pacotes').sort((a,b)=>(pacoteAtivo(b)?1:0)-(pacoteAtivo(a)?1:0)||(a.criadoEm<b.criadoEm?1:-1));
  return `<section class="card" style="padding:8px 14px">${L.length?`<div class="list">${L.map(p=>{const u=pacoteUso(p);const at=pacoteAtivo(p);const venc=p.validade&&p.validade<today();
   return `<button class="item" data-act="editPacote" data-id="${p.id}"><div class="avatar" style="--lv:var(--lv-ouro)">${ic('ticket')}</div><div class="grow"><div class="t">${esc(nomeCli(p.clienteId))} · ${esc(p.nome)}</div><div class="s">${u.usadas} de ${p.sessoes} usadas${u.reservadas?` · ${u.reservadas} agendada(s)`:''}${p.validade?` · válido até ${dataBR(p.validade)}`:''} · ${BRL(p.valor)}</div><div class="bar thin" style="margin-top:6px;max-width:260px"><span style="width:${u.usadas/(p.sessoes||1)*100}%"></span></div></div><span class="badge ${at?'good':venc?'bad':''}">${at?'ativo':venc?'vencido':'encerrado'}</span></button>`}).join('')}</div>`:'<div class="empty">Nenhum pacote vendido. Exemplos: "Box braids + 2 manutenções" ou "4 sessões de nagô infantil".</div>'}</section>
  <div class="alert info">${ic('info')}<div>Ao agendar, escolha "Usar pacote": a sessão sai sem cobrança e o saldo baixa ao concluir. A receita entra no dia da venda do pacote.</div></div>`;
}
function pkVales(){
  const L=arr('vales').sort((a,b)=>a.criadoEm<b.criadoEm?1:-1);
  return `<section class="card" style="padding:8px 14px">${L.length?`<div class="list">${L.map(v=>{const s=valeSaldo(v);const at=valeAtivo(v);
   return `<button class="item" data-act="editVale" data-id="${v.id}"><div class="avatar" style="--lv:var(--gold)">${ic('gift')}</div><div class="grow"><div class="t"><span class="code">${esc(v.codigo)}</span> · para ${esc(v.presenteada||'—')}</div><div class="s">De ${esc(v.compradora||'—')} · ${BRL(v.valor)} · saldo ${BRL(s)}${v.validade?` · até ${dataBR(v.validade)}`:''}</div></div><span class="badge ${at?'good':s<=0?'':'bad'}">${at?'ativo':s<=0?'usado':(v.pagamentos||[]).length?'vencido':'não pago'}</span></button>`}).join('')}</div>`:'<div class="empty">Nenhum vale-presente vendido. Ótimo para Dia das Mães, Natal e aniversários.</div>'}</section>
  <div class="alert info">${ic('info')}<div>Na conclusão do atendimento, informe o código do vale para abater o valor. A receita entra no dia da venda do vale, sem contar duas vezes.</div></div>`;
}

/* ================= ESTOQUE ================= */
function vEstoque(){
  const L=arr('estoque').sort((a,b)=>(baixo(b)?1:0)-(baixo(a)?1:0)||a.nome.localeCompare(b.nome));const own=pode('custos');
  const grp={};L.forEach(i=>(grp[i.categoria||'Outros']=grp[i.categoria||'Outros']||[]).push(i));
  const valor=L.reduce((s,i)=>s+(+i.qtd||0)*(+i.custo||0),0);const nb=L.filter(baixo).length;
  return head('Estoque','Materiais e <em>estoque</em>',`${L.length} itens · ${nb} abaixo do mínimo${own?` · ${BRL(valor)} em estoque`:''}`,`<button class="btn primary" data-act="novoItem">${ic('plus')}Item</button>`)+
  (L.length?Object.entries(grp).map(([g,its])=>`<section class="card" style="padding:8px 14px"><div class="eyebrow" style="padding:10px 4px 2px">${esc(g)}</div><div class="list">${its.map(i=>`<div class="item"><div class="grow"><div class="t">${esc(i.nome)}</div><div class="s">mínimo ${i.minimo} ${esc(i.unidade)}${own&&+i.custo?` · ${BRL(i.custo)}/${esc(i.unidade)}`:''}${i.mov?.[0]?` · último: ${i.mov[0].qtd>0?'+':''}${i.mov[0].qtd} (${esc(i.mov[0].motivo)})`:''}</div></div><b class="num ${baixo(i)?'low':''}">${i.qtd} ${esc(i.unidade)}</b><button class="btn sm soft" data-act="movItem" data-id="${i.id}">Entrada/saída</button><button class="icon-btn" data-act="editItem" data-id="${i.id}" aria-label="Editar item">${ic('edit')}</button></div>`).join('')}</div></section>`).join(''):`<section class="card empty">Cadastre jumbos por cor e número, pomadas, linhas e miçangas.</section>`)+
  `<div class="alert info">${ic('info')}<div>Ao concluir um atendimento, o sistema baixa os materiais do serviço (configurado em Finanças › Serviços). ${own?'Em "Entrada/saída", registrar uma compra também lança a despesa.':''}</div></div>`;
}

/* ================= CALENDÁRIO ================= */
function vCalendario(){
  const m=UI.calMes;const [y,mo]=m.split('-').map(Number);const first=new Date(y,mo-1,1);const ini=addDays(ymd(first),-first.getDay());const fimMes=ymd(new Date(y,mo,0));
  const coms=datasEntre(ini,addDays(ini,41));const anivs=aniversariosEntre(ini,addDays(ini,41));const ideias=arr('ideias');const ag=arr('agenda').filter(a=>a.status!=='cancelado');const t=today();
  const cells=[...Array(42)].map((_,i)=>{const d=addDays(ini,i);const dd=parse(d);
    const hc=coms.some(x=>x.data===d&&x.tipo==='com'),hf=coms.some(x=>x.data===d&&x.tipo==='fiscal'),ha=anivs.some(x=>x.data===d),hi=ideias.some(x=>x.data===d),hg=ag.some(x=>x.data===d);
    return `<button class="cell ${ym(d)!==m?'out':''} ${d===t?'today':''} ${hc?'has-com':''}" data-act="calDia" data-d="${d}" aria-pressed="${d===UI.calDia}" aria-label="${dataLonga(d)}"><span>${dd.getDate()}</span><span class="dots">${hc?'<i style="background:var(--accent-ink)"></i>':''}${ha?'<i style="background:var(--gold)"></i>':''}${hg?'<i style="background:var(--good)"></i>':''}${hf?'<i style="background:var(--muted)"></i>':''}${hi?'<i style="background:var(--lv-perola)"></i>':''}</span></button>`}).join('');
  const d=UI.calDia;const pb=pub();
  const evD=[...datasEntre(d,d).map(x=>`<div class="event"><span class="when">${x.tipo==='fiscal'?'Fiscal':'Data comemorativa'}</span><b>${esc(x.nome)}</b><p>${esc(x.ideia)}</p></div>`),
    ...aniversariosEntre(d,d).map(x=>`<div class="event"><span class="when" style="color:var(--gold)">Aniversário</span><b>${esc(x.cli.nome)}</b><p>Mande parabéns e o presente de ${pb.descAniv}% de desconto.</p></div>`),
    ...ag.filter(a=>a.data===d).map(a=>`<div class="event"><span class="when" style="color:var(--good)">Atendimento ${esc(a.hora)}</span><b>${esc(nomeCli(a.clienteId))}</b><p>${esc(nomeAg(a))}</p></div>`),
    ...ideias.filter(i=>i.data===d).map(ideiaCard)];
  const doMes=datasEntre(m+'-01',fimMes).filter(x=>x.tipo==='com');const minhas=ideias.filter(i=>!i.data||ym(i.data)===m).sort((a,b)=>(a.feito?1:0)-(b.feito?1:0));
  const prox=datasEntre(addDays(fimMes,1),addDays(fimMes,45)).filter(x=>x.tipo==='com').slice(0,2);
  return head('Calendário especial',`${cap(MESES[mo-1])} <em>${y}</em>`,'Datas comemorativas, aniversários e suas ideias.',`<button class="icon-btn" data-act="calMes" data-n="-1" aria-label="Mês anterior">${ic('left')}</button><button class="btn sm soft" data-act="calHoje">Hoje</button><button class="icon-btn" data-act="calMes" data-n="1" aria-label="Próximo mês">${ic('right')}</button><button class="btn primary" data-act="novaIdeia">${ic('plus')}Ideia</button>`)+
  `<div class="grid g2"><section class="card"><div class="cal">${SEM.map(s=>`<div class="h">${s}</div>`).join('')}${cells}</div>
   <div class="legend" style="margin-top:12px"><span><i class="dot" style="background:var(--accent-ink)"></i>Comemorativa</span><span><i class="dot" style="background:var(--gold)"></i>Aniversário</span><span><i class="dot" style="background:var(--good)"></i>Atendimento</span>${pode('fin')?'<span><i class="dot" style="background:var(--muted)"></i>Fiscal</span>':''}<span><i class="dot" style="background:var(--lv-perola)"></i>Sua ideia</span></div></section>
  <section class="stack"><div class="card"><h3>${esc(dataLonga(d))}<button class="btn sm soft" data-act="novaIdeia" data-d="${d}">${ic('plus')}Ideia</button></h3><div class="stack" style="gap:8px">${evD.join('')||'<div class="empty">Nada neste dia.</div>'}</div></div></section></div>
  <div class="grid g2"><section class="card"><h3>Oportunidades do mês</h3><div class="stack" style="gap:8px">${doMes.map(x=>`<div class="event"><span class="when">${dataCurta(x.data)}</span><b>${esc(x.nome)}</b><p>${esc(x.ideia)}</p><div class="row"><button class="btn sm ghost" data-act="usarIdeia" data-d="${x.data}" data-n="${esc(x.nome)}" data-i="${esc(x.ideia)}">${ic('plus')}Salvar como ideia</button></div></div>`).join('')||'<div class="empty">Sem datas comemorativas neste mês.</div>'}
   ${prox.length?`<div class="small muted">Prepare-se também para: ${prox.map(x=>`<b>${esc(x.nome)}</b> (${dataCurta(x.data)})`).join(', ')}.</div>`:''}</div></section>
  <section class="card"><h3>Minhas ideias <small>${minhas.filter(i=>!i.feito).length} em aberto</small></h3><div class="stack" style="gap:8px">${minhas.map(ideiaCard).join('')||'<div class="empty">Anote ideias de promoções, posts e parcerias.</div>'}</div></section></div>`;
}
function ideiaCard(i){return `<div class="event" style="${i.feito?'opacity:.6':''}"><span class="when" style="color:var(--fg)">${i.data?dataCurta(i.data):'Sem data'} · ${esc(i.tipo||'Ideia')}</span><b style="${i.feito?'text-decoration:line-through':''}">${esc(i.titulo)}</b>${i.notas?`<p>${esc(i.notas)}</p>`:''}<div class="row"><button class="btn sm soft" data-act="ideiaFeita" data-id="${i.id}">${ic('check')}${i.feito?'Reabrir':'Feito'}</button><button class="btn sm ghost" data-act="editIdeia" data-id="${i.id}">${ic('edit')}Editar</button></div></div>`}

/* ================= AJUSTES ================= */
function contaCard(){return `<section class="card"><h3>Sua conta</h3><p style="margin:0">${esc(EMAIL)} · <b>${esc(PAPEIS[ROLE]||'')}</b></p><div class="row" style="margin-top:10px"><button class="btn soft" data-act="trocarSenha">${ic('lock')}Trocar senha</button><button class="btn ghost" data-act="sair">Sair</button></div><div class="row" style="margin-top:12px"><span class="small muted">Aparência</span>${seg('temaSet',temaAtual(),[['sistema','Automática'],['claro','Clara'],['escuro','Escura']])}</div></section>`}
function vAjustes(){
  const own=isOwner();
  if(!own)return head('Ajustes','Sua <em>conta</em>')+contaCard()+cardAvisos()+`<section class="card"><h3>O que você acessa</h3><p class="small muted" style="margin:0">${ROLE==='parceira'?'Agenda, clientes, fichas de anamnese, estoque, pacotes, contratos e datas. Finanças e a política da empresa ficam só com a proprietária.':ROLE==='recepcao'?'Agenda, cadastro de clientes, pacotes, contratos de serviço e datas. Fichas de saúde, estoque e finanças ficam restritos.':'Finanças, contas, relatórios e obrigações do MEI, somente leitura. Clientes e fichas de saúde não ficam visíveis.'}</p></section>`+
   (pode('contratos')?`<section class="card"><h3>Política do ateliê</h3><button class="btn soft" data-act="ctTab" data-t="politica">${ic('file')}Abrir política</button></section>`:'');
  const tabs=[['horarios','Horários'],['negocio','Negócio e MEI'],['equipe','Equipe e acesso'],['dados','Conta e dados']];
  if(!tabs.some(t=>t[0]===UI.ajTab))UI.ajTab='horarios';
  return head('Ajustes','Seu <em>negócio</em>')+`<div class="tabs-scroll">${seg('ajTab',UI.ajTab,tabs)}</div>`+({horarios:ajHorarios,negocio:ajNegocio,equipe:ajEquipe,dados:ajDados}[UI.ajTab])();
}
function ajHorarios(){const sm=semana();const ord=[1,2,3,4,5,6,0];
  return `<form class="card form" id="fHor"><h3>Horário de cada dia <small>marque os dias em que você atende</small></h3>
   <div class="hr-tab">${ord.map(i=>{const x=sm[i];return `<div class="hr-row ${x.on?'':'off'}" data-d="${i}">
     <button type="button" class="chip hr-dia" data-hdia="${i}" aria-pressed="${x.on}">${cap(SEMX[i])}</button>
     <label class="fld">Abre<input type="time" data-k="ini" value="${esc(x.ini)}"></label><label class="fld">Fecha<input type="time" data-k="fim" value="${esc(x.fim)}"></label>
     <label class="fld">Pausa de<input type="time" data-k="pIni" value="${esc(x.pIni)}"></label><label class="fld">até<input type="time" data-k="pFim" value="${esc(x.pFim)}"></label>
     <span class="hr-fechado">Sem atendimento</span></div>`}).join('')}</div>
   <div class="form-actions" style="justify-content:space-between"><button type="button" class="btn ghost" data-act="horCopiar">${ic('copy')}Copiar segunda para os dias marcados</button><button class="btn primary">${ic('check')}Salvar horários</button></div></form>
  ${excecoesCard()}`}
function ajNegocio(){const pb=pub(),c=priv();
  return `<form class="card form" id="fCfg"><h3>Dados do negócio</h3>
   <div class="f2"><label class="fld">Nome empresarial<input id="gNome" value="${esc(pb.nome)}"></label><label class="fld">Responsável<input id="gResp" value="${esc(pb.responsavel)}"></label><label class="fld">CNPJ<input id="gCnpj" inputmode="numeric" value="${esc(pb.cnpj)}" placeholder="00.000.000/0001-00"></label></div>
   <div class="f2"><label class="fld">Endereço do ateliê<input id="gEnd" value="${esc(pb.endereco)}"></label><label class="fld">Município<input id="gMun" value="${esc(pb.municipio)}"></label></div>
   <div class="f2"><label class="fld">WhatsApp do ateliê<input id="gWa" inputmode="tel" value="${esc(pb.whatsapp)}" placeholder="(27) 99999-9999"></label><label class="fld">Instagram do ateliê<input id="gIg" placeholder="@stefanytrancista" value="${esc(pb.instagram)}"></label><label class="fld">Desconto de aniversário (%)<input id="gAniv" type="number" min="0" max="50" value="${pb.descAniv}"></label></div>
   <h3 style="margin-top:8px">Programa de indicação <small>aparece no espaço da cliente e no catálogo</small></h3>
   <div class="f2"><label class="fld">Quem indica ganha<input id="gIndB" value="${esc(pb.indBenef||'')}" placeholder="${esc(IND_PADRAO[0])}"></label><label class="fld">Quem foi indicada ganha<input id="gIndN" value="${esc(pb.indBenefNova||'')}" placeholder="${esc(IND_PADRAO[1])}"></label></div>
   <h3 style="margin-top:8px">Finanças e MEI <small>visível só para proprietárias e contabilidade</small></h3>
   <div class="f2"><label class="fld">Abertura do MEI<input id="gIni" type="month" value="${esc(c.inicioMei)}"></label><label class="fld">Limite anual (R$)<input id="gLim" type="number" step="0.01" value="${c.limite}"></label><label class="fld">Valor do DAS (R$)<input id="gDas" type="number" step="0.01" value="${c.das}"></label><label class="fld">Meta mensal (R$)<input id="gMeta" type="number" step="50" value="${c.meta}"></label></div>
   <div class="f2"><label class="fld">Taxa débito (%)<input id="gTd" type="number" step="0.01" value="${c.taxaDebito}"></label><label class="fld">Taxa crédito à vista (%)<input id="gTc" type="number" step="0.01" value="${c.taxaCredito}"></label><label class="fld">Taxa crédito parcelado (%)<input id="gTp" type="number" step="0.01" value="${c.taxaParcelado}"></label></div>
   <div class="form-actions"><button class="btn primary">${ic('check')}Salvar</button></div></form>`}
function ajEquipe(){const ped=arr('pedidos'),eq=arr('equipe');const donas=(ACESSO&&ACESSO.donas)||[];const dinfo=(ACESSO&&ACESSO.donasInfo)||{};
  return `<section class="card"><h3>Proprietárias <small>${donas.length} com acesso total</small></h3><div class="list">${donas.map(u=>{const i=dinfo[u]||{};return `<div class="item"><div class="avatar" style="--lv:var(--lv-perola)">${ic('shield')}</div><div class="grow"><div class="t">${esc(i.nome||i.email||'Proprietária')}${u===ME?' <span class="badge">você</span>':''}</div><div class="s">${esc(i.email||'e-mail aparece no próximo acesso dela')}</div></div>${u!==ME&&donas.length>1?`<button class="btn sm ghost danger" data-act="removerDona" data-id="${u}">Remover</button>`:''}</div>`}).join('')}</div><p class="small muted" style="margin-bottom:0">Para dar acesso total a alguém da equipe, use "Tornar proprietária" na lista abaixo.</p></section>
  <section class="card"><h3>Equipe e acessos <small>${eq.filter(e=>e.ativo!==false).length} ativa(s)</small></h3>
   <ol class="small muted" style="margin-top:0;padding-left:18px"><li>No <a href="https://console.firebase.google.com" target="_blank" rel="noopener">console do Firebase</a>, abra <b>Authentication › Usuários › Adicionar usuário</b> e crie o e-mail da pessoa com uma senha provisória.</li><li>Ela entra no sistema com esse e-mail e aparece aqui como pedido.</li><li>Você escolhe o perfil. As regras do servidor só liberam os dados daquele perfil.</li></ol>
   ${ped.length?`<div class="eyebrow" style="margin:10px 0 4px">Pedidos de acesso</div><div class="list">${ped.map(p=>`<div class="item wrap"><div class="avatar">${iniciais(p.nome||p.email)}</div><div class="grow"><div class="t">${esc(p.nome||p.email)}</div><div class="s">${esc(p.email)} · pediu em ${dataBR((p.pedidoEm||'').slice(0,10))}</div></div><div class="item-acoes"><button class="btn sm primary" data-act="aprovar" data-id="${p.id}">Definir perfil</button><button class="btn sm ghost" data-act="tornarDona" data-id="${p.id}">Tornar proprietária</button><button class="btn sm ghost danger" data-act="recusar" data-id="${p.id}">Recusar</button></div></div>`).join('')}</div>`:''}
   ${eq.length?`<div class="eyebrow" style="margin:10px 0 4px">Equipe</div><div class="list">${eq.map(e=>`<div class="item wrap"><div class="avatar">${iniciais(e.apelido||e.email)}</div><div class="grow"><div class="t">${esc(e.apelido||e.email)}</div><div class="s">${PAPEIS[e.papel]||e.papel}${e.ativo===false?' · desativada':''} · ${esc(e.email||'')}</div></div><div class="item-acoes"><button class="btn sm soft" data-act="aprovar" data-id="${e.id}">Alterar</button><button class="btn sm ghost" data-act="tornarDona" data-id="${e.id}">${ic('shield')}Tornar proprietária</button></div></div>`).join('')}</div>`:''}
   ${!ped.length&&!eq.length?'<div class="empty">Ninguém da equipe ainda.</div>':''}
   <details class="how" style="margin-top:10px"><summary>O que cada perfil acessa</summary><table>
    <tr><td><b>Proprietária</b></td><td>Tudo, incluindo finanças, contas, relatórios, política da empresa e equipe.</td></tr>
    <tr><td><b>Trancista parceira</b></td><td>Agenda, clientes, fichas de anamnese, estoque (sem custos), pacotes, vales, contratos e datas.</td></tr>
    <tr><td><b>Recepção</b></td><td>Agenda, cadastro de clientes, pacotes, vales, contrato de serviço e datas. Sem fichas de saúde e sem estoque.</td></tr>
    <tr><td><b>Contador(a)</b></td><td>Finanças, contas, relatórios e MEI, somente leitura. Sem clientes nem fichas.</td></tr></table>
    <p>Todas essas separações são aplicadas pelas regras de segurança do Firestore, no servidor. Para bloquear alguém de vez, desative o acesso aqui e também desative o usuário em Authentication no console.</p></details></section>`}
function ajDados(){const nEx=ALL_COLS.reduce((s,k)=>s+arr(k).filter(r=>r.exemplo).length,0);
  return contaCard()+cardAvisos()+`<section class="card"><h3>Cópia de segurança</h3><p class="small muted" style="margin-top:0">Os dados ficam no Firestore e aparecem no PC e no celular. Além disso, o GitHub faz uma cópia automática todo dia de madrugada (guardada 30 dias; a de domingo, 90 dias), que pode ser restaurada pela rotina <b>Restaurar cópia de segurança</b> (veja o LEIA-ME). Se quiser uma cópia sua, baixe aqui.</p>
   <div class="row"><button class="btn soft" data-act="backup">${ic('down')}Baixar cópia (JSON)</button><label class="btn ghost">${ic('up')}Restaurar cópia<input type="file" id="restFile" accept=".json,application/json" hidden></label></div></section>
  ${nEx?`<section class="card"><h3>Dados de exemplo</h3><p class="small muted" style="margin-top:0">Há ${nEx} registros de exemplo. Apague antes de começar a usar de verdade. Os serviços cadastrados são mantidos.</p><button class="btn danger soft" data-act="limparEx">${ic('trash')}Apagar dados de exemplo</button></section>`:''}`+cardErros()}

/* ================= folhas (sheets), avisos e arquivos ================= */
function sheet(title,html){
  closeSheet(true);
  $('#sheetRoot').innerHTML=`<div class="sheet-back" data-act="closeBack"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2>${title}</h2><button class="icon-btn" data-act="close" aria-label="Fechar">${ic('x')}</button></div>${html}</div></div>`;
  document.body.style.overflow='hidden';afterRender();
}
function closeSheet(now){const b=$('.sheet-back');if(!b)return;document.body.style.overflow='';
  if(now){$('#sheetRoot').innerHTML='';return}
  b.classList.add('closing');$('.sheet',b).classList.add('closing');setTimeout(()=>{if(b.isConnected)b.remove()},240)}
function toast(m,tipo){const erro=tipo==='erro'||/^N[ãa]o |permiss|Limite di/.test(m);const t=document.createElement('div');t.className='toast'+(erro?' erro':'');t.innerHTML=ic(erro?'alert':'check');const sp=document.createElement('span');sp.textContent=m;t.appendChild(sp);$('#toastRoot').appendChild(t);setTimeout(()=>t.remove(),erro?4200:2900)}
function confirmar(msg,ok){sheet('Confirmar',`<p>${msg}</p><div class="form-actions"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn primary" id="okBtn">Confirmar</button></div>`);$('#okBtn').onclick=async()=>{$('#okBtn').disabled=true;await ok();closeSheet()}}
async function baixar(nome,conteudo){try{return salvarArquivo(nome,conteudo)}catch(e){toast('Não foi possível baixar');return false}}
async function copiar(txt,ok='Copiado'){try{await navigator.clipboard.writeText(txt);toast(ok)}catch(e){toast('Não foi possível copiar')}}
const csv=rows=>'﻿'+rows.map(r=>r.map(v=>{const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}).join(';')).join('\n');
const optCli=(sel,extra='')=>`<option value="">Selecione…</option>${extra}${arr('clientes').sort((a,b)=>a.nome.localeCompare(b.nome)).map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.nome)}</option>`).join('')}`;
const optServ=(sel,{preco=true,vazio='Selecione…'}={})=>`<option value="">${vazio}</option>${arr('servicos').sort((a,b)=>a.nome.localeCompare(b.nome)).map(s=>`<option value="${s.id}" ${s.id===sel?'selected':''}>${esc(s.nome)}${preco?` · ${BRL(s.preco)}`:''}</option>`).join('')}`;
const optFormas=sel=>FORMAS.map(f=>`<option ${f===sel?'selected':''}>${f}</option>`).join('');
const parcelasSel=(id,max)=>`<label class="fld" id="${id}Box" hidden>Parcelas<select id="${id}">${[...Array(Math.max(1,+max||1))].map((_,i)=>`<option value="${i+1}">${i+1}x</option>`).join('')}</select></label>`;
function ligaParcelas(forma,id){const f=$('#'+forma),b=$('#'+id+'Box');if(!f||!b)return;const up=()=>{b.hidden=f.value!=='Cartão de crédito'};f.addEventListener('change',up);up()}

/* ---------- menu Mais ---------- */
function mais(){const vs=visiveis().filter(v=>!['inicio','agenda','clientes'].includes(v[0]));
  sheet('Mais',`<div class="mais">${vs.map(([k,n,i])=>`<button data-act="go" data-v="${k}">${ic(i)}${n}</button>`).join('')}</div>`)}

/* ---------- clientes ---------- */
function abrirCliente(id){
  const c=S.clientes.get(id);if(!c)return;const f=fidelidade(c);const nv=NIVEIS[f.nivel];
  const hist=arr('agenda').filter(a=>a.clienteId===id).sort((a,b)=>a.data<b.data?1:-1);const ind=c.indicadaPor?S.clientes.get(c.indicadaPor):null;
  const barras=[['Frequência',f.p.freq,35],['Valor',f.p.valor,30],['Recência',f.p.rec,20],['Indicações',f.p.ind,15]];
  const l=waLink(c.telefone,`Oi, ${primeiro(c.nome)}! `);const an=anamDe(id);const al=anamAlertas(an);
  const pks=arr('pacotes').filter(p=>p.clienteId===id&&pacoteAtivo(p));const acs=arr('aceites').filter(a=>a.clienteId===id&&(a.tipo!=='anamnese'||pode('anamnese')));
  sheet(esc(c.nome),`<div class="stack">
   <div class="row"><div class="avatar" style="--lv:${nv.c};width:56px;height:56px;font-size:1.1rem">${iniciais(c.nome)}</div><div class="grow"><span class="badge lv" style="--lv:${nv.c}">${nv.n}</span> ${f.risco?'<span class="badge warn">em risco</span>':''}<div class="small muted" style="margin-top:4px">${f.score} pontos de 100</div></div></div>
   <div class="alert info">${ic('gift')}<div><b>Benefício do nível:</b> ${nv.b}</div></div>
   ${pode('anamnese')?`<div class="alert ${!an||anamVencida(an)?'warn':al.length?'bad':'info'}">${ic('shield')}<div><b>Anamnese:</b> ${!an?'não preenchida.':anamVencida(an)?'vencida (mais de 12 meses).':al.length?`atenção – ${esc(al.map(x=>x.q.replace(/\?$/,'')+(x.det?': '+x.det:'')).join('; '))}.`:`sem restrições · ${dataBR(an.atualizadaEm.slice(0,10))}.`} <button class="btn sm ghost" data-act="anamnese" data-id="${id}">${an?'Atualizar':'Preencher'} ficha</button></div></div>`:''}
   <div class="stack" style="gap:8px">${barras.map(([n,v,m])=>`<div><div class="row between small"><span>${n}</span><span class="num muted">${v}/${m}</span></div><div class="bar thin"><span style="width:${v/m*100}%"></span></div></div>`).join('')}${f.p.pen?`<div class="small" style="color:var(--bad)">Faltas: −${f.p.pen} pontos</div>`:''}</div>
   ${pode('fin')?`<div class="kpis"><div class="kpi"><div class="l">Total gasto</div><div class="v">${BRL(f.total)}</div></div><div class="kpi"><div class="l">Ticket médio</div><div class="v">${BRL(f.ticket)}</div></div></div>`:''}
   <div class="small">${c.telefone?`<div><b>Telefone:</b> ${esc(c.telefone)}</div>`:''}${c.cpf?`<div><b>CPF:</b> ${esc(c.cpf)}</div>`:''}${c.instagram?`<div><b>Instagram:</b> ${esc(c.instagram)}</div>`:''}${c.aniversario?`<div><b>Aniversário:</b> ${dataCurta(c.aniversario)}</div>`:''}${c.cabelo?`<div><b>Cabelo:</b> ${esc(c.cabelo)}</div>`:''}${c.origem?`<div><b>Como conheceu:</b> ${esc(c.origem)}</div>`:''}${ind?`<div><b>Indicada por:</b> ${esc(ind.nome)}</div>`:''}${f.ind?`<div><b>Indicou:</b> ${f.ind} cliente${f.ind>1?'s':''}</div>`:''}${c.obs?`<div><b>Notas:</b> ${esc(c.obs)}</div>`:''}</div>
   ${pks.length?`<div class="small"><b>Pacotes ativos:</b> ${pks.map(p=>`${esc(p.nome)} (${pacoteSaldo(p)} sessão(ões) disponível(is))`).join(', ')}</div>`:''}
   ${acs.length?`<div class="small"><b>Documentos aceitos:</b> ${acs.map(a=>`${a.tipo==='servico'?'contrato':a.tipo} em ${dataBR(a.aceitoEm.slice(0,10))}`).join(', ')}</div>`:''}
   ${c.indicacaoCodigo||(indPorCli().get(id)||0)?`<div class="small"><b>Indicação:</b> código <b>${esc(c.indicacaoCodigo||'— (criado ao ativar o espaço)')}</b> · indicou ${indPorCli().get(id)||0} cliente(s)</div>`:''}
   ${pode('portal')?portalBloco(c):''}
   <div class="row"><button class="btn primary" data-act="novoAg" data-c="${id}">${ic('cal')}Agendar</button>${l?`<a class="btn soft" href="${l}" target="_blank" rel="noopener">${ic('chat')}WhatsApp</a>`:''}${pode('base')?`<button class="btn soft" data-act="cadLink" data-c="${id}">${ic('send')}Atualizar cadastro</button>`:''}<button class="btn soft" data-act="linkContrato" data-c="${id}">${ic('file')}Enviar contrato</button><button class="btn ghost" data-act="editCli" data-id="${id}">${ic('edit')}Editar</button></div>
   <div><div class="eyebrow" style="margin-bottom:6px">Histórico</div>${histAte()&&c.criadoEm&&c.criadoEm<histAte()?`<div class="small muted" style="margin-bottom:6px">Mostrando desde ${dataBR(histAte())}. <button class="btn sm ghost" data-act="verHist" data-id="${id}">Ver anos anteriores</button></div>`:''}${hist.length?`<div class="list">${hist.map(a=>`<div class="item"><span class="time">${dataCurta(a.data)}</span><div class="grow"><div class="t">${esc(nomeAg(a))}</div><div class="s">${a.data.slice(0,4)} · ${a.pacoteId?'pacote':BRL(a.valor)}</div></div><span class="badge">${STATUS[a.status]?.n||''}</span></div>`).join('')}</div>`:'<div class="empty">Sem atendimentos ainda.</div>'}</div></div>`);
}
function formCliente(id){
  const c=id?S.clientes.get(id):{};const outras=arr('clientes').filter(x=>x.id!==id).sort((a,b)=>a.nome.localeCompare(b.nome));
  sheet(id?'Editar cliente':'Nova cliente',`<form class="form" id="fCli">
   <label class="fld">Nome completo<input id="cNome" required value="${esc(c.nome)}" autocomplete="off"></label>
   <div class="f2"><label class="fld">WhatsApp<input id="cTel" inputmode="tel" placeholder="(27) 99999-9999" value="${esc(c.telefone)}"></label><label class="fld">CPF (para contratos)<input id="cCpf" inputmode="numeric" value="${esc(c.cpf)}"></label></div>
   <div class="f2"><label class="fld">Instagram<input id="cIg" placeholder="@usuario" value="${esc(c.instagram)}"></label><label class="fld">Data de nascimento<input id="cAniv" type="date" value="${esc(c.aniversario)}"></label></div>
   <div class="f2"><label class="fld">Como conheceu<select id="cOrig"><option value="">Selecione…</option>${ORIGENS.map(o=>`<option ${o===c.origem?'selected':''}>${o}</option>`).join('')}</select></label><label class="fld">Indicada por <small class="muted">(ou digite o código abaixo)</small><select id="cInd"><option value="">Ninguém</option>${outras.map(o=>`<option value="${o.id}" ${o.id===c.indicadaPor?'selected':''}>${esc(o.nome)}</option>`).join('')}</select></label></div>
   <div class="f2"><label class="fld">Código de indicação recebido<input id="cCod" placeholder="Ex.: ANA123" autocapitalize="characters" style="text-transform:uppercase"></label><label class="fld">Tipo e comprimento do cabelo<input id="cCab" placeholder="Ex.: crespo 4C, ombro" value="${esc(c.cabelo)}"></label></div>
   <label class="fld">Notas<textarea id="cObs">${esc(c.obs)}</textarea></label>
   ${pode('anamnese')?'<p class="small muted" style="margin:0">Alergias e condições de saúde vão na ficha de anamnese, que tem consentimento próprio.</p>':''}
   <div class="form-actions">${id&&isOwner()?`<button type="button" class="btn danger ghost" data-act="delCli" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary" type="submit">${ic('check')}Salvar</button></div></form>`);
  $('#cCod').oninput=e=>{const r=cliPorCodigo(e.target.value);if(r&&r.id!==id){$('#cInd').value=r.id;e.target.style.borderColor='var(--good)'}else e.target.style.borderColor=''};
  $('#fCli').onsubmit=async e=>{e.preventDefault();
    const d={...(c||{}),nome:$('#cNome').value.trim(),telefone:$('#cTel').value.trim(),cpf:$('#cCpf').value.trim(),instagram:$('#cIg').value.trim(),aniversario:$('#cAniv').value,origem:$('#cOrig').value,indicadaPor:$('#cInd').value,cabelo:$('#cCab').value.trim(),obs:$('#cObs').value.trim()};
    if(!d.nome)return;if(!id)d.criadoEm=today();const nid=await save('clientes',id,d);closeSheet();toast(id?'Cliente atualizada':'Cliente cadastrada');
    if(!id&&pode('anamnese'))setTimeout(()=>formAnamnese(nid),300)};
}

/* ---------- anamnese ---------- */
function formAnamnese(cid){
  const c=S.clientes.get(cid);if(!c)return;const an=anamDe(cid)||{};const r=an.respostas||{};const resp=an.responsavel||{};
  const menorPadrao=c.aniversario?diffDays(c.aniversario,today())<18*365.25:false;
  sheet('Ficha de anamnese',`<form class="form" id="fAn"><p class="muted small" style="margin:0">${esc(c.nome)}${an.atualizadaEm?` · última atualização ${dataBR(an.atualizadaEm.slice(0,10))}`:''}</p>
   <div>${ANAM_Q.map(([k,q])=>`<div class="qa"><span class="small">${esc(q)}</span><div class="seg" data-q="${k}"><button type="button" data-v="0" aria-pressed="${!r[k]?.sim}">Não</button><button type="button" data-v="1" aria-pressed="${!!r[k]?.sim}">Sim</button></div><input class="fld" id="det_${k}" placeholder="Detalhe (qual, quando)" value="${esc(r[k]?.det)}" ${r[k]?.sim?'':'hidden'} style="border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--surface)"></div>`).join('')}</div>
   <label class="fld">Observações da profissional<textarea id="anObs" placeholder="Ex.: couro sensível na nuca, evitar tensão">${esc(an.obs)}</textarea></label>
   <label class="check"><input type="checkbox" id="anMenor" ${an.menor??menorPadrao?'checked':''}>Cliente menor de 18 anos</label>
   <div class="f2" id="anResp" ${an.menor??menorPadrao?'':'hidden'}><label class="fld">Responsável legal<input id="rNome" value="${esc(resp.nome)}"></label><label class="fld">CPF do responsável<input id="rCpf" value="${esc(resp.cpf)}"></label><label class="fld">Parentesco<input id="rPar" value="${esc(resp.parentesco)}"></label></div>
   <label class="check"><input type="checkbox" id="anImg" ${an.imagem?'checked':''}>A cliente autoriza fotos e vídeos para divulgação</label>
   <div class="alert info">${ic('shield')}<div>Dados de saúde são sensíveis (LGPD, art. 11). Depois de salvar, colete o aceite do termo de consentimento.</div></div>
   <div class="form-actions"><button class="btn primary" type="submit">${ic('check')}Salvar e coletar aceite</button></div></form>`);
  $$('#fAn .seg').forEach(sg=>sg.onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',sg).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#det_'+sg.dataset.q).hidden=b.dataset.v!=='1'});
  $('#anMenor').onchange=e=>{$('#anResp').hidden=!e.target.checked};
  $('#fAn').onsubmit=async e=>{e.preventDefault();const respostas={};
    ANAM_Q.forEach(([k])=>{const sim=$(`#fAn .seg[data-q="${k}"] button[data-v="1"]`).getAttribute('aria-pressed')==='true';respostas[k]={sim,det:sim?$('#det_'+k).value.trim():''}});
    const hist=[...(an.historico||[])];if(an.atualizadaEm)hist.unshift({atualizadaEm:an.atualizadaEm,respostas:an.respostas,obs:an.obs});
    const d={clienteId:cid,respostas,obs:$('#anObs').value.trim(),menor:$('#anMenor').checked,responsavel:{nome:$('#rNome').value.trim(),cpf:$('#rCpf').value.trim(),parentesco:$('#rPar').value.trim()},imagem:$('#anImg').checked,atualizadaEm:nowIso(),historico:hist.slice(0,5),...(an.exemplo?{exemplo:true}:{})};
    await save('anamneses',cid,d);if(c.anamneseEm!==today())save('clientes',cid,{...c,anamneseEm:today()},{quiet:true});toast('Ficha salva');coletarAceite('anamnese',cid,'')};
}

/* ---------- aceites e assinatura ---------- */
function docHtml(tipo,cid,agid){const cli=S.clientes.get(cid);return tipo==='servico'?docServico(cli,S.agenda.get(agid)||null):tipo==='anamnese'?docAnamnese(cli,anamDe(cid)):docPolitica()}
function coletarAceite(tipo,cid,agid){
  const cli=S.clientes.get(cid);const an=anamDe(cid);const menor=tipo==='anamnese'&&an?.menor;
  const nomeAss=menor?(an.responsavel?.nome||''):(cli?.nome||'');
  sheet('Coletar aceite',`<div class="stack"><div style="max-height:34vh;overflow:auto;border-radius:16px">${docHtml(tipo,cid,agid)}</div>
   <form class="form" id="fAc"><div class="f2"><label class="fld">Nome de quem aceita<input id="acNome" required value="${esc(nomeAss)}"></label><label class="fld">CPF<input id="acCpf" value="${esc(menor?an.responsavel?.cpf:cli?.cpf)}"></label></div>
    <label class="fld">Como foi o aceite<select id="acMeio"><option>Assinatura no aparelho</option><option>Aceite por WhatsApp</option><option>Assinatura em papel (arquivada)</option></select></label>
    <div id="sigBox"><div class="row between small"><span class="muted">Assine com o dedo ou o mouse</span><button type="button" class="btn sm ghost" id="sigLimpar">Limpar</button></div><canvas class="sig" id="sigPad"></canvas></div>
    <label class="check"><input type="checkbox" id="acOk" required>Li e concordo com todos os termos acima</label>
    <div class="form-actions"><button class="btn primary" type="submit">${ic('check')}Registrar aceite</button></div></form></div>`);
  $('#acMeio').onchange=e=>{$('#sigBox').hidden=e.target.value!=='Assinatura no aparelho'};
  $('#sigLimpar').onclick=()=>sigClear($('#sigPad'));
  $('#fAc').onsubmit=async e=>{e.preventDefault();const meio=$('#acMeio').value;const pad=$('#sigPad');
    if(meio==='Assinatura no aparelho'&&!pad.dataset.ink){toast('Falta a assinatura');return}
    const tmp=document.createElement('div');tmp.innerHTML=docHtml(tipo,cid,agid);const texto=tmp.innerText.replace(/\n{3,}/g,'\n\n').trim();
    const P=pol();const d={tipo,clienteId:cid||'',agendaId:agid||'',versao:P.versao,texto,hash:await hashTexto(texto),nomeAssinante:$('#acNome').value.trim(),cpf:$('#acCpf').value.trim(),meio,aceitoEm:nowIso(),registradoPor:ME||'',assinatura:meio==='Assinatura no aparelho'?pad.toDataURL('image/png'):''};
    await save('aceites',null,d);closeSheet();toast('Aceite registrado')};
}
function sigInit(c){c.dataset.on='1';const r=c.getBoundingClientRect();const dpr=window.devicePixelRatio||1;c.width=Math.max(300,r.width)*dpr;c.height=170*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);x.lineWidth=2.2;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#3B2216';
  let on=false;const pos=e=>{const b=c.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top]};
  c.addEventListener('pointerdown',e=>{on=true;c.setPointerCapture(e.pointerId);const[a,b]=pos(e);x.beginPath();x.moveTo(a,b)});
  c.addEventListener('pointermove',e=>{if(!on)return;const[a,b]=pos(e);x.lineTo(a,b);x.stroke();c.dataset.ink='1'});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>c.addEventListener(t,()=>{on=false}))}
function sigClear(c){const x=c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);x.restore();delete c.dataset.ink}
function verAceite(id){const a=S.aceites.get(id);if(!a)return;
  sheet('Aceite registrado',`<div class="stack"><div class="small"><div><b>Assinante:</b> ${esc(a.nomeAssinante)}${a.cpf?` · CPF ${esc(a.cpf)}`:''}</div><div><b>Meio:</b> ${esc(a.meio)}</div><div><b>Data e hora:</b> ${new Date(a.aceitoEm).toLocaleString('pt-BR')}</div><div><b>Política:</b> versão ${a.versao||'—'} · <b>Código de verificação:</b> <span class="code">${esc(a.hash||'—')}</span></div><div><b>Registrado por:</b> ${esc(nomePessoa(a.registradoPor))}</div></div>
   ${a.assinatura?`<img src="${a.assinatura}" alt="Assinatura" style="background:#fff;border-radius:12px;border:1px solid var(--line);max-height:140px;object-fit:contain">`:''}
   <div class="out" style="max-height:40vh;overflow:auto">${esc(a.texto)}</div>
   <div class="row"><button class="btn soft" data-act="baixarAceite" data-id="${id}">${ic('down')}Baixar cópia</button><button class="btn ghost" data-act="copyAceite" data-id="${id}">${ic('copy')}Copiar texto</button></div></div>`)}
function htmlDocStandalone(title,body,extra=''){return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}h1{text-align:center;font-size:22px}h2{font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-top:22px}.sub{text-align:center;color:#666;font-size:12px}.rev{background:#fff3cd}.ass{display:flex;gap:40px;margin-top:50px}.ass div{flex:1;border-top:1px solid #222;padding-top:6px;text-align:center;font-size:12px}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #ddd;padding:6px 4px;vertical-align:top;font-size:14px}pre{white-space:pre-wrap;font-family:inherit}</style></head><body>${body}${extra}</body></html>`}

/* ---------- agenda ---------- */
const extraServRow=v=>`<div class="extra-serv"><label class="fld">Mais um serviço<select>${optServ(v,{vazio:'Escolha o serviço'})}</select></label><button type="button" class="icon-btn" data-rmx aria-label="Remover serviço">${ic('x')}</button></div>`;
function formAgenda(id,pre={}){
  const a=id?S.agenda.get(id):{data:pre.d||UI.agDia,hora:pre.h||'09:00',status:'agendado',clienteId:pre.c||'',servicoId:pre.s||'',obs:pre.obs||''};
  const P=pol();const sinalPago=soma((a.pagamentos||[]).filter(p=>p.tipo==='sinal'));
  sheet(id?'Editar atendimento':'Novo atendimento',`<form class="form" id="fAg">
   <label class="fld">Cliente<select id="aCli">${optCli(a.clienteId,'<option value="__nova">+ Nova cliente</option>')}</select></label>
   <div class="f2" id="novaBox" hidden><label class="fld">Nome da nova cliente<input id="aNovaNome"></label><label class="fld">WhatsApp<input id="aNovaTel" inputmode="tel"></label></div>
   <label class="fld">Serviço<select id="aServ">${optServ(a.servicoId)}</select></label>
   <div id="aExtras" class="stack" style="gap:8px">${(a.extras||[]).map(x=>extraServRow(x)).join('')}</div>
   <button type="button" class="btn sm ghost" id="aExtraAdd" style="align-self:flex-start">${ic('plus')}Adicionar outro serviço</button>${S.servicos.size?'':`<div class="alert warn">${ic('alert')}<div>Nenhum serviço cadastrado. ${pode('precos')?`<button type="button" class="btn sm ghost" data-act="servSug">Adicionar serviços sugeridos</button>`:'Peça à proprietária para cadastrar.'}</div></div>`}
   <label class="fld" id="pkBox" hidden>Pacote<select id="aPk"></select></label>
   <div class="f2"><label class="fld">Data<input id="aData" type="date" required value="${esc(a.data)}"></label><label class="fld">Hora<input id="aHora" type="time" required value="${esc(a.hora)}"></label><label class="fld">Duração${durCampo('aDur',a.duracao)}</label></div>
   <div class="f2" id="valBox"><label class="fld">Valor (R$)<input id="aVal" type="number" step="0.01" min="0" inputmode="decimal" value="${esc(a.valor??'')}"></label>
    ${sinalPago?`<div class="fld">Sinal<div class="small" style="padding:11px 0;color:var(--fg)">${BRL(sinalPago)} já recebido</div></div>`:`<label class="fld">Sinal recebido (R$)<input id="aSinal" type="number" step="0.01" min="0" inputmode="decimal" placeholder="sugestão ${P.campos.sinalPct}%"></label><label class="fld">Forma do sinal<select id="aSinalF">${optFormas('Pix')}</select></label>`}</div>
   ${id?`<label class="fld">Situação<select id="aSt">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${k===a.status?'selected':''}>${v.n}</option>`).join('')}</select></label>`:''}
   <label class="fld">Observações<textarea id="aObs" placeholder="Ex.: levar cabelo 1B, comprimento cintura">${esc(a.obs)}</textarea></label>
   <div id="aConf"></div>
   ${id&&a.atualizadoPor?`<p class="small muted" style="margin:0">Última alteração por ${esc(nomePessoa(a.atualizadoPor))} em ${new Date(a.atualizadoEm).toLocaleString('pt-BR')}.</p>`:''}
   <div class="form-actions">${id&&isOwner()?`<button type="button" class="btn danger ghost" data-act="delAg" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary" type="submit">${ic('check')}Salvar</button></div></form>`);
  const sel=$('#aCli'),srv=$('#aServ'),pk=$('#aPk');
  const upPk=()=>{const ps=arr('pacotes').filter(p=>p.clienteId===sel.value&&(pacoteAtivo(p)||p.id===a.pacoteId));
    pk.innerHTML=`<option value="">Não usar pacote</option>${ps.map(p=>`<option value="${p.id}" ${p.id===a.pacoteId?'selected':''}>${esc(p.nome)} · ${pacoteSaldo(p)+(p.id===a.pacoteId?1:0)} disponível(is)</option>`).join('')}`;
    $('#pkBox').hidden=!ps.length;$('#valBox').hidden=!!pk.value};
  sel.onchange=()=>{$('#novaBox').hidden=sel.value!=='__nova';upPk()};pk.onchange=()=>{$('#valBox').hidden=!!pk.value};upPk();
  const sinalSug=()=>{const s=$('#aSinal');if(s)s.placeholder=`sugestão ${BRL((+$('#aVal').value||0)*P.campos.sinalPct/100)}`};
  const lista=()=>[srv.value,...$$('#aExtras select').map(x=>x.value)].filter(Boolean).map(i=>S.servicos.get(i)).filter(Boolean);
  srv.onchange=()=>{const L=lista();if(L.length){$('#aVal').value=Math.round(L.reduce((t,s)=>t+(+s.preco||0),0)*100)/100;setDur('aDur',L.reduce((t,s)=>t+(+s.duracao||0),0))}sinalSug();checkConf()};
  $('#aExtraAdd').onclick=()=>{$('#aExtras').insertAdjacentHTML('beforeend',extraServRow(''));};
  $('#aExtras').onchange=e=>{if(e.target.matches('select'))srv.onchange()};
  $('#aExtras').onclick=e=>{const b=e.target.closest('[data-rmx]');if(b){b.closest('.extra-serv').remove();srv.onchange()}};$('#aVal').oninput=sinalSug;sinalSug();
  const checkConf=()=>{const d=$('#aData').value,h=hm2min($('#aHora').value),du=+$('#aDur').value||120;
    const c=arr('agenda').filter(x=>x.id!==id&&x.data===d&&x.status!=='cancelado'&&x.status!=='faltou'&&hm2min(x.hora)<h+du&&h<hm2min(x.hora)+(+x.duracao||120));
    const av=[];if(c.length)av.push(`Conflita com ${c.map(x=>`${esc(nomeCli(x.clienteId))} (${x.hora})`).join(', ')}.`);
    const ex=d?expediente(d):{aberto:true};if(!ex.aberto)av.push(`${esc(ex.motivo)} neste dia.`);
    else if(d){if(h<hm2min(ex.abre)||h+du>hm2min(ex.fecha))av.push(`Fora do expediente deste dia (${esc(ex.abre)}–${esc(ex.fecha)}).`);
      if(ex.pausa&&h<ex.pausa[1]&&h+du>ex.pausa[0])av.push(`Passa pela pausa das ${min2hm(ex.pausa[0])} às ${min2hm(ex.pausa[1])}.`)}
    $('#aConf').innerHTML=av.length?`<div class="alert warn">${ic('alert')}<div>${av.join('<br>')}</div></div>`:''};
  ['aData','aHora','aDur'].forEach(i=>$('#'+i).addEventListener('change',checkConf));checkConf();if(!id&&pre.s)srv.onchange();
  $('#fAg').onsubmit=async e=>{e.preventDefault();let cid=sel.value;
    if(cid==='__nova'){const n=$('#aNovaNome').value.trim();if(!n){toast('Informe o nome da nova cliente');return}cid=await save('clientes',null,{nome:n,telefone:$('#aNovaTel').value.trim(),criadoEm:today()})}
    if(!cid){toast('Escolha a cliente');return}
    const antes=a.status;const pac=pk.value;
    const d={...a,clienteId:cid,servicoId:srv.value,extras:$$('#aExtras select').map(x=>x.value).filter(Boolean),pacoteId:pac||'',data:$('#aData').value,hora:$('#aHora').value,duracao:+$('#aDur').value||120,valor:pac?0:+$('#aVal').value||0,obs:$('#aObs').value.trim(),status:id?$('#aSt').value:'agendado',pagamentos:[...(a.pagamentos||[])]};
    const sv=+($('#aSinal')?.value||0);if(sv>0&&!pac)d.pagamentos.push({id:uid(),tipo:'sinal',data:today(),valor:sv,forma:$('#aSinalF').value,parcelas:1,nf:false});
    await save('agenda',id,d);closeSheet();UI.agDia=d.data;toast(id?'Atendimento atualizado':'Horário marcado');
    if(id&&(antes==='agendado'||antes==='confirmado')&&(d.status==='cancelado'||d.status==='faltou'))setTimeout(()=>sugerirEspera(d),300)};
}
function sugerirEspera(a){const esp=arr('espera').filter(e=>e.status==='aguardando');if(!esp.length){toast('Horário liberado');return}
  sheet('Horário liberado',`<p class="muted small" style="margin-top:0">${dataLonga(a.data)} às ${esc(a.hora)} ficou livre. Avise quem está na lista de espera:</p><div class="list">${esp.map(e=>{const cli=S.clientes.get(e.clienteId);const nome=cli?.nome||e.nome;const w=waLink(cli?.telefone||e.telefone,`Oi, ${primeiro(nome)}! Abriu um horário ${dataLonga(a.data)} às ${a.hora}. Quer que eu reserve para você?`);
   return `<div class="item"><div class="grow"><div class="t">${esc(nome)}</div><div class="s">${esc(nomeServ(e.servicoId))} · ${esc(e.preferencia||'qualquer horário')}</div></div>${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener" data-act="avisada" data-id="${e.id}">${ic('chat')}Avisar</a>`:''}</div>`}).join('')}</div>`)}
function concluir(id){
  const a=S.agenda.get(id);if(!a)return;const P=pol();const pago=soma(a.pagamentos||[]);const s=S.servicos.get(a.servicoId);
  const rest=a.pacoteId?0:Math.max(0,(+a.valor||0)-pago);
  const cons=servsAg(a).flatMap(i=>(S.servicos.get(i)?.consumo||[]).map(c=>({...c})));const itens=arr('estoque').sort((x,y)=>x.nome.localeCompare(y.nome));
  const consRow=(c,i)=>`<div class="cons" data-i="${i}"><label class="fld">Material<select class="cItem"><option value="">—</option>${itens.map(it=>`<option value="${it.id}" ${it.id===c.itemId?'selected':''}>${esc(it.nome)} (${it.qtd} ${esc(it.unidade)})</option>`).join('')}</select></label><label class="fld">Qtd<input class="cQtd" type="number" step="0.5" min="0" value="${c.qtd||1}"></label><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remover">${ic('x')}</button></div>`;
  sheet('Concluir atendimento',`<form class="form" id="fCon"><p class="muted small" style="margin:0">${esc(nomeCli(a.clienteId))} · ${esc(nomeAg(a))}${a.pacoteId?' · sessão de pacote':''}${pago?` · ${BRL(pago)} já recebido`:''}</p>
   ${a.pacoteId?`<div class="alert info">${ic('ticket')}<div>Sessão coberta pelo pacote. Nada a cobrar.</div></div>`:`
   <div class="f2"><label class="fld">Valor total do serviço<input id="kTot" type="number" step="0.01" inputmode="decimal" value="${+a.valor||0}"></label><label class="fld">Vale-presente (código)<input id="kVale" placeholder="SM-XXXXX" style="text-transform:uppercase"></label></div>
   <div id="kValeInfo" class="small"></div>
   <div class="f2"><label class="fld">Recebido agora<input id="kVal" type="number" step="0.01" inputmode="decimal" value="${rest.toFixed(2)}"></label><label class="fld">Forma de pagamento<select id="kForma">${optFormas('Pix')}</select></label>${parcelasSel('kParc',(+a.valor||0)>=+P.campos.parcelaMin?P.campos.parcelas:1)}</div>
   <label class="check"><input type="checkbox" id="kNf">Emiti nota fiscal (obrigatório quando a cliente é empresa/CNPJ)</label>`}
   ${pode('estoque')?`<div><div class="eyebrow" style="margin-bottom:6px">Materiais usados (baixa no estoque)</div><div id="consList" class="stack" style="gap:8px">${cons.map(consRow).join('')}</div><button type="button" class="btn sm ghost" id="consAdd" style="margin-top:6px">${ic('plus')}Adicionar material</button></div>`:''}
   <div class="form-actions"><button class="btn primary" type="submit">${ic('check')}Concluir atendimento</button></div></form>`);
  ligaParcelas('kForma','kParc');
  let vale=null;
  const upRest=()=>{if(a.pacoteId)return;const tot=+$('#kTot').value||0;const vv=vale?Math.min(valeSaldo(vale),Math.max(0,tot-pago)):0;$('#kVal').value=Math.max(0,tot-pago-vv).toFixed(2)};
  if(!a.pacoteId){$('#kTot').oninput=upRest;$('#kVale').oninput=e=>{const cod=e.target.value.trim().toUpperCase();vale=arr('vales').find(v=>v.codigo===cod)||null;
    $('#kValeInfo').innerHTML=!cod?'':!vale?'<span style="color:var(--bad)">Código não encontrado.</span>':!valeAtivo(vale)?'<span style="color:var(--bad)">Vale sem saldo, vencido ou não pago.</span>':`<span style="color:var(--good)">Vale de ${esc(vale.presenteada||'—')} · saldo ${BRL(valeSaldo(vale))}</span>`;if(vale&&!valeAtivo(vale))vale=null;upRest()}}
  if(pode('estoque')){const list=$('#consList');list.onclick=e=>{const b=e.target.closest('[data-rm]');if(b)b.closest('.cons').remove()};$('#consAdd').onclick=()=>list.insertAdjacentHTML('beforeend',consRow({itemId:'',qtd:1},Date.now()))}
  $('#fCon').onsubmit=async e=>{e.preventDefault();$('#fCon button[type=submit]').disabled=true;
    const d={...a,status:'concluido',pagamentos:[...(a.pagamentos||[])]};
    if(!a.pacoteId){const tot=+$('#kTot').value||0;d.valor=tot;const v=+$('#kVal').value||0;const dataPg=a.data<=today()?a.data:today();
      if(vale){const usar=Math.min(valeSaldo(vale),Math.max(0,tot-pago));if(usar>0){d.valeUsado={valeId:vale.id,codigo:vale.codigo,valor:usar};await save('vales',vale.id,{...vale,usos:[...(vale.usos||[]),{agendaId:id,valor:usar,em:dataPg}]})}}
      if(v>0)d.pagamentos.push({id:uid(),tipo:'servico',data:dataPg,valor:v,forma:$('#kForma').value,parcelas:$('#kForma').value==='Cartão de crédito'?+$('#kParc').value:1,nf:$('#kNf').checked})}
    if(pode('estoque')){const usos=$$('#consList .cons').map(r=>({itemId:$('.cItem',r).value,qtd:+$('.cQtd',r).value||0})).filter(u=>u.itemId&&u.qtd>0);d.consumo=usos;d.custoMaterial=Math.round(custoFicha(usos)*100)/100;
      for(const u of usos){const it=S.estoque.get(u.itemId);if(it)await save('estoque',it.id,{...it,qtd:Math.round(((+it.qtd||0)-u.qtd)*100)/100,mov:[{em:today(),qtd:-u.qtd,motivo:`${nomeAg(a)} · ${primeiro(nomeCli(a.clienteId))}`},...(it.mov||[])].slice(0,40)})}}
    await save('agenda',id,d);closeSheet();toast('Atendimento concluído');setTimeout(()=>sugerirRetorno(id,true),500);
    const bx=(d.consumo||[]).map(u=>S.estoque.get(u.itemId)).filter(it=>it&&baixo(it));if(bx.length)setTimeout(()=>toast(`Repor: ${bx.map(i=>i.nome).join(', ')}`),1200)};
}
function formEspera(id){
  const e=id?S.espera.get(id):{status:'aguardando',desde:today()};
  sheet(id?'Lista de espera':'Adicionar à lista de espera',`<form class="form" id="fEs"><label class="fld">Cliente<select id="eCli">${optCli(e.clienteId,'<option value="__avulsa">Pessoa ainda não cadastrada</option>')}</select></label>
   <div class="f2" id="eAv" hidden><label class="fld">Nome<input id="eNome" value="${esc(e.nome)}"></label><label class="fld">WhatsApp<input id="eTel" inputmode="tel" value="${esc(e.telefone)}"></label></div>
   <label class="fld">Serviço desejado<select id="eServ">${optServ(e.servicoId,{preco:false,vazio:'Qualquer serviço'})}</select></label>
   <label class="fld">Preferência de dia e horário<input id="ePref" placeholder="Ex.: sábados de manhã, depois das 14h" value="${esc(e.preferencia)}"></label>
   ${id?`<label class="fld">Situação<select id="eSt">${[['aguardando','Aguardando'],['avisada','Avisada'],['agendada','Agendada'],['desistiu','Desistiu']].map(([k,n])=>`<option value="${k}" ${k===e.status?'selected':''}>${n}</option>`).join('')}</select></label>`:''}
   <div class="form-actions">${id?`<button type="button" class="btn danger ghost" data-act="delEspera" data-id="${id}">${ic('trash')}Remover</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  const c=$('#eCli');const up=()=>{$('#eAv').hidden=c.value!=='__avulsa'};c.onchange=up;if(!e.clienteId&&e.nome){c.value='__avulsa'}up();
  $('#fEs').onsubmit=async ev=>{ev.preventDefault();const av=c.value==='__avulsa';if(!c.value||(av&&!$('#eNome').value.trim())){toast('Informe a cliente');return}
    await save('espera',id,{...e,clienteId:av?'':c.value,nome:av?$('#eNome').value.trim():'',telefone:av?$('#eTel').value.trim():'',servicoId:$('#eServ').value,preferencia:$('#ePref').value.trim(),status:id?$('#eSt').value:'aguardando'});closeSheet();toast('Lista de espera atualizada')};
}

/* ---------- divulgar horários ---------- */
function divulgar(){
  sheet('Divulgar horários livres',`<div class="form"><div class="f2"><label class="fld">Período<select id="dvP"><option value="7">Próximos 7 dias</option><option value="14">Próximos 14 dias</option></select></label><label class="fld">Duração mínima<select id="dvD">${[[120,'2 horas'],[180,'3 horas'],[240,'4 horas'],[300,'5 horas']].map(([v,n])=>`<option value="${v}" ${v===180?'selected':''}>${n}</option>`).join('')}</select></label></div>
   <div class="out" id="dvTxt"></div><div class="row"><button class="btn soft" id="dvCopy">${ic('copy')}Copiar texto</button><button class="btn soft" id="dvImg">${ic('down')}Baixar imagem para stories</button></div>
   <canvas id="dvCanvas" width="1080" height="1920" style="width:100%;max-width:240px;border-radius:16px;align-self:center;border:1px solid var(--line)"></canvas></div>`);
  const up=()=>{const n=+$('#dvP').value,m=+$('#dvD').value;const pb=pub();const dias=[];
    for(let i=0;i<n;i++){const d=addDays(today(),i);const l=livresDia(d,m);if(l.length)dias.push({d,l})}
    const linhas=dias.map(x=>`${cap(SEMX[parse(x.d).getDay()])} ${dataCurta(x.d)}: ${x.l.map(([a,b])=>`${min2hm(a)} às ${min2hm(b)}`).join(' · ')}`);
    const txt=`✨ Horários disponíveis\n${pb.nome}\n\n${linhas.join('\n')||'Agenda cheia no período 💕 Peça para entrar na lista de espera!'}\n\nAgende pelo WhatsApp${pb.whatsapp?` ${pb.whatsapp}`:''}. Sinal de ${pol().campos.sinalPct}% garante o horário.`;
    $('#dvTxt').textContent=txt;desenhaStory(dias,pb);return txt};
  ['dvP','dvD'].forEach(i=>$('#'+i).onchange=up);let txt=up();
  $('#dvCopy').onclick=()=>copiar($('#dvTxt').textContent,'Texto copiado');
  $('#dvImg').onclick=()=>$('#dvCanvas').toBlob(b=>b&&baixar(`horarios-${today()}.png`,b),'image/png');
}
function desenhaStory(dias,pb){const c=$('#dvCanvas');if(!c)return;const x=c.getContext('2d');const W=1080,H=1920;
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#FBF3EB');g.addColorStop(1,'#EFD3BC');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(122,65,35,.16)';x.lineWidth=10;for(let k=0;k<3;k++){x.beginPath();for(let i=0;i<=60;i++){const y=i*(H/60);const xx=W-90+40*Math.sin(i/60*Math.PI*8+k*2.1);i?x.lineTo(xx,y):x.moveTo(xx,y)}x.stroke()}
  x.fillStyle='#7A4123';x.textAlign='left';x.font='italic 600 104px "Cormorant Garamond", Georgia, serif';x.fillText('Horários',90,260);x.fillText('disponíveis',90,370);
  x.fillStyle='#86685A';x.font='600 34px Figtree, sans-serif';x.fillText(pb.nome.toUpperCase(),90,440);
  let y=560;x.font='700 46px Figtree, sans-serif';
  if(!dias.length){x.fillStyle='#3B2216';x.fillText('Agenda cheia no período.',90,y);x.font='400 40px Figtree, sans-serif';x.fillText('Peça para entrar na lista de espera!',90,y+70)}
  dias.slice(0,9).forEach(d=>{x.fillStyle='#3B2216';x.font='700 44px Figtree, sans-serif';x.fillText(`${cap(SEMX[parse(d.d).getDay()])} ${dataCurta(d.d)}`,90,y);
    x.fillStyle='#7A4123';x.font='500 40px Figtree, sans-serif';x.fillText(d.l.map(([a,b])=>`${min2hm(a)}–${min2hm(b)}`).join('   '),90,y+56);y+=140});
  x.fillStyle='#7A4123';x.beginPath();x.roundRect?x.roundRect(90,H-260,W-180,120,60):x.rect(90,H-260,W-180,120);x.fill();
  x.fillStyle='#fff';x.textAlign='center';x.font='700 42px Figtree, sans-serif';x.fillText(pb.whatsapp?`Agende: ${pb.whatsapp}`:'Agende pelo WhatsApp',W/2,H-185)}

/* ---------- finanças ---------- */
function formLan(id){
  const l=id?S.lancamentos.get(id):{tipo:'receita',data:today(),forma:'Pix'};let tipo=l.tipo;
  const cats=()=>(tipo==='receita'?CAT_REC:CAT_DES).map(c=>`<option ${c===l.categoria?'selected':''}>${c}</option>`).join('');
  sheet(id?'Editar lançamento':'Novo lançamento',`<form class="form" id="fLa"><div class="seg" id="lTipo">${['receita','despesa'].map(t=>`<button type="button" data-t="${t}" aria-pressed="${t===tipo}">${t==='receita'?'Receita':'Despesa'}</button>`).join('')}</div>
   <div class="f2"><label class="fld">Valor (R$)<input id="lVal" type="number" step="0.01" min="0" inputmode="decimal" required value="${esc(l.valor??'')}"></label><label class="fld">Data<input id="lData" type="date" required value="${esc(l.data)}"></label></div>
   <label class="fld">Categoria<select id="lCat">${cats()}</select></label><label class="fld">Descrição<input id="lDesc" value="${esc(l.descricao)}" placeholder="Ex.: Jumbo 1B · 5 pacotes"></label>
   <div class="f2"><label class="fld">Forma de pagamento<select id="lForma">${optFormas(l.forma)}</select></label>${parcelasSel('lParc',12)}</div>
   <label class="check" id="lNfBox" ${tipo!=='receita'?'hidden':''}><input type="checkbox" id="lNf" ${l.nf?'checked':''}>Com nota fiscal emitida</label>
   <p class="small muted" style="margin:0">Pagamentos de atendimentos, pacotes e vales entram sozinhos; use este formulário para o resto.</p>
   <div class="form-actions">${id?`<button type="button" class="btn danger ghost" data-act="delLan" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  ligaParcelas('lForma','lParc');if(l.parcelas)$('#lParc').value=l.parcelas;
  $('#lTipo').onclick=e=>{const b=e.target.closest('button');if(!b)return;tipo=b.dataset.t;$$('#lTipo button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#lCat').innerHTML=cats();$('#lNfBox').hidden=tipo!=='receita'};
  $('#fLa').onsubmit=async e=>{e.preventDefault();await save('lancamentos',id,{...l,tipo,valor:+$('#lVal').value||0,data:$('#lData').value,categoria:$('#lCat').value,descricao:$('#lDesc').value.trim(),forma:$('#lForma').value,parcelas:$('#lForma').value==='Cartão de crédito'?+$('#lParc').value:1,nf:tipo==='receita'&&$('#lNf').checked});closeSheet();toast('Lançamento salvo')};
}
function formConta(id){
  const c=id?S.contas.get(id):{vencimento:today(),recorrente:'mensal',categoria:'Aluguel / espaço'};
  sheet(id?'Editar conta':'Nova conta a pagar',`<form class="form" id="fCt"><label class="fld">Descrição<input id="tDesc" required value="${esc(c.descricao)}" placeholder="Ex.: Aluguel da sala"></label>
   <div class="f2"><label class="fld">Valor (R$)<input id="tVal" type="number" step="0.01" required value="${esc(c.valor??'')}"></label><label class="fld">Vencimento${c.recorrente==='mensal'?' (1ª)':''}<input id="tVenc" type="date" required value="${esc(c.vencimento)}"></label></div>
   <div class="f2"><label class="fld">Repetição<select id="tRec"><option value="mensal" ${c.recorrente==='mensal'?'selected':''}>Todo mês</option><option value="unica" ${c.recorrente!=='mensal'?'selected':''}>Uma vez</option></select></label><label class="fld">Até (opcional)<input id="tAte" type="month" value="${esc(c.ate?ym(c.ate):'')}"></label></div>
   <label class="fld">Categoria<select id="tCat">${CAT_DES.map(x=>`<option ${x===c.categoria?'selected':''}>${x}</option>`).join('')}</select></label>
   <div class="form-actions">${id?`<button type="button" class="btn danger ghost" data-act="delConta" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  $('#fCt').onsubmit=async e=>{e.preventDefault();await save('contas',id,{...c,descricao:$('#tDesc').value.trim(),valor:+$('#tVal').value||0,vencimento:$('#tVenc').value,recorrente:$('#tRec').value,ate:$('#tAte').value?$('#tAte').value+'-28':'',categoria:$('#tCat').value,pagas:c.pagas||{}});closeSheet();toast('Conta salva')};
}
function formServ(id){
  const s=id?S.servicos.get(id):{duracao:180,consumo:[]};const itens=arr('estoque').sort((a,b)=>a.nome.localeCompare(b.nome));
  const row=(c,i)=>`<div class="cons"><label class="fld">Material<select class="sItem"><option value="">—</option>${itens.map(it=>`<option value="${it.id}" ${it.id===c.itemId?'selected':''}>${esc(it.nome)}</option>`).join('')}</select></label><label class="fld">Qtd<input class="sQtd" type="number" step="0.5" min="0" value="${c.qtd||1}"></label><button type="button" class="icon-btn" data-rm="1" aria-label="Remover">${ic('x')}</button></div>`;
  sheet(id?'Editar serviço':'Novo serviço',`<form class="form" id="fSv"><label class="fld">Nome<input id="sNome" required value="${esc(s.nome)}"></label>
   <div class="f2"><label class="fld">Preço (R$)<input id="sPre" type="number" step="0.01" inputmode="decimal" value="${esc(s.preco??'')}"></label><label class="fld">Duração${durCampo('sDur',s.duracao)}</label><label class="fld">Custo de material (R$)<input id="sCus" type="number" step="0.01" inputmode="decimal" value="${esc(s.custo??'')}" placeholder="calculado pela ficha"></label></div>
   <div><div class="eyebrow" style="margin-bottom:6px">Consumo padrão de estoque</div><div id="sCons" class="stack" style="gap:8px">${(s.consumo||[]).map(row).join('')}</div><button type="button" class="btn sm ghost" id="sAdd" style="margin-top:6px">${ic('plus')}Adicionar material</button><p class="small muted" style="margin:4px 0 0">Esta é a ficha técnica do serviço: ao concluir, o estoque baixa sozinho. A cor do jumbo pode ser trocada na hora.</p>${pode('custos')?`<div class="alert info" style="margin-top:8px">${ic('wallet')}<div id="sFicha"></div></div>`:''}</div>
   <div class="form-actions">${id?`<button type="button" class="btn danger ghost" data-act="delServ" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  const ficha=()=>{const box=$('#sFicha');if(!box)return;const cons=$$('#sCons .cons').map(r=>({itemId:$('.sItem',r).value,qtd:+$('.sQtd',r).value||0})).filter(c=>c.itemId);const cf=custoFicha(cons);const pr=+$('#sPre').value||0;
    box.innerHTML=cons.length?`Custo pela ficha técnica: <b>${BRL(cf)}</b>${pr?` · lucro de ${BRL(pr-cf)} por atendimento (${pr?Math.round((pr-cf)/pr*100):0}%)`:''}. ${cf&&!+$('#sCus').value?'Será usado no lugar do custo manual.':''}${cons.some(c=>!+S.estoque.get(c.itemId)?.custo)?' Alguns itens estão sem custo no estoque.':''}`:'Adicione os materiais para ver o custo real e o lucro de cada atendimento.'};
  $('#sCons').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){b.closest('.cons').remove();ficha()}};$('#sAdd').onclick=()=>{$('#sCons').insertAdjacentHTML('beforeend',row({},0));ficha()};
  $('#fSv').addEventListener('input',ficha);$('#fSv').addEventListener('change',ficha);ficha();
  $('#fSv').onsubmit=async e=>{e.preventDefault();const consumo=$$('#sCons .cons').map(r=>({itemId:$('.sItem',r).value,qtd:+$('.sQtd',r).value||0})).filter(c=>c.itemId&&c.qtd>0);
    await save('servicos',id,{...s,nome:$('#sNome').value.trim(),preco:+$('#sPre').value||0,duracao:+$('#sDur').value||60,custo:+$('#sCus').value||Math.round(custoFicha(consumo)*100)/100,consumo});closeSheet();toast('Serviço salvo')};
}

/* ---------- estoque ---------- */
function formItem(id){const it=id?S.estoque.get(id):{unidade:'pacote',qtd:0,minimo:2,categoria:CAT_EST[0]};const own=pode('custos');
  sheet(id?'Editar item':'Novo item de estoque',`<form class="form" id="fIt"><label class="fld">Nome<input id="iNome" required value="${esc(it.nome)}" placeholder="Ex.: Jumbo 1B (preto natural)"></label>
   <div class="f2"><label class="fld">Categoria<select id="iCat">${CAT_EST.map(c=>`<option ${c===it.categoria?'selected':''}>${c}</option>`).join('')}</select></label><label class="fld">Unidade<input id="iUn" value="${esc(it.unidade)}" placeholder="pacote, pote, unidade"></label></div>
   <div class="f2">${!id?`<label class="fld">Quantidade atual<input id="iQtd" type="number" step="0.5" value="${it.qtd}"></label>`:''}<label class="fld">Estoque mínimo<input id="iMin" type="number" step="0.5" value="${it.minimo}"></label>${own?`<label class="fld">Custo por unidade (R$)<input id="iCus" type="number" step="0.01" value="${esc(it.custo??'')}"></label>`:''}</div>
   <div class="form-actions">${id&&own?`<button type="button" class="btn danger ghost" data-act="delItem" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  $('#fIt').onsubmit=async e=>{e.preventDefault();await save('estoque',id,{...it,nome:$('#iNome').value.trim(),categoria:$('#iCat').value,unidade:$('#iUn').value.trim()||'unidade',qtd:id?it.qtd:+$('#iQtd').value||0,minimo:+$('#iMin').value||0,custo:own?+($('#iCus')?.value||0):(it.custo||0),mov:it.mov||[]});closeSheet();toast('Item salvo')}}
function movItem(id){const it=S.estoque.get(id);const own=pode('custos');
  sheet('Movimentar estoque',`<form class="form" id="fMv"><p class="muted small" style="margin:0">${esc(it.nome)} · atual: <b>${it.qtd} ${esc(it.unidade)}</b></p>
   <div class="seg" id="mvT"><button type="button" data-t="compra" aria-pressed="true">${own?'Compra':'Entrada'}</button><button type="button" data-t="saida" aria-pressed="false">Saída/perda</button><button type="button" data-t="ajuste" aria-pressed="false">Contagem</button></div>
   <div class="f2"><label class="fld" id="mvQL">Quantidade<input id="mvQ" type="number" step="0.5" min="0" required></label>${own?`<label class="fld" id="mvVL">Valor total pago (R$)<input id="mvV" type="number" step="0.01" min="0"></label><label class="fld" id="mvFL">Forma<select id="mvF">${optFormas('Pix')}</select></label>`:''}</div>
   <label class="fld">Observação<input id="mvO" placeholder="Ex.: fornecedor, motivo da perda"></label>
   ${own?'<p class="small muted" style="margin:0" id="mvNote">A compra também lança a despesa no financeiro.</p>':''}
   <div class="form-actions"><button class="btn primary">${ic('check')}Registrar</button></div></form>`);
  let t='compra';$('#mvT').onclick=e=>{const b=e.target.closest('button');if(!b)return;t=b.dataset.t;$$('#mvT button').forEach(x=>x.setAttribute('aria-pressed',x===b));
    if(own){$('#mvVL').hidden=$('#mvFL').hidden=$('#mvNote').hidden=t!=='compra'}$('#mvQL').firstChild.textContent=t==='ajuste'?'Quantidade contada':'Quantidade'};
  $('#fMv').onsubmit=async e=>{e.preventDefault();const q=+$('#mvQ').value||0;const obs=$('#mvO').value.trim();
    const nova=t==='compra'?(+it.qtd||0)+q:t==='saida'?(+it.qtd||0)-q:q;const delta=Math.round((nova-(+it.qtd||0))*100)/100;
    const upd={...it,qtd:Math.round(nova*100)/100,mov:[{em:today(),qtd:delta,motivo:t==='compra'?'compra':t==='saida'?(obs||'saída'):'contagem'},...(it.mov||[])].slice(0,40)};
    if(own&&t==='compra'){const v=+$('#mvV').value||0;if(v>0){await save('lancamentos',null,{tipo:'despesa',data:today(),valor:v,categoria:it.categoria==='Cabelo / fibra'?'Cabelo / fibra':'Materiais (pomada, linha, elástico)',descricao:`Compra: ${it.nome} (${q} ${it.unidade})${obs?' · '+obs:''}`,forma:$('#mvF').value});if(q>0)upd.custo=Math.round(v/q*100)/100}}
    await save('estoque',id,upd);closeSheet();toast('Estoque atualizado')}}

/* ---------- pacotes e vales ---------- */
function formPacote(id){const p=id?S.pacotes.get(id):{sessoes:3,validade:addDays(today(),120),status:'ativo'};const P=pol();const u=id?pacoteUso(p):{usadas:0,reservadas:0};
  sheet(id?'Pacote':'Vender pacote',`<form class="form" id="fPk"><label class="fld">Cliente<select id="pCli" ${id?'disabled':''}>${optCli(p.clienteId)}</select></label>
   <label class="fld">Nome do pacote<input id="pNome" required value="${esc(p.nome)}" placeholder="Ex.: Box braids + 2 manutenções"></label>
   <div class="f2"><label class="fld">Sessões<input id="pSes" type="number" min="1" value="${p.sessoes}"></label><label class="fld">Valor total (R$)<input id="pVal" type="number" step="0.01" value="${esc(p.valor??'')}" ${id&&(p.pagamentos||[]).length?'disabled':''}></label><label class="fld">Validade<input id="pVal2" type="date" value="${esc(p.validade)}"></label></div>
   ${!id||!(p.pagamentos||[]).length?`<div class="f2"><label class="fld">Forma de pagamento<select id="pForma">${optFormas('Pix')}</select></label>${parcelasSel('pParc',P.campos.parcelas)}</div><label class="check"><input type="checkbox" id="pNf">Com nota fiscal</label>`:`<p class="small muted" style="margin:0">Pago em ${dataBR(p.pagamentos[0].data)} · ${esc(p.pagamentos[0].forma)} · ${BRL(soma(p.pagamentos))}</p>`}
   ${id?`<p class="small" style="margin:0">${u.usadas} usada(s) · ${u.reservadas} agendada(s) · ${pacoteSaldo(p)} disponível(is)</p><label class="check"><input type="checkbox" id="pEnc" ${p.status==='encerrado'?'checked':''}>Encerrar pacote</label>`:''}
   <div class="form-actions">${id&&isOwner()?`<button type="button" class="btn danger ghost" data-act="delPacote" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}${id?'Salvar':'Vender pacote'}</button></div></form>`);
  ligaParcelas('pForma','pParc');
  $('#fPk').onsubmit=async e=>{e.preventDefault();const cli=id?p.clienteId:$('#pCli').value;if(!cli){toast('Escolha a cliente');return}
    const d={...p,clienteId:cli,nome:$('#pNome').value.trim(),sessoes:+$('#pSes').value||1,validade:$('#pVal2').value,criadoEm:p.criadoEm||today(),status:id&&$('#pEnc').checked?'encerrado':'ativo',pagamentos:[...(p.pagamentos||[])]};
    if(!d.pagamentos.length){d.valor=+$('#pVal').value||0;if(d.valor>0)d.pagamentos.push({id:uid(),tipo:'pacote',data:today(),valor:d.valor,forma:$('#pForma').value,parcelas:$('#pForma').value==='Cartão de crédito'?+$('#pParc').value:1,nf:$('#pNf').checked})}
    await save('pacotes',id,d);closeSheet();toast(id?'Pacote atualizado':'Pacote vendido')}}
function formVale(id){const v=id?S.vales.get(id):{codigo:novoCodigo(),validade:addDays(today(),180)};const pb=pub();
  const msg=`🎁 Vale-presente ${pb.nome}\nPara: ${v.presenteada||''}\nDe: ${v.compradora||''}\nValor: ${BRL(v.valor)}\nCódigo: ${v.codigo}\nVálido até ${dataBR(v.validade)}.\nAgende pelo WhatsApp${pb.whatsapp?` ${pb.whatsapp}`:''} e informe o código.`;
  sheet(id?'Vale-presente':'Vender vale-presente',`<form class="form" id="fVl"><div class="row between"><span class="code" style="font-size:1.3rem;color:var(--accent-ink)">${esc(v.codigo)}</span>${id?`<span class="badge ${valeAtivo(v)?'good':''}">saldo ${BRL(valeSaldo(v))}</span>`:''}</div>
   <div class="f2"><label class="fld">Quem compra<input id="vCom" required value="${esc(v.compradora)}"></label><label class="fld">WhatsApp de quem compra<input id="vTel" value="${esc(v.telCompradora)}"></label></div>
   <div class="f2"><label class="fld">Para quem é<input id="vPara" value="${esc(v.presenteada)}"></label><label class="fld">Valor (R$)<input id="vVal" type="number" step="0.01" required value="${esc(v.valor??'')}" ${id?'disabled':''}></label><label class="fld">Validade<input id="vValid" type="date" value="${esc(v.validade)}"></label></div>
   ${!id?`<div class="f2"><label class="fld">Forma de pagamento<select id="vForma">${optFormas('Pix')}</select></label></div>`:''}
   ${(v.usos||[]).length?`<div class="small"><b>Usos:</b> ${v.usos.map(u=>`${dataBR(u.em)} · ${BRL(u.valor)}`).join('; ')}</div>`:''}
   ${id?`<div class="out small">${esc(msg)}</div><button type="button" class="btn soft" id="vCopy">${ic('copy')}Copiar mensagem do vale</button>`:''}
   <div class="form-actions">${id&&isOwner()?`<button type="button" class="btn danger ghost" data-act="delVale" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}${id?'Salvar':'Vender vale'}</button></div></form>`);
  if(id)$('#vCopy').onclick=()=>copiar(msg,'Mensagem copiada');
  $('#fVl').onsubmit=async e=>{e.preventDefault();const d={...v,compradora:$('#vCom').value.trim(),telCompradora:$('#vTel').value.trim(),presenteada:$('#vPara').value.trim(),validade:$('#vValid').value,criadoEm:v.criadoEm||today(),usos:v.usos||[],pagamentos:[...(v.pagamentos||[])]};
    if(!id){d.valor=+$('#vVal').value||0;d.pagamentos.push({id:uid(),tipo:'vale',data:today(),valor:d.valor,forma:$('#vForma').value,parcelas:1,nf:false})}
    const nid=await save('vales',id,d);closeSheet();toast(id?'Vale atualizado':'Vale vendido');if(!id)setTimeout(()=>formVale(nid),300)}}

/* ---------- ideias ---------- */
function formIdeia(id,pre={}){const i=id?S.ideias.get(id):{data:pre.d||'',titulo:pre.n||'',notas:pre.i||'',tipo:'Promoção'};
  sheet(id?'Editar ideia':'Nova ideia',`<form class="form" id="fId"><label class="fld">Título<input id="iTit" required value="${esc(i.titulo)}"></label>
   <div class="f2"><label class="fld">Data (opcional)<input id="iData" type="date" value="${esc(i.data)}"></label><label class="fld">Tipo<select id="iTipo">${['Promoção','Post / conteúdo','Parceria','Evento','Curso','Outro'].map(x=>`<option ${x===i.tipo?'selected':''}>${x}</option>`).join('')}</select></label></div>
   <label class="fld">Detalhes<textarea id="iNot">${esc(i.notas)}</textarea></label>
   <div class="form-actions">${id?`<button type="button" class="btn danger ghost" data-act="delIdeia" data-id="${id}">${ic('trash')}Excluir</button>`:''}<button class="btn primary">${ic('check')}Salvar</button></div></form>`);
  $('#fId').onsubmit=async e=>{e.preventDefault();await save('ideias',id,{...i,titulo:$('#iTit').value.trim(),data:$('#iData').value,tipo:$('#iTipo').value,notas:$('#iNot').value.trim(),feito:!!i.feito});closeSheet();toast('Ideia salva')}}

/* ---------- equipe ---------- */
function aprovar(uidp){const e=S.equipe.get(uidp)||{};const p=S.pedidos.get(uidp)||{};const email=e.email||p.email||'';
  sheet('Perfil de acesso',`<form class="form" id="fEq"><p class="small muted" style="margin:0">Conta: <b>${esc(email)}</b></p>
   <label class="fld">Nome para exibir<input id="qNome" value="${esc(e.apelido||p.nome||'')}"></label>
   <label class="fld">Perfil<select id="qPapel">${[['parceira','Trancista parceira'],['recepcao','Recepção'],['contador','Contador(a) – somente leitura das finanças']].map(([k,n])=>`<option value="${k}" ${e.papel===k?'selected':''}>${n}</option>`).join('')}</select></label>
   ${S.equipe.has(uidp)?`<label class="check"><input type="checkbox" id="qAtivo" ${e.ativo!==false?'checked':''}>Acesso ativo</label>`:''}
   <div class="form-actions"><button class="btn primary">${ic('check')}Salvar perfil</button></div></form>`);
  $('#fEq').onsubmit=async ev=>{ev.preventDefault();await save('equipe',uidp,{papel:$('#qPapel').value,apelido:$('#qNome').value.trim(),email,ativo:$('#qAtivo')?$('#qAtivo').checked:true,desde:e.desde||today()});if(S.pedidos.has(uidp))await del('pedidos',uidp);closeSheet();toast('Perfil salvo')}}

/* ---------- planilha do contador ---------- */
function carregaXLSX(){return new Promise((res,rej)=>{if(window.XLSX)return res(window.XLSX);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>res(window.XLSX);s.onerror=rej;document.head.appendChild(s)})}
async function pacoteContador(){const ano=$('#ctdAno')?.value||today().slice(0,4);toast('Gerando planilha…');
  let X;try{X=await carregaXLSX()}catch(e){toast('Não foi possível carregar o gerador de planilhas');return}
  const pb=pub(),c=priv();const doAno=l=>l.data.slice(0,4)===ano;
  const L=[...receitas(doAno),...despesas(doAno)].sort((a,b)=>a.data<b.data?-1:1).map(l=>({Data:dataBR(l.data),Tipo:l.tipo==='receita'?'Receita':'Despesa',Categoria:l.categoria,'Descrição':l.descricao,Forma:l.forma||'',Parcelas:l.parcelas||1,'Nota fiscal':l.tipo==='receita'?(l.nf?'Sim':'Não'):'',Valor:Math.round((l.tipo==='despesa'?-1:1)*l.valor*100)/100}));
  const rel=[...Array(12)].map((_,i)=>{const k=`${ano}-${pad(i+1)}`;const R=receitas(l=>ym(l.data)===k);const v=f=>Math.round(soma(R.filter(f))*100)/100;
    return {'Mês':cap(mesNome(k)),'I Comércio sem NF':v(l=>ehComercio(l)&&!l.nf),'II Comércio com NF':v(l=>ehComercio(l)&&l.nf),'III Total comércio':v(ehComercio),'IV Indústria sem NF':0,'V Indústria com NF':0,'VI Total indústria':0,'VII Serviços sem NF':v(l=>!ehComercio(l)&&!l.nf),'VIII Serviços com NF':v(l=>!ehComercio(l)&&l.nf),'IX Total serviços':v(l=>!ehComercio(l)),'X Total geral':v(()=>true)}});
  const tot=k=>Math.round(rel.reduce((s,r)=>s+r[k],0)*100)/100;
  const res=[{Item:'Empresa',Valor:pb.nome},{Item:'CNPJ',Valor:pb.cnpj},{Item:'Ano-calendário',Valor:ano},{Item:'Receita bruta total',Valor:tot('X Total geral')},{Item:'Receita de comércio (revenda)',Valor:tot('III Total comércio')},{Item:'Receita de serviços',Valor:tot('IX Total serviços')},{Item:'Limite do ano',Valor:Math.round(limiteAno(ano)*100)/100},{Item:'Teve empregado no ano?',Valor:'Confirmar'},{Item:'Despesas totais registradas',Valor:Math.round(soma(despesas(doAno))*100)/100}];
  const das=[...Array(12)].map((_,i)=>{const k=`${ano}-${pad(i+1)}`;return {'Competência':cap(mesNome(k)),'Vencimento':dataBR(ymd(new Date(+ano,i+1,20))),'Valor':+c.das,'Situação':(c.dasPagos||{})[k]?'Pago':'Não marcado como pago'}});
  const contas=ocorrencias(`${ano}-12-31`).filter(o=>o.k.slice(0,4)===ano).map(o=>({'Vencimento':dataBR(o.venc),'Descrição':o.conta.descricao,'Categoria':o.conta.categoria,'Valor':+o.conta.valor,'Situação':o.paga?'Paga':'Em aberto'}));
  const wb=X.utils.book_new();[['Lançamentos',L],['Relatório mensal',rel],['Resumo DASN-SIMEI',res],['DAS',das],['Contas a pagar',contas]].forEach(([n,rows])=>X.utils.book_append_sheet(wb,X.utils.json_to_sheet(rows.length?rows:[{Aviso:'Sem registros'}]),n));
  const buf=X.write(wb,{type:'array',bookType:'xlsx'});await baixar(`contador-${(pb.nome||'mei').replace(/\s+/g,'-').toLowerCase()}-${ano}.xlsx`,new Uint8Array(buf))}
function relatorioLinhas(){const m=UI.finMes;const pb=pub();const R=receitas(l=>ym(l.data)===m);const v=f=>soma(R.filter(f)).toFixed(2).replace('.',',');
  return [['Relatório mensal das receitas brutas',mesNome(m)],['CNPJ',pb.cnpj],['Empreendedora',pb.responsavel],['I - Revenda de mercadorias sem documento fiscal',v(l=>ehComercio(l)&&!l.nf)],['II - Revenda de mercadorias com documento fiscal',v(l=>ehComercio(l)&&l.nf)],['III - Total comércio',v(ehComercio)],['IV - Indústria sem documento fiscal','0,00'],['V - Indústria com documento fiscal','0,00'],['VI - Total indústria','0,00'],['VII - Serviços sem documento fiscal',v(l=>!ehComercio(l)&&!l.nf)],['VIII - Serviços com documento fiscal',v(l=>!ehComercio(l)&&l.nf)],['IX - Total serviços',v(l=>!ehComercio(l))],['X - Total geral',v(()=>true)],['Local e data',pb.municipio+', ____/____/______'],['Assinatura','']]}

/* ================= dados de exemplo ================= */
async function servicosSugeridos(){if(!pode('precos')){toast('Peça à proprietária para cadastrar os serviços.','erro');return}
  const {ops}=catalogoBase(false);const temEst=S.estoque.size>0;const sel=ops.filter(([c])=>c==='servicos'||(c==='estoque'&&!temEst));
  if(temEst)sel.forEach(o=>{if(o[0]==='servicos')o[2]={...o[2],consumo:[]}});
  for(const [c,id,d] of sel)await save(c,id,d,{quiet:true});toast('Serviços sugeridos adicionados. Ajuste os preços em Finanças › Serviços.')}
function catalogoBase(ex){
  const X=ex?{exemplo:true}:{};const ops=[];const E={};
  [['j1b','Jumbo 1B (preto natural)','Cabelo / fibra','pacote',14,6,18],['j2','Jumbo 2 (castanho escuro)','Cabelo / fibra','pacote',6,4,18],['j27','Jumbo 27 (mel)','Cabelo / fibra','pacote',3,4,19],['org','Cabelo orgânico cacheado','Cabelo / fibra','pacote',4,2,45],
   ['pom','Pomada modeladora','Pomadas e finalizadores','pote',1.5,2,22],['mou','Mousse finalizador','Pomadas e finalizadores','frasco',3,1,28],['lin','Linha para tranças','Linhas e elásticos','rolo',5,2,6],['ela','Elásticos de silicone','Linhas e elásticos','pacote',4,2,5],['mic','Miçangas e anéis','Miçangas e acessórios','kit',6,3,12]]
   .forEach(([k,nome,categoria,unidade,qtd,minimo,custo])=>{E[k]=uid();ops.push(['estoque',E[k],{nome,categoria,unidade,qtd:ex?qtd:0,minimo,custo,mov:[],...X}])});
  const SV={};
  [['box','Box braids (médias)',280,300,60,[['j1b',5],['pom',.5]]],['nago','Nagô (até 10 tranças)',120,120,15,[['pom',.5],['ela',1]]],['ful','Fulani braids',260,270,55,[['j1b',4],['mic',1],['pom',.5]]],['twi','Twist / Senegalese',300,300,65,[['j1b',5],['mou',.5]]],
   ['gyp','Gypsy braids',350,360,90,[['j1b',4],['org',2],['mou',.5]]],['inf','Tranças infantis',90,120,15,[['ela',1],['mic',1]]],['man','Manutenção',100,120,10,[['pom',.5]]],['ret','Retirada de tranças',70,120,0,[]]]
   .forEach(([k,nome,preco,duracao,custo,cons])=>{SV[k]=uid();ops.push(['servicos',SV[k],{nome,preco,duracao,custo,consumo:cons.map(([i,q])=>({itemId:E[i],qtd:q}))}])});
  return {ops,E,SV};
}
async function seed(ex){
  if(!pode('seed'))return;toast(ex?'Carregando exemplos…':'Preparando…');
  const t=today();const {ops,SV}=catalogoBase(ex);const X={exemplo:true};
  const P={box:280,nago:120,ful:260,twi:300,gyp:350,inf:90,man:100,ret:70},D={box:300,nago:120,ful:270,twi:300,gyp:360,inf:120,man:120,ret:120};
  const pagos={};
  if(ex){
    let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;const formas=['Pix','Pix','Dinheiro','Cartão de crédito','Cartão de débito'];
    const CL=[['ana','Ana Beatriz Souza','(27) 99812-4410','Crespo 4C, ombro',6,20,50,'box',0,null,'1994-'+addDays(t,6).slice(5),'Instagram','123.456.789-00'],['jes','Jéssica Santos','(27) 99745-1023','Crespo 4B, busto',4,40,60,'ful',0,'ana','1997-03-28','Indicação',''],['cam','Camila Rocha','(27) 99630-7781','Cacheado 3C, longo',3,130,70,'twi',0,null,'1992-08-14','TikTok',''],
      ['lar','Larissa Oliveira','(27) 99521-3399','Crespo 4A, curto',2,60,90,'nago',1,'ana','2001-12-02','Indicação',''],['tha','Thaís Nascimento','(27) 99410-8866','Crespo 4C, médio',1,15,0,'gyp',0,null,'1999-05-19','Instagram',''],['pri','Priscila Lima','(27) 99387-2251','Transição capilar',0,0,0,'nago',0,'jes','','WhatsApp','']];
    const C={};
    for(const [k,nome,tel,cab,nv,last,intv,serv,faltas,ind,aniv,origem,cpf] of CL){C[k]=uid();
      ops.push(['clientes',C[k],{nome,telefone:tel,cabelo:cab,aniversario:aniv,indicadaPor:ind?C[ind]:'',origem,cpf,criadoEm:addDays(t,-400),...X}]);
      for(let i=0;i<nv;i++){const d=addDays(t,-(last+i*intv));const sk=i%3===2?'man':serv;const f=formas[Math.floor(rnd()*5)];
        ops.push(['agenda',uid(),{clienteId:C[k],servicoId:SV[sk],data:d,hora:['09:00','13:30','08:30'][i%3],duracao:D[sk],valor:P[sk],status:'concluido',pagamentos:[{id:uid(),tipo:'servico',data:d,valor:P[sk],forma:f,parcelas:f==='Cartão de crédito'&&P[sk]>=200?2:1,nf:false}],...X}])}
      for(let i=0;i<faltas;i++)ops.push(['agenda',uid(),{clienteId:C[k],servicoId:SV[serv],data:addDays(t,-25),hora:'14:00',duracao:120,valor:P[serv],status:'faltou',pagamentos:[{id:uid(),tipo:'sinal',data:addDays(t,-30),valor:36,forma:'Pix',parcelas:1,nf:false}],...X}]);
    }
    const pkId=uid();ops.push(['pacotes',pkId,{clienteId:C.ana,nome:'Box braids + 2 manutenções',sessoes:3,valor:450,validade:addDays(t,100),criadoEm:addDays(t,-20),status:'ativo',pagamentos:[{id:uid(),tipo:'pacote',data:addDays(t,-20),valor:450,forma:'Pix',parcelas:1,nf:false}],...X}]);
    [[ 'jes',0,'09:00','box','confirmado',84,''],['pri',0,'15:30','nago','agendado',0,''],['ana',1,'10:00','man','agendado',0,pkId],['lar',3,'09:00','ful','agendado',78,''],['cam',6,'08:30','twi','agendado',90,'']]
     .forEach(([ck,dd,h,sk,st,sinal,pk])=>ops.push(['agenda',uid(),{clienteId:C[ck],servicoId:SV[sk],pacoteId:pk,data:addDays(t,dd),hora:h,duracao:D[sk],valor:pk?0:P[sk],status:st,pagamentos:sinal?[{id:uid(),tipo:'sinal',data:addDays(t,-2),valor:sinal,forma:'Pix',parcelas:1,nf:false}]:[],...X}]));
    ops.push(['vales',uid(),{codigo:'SM-MAE26',compradora:'Jéssica Santos',telCompradora:'(27) 99745-1023',presenteada:'Dona Célia',valor:150,validade:addDays(t,170),criadoEm:addDays(t,-10),usos:[],pagamentos:[{id:uid(),tipo:'vale',data:addDays(t,-10),valor:150,forma:'Pix',parcelas:1,nf:false}],...X}]);
    ops.push(['espera',uid(),{clienteId:C.tha,servicoId:SV.ful,preferencia:'sábados de manhã',desde:addDays(t,-3),status:'aguardando',...X}]);
    ops.push(['espera',uid(),{clienteId:'',nome:'Bruna Alves',telefone:'(27) 99222-0145',servicoId:SV.box,preferencia:'dias de semana, depois das 13h',desde:addDays(t,-1),status:'aguardando',...X}]);
    const R0=Object.fromEntries(ANAM_Q.map(([k])=>[k,{sim:false,det:''}]));
    ops.push(['anamneses',C.ana,{clienteId:C.ana,respostas:R0,obs:'Couro tranquilo. Prefere tranças com pouca tensão na nuca.',menor:false,responsavel:{},imagem:true,atualizadaEm:addDays(t,-120)+'T12:00:00.000Z',historico:[],...X}]);
    ops.push(['anamneses',C.jes,{clienteId:C.jes,respostas:{...R0,alergia:{sim:true,det:'pomadas com fragrância forte'},quimica:{sim:true,det:'coloração há 20 dias'}},obs:'Usar pomada sem fragrância.',menor:false,responsavel:{},imagem:false,atualizadaEm:addDays(t,-40)+'T12:00:00.000Z',historico:[],...X}]);
    for(let i=0;i<6;i++){const b=addMonths(ym(t),-i)+'-05';
      [['Cabelo / fibra',180+Math.round(rnd()*140),'Jumbo e fibra orgânica','Pix'],['Materiais (pomada, linha, elástico)',60+Math.round(rnd()*30),'Pomada, mousse e elásticos','Cartão de débito'],['Transporte',80,'Uber para atendimentos em domicílio','Pix'],['Marketing e redes',i%2?0:40,'Impulsionamento no Instagram','Cartão de crédito'],['Retirada pró-labore',900,'Retirada mensal','Transferência']]
       .forEach(([cat,v,desc,f])=>{if(v){const d=addDays(b,Math.floor(rnd()*20));if(d<=t)ops.push(['lancamentos',uid(),{tipo:'despesa',data:d,valor:v,categoria:cat,descricao:desc,forma:f,...X}])}});
      for(let k=0;k<5+Math.floor(rnd()*5);k++){const sk=['box','nago','ful','twi','gyp','inf'][Math.floor(rnd()*6)];const d=addDays(b,Math.floor(rnd()*24));if(d>t)continue;const f=formas[Math.floor(rnd()*5)];
        ops.push(['lancamentos',uid(),{tipo:'receita',data:d,valor:P[sk],categoria:'Serviço de trança',descricao:'Atendimento avulso (sem cadastro)',forma:f,parcelas:1,nf:k===0&&i===1,...X}])}
      if(addDays(b,10)<=t)ops.push(['lancamentos',uid(),{tipo:'receita',data:addDays(b,10),valor:35,categoria:'Venda de produto',descricao:'Kit de anéis para tranças',forma:'Pix',nf:false,...X}]);
      if(i>0){const mesDas=addMonths(ym(b),-1);pagos[mesDas]=true;ops.push(['lancamentos',uid(),{tipo:'despesa',data:ym(b)+'-18',valor:DEF_PRIV.das,categoria:'DAS-MEI',descricao:`DAS ${mesNome(mesDas)}`,forma:'Pix',dasRef:mesDas,...X}])}}
    const aluguel={descricao:'Aluguel da sala',valor:450,vencimento:addMonths(ym(t),-4)+'-10',recorrente:'mensal',categoria:'Aluguel / espaço',pagas:{},...X};
    for(let i=4;i>=1;i--){const k=addMonths(ym(t),-i);const lid=uid();aluguel.pagas[k]=lid;ops.push(['lancamentos',lid,{tipo:'despesa',data:k+'-10',valor:450,categoria:'Aluguel / espaço',descricao:'Aluguel da sala',forma:'Pix',contaRef:k,...X}])}
    ops.push(['contas',uid(),aluguel]);
    ops.push(['contas',uid(),{descricao:'Internet do ateliê',valor:99.9,vencimento:ym(t)+'-15',recorrente:'mensal',categoria:'Outras despesas',pagas:{},...X}]);
    ops.push(['contas',uid(),{descricao:'Curso de tranças nagô avançado',valor:300,vencimento:addDays(t,12),recorrente:'unica',categoria:'Cursos',pagas:{},...X}]);
    ops.push(['ideias',uid(),{titulo:'Sorteio de uma manutenção no Instagram',tipo:'Promoção',data:addDays(t,10),notas:'Regra: seguir, curtir e marcar 2 amigas.',...X}]);
    ops.push(['ideias',uid(),{titulo:'Parceria com loja de acessórios para tranças',tipo:'Parceria',data:'',notas:'Cupom cruzado: minhas clientes ganham 10% na loja.',...X}]);
  }
  if(ex){[['Box braids','4 a 6 horas','Tranças soltas e versáteis, do comprimento que você escolher. Duram de 6 a 8 semanas com os cuidados certos.','Tranças soltas',280],['Nagô','1 a 2 horas','Tranças rentes ao couro cabeludo, em desenhos retos ou criativos. Ótimas para o dia a dia e para o calor.','Nagô',120],['Fulani braids','4 a 5 horas','Combinação de nagô na frente com tranças soltas atrás, com miçangas e anéis.','Tranças soltas',260]]
      .forEach(([nome,tempo,descricao,categoria,preco],i)=>ops.push(['catalogo',uid(),{nome,tempo,descricao,categoria,preco,mostrarPreco:true,link:'',botao:'Quero este modelo',ativo:true,ordem:i,fotos:[],exemplo:true}]))}
  ops.push(['publico','config',{...pub(),started:true}]);
  ops.push(['privado','config',{...priv(),dasPagos:pagos}]);
  ops.forEach(([c,id,d])=>{S[c].set(id,{id,...d})});touch();
  await pool(ops.map(([c,id,d])=>()=>save(c,id,d,{quiet:true})),8);
  toast(ex?'Dados de exemplo carregados':'Pronto! Ajuste preços em Finanças › Serviços e o estoque inicial');
}
async function limparEx(){await carregarHistorico();const ops=[];ALL_COLS.forEach(c=>arr(c).filter(r=>r.exemplo).forEach(r=>ops.push([c,r.id])));
  await pool(ops.map(([c,id])=>()=>del(c,id)),8);await save('privado','config',{...priv(),dasPagos:{}});toast('Exemplos apagados')}


/* ================= v4: busca, retornos, recibo, tema, linha do tempo ================= */
const TEMA_KEY='smt-tema';
function temaAtual(){try{return localStorage.getItem(TEMA_KEY)||'sistema'}catch(e){return 'sistema'}}
function aplicaTema(t){const r=document.documentElement;if(t==='claro')r.setAttribute('data-theme','light');else if(t==='escuro')r.setAttribute('data-theme','dark');else r.removeAttribute('data-theme');try{localStorage.setItem(TEMA_KEY,t)}catch(e){}}
aplicaTema(temaAtual());

function busca(){
  sheet('Buscar',`<div class="form"><label class="searchbox">${ic('search')}<input id="gBusca" type="search" placeholder="Nome, telefone ou código de vale" autocomplete="off" enterkeyhint="search"></label><div id="gRes"></div></div>`);
  const i=$('#gBusca');const up=()=>{$('#gRes').innerHTML=resultadosBusca(i.value)};i.oninput=up;up();setTimeout(()=>i.focus(),60);
  i.onkeydown=e=>{if(e.key==='Enter'){const f=$('#gRes [data-act="buscaIr"]');if(f){e.preventDefault();f.click()}}};
}
function resultadosBusca(q){
  q=(q||'').trim().toLowerCase();if(q.length<2)return '<div class="empty">Digite pelo menos 2 letras. Atalho no computador: tecla <b>/</b>.</div>';
  const dq=digits(q);const norm=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const nq=norm(q);
  const cl=arr('clientes').filter(c=>norm(c.nome).includes(nq)||(dq.length>=3&&digits(c.telefone).includes(dq))).sort((a,b)=>a.nome.localeCompare(b.nome)).slice(0,6);
  const cids=new Set(cl.map(c=>c.id));
  const ag=arr('agenda').filter(a=>cids.has(a.clienteId)&&a.status!=='cancelado').sort((a,b)=>(b.data+b.hora)>(a.data+a.hora)?1:-1).slice(0,5);
  const vl=arr('vales').filter(v=>norm(v.codigo).includes(nq)||norm(v.presenteada).includes(nq)||norm(v.compradora).includes(nq)).slice(0,4);
  const pk=arr('pacotes').filter(p=>cids.has(p.clienteId)||norm(p.nome).includes(nq)).slice(0,4);
  const grupo=(t,rows)=>rows.length?`<div class="eyebrow" style="margin:12px 0 4px">${t}</div><div class="list">${rows.join('')}</div>`:'';
  const item=(k,id,icone,tit,sub)=>`<button class="item" data-act="buscaIr" data-k="${k}" data-id="${id}"><div class="avatar" style="--lv:var(--rose)">${icone}</div><div class="grow"><div class="t">${tit}</div><div class="s">${sub}</div></div>${ic('right')}</button>`;
  const html=grupo('Clientes',cl.map(c=>{const f=fidelidade(c);return item('cli',c.id,iniciais(c.nome),esc(c.nome),`${NIVEIS[f.nivel].n}${c.telefone?' · '+esc(c.telefone):''}`)}))+
    grupo('Atendimentos',ag.map(a=>item('ag',a.id,ic('cal'),`${esc(nomeCli(a.clienteId))} · ${dataBR(a.data)} ${esc(a.hora)}`,`${esc(nomeAg(a))} · ${STATUS[a.status]?.n||''}`)))+
    grupo('Vales-presente',vl.map(v=>item('vale',v.id,ic('gift'),`<span class="code">${esc(v.codigo)}</span> · ${esc(v.presenteada||'—')}`,`saldo ${BRL(valeSaldo(v))}`)))+
    grupo('Pacotes',pk.map(p=>item('pac',p.id,ic('ticket'),`${esc(nomeCli(p.clienteId))} · ${esc(p.nome)}`,`${pacoteSaldo(p)} sessão(ões) disponível(is)`)));
  return html||'<div class="empty">Nada encontrado.</div>';
}
function buscaIr(k,id){closeSheet(true);
  if(k==='cli'){abrirCliente(id)}else if(k==='ag'){const a=S.agenda.get(id);if(a){UI.agDia=a.data;go('agenda')}}
  else if(k==='vale'){UI.pkTab='vales';go('pacotes');formVale(id)}else if(k==='pac'){UI.pkTab='pacotes';go('pacotes');formPacote(id)}}

/* clientes que precisam de manutenção ou retirada */
function retornos(){return memo('ret',()=>{const t=today();const max=+pol().campos.semanasMax||8;const out=[];
  const futuras=new Set(arr('agenda').filter(a=>a.data>=t&&(a.status==='agendado'||a.status==='confirmado')).map(a=>a.clienteId));
  arr('clientes').forEach(c=>{if(futuras.has(c.id))return;
    const ult=(agPorCli().get(c.id)||[]).filter(a=>a.status==='concluido'&&a.data<=t).sort((a,b)=>a.data<b.data?1:-1)[0];
    if(!ult||/retirada/i.test(nomeAg(ult)))return;
    const sem=Math.floor(diffDays(ult.data,t)/7);if(sem<Math.max(3,max-3)||sem>max+6)return;
    out.push({c,ult,sem,retirar:sem>=max-1})});
  return out.sort((a,b)=>b.sem-a.sem)})}
function retornoRow(r){const max=pol().campos.semanasMax;const pb=pub();
  const msg=r.retirar?`Oi, ${primeiro(r.c.nome)}! Suas tranças já estão com ${r.sem} semanas 💕 Para cuidar da saúde dos seus fios, o ideal é retirar até ${max} semanas. Vamos marcar a retirada (e, se quiser, já a próxima trança)?`
    :`Oi, ${primeiro(r.c.nome)}! Suas tranças completam ${r.sem} semanas 💕 É uma ótima hora para uma manutenção e deixar tudo alinhado de novo. Quer que eu reserve um horário?`;
  const w=waLink(r.c.telefone,msg+` Beijos, ${primeiro(pb.responsavel)}`);
  const sv=arr('servicos').find(s=>r.retirar?/retirada/i.test(s.nome):/manuten/i.test(s.nome));
  return `<div class="item"><div class="avatar" style="--lv:${r.retirar?'var(--lv-bronze)':'var(--lv-ouro)'}">${iniciais(r.c.nome)}</div><div class="grow"><div class="t">${esc(r.c.nome)}</div><div class="s">${esc(nomeAg(r.ult))} há ${r.sem} semanas</div></div><span class="badge ${r.retirar?'bad':'warn'}">${r.retirar?'retirar':'manutenção'}</span>${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Avisar</a>`:''}<button class="icon-btn" data-act="retornoAg" data-c="${r.c.id}" data-s="${sv?.id||''}" data-d="${today()}" aria-label="Agendar">${ic('cal')}</button></div>`}
function confirmarRow(a){const cli=S.clientes.get(a.clienteId);const pb=pub();
  const w=cli?waLink(cli.telefone,`Oi, ${primeiro(cli.nome)}! 💕 Passando para confirmar seu horário amanhã, ${dataLonga(a.data)}, às ${a.hora}, para ${nomeAg(a)}. Lembre de vir ${pol().campos.preparo}. Posso confirmar? Beijos, ${primeiro(pb.responsavel)}`):null;
  return `<div class="item"><span class="time">${esc(a.hora)}</span><div class="grow"><div class="t">${esc(nomeCli(a.clienteId))}</div><div class="s">${esc(nomeAg(a))}</div></div>${w?`<a class="btn sm soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Pedir confirmação</a>`:''}<button class="btn sm primary" data-act="stAg" data-id="${a.id}" data-s="confirmado">${ic('check')}Confirmada</button></div>`}

/* sugerir retorno após concluir */
function sugerirRetorno(agId,auto){const a=S.agenda.get(agId);if(!a||!a.clienteId)return;
  if(auto&&arr('agenda').some(x=>x.clienteId===a.clienteId&&x.id!==a.id&&x.data>=today()&&(x.status==='agendado'||x.status==='confirmado')))return;
  const max=+pol().campos.semanasMax||8;const nome=nomeAg(a);const ehRet=/retirada/i.test(nome);
  const man=arr('servicos').find(s=>/manuten/i.test(s.nome)),ret=arr('servicos').find(s=>/retirada/i.test(s.nome));
  const op=[];
  if(!ehRet&&man)op.push(['Manutenção',man.id,4]);
  if(!ehRet&&ret)op.push(['Retirada',ret.id,max]);
  op.push([ehRet?'Nova trança':`Repetir ${nome}`,ehRet?'':a.servicoId,ehRet?0:max]);
  const cli=S.clientes.get(a.clienteId);
  sheet('Agendar o retorno?',`<p class="muted small" style="margin-top:0">${esc(primeiro(cli?.nome))} sai daqui com o próximo horário garantido. Escolha uma sugestão; a data pode ser ajustada.</p>
   <div class="stack" style="gap:8px">${op.map(([n,sid,sem])=>{const d=addDays(a.data,sem*7);return `<button class="item" style="border:1px solid var(--line);border-radius:14px;padding:12px" data-act="retornoAg" data-c="${a.clienteId}" data-s="${sid}" data-d="${d<today()?today():d}" data-obs="Retorno de ${esc(nome)} (${dataCurta(a.data)})"><div class="avatar" style="--lv:var(--lv-perola)">${ic('repeat')}</div><div class="grow"><div class="t">${esc(n)}</div><div class="s">${sem?`em ${sem} semanas · ${dataLonga(d<today()?today():d)}`:'escolher data'}</div></div>${ic('right')}</button>`}).join('')}</div>
   <div class="form-actions"><button class="btn ghost" data-act="close">Agora não</button></div>`)}

/* recibo */
function reciboHtml(a){const pb=pub();const cli=S.clientes.get(a.clienteId);const pg=(a.pagamentos||[]);const total=+a.valor||0;
  const num='R-'+a.data.replace(/-/g,'')+'-'+String(a.id).slice(-4).toUpperCase();
  const linhas=pg.map(p=>`<tr><td>${dataBR(p.data)}</td><td>${p.tipo==='sinal'?'Sinal':'Pagamento'}</td><td>${esc(p.forma)}${+p.parcelas>1?` em ${p.parcelas}x`:''}</td><td style="text-align:right">${BRL(p.valor)}</td></tr>`).join('')+(a.valeUsado?`<tr><td></td><td>Vale-presente</td><td class="code">${esc(a.valeUsado.codigo)}</td><td style="text-align:right">${BRL(a.valeUsado.valor)}</td></tr>`:'');
  const pago=soma(pg)+(+a.valeUsado?.valor||0);
  return `<article class="doc"><h1>Recibo</h1><div class="sub">Nº ${num}</div>
   <p>Recebi de <b>${linha(cli?.nome)}</b>${cli?.cpf?`, CPF ${esc(cli.cpf)}`:''}, a importância de <b>${BRL(a.pacoteId?0:pago)}</b>, referente ao serviço de <b>${esc(nomeAg(a))}</b> realizado em ${dataExt(a.data)}${a.pacoteId?', coberto por pacote adquirido anteriormente':''}.</p>
   ${linhas?`<table><tr><td><b>Data</b></td><td><b>Tipo</b></td><td><b>Forma</b></td><td style="text-align:right"><b>Valor</b></td></tr>${linhas}<tr><td colspan="3"><b>Total do serviço</b></td><td style="text-align:right"><b>${BRL(a.pacoteId?0:total)}</b></td></tr></table>`:''}
   <p style="margin-top:14px">${esc(pb.nome)} · CNPJ ${linha(pb.cnpj)}${pb.endereco?` · ${esc(pb.endereco)}`:''}</p>
   <p>${esc(pb.municipio)}, ${dataExt(today())}.</p>
   <div class="ass"><div>${esc(pb.responsavel||pb.nome)}</div></div></article>`}
function recibo(id){const a=S.agenda.get(id);if(!a)return;const cli=S.clientes.get(a.clienteId);const pb=pub();
  const txt=`Recibo · ${pb.nome}\nCliente: ${cli?.nome||''}\nServiço: ${nomeAg(a)} em ${dataBR(a.data)}\nValor: ${BRL(a.pacoteId?0:soma(a.pagamentos||[])+(+a.valeUsado?.valor||0))}\n${(a.pagamentos||[]).map(p=>`${dataBR(p.data)} · ${p.forma}${+p.parcelas>1?` ${p.parcelas}x`:''} · ${BRL(p.valor)}`).join('\n')}\nObrigada pela confiança! 💕`;
  const w=cli?waLink(cli.telefone,txt):null;
  sheet('Recibo',`<div class="stack"><div id="reciboBox">${reciboHtml(a)}</div><div class="row"><button class="btn primary" data-act="imprimirArea">${ic('file')}Imprimir ou salvar PDF</button>${w?`<a class="btn soft" href="${w}" target="_blank" rel="noopener">${ic('chat')}Enviar no WhatsApp</a>`:''}<button class="btn ghost" id="rcCopy">${ic('copy')}Copiar</button></div></div>`);
  $('#rcCopy').onclick=()=>copiar(txt,'Recibo copiado')}
function imprimirArea(){const src=$('#reciboBox');if(!src)return;let pa=$('#printArea');if(!pa){pa=document.createElement('div');pa.id='printArea';document.body.appendChild(pa)}
  pa.innerHTML=src.innerHTML;document.body.classList.add('imprimindo');const fim=()=>{document.body.classList.remove('imprimindo');pa.innerHTML='';window.removeEventListener('afterprint',fim)};window.addEventListener('afterprint',fim);window.print();setTimeout(fim,1500)}

/* linha do tempo do dia */
function linhaTempo(d){const ex=expediente(d);const sm=semana().filter(x=>x.on);const ini=hm2min(ex.aberto?ex.abre:(sm[0]||DIA_PADRAO).ini),fim=Math.max(ini+60,hm2min(ex.aberto?ex.fecha:(sm[0]||DIA_PADRAO).fim));const tot=fim-ini;
  const ags=arr('agenda').filter(a=>a.data===d&&a.status!=='cancelado');
  const pos=m=>Math.max(0,Math.min(100,(m-ini)/tot*100));
  const horas=[];for(let h=Math.ceil(ini/60);h*60<=fim;h+=2)horas.push(h);
  const agora=new Date();const nm=agora.getHours()*60+agora.getMinutes();const mostraAgora=d===today()&&nm>=ini&&nm<=fim;
  const blocos=ags.map(a=>{const s=hm2min(a.hora),e=s+(+a.duracao||120);const st=STATUS[a.status]||STATUS.agendado;
    return `<button class="tl-b" data-act="agDia" data-d="${a.data}" style="left:${pos(s)}%;width:${Math.max(2,pos(e)-pos(s))}%;--st:${st.c}" title="${esc(a.hora)} · ${esc(nomeCli(a.clienteId))} · ${esc(nomeAg(a))}"><span>${esc(primeiro(nomeCli(a.clienteId)))}</span></button>`}).join('');
  const iv=ex.aberto&&ex.pausa;const pausa=iv?`<i class="tl-pausa" style="left:${pos(iv[0])}%;width:${pos(iv[1])-pos(iv[0])}%" title="Pausa"></i>`:'';const fe=ex.aberto?'':ex.motivo;
  return `<div class="tl ${fe?'tl-fechado':''}" role="img" aria-label="Linha do tempo de ${esc(dataLonga(d))}"><div class="tl-track">${pausa}${fe&&!ags.length?`<span class="tl-msg">${esc(fe)}</span>`:''}${blocos}${mostraAgora?`<i class="tl-now" style="left:${pos(nm)}%"><b>agora</b></i>`:''}</div><div class="tl-h">${horas.map(h=>`<span style="left:${pos(h*60)}%">${pad(h)}h</span>`).join('')}</div></div>`}

/* fechar folha arrastando para baixo (celular) */
(function(){let y0=null,dy=0,el=null;
  document.addEventListener('touchstart',e=>{const sh=e.target.closest&&e.target.closest('.sheet');if(!sh||sh.scrollTop>0||e.target.closest('input,textarea,select,canvas'))return;el=sh;y0=e.touches[0].clientY;dy=0},{passive:true});
  document.addEventListener('touchmove',e=>{if(y0==null||!el)return;dy=e.touches[0].clientY-y0;if(dy>0){el.style.transform=`translateY(${dy}px)`;el.style.transition='none'}},{passive:true});
  document.addEventListener('touchend',()=>{if(!el)return;el.style.transition='';if(dy>110){closeSheet()}else{el.style.transform=''}y0=null;el=null;dy=0});
})();


/* ================= v5: catálogo, contrato por link, espaço da cliente ================= */
const toMs=x=>!x?0:typeof x.toMillis==='function'?x.toMillis():x.seconds?x.seconds*1000:Date.parse(x)||0;
function gerarToken(n=24){const b=new Uint8Array(n);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
const urlPublica=(pag,token)=>`${location.origin}/${pag}${token?'#'+token:''}`;
function hashStr(t){let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return (h>>>0).toString(36)}
function saveRaw(col,id,data){id=id||uid();const rec={...data,atualizadoEm:nowIso(),atualizadoPor:ME||''};delete rec.id;S[col].set(id,{id,...rec});touch(col);setDoc(doc(FS,col,id),rec).catch(dbErr);return id}
function htmlParaTexto(html){const t=document.createElement('div');t.innerHTML=html.replace(/<br\s*\/?>/gi,'\n').replace(/<\/(h1|h2|p|li|div|tr)>/gi,'\n').replace(/<li>/gi,'• ').replace(/<\/td>/gi,'  ');return t.textContent.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
const semRevisao=html=>html.replace(/<span class="rev"[^>]*>([\s\S]*?)<\/span>/g,'$1');
const mascaraCpf=c=>{const d=digits(c);return d.length===11?`***.${d.slice(3,6)}.${d.slice(6,9)}-**`:''};
function salvarVitrine(){if(!isOwner())return;const pb=pub();setDoc(doc(FS,'vitrine','config'),{nome:pb.nome,responsavel:pb.responsavel,whatsapp:pb.whatsapp,instagram:pb.instagram||'',municipio:pb.municipio,indBenefNova:pb.indBenefNova||IND_PADRAO[1],atualizadoEm:nowIso()}).catch(()=>{})}

/* ---------- folgas ---------- */
function excecoesCard(){const f=(pub().folgas||[]).map((x,i)=>({...x,i})).filter(x=>x.rec?(!x.fim||x.fim>=today()):(x.fim||x.ini)>=today());
  return `<section class="card"><h3>Datas especiais <small>folgas, feriados, horários diferentes</small></h3>
   <form class="form" id="fExc"><div class="seg" id="exTipo"><button type="button" data-t="fechado" aria-pressed="true">${ic('lock')}Fechado</button><button type="button" data-t="horario" aria-pressed="false">${ic('clock')}Horário diferente</button></div>
    <div class="f2"><label class="fld">De<input type="date" id="fgIni" required></label><label class="fld">Até (opcional)<input type="date" id="fgFim"></label><label class="fld exh" hidden>Abre<input type="time" id="fgAbre" value="09:00"></label><label class="fld exh" hidden>Fecha<input type="time" id="fgFecha" value="14:00"></label></div>
    <div class="f2"><label class="fld">Motivo<input id="fgMot" placeholder="Ex.: férias, feriado, curso"></label><label class="fld">Repetir<select id="fgRep"><option value="">Não repete</option><option value="semanal">Toda semana, no mesmo dia</option><option value="mensal">Todo mês (ex.: primeira segunda)</option></select></label></div>
    <p class="small muted" id="fgRepTxt" style="margin:-4px 0 0" hidden></p>
    <div class="form-actions"><button class="btn soft">${ic('plus')}Adicionar data</button></div></form>
   ${f.length?`<div class="list" style="margin-top:10px">${f.map(x=>{const h=x.tipo==='horario';return `<div class="item"><div class="avatar" style="--lv:${h?'var(--lv-ouro)':'var(--lv-prata)'}">${ic(h?'clock':'lock')}</div><div class="grow"><div class="t">${esc(x.motivo||(h?'Horário especial':'Agenda fechada'))}</div><div class="s">${x.rec?`${cap(recTexto(x))} · desde ${dataBR(x.ini)}${x.fim?` até ${dataBR(x.fim)}`:''}`:`${dataBR(x.ini)}${x.fim&&x.fim!==x.ini?` até ${dataBR(x.fim)}`:''}`} · ${h?`${esc(x.abre)}–${esc(x.fecha)}`:'fechado'}</div></div><button class="btn sm ghost danger" data-act="folgaRem" data-i="${x.i}">Remover</button></div>`}).join('')}</div>`:'<p class="small muted" style="margin-bottom:0">Nenhuma data especial futura. Dias fechados não aparecem como livres nem na divulgação de horários.</p>'}</section>`}
/* ---------- catálogo ---------- */
const FOTOS=new Map(),FOTO_PEND=new Set();
function fotoImg(id,cls='',alt=''){return id?`<img class="${cls}" data-foto="${id}" alt="${esc(alt)}" loading="lazy" ${FOTOS.has(id)?`src="${FOTOS.get(id)}"`:''}>`:`<div class="${cls} foto-vazia" role="img" aria-label="Sem foto">${braidMark(42)}</div>`}
function carregaFotos(){if(!FS)return;$$('img[data-foto]:not([src])').forEach(async img=>{const id=img.dataset.foto;if(FOTOS.has(id)){img.src=FOTOS.get(id);return}if(FOTO_PEND.has(id))return;FOTO_PEND.add(id);
  try{const s=await getDoc(doc(FS,'catalogoFotos',id));if(s.exists()){FOTOS.set(id,s.data().data);$$(`img[data-foto="${id}"]`).forEach(i=>i.src=FOTOS.get(id))}}catch(e){}FOTO_PEND.delete(id)})}
async function comprimeFoto(file){const url=URL.createObjectURL(file);try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('formato'));i.src=url});
  const max=1100;let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);
  let q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>650000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q)}return d}finally{URL.revokeObjectURL(url)}}
const catOrdenado=()=>arr('catalogo').sort((a,b)=>(a.ordem??99)-(b.ordem??99)||String(a.nome).localeCompare(b.nome));
const normNome=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
function duracaoDoTempo(t){const s=normNome(t);const ns=(s.match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>+x.replace(',','.'));if(!ns.length)return 0;const n=Math.max(...ns);
  const m=/min/.test(s)&&!/hora|\bh\b|\dh/.test(s)?n:n*60;return Math.round(m/15)*15}
async function servicoDoModelo(x,{nome,preco,duracao,servicoId}){let sid=servicoId||x.servicoId;
  if(sid&&!S.servicos.has(sid))sid='';
  if(!sid){const ex=arr('servicos').find(s=>normNome(s.nome)===normNome(nome));sid=ex?ex.id:uid()}
  const sv=S.servicos.get(sid)||{custo:0,consumo:[]};
  const novo={...sv,nome,duracao:duracao||sv.duracao||120,preco:preco||sv.preco||0,catalogoId:x.id||sv.catalogoId||''};
  if(JSON.stringify([sv.nome,sv.duracao,sv.preco,sv.catalogoId])!==JSON.stringify([novo.nome,novo.duracao,novo.preco,novo.catalogoId]))await save('servicos',sid,novo,{quiet:true});
  return sid}
async function sincronizarCatalogo(){if(!pode('catalogoEdit'))return;for(const x of arr('catalogo').filter(c=>!c.servicoId||!S.servicos.has(c.servicoId))){
  const sid=await servicoDoModelo(x,{nome:x.nome,preco:+x.preco||0,duracao:duracaoDoTempo(x.tempo)});await save('catalogo',x.id,{...x,servicoId:sid},{quiet:true})}}
function vCatalogo(){const own=pode('catalogoEdit');const L=catOrdenado();const vis=L.filter(x=>x.ativo!==false).length;
  return head('Catálogo','Catálogo de <em>serviços</em>',`${vis} modelo${vis===1?'':'s'} visível${vis===1?'':'is'} para as clientes`,
    `<button class="btn soft" data-act="copiarCatalogo">${ic('copy')}Copiar link</button><a class="btn soft" href="${urlPublica('catalogo')}" target="_blank" rel="noopener">${ic('right')}Ver como cliente</a>${own?`<button class="btn primary" data-act="novoCat">${ic('plus')}Novo modelo</button>`:''}`)+
  (L.length?`<div class="cat-grid">${L.map(x=>`<button class="cat-card" data-act="editCat" data-id="${x.id}">${fotoImg((x.fotos||[])[0],'cat-img',x.nome)}<div class="cat-body"><div class="row between"><b>${esc(x.nome)}</b>${x.tempo?`<span class="badge">${ic('clock')}${esc(x.tempo)}</span>`:''}</div><p>${esc(x.descricao||'')}</p><div class="row" style="gap:6px">${x.ativo===false?'<span class="badge">oculto</span>':''}${!x.link?'<span class="badge warn">botão usa o WhatsApp do ateliê</span>':'<span class="badge good">botão configurado</span>'}${(x.fotos||[]).length>1?`<span class="badge">${x.fotos.length} fotos</span>`:''}${x.exemplo?'<span class="badge">exemplo</span>':''}</div></div></button>`).join('')}</div>`
   :`<section class="card empty">Nenhum modelo no catálogo ainda.${own?`<br><button class="btn primary" style="margin-top:10px" data-act="novoCat">${ic('plus')}Adicionar o primeiro</button>`:''}</section>`)+
  (own?(()=>{const lig=new Set(L.map(x=>x.servicoId));const fora=arr('servicos').filter(s=>!lig.has(s.id)).sort((a,b)=>a.nome.localeCompare(b.nome));
    return avaliacoesBloco()+(fora.length?`<section class="card"><h3>Serviços sem modelo no catálogo <small>${fora.length}</small></h3><p class="small muted" style="margin-top:0">Eles já aparecem na agenda e nos contratos. Toque para criar o modelo com fotos e descrição.</p><div class="chips" style="flex-wrap:wrap">${fora.map(s=>`<button class="chip" data-act="novoCat" data-s="${s.id}">${ic('plus')} ${esc(s.nome)}</button>`).join('')}</div></section>`:'')})():avaliacoesBloco())+
  `<div class="alert info">${ic('info')}<div>As clientes veem o catálogo pelo link público e pelo espaço delas. O botão de cada modelo abre o link que ${own?'você definir':'a proprietária definir'}; o endereço não aparece na tela.${own?'':' Só a proprietária altera o catálogo.'}</div></div>`}
function verCatalogo(id){const x=S.catalogo.get(id);if(!x)return;
  sheet(esc(x.nome),`<div class="stack"><div class="cat-carrossel">${(x.fotos||[null]).map(f=>fotoImg(f,'cat-foto',x.nome)).join('')}</div>${x.tempo?`<div><span class="badge">${ic('clock')}Tempo médio: ${esc(x.tempo)}</span></div>`:''}<p style="margin:0">${esc(x.descricao||'')}</p>${x.preco&&x.mostrarPreco?`<p class="small muted" style="margin:0">A partir de ${BRL(x.preco)}</p>`:''}<button class="btn soft" data-act="copiarCatalogo">${ic('copy')}Copiar link do catálogo</button></div>`)}
function formCatalogo(id,pre={}){const novo=!id;id=id||uid();const sv0=pre.s?S.servicos.get(pre.s):null;const x=S.catalogo.get(id)||{ativo:true,botao:'Quero este modelo',mostrarPreco:false,ordem:arr('catalogo').length,fotos:[],...(sv0?{nome:sv0.nome,servicoId:sv0.id,preco:sv0.preco,tempo:`cerca de ${durTxt(sv0.duracao)}`}:{})};
  let fotos=(x.fotos||[]).map(f=>({id:f}));const removidas=[];
  const cats=[...new Set(arr('catalogo').map(c=>c.categoria).filter(Boolean))];
  sheet(novo?'Novo modelo':'Editar modelo',`<form class="form" id="fCat">
   <div><div class="small muted" style="margin-bottom:6px">Fotos (até 6; a primeira é a capa)</div><div class="cat-fotos" id="cfFotos"></div><label class="btn soft" style="margin-top:8px">${ic('image')}Adicionar fotos<input type="file" id="cfFile" accept="image/*" multiple hidden></label></div>
   <label class="fld">Nome do serviço<input id="cfNome" required value="${esc(x.nome)}" placeholder="Ex.: Box braids médias"></label>
   <div class="f2"><label class="fld">Tempo médio de aplicação<input id="cfTempo" value="${esc(x.tempo)}" placeholder="Ex.: 4 a 6 horas"></label><label class="fld">Categoria<input id="cfCat" list="cfCats" value="${esc(x.categoria)}" placeholder="Ex.: Tranças soltas"><datalist id="cfCats">${cats.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></label></div>
   <div class="f2"><label class="fld">Duração na agenda${durCampo('cfDur',S.servicos.get(x.servicoId)?.duracao||duracaoDoTempo(x.tempo)||'')}</label>
    <label class="fld">Vincular a um serviço já cadastrado<select id="cfServ">${optServ(x.servicoId,{preco:false,vazio:'Criar automaticamente'})}</select></label></div>
   <p class="small muted" style="margin:-4px 0 0">Este modelo vira um serviço da agenda e aparece para escolha no contrato. Nome, duração e preço ficam sincronizados.</p>
   <label class="fld">Descrição<textarea id="cfDesc" placeholder="Como fica, quanto dura, para quem é indicado">${esc(x.descricao)}</textarea></label>
   <div class="f2"><label class="fld">Cuidados depois da trança <small class="muted">(aparece no espaço da cliente)</small><textarea id="cfCuid" placeholder="${esc(CUIDADOS_PADRAO)}">${esc(x.cuidados)}</textarea></label><label class="fld">Manutenção recomendada (semanas)<input id="cfManut" type="number" min="1" max="20" value="${esc(x.manutSem??'')}" placeholder="Ex.: 6"></label></div>
   <div class="f2"><label class="fld">Preço a partir de (R$, opcional)<input id="cfPreco" type="number" step="0.01" min="0" value="${esc(x.preco??'')}"></label><label class="check" style="align-self:end"><input type="checkbox" id="cfMostra" ${x.mostrarPreco?'checked':''}>Mostrar o preço às clientes</label></div>
   <div class="card" style="box-shadow:none;background:var(--surface-2);border:0"><h3 style="margin-bottom:8px"><span class="row" style="gap:8px">${ic('lock')}Botão do modelo</span><small>só a proprietária altera</small></h3>
    <div class="f2"><label class="fld">Texto do botão<input id="cfBotao" value="${esc(x.botao||'Quero este modelo')}"></label><label class="fld">Link do botão<input id="cfLink" type="text" inputmode="url" autocapitalize="off" spellcheck="false" value="${esc(x.link)}" placeholder="https://wa.me/55..."></label></div>
    <p class="small muted" style="margin:6px 0 0">Sem link, o botão abre o WhatsApp do ateliê com o nome do modelo na mensagem. A cliente vê só o botão, nunca o endereço.</p></div>
   <label class="check"><input type="checkbox" id="cfAtivo" ${x.ativo!==false?'checked':''}>Visível no catálogo</label>
   <div class="form-actions">${!novo?`<button type="button" class="btn danger ghost" id="cfDel">${ic('trash')}Excluir</button>`:''}<button class="btn primary" type="submit">${ic('check')}Salvar</button></div></form>`);
  const desenha=()=>{$('#cfFotos').innerHTML=fotos.length?fotos.map((f,i)=>`<div class="cf-item">${f.data?`<img src="${f.data}" alt="">`:fotoImg(f.id,'','')}<div class="cf-acoes">${i>0?`<button type="button" class="icon-btn" data-mv="${i}" aria-label="Mover para a esquerda">${ic('left')}</button>`:'<span class="badge">capa</span>'}<button type="button" class="icon-btn" data-rm="${i}" aria-label="Remover foto">${ic('x')}</button></div></div>`).join(''):'<div class="small muted">Nenhuma foto ainda.</div>';carregaFotos()};
  desenha();
  $('#cfFotos').onclick=e=>{const mv=e.target.closest('[data-mv]'),rm=e.target.closest('[data-rm]');
    if(mv){const i=+mv.dataset.mv;[fotos[i-1],fotos[i]]=[fotos[i],fotos[i-1]];desenha()}
    if(rm){const [f]=fotos.splice(+rm.dataset.rm,1);if(f.id)removidas.push(f.id);desenha()}};
  $('#cfFile').onchange=async e=>{const fs=[...e.target.files].slice(0,Math.max(0,6-fotos.length));if(!fs.length){toast('Limite de 6 fotos por modelo.','erro');return}
    toast('Preparando fotos…');for(const f of fs){try{fotos.push({data:await comprimeFoto(f)})}catch(err){toast('Não foi possível ler uma das fotos. Use JPG ou PNG.','erro')}}desenha();e.target.value=''};
  $('#cfServ').onchange=e=>{const s=S.servicos.get(e.target.value);if(!s)return;if(!$('#cfTempo').value)$('#cfTempo').value=`cerca de ${durTxt(s.duracao)}`;setDur('cfDur',s.duracao);if(!$('#cfPreco').value&&s.preco)$('#cfPreco').value=s.preco;if(!$('#cfNome').value)$('#cfNome').value=s.nome};
  $('#cfTempo').addEventListener('change',()=>{const d=duracaoDoTempo($('#cfTempo').value);if(d&&!+$('#cfDur').value)setDur('cfDur',d)});
  if(!novo)$('#cfDel').onclick=()=>confirmar('Excluir este modelo e as fotos dele?',async()=>{for(const f of x.fotos||[])deleteDoc(doc(FS,'catalogoFotos',f)).catch(()=>{});await del('catalogo',id);toast('Modelo excluído')});
  $('#fCat').onsubmit=async e=>{e.preventDefault();const bt=$('#fCat button[type=submit]');bt.disabled=true;
    let link=$('#cfLink').value.trim();if(link&&!/^https?:\/\//i.test(link))link='https://'+link;
    if(link&&!/^https:\/\//i.test(link)){toast('Use um link que comece com https://','erro');bt.disabled=false;return}
    try{const ids=[];for(const f of fotos){if(f.id){ids.push(f.id);continue}const fid=uid();await setDoc(doc(FS,'catalogoFotos',fid),{itemId:id,data:f.data,criadoEm:nowIso()});FOTOS.set(fid,f.data);ids.push(fid)}
      removidas.forEach(f=>deleteDoc(doc(FS,'catalogoFotos',f)).catch(()=>{}));
      const nomeM=$('#cfNome').value.trim();if(!nomeM){toast('Informe o nome do serviço.','erro');bt.disabled=false;return}
      const sidM=await servicoDoModelo({...x,id},{nome:nomeM,preco:+$('#cfPreco').value||0,duracao:+$('#cfDur').value||duracaoDoTempo($('#cfTempo').value),servicoId:$('#cfServ').value});
      await save('catalogo',id,{...x,nome:nomeM,tempo:$('#cfTempo').value.trim(),categoria:$('#cfCat').value.trim(),servicoId:sidM,descricao:$('#cfDesc').value.trim(),cuidados:$('#cfCuid').value.trim(),manutSem:+$('#cfManut').value||0,preco:+$('#cfPreco').value||0,mostrarPreco:$('#cfMostra').checked,botao:$('#cfBotao').value.trim()||'Quero este modelo',link,ativo:$('#cfAtivo').checked,fotos:ids});
      salvarVitrine();closeSheet();toast('Modelo salvo')}catch(err){bt.disabled=false;dbErr(err)}};
}

/* ---------- contrato por link ---------- */
const linkExpirado=l=>l.status!=='aceito'&&toMs(l.expiraEm)&&toMs(l.expiraEm)<Date.now();
const linkStatus=l=>l.status==='aceito'?'aceito':linkExpirado(l)?'expirado':'pendente';
const LINK_BADGE={aceito:['good','contrato aceito'],pendente:['warn','aguardando aceite'],expirado:['bad','link expirado']};
function contratoDoAg(agId){return arr('contratosLink').filter(l=>l.agendaId===agId).sort((a,b)=>a.criadoEm<b.criadoEm?1:-1)[0]}
function contratoTag(a){const l=contratoDoAg(a.id);if(!l)return '';const [cl,tx]=LINK_BADGE[linkStatus(l)];return `<button class="badge ${cl}" data-act="verLink" data-id="${l.id}">${ic('file')}${tx}</button>`}
function ctLinks(){const L=arr('contratosLink').sort((a,b)=>a.criadoEm<b.criadoEm?1:-1);const P=pol();
  return `<section class="card"><h3>Contrato antes do pagamento</h3><ol class="passos"><li><b>Gere o link</b> com os dados da cliente e do atendimento.</li><li><b>A cliente lê e aceita</b>: assina com o dedo ou marca "Li e concordo", e pode baixar o PDF.</li><li><b>Você recebe o aviso</b> e envia o link de pagamento do sinal pelo banco.</li></ol>
   ${P.pend?`<div class="alert warn">${ic('alert')}<div>${P.pend} itens da política ainda não foram revisados. Eles entram no contrato do jeito que estão. <button class="btn sm ghost" data-act="ctTab" data-t="politica">Revisar</button></div></div>`:''}
   <button class="btn primary" data-act="linkContrato">${ic('file')}Gerar link de contrato</button></section>
   <section class="card" style="padding:8px 14px"><h3 style="padding:8px 4px 0">Links enviados <small>últimos 120 dias</small></h3>${L.length?`<div class="list">${L.map(l=>{const st=linkStatus(l);const [cl,tx]=LINK_BADGE[st];return `<button class="item" data-act="verLink" data-id="${l.id}"><div class="avatar">${iniciais(l.nome)}</div><div class="grow"><div class="t">${esc(l.nome)}</div><div class="s">${esc(l.servico||'Contrato de serviço')}${l.data?` · ${dataBR(l.data)} ${esc(l.hora||'')}`:''} · enviado ${dataBR(String(l.criadoEm).slice(0,10))}</div></div><span class="badge ${cl}">${tx}</span></button>`}).join('')}</div>`:'<div class="empty">Nenhum link enviado ainda.</div>'}</section>`}
function optServCat(){const cat=new Set(arr('catalogo').map(c=>c.servicoId).filter(Boolean));const sv=arr('servicos').sort((a,b)=>a.nome.localeCompare(b.nome));
  const op=s=>`<option value="${s.id}">${esc(s.nome)} · ${BRL(s.preco)}</option>`;const a=sv.filter(s=>cat.has(s.id)),b=sv.filter(s=>!cat.has(s.id));
  return `<option value="">Selecione…</option>${a.length?`<optgroup label="Catálogo">${a.map(op).join('')}</optgroup>`:''}${b.length?`<optgroup label="${a.length?'Outros serviços':'Serviços'}">${b.map(op).join('')}</optgroup>`:''}`}
function formLinkContrato(pre={}){
  const futuros=cid=>arr('agenda').filter(a=>a.clienteId===cid&&a.data>=today()&&(a.status==='agendado'||a.status==='confirmado')).sort((a,b)=>(a.data+a.hora)<(b.data+b.hora)?-1:1);
  sheet('Enviar contrato por link',`<form class="form" id="fLk">
   <label class="fld">Cliente<select id="lkCli">${optCli(pre.c||'','<option value="__nova">+ Nova cliente</option>')}</select></label>
   <div class="f2" id="lkNova" hidden><label class="fld">Nome completo<input id="lkNome"></label><label class="fld">WhatsApp<input id="lkTel" inputmode="tel"></label></div>
   <label class="fld">CPF da cliente (aparece no contrato)<input id="lkCpf" inputmode="numeric" placeholder="000.000.000-00"></label>
   <label class="fld">Atendimento<select id="lkAg"></select></label>
   ${S.servicos.size?'':`<div class="alert warn">${ic('alert')}<div>Nenhum serviço cadastrado ainda. Digite o nome do serviço abaixo${pode('precos')?` ou <button type="button" class="btn sm ghost" data-act="servSug">adicione os serviços sugeridos</button>`:''}.</div></div>`}
   <div class="f2" id="lkManual"><label class="fld">Serviço<select id="lkServ">${optServCat()}<option value="__outro">Outro: digitar o nome</option></select></label><label class="fld" id="lkOutroBox" hidden>Nome do serviço<input id="lkOutro" placeholder="Ex.: Box braids longas"></label><label class="fld" id="lkDurBox" hidden>Duração${durCampo('lkDur',180)}</label><label class="fld">Data<input id="lkData" type="date"></label><label class="fld">Hora<input id="lkHora" type="time"></label><label class="fld">Valor (R$)<input id="lkVal" type="number" step="0.01" min="0"></label></div>
   <label class="fld">O link vale por<select id="lkDias"><option value="3">3 dias</option><option value="7" selected>7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option></select></label>
   <div class="form-actions"><button class="btn primary" type="submit">${ic('file')}Gerar link</button></div></form>`);
  const sel=$('#lkCli'),ag=$('#lkAg');
  const up=()=>{const cid=sel.value;$('#lkNova').hidden=cid!=='__nova';const c=S.clientes.get(cid);$('#lkCpf').value=c?.cpf||'';
    const fs=c?futuros(c.id):[];ag.innerHTML=fs.map(a=>`<option value="${a.id}" ${a.id===pre.a?'selected':''}>${dataBR(a.data)} ${esc(a.hora)} · ${esc(nomeAg(a))}${a.pacoteId?'':` · ${BRL(a.valor)}`}</option>`).join('')+'<option value="">Ainda não marcado: informar abaixo</option>';
    if(pre.a&&fs.some(a=>a.id===pre.a))ag.value=pre.a;upAg()};
  const upAg=()=>{$('#lkManual').hidden=!!ag.value};
  sel.onchange=up;ag.onchange=upAg;
  const upServ=()=>{const v=$('#lkServ').value;$('#lkOutroBox').hidden=$('#lkDurBox').hidden=v!=='__outro';const s=S.servicos.get(v);if(s)$('#lkVal').value=s.preco};
  $('#lkServ').onchange=upServ;if(!S.servicos.size){$('#lkServ').value='__outro'}up();upServ();
  $('#fLk').onsubmit=async e=>{e.preventDefault();let cid=sel.value;const bt=$('#fLk button[type=submit]');
    if(cid==='__nova'){const n=$('#lkNome').value.trim();if(!n){toast('Informe o nome da cliente.','erro');return}cid=await save('clientes',null,{nome:n,telefone:$('#lkTel').value.trim(),cpf:$('#lkCpf').value.trim(),criadoEm:today()})}
    if(!cid){toast('Escolha a cliente.','erro');return}
    let cli=S.clientes.get(cid);const cpf=$('#lkCpf').value.trim();if(cpf&&cpf!==cli.cpf){await save('clientes',cid,{...cli,cpf});cli=S.clientes.get(cid)}
    let a=ag.value?S.agenda.get(ag.value):null;
    if(!a){const sid=$('#lkServ').value;const outro=$('#lkOutro').value.trim();if(!sid||(sid==='__outro'&&!outro)){toast('Escolha ou digite o serviço do contrato.','erro');return}
      const s=S.servicos.get(sid);a={servicoId:s?sid:'',servicoNome:s?s.nome:outro,data:$('#lkData').value,hora:$('#lkHora').value,duracao:s?.duracao||+$('#lkDur').value||120,valor:+$('#lkVal').value||0}}
    bt.disabled=true;
    const html=semRevisao(docServico(cli,a));const texto=htmlParaTexto(html);const pb=pub();
    const token=gerarToken();const ptok=await portalCriar(cid,false,true);
    saveRaw('contratosLink',token,{tipo:'servico',clienteId:cid,agendaId:a.id||'',nome:cli.nome,cpf:cli.cpf||'',telefone:cli.telefone||'',servico:nomeAg(a),data:a.data||'',hora:a.hora||'',valor:+a.valor||0,html,texto,versao:pol().versao||0,hash:await hashTexto(texto),status:'pendente',criadoEm:nowIso(),criadoPor:ME||'',expiraEm:Timestamp.fromDate(new Date(Date.now()+(+$('#lkDias').value||7)*864e5)),portalToken:ptok||'',atelie:{nome:pb.nome,responsavel:pb.responsavel,whatsapp:pb.whatsapp}});
    closeSheet(true);verLinkContrato(token)};
}
function msgLink(l){const pb=pub();return `Oi, ${primeiro(l.nome)}! 💕 Antes de confirmar seu horário de ${l.servico}${l.data?` em ${dataBR(l.data)}${l.hora?` às ${l.hora}`:''}`:''}, leia o contrato e confirme por este link:\n${urlPublica('contrato',l.id)}\n\nAssim que você aceitar, eu te envio o link de pagamento do sinal para garantir o horário. Beijos, ${primeiro(pb.responsavel)}`}
function verLinkContrato(id){const l=S.contratosLink.get(id);if(!l){toast('Link não encontrado.','erro');return}const st=linkStatus(l);const [cl,tx]=LINK_BADGE[st];const url=urlPublica('contrato',id);const ac=l.aceite||{};
  const w=waLink(l.telefone,msgLink(l));const wPg=waLink(l.telefone,`Oi, ${primeiro(l.nome)}! Recebi o seu aceite do contrato, obrigada 💕 Segue o link para o pagamento do sinal: `);
  sheet('Contrato por link',`<div class="stack"><div class="row between"><div><b>${esc(l.nome)}</b><div class="small muted">${esc(l.servico)}${l.data?` · ${dataBR(l.data)} ${esc(l.hora||'')}`:''}${l.valor?` · ${BRL(l.valor)}`:''}</div></div><span class="badge ${cl}">${tx}</span></div>
   ${st==='aceito'?`<div class="alert info">${ic('check')}<div><b>Aceito em ${new Date(toMs(ac.em)).toLocaleString('pt-BR')}</b> por ${esc(ac.nome||'')}${ac.cpf?` (CPF ${esc(ac.cpf)})`:''}, ${ac.meio==='assinatura'?'com assinatura':'marcando "Li e concordo"'}. Agora envie o link de pagamento do sinal.</div></div>${wPg?`<a class="btn primary" href="${wPg}" target="_blank" rel="noopener">${ic('chat')}Enviar link de pagamento no WhatsApp</a>`:''}`
     :st==='expirado'?`<div class="alert warn">${ic('alert')}<div>O link expirou em ${new Date(toMs(l.expiraEm)).toLocaleDateString('pt-BR')} sem aceite. Gere um novo.</div></div><button class="btn primary" data-act="linkContrato" data-c="${l.clienteId}" data-a="${l.agendaId}">${ic('file')}Gerar novo link</button>`
     :`<div class="small muted">Vale até ${new Date(toMs(l.expiraEm)).toLocaleDateString('pt-BR')}. Você recebe um aviso aqui quando ela aceitar.</div>`}
   <label class="fld">Link do contrato<input readonly value="${esc(url)}" onclick="this.select()"></label>
   <div class="row">${st==='pendente'&&w?`<a class="btn primary" href="${w}" target="_blank" rel="noopener">${ic('chat')}Enviar no WhatsApp</a>`:''}<button class="btn soft" id="lkCopy">${ic('copy')}Copiar link</button><a class="btn ghost" href="${url}" target="_blank" rel="noopener">${ic('right')}Abrir</a>${st==='aceito'&&S.aceites.has('link-'+id)?`<button class="btn ghost" data-act="verAceite" data-id="link-${id}">${ic('file')}Ver registro</button>`:''}${st!=='aceito'&&isOwner()?`<button class="btn ghost danger" data-act="cancelarLink" data-id="${id}">${ic('trash')}Cancelar link</button>`:''}</div></div>`);
  $('#lkCopy').onclick=()=>copiar(st==='pendente'?msgLink(l):url,st==='pendente'?'Mensagem com o link copiada':'Link copiado')}

/* ---------- espaço da cliente ---------- */
function termoAnamnese(){return memo('termoAn',()=>{const h=docAnamnese({},null);const i=h.indexOf('<h2>Declaração');const j=h.indexOf('<h2>Uso de imagem');return i<0?'':htmlParaTexto(h.slice(i,j>i?j:undefined)).trim()})}
async function processarAnamnesesPortal(){if(!pode('anamnese'))return;for(const x of arr('anamnesePortal').filter(q=>!q.processado)){
  const c=arr('clientes').find(k=>k.portalToken===x.id);let resultado='sem-cliente';
  if(c){const an=anamDe(c.id)||{};const respostas={};ANAM_Q.forEach(([k])=>{const r=(x.respostas||{})[k]||{};respostas[k]={sim:!!r.sim,det:r.sim?String(r.det||'').slice(0,300):''}});
    const hist=[...(an.historico||[])];if(an.atualizadaEm)hist.unshift({atualizadaEm:an.atualizadaEm,respostas:an.respostas,obs:an.obs});
    const quando=new Date(toMs(x.em)||Date.now()).toISOString();const resp=x.responsavel||{};
    const d={clienteId:c.id,respostas,obs:an.obs||'',menor:!!x.menor,responsavel:{nome:String(resp.nome||''),cpf:String(resp.cpf||''),parentesco:String(resp.parentesco||'')},imagem:!!x.imagem,atualizadaEm:quando,historico:hist.slice(0,5),origem:'cliente'};
    await save('anamneses',c.id,d,{quiet:true});
    const texto=htmlParaTexto(docAnamnese(c,d));
    await save('aceites',null,{tipo:'anamnese',clienteId:c.id,agendaId:'',versao:pol().versao||'',texto,hash:await hashTexto(texto),nomeAssinante:String(x.nome||''),cpf:String(x.cpf||''),meio:'Preenchida pela cliente no espaço dela',aceitoEm:quando,registradoPor:'cliente',assinatura:'',dispositivo:String(x.dispositivo||'')},{quiet:true});
    await save('clientes',c.id,{...c,anamneseEm:quando.slice(0,10)},{quiet:true});resultado='importado'}
  await updateDoc(doc(FS,'anamnesePortal',x.id),{processado:true,resultado,clienteId:c?c.id:'',visto:false,processadoEm:nowIso()}).catch(()=>{});S.anamnesePortal.set(x.id,{...x,processado:true,resultado,clienteId:c?c.id:'',visto:false})}}
function portalBloco(c){const t=c.portalToken;
  if(!t)return `<div class="alert info">${ic('users')}<div><b>Espaço da cliente:</b> por um link pessoal, ela acompanha o nível, os atendimentos e os contratos, e cancela dentro do prazo. <button class="btn sm soft" data-act="portalCriar" data-id="${c.id}">Criar acesso</button></div></div>`;
  const pb=pub();const w=waLink(c.telefone,`Oi, ${primeiro(c.nome)}! 💕 Este é o seu espaço no ateliê: lá você vê seu nível de fidelidade, seus horários e contratos. O link é pessoal, não compartilhe:\n${urlPublica('cliente',t)}\n\nBeijos, ${primeiro(pb.responsavel)}`);
  return `<div class="portal-box"><div class="row between"><b>${ic('users')}Espaço da cliente</b><span class="badge good">ativo</span></div><p class="small muted" style="margin:4px 0 10px">Link pessoal: quem tiver o link vê os dados desta cliente. Se vazar, gere um novo.</p>
   <div class="row">${w?`<a class="btn sm primary" href="${w}" target="_blank" rel="noopener">${ic('chat')}Enviar</a>`:''}<button class="btn sm soft" data-act="portalCopiar" data-id="${c.id}">${ic('copy')}Copiar link</button><a class="btn sm ghost" href="${urlPublica('cliente',t)}" target="_blank" rel="noopener">${ic('right')}Abrir</a><button class="btn sm ghost" data-act="portalNovo" data-id="${c.id}">${ic('repeat')}Novo link</button>${pode('anamnese')?(()=>{const wa2=waLink(c.telefone,`Oi, ${primeiro(c.nome)}! 💕 Antes do seu atendimento, preencha a sua ficha de saúde (anamnese) no seu espaço, leva 2 minutinhos:\n${urlPublica('cliente',t)}\n\nBeijos, ${primeiro(pb.responsavel)}`);return wa2?`<a class="btn sm soft" href="${wa2}" target="_blank" rel="noopener">${ic('shield')}Pedir anamnese</a>`:''})():''}</div></div>`}
async function portalCriar(cid,novo=false,silencioso=false){const c=S.clientes.get(cid);if(!c)return '';if(c.portalToken&&!novo)return c.portalToken;
  if(novo&&c.portalToken){const old=c.portalToken;Object.keys((c.portalSync&&c.portalSync.prox)||{}).forEach(a=>deleteDoc(doc(FS,'portal',old,'proximos',a)).catch(()=>{}));deleteDoc(doc(FS,'portal',old)).catch(()=>{})}
  const t=gerarToken();await save('clientes',cid,{...c,portalToken:t,portalSync:null});agendaProcessar();
  if(!silencioso){toast(novo?'Novo link criado. O anterior parou de funcionar.':'Acesso da cliente criado');abrirCliente(cid)}return t}
function proximoNivel(score,nivel){if(nivel==='nova')return {nome:'Bronze',faltam:0,texto:'Depois do primeiro atendimento você ganha seu nível.'};
  const alvo=[['Prata',25],['Ouro Rosé',50],['Pérola',75]].find(([,m])=>m>score);return alvo?{nome:alvo[0],faltam:alvo[1]-score}:null}
function portalSnapshot(c,P,pb){const f=fidelidade(c);const nv=NIVEIS[f.nivel];const t=today();
  const concl=(agPorCli().get(c.id)||[]).filter(a=>(a.status==='concluido'||a.status==='faltou')&&a.data<=t).sort((a,b)=>(a.data+a.hora)<(b.data+b.hora)?1:-1);
  const avaliado=a=>S.avaliacoes.has(`${c.portalToken}_${a.id}`);const lim60=addDays(t,-60);
  const avaliaveis=concl.filter(a=>a.status==='concluido'&&a.data>=lim60&&!avaliado(a)).map(a=>a.id);
  const ultimos=concl.slice(0,6).map(a=>({id:a.id,data:a.data,servico:nomeAg(a),status:a.status,pacote:!!a.pacoteId,avaliar:avaliaveis.includes(a.id)}));
  const ua=concl.find(a=>a.status==='concluido');let cuidados=null;
  if(ua&&ua.data>=addDays(t,-150)){const m=manutDe(ua.servicoId);const cat=catDoServ(ua.servicoId);cuidados={servico:nomeAg(ua),data:ua.data,texto:(cat&&cat.cuidados)||CUIDADOS_PADRAO,semanas:m,manutAte:addDays(ua.data,m*7),temFuturo:(agPorCli().get(c.id)||[]).some(a=>a.data>=t&&(a.status==='agendado'||a.status==='confirmado'))}}
  const indicacao={codigo:c.indicacaoCodigo||'',indicadas:indPorCli().get(c.id)||0,beneficio:pb.indBenef||IND_PADRAO[0],beneficioNova:pb.indBenefNova||IND_PADRAO[1]};
  const contratos=[];const vistos=new Set();
  daCliente('contratosLink',c.id).sort((a,b)=>a.criadoEm<b.criadoEm?1:-1).forEach(l=>{vistos.add(l.id);contratos.push({token:l.id,servico:l.servico||'',data:l.data||'',status:linkStatus(l),criadoEm:String(l.criadoEm).slice(0,10)})});
  daCliente('aceites',c.id).filter(a=>a.tipo==='servico'&&!vistos.has(a.linkToken)).forEach(a=>contratos.push({token:a.linkToken||'',servico:'Contrato de serviço',data:'',status:'aceito',criadoEm:String(a.aceitoEm).slice(0,10),presencial:!a.linkToken}));
  const pacotes=daCliente('pacotes',c.id).filter(p=>pacoteAtivo(p)).map(p=>({nome:p.nome,saldo:pacoteSaldo(p),validade:p.validade||''}));
  const main={v:1,nome:c.nome,nivel:{chave:f.nivel,nome:nv.n,score:f.score,beneficio:nv.b,prox:proximoNivel(f.score,f.nivel)},visitas:f.visitas,
    cadastro:{nome:c.nome,telefone:c.telefone||'',instagram:c.instagram||'',aniversario:c.aniversario?dataCurta(c.aniversario):'',cpf:mascaraCpf(c.cpf)},
    ultimos,avaliaveis,cuidados,indicacao,contratos:contratos.slice(0,12),pacotes,anamnese:{perguntas:ANAM_Q.map(([k,q])=>({k,q})),termo:termoAnamnese(),em:c.anamneseEm||''},
    regras:{prazoCancel:+P.campos.prazoCancel||48,tolerancia:+P.campos.tolerancia||0,sinalCancel:String(P.campos.sinalCancel||''),falta:String(P.campos.falta||''),preparo:String(P.campos.preparo||'')},
    atelie:{nome:pb.nome,responsavel:pb.responsavel,whatsapp:pb.whatsapp||'',instagram:pb.instagram||'',endereco:pb.endereco||'',municipio:pb.municipio||''}};
  const prazo=(+P.campos.prazoCancel||48)*3600e3;const pend=new Set(arr('solicitacoes').filter(q=>!q.processado).map(q=>q.agendaId));const prox={};
  (agPorCli().get(c.id)||[]).filter(a=>a.data>=t&&(a.status==='agendado'||a.status==='confirmado'||(a.status==='cancelado'&&a.canceladoPor==='cliente'))).forEach(a=>{
    const [y,m,d]=a.data.split('-').map(Number);const [hh,mm]=String(a.hora||'00:00').split(':').map(Number);const ini=new Date(y,m-1,d,hh||0,mm||0).getTime();
    const sinal=soma((a.pagamentos||[]).filter(p=>p.tipo==='sinal'));
    const o={data:a.data,hora:a.hora||'',servico:nomeAg(a),duracao:+a.duracao||0,status:a.status,pacote:!!a.pacoteId,sinal,limiteMs:ini-prazo};
    if(a.status==='cancelado')o.cancelado=true;else if(!pend.has(a.id))o.cancelado=false;
    prox[a.id]=o});
  return {main,prox}}
/* Durante a sincronização dos espaços das clientes, contratos, aceites e pacotes ficam agrupados por cliente
   (uma passada em cada coleção, e não uma por cliente). Fora dela, filtra na hora. */
let GRUPOS=null;
const daCliente=(col,cid)=>GRUPOS?(GRUPOS[col].get(cid)||[]):arr(col).filter(x=>x.clienteId===cid);
function agruparPorCliente(){GRUPOS={};['contratosLink','aceites','pacotes'].forEach(col=>{const m=new Map();arr(col).forEach(x=>{if(!m.has(x.clienteId))m.set(x.clienteId,[]);m.get(x.clienteId).push(x)});GRUPOS[col]=m})}
async function sincronizarPortais(){try{agruparPorCliente();await sincronizarPortais2()}finally{GRUPOS=null}}
async function sincronizarPortais2(){const P=pol(),pb=pub();
  for(const c of arr('clientes').filter(x=>x.portalToken&&!x.indicacaoCodigo))await save('clientes',c.id,{...c,indicacaoCodigo:novoCodigoInd(c)},{quiet:true});
  for(const c of arr('clientes').filter(x=>x.portalToken)){const {main,prox}=portalSnapshot(c,P,pb);const h=hashStr(JSON.stringify(main));const sync=c.portalSync||{};const old=sync.prox||{};let mudou=false;const novoProx={};
    if(sync.h!==h){await setDoc(doc(FS,'portal',c.portalToken),{...main,atualizadoEm:nowIso()});mudou=true}
    for(const [agId,d] of Object.entries(prox)){const hh=hashStr(JSON.stringify(d));novoProx[agId]=hh;if(old[agId]===hh)continue;
      const dados={...d,limiteCancelamento:Timestamp.fromMillis(d.limiteMs)};delete dados.limiteMs;if(!(agId in old)&&dados.cancelado===undefined)dados.cancelado=false;
      await setDoc(doc(FS,'portal',c.portalToken,'proximos',agId),dados,{merge:true});mudou=true}
    for(const agId of Object.keys(old))if(!(agId in prox)){await deleteDoc(doc(FS,'portal',c.portalToken,'proximos',agId)).catch(()=>{});mudou=true}
    if(mudou)await save('clientes',c.id,{...S.clientes.get(c.id),portalSync:{h,prox:novoProx}},{quiet:true})}}
async function registrarContratos(){for(const l of arr('contratosLink').filter(x=>x.status==='aceito'&&!x.registrado)){const ac=l.aceite||{};const em=toMs(ac.em)||Date.now();
  await save('aceites','link-'+l.id,{tipo:'servico',clienteId:l.clienteId,agendaId:l.agendaId||'',versao:l.versao||0,texto:l.texto||'',hash:l.hash||'',nomeAssinante:ac.nome||l.nome,cpf:ac.cpf||'',meio:ac.meio==='assinatura'?'Assinatura pelo link':'Aceite pelo link ("Li e concordo")',aceitoEm:new Date(em).toISOString(),registradoPor:'link',assinatura:ac.assinatura||'',linkToken:l.id,dispositivo:String(ac.dispositivo||'').slice(0,200)},{quiet:true});
  await updateDoc(doc(FS,'contratosLink',l.id),{registrado:true}).catch(()=>{});S.contratosLink.set(l.id,{...l,registrado:true});
  const c=S.clientes.get(l.clienteId);if(c&&!c.cpf&&ac.cpf)await save('clientes',c.id,{...c,cpf:ac.cpf},{quiet:true})}}
async function processarSolicitacoes(){for(const q of arr('solicitacoes').filter(x=>!x.processado)){const a=S.agenda.get(q.agendaId);const c=a&&S.clientes.get(a.clienteId);let resultado='ignorado';
  if(a&&c&&c.portalToken===q.token&&(a.status==='agendado'||a.status==='confirmado')){const quando=new Date(toMs(q.criadoEm)||Date.now());
    await save('agenda',a.id,{...a,status:'cancelado',canceladoPor:'cliente',canceladoEm:quando.toISOString(),obs:[a.obs,`Cancelado pela cliente no espaço dela em ${quando.toLocaleString('pt-BR')}${q.motivo?`. Motivo: ${q.motivo}`:''}`].filter(Boolean).join(' · ')},{quiet:true});resultado='cancelado'}
  await updateDoc(doc(FS,'solicitacoes',q.id),{processado:true,resultado,processadoEm:nowIso()}).catch(()=>{});S.solicitacoes.set(q.id,{...q,processado:true,resultado})}}
let procT=0,processando=false;
function agendaProcessar(){clearTimeout(procT);procT=setTimeout(processar,1500)}
async function processar(){if(processando||!FS||!pode('portal')||[...NEED].some(c=>!loaded.has(c))||navigator.onLine===false)return;processando=true;
  try{await registrarContratos()}catch(e){console.error(e)}
  try{await processarSolicitacoes()}catch(e){console.error(e)}
  try{await processarAnamnesesPortal()}catch(e){console.error('anamnese',e)}
  try{await sincronizarPortais()}catch(e){console.error('portal',e)}
  if(isOwner()&&!processar.vit){processar.vit=true;salvarVitrine();try{await sincronizarCatalogo()}catch(e){console.error('catalogo',e)}}
  processando=false}
let VEZ=0;const AVP={vez:-1,html:''};
function avisosPortal(){if(AVP.vez===VEZ)return AVP.html;AVP.vez=VEZ;return AVP.html=avisosPortal2()}
function avisosPortal2(){if(!pode('portal'))return '';const lim=Date.now()-14*864e5;
  const canc=arr('solicitacoes').filter(q=>q.processado&&q.resultado==='cancelado'&&!q.visto&&toMs(q.criadoEm)>lim);
  const acc=arr('contratosLink').filter(l=>l.status==='aceito'&&!l.visto);const cads=pode('base')?avisosCadastro():[];
  const ans=pode('anamnese')?arr('anamnesePortal').filter(x=>x.processado&&x.resultado==='importado'&&!x.visto).map(x=>{const c=S.clientes.get(x.clienteId);const al=anamAlertas(anamDe(x.clienteId));
    return `<div class="item"><div class="avatar" style="--lv:${al.length?'var(--lv-bronze)':'var(--lv-nova)'}">${ic('shield')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(primeiro(c?.nome||'Cliente'))} preencheu a ficha de anamnese</div><div class="s" style="white-space:normal">${al.length?`atenção: ${esc(al.map(z=>z.k).join(', '))}`:'nenhum ponto de atenção marcado'} · consentimento registrado</div></div><button class="btn sm soft" data-act="anamnese" data-id="${x.clienteId}">Ver ficha</button><button class="btn sm ghost" data-act="avisoVisto" data-k="anam" data-id="${x.id}">Ok</button></div>`}):[];
  cads.push(...ans);if(pode('base'))cads.push(...avisosAvaliacao(),...avisosIndicacao());
  if(!canc.length&&!acc.length&&!cads.length)return '';
  const rows=[...canc.map(q=>{const a=S.agenda.get(q.agendaId);const sinal=a?soma((a.pagamentos||[]).filter(p=>p.tipo==='sinal')):0;
      return `<div class="item"><div class="avatar" style="--lv:var(--lv-bronze)">${ic('x')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(primeiro(nomeCli(a?.clienteId)))} cancelou ${a?`${esc(nomeAg(a))} de ${dataCurta(a.data)} às ${esc(a.hora)}`:'um atendimento'}</div><div class="s" style="white-space:normal">pelo espaço da cliente, dentro do prazo${sinal?` · sinal de ${BRL(sinal)}: veja o que a política define para cancelamento no prazo`:''}${q.motivo?` · "${esc(q.motivo)}"`:''}</div></div>${a?`<button class="btn sm soft" data-act="avisoEspera" data-id="${a.id}">${ic('list')}Lista de espera</button>`:''}<button class="btn sm ghost" data-act="avisoVisto" data-k="sol" data-id="${q.id}">Ok</button></div>`}),
    ...acc.map(l=>{const w=waLink(l.telefone,`Oi, ${primeiro(l.nome)}! Recebi o seu aceite do contrato, obrigada 💕 Segue o link para o pagamento do sinal: `);
      return `<div class="item"><div class="avatar" style="--lv:var(--lv-perola)">${ic('check')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(primeiro(l.nome))} aceitou o contrato</div><div class="s" style="white-space:normal">${esc(l.servico)}${l.data?` · ${dataCurta(l.data)} ${esc(l.hora||'')}`:''} · agora envie o link de pagamento do sinal</div></div>${w?`<a class="btn sm primary" href="${w}" target="_blank" rel="noopener">${ic('chat')}Pagamento</a>`:''}<button class="btn sm ghost" data-act="avisoVisto" data-k="link" data-id="${l.id}">Ok</button></div>`})];
  rows.push(...cads);return `<section class="card aviso-portal"><h3>Novidades das clientes <small>${rows.length}</small></h3><div class="list">${rows.join('')}</div></section>`}
async function avisoVisto(k,id){const col=k==='sol'?'solicitacoes':k==='anam'?'anamnesePortal':k==='aval'?'avaliacoes':'contratosLink';const x=S[col].get(id);if(x)S[col].set(id,{...x,visto:true});touch(col);updateDoc(doc(FS,col,id),{visto:true}).catch(dbErr)}


/* ---------- cadastro pela própria cliente ---------- */
const cadExpirado=x=>x.status==='convite'&&toMs(x.expiraEm)&&toMs(x.expiraEm)<Date.now();
function msgCadastro(x){const pb=pub();const n=primeiro(x.nome);return `Oi${n?`, ${n}`:''}! 💕 Para agilizar seu atendimento, preencha seu cadastro por este link (leva 1 minutinho):\n${urlPublica('cadastro',x.id)}\n\nBeijos, ${primeiro(pb.responsavel)}`}
function cadastrosBloco(){if(!pode('base'))return '';const rec=arr('cadastros').filter(x=>x.status==='enviado').sort((a,b)=>toMs(b.enviadoEm)-toMs(a.enviadoEm));
  const pend=arr('cadastros').filter(x=>x.status==='convite'&&!cadExpirado(x));
  if(!rec.length&&!pend.length)return '';
  return `<section class="card cad-box"><h3>Cadastros pelo link <small>${rec.length?`${rec.length} para revisar`:'nenhum para revisar'}${pend.length?` · ${pend.length} aguardando a cliente`:''}</small></h3>
   ${rec.length?`<div class="list">${rec.map(x=>{const d=x.dados||{};const m=cadMatch(x);return `<button class="item" data-act="cadVer" data-id="${x.id}"><div class="avatar" style="--lv:var(--lv-nova)">${iniciais(d.nome)}</div><div class="grow"><div class="t">${esc(d.nome)}</div><div class="s">${esc(d.telefone)}${m?` · já cadastrada como ${esc(m.nome)}`:' · nova cliente'} · enviado ${new Date(toMs(x.enviadoEm)).toLocaleDateString('pt-BR')}</div></div><span class="badge good">revisar</span></button>`}).join('')}</div>`:''}
   ${pend.length?`<details class="cad-pend"><summary class="small muted">Links enviados aguardando preenchimento (${pend.length})</summary><div class="list">${pend.map(x=>`<div class="item"><div class="avatar">${ic('send')}</div><div class="grow"><div class="t">${esc(x.nome||'Sem nome')}</div><div class="s">${esc(x.telefone||'sem telefone')} · vale até ${new Date(toMs(x.expiraEm)).toLocaleDateString('pt-BR')}</div></div><button class="btn sm ghost" data-act="cadMostrar" data-id="${x.id}">Link</button><button class="btn sm ghost danger" data-act="cadCancelar" data-id="${x.id}">${ic('x')}</button></div>`).join('')}</div></details>`:''}</section>`}
function cadMatch(x){if(x.clienteId&&S.clientes.has(x.clienteId))return S.clientes.get(x.clienteId);const d=(x.dados||{});const t=digits(d.telefone).slice(-8);const cpf=digits(d.cpf);
  return arr('clientes').find(c=>(t.length===8&&digits(c.telefone).slice(-8)===t)||(cpf.length===11&&digits(c.cpf)===cpf))||null}
function formCadLink(cid){const c=cid?S.clientes.get(cid):null;
  sheet(c?'Atualizar cadastro':'Link de cadastro',`<form class="form" id="fCad"><p class="small muted" style="margin:0">${c?`${esc(primeiro(c.nome))} recebe um link para conferir e completar os próprios dados. Você revisa antes de entrar na ficha.`:'A cliente preenche os próprios dados pelo link. Quando ela enviar, aparece em Clientes para você revisar e aprovar com um toque.'}</p>
   <div class="f2"><label class="fld">Nome (opcional)<input id="cdNome" value="${esc(c?.nome)}" autocomplete="off"></label><label class="fld">WhatsApp (opcional)<input id="cdTel" inputmode="tel" placeholder="(27) 99999-9999" value="${esc(c?.telefone)}"></label></div>
   <label class="fld">Validade<select id="cdDias"><option value="3">3 dias</option><option value="7" selected>7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option></select></label>
   <div class="form-actions"><button class="btn primary">${ic('send')}Gerar link</button></div></form>`);
  $('#fCad').onsubmit=async e=>{e.preventDefault();const id=gerarToken();const pb=pub();const dias=+$('#cdDias').value||7;
    const x={status:'convite',nome:$('#cdNome').value.trim(),telefone:$('#cdTel').value.trim(),clienteId:c?c.id:'',criadoEm:today(),criadoPor:ME||'',
      expiraEm:Timestamp.fromMillis(Date.now()+dias*864e5),atelie:{nome:pb.nome,responsavel:pb.responsavel,whatsapp:pb.whatsapp,instagram:pb.instagram||''},
      origens:ORIGENS,previo:c?{cpf:c.cpf||'',instagram:c.instagram||'',aniversario:c.aniversario||'',cabelo:c.cabelo||''}:null};
    saveRaw('cadastros',id,x);closeSheet();setTimeout(()=>cadMostrar(id),250)}}
function cadMostrar(id){const x=S.cadastros.get(id);if(!x)return;const url=urlPublica('cadastro',id);const w=waLink(x.telefone,msgCadastro(x));
  sheet('Link de cadastro',`<div class="stack"><div class="small muted">${esc(x.nome||'Cliente')} · vale até ${new Date(toMs(x.expiraEm)).toLocaleDateString('pt-BR')}</div>
   <label class="fld">Link<input readonly value="${esc(url)}" onclick="this.select()"></label>
   <div class="row">${w?`<a class="btn primary" href="${w}" target="_blank" rel="noopener">${ic('chat')}Enviar no WhatsApp</a>`:''}<button class="btn soft" id="cdCopy">${ic('copy')}Copiar mensagem</button><a class="btn ghost" href="${url}" target="_blank" rel="noopener">${ic('right')}Abrir</a></div>
   <p class="small muted" style="margin:0">O link é único e só pode ser enviado uma vez. Quando ela preencher, você recebe o aviso na tela inicial e em Clientes.</p></div>`);
  $('#cdCopy').onclick=()=>copiar(msgCadastro(x),'Mensagem com o link copiada')}
function cadVer(id){const x=S.cadastros.get(id);if(!x||x.status!=='enviado')return;const d=x.dados||{};const m=cadMatch(x);
  const L=(k,v)=>v?`<div><b>${k}:</b> ${esc(v)}</div>`:'';
  const dif=m?[['Nome','nome','nome'],['WhatsApp','telefone','telefone'],['CPF','cpf','cpf'],['Instagram','instagram','instagram'],['Nascimento','aniversario','aniversario'],['Cabelo','cabelo','cabelo']].filter(([,a,b])=>d[a]&&String(d[a]).trim()!==String(m[b]||'').trim()):[];
  sheet('Cadastro recebido',`<div class="stack"><div class="row between"><div><b>${esc(d.nome)}</b><div class="small muted">enviado em ${new Date(toMs(x.enviadoEm)).toLocaleString('pt-BR')}</div></div><span class="badge ${m?'':'good'}">${m?'cliente existente':'nova cliente'}</span></div>
   <div class="small">${L('WhatsApp',d.telefone)}${L('CPF',d.cpf)}${L('Nascimento',d.aniversario?dataBR(d.aniversario):'')}${L('Instagram',d.instagram)}${L('Como conheceu',d.origem)}${L('Indicada por',d.indicadaPor)}${L('Código de indicação',d.codigoIndicacao?`${d.codigoIndicacao}${cliPorCodigo(d.codigoIndicacao)?` (${cliPorCodigo(d.codigoIndicacao).nome})`:' (não encontrado)'}`:'')}${L('Cabelo',d.cabelo)}${L('Observações',d.obs)}
    <div><b>Fotos para divulgação:</b> ${d.imagem?'autoriza':'não autoriza'}</div><div><b>LGPD:</b> consentiu com o uso dos dados para atendimento</div></div>
   ${m?`<div class="alert info">${ic('users')}<div>Encontramos <b>${esc(m.nome)}</b> com o mesmo ${x.clienteId?'link':'telefone ou CPF'}. ${dif.length?`Vão ser atualizados: ${dif.map(z=>z[0]).join(', ')}.`:'Os dados são os mesmos da ficha.'} Campos em branco no formulário não apagam o que já existe.</div></div>`:''}
   <div class="form-actions" style="justify-content:space-between"><button class="btn ghost danger" data-act="cadDescartar" data-id="${id}">${ic('trash')}Descartar</button><div class="row">${m?`<button class="btn soft" data-act="cadImportar" data-id="${id}" data-novo="1">Criar como nova</button>`:''}<button class="btn primary" data-act="cadImportar" data-id="${id}">${ic('check')}${m?'Atualizar ficha':'Criar cliente'}</button></div></div></div>`)}
async function cadImportar(id,novo){const x=S.cadastros.get(id);if(!x)return;const d=x.dados||{};const m=novo?null:cadMatch(x);
  const ind=cliPorCodigo(d.codigoIndicacao)||(d.indicadaPor?arr('clientes').find(c=>normNome(c.nome)===normNome(d.indicadaPor)):null);
  const base=m?{...m}:{criadoEm:today()};const set=(k,v)=>{if(v!==undefined&&v!==null&&String(v).trim()!=='')base[k]=String(v).trim()};
  set('nome',d.nome);set('telefone',d.telefone);set('cpf',d.cpf);set('instagram',d.instagram);set('aniversario',d.aniversario);set('cabelo',d.cabelo);
  if(d.origem&&!base.origem)base.origem=ORIGENS.includes(d.origem)?d.origem:'Outro';
  if(ind&&!base.indicadaPor)base.indicadaPor=ind.id;
  const notas=[d.obs,d.indicadaPor&&!ind?`Indicada por ${d.indicadaPor}`:''].filter(Boolean).join(' · ');if(notas)base.obs=[base.obs,notas].filter(Boolean).join(' · ');
  base.consentimento={lgpd:true,imagem:!!d.imagem,em:new Date(toMs(x.enviadoEm)||Date.now()).toISOString(),via:'link de cadastro'};
  delete base.id;const cid=await save('clientes',m?m.id:null,base);
  S.cadastros.set(id,{...x,status:'importado',clienteId:cid});touch();updateDoc(doc(FS,'cadastros',id),{status:'importado',clienteId:cid,processadoEm:nowIso(),processadoPor:ME||''}).catch(dbErr);
  closeSheet();toast(m?'Ficha atualizada':'Cliente cadastrada');if(!m&&pode('anamnese'))setTimeout(()=>abrirCliente(cid),300)}
function avisosCadastro(){return arr('cadastros').filter(x=>x.status==='enviado').map(x=>{const d=x.dados||{};
  return `<div class="item"><div class="avatar" style="--lv:var(--lv-nova)">${ic('users')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(primeiro(d.nome))} preencheu o cadastro</div><div class="s" style="white-space:normal">${esc(d.telefone)} · revise e aprove para entrar em Clientes</div></div><button class="btn sm primary" data-act="cadVer" data-id="${x.id}">Revisar</button></div>`})}

/* ================= ações ================= */
const ACT={
 go:t=>go(t.dataset.v),mais:()=>mais(),close:()=>closeSheet(),
 seed:t=>seed(t.dataset.ex==='1'),
 avLigar:()=>avLigar(),avDesligar:()=>avDesligar(),avTestar:()=>avTestar(),
 errosApagar:()=>confirmar('Apagar todos os registros de erros?',async()=>{const ids=arr('erros').map(x=>x.id);await pool(ids.map(id=>()=>del('erros',id)),8);toast('Registros apagados')}),
 demoRecomecar:()=>confirmar('Apagar os dados de demonstração e começar de novo?',async()=>{const m=await import('./demo/firebase-demo.js');m.recomecarDemo();location.replace(location.pathname+(DEMO_PREVIA?'':'?demo'))}),
 novoAg:t=>formAgenda(null,{d:t.dataset.d,h:t.dataset.h,c:t.dataset.c}),editAg:t=>formAgenda(t.dataset.id),
 agDia:t=>{UI.agDia=t.dataset.d;if(UI.view!=='agenda')go('agenda');else render()},agNav:t=>{UI.agDia=addDays(UI.agDia,+t.dataset.n);render()},agHoje:()=>{UI.agDia=today();render()},agVis:t=>{UI.agVis=t.dataset.t;render()},agVerDia:t=>{UI.agDia=t.dataset.d;UI.agVis='dia';render()},agMes:t=>{const p=parse(UI.agDia);const n=new Date(p.getFullYear(),p.getMonth()+ +t.dataset.n,1);UI.agDia=ymd(n);render()},
 stAg:async t=>{const a=S.agenda.get(t.dataset.id);await save('agenda',a.id,{...a,status:t.dataset.s});toast('Atendimento confirmado')},
 concluir:t=>concluir(t.dataset.id),rolar:t=>{const el=document.querySelector(t.dataset.alvo);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},agoraMais:()=>{UI.agoraMais=!UI.agoraMais;render()},divulgar:()=>divulgar(),
 busca:()=>busca(),buscaIr:t=>buscaIr(t.dataset.k,t.dataset.id),
 tema:()=>{const o=['sistema','claro','escuro'];const n=o[(o.indexOf(temaAtual())+1)%3];aplicaTema(n);toast('Tema '+{sistema:'automático (segue o aparelho)',claro:'claro',escuro:'escuro'}[n]);render()},
 temaSet:t=>{aplicaTema(t.dataset.t);render()},
 recibo:t=>recibo(t.dataset.id),retorno:t=>sugerirRetorno(t.dataset.id,false),
 retornoAg:t=>formAgenda(null,{c:t.dataset.c,s:t.dataset.s,d:t.dataset.d,obs:t.dataset.obs}),
 imprimirArea:()=>imprimirArea(),
 delAg:t=>confirmar('Excluir este atendimento? Os pagamentos registrados nele também saem do financeiro.',()=>del('agenda',t.dataset.id)),
 novaEspera:()=>formEspera(),editEspera:t=>formEspera(t.dataset.id),delEspera:t=>confirmar('Remover da lista de espera?',()=>del('espera',t.dataset.id)),
 avisada:t=>{const e=S.espera.get(t.dataset.id);if(e)save('espera',e.id,{...e,status:'avisada'})},
 novaCli:()=>formCliente(),editCli:t=>formCliente(t.dataset.id),verCli:t=>abrirCliente(t.dataset.id),verHist:t=>{const id=t.dataset.id;carregarHistorico().then(()=>abrirCliente(id))},
 delCli:t=>confirmar('Excluir esta cliente? O histórico fica sem nome. Pela LGPD, apague também a ficha de anamnese se ela pediu exclusão dos dados.',async()=>{await del('clientes',t.dataset.id);if(S.anamneses.has(t.dataset.id))await del('anamneses',t.dataset.id)}),
 cliNivel:t=>{UI.cliNivel=t.dataset.n;UI.cliLim=60;render()},cliOrd:t=>{UI.cliOrd=t.dataset.o;UI.cliLim=60;render()},cliMais:()=>{UI.cliLim+=100;render()},
 anamnese:t=>formAnamnese(t.dataset.id),
 docCli:t=>{UI.ctCli=t.dataset.id;UI.ctAg='';UI.ctTab='emitir';UI.ctTipo='servico';go('contratos')},
 finTab:t=>{UI.finTab=t.dataset.t;if(UI.view!=='financeiro')go('financeiro');else render()},finMes:t=>{UI.finMes=addMonths(UI.finMes,+t.dataset.n);render()},
 lanTipo:t=>{UI.lanTipo=t.dataset.t;render()},novoLan:()=>pode('finEdit')&&formLan(),editLan:t=>pode('finEdit')?formLan(t.dataset.id):toast('Perfil somente leitura'),delLan:t=>confirmar('Excluir este lançamento?',()=>del('lancamentos',t.dataset.id)),
 abrirOrigem:t=>{const o=t.dataset.o,id=t.dataset.oid;if(o==='agenda'){const a=S.agenda.get(id);if(a){UI.agDia=a.data;go('agenda')}}else if(o==='pacotes'){UI.pkTab='pacotes';go('pacotes');formPacote(id)}else if(o==='vales'){UI.pkTab='vales';go('pacotes');formVale(id)}else toast('Calculado automaticamente pela taxa do cartão (Ajustes)')},
 novaConta:()=>pode('finEdit')&&formConta(),editConta:t=>pode('finEdit')&&formConta(t.dataset.id),delConta:t=>confirmar('Excluir esta conta? Lançamentos já pagos continuam no financeiro.',()=>del('contas',t.dataset.id)),
 pagarConta:async t=>{if(!pode('finEdit'))return;const c=S.contas.get(t.dataset.id);const k=t.dataset.k;const pg={...(c.pagas||{})};
   if(pg[k]){if(S.lancamentos.has(pg[k]))await del('lancamentos',pg[k]);delete pg[k];await save('contas',c.id,{...c,pagas:pg});toast('Pagamento desfeito');return}
   const lid=await save('lancamentos',null,{tipo:'despesa',data:today(),valor:+c.valor,categoria:c.categoria,descricao:c.descricao,forma:'Pix',contaRef:k});pg[k]=lid;await save('contas',c.id,{...c,pagas:pg});toast('Conta paga e despesa lançada')},
 novoServ:()=>pode('finEdit')&&formServ(),editServ:t=>pode('finEdit')?formServ(t.dataset.id):toast('Perfil somente leitura'),delServ:t=>confirmar('Excluir este serviço do catálogo?',()=>del('servicos',t.dataset.id)),
 relPer:t=>{UI.relPer=+t.dataset.n;render()},
 das:async t=>{if(!pode('finEdit'))return;const k=t.dataset.k;const g=priv();const p={...(g.dasPagos||{})};const ja=!!p[k];
   if(ja){delete p[k];const l=arr('lancamentos').find(x=>x.dasRef===k);if(l)await del('lancamentos',l.id)}
   else{p[k]=true;await save('lancamentos',null,{tipo:'despesa',data:today(),valor:+g.das,categoria:'DAS-MEI',descricao:`DAS ${mesNome(k)}`,forma:'Pix',dasRef:k})}
   await save('privado','config',{...g,dasPagos:p});toast(ja?'DAS desmarcado':'DAS marcado como pago e despesa lançada')},
 csvLanc:()=>{const m=UI.finMes;const L=[...receitas(),...despesas()].filter(l=>ym(l.data)===m).sort((a,b)=>a.data<b.data?-1:1);
   baixar(`lancamentos-${m}.csv`,csv([['Data','Tipo','Categoria','Descrição','Forma','Parcelas','Nota fiscal','Valor'],...L.map(l=>[dataBR(l.data),l.tipo,l.categoria,l.descricao,l.forma,l.parcelas||1,l.nf?'sim':'não',String(((l.tipo==='despesa'?-1:1)*l.valor).toFixed(2)).replace('.',',')])]))},
 csvRel:()=>baixar(`relatorio-receitas-brutas-${UI.finMes}.csv`,csv(relatorioLinhas())),
 copyRel:()=>copiar(relatorioLinhas().map(r=>r.join(': ')).join('\n'),'Relatório copiado'),
 pacoteContador:()=>pacoteContador(),
 ctTab:t=>{UI.ctTab=t.dataset.t;if(UI.view!=='contratos')go('contratos');else render()},acFiltro:t=>{UI.acFiltro=t.dataset.t;render()},
 aceite:()=>coletarAceite(UI.ctTipo,UI.ctCli,UI.ctAg),verAceite:t=>verAceite(t.dataset.id),
 copyDoc:()=>copiar($('#docBox').innerText,'Texto copiado'),
 baixarDoc:()=>{const nm={servico:'contrato',anamnese:'anamnese',politica:'politica'}[UI.ctTipo];const cli=S.clientes.get(UI.ctCli);baixar(`${nm}${cli?'-'+primeiro(cli.nome).toLowerCase():''}-${today()}.html`,htmlDocStandalone(nm,$('#docBox').innerHTML))},
 baixarAceite:t=>{const a=S.aceites.get(t.dataset.id);baixar(`aceite-${a.tipo}-${a.aceitoEm.slice(0,10)}.html`,htmlDocStandalone('Aceite',`<pre>${esc(a.texto)}</pre>`,`<hr><p><b>Aceito por:</b> ${esc(a.nomeAssinante)}${a.cpf?` (CPF ${esc(a.cpf)})`:''}<br><b>Meio:</b> ${esc(a.meio)}<br><b>Data e hora:</b> ${new Date(a.aceitoEm).toLocaleString('pt-BR')}<br><b>Versão da política:</b> ${a.versao||'—'} · <b>Código:</b> ${esc(a.hash||'')}</p>${a.assinatura?`<img src="${a.assinatura}" style="max-width:320px">`:''}`))},
 copyAceite:t=>copiar(S.aceites.get(t.dataset.id).texto,'Texto copiado'),
 pkTab:t=>{UI.pkTab=t.dataset.t;render()},novoPacote:()=>formPacote(),editPacote:t=>formPacote(t.dataset.id),delPacote:t=>confirmar('Excluir este pacote? O pagamento dele sai do financeiro.',()=>del('pacotes',t.dataset.id)),
 novoVale:()=>formVale(),editVale:t=>formVale(t.dataset.id),delVale:t=>confirmar('Excluir este vale? O pagamento dele sai do financeiro.',()=>del('vales',t.dataset.id)),
 novoItem:()=>formItem(),editItem:t=>formItem(t.dataset.id),movItem:t=>movItem(t.dataset.id),delItem:t=>confirmar('Excluir este item do estoque?',()=>del('estoque',t.dataset.id)),
 calDia:t=>{UI.calDia=t.dataset.d;if(ym(t.dataset.d)!==UI.calMes)UI.calMes=ym(t.dataset.d);render()},
 calMes:t=>{UI.calMes=addMonths(UI.calMes,+t.dataset.n);UI.calDia=UI.calMes+'-01';render()},calHoje:()=>{UI.calMes=ym(today());UI.calDia=today();render()},
 novaIdeia:t=>formIdeia(null,{d:t.dataset.d}),editIdeia:t=>formIdeia(t.dataset.id),usarIdeia:t=>formIdeia(null,{d:t.dataset.d,n:t.dataset.n,i:t.dataset.i}),
 ideiaFeita:async t=>{const i=S.ideias.get(t.dataset.id);await save('ideias',i.id,{...i,feito:!i.feito})},delIdeia:t=>confirmar('Excluir esta ideia?',()=>del('ideias',t.dataset.id)),
 aprovar:t=>aprovar(t.dataset.id),recusar:t=>confirmar('Recusar este pedido? Desative ou exclua também o usuário em Authentication, no console do Firebase.',()=>del('pedidos',t.dataset.id)),
 sair:()=>{pararTudo();signOut(AUTH)},virarDona:()=>virarDona(),
 esqueci:async()=>{const em=($('#lgEmail')?.value||'').trim();if(!em){$('#lgMsg').textContent='Digite seu e-mail acima e toque de novo em "Esqueci minha senha".';return}try{await sendPasswordResetEmail(AUTH,em);$('#lgMsg').style.color='var(--good)';$('#lgMsg').textContent='Enviamos um link para redefinir a senha. Confira também o spam.'}catch(e){$('#lgMsg').textContent='Não foi possível enviar. Confira o e-mail digitado.'}},
 trocarSenha:async()=>{try{await sendPasswordResetEmail(AUTH,EMAIL);toast('Link para trocar a senha enviado para '+EMAIL)}catch(e){toast('Não foi possível enviar o e-mail')}},
 imprimirDoc:()=>window.print(),
 backup:async()=>{await carregarHistorico();const o={versao:3,gerado:nowIso()};ALL_COLS.filter(c=>c!=='pedidos'&&c!=='erros').forEach(c=>o[c]=arr(c));baixar(`backup-stefany-trancista-${today()}.json`,JSON.stringify(o,null,1))},
 limparEx:()=>confirmar('Apagar todos os registros marcados como exemplo?',limparEx),
 tornarDona:t=>{const id=t.dataset.id;const e=S.equipe.get(id)||S.pedidos.get(id)||{};confirmar(`Dar acesso total de proprietária para <b>${esc(e.apelido||e.nome||e.email||'esta pessoa')}</b>? Ela passa a ver finanças, contratos, equipe e configurações.`,()=>tornarDona(id))},
 removerDona:t=>confirmar('Remover o acesso de proprietária desta conta? Ela deixará de entrar no sistema até receber um perfil.',()=>removerDona(t.dataset.id)),
 servSug:async()=>{await servicosSugeridos();const f=$('#fLk')||$('#fAg');if(f){const sel=f.querySelector('#lkServ,#aServ');if(sel){const v=sel.value;sel.innerHTML=(sel.id==='lkServ'?optServCat():optServ(''))+(sel.id==='lkServ'?'<option value="__outro">Outro: digitar o nome</option>':'');sel.value=v==='__outro'?'':v;sel.dispatchEvent(new Event('change'))}const al=f.querySelector('.alert.warn');if(al&&/Nenhum serviço/.test(al.textContent))al.remove()}},
 folgaRem:t=>{const i=+t.dataset.i;const f=[...(pub().folgas||[])];f.splice(i,1);save('publico','config',{...pub(),folgas:f});toast('Data removida')},
 ajTab:t=>{UI.ajTab=t.dataset.t;render()},
 relContador:()=>abrirRelatorioContador(),avTodas:()=>{UI.avTodas=!UI.avTodas;render()},reatTodos:()=>{UI.reatTodos=!UI.reatTodos;render()},
 avPub:async t=>{const a=S.avaliacoes.get(t.dataset.id);if(!a)return;const pub2=!a.publicado;S.avaliacoes.set(a.id,{...a,publicado:pub2,visto:true});touch();await updateDoc(doc(FS,'avaliacoes',a.id),{publicado:pub2,visto:true}).catch(dbErr);await publicarDepoimentos();toast(pub2?'Avaliação no catálogo':'Avaliação retirada do catálogo')},
 indVisto:t=>{const c=S.clientes.get(t.dataset.id);if(c)save('clientes',c.id,{...c,indAvisado:true},{quiet:true})},
 reatFeito:t=>{const c=S.clientes.get(t.dataset.id);if(c)setTimeout(()=>save('clientes',c.id,{...c,reativadoEm:today()},{quiet:true}),t.tagName==='A'?400:0)},
 sinalDev:t=>{const a=S.agenda.get(t.dataset.id);if(!a)return;const v=soma((a.pagamentos||[]).filter(p=>p.tipo==='sinal'));confirmar(`Registrar a devolução de ${BRL(v)} para ${esc(nomeCli(a.clienteId))}? Entra como despesa "Devolução de sinal".`,async()=>{
   await save('agenda',a.id,{...a,sinalDevolvido:{em:today(),valor:v}},{quiet:true});await save('lancamentos',null,{tipo:'despesa',data:today(),valor:v,categoria:'Outras despesas',descricao:`Devolução de sinal · ${nomeCli(a.clienteId)}`,forma:'Pix'});toast('Devolução registrada')})},
 sinalRet:t=>{const a=S.agenda.get(t.dataset.id);if(a){save('agenda',a.id,{...a,sinalRetido:true},{quiet:true});toast('Sinal marcado como retido')}},
 cadLink:t=>formCadLink(t.dataset.c||''),cadMostrar:t=>cadMostrar(t.dataset.id),cadVer:t=>cadVer(t.dataset.id),
 cadImportar:t=>cadImportar(t.dataset.id,!!t.dataset.novo),
 cadDescartar:t=>{const id=t.dataset.id;confirmar('Descartar este cadastro? A cliente não é avisada.',async()=>{const x=S.cadastros.get(id);if(x)S.cadastros.set(id,{...x,status:'descartado'});touch();updateDoc(doc(FS,'cadastros',id),{status:'descartado',processadoEm:nowIso()}).catch(dbErr);toast('Cadastro descartado')})},
 cadCancelar:t=>{const id=t.dataset.id;confirmar('Cancelar este link? Ele deixa de funcionar.',async()=>{S.cadastros.delete(id);touch();deleteDoc(doc(FS,'cadastros',id)).catch(dbErr);toast('Link cancelado')})},
 horCopiar:()=>{const base=$('#fHor .hr-row[data-d="1"]');const vals=['ini','fim','pIni','pFim'].map(k=>base.querySelector(`[data-k="${k}"]`).value);
   $$('#fHor .hr-row').forEach(r=>{if(r===base||r.classList.contains('off'))return;['ini','fim','pIni','pFim'].forEach((k,j)=>r.querySelector(`[data-k="${k}"]`).value=vals[j])});toast('Horário de segunda copiado. Toque em Salvar.')},
 novoCat:t=>formCatalogo(null,{s:t.dataset.s}),editCat:t=>pode('catalogoEdit')?formCatalogo(t.dataset.id):verCatalogo(t.dataset.id),
 copiarCatalogo:()=>copiar(urlPublica('catalogo'),'Link do catálogo copiado'),
 linkContrato:t=>formLinkContrato({c:t.dataset.c,a:t.dataset.a}),verLink:t=>verLinkContrato(t.dataset.id),
 cancelarLink:t=>confirmar('Cancelar este link? A cliente não conseguirá mais abrir o contrato.',async()=>{await del('contratosLink',t.dataset.id);toast('Link cancelado')}),
 portalCriar:t=>portalCriar(t.dataset.id),portalNovo:t=>confirmar('Gerar um novo link? O link antigo para de funcionar na hora.',()=>portalCriar(t.dataset.id,true)),
 portalCopiar:t=>copiar(urlPublica('cliente',S.clientes.get(t.dataset.id)?.portalToken),'Link da cliente copiado'),
 avisoVisto:t=>avisoVisto(t.dataset.k,t.dataset.id),avisoEspera:t=>{const a=S.agenda.get(t.dataset.id);if(a)sugerirEspera(a)},
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;
  if(t.dataset.act==='closeBack'){if(e.target===t)closeSheet();return}
  const f=ACT[t.dataset.act];if(!f)return;if(t.tagName!=='A')e.preventDefault();if(t.disabled)return;f(t,e)});
document.addEventListener('click',e=>{const h=e.target.closest('[data-hdia]');if(h){e.preventDefault();const on=h.getAttribute('aria-pressed')!=='true';h.setAttribute('aria-pressed',on);h.closest('.hr-row').classList.toggle('off',!on);return}
  const rr=e.target.closest('#fgRep');if(rr)return;const t=e.target.closest('#exTipo [data-t]');if(t){e.preventDefault();$$('#exTipo [data-t]').forEach(b=>b.setAttribute('aria-pressed',b===t));$$('#fExc .exh').forEach(l=>l.hidden=t.dataset.t!=='horario')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();const tag=(e.target.tagName||'').toLowerCase();const digitando=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;if(!digitando&&pode('base')&&!$('.sheet-back')&&(e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){e.preventDefault();busca()}});
let buscaT;document.addEventListener('input',e=>{if(e.target.id==='cliBusca'){UI.cliBusca=e.target.value;UI.cliLim=60;clearTimeout(buscaT);buscaT=setTimeout(()=>{const pos=e.target.selectionStart;render();const i=$('#cliBusca');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(_){}}},200)}});
document.addEventListener('change',e=>{const id=e.target.id;
  const ap=e.target.dataset&&e.target.dataset.avpref;if(ap){setDoc(doc(FS,'avisos',ME),{prefs:{...avPrefs(),[ap]:e.target.checked},atualizadoEm:serverTimestamp()},{merge:true}).then(()=>toast('Preferência salva')).catch(dbErr);return}
  if(id==='ctTipo'){UI.ctTipo=e.target.value;render()}else if(id==='ctCli'){UI.ctCli=e.target.value;UI.ctAg='';render()}else if(id==='ctAg'){UI.ctAg=e.target.value;render()}
  else if(id==='restFile'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{let o;try{o=JSON.parse(fr.result)}catch(_){toast('Arquivo inválido');return}
    confirmar('Restaurar esta cópia? Registros com o mesmo identificador serão substituídos.',async()=>{const ops=[];ALL_COLS.filter(c=>!['equipe','pedidos','contratosLink','solicitacoes','cadastros','anamnesePortal','avaliacoes','erros'].includes(c)).forEach(c=>(o[c]||[]).forEach(r=>{if(r&&r.id)ops.push([c,r.id,r])}));await pool(ops.map(([c,id,r])=>()=>save(c,id,r,{quiet:true})),8);toast(`${ops.length} registros restaurados`)})};fr.readAsText(e.target.files[0])}});
document.addEventListener('submit',async e=>{
  if(e.target.id==='fLogin'){e.preventDefault();const m=$('#lgMsg');m.style.color='var(--bad)';m.textContent='Entrando…';
    try{await signInWithEmailAndPassword(AUTH,$('#lgEmail').value.trim(),$('#lgSenha').value)}catch(err){const c=err.code||'';m.textContent=/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)?'E-mail ou senha incorretos.':/too-many-requests/.test(c)?'Muitas tentativas. Aguarde alguns minutos.':/network/.test(c)?'Sem internet. Tente de novo.':'Não foi possível entrar.'}
    return}
  if(e.target.id==='fAvChave'){e.preventDefault();const v=$('#avChave').value.trim();if(v&&!/^B[A-Za-z0-9_-]{60,}$/.test(v)){toast('A chave parece incompleta. Ela começa com B e é bem longa.','erro');return}await save('publico','avisos',{vapid:v});toast('Chave salva');return}
  if(e.target.id==='fCfg'){e.preventDefault();const v=i=>$('#'+i).value.trim();
    await save('publico','config',{...pub(),nome:v('gNome')||DEF_PUB.nome,responsavel:v('gResp'),cnpj:v('gCnpj'),endereco:v('gEnd'),municipio:v('gMun'),whatsapp:v('gWa'),instagram:v('gIg'),descAniv:+v('gAniv')||0,indBenef:v('gIndB'),indBenefNova:v('gIndN'),started:true});
    salvarVitrine();
    await save('privado','config',{...priv(),inicioMei:v('gIni'),limite:+v('gLim')||81000,das:+v('gDas')||DEF_PRIV.das,meta:+v('gMeta')||0,taxaDebito:+v('gTd')||0,taxaCredito:+v('gTc')||0,taxaParcelado:+v('gTp')||0});toast('Ajustes salvos')}
  else if(e.target.id==='fHor'){e.preventDefault();const sm=[];let erro='';
    $$('#fHor .hr-row').forEach(r=>{const i=+r.dataset.d;const g=k=>r.querySelector(`[data-k="${k}"]`).value;const on=r.querySelector('[data-hdia]').getAttribute('aria-pressed')==='true';
      const x={on,ini:g('ini')||'08:00',fim:g('fim')||'18:00',pIni:g('pIni'),pFim:g('pFim')};
      if(on&&x.fim<=x.ini)erro=`${cap(SEMX[i])}: o horário de fechar precisa ser depois do de abrir.`;
      if(on&&(x.pIni||x.pFim)&&!(x.pIni&&x.pFim&&x.pFim>x.pIni&&x.pIni>=x.ini&&x.pFim<=x.fim))erro=`${cap(SEMX[i])}: confira a pausa, ela precisa ficar dentro do expediente.`;
      sm[i]=x});
    if(erro){toast(erro,'erro');return}if(!sm.some(x=>x.on)){toast('Marque pelo menos um dia de atendimento.','erro');return}
    const on=sm.filter(x=>x.on);await save('publico','config',{...pub(),semana:sm,dias:sm.map((x,i)=>x.on?i:-1).filter(i=>i>=0),abre:on.map(x=>x.ini).sort()[0],fecha:on.map(x=>x.fim).sort().pop(),started:true});toast('Horários salvos')}
  else if(e.target.id==='fExc'){e.preventDefault();const rec=$('#fgRep').value;const ini=$('#fgIni').value,fim=$('#fgFim').value||(rec?'':ini),motivo=$('#fgMot').value.trim();const tipo=$('#exTipo [aria-pressed="true"]').dataset.t;
    if(!ini){toast('Escolha a data.','erro');return}if(fim&&fim<ini){toast('A data final precisa ser depois da inicial.','erro');return}
    const reg={ini,fim,motivo,tipo};if(rec){reg.rec=rec;reg.dow=parse(ini).getDay();if(rec==='mensal'){const k=nthDow(ini);reg.nth=k.n>4||(k.ult&&k.n>=4)?-1:k.n}}if(tipo==='horario'){reg.abre=$('#fgAbre').value;reg.fecha=$('#fgFecha').value;if(!reg.abre||!reg.fecha||reg.fecha<=reg.abre){toast('Confira o horário especial.','erro');return}}
    const f=[...(pub().folgas||[]),reg].sort((a,b)=>a.ini<b.ini?-1:1);await save('publico','config',{...pub(),folgas:f});toast(tipo==='horario'?'Horário especial salvo':'Agenda bloqueada')}
  else if(e.target.id==='fPol'){e.preventDefault();const P=pol();const campos={},rev={};
    POL_CAMPOS.forEach(f=>{const el=$('#pol_'+f.k);campos[f.k]=f.t==='num'?+el.value||0:el.value.trim();const r=$('#rev_'+f.k);if(r&&r.checked)rev[f.k]=true});
    await save('publico','politica',{campos,revisados:rev,versao:P.versao+1,atualizadaEm:nowIso()});toast(`Política salva (versão ${P.versao+1})`);window.scrollTo({top:0,behavior:'smooth'})}
});
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',ev=>{const d=ev.data||{};if(d.tipo!=='abrir')return;const v=String(d.url||'').split('#')[1];if(v&&VIEWS.some(x=>x[0]===v))go(v)});
const hsh=(location.hash||'').slice(1);if(VIEWS.some(v=>v[0]===hsh))UI.view=hsh;
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
boot();
