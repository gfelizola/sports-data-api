# Plano de Desenvolvimento – Sports Data API

Documento para acompanhar o desenvolvimento da API. **Marque com `[x]`** o que já foi concluído e mantenha as datas de atualização quando fizer mudanças relevantes.

**Como usar**
- `[ ]` = não iniciado  
- `[x]` = concluído  
- Opcional: adicione `(em andamento)` no item ou numa linha de status abaixo do título da seção.

**Última atualização do plano:** _preencher quando alterar_

---

## Visão geral por fase

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Fundação do projeto (NestJS, config, estrutura) | [ ] |
| 2 | Firebase e shared (persistência, DTOs comuns) | [ ] |
| 3 | Autenticação (API Key) e Rate Limit | [ ] |
| 4 | Módulos de domínio (Sport, League, Season, Team, Player, Venue, Event, GameEvent, Standing, Statistics) | [ ] |
| 5 | Webhooks (endpoints, dispatch, assinatura, retentativas) | [ ] |
| 6 | Automação (jobs, providers, sync) | [ ] |
| 7 | API Admin (revisão e edição manual) | [ ] |
| 8 | Documentação (Swagger + Scalar) e qualidade | [ ] |

---

## Fase 1 – Fundação do projeto

- [ ] Criar projeto NestJS (Node 20+)
- [ ] Configurar TypeScript (path aliases `@/*` → `src/*`)
- [ ] Configurar ESLint/Prettier ou Biome
- [ ] ConfigModule e variáveis de ambiente (.env, .env.example)
- [ ] Estrutura de pastas (config/, shared/, módulos por domínio)
- [ ] main.ts: ValidationPipe global, versionamento de API (v1), CORS se necessário
- [ ] Health check (GET /health ou similar, rota pública)

---

## Fase 2 – Firebase e shared

### Firebase

- [ ] Conta e projeto Firebase; Firestore ativo
- [ ] FirebaseModule / FirebaseService (inicialização com service account ou env)
- [ ] Acesso ao Firestore (coleções: sports, leagues, seasons, teams, players, venues, events, game_events, standings, statistics, api_keys, webhook_endpoints)
- [ ] Regras de segurança Firestore (ou documento de decisão)

### Shared

- [ ] DTOs comuns (ex.: paginação: page, limit, total; ListAndTotalResponseDto ou equivalente)
- [ ] Utilitários (ex.: geração de ID ULID, datas)
- [ ] Filtros de soft delete em consultas (deletedAt == null onde aplicável)

---

## Fase 3 – Autenticação (API Key) e Rate Limit

### API Key

- [ ] Entidade/modelo ApiKey (id, keyHash, keyPrefix, name, rateLimit*, active)
- [ ] Coleção Firestore `api_keys` e repositório (IApiKeyRepository + implementação Firebase)
- [ ] UseCases: CreateApiKey (retorna valor uma vez), RevokeApiKey (ou UpdateApiKey active=false), ListApiKeys (admin)
- [ ] Guard: extrair header X-API-Key, validar hash, anexar apiKeyId ao request
- [ ] Rotas públicas (ex.: health) com @IsPublic() ou equivalente
- [ ] Resposta 401 quando chave ausente/inválida/inativa

### Rate Limit

- [ ] Configuração por API key (rateLimitRequestsPerMinute; opcional por hora/dia)
- [ ] Implementação do rate limiter (ex.: Redis por apiKeyId + janela)
- [ ] Aplicar rate limit após validação da API key
- [ ] Headers de resposta: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- [ ] Resposta 429 Too Many Requests + header Retry-After quando exceder

### API (admin) de API Keys

- [ ] POST /v1/admin/api-keys (criar; auth admin)
- [ ] GET /v1/admin/api-keys (listar; auth admin)
- [ ] PATCH /v1/admin/api-keys/:id (revogar/editar; auth admin)
- [ ] Documentação Swagger dos endpoints admin de API key

---

## Fase 4 – Módulos de domínio

Para cada módulo abaixo: **entities**, **repositories** (interface + Firebase), **DTOs** (create, update, response, list-query), **use cases** (CRUD + list), **controller** (rotas v1), **errors** (enum de códigos), **emissão de eventos** (EventEmitter2) para webhooks quando criar/atualizar/deletar. Documentar todos os endpoints com Swagger (request/response DTOs).

