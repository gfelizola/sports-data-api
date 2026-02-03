# Webhooks

## Objetivo

Permitir que clientes do SaaS recebam notificações quando **qualquer dado relevante** for criado, atualizado ou removido: novas temporadas, jogos, **mudança de status dos jogos** (agendado, iniciado, pausado, finalizado, adiado, cancelado), **eventos de jogo** (gols, cartões, faltas, substituições, paradas/interrupções, etc.) e demais entidades. Inclui registro de endpoints, payload, assinatura e política de retentativas.

## Fluxo Geral

1. Cliente registra um **Webhook Endpoint** (URL + eventos inscritos + secret), associado à sua API key.
2. UseCases emitem eventos internos (ex.: `EventEmitter2`) ao criar/atualizar/deletar entidades ou ao alterar status/eventos de jogo.
3. Um **WebhookDispatchService** escuta esses eventos, monta o payload, assina com o secret e envia HTTP POST para cada endpoint inscrito naquele tipo de evento.
4. Retentativas e dead-letter (falhas persistentes) conforme política definida.

## Mapeamento de webhooks por evento

O cliente pode registrar **vários webhook endpoints** e **mapear cada um a um conjunto diferente de eventos**. Assim, é possível enviar apenas os eventos desejados para cada URL.

- **Cada endpoint** tem sua própria **URL**, **secret** e lista **eventTypes** (tipos de evento aos quais está inscrito).
- Um mesmo cliente (API key) pode ter, por exemplo:
  - Endpoint A → URL `https://meuapp.com/jogos` → apenas `event.*`, `event.status_changed`, `game_event.*`
  - Endpoint B → URL `https://meuapp.com/tabela` → apenas `standing.updated`
  - Endpoint C → URL `https://meuapp.com/tudo` → todos os tipos de evento
- Quando um evento ocorre no sistema, o **WebhookDispatchService** envia POST **somente** para os endpoints cuja lista `eventTypes` inclui aquele tipo de evento. Cada URL recebe apenas os eventos para os quais foi configurada.
- Permite separar por responsabilidade (um serviço processa jogos, outro classificação), por ambiente (produção só eventos de jogo, staging tudo) ou por volume (URL de alta carga só com eventos críticos).

**Resumo**: múltiplos endpoints por cliente; cada endpoint = uma URL + um mapeamento explícito de eventos (`eventTypes`). Diferentes webhooks para diferentes eventos.

## Tipos de Eventos

Usar enum central (ex.: `WebhookEventTypes`). Os webhooks cobrem **atualizações de tudo no sistema**:

### Entidades gerais (CRUD e alterações)

- `sport.created`, `sport.updated`, `sport.deleted`
- `league.created`, `league.updated`, `league.deleted`
- `season.created`, `season.updated`, `season.deleted` — ex.: nova temporada disponível
- `team.created`, `team.updated`, `team.deleted`
- `player.created`, `player.updated`, `player.deleted`
- `venue.created`, `venue.updated`, `venue.deleted`
- `standing.updated` — classificação/ranking atualizado
- `statistics.updated` — quando aplicável

### Jogos / Eventos (event)

- `event.created` — novo jogo/partida/corrida criado
- `event.updated` — dados do jogo alterados (ex.: placar, data)
- `event.deleted`
- `event.status_changed` — mudança de status do jogo; o payload deve indicar o status anterior e o novo

**Status de jogo** que disparam `event.status_changed` (e podem ser filtrados/descritos no payload):

- `scheduled` — Agendado
- `started` — Iniciado
- `paused` — Pausado (ex.: intervalo)
- `finished` — Finalizado
- `postponed` — Adiado
- `cancelled` — Cancelado
- `abandoned` — Abandonado

### Eventos de jogo (timeline / game events)

Ocorrências durante a partida; o cliente pode inscrever-se para receber em tempo (quase) real:

- `game_event.created` — novo evento de jogo
- `game_event.updated`, `game_event.deleted` (quando aplicável)

**Tipos de evento de jogo** (incluídos no payload em `data.payload.type` ou equivalente):

- **Gols**: `goal` (com detalhes como penalty, open_play, etc.)
- **Cartões**: `card` (amarelo/vermelho)
- **Faltas**: `foul`
- **Substituições**: `substitution`
- **Paradas / interrupções**: `stoppage`, `injury_stoppage`, etc.
- **Períodos**: `period_start`, `period_end` (ex.: início/fim do 1º tempo)
- **Outros**: `other` (com payload descritivo)

