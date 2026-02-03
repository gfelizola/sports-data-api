# Visão Geral da Arquitetura

## Objetivo

Descrever a arquitetura do Sports Data API: Clean Architecture e DDD com NestJS e Firebase (Firestore).

## Princípios

1. **Camada de Apresentação (Controllers)**: Recebe HTTP, valida autenticação (API Key), chama UseCases, retorna DTOs.
2. **Camada de Aplicação (UseCases)**: Lógica de negócio, orquestra repositórios e dispara eventos (ex.: para webhooks).
3. **Camada de Domínio (Entities)**: Entidades de negócio (Sport, League, Season, Event, Team, Player, etc.).
4. **Camada de Infraestrutura (Repositories)**: Acesso ao Firestore; implementações de interfaces abstratas.

## Estrutura de Pastas

```
src/
├── app.module.ts
├── main.ts
├── config/
│   └── configs.ts
├── sport/
│   ├── sport.controller.ts
│   ├── sport.module.ts
│   ├── sport.errors.ts
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── repositories/
│   └── usecases/
├── league/
│   ├── league.controller.ts
│   ├── league.module.ts
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── season/
├── team/
├── player/
├── event/
├── venue/
├── standing/
├── webhook/
│   ├── webhook.module.ts
│   ├── webhook-dispatch.service.ts
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── automation/
│   ├── automation.module.ts
│   ├── jobs/
│   └── providers/          # Adaptadores para APIs externas
├── shared/
│   ├── dto/
│   ├── firebase/
│   │   └── firebase.service.ts
│   └── utils/
└── auth/                   # API Key / JWT conforme necessidade
    ├── api-key.guard.ts
    └── decorators/
```

Cada módulo de domínio (sport, league, season, event, etc.) segue o mesmo padrão: controller, module, errors, dto, entities, enums (se necessário), repositories, usecases.

## Separação de Responsabilidades

### Controllers

- Receber requisições HTTP e delegar aos UseCases.
- Validar autenticação (API Key ou JWT).
- Documentar com Swagger.
- **Não**: lógica de negócio, acesso direto ao Firestore.

### UseCases

- Implementar regras de negócio.
- Chamar repositórios e, quando relevante, emitir eventos (ex.: `event.updated` para webhooks).
- **Não**: detalhes de HTTP, detalhes de persistência.

### Repositories

- Abstrair leitura/escrita no Firestore.
- Converter documentos Firestore em Entities e vice-versa.
- **Não**: regras de negócio, conhecimento de webhooks ou HTTP.

### Entities

- Representar o domínio (Sport, League, Event, etc.).
- **Não**: persistência, infraestrutura.

## Módulos Principais

- **SportModule, LeagueModule, SeasonModule, TeamModule, PlayerModule, EventModule, VenueModule, StandingModule**: CRUD e listagens dos respectivos recursos.
- **WebhookModule**: Registro de endpoints, disparo de webhooks (serviço de dispatch), assinatura e retentativas.
- **AutomationModule**: Jobs (cron/scheduler) e providers que consomem APIs externas, normalizam dados e persistem no Firestore; podem emitir eventos que disparam webhooks.
- **SharedModule**: Firebase, DTOs comuns, utilitários.
- **AuthModule**: Guards e estratégias para **API key emitida pelo SaaS** (header `X-API-Key`); rotas admin protegidas por autenticação de administrador. **Rate limit** aplicado por API key (configurável por chave); ver [12-api-key-and-rate-limit](./12-api-key-and-rate-limit.md).

## Dependências entre Camadas

```
Controllers → UseCases → Repositories → Firebase/Firestore
     ↓           ↓            ↓
   DTOs      Entities    Entities
```

- Controllers dependem de UseCases e DTOs.
- UseCases dependem de Repositories e Entities; podem depender de EventEmitter2 para webhooks.
- Repositories dependem de Entities e do serviço Firebase/Firestore.

## Referências

- [Modelo de Dados](../product/data-model.md)
- [Padrões Firebase](./06-firebase-patterns.md)
- [Webhooks](./07-webhooks.md)
