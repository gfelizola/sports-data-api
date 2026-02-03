# Convenções de Nomenclatura

## Objetivo

Manter consistência e legibilidade no Sports Data API, alinhado ao padrão do TrinoCore.

## Arquivos

| Tipo            | Padrão                 | Exemplo                        |
|-----------------|------------------------|--------------------------------|
| Controller      | `*.controller.ts`      | `sport.controller.ts`         |
| UseCase         | `*.usecase.ts`         | `create-event.usecase.ts`      |
| Repository      | `*.repository.ts`      | `event.repository.ts` (interface) |
| Repository impl.| `*-firebase.repository.ts` | `event-firebase.repository.ts` |
| Service         | `*.service.ts`         | `webhook-dispatch.service.ts`  |
| Entity          | `*.entity.ts`          | `event.entity.ts`              |
| DTO             | `*.dto.ts`             | `create-event.dto.ts`          |
| Enum            | `*.enum.ts`            | `event-status.enum.ts`         |
| Module          | `*.module.ts`          | `sport.module.ts`              |
| Errors          | `*.errors.ts`          | `sport.errors.ts`               |
| Test            | `*.spec.ts`            | `create-event.usecase.spec.ts`  |

## Classes

- **PascalCase** para classes: `EventEntity`, `CreateEventUseCase`, `EventFirebaseRepository`.
- **Interface abstrata de repositório**: prefixo `I` → `IEventRepository` (abstract class no NestJS).

## Variáveis e Métodos

- **camelCase** para variáveis, métodos e parâmetros: `findById`, `sportId`, `getEventsBySeason`.

## Constantes

- **UPPER_SNAKE_CASE**: `MAX_PAGE_SIZE`, `WEBHOOK_SIGNATURE_HEADER`.

## Enums

- PascalCase, valores em `snake_case` quando expostos na API: `EventStatus.scheduled`, `SportCategory.team`.

## DTOs

| Tipo     | Padrão              | Exemplo                 |
|----------|---------------------|-------------------------|
| Create   | `Create[Entity]Dto`  | `CreateEventDto`        |
| Update   | `Update[Entity]Dto`  | `UpdateEventDto`        |
| Response | `[Entity]ResponseDto`| `EventResponseDto`      |
| Query    | `List[Entity]QueryDto` / `Get[Entity]QueryDto` | `ListEventsQueryDto` |

## UseCases

Padrão: ** [Ação][Entidade]UseCase**.

- `CreateEventUseCase`, `UpdateEventUseCase`, `GetEventByIdUseCase`, `ListEventsUseCase`, `DeleteEventUseCase`.
- Ações: Create, Update, Delete, Get, List, Sync (para automação).

## Repositories

- **Interface**: `IEventRepository` (abstract class).
- **Implementação**: `EventFirebaseRepository implements IEventRepository`.

## Controllers

- Nome descritivo por recurso: `SportController`, `EventController`, `WebhookEndpointController`.

## Códigos de Erro

- Enum por módulo: `SportErrorsCode`, `EventErrorsCode`.
- Valores: `UPPER_SNAKE_CASE` com prefixo do módulo: `EVENT_NOT_FOUND`, `SPORT_BAD_REQUEST`.

## Path Aliases

- `@/*` → `src/*`
- Exemplo: `import { EventEntity } from "@/event/entities/event.entity";`

## Referências

- [TrinoCore - Convenções de Nomenclatura](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/02-naming-conventions.md)
