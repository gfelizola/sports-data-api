# Modelo de Dados

## Objetivo

Este documento descreve o modelo de dados genérico do Sports Data API, compatível com esportes coletivos e individuais, persistido no Firebase (Firestore).

## Princípios

- **Genérico**: Mesmas entidades lógicas para futebol, basquete, F1, etc.
- **Extensível**: Atributos específicos por esporte em mapas ou subcoleções quando necessário.
- **Identificadores**: IDs opaques (ex.: ULID) gerados pela aplicação; IDs externos (provider_id) para sincronização.

## Entidades Principais

### Sport

Tipo de esporte.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| code        | string | Código estável (soccer, basketball, formula_1) |
| name        | string | Nome para exibição           |
| category    | string | team \| individual           |
| metadata    | map    | Atributos opcionais          |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `sports`

---

### League

Liga/campeonato associado a um esporte.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| sportId     | string | Referência a Sport           |
| externalId  | string | ID na fonte externa          |
| name        | string | Nome da liga                 |
| countryCode | string | Opcional (ISO)               |
| type        | string | league \| cup \| tournament  |
| metadata    | map    | Atributos opcionais          |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `leagues`

---

### Season

Temporada/edição de uma liga.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| leagueId    | string | Referência a League          |
| externalId  | string | ID na fonte externa          |
| name        | string | Ex.: "2024/25", "2024"       |
| startDate   | timestamp | |
| endDate     | timestamp | |
| isActive    | boolean | |
| metadata    | map    | |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `seasons`

---

### Team / Participant

Time (esportes coletivos) ou participante (equipe/piloto em F1, etc.).

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| sportId     | string | Referência a Sport           |
| externalId  | string | ID na fonte externa          |
| name        | string | Nome                         |
| shortName   | string | Abreviação                   |
| type        | string | team \| participant          |
| logoUrl     | string | Opcional                     |
| metadata    | map    | Específico por esporte       |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `teams` (ou `participants`; pode ser unificado com tipo)

---

### Player / Athlete

Jogador ou atleta (opcional em esportes puramente “por equipe” ou “por participante”).

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| sportId     | string | Referência a Sport           |
| teamId      | string | Opcional; referência a Team  |
| externalId  | string | ID na fonte externa          |
| name        | string | Nome completo                |
| position    | string | Posição (quando aplicável)   |
| jerseyNumber| string | Opcional                     |
| metadata    | map    | |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `players`

---

### Venue

Local do evento (estádio, circuito, arena).

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| sportId     | string | Opcional                     |
| externalId  | string | ID na fonte externa          |
| name        | string | Nome do local                |
| city        | string | Opcional                     |
| countryCode | string | Opcional                     |
| metadata    | map    | |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `venues`

---

### Event (Game / Match / Race)

Jogo, partida ou corrida.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| seasonId    | string | Referência a Season          |
| externalId  | string | ID na fonte externa          |
| name        | string | Nome ou descrição            |
| type        | string | match \| race \| game        |
| status      | string | scheduled \| started \| paused \| finished \| postponed \| cancelled \| abandoned (ver EventStatus) |
| scheduledAt | timestamp | Data/hora prevista        |
| startedAt   | timestamp | Opcional; início real     |
| finishedAt  | timestamp | Opcional; fim              |
| venueId     | string | Opcional; referência a Venue |
| homeTeamId  | string | Opcional (coletivos)         |
| awayTeamId  | string | Opcional (coletivos)         |
| participantIds | array | Opcional (individuais)     |
| score       | map    | Ex.: { home: 2, away: 1 }   |
| result      | map    | Resultado final (posições, etc.) |
| metadata    | map    | Específico por esporte       |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `events`

**Status do evento (EventStatus)** – Valores possíveis para `status`:
- `scheduled` – Agendado
- `started` – Iniciado
- `paused` – Pausado (ex.: intervalo)
- `finished` – Finalizado
- `postponed` – Adiado
- `cancelled` – Cancelado
- `abandoned` – Abandonado

---

### Game Event (eventos de jogo / timeline)

Ocorrências durante um jogo/partida: gols, cartões, faltas, substituições, paradas, início/fim de período, etc.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| eventId     | string | Referência a Event            |
| externalId  | string | ID na fonte externa          |
| type        | string | goal \| card \| foul \| substitution \| stoppage \| period_start \| period_end \| other |
| minute      | number | Minuto do jogo (ou equivalente) |
| extraTime   | number | Opcional; acréscimo           |
| teamId      | string | Opcional; time relacionado   |
| playerId    | string | Opcional; jogador relacionado |
| relatedPlayerId | string | Opcional (ex.: jogador que sofreu falta) |
| payload     | map    | Detalhes (cardColor: yellow/red, goalType: penalty/open_play, etc.) |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `game_events` (ou subcoleção `events/{eventId}/game_events`)

Alterações em game events disparam webhooks do tipo `game_event.created`, `game_event.updated`, etc.

---

### Standing / Classification

Tabela de classificação ou ranking (por temporada, por competição).

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| seasonId    | string | Referência a Season          |
| competitionId | string | Opcional (ex.: grupo, fase) |
| type        | string | league_table \| ranking      |
| entries     | array  | Lista de { teamId/participantId, position, points, ... } |
| updatedAt   | timestamp | |

**Coleção Firestore**: `standings`

---

### Statistics

Estatísticas (por evento, por jogador, por temporada). Modelo flexível.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| subjectType | string | event \| player \| team      |
| subjectId   | string | ID do evento/jogador/time    |
| seasonId    | string | Opcional                     |
| eventId     | string | Opcional (estatísticas do jogo) |
| stats       | map    | Chave-valor (goals, assists, etc.) |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `statistics`

---

### ApiKey

Chave de API emitida e gerenciada pelo SaaS; usada para autenticação e rate limit por cliente.

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| keyHash     | string | Hash da chave (nunca armazenar em claro) |
| keyPrefix   | string | Prefixo exibido (ex.: "sda_live_...") para identificação |
| name        | string | Nome/descrição (ex.: "App produção") |
| rateLimitRequestsPerMinute | number | Máximo de requisições por minuto (por API key) |
| rateLimitRequestsPerHour  | number | Opcional; máximo por hora   |
| rateLimitRequestsPerDay   | number | Opcional; máximo por dia   |
| active      | boolean | Se a chave está ativa        |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `api_keys`

---

### WebhookEndpoint

| Campo        | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | string | Identificador único          |
| apiKeyId    | string | Referência à API key do cliente |
| url         | string | URL de destino (HTTPS)       |
| secret      | string | Secret para assinatura HMAC  |
| eventTypes  | array  | Tipos de evento inscritos    |
| active      | boolean | |
| createdAt   | timestamp | |
| updatedAt   | timestamp | |

**Coleção Firestore**: `webhook_endpoints`

Detalhes de uso: [API Key e Rate Limit](../code-standards/12-api-key-and-rate-limit.md) e [Webhooks](../code-standards/07-webhooks.md).

## Índices e Consultas (Firestore)

- Índices compostos para listagens comuns: por `sportId`, `leagueId`, `seasonId`, `status`, `scheduledAt`.
- Subcoleções podem ser usadas onde fizer sentido (ex.: `events` como subcoleção de `seasons`) conforme decisão de modelagem e custo de leitura.

## Referências

- [Visão do Produto](./README.md)
- [Padrões Firebase](../code-standards/06-firebase-patterns.md)
