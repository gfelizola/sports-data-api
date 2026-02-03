# Tratamento de Erros

## Objetivo

Padronizar códigos de erro, exceções HTTP e mensagens retornadas pela API.

## Códigos de Erro por Módulo

- Cada módulo define um enum de códigos: `SportErrorsCode`, `EventErrorsCode`, `WebhookErrorsCode`, etc.
- Valores em UPPER_SNAKE_CASE com prefixo do módulo: `EVENT_NOT_FOUND`, `EVENT_BAD_REQUEST`, `SPORT_NOT_FOUND`.

Exemplo:

```typescript
// event.errors.ts
export enum EventErrorsCode {
  not_found = "EVENT_NOT_FOUND",
  bad_request = "EVENT_BAD_REQUEST",
  conflict = "EVENT_CONFLICT",
  internal_error = "EVENT_INTERNAL_ERROR",
}
```

## Exceções NestJS

- `NotFoundException(EventErrorsCode.not_found)` quando recurso não existe.
- `BadRequestException(EventErrorsCode.bad_request)` para validação de negócio ou parâmetros inválidos.
- `ConflictException` quando houver conflito (ex.: externalId duplicado).
- Evitar expor detalhes internos em produção; usar mensagem genérica ou código para o cliente.

## Resposta de Erro Padronizada

- Formato consistente: `{ "statusCode": 404, "message": "EVENT_NOT_FOUND", "error": "Not Found" }` (padrão NestJS) ou customizado com `code` e `message` traduzível.
- Filter de exceções (Exception Filter) pode padronizar o corpo para todas as exceções.

## UseCases

- UseCases lançam exceções; não capturar para retornar objeto de erro a menos que se use Result Pattern.
- Logar erros inesperados antes de relançar.

## Referências

- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [TrinoCore - Tratamento de Erros](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/09-error-handling.md)
