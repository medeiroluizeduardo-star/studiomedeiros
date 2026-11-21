// Conteúdo do tipo de negócio (aqui, tranças): perguntas da anamnese, categorias, datas, política,
// cuidados e dados de exemplo. Outro estúdio tem o seu em negocios/<estudio>/ramo.js, com as mesmas exportações.

export const CAT_REC=['Serviço de trança','Manutenção','Retirada','Sinal','Pacotes','Vale-presente','Venda de produto','Outras receitas'];
export const CAT_DES=['Cabelo / fibra','Materiais (pomada, linha, elástico)','DAS-MEI','Aluguel / espaço','Transporte','Marketing e redes','Equipamentos','Cursos','Taxas de maquininha','Retirada pró-labore','Repasse a parceira','Outras despesas'];
// Orçamento de exemplo (só na demonstração), por categoria de despesa.
export const ORC_DEMO={'Cabelo / fibra':350,'Materiais (pomada, linha, elástico)':120,'Transporte':80,'Marketing e redes':50};
export const CAT_EST=['Cabelo / fibra','Pomadas e finalizadores','Linhas e elásticos','Miçangas e acessórios','Higiene e descartáveis','Outros'];
export const ANAM_Q=[
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
// Categoria da receita conforme o nome do serviço.
export const catServ=n=>/manuten/i.test(n)?'Manutenção':/retirada/i.test(n)?'Retirada':'Serviço de trança';

// Datas comemorativas e ideias de ação (as do MEI ficam no app.js).
export function datasRamo(y,add,{p,carn,preCarn,bf,nth}){
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
}

// Campos da política da empresa ligados ao tipo de serviço (entram no meio de POL_CAMPOS).
export const POL_SERVICO=[
 {k:'cabelo',g:'Serviço',r:'Cabelo sintético e materiais',t:'sel',o:['não estão incluídos no preço; a CONTRATADA informará previamente quantidade, tipo e cor e poderá fornecê-los mediante acréscimo informado no orçamento','estão incluídos no preço do serviço','serão fornecidos pela CONTRATANTE, conforme orientação prévia da CONTRATADA quanto a quantidade, tipo e cor']},
 {k:'preparo',g:'Serviço',r:'Como a cliente deve chegar',t:'txt',p:'com o cabelo lavado, seco e desembaraçado, sem óleos ou cremes pesados'},
 {k:'semanasMax',g:'Serviço',r:'Tempo máximo recomendado com as tranças',t:'num',p:8,suf:'semanas'},
 {k:'garantiaDias',g:'Garantia',r:'Prazo para retoque gratuito',t:'num',p:7,suf:'dias'},
 {k:'garantiaCobre',g:'Garantia',r:'O que a garantia cobre',t:'txt',p:'tranças que se soltarem ou se desfizerem por falha na execução'},
 {k:'garantiaExclui',g:'Garantia',r:'O que a garantia não cobre',t:'txt',p:'desgaste natural, crescimento do cabelo, aplicação de química, falta dos cuidados orientados, manipulação ou retirada parcial por terceiros'}
];

export const CUIDADOS_PADRAO='Lave o couro cabeludo a cada 7 a 10 dias com xampu diluído, secando bem as tranças. Durma com touca ou fronha de cetim. Hidrate o couro com tônico leve, sem óleos pesados. Evite prender com muita tensão nos primeiros dias.';

// Estoque e serviços sugeridos.
export function catalogoBase(ex,{uid}){
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

// Clientes, agenda e lançamentos de exemplo (só fictícios).
export function exemplos({ops,SV,t,pagos,uid,addDays,addMonths,ym,mesNome,DEMO,DEF_PRIV,ANAM_Q}){
  const X={exemplo:true};
  const P={box:280,nago:120,ful:260,twi:300,gyp:350,inf:90,man:100,ret:70},D={box:300,nago:120,ful:270,twi:300,gyp:360,inf:120,man:120,ret:120};
    let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;const formas=['Pix','Pix','Dinheiro','Cartão de crédito','Cartão de débito'];
    const CL=[['ana','Ana Beatriz Souza','(27) 99812-4410','Crespo 4C, ombro',6,20,50,'box',0,null,'1994-'+addDays(t,6).slice(5),'Instagram','123.456.789-00'],['jes','Jéssica Santos','(27) 99745-1023','Crespo 4B, busto',4,40,60,'ful',0,'ana','1997-03-28','Indicação',''],['cam','Camila Rocha','(27) 99630-7781','Cacheado 3C, longo',3,130,70,'twi',0,null,'1992-08-14','TikTok',''],
      ['lar','Larissa Oliveira','(27) 99521-3399','Crespo 4A, curto',2,60,90,'nago',1,'ana','2001-12-02','Indicação',''],['tha','Thaís Nascimento','(27) 99410-8866','Crespo 4C, médio',1,15,0,'gyp',0,null,'1999-05-19','Instagram',''],['pri','Priscila Lima','(27) 99387-2251','Transição capilar',0,0,0,'nago',0,'jes','','WhatsApp','']];
    const C={};
    for(const [k,nome,tel,cab,nv,last,intv,serv,faltas,ind,aniv,origem,cpf] of CL){C[k]=uid();
      ops.push(['clientes',C[k],{nome,telefone:tel,cabelo:cab,aniversario:aniv,indicadaPor:ind?C[ind]:'',origem,cpf,criadoEm:addDays(t,-400),...X}]);
      for(let i=0;i<nv;i++){const d=addDays(t,-(last+i*intv));const sk=i%3===2?'man':serv;const f=formas[Math.floor(rnd()*5)];
        ops.push(['agenda',uid(),{clienteId:C[k],servicoId:SV[sk],data:d,hora:['09:00','13:30','08:30'][i%3],duracao:D[sk],valor:P[sk],status:'concluido',prof:DEMO&&i%2===0?'demo-ana':'',pagamentos:[{id:uid(),tipo:'servico',data:d,valor:P[sk],forma:f,parcelas:f==='Cartão de crédito'&&P[sk]>=200?2:1,nf:false}],...X}])}
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
    ops.push(['juridico',uid(),{tipo:'documento',nome:'Alvará de funcionamento',parte:'Prefeitura',numero:'0000/2026',inicio:addDays(t,-340),validade:addDays(t,25),link:'',obs:'Exemplo: renovar 30 dias antes.',...X}]);
    ops.push(['juridico',uid(),{tipo:'documento',nome:'Licença sanitária',parte:'Vigilância Sanitária',numero:'',inicio:addDays(t,-200),validade:addDays(t,165),link:'',obs:'',...X}]);
    ops.push(['juridico',uid(),{tipo:'contrato',nome:'Aluguel da sala',categoria:'Aluguel do espaço',parte:'Imobiliária (exemplo)',numero:'',inicio:addDays(t,-120),validade:addDays(t,245),valor:450,link:'',obs:'Reajuste anual pelo IGP-M.',...X}]);
    ops.push(['contas',uid(),{descricao:'Internet do ateliê',valor:99.9,vencimento:ym(t)+'-15',recorrente:'mensal',categoria:'Outras despesas',pagas:{},...X}]);
    ops.push(['contas',uid(),{descricao:'Curso de tranças nagô avançado',valor:300,vencimento:addDays(t,12),recorrente:'unica',categoria:'Cursos',pagas:{},...X}]);
    ops.push(['ideias',uid(),{titulo:'Sorteio de uma manutenção no Instagram',tipo:'Promoção',data:addDays(t,10),notas:'Regra: seguir, curtir e marcar 2 amigas.',...X}]);
    ops.push(['ideias',uid(),{titulo:'Parceria com loja de acessórios para tranças',tipo:'Parceria',data:'',notas:'Cupom cruzado: minhas clientes ganham 10% na loja.',...X}]);
  [['Box braids','4 a 6 horas','Tranças soltas e versáteis, do comprimento que você escolher. Duram de 6 a 8 semanas com os cuidados certos.','Tranças soltas',280],['Nagô','1 a 2 horas','Tranças rentes ao couro cabeludo, em desenhos retos ou criativos. Ótimas para o dia a dia e para o calor.','Nagô',120],['Fulani braids','4 a 5 horas','Combinação de nagô na frente com tranças soltas atrás, com miçangas e anéis.','Tranças soltas',260]]
      .forEach(([nome,tempo,descricao,categoria,preco],i)=>ops.push(['catalogo',uid(),{nome,tempo,descricao,categoria,preco,mostrarPreco:true,link:'',botao:'Quero este modelo',ativo:true,ordem:i,fotos:[],exemplo:true}]))
}
