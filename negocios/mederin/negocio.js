// Dados da Mederin do Corte (barbearia do William). Entra no lugar de public/negocio.js quando o site é montado
// (node integracao/montar.mjs mederin <pasta>). Os campos são os mesmos do arquivo da Stéfany.
// As cores (preto e amarelo ouro), a letra e os textos de barbearia saem das trocas abaixo; o conteúdo maior
// (serviços, anamnese, datas, exemplos) fica em ramo.js.

// Cores do ateliê -> cores da barbearia. Claro: fundo creme, texto preto, ouro escuro. Escuro: preto e ouro.
const CORES = [
  // claro
  ['#F8EFE6', '#F5F1E8'], ['#FFFBF7', '#FFFDF8'], ['#F4E6D9', '#EDE6D6'], ['#EAD8C7', '#DCD2BC'], ['#3B2216', '#111111'],
  ['#86685A', '#645C4C'], ['#EFD8C4', '#EFE2BC'], ['#C8895E', '#C9A227'], ['#7A4123', '#6E5300'], ['#B9874D', '#B08A1C'],
  ['#D9C8DC', '#CFD8E3'], ['#E7C08D', '#E3C25B'], ['#D39C78', '#C98B5A'], ['#EDCFB7', '#E6DCC4'], ['#EFD9C4', '#E8DFC8'],
  ['rgba(122,65,35,', 'rgba(17,17,17,'], ['rgba(40,22,12,.36)', 'rgba(0,0,0,.45)'], ['#2B1A20', '#111111'],
  // escuro
  ['#1A120D', '#0D0D0D'], ['#241812', '#171717'], ['#2F2018', '#222120'], ['#402D21', '#35312A'], ['#F6E8DC', '#F3EEE3'],
  ['#C2A391', '#ABA392'], ['#4A3022', '#3B3320'], ['#D9A27A', '#D4AF37'], ['#EDBF98', '#EBCB63'], ['#2A170D', '#111111'],
  ['#E0B77E', '#D9B54A'], ['#7A5440', '#4A4436'], ['#9A6448', '#8A6440'], ['#140D09', '#050505']
];

