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

## Atualizações futuras

Quando receber arquivos novos, substitua os desta pasta (mantendo o seu `firebase-config.js` e o `.firebaserc`) e rode de novo:
```
firebase deploy
```

## Custos

O plano gratuito do Firebase (**Spark**) costuma atender com folga um ateliê com equipe pequena. Confira os limites atuais em https://firebase.google.com/pricing. Se um dia passar do limite, o sistema mostra o aviso "Limite diário do plano gratuito atingido".

## Cópias de segurança

Baixe uma cópia por mês em **Ajustes › Baixar cópia (JSON)** e guarde no Google Drive ou no computador.

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
    ├── manifest.webmanifest, sw.js, ícones  (instalação no celular)
```

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| "Falta configurar o Firebase" | Preencha `public/firebase-config.js` e rode `firebase deploy`. |
| "Não foi possível conectar" | Confira se o Firestore foi criado (passo 1.3) e se o `firebase deploy` terminou sem erro. |
| "E-mail ou senha incorretos" | Confira o usuário em Authentication › Usuários. Use "Esqueci minha senha". |
| `Error: Failed to get Firebase project` | O `projectId` em `.firebaserc` está errado, ou o `firebase login` foi feito com outra conta Google. |
| Mudanças não aparecem no celular | Feche e abra o app de novo; ele busca a versão nova ao abrir. |
