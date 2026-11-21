# Outros estúdios

O sistema é o mesmo para todos os estúdios. O que muda de um para outro fica numa pasta aqui dentro:

- `negocios/<estudio>/negocio.js`: nome, textos da marca e abas que o estúdio não usa (mesmos campos de `public/negocio.js`).
- `negocios/<estudio>/negocio.js`: também `trocas` (pares [texto da Stéfany, texto do estúdio], aplicados em todas as páginas, scripts e estilos: cores, letra, palavras) e `proibidas` (palavras que não podem sobrar; se sobrar, a montagem para e mostra onde). Uma troca que não acha o texto também para a montagem: sinal de que o texto original mudou.
- `negocios/<estudio>/ramo.js` (opcional): o conteúdo do tipo de negócio, com as mesmas exportações de `public/ramo.js` (perguntas da anamnese, categorias, datas comemorativas, campos da política, cuidados, serviços e dados de exemplo).
- Qualquer outro arquivo da pasta (logo, ícones, configuração do Firebase) entra no lugar do arquivo de mesmo nome em `public/`.

Para montar o site de um estúdio numa pasta separada:

```
node integracao/montar.mjs raquel /tmp/site-raquel
node integracao/montar.mjs mederin /tmp/site-mederin
```

A pasta `public/` continua sendo o site da Stéfany, sem montagem.

Estúdios: `raquel` (Raquel Zaban Retratista) e `mederin` (Mederin do Corte, barbearia em preto e ouro; Firebase próprio ainda não criado, então só abre no modo demonstração).
