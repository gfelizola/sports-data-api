# Padrões de Controllers

## Objetivo

Definir padrões para Controllers no Sports Data API: versionamento, documentação Swagger e autenticação (API Key).

## Estrutura Básica

- `@Controller()` com `path` e `version`.
- Autenticação via API Key (ou JWT): documentar no Swagger com decorator apropriado (ex.: `@ApiSecurity('apiKey')` ou `@ApiBearerAuth()`).

Exemplo:

```typescript
@ApiSecurity("apiKey")
@Controller({
  path: "sports",
  version: "1",
})
export class SportController {
  constructor(
    private readonly listSportsUseCase: ListSportsUseCase,
    private readonly getSportByIdUseCase: GetSportByIdUseCase,
  ) {}
}
```

## Versionamento

- **URI Versioning**: sempre especificar `version: "1"` (ou "2") no decorator do controller.
- Configurar no `main.ts` o versionamento por URI (ex.: `/v1/sports`).

## Métodos HTTP e Códigos

- `@Get()`, `@Post()`, `@Put(":id")`, `@Patch(":id")`, `@Delete(":id")`.
- Usar `@HttpCode(HttpStatus.OK)`, `HttpStatus.CREATED`, `HttpStatus.NO_CONTENT`, etc., de forma explícita.

## Documentação Swagger

- `@ApiOperation({ summary: "..." })` em cada endpoint.
- `@ApiResponse()` para sucesso e erros (400, 401, 404, 500).
- `@ApiParam()`, `@ApiQuery()` quando aplicável.
- DTOs com `@ApiProperty()` / `@ApiPropertyOptional()`.

## Serialização

- Usar `@SerializeOptions({ type: XxxResponseDto })` quando necessário para garantir que apenas propriedades do DTO sejam retornadas.

## Autenticação

- Rotas protegidas: Guard de API Key (header ou query) aplicado globalmente ou por controller.
- Rotas públicas (ex.: health): decorator `@IsPublic()` se houver guard global.

## Injeção de Dependências

- Controllers recebem apenas **UseCases** (não repositórios nem Firebase diretamente).

## Padrões de Resposta

- **Lista (com paginação)**: `ListAndTotalResponseDto<EventResponseDto>` ou similar.
- **Item único**: `EventResponseDto`.
- **Criação**: `HttpStatus.CREATED` + body com recurso criado.
- **Deleção**: `HttpStatus.NO_CONTENT` sem body.

## Referências

- [Documentação de API](./08-api-documentation.md)
- [TrinoCore - Controllers](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/03-controllers.md)
