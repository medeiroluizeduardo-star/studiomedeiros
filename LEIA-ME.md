# Stéfany Medeiros Trancista · como colocar no ar

Este guia leva o sistema para o seu projeto do Firebase, do zero. Leva cerca de 30 minutos na primeira vez. Depois, cada atualização é um único comando.

O que fica onde:
- **Firebase Hosting:** o site, em um endereço como `https://SEU-PROJETO.web.app`.
- **Authentication:** o login por e-mail e senha da Stéfany e da equipe.
- **Firestore:** os dados (clientes, agenda, finanças, contratos), protegidos pelas regras do arquivo `firestore.rules`.

---

## Parte 1 · Preparar o projeto no console do Firebase

Acesse https://console.firebase.google.com e abra o seu projeto (ou crie um em **Adicionar projeto**; o Google Analytics é opcional).

### 1.1 Criar o app da Web e copiar a configuração
1. Na página inicial do projeto, clique no ícone **`</>`** (Web).
2. Dê o nome `Stéfany Trancista`. Pode marcar a opção de **Firebase Hosting**.
3. Clique em **Registrar app**. Vai aparecer um bloco com `const firebaseConfig = { ... }`.
4. Abra o arquivo **`public/firebase-config.js`** desta pasta e troque os valores pelos do seu projeto. Fica assim:
   ```js
   export const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```
5. Abra o arquivo **`.firebaserc`** e troque `SEU-PROJETO` pelo `projectId` (o mesmo do passo anterior).

> Esses dados **não são secretos**. Quem protege as informações são as regras de segurança. Nunca compartilhe a "chave privada da conta de serviço" (arquivo .json com `private_key`).

Se perder esse bloco, ele fica em ⚙️ **Configurações do projeto › Geral › Seus apps**.

### 1.2 Ativar o login por e-mail e senha
1. Menu **Criação › Authentication** › **Vamos começar**.
2. Aba **Método de login** › **E-mail/senha** › ative a primeira opção › **Salvar**.
3. Aba **Configurações** › **Ações do usuário** › **desmarque "Ativar criação (inscrição)"** › **Salvar**.
   Assim ninguém consegue criar conta sozinho: só você, pelo console.
4. Aba **Usuários** › **Adicionar usuário** › cadastre o **e-mail da Stéfany** e uma senha.

### 1.3 Criar o banco de dados (Firestore)
1. Menu **Criação › Firestore Database** › **Criar banco de dados**.
2. Local: **`southamerica-east1 (São Paulo)`**. Essa escolha não pode ser mudada depois.
3. Escolha **Iniciar no modo de produção** › **Criar**.
   (As regras corretas serão enviadas no passo 2.4.)

---

## Parte 2 · Publicar o site pelo computador

### 2.1 Instalar o Node.js (uma vez)
1. Entre em https://nodejs.org e baixe a versão **LTS**.
2. Instale com as opções padrão (Avançar, Avançar, Concluir).

### 2.2 Abrir o terminal na pasta do projeto
- **Windows:** abra a pasta `stefany-trancista` no Explorador de Arquivos, clique na barra de endereço, digite `powershell` e aperte Enter.
- **Mac:** abra o app **Terminal**, digite `cd ` (com espaço), arraste a pasta para dentro da janela e aperte Enter.

### 2.3 Instalar a ferramenta do Firebase e entrar na sua conta
Digite um comando por vez e aperte Enter:
```
npm install -g firebase-tools
firebase login
```
O `firebase login` abre o navegador: entre com a **mesma conta Google** do console e autorize.

> **Se o Windows mostrar erro de "execução de scripts desabilitada"**, use `npx firebase-tools` no lugar de `firebase` em todos os comandos (por exemplo, `npx firebase-tools login`).

### 2.4 Publicar
```
firebase deploy
```
Esse comando envia o site, as regras de segurança e os índices. No fim aparece:
```
Hosting URL: https://seu-projeto.web.app
```
Esse é o endereço do sistema.

