// Conteúdo do tipo de negócio da Mederin do Corte (barbearia). Entra no lugar de public/ramo.js quando o site
// é montado (node integracao/montar.mjs mederin <pasta>). As exportações são as mesmas do arquivo da Stéfany.

export const CAT_REC=['Corte','Barba','Química e coloração','Sinal','Pacotes','Vale-presente','Venda de produto','Outras receitas'];
export const CAT_DES=['Produtos (pomada, óleo, lâminas)','Materiais e descartáveis','DAS-MEI','Aluguel / espaço','Transporte','Marketing e redes','Equipamentos','Cursos','Taxas de maquininha','Retirada pró-labore','Repasse a parceira','Outras despesas'];
// Orçamento de exemplo (só na demonstração), por categoria de despesa.
export const ORC_DEMO={'Produtos (pomada, óleo, lâminas)':250,'Materiais e descartáveis':120,'Transporte':60,'Marketing e redes':80};
export const CAT_EST=['Produtos (pomada, óleo, lâminas)','Pomadas e finalizadores','Lâminas e navalhas','Química e coloração','Higiene e descartáveis','Outros'];
// As chaves couro, quimica e alergia aparecem como alerta na agenda: mantê-las.
export const ANAM_Q=[
 ['couro','Tem pele sensível ou costuma irritar depois de barbear?'],
 ['dermatite','Tem dermatite, caspa intensa, foliculite (pelo encravado) ou feridas na pele ou no couro cabeludo?'],
 ['quimica','Fez química nos últimos 30 dias (alisamento, luzes, platinado, coloração)?'],
 ['alergia','Tem alergia a produtos, pós-barba, pomadas, tinturas ou fragrâncias?'],
 ['medic','Usa medicamento contínuo, anticoagulante ou faz tratamento dermatológico (ex.: isotretinoína)?'],
 ['cirurgia','Fez cirurgia, transplante capilar ou tem pontos recentes na cabeça ou no rosto?']
];
// Categoria da receita conforme o nome do serviço.
export const catServ=n=>/platin|luzes|pigment|color|química|alisa/i.test(n)?'Química e coloração':/barba/i.test(n)&&!/corte/i.test(n)?'Barba':'Corte';

// Datas comemorativas e ideias de ação (as do MEI ficam no app.js).
export function datasRamo(y,add,{p,carn,preCarn,bf,nth}){
  add(`${y}-01-01`,'Ano Novo','Abra a agenda de janeiro com o "corte de verão": degradê baixo e barba alinhada para praia.');
  add(`${y}-01-20`,'Férias de verão','Corte infantil com desconto nas férias. Pai e filho juntos saem por um preço especial.');
  add(`${y}-02-01`,'Volta às aulas','Pacote escola para a garotada: corte infantil com retorno em 3 semanas.');
  add(preCarn,'Agenda de Carnaval','Duas semanas antes: abra horários extras e ofereça platinado e desenhos na navalha.');
  add(carn,'Carnaval','Stories com os platinados e desenhos da semana. Venda de pomada para manter o visual no bloco.');
  add(`${y}-03-15`,'Dia do Consumidor','Condição especial de 1 dia: barba com valor reduzido para clientes da casa.');
  add(p,'Páscoa','Sorteio entre clientes que agendarem na semana; brinde de chocolate no atendimento.');
  add(`${y}-05-01`,'Dia do Trabalhador','Horário estendido no feriado para quem trabalha a semana toda.');
  add(nth(y,4,0,2),'Dia das Mães','Vale-presente: as mães presenteiam os filhos e maridos com um corte + barba.');
  add(`${y}-06-12`,'Dia dos Namorados','Pacote "pronto para o encontro": corte, barba e sobrancelha.');
  add(`${y}-07-15`,'Férias de julho','Agenda infantil reforçada e pacote pai e filho.');
  add(nth(y,7,0,2),'Dia dos Pais','Vale-presente de corte + barba e pacote pai e filho com desconto.');
  add(`${y}-09-04`,'Dia do Barbeiro','Post sobre a história da barbearia e um brinde para quem agendar na semana.');
  add(`${y}-09-15`,'Dia do Cliente','Agradeça aos clientes Diamante e Ouro com um brinde ou desconto exclusivo.');
  add(`${y}-10-12`,'Dia das Crianças','Corte infantil com desenho na navalha e um pequeno presente para cada criança.');
  add(`${y}-11-01`,'Novembro Azul','Mês da saúde do homem: lembre os clientes do exame de próstata e ofereça um mimo a quem compartilhar a campanha.');
  add(bf,'Black Friday','Venda antecipada de horários e vales-presente de dezembro com desconto no Pix.');
  add(`${y}-12-01`,'Temporada de fim de ano','Abra a agenda de dezembro cedo, cobre sinal para garantir horário e use a lista de espera.');
  add(`${y}-12-25`,'Natal','Vale-presente de corte + barba para quem quer presentear alguém.');
  add(`${y}-12-31`,'Réveillon','Agenda cheia nos dias 30 e 31: abra horários mais cedo e cobre sinal.');
}

