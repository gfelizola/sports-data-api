# Visão do Produto – Sports Data API

## Objetivo

O Sports Data API é um SaaS que fornece dados estruturados sobre esportes para aplicações clientes (apps, sites, integrações). O acesso à API é controlado por **API keys emitidas e gerenciadas pelo próprio SaaS**; cada chave pode ter **rate limit configurável**. Os clientes consomem a API REST e podem receber atualizações em tempo (quase) real via **webhooks** para qualquer alteração no sistema (novas temporadas, jogos, status dos jogos, eventos de jogo como cartões e faltas, etc.). A atualização dos dados pode ser **autônoma** (sincronização com fontes externas) ou **revisada/atualizada por um administrador**.

## Escopo de Esportes

### Esportes coletivos (prioridade)

| Esporte        | Escopo principal                          | Observações                    |
|----------------|-------------------------------------------|--------------------------------|
| Futebol        | Ligas, copas, times, jogadores, jogos     | Foco global (FIFA, ligas locais) |
| Basquete       | NBA, ligas internacionais, jogos          | Estatísticas por jogo          |
| Futebol americano | NFL, NCAA, ligas                          | Partidas, playoffs             |
| Baseball       | MLB, ligas internacionais                  | Temporada regular e pós-temporada |
| Hóquei no gelo | NHL, ligas                                | Idem modelo coletivo           |

### Esportes individuais

| Esporte     | Escopo principal              | Observações              |
|-------------|-------------------------------|---------------------------|
| Fórmula 1   | Corridas, pilotos, equipes, GP | Classificação, resultados |
| Outras corridas | MotoGP, Indy, endurance   | Mesmo modelo de “evento”  |
| Tênis       | Torneios, jogadores, partidas  | Grand Slams, ATP/WTA      |
| Golfe       | Torneios, jogadores, leaderboard| Major tours               |

O modelo de dados é **genérico**: as mesmas entidades (Sport, League, Season, Event/Game, Participant/Team, Player/Athlete) se adaptam a esportes coletivos e individuais.

## Entidades do Domínio

- **Sport** – Tipo de esporte (soccer, basketball, american_football, baseball, formula_1, etc.).
- **League** – Campeonato/liga (ex.: Premier League, NBA, NFL, F1).
- **Season** – Temporada/ano de uma liga (ex.: 2024/25, 2024).
- **Competition** – (Opcional) Copa ou torneio dentro de uma temporada (ex.: Copa do Brasil, Playoffs).
- **Team / Participant** – Time (coletivo) ou participante (individual: piloto, tenista).
- **Player / Athlete** – Jogador ou atleta vinculado a um time/participante.
- **Event / Game / Match** – Partida, corrida ou jogo (um “evento” disputado).
- **Venue** – Local do evento (estádio, circuito).
- **Standings / Classification** – Tabela de classificação ou ranking.
- **Statistics** – Estatísticas por jogo, temporada ou atleta (genérico por esporte).

Relacionamentos e cardinalidades estão detalhados em [Modelo de Dados](./data-model.md).

## Autenticação e Rate Limit

- **API Key** – O SaaS **emite e gerencia** as API keys. Um administrador cria chaves para clientes (ou o cliente solicita e o admin aprova); cada chave identifica o cliente e é enviada no header (ex.: `X-API-Key`) nas requisições.
- **Rate limit** – O limite de requisições pode **variar por API key** (ex.: plano básico 100 req/min, plano premium 1000 req/min). A API retorna headers de rate limit (ex.: `X-RateLimit-Limit`, `X-RateLimit-Remaining`) e responde `429 Too Many Requests` quando o limite é excedido, com `Retry-After` quando aplicável. Detalhes em [API Key e Rate Limit](../code-standards/12-api-key-and-rate-limit.md).

## Casos de Uso Principais

1. **Consultar dados** – Listar/buscar esportes, ligas, temporadas, times, jogadores, jogos e estatísticas via API REST (autenticação por API key).
2. **Receber atualizações** – Clientes registram webhooks e recebem eventos para **qualquer alteração relevante**: novas temporadas, jogos criados/atualizados, **mudança de status do jogo** (agendado, iniciado, pausado, finalizado, adiado, cancelado), **eventos de jogo** (gols, cartões, faltas, substituições, paradas/interrupções, etc.) e outras informações (classificação, estatísticas). É possível **mapear diferentes webhooks a diferentes eventos**: cada endpoint tem sua própria URL e lista de tipos de evento (ex.: uma URL só para jogos e eventos de jogo, outra só para classificação). Ver [Webhooks](../code-standards/07-webhooks.md).
3. **Obter dados dos jogos** – De duas formas complementares:
   - **Autônoma** – Jobs/cron ou workers que ingerem dados de fontes externas, normalizam e persistem no Firestore, disparando webhooks quando há alteração.
   - **Administrador** – Um administrador tem acesso (API admin ou painel) para **revisar** os dados ingeridos e **atualizar manualmente** quando necessário (correções, complementos, criação de ligas/temporadas/jogos que não vêm da fonte automática). Garante qualidade e cobertura mesmo quando a fonte automática falha ou está incompleta.

## Usuários do Sistema

- **Clientes do SaaS** – Aplicações que consomem a API usando uma **API key liberada pelo próprio SaaS**. Cada chave pode ter rate limit e permissões configurados.
- **Administradores** – Criam e gerenciam API keys, configuram ligas/fontes de dados, revisam e corrigem dados (ingestão autônoma + edição manual), gerenciam webhooks e automação (via API admin ou painel futuro).

## Não escopo (v1)

- Front-end de administração (pode ser fase posterior).
- Dados em tempo real de transmissão (apenas dados estruturados e eventos discretos).
- Apostas ou odds (podem ser extensão futura).

## Documentos Relacionados

- [Modelo de Dados](./data-model.md)
- [Code Standards – Arquitetura](../code-standards/01-architecture-overview.md)
- [Webhooks](../code-standards/07-webhooks.md)
- [API Key e Rate Limit](../code-standards/12-api-key-and-rate-limit.md)
- [Automação e ingestão (autônoma + admin)](../code-standards/09-automation.md)
