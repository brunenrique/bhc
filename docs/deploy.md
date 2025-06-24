# Deploy da Aplicação

Este guia resume como executar o projeto via Docker e como publicá-lo na Vercel.

## Docker

1. Gere a imagem do app:

   ```bash
   docker build -t thalamus .
   ```

2. Copie `env.example` para `.env` e preencha os valores conforme seu ambiente.

3. Inicie os serviços:

   ```bash
   docker-compose up -d
   ```

   O `docker-compose` lê as variáveis definidas no `.env`.

## Vercel

1. Crie um novo projeto e associe este repositório à Vercel.
2. Defina todas as variáveis listadas em `env.example` nas configurações do projeto.
3. Utilize o comando de build padrão:

   ```bash
   pnpm run build
   ```

   A Vercel irá executar `next start` automaticamente após o build.

Com as variáveis configuradas, cada push para a branch principal gerará um deploy automático.
