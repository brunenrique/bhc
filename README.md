# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Development

### Setup

Install the project dependencies using `npm`:

```bash
npm install
```

### Run the development server

Start the local dev server at `http://localhost:9002`:

```bash
npm run dev
```

### Run the type checker

Validate the TypeScript types:

```bash
npm run typecheck
```

## Environment Variables

Copy `env.example` to `env.local` (or configure these variables in your Vercel project) and fill in the values:

```bash
cp env.example env.local
```

The variables include your Firebase configuration and the credentials for the Firebase Admin SDK (`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY`).

## Deploy

### Configurar variáveis no Vercel

Defina todas as chaves do arquivo `env.example` nas configurações do projeto no Vercel. Elas serão expostas no build e em tempo de execução.

### Build

```bash
npm run build
```

### Deploy no Vercel

O repositório pode ser conectado ao Vercel para deploy contínuo. Após cada push na branch principal, o Vercel realizará o build e publicará automaticamente.

### Deploy no Firebase

Para hospedar e publicar as regras do Firestore:

```bash
firebase deploy --only hosting,firestore
```

### Logs e Rollback

No Firebase Console, acesse **Functions > Logs** para acompanhar a execução das funções ou realizar rollback de deploys. No Vercel, os logs ficam na aba **Deployments**.


For a full blueprint of the application, see [docs/blueprint.md](docs/blueprint.md).


## Deploy Final

1. Mescle a branch de funcionalidade na `main`:
   ```bash
   git checkout main
   git merge <feature/branch>
   ```
2. Aguarde o CI finalizar com sucesso no GitHub.
3. O push na `main` aciona o deploy automático no Vercel. Em seguida execute:
   ```bash
   firebase deploy --only hosting,firestore
   ```
4. Verifique o status dos deploys no painel do Vercel e no Firebase Console.
5. Para rollback utilize:
   ```bash
   firebase deploy --only hosting@<versao>
   ```
