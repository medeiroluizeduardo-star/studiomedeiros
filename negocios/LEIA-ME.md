# Outros estúdios

O sistema é o mesmo para todos os estúdios. O que muda de um para outro fica numa pasta aqui dentro:

- `negocios/<estudio>/negocio.js`: nome, textos da marca e abas que o estúdio não usa (mesmos campos de `public/negocio.js`).
- Qualquer outro arquivo da pasta (logo, ícones, configuração do Firebase) entra no lugar do arquivo de mesmo nome em `public/`.

Para montar o site de um estúdio numa pasta separada:

```
node integracao/montar.mjs raquel /tmp/site-raquel
```

A pasta `public/` continua sendo o site da Stéfany, sem montagem.