---

## Parte 3 · Primeiro acesso

1. Abra o endereço do sistema e entre com o e-mail e a senha da Stéfany.
2. Na tela **Primeiro acesso**, toque em **"Esta é a conta da proprietária"**. Isso só pode ser feito uma vez e define a dona do sistema.
3. Escolha **Ver com dados de exemplo** (para conhecer) ou **Começar do zero**.
4. Em **Ajustes**, preencha CNPJ, endereço, WhatsApp, metas e taxas da maquininha.
5. Em **Contratos › Política da empresa**, revise cada item e marque como revisado.

### Trazer os dados do sistema antigo
No sistema antigo (dentro do Claude): **Ajustes › Baixar cópia (JSON)**.
No sistema novo: **Ajustes › Restaurar cópia** e escolha o arquivo.

---

## Parte 4 · Equipe e perfis

1. No console: **Authentication › Usuários › Adicionar usuário** com o e-mail da pessoa e uma senha provisória.
2. A pessoa entra no sistema. Ela verá "Acesso aguardando liberação".
3. A Stéfany abre **Ajustes › Equipe e acessos**, toca em **Definir perfil** e escolhe:

| Perfil | Acessa |
|---|---|
| Trancista parceira | Agenda, clientes, fichas de anamnese, estoque, pacotes, vales, contratos e datas |
| Recepção | Agenda, cadastro de clientes, pacotes, vales, contrato de serviço e datas |
| Contador(a) | Finanças, contas, relatórios e MEI, somente leitura |

Essas restrições são aplicadas **pelo servidor** (arquivo `firestore.rules`): mesmo que alguém mexa no site, o Firestore recusa dados fora do perfil.

**Para tirar alguém:** desmarque "Acesso ativo" em Ajustes e, no console, desative ou exclua o usuário em Authentication.

Cada pessoa pode trocar a própria senha em **Ajustes › Trocar senha** (recebe um link por e-mail).

---

## Parte 5 · Instalar como aplicativo no celular

- **Android (Chrome):** abra o endereço › menu ⋮ › **Instalar app** (ou "Adicionar à tela inicial").
- **iPhone (Safari):** abra o endereço › botão Compartilhar › **Adicionar à Tela de Início**.

O sistema continua abrindo com internet fraca. O que for salvo sem internet é enviado sozinho quando a conexão voltar.

---

## Modo demonstração, prévia e testes (desde a versão 6)

- **Modo demonstração:** abra o endereço do sistema com `?demo` no fim (ex.: `https://stefany-medeiros-trancista.web.app/?demo`). Entra direto como proprietária, com clientes, agenda e finanças fictícias. Tudo fica só naquele navegador: nada é lido nem gravado nos dados reais. A faixa amarela no topo avisa que é demonstração; **Recomeçar** apaga os dados de teste e **Sair** volta ao sistema real.
- **Prévia de cada mudança:** toda proposta de mudança (pull request) no GitHub ganha um endereço próprio de teste, que aparece num comentário da proposta e vale 7 dias. A prévia abre sempre no modo demonstração.
- **Testes antes de publicar:** em toda proposta e antes de cada publicação, o GitHub roda dois testes. *regras* confere, perfil por perfil, quem lê e quem altera cada parte do banco (ex.: recepção não lê ficha de anamnese, ninguém vira proprietária sozinho, contrato aceito não muda). *telas* abre todas as telas no modo demonstração, no computador e no celular, e procura erros, tela em branco e rolagem para o lado. Se algum falhar, nada é publicado.
- **Trava da main:** o site só é publicado quando a mudança entra por proposta aceita (merge do pull request). Um envio direto para a `main` é barrado e o site continua como estava. Em emergência: GitHub › Actions › **Publicar no Firebase** › **Run workflow**.
- **Rodar os testes no computador:** `cd testes`, `npm install`, `npx playwright install chromium` e depois `npm run telas` (telas) ou `npm run regras` (regras; precisa do Java).

