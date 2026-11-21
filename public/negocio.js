// Dados do negócio: o nome que aparece nas telas, nos contratos, nos avisos e no ícone do celular, e as abas do sistema.
// Este arquivo é o do ateliê da Stéfany. Outro estúdio tem o seu em negocios/<estudio>/negocio.js, que entra no lugar
// deste quando o site dele é montado (integracao/montar.mjs). Os campos têm que ser os mesmos nos dois.
export const NEGOCIO = {
  id: 'trancas',
  nome: 'Stéfany Medeiros Trancista',          // nome completo: títulos das páginas, contrato, rodapé
  curto: 'Stéfany Trancista',                  // nome curto: ícone do celular e avisos
  marca: ['Stéfany', 'Medeiros · Trancista'],  // as duas linhas ao lado da logo
  responsavel: 'Stéfany Medeiros',             // valor inicial em Ajustes › Negócio
  municipio: 'Serra - ES',                     // valor inicial em Ajustes › Negócio
  arquivo: 'stefany-trancista',                // começo do nome do arquivo da cópia de segurança
  parceira: 'Trancista parceira',              // nome do perfil "parceira" da equipe
  abasDesligadas: [],                         // abas que este negócio não usa, ex.: ['estoque']
  // Só para outro estúdio: trocas de texto feitas ao montar o site dele ([de, para]) e palavras que não podem sobrar.
  trocas: [],
  proibidas: []
};
