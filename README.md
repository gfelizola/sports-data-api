# Sports Data API

API backend (SaaS) para fornecimento de dados esportivos: jogos, campeonatos, temporadas, times, jogadores e entidades relacionadas. Suporta múltiplos esportes (futebol, basquete, futebol americano, baseball, F1 e outros) com armazenamento no Firebase e notificação de clientes via webhooks.

## Visão Geral

- **Stack**: Node.js, NestJS
- **Banco de dados**: Firebase (Firestore)
- **Funcionalidades**: API REST versionada, webhooks para clientes, atualização automatizada de dados. Documentação completa da API com **Swagger (OpenAPI)** e **Scalar** (cada endpoint com DTOs de request e response).
- **Esportes**: Modelo genérico para esportes coletivos e individuais

## Pré-requisitos

- [Node](https://nodejs.org/) (v24 LTS) ou [Bun](https://bun.sh/) (runtime compatível com Node)
- [Bun](https://bun.sh/) como package manager e executor de scripts
- Conta [Firebase](https://firebase.google.com/) (Firestore)
- (Opcional) Credenciais de APIs externas para ingestão de dados

## Estrutura do Repositório

```
sports-data-api/
├── docs/                    # Documentação
│   ├── product/             # Visão do produto e escopo
│   └── code-standards/      # Padrões técnicos (NestJS, Firebase, API)
├── src/                     # Código fonte (a ser implementado)
└── README.md
```

## Documentação

- **[Visão do produto e escopo](./docs/product/README.md)** – Esportes cobertos, entidades, casos de uso
- **[Padrões de código e arquitetura](./docs/code-standards/README.md)** – Arquitetura, convenções, API, webhooks, Firebase, automação
- **[Documentação de API (Swagger + Scalar)](./docs/code-standards/08-api-documentation.md)** – Regra de documentar todos os endpoints com DTOs de request/response; uso de Swagger e Scalar
- **[Plano de desenvolvimento](./docs/DEVELOPMENT_PLAN.md)** – Plano completo com checklist para marcar e atualizar o que já foi desenvolvido

## Setup

Requer **Node.js 24 LTS** (ou Bun como runtime). O projeto usa **Bun** como package manager e para executar os scripts.

```bash
# Instalar Bun (se necessário)
# https://bun.sh/docs/installation

# Dependências
bun install

# Variáveis de ambiente (copiar .env.example e configurar)
cp .env.example .env

# Desenvolvimento
bun run start:dev

# Build
bun run build

# Testes
bun run test
bun run test:cov

# Lint e formatação (Biome)
bun run biome:chk
bun run biome:fix
```

## Documentação da API (Swagger e Scalar)

Com a aplicação rodando (ex.: `bun run start:dev`):

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs) – documentação interativa e spec OpenAPI.
- **Scalar**: [http://localhost:3000/reference](http://localhost:3000/reference) – referência da API com tema customizado.
- **OpenAPI JSON**: [http://localhost:3000/docs-json](http://localhost:3000/docs-json) – especificação em JSON.

Controllers e DTOs estão documentados com `@ApiTags`, `@ApiOperation`, `@ApiResponse` e `@ApiProperty` para refletir todos os endpoints e schemas no Swagger e no Scalar.

## Firebase (Firestore)

A API usa **apenas o banco Firestore nomeado `sports-data`** (não o banco padrão `(default)`).

1. **Criar projeto** no [Console Firebase](https://console.firebase.google.com/) e ativar o **Firestore**.
2. **Criar o banco nomeado**  
   No Firestore, em “Databases”, criar um novo banco com ID **`sports-data`** (região conforme seu projeto).
3. **Credenciais**  
   Em “Configurações do projeto” → “Contas de serviço”, gerar uma chave (JSON) da conta de serviço do Firebase Admin.
4. **Variáveis de ambiente** (em produção ou para rodar local com Firestore real):
   - **Opção A**: Definir `GOOGLE_APPLICATION_CREDENTIALS` com o caminho do arquivo JSON da conta de serviço.
   - **Opção B**: Definir `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` (valor do JSON, com `\n` preservado no private key).
   - `FIREBASE_FIRESTORE_DATABASE_ID` tem default `sports-data`; só altere se usar outro ID de banco.
5. **Regras de segurança**  
   O arquivo `firestore.rules` na raiz nega acesso direto de clientes; o acesso é somente via API (Admin SDK). Para publicar as regras no banco `sports-data`:
   ```bash
   firebase use <seu-project-id>
   firebase deploy --only firestore:rules
   ```
   O `firebase.json` já aponta as regras para o database `sports-data`.

Em **testes** e em **dev** sem credenciais, o `FirebaseService.getFirestore()` retorna `null` e a API sobe normalmente (rotas que não usam Firestore continuam funcionando).

## Licença

Projeto privado.
