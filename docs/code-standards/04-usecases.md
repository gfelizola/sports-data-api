# Padrões de Use Cases

## Objetivo

Definir a estrutura e o comportamento dos Use Cases: orquestração de negócio, repositórios e emissão de eventos (para webhooks).

## Estrutura Básica

- Uma classe por caso de uso: `CreateEventUseCase`, `UpdateEventUseCase`, `ListEventsUseCase`, etc.
- Método principal: `execute(...args): Promise<T>`.
- Injeção de repositórios (e, quando necessário, `EventEmitter2`) no construtor.

Exemplo:

```typescript
@Injectable()
export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException(EventErrorsCode.not_found);
    // ... validações e atualização
    const updated = await this.eventRepository.update(id, data);
    this.eventEmitter.emit(WebhookEventTypes.EVENT_UPDATED, { event: updated });
    return this.toResponseDto(updated);
  }
}
```

## Responsabilidades

- Validar regras de negócio.
- Chamar repositórios para ler/escrever.
- Emitir eventos tipados (enum) quando houver alteração relevante para webhooks (criação, atualização, exclusão).
- Converter Entity → ResponseDto no UseCase ou em mapper dedicado.
- Lançar exceções do NestJS (`NotFoundException`, `BadRequestException`) com códigos de erro do módulo.

## Logger

- Injetar `Logger` (NestJS) ou logger customizado quando necessário; logar falhas e operações críticas, sem poluir com log de toda leitura.

## Result Pattern (opcional)

- Se o projeto adotar Result Pattern (sucesso/falha sem exceção), manter consistência: retornar `Result<T, Error>` e o controller traduz em HTTP.

## Eventos para Webhooks

- Usar enum de eventos (ex.: `WebhookEventTypes.EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_DELETED`, `STANDING_UPDATED`).
- Emitir com payload mínimo necessário para o serviço de webhook montar o body (ex.: `{ entityType, entityId, payload }`).
- O serviço de dispatch de webhooks assina e envia para os endpoints inscritos.

## Não fazer em UseCases

- Acesso direto a HTTP ou Firestore.
- Lógica de apresentação (formatação de resposta além do DTO).
- Conhecer detalhes de implementação do repositório (Firestore, coleções).

## Referências

- [Webhooks](./07-webhooks.md)
- [TrinoCore - Use Cases](https://github.com/trinobank/TrinoCore/blob/main/docs/code-standards/04-usecases.md)
