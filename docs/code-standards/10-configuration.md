# Configuração

## Objetivo

Padrões para configuração do projeto: TypeScript, NestJS, variáveis de ambiente e ferramentas de desenvolvimento.

## TypeScript

- **tsconfig.json**: `strict: true`; path aliases `@/*` → `src/*`.
- **tsconfig.build.json**: excluir testes; incluir apenas `src` necessário para o build.

## NestJS

- **nest-cli.json**: `typeCheck: true`; manter estrutura de pastas padrão.
- **main.ts**: versionamento de API (ex.: `enableVersioning({ type: VersioningType.URI, prefix: 'v' })`), validação global (ValidationPipe), Swagger, CORS se necessário.

## Variáveis de Ambiente

Usar **ConfigModule** (NestJS Config) com arquivo `.env` (nunca commitado). Exemplos:

- **App**: `NODE_ENV`, `APP_VERSION`, `PORT`
- **Firebase**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` ou `FIREBASE_SERVICE_ACCOUNT_PATH`
- **API externa (provedores de dados)**: `API_FOOTBALL_KEY`, `RAPIDAPI_KEY`, etc.
- **Webhooks**: `WEBHOOK_MAX_RETRIES`, `WEBHOOK_TIMEOUT_MS`
- **Auth**: configuração de API Key (se armazenada em env para testes)

Acesso via `ConfigService.get<string>('KEY')` nos serviços.

## Jest

- **jest.config.js** ou configuração no `package.json`: `moduleNameMapper` para path alias (`@/*` → `src/*`).
- Cobertura: incluir `src/`, excluir mocks e arquivos de configuração.

## Formatação e Lint

- Definir padrão (ex.: Biome, ESLint + Prettier); configurar no projeto e no CI.
- Manter consistência com o restante do codebase (TrinoCore usa Biome; pode ser replicado).

## .env.example

- Incluir no repositório um `.env.example` com todas as chaves necessárias e valores placeholder (sem segredos reais).

## Referências

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [TrinoCore - Configuração](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/22-configuration.md)
