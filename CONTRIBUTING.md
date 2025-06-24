# Contribuindo

Obrigado por contribuir com o projeto **Thalamus**. Este guia descreve como configurar o ambiente e enviar Pull Requests.

## Clonagem

Utilize o repositório oficial:

```bash
git clone https://github.com/brunenrique/bhc.git
cd bhc
```

## Instalação

1. Use **Node.js 20.11** (via [Volta](https://volta.sh) ou `nvm`).
2. Instale as dependências:

```bash
pnpm install
```

3. Copie `env.example` para `.env.local` e preencha as chaves.

## Execução de Testes

1. Inicie os emuladores do Firebase quando necessário:

```bash
firebase emulators:start --project=demo-project
```

2. Execute as verificações locais:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:all
```

O script `./run-tests.sh` também executa a bateria completa de testes.

## Diretrizes para Pull Requests

- Crie um branch a partir de `main`, por exemplo `feat/nome-do-recurso`.
- Siga o padrão **Conventional Commits** nas mensagens de commit.
- Garanta que `pnpm run lint`, `pnpm run typecheck` e `pnpm run test:all` estejam passando antes de abrir o PR.
- Descreva claramente o que foi feito e vincule as issues relacionadas.
- Prefira PRs pequenas e focadas.
