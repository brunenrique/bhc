# Thalamus

[![Build Status](https://github.com/seu-usuario/thalamus/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/thalamus/actions/workflows/ci.yml) [![Release](https://img.shields.io/github/v/release/seu-usuario/thalamus)](https://github.com/seu-usuario/thalamus/releases/latest) [![Dependabot](https://img.shields.io/badge/dependabot-enabled-brightgreen?logo=dependabot)](https://github.com/seu-usuario/thalamus/pulls?q=is%3Apr+label%3Adependencies) [![CodeQL](https://github.com/seu-usuario/thalamus/actions/workflows/codeql.yml/badge.svg)](https://github.com/seu-usuario/thalamus/actions/workflows/codeql.yml) [![Coverage Status](https://coveralls.io/repos/github/seu-usuario/thalamus/badge.svg?branch=main)](https://coveralls.io/github/seu-usuario/thalamus?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Plataforma web para gestão de clínicas de psicologia, com agenda integrada, prontuários seguros e funcionalidades auxiliadas por IA. O projeto é baseado em **Next.js** e **Firebase**, utilizando **TypeScript** e **Tailwind CSS** no frontend e **Cloud Functions** no backend. Fluxos de IA são implementados com **Genkit** e Google AI.

## Tecnologias Principais

- **Next.js 15** com React 18 (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase**: Firestore, Cloud Functions, Cloud Messaging, Storage e Hosting
- **Genkit** + Google AI para funcionalidades de inteligência artificial
- **Jest** e Testing Library para testes automatizados

## Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/thalamus.git
    cd thalamus
    ```
2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```
    > **Dica:** execute `pnpm install` sempre antes de rodar `pnpm run prepare:commit` ou realizar `git commit`. Os hooks do Husky utilizam o ESLint e outras dependências que exigem a pasta `node_modules` presente, caso contrário o commit será abortado.
3.  **Configure as Variáveis de Ambiente:**
    - Copie o arquivo `env.example` (na raiz do projeto) para um novo arquivo chamado `.env.local`:
      ```bash
      cp env.example .env.local
      ```
      (O arquivo `.env.local` é ignorado pelo Git e é onde suas chaves reais devem ser armazenadas localmente.)
    - Preencha o arquivo `.env.local` com as credenciais do seu projeto Firebase e outras chaves necessárias. Veja a seção "Variáveis de Ambiente" abaixo para detalhes sobre cada variável.
4.  **Defina a senha de criptografia:**
    - Você pode definir manualmente a senha chamando `setEncryptionPassword()` no início da aplicação ou configurando a variável de ambiente `ENCRYPTION_KEY`.
    - Sem essa senha, os dados sensíveis gravados no Firestore não poderão ser descriptografados.
5.  **Inicie os Emuladores Firebase (em um terminal separado):**
    - É altamente recomendado usar os emuladores do Firebase para desenvolvimento local.
    - Se esta é a primeira vez, configure os emuladores: `firebase init emulators` (selecione Firestore, Storage, Functions).
    - Inicie os emuladores: `firebase emulators:start --project=demo-project`
    - Certifique-se de que o `firebase.json` possua a entrada `"storage": { "rules": "storage.rules" }` para que o emulador de Storage possa iniciar.
    - Verifique se os emuladores estão rodando nas portas corretas (Firestore: 8084, Storage: 9200, UI: 4004). O arquivo `firebase.json` está configurado para usar `host: "0.0.0.0"` para os emuladores.

6.  # **Inicie o Servidor de Desenvolvimento Next.js (em outro terminal):**
7.  **Inicie o Servidor de Desenvolvimento Next.js (em outro terminal):**

    ```bash
    pnpm run dev
    ```

    O aplicativo ficará disponível em `http://localhost:9003`.

8.  **Problemas de CORS em ambientes remotos:**
    - Se estiver executando o dev server em uma URL diferente de `localhost` (ex.: Cloud Workstations), adicione essa origem ao array `allowedDevOrigins` em `next.config.mjs`.

### Comandos úteis

- `pnpm run dev` &mdash; inicia o servidor Next.js em modo desenvolvimento na porta `9003` (geralmente com Turbopack).
- `pnpm run dev -- --no-turbo -p 9004` &mdash; executa o servidor usando Webpack ao invés do Turbopack, na porta `9004`, para facilitar a exibição de erros no terminal.
- `pnpm run genkit:dev` &mdash; executa os fluxos de IA em modo de desenvolvimento.
- `pnpm run typecheck` &mdash; verifica os tipos TypeScript.
- `pnpm run lint` &mdash; executa o ESLint.
- `pnpm run test:all` &mdash; executa todos os testes com o Firebase Emulator em execução.
- `./run-tests.sh` &mdash; script direto para rodar os testes (usado por `pnpm run test:all`).
- `git p` &mdash; alias opcional para o comando acima.
- `pnpm run build` &mdash; gera o build de produção.

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar os serviços do Firebase e outras integrações. O arquivo `env.example` serve como um template. Crie um arquivo `.env.local` (que não deve ser commitado) copiando `env.example` e preencha-o com seus valores.

### Variáveis do Firebase Client SDK (Públicas)

Estas variáveis são prefixadas com `NEXT_PUBLIC_` e são seguras para serem expostas no navegador. Elas são usadas para inicializar o Firebase SDK no lado do cliente. Os valores de exemplo fornecidos abaixo devem ser substituídos pelos seus próprios.

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Sua chave de API web do Firebase. (Ex: `AIzaSyDxuqfMWrLWD30JfBQfpyiHnG0ardssEpM`)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `your-project-id.firebaseapp.com` (Substitua 'your-project-id' pelo ID do seu projeto)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `your-project-id` (Substitua pelo ID do seu projeto Firebase)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: `your-project-id.appspot.com` (Substitua 'your-project-id' pelo ID do seu projeto)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: ID do remetente para Cloud Messaging. (Ex: `180993889183`)
- `NEXT_PUBLIC_FIREBASE_APP_ID`: ID do seu aplicativo web Firebase. (Ex: `1:180993889183:web:ee0c3bca0b4830d024a3aa`)
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (Opcional): Para Google Analytics.

Você pode encontrar esses valores nas configurações do seu projeto Firebase:
_Vá para o [Console do Firebase](https://console.firebase.google.com/) -> Seu Projeto -> Configurações do Projeto (ícone de engrenagem) -> Geral -> Seus apps -> SDK setup and configuration (selecione "Config")._

### Variáveis do Firebase Admin SDK (Secretas - Lado do Servidor)

Estas variáveis são usadas para inicializar o Firebase Admin SDK no backend (ex: em Cloud Functions ou rotas de API Next.js). **NUNCA as exponha no código do cliente ou com o prefixo `NEXT_PUBLIC_`.** Em produção, configure-as diretamente no seu ambiente de hospedagem (ex: Vercel Environment Variables, Google Cloud Run secrets). Para desenvolvimento local com funções de servidor, elas devem estar no `.env.local`.

- `FIREBASE_PROJECT_ID`: O ID do seu projeto Firebase. (Deve ser o mesmo que `NEXT_PUBLIC_FIREBASE_PROJECT_ID`).
- `FIREBASE_CLIENT_EMAIL`: O email da conta de serviço do Firebase Admin SDK. (Necessário para algumas operações do Admin SDK).
- `FIREBASE_PRIVATE_KEY`: A chave privada da conta de serviço. (Necessário para algumas operações do Admin SDK).

Para obter `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`:
_No Console do Firebase -> Seu Projeto -> Configurações do Projeto -> Contas de serviço -> Gerar nova chave privada (isso fará o download de um arquivo JSON). O `client_email` e `private_key` estão neste arquivo._
_Ao adicionar `FIREBASE_PRIVATE_KEY` ao seu arquivo `.env.local` ou variável de ambiente, certifique-se de formatar corretamente as quebras de linha (geralmente substituindo `\n` literais por novas linhas reais, ou envolvendo a chave em aspas duplas se o seu sistema `.env` suportar)._

### Variáveis de Configuração do Emulador (Desenvolvimento)

- `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST`: Define o host que o SDK do Firebase do lado do cliente usará para se conectar aos emuladores.
  - Para desenvolvimento local padrão, o valor `localhost` é geralmente recomendado. Se `localhost` não funcionar, `127.0.0.1` pode ser tentado. O valor padrão no `env.example` é `localhost`.
  - Se você estiver acessando seu ambiente de desenvolvimento (ex: Cloud Workstation) por um IP ou nome de host específico e os emuladores estiverem expostos nesse endereço, ajuste conforme necessário.

### Outras Variáveis

- `NEXT_PUBLIC_GAS_PRONTUARIO_URL`: URL do script Google Apps Script para geração de prontuários.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`: Para integração com o Google Calendar (opcional).
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: Chave VAPID para Firebase Cloud Messaging (Web Push). Encontrada no Console do Firebase -> Configurações do Projeto -> Cloud Messaging -> Web configuration -> Web Push certificates.
- `NEXT_PUBLIC_DISABLE_AUTH`: Quando definido como `true`, desativa temporariamente o sistema de login. Por padrão esta variável é `false`, exigindo autenticação real.
- `SENTRY_DSN`: DSN do Sentry usado pelas Cloud Functions para registrar erros.
- `SENTRY_AUTH_TOKEN`: Token utilizado pelo Sentry CLI para enviar sourcemaps durante o build.

## Importante sobre Segurança

- **NUNCA** comite seu arquivo `.env.local` ou qualquer arquivo contendo chaves privadas ou credenciais sensíveis para o seu repositório Git. O arquivo `.env.local` já deve estar no `.gitignore` padrão de projetos Next.js.
- As variáveis `NEXT_PUBLIC_` são visíveis no navegador. Não coloque segredos nelas.
- As credenciais do Firebase Admin SDK (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) concedem acesso total ao seu projeto Firebase e devem ser mantidas em segredo absoluto, apenas no lado do servidor.

## Deploy

### Vercel

1.  Configure no painel da Vercel todas as variáveis de ambiente listadas em `env.example` (incluindo as secretas).
2.  Cada push na branch principal aciona um deploy automático.

### Firebase (Para Firestore Rules, Hosting estático se usado, e Functions)

- Para publicar as regras e o hosting:
  ```bash
  firebase deploy --only hosting,firestore
  ```
- Para fazer deploy das Cloud Functions (se você tiver funções na pasta `functions` gerenciadas pelo Firebase CLI):
  ```bash
  firebase deploy --only functions
  ```

Consulte [docs/blueprint.md](docs/blueprint.md) para uma visão geral das funcionalidades planejadas.
Diretrizes adicionais sobre confiabilidade e processos de desenvolvimento estão em [docs/phase4-reliability.md](docs/phase4-reliability.md).
Os principais fluxos de verificação manual encontram-se em [docs/fluxos-de-teste.md](docs/fluxos-de-teste.md).
O passo a passo para gerar credenciais temporárias de staging está em [docs/staging-credentials.md](docs/staging-credentials.md).
Detalhes sobre logs e alertas estão em [docs/observability.md](docs/observability.md).

## 🏗️ Containerização & Deploy

Este repositório possui Dockerfiles e um `docker-compose.yml` para executar a aplicação Next.js e as Cloud Functions de forma integrada.

### Construir as imagens

```bash
pnpm run docker:build              # imagem do app Next.js
pnpm run docker:functions:build    # imagem das Cloud Functions
```

### Subir os serviços

```bash
pnpm run docker:up
```

Para desligar:

```bash
pnpm run docker:down
```

É possível levantar cada serviço isoladamente, por exemplo `docker-compose up web`.

### Variáveis de ambiente

Utilize arquivos `.env.docker` e `.env.functions` (baseados em `env.example`) para definir as chaves necessárias quando rodar via Docker.

Principais variáveis usadas:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST`
- `NEXT_PUBLIC_DISABLE_AUTH`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `LHCI_GITHUB_APP_TOKEN`

## Como Contribuir

Contribuições são bem-vindas! Consulte o [CONTRIBUTING.md](CONTRIBUTING.md) e o [Código de Conduta](CODE_OF_CONDUCT.md) antes de enviar pull requests.

## Solucao de Problemas

Erros genéricos como **"An unexpected Turbopack error occurred"** costumam estar relacionados a configurações de ambiente ou dependências ausentes. Caso se depare com essa mensagem ao rodar `pnpm run dev`, verifique os pontos abaixo:

1. Execute `pnpm install` para garantir que todas as dependências estejam instaladas.
2. Utilize a versão **Node.js 20.11.0** (padronizada no projeto).
3. Copie `env.example` para `.env.local` e preencha as variáveis necessárias.
4. Apague a pasta `.next` (cache do Next.js) e tente novamente: `rm -rf .next && pnpm run dev`.
5. Observe o log completo gerado pelo `next dev` para identificar possíveis mensagens adicionais de erro.
6. Se encontrar a mensagem **"React.Children.only expected to receive a single React element child"**, verifique se componentes como `Button`, `FormControl` ou `SidebarMenuButton` (quando usados com `asChild`) recebem **apenas um** elemento React filho. Envolva múltiplos elementos em uma tag `<div>` ou `<span>` caso necessário. O projeto inclui uma regra do **ESLint** (`local-rules/aschild-single-child`) que sinaliza esse problema durante o desenvolvimento.

## Segurança e Atualizações

- Utilizamos o [Snyk](https://snyk.io/) para inspeções de vulnerabilidades (workflow `security.yml`).
- O [Dependabot](https://github.com/dependabot) atualiza dependências semanalmente.
- Há também o workflow `security-scan.yml` que roda `pnpm audit --audit-level=moderate` todo mês.