Cada tipo pode ter um payload mínimo padronizado (ex.: `entityType`, `entityId`, `action`, `timestamp`, `data`) e, para `event.status_changed` e `game_event.*`, campos específicos (status anterior/novo, minuto, jogador, time, etc.).

## Modelo de Dados do Endpoint

- **WebhookEndpoint**: id, apiKeyId, **url** (única por endpoint), **secret**, **eventTypes** (array de tipos de evento — define o mapeamento deste webhook para quais eventos receber), name/description (opcional), active, createdAt, updatedAt.
- Um mesmo cliente (apiKeyId) pode ter **múltiplos** WebhookEndpoints, cada um com URL e `eventTypes` diferentes, permitindo mapear diferentes webhooks a diferentes eventos.
- **WebhookDelivery** (opcional): id, endpointId, eventType, payload, responseStatus, responseBody, attemptedAt, success (para auditoria e retentativas).

## Payload Enviado ao Cliente

Exemplo genérico:

```json
{
  "id": "delivery-uuid",
  "type": "event.updated",
  "createdAt": "2025-02-03T12:00:00Z",
  "data": {
    "entityType": "event",
    "entityId": "event-id",
    "action": "updated",
    "payload": { ... }
  }
}
```

O corpo completo do recurso (ou resumo) pode ir em `data.payload` para o cliente não precisar chamar a API para obter detalhes.

### Exemplo: mudança de status do jogo (`event.status_changed`)

```json
{
  "id": "delivery-uuid",
  "type": "event.status_changed",
  "createdAt": "2025-02-03T20:45:00Z",
  "data": {
    "entityType": "event",
    "entityId": "event-id",
    "action": "status_changed",
    "payload": {
      "previousStatus": "scheduled",
      "newStatus": "started",
      "event": { "id": "...", "seasonId": "...", "status": "started", "startedAt": "..." }
    }
  }
}
```

### Exemplo: evento de jogo (`game_event.created`)

```json
{
  "id": "delivery-uuid",
  "type": "game_event.created",
  "createdAt": "2025-02-03T21:12:00Z",
  "data": {
    "entityType": "game_event",
    "entityId": "game-event-id",
    "eventId": "event-id",
    "action": "created",
    "payload": {
      "type": "goal",
      "minute": 67,
      "extraTime": null,
      "teamId": "...",
      "playerId": "...",
      "payload": { "goalType": "open_play", "assistPlayerId": "..." }
    }
  }
}
```

Outros tipos (`card`, `foul`, `substitution`, `stoppage`, `period_start`, `period_end`) seguem a mesma estrutura, com `type` e campos opcionais (ex.: `cardColor`, `relatedPlayerId`) em `payload`.

## Assinatura (HMAC)

- Header: `X-Webhook-Signature` (ex.: `sha256=hex(HMAC-SHA256(secret, body))`).
- Cliente valida com o mesmo secret para garantir autenticidade e integridade.

## Retentativas

- Política recomendada: 3–5 tentativas com backoff exponencial (ex.: 1min, 5min, 15min).
- Considerar fila (ex.: Bull/BullMQ com Redis) para processar envios de forma assíncrona e reprocessar falhas.
- Após N falhas, marcar endpoint como `failed` ou notificar administrador; opcionalmente dead-letter para inspeção.

## Segurança

- HTTPS obrigatório para URLs de webhook.
- Secret por endpoint; nunca logar o secret.
- Validar que a URL pertence ao mesmo cliente (evitar SSRF): whitelist de hosts ou esquema.

## API do Cliente

- **POST /v1/webhook-endpoints**: criar endpoint (url, **eventTypes** — lista dos tipos de evento que este webhook deve receber, description/name). Cada chamada cria um novo endpoint; o cliente pode criar vários com URLs e eventTypes diferentes para mapear diferentes webhooks a diferentes eventos.
- **GET /v1/webhook-endpoints**: listar todos os endpoints do cliente (cada um com seu mapeamento eventTypes).
- **PATCH /v1/webhook-endpoints/:id**: atualizar (url, **eventTypes**, active) — alterar para qual conjunto de eventos este endpoint recebe.
- **DELETE /v1/webhook-endpoints/:id**: remover.
- **GET /v1/webhook-endpoints/:id/deliveries** (opcional): histórico de entregas para debug.

## Referências

- [Visão do Produto](../product/README.md)
- [Use Cases e eventos](./04-usecases.md)
- [Automação](./09-automation.md)
