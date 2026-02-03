# Padrões de Repositories

## Objetivo

Abstrair o acesso a dados no Firestore: interface abstrata no domínio e implementação em infraestrutura (Firebase).

## Interface Abstrata

- Classe abstrata com prefixo `I`: `IEventRepository`.
- Métodos que o UseCase precisa: `findById`, `findBySeasonId`, `create`, `update`, `delete` (soft delete quando aplicável), etc.
- Tipos de entrada/saída em termos de **Entities** (e DTOs de query quando fizer sentido).

Exemplo:

```typescript
export abstract class IEventRepository {
  abstract findById(id: string): Promise<EventEntity | null>;
  abstract findBySeasonId(seasonId: string, opts?: ListOptions): Promise<EventEntity[]>;
  abstract create(data: CreateEventData): Promise<EventEntity>;
  abstract update(id: string, data: Partial<EventEntity>): Promise<EventEntity>;
  abstract delete(id: string): Promise<void>;
}
```

## Implementação Firebase

- Nome: `EventFirebaseRepository implements IEventRepository`.
- Depende do serviço que encapsula Firestore (ex.: `FirebaseService` ou `FirestoreService`).
- Responsabilidades:
  - Mapear Entity ↔ documento Firestore (incluindo timestamps, `externalId`, etc.).
  - Usar coleção definida no modelo (ex.: `events`).
  - Aplicar soft delete quando o modelo tiver `deletedAt`/`deletedDate`.
  - Não conter lógica de negócio.

## Registro no Módulo

- Provider: `{ provide: IEventRepository, useClass: EventFirebaseRepository }`.
- UseCases recebem `IEventRepository` por injeção.

## Transações

- Firestore suporta transações. Para operações que precisem de consistência (ex.: criar evento e atualizar standing), usar `runTransaction` do cliente Firestore dentro do repositório ou em um serviço de aplicação que chame mais de um repositório na mesma transação (quando possível).

## Conversão Document → Entity

- Documento Firestore (com `Timestamp`) → converter datas e montar `EventEntity` (ou usar método estático `EventEntity.fromFirestore(doc)`).
- Entity → mapa simples para `set`/`update` no Firestore; timestamps `createdAt`/`updatedAt` gerenciados na escrita.

## Referências

- [Padrões Firebase](./06-firebase-patterns.md)
- [Modelo de Dados](../product/data-model.md)
- [TrinoCore - Repositories](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/05-repositories.md)
