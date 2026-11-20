# Instruções para o Claude neste repositório (Stéfany Medeiros Trancista)

## Conversa
- Responder sempre em **português do Brasil**, linguagem simples (o dono não é programador). Telas, commits e PRs também em português.
- Fuso: America/Sao_Paulo. Site no ar: stefany-medeiros-trancista.web.app.

## Como entregar (obrigatório)
1. Nunca mexer direto na `main` (a `main` publica no ar sozinha, e um envio direto é barrado pela trava). Branch nova, commit, push e **pull request**.
2. Esperar a CI do PR (`regras`, `telas` e `previa`) e mandar ao usuário o **link da prévia** (comentário do PR com `...web.app`).
3. Só fazer o merge (squash) quando o usuário disser **"pode publicar"**. Depois conferir que o workflow **"Publicar no Firebase"** terminou com sucesso.
4. A cada mudança em `public/`, subir a versão `CACHE` em `public/sw.js` (`smt-vNN`) e incluir arquivos novos na lista `ARQUIVOS`.
5. Ao terminar, resumir para o usuário: o que mudou, como usar e o que foi testado. Curto.

## Segurança e dados
- Nada de dados pessoais de clientes reais em `public/` nem no repositório. Os exemplos são fictícios (função `seed` em `app.js`).
- Nunca mostrar nem enviar segredos (chaves, senhas, tokens).
- **Mudança em dados reais** (gravar/apagar no Firestore) só com autorização explícita do usuário.
- Mudou a estrutura de dados ou as permissões? Ajustar `firestore.rules` e os testes em `testes/regras.test.mjs` (rodam no CI, com emulador).

## Estrutura (resumo)
- Página estática sem build, JavaScript puro (módulos ES) em `public/`. `app.js` é o sistema da equipe; `publico.js` + `catalogo.js`, `cliente.js`, `contrato.js` e `cadastro.js` são as páginas abertas às clientes.
- Nome, marca e abas do negócio ficam em `public/negocio.js`. Outro estúdio tem a pasta `negocios/<estudio>/` (o `negocio.js` dele e arquivos que substituem os de `public/`); `node integracao/montar.mjs <estudio> <pasta>` monta o site dele. Os testes de telas rodam nos dois sites, e a prévia publica os dois.
- Todo acesso ao Firebase passa por `public/fb.js`: com `?demo` (ou na prévia, endereço com `--`) ele usa `public/demo/firebase-demo.js`, um banco de mentira no navegador. Funções novas do Firebase precisam existir nos dois.
- Rotinas no GitHub Actions: publicar, prévia, testes, `backup` (todo dia), `restaurar` (manual) e `avisos` (de hora em hora; decisão em `integracao/admin/avisos-planejar.mjs`, testada em `testes/avisos.test.mjs`), com scripts em `integracao/admin/`. Erros dos aparelhos vão para a coleção `erros` (só a proprietária lê, em Ajustes › Conta e dados).
- Perfis: proprietária (`sistema/acesso.donas`), parceira, recepção e contador(a) (`equipe/{uid}`). Coleções por perfil em `COLS_POR_PAPEL` (`app.js`).

## Testes (proporcionais ao tamanho da mudança)
- Sempre: `node --check` nos .js alterados.
- Telas (`testes/telas.test.mjs`, job `telas`): passa por todas as abas no `?demo` em 1366 e 390 (erros de JS, 404, tela em branco, rolagem lateral). `cd testes && npm run telas`. Aba nova entra sozinha (vem do menu).
- Regras e rotinas (`testes/regras.test.mjs` e `testes/rotinas.test.mjs`, job `regras`): `cd testes && npm run regras` (emulador, precisa de Java).

## Economia
- Preferir fazer o trabalho direto, sem agentes auxiliares, salvo pedido do usuário.
- Ler só os trechos necessários dos arquivos.