// Campos da política da empresa ligados ao tipo de serviço (entram no meio de POL_CAMPOS).
export const POL_SERVICO=[
 {k:'cabelo',g:'Serviço',r:'Produtos e materiais',t:'sel',o:['estão incluídos no preço do serviço','não estão incluídos no preço; produtos de química e coloração serão informados previamente no orçamento']},
 {k:'preparo',g:'Serviço',r:'Como o cliente deve chegar',t:'txt',p:'no horário marcado, com o cabelo seco e sem pomada ou gel'},
 {k:'semanasMax',g:'Serviço',r:'Intervalo recomendado entre um corte e outro',t:'num',p:3,suf:'semanas'},
 {k:'garantiaDias',g:'Garantia',r:'Prazo para retoque gratuito',t:'num',p:3,suf:'dias'},
 {k:'garantiaCobre',g:'Garantia',r:'O que a garantia cobre',t:'txt',p:'ajustes no acabamento, no degradê ou no desenho por falha na execução'},
 {k:'garantiaExclui',g:'Garantia',r:'O que a garantia não cobre',t:'txt',p:'crescimento natural do cabelo e da barba, mudança de ideia sobre o modelo depois de pronto, química feita em outro lugar e cortes ajustados por terceiros'}
];

export const CUIDADOS_PADRAO='Use pomada ou cera em pouca quantidade e lave o cabelo para tirar o produto antes de dormir. Na barba, lave com sabonete próprio e use óleo ou balm para hidratar. Evite raspar em casa o desenho e o acabamento para o corte durar mais. Volte em 2 a 3 semanas para manter o degradê.';

// Estoque e serviços sugeridos.
export function catalogoBase(ex,{uid}){
  const X=ex?{exemplo:true}:{};const ops=[];const E={};
  [['pom','Pomada modeladora efeito seco','Pomadas e finalizadores','pote',6,2,18],['cer','Cera capilar brilho','Pomadas e finalizadores','pote',4,2,16],['oleo','Óleo para barba','Produtos (pomada, óleo, lâminas)','frasco',5,2,22],
   ['bal','Balm pós-barba','Produtos (pomada, óleo, lâminas)','frasco',3,1,20],['lam','Lâminas descartáveis','Lâminas e navalhas','caixa',8,3,15],['tal','Talco e espuma de barbear','Higiene e descartáveis','unidade',6,2,9],
   ['pesc','Papel de pescoço','Higiene e descartáveis','rolo',10,4,6],['pla','Pó descolorante e água oxigenada','Química e coloração','kit',3,1,35],['pig','Pigmento para barba e cabelo','Química e coloração','frasco',2,1,30]]
   .forEach(([k,nome,categoria,unidade,qtd,minimo,custo])=>{E[k]=uid();ops.push(['estoque',E[k],{nome,categoria,unidade,qtd:ex?qtd:0,minimo,custo,mov:[],...X}])});
  const SV={};
  [['cor','Corte masculino',45,40,3,[['pesc',.1],['pom',.05]]],['bar','Barba',35,30,4,[['lam',.1],['oleo',.05],['tal',.1]]],['cb','Corte + barba',70,60,6,[['pesc',.1],['lam',.1],['oleo',.05]]],
   ['pez','Pezinho (acabamento)',15,15,1,[['lam',.05]]],['sob','Sobrancelha na navalha',15,10,1,[['lam',.05]]],['inf','Corte infantil',40,40,2,[['pesc',.1]]],
   ['pig','Pigmentação de barba',30,20,6,[['pig',.1]]],['pla','Platinado',150,120,30,[['pla',1]]]]
   .forEach(([k,nome,preco,duracao,custo,cons])=>{SV[k]=uid();ops.push(['servicos',SV[k],{nome,preco,duracao,custo,consumo:cons.map(([i,q])=>({itemId:E[i],qtd:q}))}])});
  return {ops,E,SV};
}