## Atualizações futuras

Quando receber arquivos novos, substitua os desta pasta (mantendo o seu `firebase-config.js` e o `.firebaserc`) e rode de novo:
```
firebase deploy
```

## Custos

O plano gratuito do Firebase (**Spark**) costuma atender com folga um ateliê com equipe pequena. Confira os limites atuais em https://firebase.google.com/pricing. Se um dia passar do limite, o sistema mostra o aviso "Limite diário do plano gratuito atingido".

## Cópias de segurança

**Automática, pelo GitHub** (rotina **Cópia de segurança**, `.github/workflows/backup.yml`), todo dia às 3h:
- **Diária:** todas as coleções, inclusive o espaço das clientes, menos as fotos do catálogo e os erros dos aparelhos. Fica guardada 30 dias.
- **Semanal (domingo):** inclui as fotos do catálogo. Fica guardada 90 dias.
- O resumo de cada execução mostra quantos documentos foram lidos (contam na cota grátis de 50 mil leituras por dia) e o tamanho do pacote.
- Para baixar: GitHub › Actions › Cópia de segurança › abra a execução e clique no pacote em **Artifacts**.

**Restaurar** (rotina **Restaurar cópia de segurança**, Run workflow):
1. Pegue o número da execução da cópia (está no resumo dela e no endereço: `.../actions/runs/NÚMERO`).
2. Informe as coleções (`todas` ou, por exemplo, `clientes,agenda`) e, se for um item só, o código do documento.
3. Rode primeiro **sem** marcar *Aplicar de verdade*: o resumo mostra quantos documentos voltariam e quantos já estão iguais.
4. Rode de novo marcando *Aplicar de verdade*. O estado de antes fica no pacote **estado-antes-da-restauracao** daquela execução; para desfazer, restaure informando o número dela.
- *Apagar o que foi criado depois da cópia* remove, nas coleções escolhidas, os documentos que não existiam na cópia.

**Manual:** em **Ajustes › Conta e dados › Baixar cópia (JSON)**, para guardar uma cópia sua no Google Drive ou no computador.

## Início › Agora

No topo do Início, o quadro **Agora** junta o que precisa ser resolvido, do mais urgente para o menos, cada item com o botão que resolve: atendimentos de hoje que já terminaram e não foram concluídos, DAS ou contas vencidas, clientes de hoje que ainda não confirmaram, horários de amanhã sem confirmação, pedidos de acesso, novidades das clientes, DAS e contas perto do vencimento, estoque baixo, clientes para reativar e a política da empresa. Aparecem até 3; o resto fica em **Mais**. Quando não há nada, aparece "Tudo em dia".

## Avisos no celular

Uma rotina do GitHub (**Avisos no celular**, `.github/workflows/avisos.yml`) roda de hora em hora, das 7h às 22h, e manda avisos para quem ligou no próprio aparelho. Cada pessoa recebe só o que é do perfil dela, sem nomes de clientes na tela bloqueada:
- **Novidades das clientes pelo link** (toda hora): cancelamento, contrato aceito, cadastro, ficha de anamnese ou avaliação. Para a proprietária, parceira e recepção.
- **Contas e DAS a pagar** (8h): contas que vencem hoje ou estão vencidas e o DAS perto do dia 20. Para a proprietária e o contador.
- **Agenda de amanhã** (19h): quantos atendimentos, o primeiro horário e quantas clientes não confirmaram.
- **Atendimentos de hoje sem concluir** (20h).
- **Resumo da semana** (segunda, 8h): só para a proprietária.
- Tocar no aviso abre a tela certa.

