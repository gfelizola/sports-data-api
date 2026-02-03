# Automação e Sincronização de Dados

## Objetivo

Definir como o Sports Data API obtém e atualiza dados de duas formas complementares: **(1) ingestão autônoma** (jobs que consomem fontes externas) e **(2) revisão e atualização por administrador** (admin com acesso para revisar dados e atualizar manualmente quando necessário). Garantir idempotência e disparo de webhooks quando houver alteração.

## Duas formas de obter/atualizar dados

1. **Autônoma** – Jobs/cron ou workers que ingerem dados de APIs ou feeds externos, normalizam e persistem no Firestore. Disparam webhooks quando há criação/atualização. Ideal para volume e atualização contínua (jogos, status, eventos de jogo, standings).
2. **Administrador** – Um administrador tem acesso (API admin ou painel) para **revisar** os dados existentes (incluindo os ingeridos automaticamente) e **criar, editar ou remover** entidades manualmente. Permite correções, complementos, criação de ligas/temporadas/jogos que não vêm da fonte automática e revisão de qualidade. Qualquer alteração feita pelo admin segue os mesmos UseCases e dispara os mesmos webhooks.

A API deve oferecer **soluções para buscar e manter as informações dos jogos** tanto de forma autônoma quanto com intervenção do administrador quando necessário.

## Componentes

- **Scheduler/Cron**: NestJS `@nestjs/schedule` ou similar para disparar jobs em intervalos (ex.: a cada 15 min para jogos do dia, diário para standings).
- **Providers/Adapters**: Módulos que encapsulam chamadas a APIs externas (ex.: API-Football, RapidAPI, ESPN), normalizam resposta para o nosso modelo e retornam DTOs ou entidades.
- **Sync UseCases/Services**: Orquestram leitura da fonte externa, comparação com Firestore (por `externalId`), criação/atualização de documentos e emissão de eventos para webhooks.

## Fluxo de Sincronização

1. Job é disparado (cron ou fila).
2. Provider busca dados da fonte externa (com rate limit e tratamento de erro).
3. Para cada item: buscar no Firestore por `externalId` (e `leagueId`/`seasonId` quando aplicável).
4. Se não existe: criar; emitir evento `entity.created`.
5. Se existe e houve alteração relevante: atualizar; emitir evento `entity.updated`.
6. WebhookDispatchService processa eventos e envia para endpoints inscritos.

## Idempotência

- Chave de deduplicação: `(externalId, leagueId/seasonId)` ou equivalente por entidade.
- Evitar duplicar eventos: só emitir quando realmente houver create ou update com mudança.

## Fontes Externas

- Documentar por esporte/liga qual provedor é usado (ex.: API-Football para futebol, RapidAPI para NBA).
- Configuração por variáveis de ambiente: API keys, base URLs.
- Tratar limites de requisição (rate limit) e timeouts; retentativas com backoff.

## Jobs Sugeridos (exemplos)

- **Events (jogos)**: a cada 15–30 min para jogos do dia e status (scheduled → live → finished).
- **Standings**: diário ou após fim de rodada.
- **Teams/Players**: sob demanda ou semanal para uma liga/temporada.
- **Leagues/Seasons**: menos frequente (semanal ou manual).

## Tratamento de Erros

- Logar falhas de provider; não derrubar o job por um único item com erro.
- Opcional: dead-letter ou fila de “sync failed” para reprocessamento manual.
- Alertas (ex.: Slack, email) quando taxa de falha for alta.

## Módulo Automation

- `AutomationModule` importa providers (ex.: `ApiFootballProvider`), serviços de sync (ex.: `EventSyncService`) e registra cron jobs.
- Depende de repositórios (Event, Standing, etc.) e do EventEmitter2 para webhooks.

## Papel do administrador (revisão e atualização manual)

- **API admin** (ou painel futuro): rotas protegidas por autenticação de admin (não por API key de cliente) para:
  - Listar/criar/editar/remover: esportes, ligas, temporadas, times, jogadores, venues, eventos (jogos), standings, eventos de jogo (game_events).
  - Revisar dados recém-ingeridos (ex.: listar eventos com status “pendente de revisão” ou últimos sincronizados) e aprovar/corrigir.
  - Forçar nova sincronização para uma liga/temporada ou reprocessar falhas.
- As alterações feitas pelo admin utilizam os **mesmos UseCases** da aplicação (CreateEventUseCase, UpdateEventUseCase, etc.), garantindo consistência e **disparo de webhooks** igual ao da ingestão autônoma.
- Assim, os clientes recebem atualizações tanto quando o sistema sincroniza sozinho quanto quando um administrador corrige ou adiciona dados.

## Referências

- [Webhooks](./07-webhooks.md)
- [Padrões Firebase](./06-firebase-patterns.md)
- [Modelo de Dados](../product/data-model.md)
