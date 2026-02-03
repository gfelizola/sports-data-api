# Documentação de API (Swagger + Scalar)

## Objetivo

Garantir que **toda a API** esteja documentada: **cada endpoint** com **DTOs de request e response** explícitos, gerando especificação OpenAPI (Swagger) e expondo a documentação interativa via **Scalar**. Nada fica sem documentação.

## Stack de documentação

- **OpenAPI (Swagger)** – Geração da especificação a partir dos decorators do NestJS (`@nestjs/swagger`). Define contratos de request/response, segurança e versionamento.
- **Scalar** – UI moderna de documentação que consome o documento OpenAPI gerado pelo Swagger. Oferece referência da API, exemplos e testes (ex.: cURL, clientes) de forma integrada.

Fluxo: decorators nos controllers e DTOs → documento OpenAPI → Scalar exibe e permite testar a API.

## Exigência: documentação em todos os endpoints

- **Todo endpoint** deve ter:
  - **Request**: body (quando houver) documentado com um DTO que use `@ApiProperty()` / `@ApiPropertyOptional()` em todas as propriedades; query params e path params documentados com `@ApiQuery()` e `@ApiParam()` (ou DTO de query com `@ApiProperty`).
  - **Response**: tipo de retorno documentado com um DTO de response (`@ApiResponse({ type: XxxResponseDto })` ou equivalente); códigos de erro principais (400, 401, 404, 500) com `@ApiResponse({ status, description })`.
- Nenhum endpoint pode ficar sem DTOs de request/response na documentação. Isso garante que a especificação OpenAPI (e portanto o Scalar) reflitam a API por completo.

## Configuração no main.ts

### 1. Gerar o documento OpenAPI com Swagger

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Sports Data API')
  .setDescription('API de dados esportivos: esportes, ligas, temporadas, times, jogadores, jogos, webhooks. Documentação completa com DTOs de request e response.')
  .setVersion(process.env.APP_VERSION ?? '1.0.0')
  .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'apiKey')
  .addTag('sports', 'Esportes')
  .addTag('leagues', 'Ligas')
  .addTag('events', 'Jogos / Partidas')
  .addTag('webhooks', 'Webhooks')
  // ... outras tags
  .build();

const document = SwaggerModule.createDocument(app, config);
```

### 2. Servir a documentação com Scalar

```typescript
import { apiReference } from '@scalar/nestjs-api-reference';

// Opção A: passar o documento diretamente (recomendado)
app.use('/docs', apiReference({
  content: document,
  theme: 'purple', // ou 'default', 'blue', etc.
}));

// Opção B: servir OpenAPI em JSON e apontar Scalar para a URL
SwaggerModule.setup('openapi', app, document, { jsonDocumentUrl: 'openapi.json' });
app.use('/docs', apiReference({ url: '/openapi.json' }));
```

- **Rota da documentação**: por exemplo `/docs` (Scalar) e, se desejar, `/openapi.json` para o JSON da spec.
- **Dependência**: `npm install @scalar/nestjs-api-reference`. Manter `@nestjs/swagger` para os decorators e `createDocument`.

## Decorators por endpoint

Cada rota deve ter:

| Decorator | Uso |
|-----------|-----|
| `@ApiOperation({ summary: '...', description: '...' })` | Descrição da operação |
| `@ApiTags('...')` | Agrupamento no Scalar (ex.: 'events') |
| `@ApiSecurity('apiKey')` | Quando a rota exige API Key |
| `@ApiParam({ name, description })` | Parâmetros de path |
| `@ApiQuery(...)` ou DTO de query com `@ApiProperty` | Query params |
| `@ApiBody({ type: XxxDto })` | Body (POST/PUT/PATCH) quando aplicável |
| `@ApiResponse({ status: 200, description: '...', type: XxxResponseDto })` | Sucesso e tipo do response |
| `@ApiResponse({ status: 400, description: '...' })` | Erros 400, 401, 404, 500 |

Exemplo de endpoint documentado com request e response DTOs:

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Cria um novo jogo', description: 'Registra um novo evento (jogo/partida) na temporada.' })
@ApiBody({ type: CreateEventDto })
@ApiResponse({ status: HttpStatus.CREATED, description: 'Jogo criado', type: EventResponseDto })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'API key inválida' })
async create(@Body() dto: CreateEventDto): Promise<EventResponseDto> {
  return this.createEventUseCase.execute(dto);
}
```

## DTOs: request e response

### Request DTOs (body, query)

- **Todas** as propriedades devem ter `@ApiProperty()` ou `@ApiPropertyOptional()` com `description` e, quando útil, `example`.
- Usar `@ApiProperty({ enum: XxxEnum })` para enums.
- Para listagens com filtros: um **query DTO** (ex.: `ListEventsQueryDto`) com `page`, `limit`, `seasonId`, `status`, etc., todos documentados com `@ApiPropertyOptional({ description: '...' })`.

Exemplo:

```typescript
export class CreateEventDto {
  @ApiProperty({ description: 'ID da temporada', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @IsString()
  seasonId: string;

  @ApiPropertyOptional({ description: 'Nome ou descrição do jogo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Status do jogo', enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiProperty({ description: 'Data/hora prevista (ISO 8601)', example: '2025-02-10T19:00:00Z' })
  @IsISO8601()
  scheduledAt: string;
}
```

### Response DTOs

- **Todo** retorno de endpoint deve ser tipado com um DTO de response (ex.: `EventResponseDto`, `ListEventsResponseDto`).
- Todas as propriedades do DTO com `@ApiProperty()` / `@ApiPropertyOptional()` e `description` (e `example` quando ajudar).
- Listas paginadas: DTO genérico, por exemplo `PaginatedResponseDto<T>` ou um DTO específico com `items: EventResponseDto[]`, `total: number`, `page`, `limit`.

Exemplo:

```typescript
export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  seasonId: string;

  @ApiProperty({ enum: EventStatus })
  status: EventStatus;

  @ApiProperty()
  scheduledAt: string;

  @ApiPropertyOptional()
  score?: Record<string, number>;
}
```

Assim, tanto o Swagger quanto o Scalar exibem request e response completos para cada operação.

## Versionamento

- Controllers usam `version: '1'` (ex.: `/v1/events`). O documento OpenAPI pode refletir isso com tags ou prefixo na base path.
- Evitar quebra de contrato na mesma versão; para mudanças incompatíveis, criar nova versão (ex.: v2) e documentar ambas se necessário.

## Boas práticas

- **Documentar tudo**: nenhum endpoint sem DTOs de request/response e sem `@ApiResponse` para sucesso e erros principais.
- **Exemplos**: usar `example` nos `@ApiProperty` para facilitar testes no Scalar.
- **Descrições claras**: `summary` e `description` em português ou inglês de forma consistente.
- **Tags**: agrupar por recurso (`sports`, `leagues`, `events`, `webhooks`, etc.) para navegação no Scalar.
- **Reuso**: DTOs compartilhados (ex.: paginação, erros) devem estar documentados e referenciados nos endpoints.

## Referências

- [NestJS OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction)
- [Scalar – NestJS](https://guides.scalar.com/scalar/scalar-api-references/integrations/nestjs)
- [@scalar/nestjs-api-reference (npm)](https://www.npmjs.com/package/@scalar/nestjs-api-reference)
- [TrinoCore – Documentação de API](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/21-api-documentation.md)