// Clientes, agenda e lançamentos de exemplo (só fictícios).
export function exemplos({ops,SV,t,pagos,uid,addDays,addMonths,ym,mesNome,DEMO,DEF_PRIV,ANAM_Q}){
  const X={exemplo:true};
  const P={cor:45,bar:35,cb:70,pez:15,sob:15,inf:40,pig:30,pla:150},D={cor:40,bar:30,cb:60,pez:15,sob:10,inf:40,pig:20,pla:120};
  let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;const formas=['Pix','Pix','Dinheiro','Cartão de crédito','Cartão de débito'];
  const CL=[['raf','Rafael Souza','(21) 99812-4410','Liso, degradê baixo',8,10,21,'cb',0,null,'1994-'+addDays(t,6).slice(5),'Instagram','123.456.789-00'],['tia','Tiago Santos','(21) 99745-1023','Crespo, navalhado',6,22,18,'cor',0,'raf','1997-03-28','Indicação',''],['bru','Bruno Rocha','(21) 99630-7781','Cacheado, barba cheia',4,30,25,'bar',0,null,'1992-08-14','TikTok',''],
    ['leo','Leonardo Oliveira','(21) 99521-3399','Ondulado, social',3,35,28,'cor',1,'raf','2001-12-02','Indicação',''],['gab','Gabriel Nascimento','(21) 99410-8866','Crespo, platinado',2,20,40,'pla',0,null,'1999-05-19','Instagram',''],['dav','Davi Lima (10 anos)','(21) 99387-2251','Liso, infantil',1,25,0,'inf',0,'tia','','WhatsApp','']];
  const C={};
  for(const [k,nome,tel,cab,nv,last,intv,serv,faltas,ind,aniv,origem,cpf] of CL){C[k]=uid();
    ops.push(['clientes',C[k],{nome,telefone:tel,cabelo:cab,aniversario:aniv,indicadaPor:ind?C[ind]:'',origem,cpf,criadoEm:addDays(t,-400),...X}]);
    for(let i=0;i<nv;i++){const d=addDays(t,-(last+i*intv));const sk=i%3===2&&serv!=='inf'?'bar':serv;const f=formas[Math.floor(rnd()*5)];
      ops.push(['agenda',uid(),{clienteId:C[k],servicoId:SV[sk],data:d,hora:['09:00','13:30','18:00'][i%3],duracao:D[sk],valor:P[sk],status:'concluido',prof:DEMO&&i%2===0?'demo-ana':'',pagamentos:[{id:uid(),tipo:'servico',data:d,valor:P[sk],forma:f,parcelas:1,nf:false}],...X}])}
    for(let i=0;i<faltas;i++)ops.push(['agenda',uid(),{clienteId:C[k],servicoId:SV[serv],data:addDays(t,-25),hora:'14:00',duracao:D[serv],valor:P[serv],status:'faltou',pagamentos:[{id:uid(),tipo:'sinal',data:addDays(t,-30),valor:15,forma:'Pix',parcelas:1,nf:false}],...X}]);
  }
  const pkId=uid();ops.push(['pacotes',pkId,{clienteId:C.raf,nome:'Clube do mês: 4 cortes + barba',sessoes:4,valor:240,validade:addDays(t,40),criadoEm:addDays(t,-20),status:'ativo',pagamentos:[{id:uid(),tipo:'pacote',data:addDays(t,-20),valor:240,forma:'Pix',parcelas:1,nf:false}],...X}]);
  [['tia',0,'09:00','cor','confirmado',15,''],['dav',0,'15:30','inf','agendado',0,''],['raf',1,'10:00','cb','agendado',0,pkId],['leo',3,'18:00','cor','agendado',15,''],['gab',6,'09:00','pla','agendado',45,'']]
   .forEach(([ck,dd,h,sk,st,sinal,pk])=>ops.push(['agenda',uid(),{clienteId:C[ck],servicoId:SV[sk],pacoteId:pk,data:addDays(t,dd),hora:h,duracao:D[sk],valor:pk?0:P[sk],status:st,pagamentos:sinal?[{id:uid(),tipo:'sinal',data:addDays(t,-2),valor:sinal,forma:'Pix',parcelas:1,nf:false}]:[],...X}]));
  ops.push(['vales',uid(),{codigo:'MC-PAI26',compradora:'Juliana Santos',telCompradora:'(21) 99745-1024',presenteada:'Seu Carlos',valor:70,validade:addDays(t,170),criadoEm:addDays(t,-10),usos:[],pagamentos:[{id:uid(),tipo:'vale',data:addDays(t,-10),valor:70,forma:'Pix',parcelas:1,nf:false}],...X}]);
  ops.push(['espera',uid(),{clienteId:C.bru,servicoId:SV.cb,preferencia:'sábados de manhã',desde:addDays(t,-3),status:'aguardando',...X}]);
  ops.push(['espera',uid(),{clienteId:'',nome:'Marcos Alves',telefone:'(21) 99222-0145',servicoId:SV.cor,preferencia:'dias de semana, depois das 18h',desde:addDays(t,-1),status:'aguardando',...X}]);
  const R0=Object.fromEntries(ANAM_Q.map(([k])=>[k,{sim:false,det:''}]));
  ops.push(['anamneses',C.raf,{clienteId:C.raf,respostas:R0,obs:'Pele tranquila. Gosta da barba bem marcada na navalha.',menor:false,responsavel:{},imagem:true,atualizadaEm:addDays(t,-120)+'T12:00:00.000Z',historico:[],...X}]);
  ops.push(['anamneses',C.bru,{clienteId:C.bru,respostas:{...R0,couro:{sim:true,det:'irrita com lâmina nova'},alergia:{sim:true,det:'pós-barba com álcool'}},obs:'Usar balm sem álcool depois da barba.',menor:false,responsavel:{},imagem:false,atualizadaEm:addDays(t,-40)+'T12:00:00.000Z',historico:[],...X}]);
  for(let i=0;i<6;i++){const b=addMonths(ym(t),-i)+'-05';
    [['Produtos (pomada, óleo, lâminas)',150+Math.round(rnd()*120),'Pomadas, óleo e lâminas','Pix'],['Materiais e descartáveis',50+Math.round(rnd()*30),'Papel de pescoço, talco e toalhas','Cartão de débito'],['Marketing e redes',i%2?0:50,'Impulsionamento no Instagram','Cartão de crédito'],['Retirada pró-labore',1200,'Retirada mensal','Transferência']]
     .forEach(([cat,v,desc,f])=>{if(v){const d=addDays(b,Math.floor(rnd()*20));if(d<=t)ops.push(['lancamentos',uid(),{tipo:'despesa',data:d,valor:v,categoria:cat,descricao:desc,forma:f,...X}])}});
    for(let k=0;k<40+Math.floor(rnd()*15);k++){const sk=['cor','cor','cb','bar','pez','sob','inf'][Math.floor(rnd()*7)];const d=addDays(b,Math.floor(rnd()*24));if(d>t)continue;const f=formas[Math.floor(rnd()*5)];
      ops.push(['lancamentos',uid(),{tipo:'receita',data:d,valor:P[sk],categoria:catServ(sk==='bar'?'Barba':'Corte'),descricao:'Atendimento avulso (sem cadastro)',forma:f,parcelas:1,nf:k===0&&i===1,...X}])}
    if(addDays(b,10)<=t)ops.push(['lancamentos',uid(),{tipo:'receita',data:addDays(b,10),valor:35,categoria:'Venda de produto',descricao:'Pomada modeladora',forma:'Pix',nf:false,...X}]);
    if(i>0){const mesDas=addMonths(ym(b),-1);pagos[mesDas]=true;ops.push(['lancamentos',uid(),{tipo:'despesa',data:ym(b)+'-18',valor:DEF_PRIV.das,categoria:'DAS-MEI',descricao:`DAS ${mesNome(mesDas)}`,forma:'Pix',dasRef:mesDas,...X}])}}
  const aluguel={descricao:'Aluguel do salão',valor:900,vencimento:addMonths(ym(t),-4)+'-10',recorrente:'mensal',categoria:'Aluguel / espaço',pagas:{},...X};
  for(let i=4;i>=1;i--){const k=addMonths(ym(t),-i);const lid=uid();aluguel.pagas[k]=lid;ops.push(['lancamentos',lid,{tipo:'despesa',data:k+'-10',valor:900,categoria:'Aluguel / espaço',descricao:'Aluguel do salão',forma:'Pix',contaRef:k,...X}])}
  ops.push(['contas',uid(),aluguel]);
  ops.push(['juridico',uid(),{tipo:'documento',nome:'Alvará de funcionamento',parte:'Prefeitura',numero:'0000/2026',inicio:addDays(t,-340),validade:addDays(t,25),link:'',obs:'Exemplo: renovar 30 dias antes.',...X}]);
  ops.push(['juridico',uid(),{tipo:'documento',nome:'Licença sanitária',parte:'Vigilância Sanitária',numero:'',inicio:addDays(t,-200),validade:addDays(t,165),link:'',obs:'',...X}]);
  ops.push(['juridico',uid(),{tipo:'contrato',nome:'Aluguel do salão',categoria:'Aluguel do espaço',parte:'Imobiliária (exemplo)',numero:'',inicio:addDays(t,-120),validade:addDays(t,245),valor:900,link:'',obs:'Reajuste anual pelo IGP-M.',...X}]);
  ops.push(['contas',uid(),{descricao:'Internet da barbearia',valor:99.9,vencimento:ym(t)+'-15',recorrente:'mensal',categoria:'Outras despesas',pagas:{},...X}]);
  ops.push(['contas',uid(),{descricao:'Manutenção das máquinas de corte',valor:180,vencimento:addDays(t,12),recorrente:'unica',categoria:'Equipamentos',pagas:{},...X}]);
  ops.push(['ideias',uid(),{titulo:'Sorteio de um corte + barba no Instagram',tipo:'Promoção',data:addDays(t,10),notas:'Regra: seguir, curtir e marcar 2 amigos.',...X}]);
  ops.push(['ideias',uid(),{titulo:'Parceria com loja de roupas do bairro',tipo:'Parceria',data:'',notas:'Cupom cruzado: meus clientes ganham 10% na loja.',...X}]);
  [['Degradê (fade)','40 minutos','Laterais bem baixinhas que vão clareando até o topo. Fica alinhado por 2 a 3 semanas.','Cortes',45],['Corte + barba','1 hora','Corte do seu jeito e barba desenhada na navalha, com toalha quente e balm no final.','Combos',70],['Platinado','2 horas','Cabelo descolorido até o loiro bem claro. Inclui matizador e orientação de cuidados.','Química',150]]
    .forEach(([nome,tempo,descricao,categoria,preco],i)=>ops.push(['catalogo',uid(),{nome,tempo,descricao,categoria,preco,mostrarPreco:true,link:'',botao:'Quero este corte',ativo:true,ordem:i,fotos:[],exemplo:true}]))
}