export const NEGOCIO = {
  id: 'barbearia',
  nome: 'Mederin do Corte',
  curto: 'Mederin do Corte',
  marca: ['Mederin', 'do Corte'],
  responsavel: 'William Medeiros',
  municipio: 'Rio de Janeiro - RJ',
  arquivo: 'mederin-do-corte',
  parceira: 'Barbeiro parceiro',
  abasDesligadas: [],
  trocas: [
    // ícone do celular: abre com fundo preto
    ['"background_color": "#F8EFE6",\n  "theme_color": "#F8EFE6"', '"background_color": "#0D0D0D",\n  "theme_color": "#0D0D0D"'],
    ...CORES,
    // letra dos títulos: no lugar da letra fina e delicada, a mesma letra firme do texto
    ['--f-display:"Cormorant Garamond","Cormorant",Garamond,Georgia,serif;', '--f-display:"Figtree",system-ui,-apple-system,"Segoe UI",sans-serif;'],
    ['<link rel="preload" href="fontes/cormorant.woff2" as="font" type="font/woff2" crossorigin>\n', ''],
    ['.sp-nome{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;', '.sp-nome{font-family:"Figtree",system-ui,sans-serif;font-weight:700;'],
    ['italic 600 104px "Cormorant Garamond", Georgia, serif', '700 96px "Figtree", system-ui, sans-serif'],
    // abre no modo escuro (preto e ouro) até a pessoa escolher outro em Ajustes
    ["localStorage.getItem('smt-tema');", "localStorage.getItem('smt-tema')||'escuro';"],
    ["localStorage.getItem(TEMA_KEY)||'sistema'", "localStorage.getItem(TEMA_KEY)||'escuro'"],
    // níveis do programa de pontos
    ['Ouro Rosé', 'Ouro'], ['Pérola', 'Diamante'],

    // contrato, política e anamnese
    ['Contrato de Prestação de Serviços de Tranças', 'Contrato de Prestação de Serviços de Barbearia'],
    ["Recomenda-se não permanecer com as tranças por mais de ${V('semanasMax')} semanas, para evitar danos aos fios e alopecia por tração. Dor intensa",
     "Para manter o corte alinhado, recomenda-se retornar a cada ${V('semanasMax')} semanas. Irritação, ardência"],
    ['<p>2.3. Cabelo sintético e materiais', '<p>2.3. Produtos e materiais'], ['<b>Cabelo e materiais:</b>', '<b>Produtos e materiais:</b>'],
    ['respeitando a saúde do couro cabeludo e evitando tensão excessiva', 'respeitando a saúde da pele e do couro cabeludo e usando lâminas novas e instrumentos esterilizados'],
    ["durabilidade recomendada (até ${polV(P,'semanasMax')} semanas) e os riscos do procedimento, como sensibilidade, desconforto nas primeiras horas e queda de fios por tração quando os cuidados não são seguidos.",
     "o intervalo recomendado entre os cortes (a cada ${polV(P,'semanasMax')} semanas) e os riscos do procedimento, como irritação da pele, pelos encravados e pequenos cortes da navalha, e reação a produtos químicos quando houver química."],
    ['executar os serviços de tranças', 'executar os serviços da barbearia'],
    ['das minhas tranças, com ou sem meu rosto', 'do meu cabelo e da minha barba, com ou sem meu rosto'],
    ["recomendamos ficar no máximo ${V('semanasMax')} semanas com as tranças.", "recomendamos voltar a cada ${V('semanasMax')} semanas para manter o corte."],
    ['Trancista parceira deve ter contrato próprio', 'Barbeiro parceiro deve ter contrato próprio'],
    ["'Trancista parceira'", "'Barbeiro parceiro'"],
    ['a trancista parceira veem', 'o barbeiro parceiro veem'],
    ['Trancistas parceiras e repasse <small>quanto cada uma recebe', 'Barbeiros parceiros e repasse <small>quanto cada um recebe'],
    ['trancistas parceiras.', 'barbeiros parceiros.'],

    // mensagens de WhatsApp
    ['Estou com saudade de cuidar das suas tranças 💕', 'Faz tempo que você não passa aqui 💕'],
    ["${s?.nome||'suas tranças'}", "${s?.nome||'o seu corte'}"],
    ['Já está na hora da manutenção da sua ${nomeAg(x.ult)}, para manter o couro cabeludo saudável e as tranças bonitas.', 'Já está na hora de renovar o seu ${nomeAg(x.ult)} e manter o visual em dia.'],
    ['Suas tranças já estão com ${r.sem} semanas 💕 Para cuidar da saúde dos seus fios, o ideal é retirar até ${max} semanas. Vamos marcar a retirada (e, se quiser, já a próxima trança)?',
     'Já faz ${r.sem} semanas do seu último corte 💕 O ideal é voltar a cada ${max} semanas para o degradê não perder a forma. Bora marcar?'],
    ['Suas tranças completam ${r.sem} semanas 💕 É uma ótima hora para uma manutenção e deixar tudo alinhado de novo.', 'Já faz ${r.sem} semanas do seu último corte 💕 É uma ótima hora para dar um tapa no visual.'],
    ["r.retirar?'retirar':'manutenção'", "r.retirar?'hora do corte':'hora do corte'"],
    ["ehRet?'Nova trança'", "ehRet?'Novo corte'"],
    ['Amiga, conheça o', 'Fala! Conheça a'], ['ajuda outras mulheres a encontrarem', 'ajuda outras pessoas a encontrarem'],
    ['(se recebeu de uma amiga)', '(se recebeu de um amigo)'], ['para cada amiga atendida', 'para cada amigo atendido'],
    ['Beijos, ', 'Abraço, '], ['Obrigada', 'Valeu'], ['obrigada', 'valeu'], ['💕', '💈'],

    // telas das clientes e do catálogo
    ['Veja o tempo médio de cada trança', 'Veja o tempo médio de cada corte'], ['Escolha seu <em>modelo</em>', 'Escolha seu <em>corte</em>'],
    ['Modelos de tranças, tempo médio e como agendar.', 'Cortes, barba, tempo médio e como agendar.'],
    ['Cuidados com as suas tranças', 'Cuidados com o seu corte'],
    ['das minhas tranças para divulgação', 'do meu cabelo e da minha barba para divulgação'],
    ['fotos e vídeos do meu cabelo para', 'fotos e vídeos do meu cabelo e da minha barba para'],
    ["placeholder=\"Ex.: Tranças soltas\"", "placeholder=\"Ex.: Cortes\""],
    ['Cuidados depois da trança', 'Cuidados depois do corte'],
    ["${esc(primeiro(a.responsavel) || 'O ateliê')} já foi avisada", "${esc(primeiro(a.responsavel) || 'A barbearia')} já foi avisado"],
    ['Preparando seu ateliê com carinho…', 'Afiando a navalha…'],

    // ateliê -> barbearia (as frases mais longas primeiro, por causa do artigo)
    ['Política do Ateliê', 'Política da Barbearia'], ["|| 'Ateliê'", "|| 'Barbearia'"],
    ['do ateliê', 'da barbearia'], ['no ateliê', 'na barbearia'], ['ao ateliê', 'à barbearia'],
    ['O ateliê', 'A barbearia'], ['o ateliê', 'a barbearia'], ['ateliê', 'barbearia'],
    ['Proprietária', 'Proprietário'], ['proprietária', 'proprietário'],
    // a maioria dos clientes de barbearia é homem
    ['Nova cliente', 'Novo cliente'], ['nova cliente', 'novo cliente'], ['das clientes', 'dos clientes'], ['pela cliente', 'pelo cliente'],
    ['da cliente', 'do cliente'], ['Uma cliente', 'Um cliente'], ['uma cliente', 'um cliente'],
    [' as clientes', ' os clientes'], ['As clientes', 'Os clientes'], [' a cliente', ' o cliente'], ['A cliente', 'O cliente']
  ],
  proibidas: ['tranç', 'trancist', 'ateliê', 'Stéfany']
};