**Ligar (uma vez só, proprietária)**
1. Firebase › ⚙ Configurações do projeto › **Cloud Messaging** › Configuração da Web › **Certificados push da Web** › **Gerar par de chaves**. Copie a chave (começa com B…).
2. No sistema: **Ajustes › Conta e dados › Avisos no celular**, cole a chave e toque em **Salvar chave**. É uma chave pública.
3. No [IAM do Google Cloud](https://console.cloud.google.com/iam-admin/iam?project=stefany-medeiros-trancista), a conta de serviço do GitHub precisa dos papéis **Usuário do Cloud Datastore** (o mesmo da cópia de segurança) e **Administrador da API Firebase Cloud Messaging**.

**Cada pessoa, no próprio celular:** Ajustes › **Ligar avisos neste aparelho** e permitir as notificações. Dá para escolher quais avisos receber. Android (Chrome) funciona direto; no iPhone, primeiro **Compartilhar › Adicionar à Tela de Início** e abrir o sistema por esse ícone (iOS 16.4 ou mais novo). **Testar neste aparelho** mostra um aviso na hora.

**Testar a rotina:** GitHub › Actions › **Avisos no celular** › Run workflow com **Só testar** marcado: o registro mostra o que seria enviado, sem enviar.

## Erros nos aparelhos

Quando uma tela falha no celular ou no computador de alguém da equipe, o sistema anota o erro, a tela e o tipo de aparelho (coleção `erros`). No máximo 5 registros por vez que a pessoa abre o sistema, sem nada do que foi digitado. Só a proprietária vê e apaga: **Ajustes › Conta e dados › Erros nos aparelhos**. Basta mandar um print dessa lista para corrigir.

## Estrutura da pasta

```
stefany-trancista/
├── firebase.json          configuração do Hosting e do Firestore
├── .firebaserc            qual projeto do Firebase usar
├── firestore.rules        regras de segurança por perfil
├── firestore.indexes.json índices do banco
└── public/                o site
    ├── index.html
    ├── app.js             o sistema
    ├── styles.css         o visual
    ├── firebase-config.js os dados do SEU projeto (preencher)
    ├── fb.js              escolhe entre o Firebase de verdade e o de demonstração
    ├── demo/              banco de mentira do modo demonstração
    ├── manifest.webmanifest, sw.js, ícones  (instalação no celular)
testes/                    testes automáticos (regras do banco, rotinas e telas)
integracao/admin/          cópia de segurança, restauração e avisos no celular (rodam no GitHub)
.github/workflows/         publicar, prévia, testes, cópia de segurança, restaurar e avisos
```

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| "Falta configurar o Firebase" | Preencha `public/firebase-config.js` e rode `firebase deploy`. |
| "Não foi possível conectar" | Confira se o Firestore foi criado (passo 1.3) e se o `firebase deploy` terminou sem erro. |
| "E-mail ou senha incorretos" | Confira o usuário em Authentication › Usuários. Use "Esqueci minha senha". |
| `Error: Failed to get Firebase project` | O `projectId` em `.firebaserc` está errado, ou o `firebase login` foi feito com outra conta Google. |
| Mudanças não aparecem no celular | Feche e abra o app de novo; ele busca a versão nova ao abrir. |

---

## Novidades (versão 5)

Páginas abertas às clientes, no mesmo endereço do sistema:

| Página | Para quê |
|---|---|
| `/catalogo` | Catálogo público de modelos, com fotos, tempo médio e botão para agendar |
| `/contrato#código` | Contrato enviado por link: a cliente lê, assina ou marca "Li e concordo" e baixa o PDF |
| `/cliente#código` | Espaço pessoal da cliente: nível, dados, últimos e próximos horários, contratos e cancelamento dentro do prazo |

Os links de contrato e do espaço da cliente usam um código secreto e longo. Quem não tem o link não consegue abrir nem listar esses dados.

**Importante:** depois de publicar esta versão, atualize as regras do Firestore (Firestore Database › Regras) colando o conteúdo do arquivo `firestore.rules`. Sem isso, o catálogo, os links de contrato e o espaço da cliente não abrem.

As fotos do catálogo ficam no próprio Firestore (comprimidas no aparelho antes do envio), porque o Cloud Storage do Firebase exige o plano pago Blaze.
