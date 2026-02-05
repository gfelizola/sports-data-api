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
   - **Opção B**: Definir `APP_PROJECT_ID`, `APP_SA_CLIENT_EMAIL` e `APP_SA_PRIVATE_KEY` (valor do JSON, com `\n` preservado no private key). Mesmo padrão no `.env` local e no App Hosting (prefixos `FIREBASE_`, `X_GOOGLE_`, `EXT_` são reservados no App Hosting).
   - `APP_FIRESTORE_DATABASE_ID` tem default `sports-data`; só altere se usar outro ID de banco.
5. **Regras de segurança**  
   O arquivo `firestore.rules` na raiz nega acesso direto de clientes; o acesso é somente via API (Admin SDK). Para publicar as regras no banco `sports-data`:
   ```bash
   firebase use <seu-project-id>
   firebase deploy --only firestore:rules
   ```
   O `firebase.json` já aponta as regras para o database `sports-data`.

Em **testes** e em **dev** sem credenciais, o `FirebaseService.getFirestore()` retorna `null` e a API sobe normalmente (rotas que não usam Firestore continuam funcionando).

## Firebase App Hosting

A API pode ser implantada no [Firebase App Hosting](https://firebase.google.com/docs/app-hosting), que faz o build e executa o backend no **Cloud Run**. O repositório já inclui o arquivo de configuração `apphosting.yaml` na raiz.

### Pré-requisitos

- Projeto Firebase com Firestore (e banco `sports-data`) configurado
- Repositório no GitHub conectado ao Firebase
- [Firebase CLI](https://firebase.google.com/docs/cli) (v13.15.4+) com login

### Criar o backend no App Hosting

**Console:** Build > App Hosting > **Create backend** (ou Get started). Siga o assistente: região, repositório GitHub, branch (ex.: `main`), **root directory** (raiz do repo, onde está o `package.json`).

**CLI:**

```bash
firebase apphosting:backends:create --project SEU_PROJECT_ID
```

Informe o diretório raiz da app (onde está `apphosting.yaml` e `package.json`), a branch ativa e se deseja rollouts automáticos.

### Build e run (apphosting.yaml)

O `apphosting.yaml` já define:

- **buildCommand:** `npm run build` — instala dependências (npm) e roda `nest build`, gerando `dist/`.
- **runCommand:** `node dist/main.js` — inicia a API em produção.
- **outputFiles.serverApp.include:** `[dist]` — apenas a pasta `dist` é incluída no container (o buildpack já cuida de `node_modules`).

O App Hosting usa **npm** no build (não Bun). O script `build` do `package.json` (`nest build`) é compatível.

### Variáveis de ambiente e secrets

No `apphosting.yaml` a seção `env` define variáveis disponíveis em **runtime** (e, se necessário, em build). **Não** defina `PORT`: o App Hosting/Cloud Run define automaticamente.

**Importante:** o App Hosting reserva os prefixos `FIREBASE_`, `X_GOOGLE_` e `EXT_` para variáveis de ambiente. Use sempre **`APP_*`** (mesmo padrão no `.env` local e no App Hosting).

| Variável | Obrigatório | Como configurar |
|----------|-------------|------------------|
| `NODE_ENV` | Sim | Já em `apphosting.yaml` como `production`. |
| `APP_FIRESTORE_DATABASE_ID` | Sim | Já em `apphosting.yaml` como `sports-data`. |
| `APP_PROJECT_ID` | Sim (prod) | Substituir `SEU_PROJECT_ID` em `apphosting.yaml` pelo ID do projeto ou usar [Secret Manager](#secrets). |
| `APP_SA_CLIENT_EMAIL` | Sim (com chave) | Usar [Secret Manager](#secrets). |
| `APP_SA_PRIVATE_KEY` | Sim (com chave) | Usar [Secret Manager](#secrets). |
| `APP_VERSION` | Opcional | Já em `apphosting.yaml`; ajustar se quiser. |
| `CORS_ORIGINS` | Opcional | Descomentar e preencher em `apphosting.yaml` ou definir como secret. |

#### Secrets (credenciais Firebase)

Valores sensíveis devem ser armazenados no **Cloud Secret Manager** e referenciados no `apphosting.yaml`. **Use nomes `APP_*`**; quando a CLI perguntar "What environment variable name would you like to use?", informe o mesmo nome (ex.: `APP_SA_CLIENT_EMAIL`):

```bash
firebase apphosting:secrets:set APP_SA_CLIENT_EMAIL --project SEU_PROJECT_ID
firebase apphosting:secrets:set APP_SA_PRIVATE_KEY --project SEU_PROJECT_ID
```

No `apphosting.yaml`, descomente e use:

```yaml
env:
  - variable: APP_PROJECT_ID
    value: SEU_PROJECT_ID   # ou secret: APP_PROJECT_ID se preferir
  - variable: APP_SA_CLIENT_EMAIL
    secret: APP_SA_CLIENT_EMAIL
  - variable: APP_SA_PRIVATE_KEY
    secret: APP_SA_PRIVATE_KEY
```

Assim as credenciais não ficam no código. A conta de serviço do Cloud Run já pode acessar o Firestore; se usar apenas `applicationDefault()`, em alguns casos só `APP_PROJECT_ID` (e `APP_FIRESTORE_DATABASE_ID`) é necessário — teste conforme sua configuração.

### Ajustes opcionais (runConfig)

No `apphosting.yaml`, `runConfig` controla CPU, memória e instâncias do Cloud Run:

- `cpu`, `memoryMiB`: aumentar se a API precisar de mais recurso.
- `minInstances`: 0 para escala a zero; > 0 para reduzir cold start.
- `maxInstances`, `concurrency`: limites de escalabilidade.

Documentação completa: [Configure and manage App Hosting backends](https://firebase.google.com/docs/app-hosting/configure).

## Licença

Projeto privado.