### 4.1 Sport

- [ ] SportEntity, enums (SportCategory, etc.)
- [ ] ISportRepository, SportFirebaseRepository
- [ ] DTOs: CreateSportDto, UpdateSportDto, SportResponseDto, ListSportsQueryDto
- [ ] UseCases: CreateSport, UpdateSport, DeleteSport, GetSportById, ListSports
- [ ] SportController (GET /v1/sports, GET /v1/sports/:id, POST, PUT/:id, DELETE/:id) – auth API Key
- [ ] Eventos: sport.created, sport.updated, sport.deleted
- [ ] Documentação Swagger completa (todos os endpoints + DTOs)

### 4.2 League

- [ ] LeagueEntity, enums (LeagueType, etc.)
- [ ] ILeagueRepository, LeagueFirebaseRepository
- [ ] DTOs: CreateLeagueDto, UpdateLeagueDto, LeagueResponseDto, ListLeaguesQueryDto
- [ ] UseCases: CreateLeague, UpdateLeague, DeleteLeague, GetLeagueById, ListLeagues (filtro por sportId)
- [ ] LeagueController (GET /v1/leagues, GET /v1/leagues/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: league.created, league.updated, league.deleted
- [ ] Documentação Swagger completa

### 4.3 Season

- [ ] SeasonEntity
- [ ] ISeasonRepository, SeasonFirebaseRepository
- [ ] DTOs: CreateSeasonDto, UpdateSeasonDto, SeasonResponseDto, ListSeasonsQueryDto
- [ ] UseCases: CreateSeason, UpdateSeason, DeleteSeason, GetSeasonById, ListSeasons (filtro por leagueId)
- [ ] SeasonController (GET /v1/seasons, GET /v1/seasons/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: season.created, season.updated, season.deleted
- [ ] Documentação Swagger completa

### 4.4 Team (Participant)

- [ ] TeamEntity (type: team | participant)
- [ ] ITeamRepository, TeamFirebaseRepository
- [ ] DTOs: CreateTeamDto, UpdateTeamDto, TeamResponseDto, ListTeamsQueryDto
- [ ] UseCases: CreateTeam, UpdateTeam, DeleteTeam, GetTeamById, ListTeams (filtro por sportId)
- [ ] TeamController (GET /v1/teams, GET /v1/teams/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: team.created, team.updated, team.deleted
- [ ] Documentação Swagger completa

### 4.5 Player

- [ ] PlayerEntity
- [ ] IPlayerRepository, PlayerFirebaseRepository
- [ ] DTOs: CreatePlayerDto, UpdatePlayerDto, PlayerResponseDto, ListPlayersQueryDto
- [ ] UseCases: CreatePlayer, UpdatePlayer, DeletePlayer, GetPlayerById, ListPlayers (filtro por sportId, teamId)
- [ ] PlayerController (GET /v1/players, GET /v1/players/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: player.created, player.updated, player.deleted
- [ ] Documentação Swagger completa

### 4.6 Venue

- [ ] VenueEntity
- [ ] IVenueRepository, VenueFirebaseRepository
- [ ] DTOs: CreateVenueDto, UpdateVenueDto, VenueResponseDto, ListVenuesQueryDto
- [ ] UseCases: CreateVenue, UpdateVenue, DeleteVenue, GetVenueById, ListVenues
- [ ] VenueController (GET /v1/venues, GET /v1/venues/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: venue.created, venue.updated, venue.deleted
- [ ] Documentação Swagger completa

### 4.7 Event (Jogo / Partida / Corrida)

- [ ] EventEntity (status: scheduled, started, paused, finished, postponed, cancelled, abandoned)
- [ ] IEventRepository, EventFirebaseRepository
- [ ] DTOs: CreateEventDto, UpdateEventDto, EventResponseDto, ListEventsQueryDto (seasonId, status, etc.)
- [ ] UseCases: CreateEvent, UpdateEvent, DeleteEvent, GetEventById, ListEvents (filtro por seasonId, status)
- [ ] EventController (GET /v1/events, GET /v1/events/:id, POST, PUT/:id, DELETE/:id)
- [ ] Emissão de event.status_changed quando status mudar (payload com previousStatus, newStatus)
- [ ] Eventos: event.created, event.updated, event.deleted, event.status_changed
- [ ] Documentação Swagger completa

### 4.8 Game Event (eventos de jogo / timeline)

- [ ] GameEventEntity (type: goal, card, foul, substitution, stoppage, period_start, period_end, other)
- [ ] IGameEventRepository, GameEventFirebaseRepository (coleção game_events ou subcoleção)
- [ ] DTOs: CreateGameEventDto, UpdateGameEventDto, GameEventResponseDto, ListGameEventsQueryDto (eventId)
- [ ] UseCases: CreateGameEvent, UpdateGameEvent, DeleteGameEvent, GetGameEventById, ListGameEventsByEventId
- [ ] GameEventController (GET /v1/events/:eventId/game-events, GET /v1/game-events/:id, POST, PUT/:id, DELETE/:id)
- [ ] Eventos: game_event.created, game_event.updated, game_event.deleted
- [ ] Documentação Swagger completa

### 4.9 Standing (Classificação)

- [ ] StandingEntity (entries: array com position, teamId/participantId, points, etc.)
- [ ] IStandingRepository, StandingFirebaseRepository
- [ ] DTOs: CreateStandingDto, UpdateStandingDto, StandingResponseDto, ListStandingsQueryDto (seasonId)
- [ ] UseCases: CreateStanding, UpdateStanding, GetStandingById, ListStandingsBySeasonId
- [ ] StandingController (GET /v1/standings, GET /v1/standings/:id, POST, PUT/:id)
- [ ] Eventos: standing.updated
- [ ] Documentação Swagger completa

### 4.10 Statistics

- [ ] StatisticsEntity (subjectType, subjectId, eventId, seasonId, stats map)
- [ ] IStatisticsRepository, StatisticsFirebaseRepository
- [ ] DTOs: CreateStatisticsDto, UpdateStatisticsDto, StatisticsResponseDto, ListStatisticsQueryDto
- [ ] UseCases: CreateStatistics, UpdateStatistics, GetStatisticsById, ListStatistics (por eventId, playerId, teamId)
- [ ] StatisticsController (GET /v1/statistics, GET /v1/statistics/:id, POST, PUT/:id)
- [ ] Eventos: statistics.updated (quando aplicável)
- [ ] Documentação Swagger completa

---

## Fase 5 – Webhooks

### Modelo e repositório

- [ ] WebhookEndpoint (id, apiKeyId, url, secret, eventTypes[], name, active)
- [ ] WebhookDelivery (opcional: id, endpointId, eventType, payload, responseStatus, attemptedAt, success)
- [ ] IWebhookEndpointRepository, WebhookEndpointFirebaseRepository
- [ ] Coleções Firestore: webhook_endpoints, webhook_deliveries (se houver)

### API do cliente (gestão de endpoints)

- [ ] POST /v1/webhook-endpoints (url, eventTypes, description) – cria endpoint
- [ ] GET /v1/webhook-endpoints – lista endpoints do cliente (apiKeyId)
- [ ] PATCH /v1/webhook-endpoints/:id (url, eventTypes, active)
- [ ] DELETE /v1/webhook-endpoints/:id
- [ ] GET /v1/webhook-endpoints/:id/deliveries (opcional) – histórico de entregas
- [ ] DTOs e documentação Swagger para todos os endpoints de webhook

### Dispatch e assinatura

- [ ] WebhookDispatchService: inscrever nos eventos (EventEmitter2) de todos os tipos (sport.*, league.*, …, event.*, game_event.*)
- [ ] Para cada evento: buscar endpoints ativos cujo eventTypes inclua o tipo; montar payload; assinar com HMAC (X-Webhook-Signature); POST para a URL
- [ ] Validação de URL (HTTPS; evitar SSRF)
- [ ] Retentativas (ex.: 3–5 com backoff exponencial); opcional: fila (Bull/Redis) para envio assíncrono
- [ ] Opcional: registrar WebhookDelivery para auditoria e retentativas
- [ ] Documentação do formato de payload e headers (incl. assinatura) para clientes

---

## Fase 6 – Automação

### Infraestrutura

- [ ] AutomationModule; @nestjs/schedule ou equivalente para cron
- [ ] Configuração de providers (variáveis de ambiente para API keys de fontes externas)

### Providers (adaptadores para fontes externas)

- [ ] Interface/provider genérico para “buscar dados externos” (ex.: por liga/temporada)
- [ ] Provider para primeira fonte (ex.: futebol – API-Football ou RapidAPI); normalizar para nosso modelo (Event, Team, etc.)
- [ ] Tratamento de rate limit e erros da API externa

### Jobs de sincronização

- [ ] Job: sincronizar eventos/jogos (ex.: a cada 15–30 min para jogos do dia; atualizar status e score)
- [ ] Job: sincronizar standings (ex.: diário ou após rodada)
- [ ] Job: sincronizar times/jogadores por liga/temporada (ex.: sob demanda ou semanal)
- [ ] Idempotência por externalId; emissão de eventos (created/updated) para disparar webhooks
- [ ] Log e tratamento de erros (não derrubar job por um item); opcional: dead-letter ou fila de reprocesso

### Documentação

- [ ] Documentar quais fontes são usadas por esporte/liga e variáveis de ambiente necessárias (docs ou README)

---

## Fase 7 – API Admin (revisão e edição manual)

- [ ] Autenticação de administrador (ex.: JWT ou API key com role admin) – separada da API key de cliente
- [ ] Rotas sob prefixo /v1/admin (ou /admin/v1) protegidas por guard de admin

### Endpoints admin (CRUD completo para revisão/edição)

- [ ] Admin: Sport (listar, criar, editar, remover) – reutilizar UseCases existentes
- [ ] Admin: League (idem)
- [ ] Admin: Season (idem)
- [ ] Admin: Team (idem)
- [ ] Admin: Player (idem)
- [ ] Admin: Venue (idem)
- [ ] Admin: Event (idem)
- [ ] Admin: GameEvent (idem)
- [ ] Admin: Standing (idem)
- [ ] Admin: Statistics (idem)
- [ ] Opcional: listar “últimos sincronizados” ou “pendentes de revisão” para facilitar revisão
- [ ] Opcional: forçar nova sincronização para uma liga/temporada (chamada ao job de sync)
- [ ] Documentação Swagger de todos os endpoints admin (request/response DTOs)

---

## Fase 8 – Documentação (Swagger + Scalar) e qualidade

### Swagger (OpenAPI)

- [ ] DocumentBuilder no main.ts (título, descrição, versão, addApiKey, tags)
- [ ] Todos os controllers com @ApiTags
- [ ] Todos os endpoints com @ApiOperation, @ApiBody/@ApiQuery/@ApiParam, @ApiResponse (sucesso + 400, 401, 404, 500)
- [ ] Todos os DTOs de request e response com @ApiProperty/@ApiPropertyOptional (description e example onde útil)
- [ ] Servir documento OpenAPI (ex.: /openapi.json) para Scalar consumir

### Scalar

- [ ] Instalar @scalar/nestjs-api-reference
- [ ] Configurar apiReference no main.ts (content: document ou url: '/openapi.json')
- [ ] Rota da documentação (ex.: /docs) funcionando com Scalar
- [ ] Verificar que todos os recursos aparecem na UI e que request/response estão completos

### Qualidade e testes

- [ ] Testes unitários para UseCases críticos (ex.: criação de evento, atualização de status, emissão de eventos)
- [ ] Testes de integração para rotas principais (ex.: GET/POST /v1/events com API key e rate limit)
- [ ] README do repositório com instruções de setup, .env.example e link para documentação (/docs)

---

## Checklist final antes de considerar v1 pronto

- [ ] Todas as fases acima marcadas conforme concluídas
- [ ] Documentação de produto e técnica refletida no código
- [ ] Documentação da API (Scalar) completa para todos os endpoints públicos e admin
- [ ] Rate limit e API key testados; webhooks com assinatura e retentativas
- [ ] Pelo menos um fluxo de automação (ex.: jogos de uma liga) funcionando de ponta a ponta
- [ ] Admin consegue criar/editar entidades e revisar dados; alterações disparam webhooks

---

## Referências

- [Visão do produto](./product/README.md)
- [Modelo de dados](./product/data-model.md)
- [Padrões de código](./code-standards/README.md)
