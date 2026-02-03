# API Key e Rate Limit

## Objetivo

Definir como o Sports Data API emite e gerencia API keys e aplica rate limit **variável por API key**, garantindo segurança e controle de uso.

## API Key emitida pelo SaaS

- As **API keys são criadas e gerenciadas pelo próprio SaaS**. Um administrador (ou processo de onboarding) gera chaves para clientes; o cliente usa a chave no header em todas as requisições à API.
- A chave **nunca** é armazenada em texto claro no banco: apenas hash (ex.: SHA-256) e um prefixo para exibição (ex.: `sda_live_****`).
- Ao criar uma API key, o sistema gera um valor único (ex.: ULID + random), retorna o valor **uma única vez** ao admin/cliente e persiste apenas o hash e o prefixo.
- Cada API key pode ter nome/descrição, estado ativo/inativo e **configuração de rate limit própria** (ver abaixo).
- Rotas administrativas (criar/revogar/listar API keys) devem ser protegidas por autenticação de administrador (não por API key de cliente).

## Autenticação na API

- Header esperado: `X-API-Key: <valor da chave>` (ou `Authorization: ApiKey <valor>` conforme convenção adotada).
- Guard global (exceto rotas públicas como health): extrair o header, buscar API key por hash do valor, validar se está ativa e anexar o contexto (apiKeyId, rateLimitConfig) ao request para uso nos UseCases e no rate limiter.
- Resposta `401 Unauthorized` quando a chave estiver ausente, inválida ou inativa.

## Rate limit variável por API key

- O limite de requisições **pode variar por API key**. Cada registro de API key possui campos como:
  - `rateLimitRequestsPerMinute` (obrigatório)
  - `rateLimitRequestsPerHour` (opcional)
  - `rateLimitRequestsPerDay` (opcional)
- O rate limiter usa o identificador da API key (ou do cliente) como chave e aplica a janela (minuto/hora/dia) configurada para aquela chave.
- Implementação sugerida: contador por janela (ex.: Redis com TTL) por `apiKeyId` + janela (minute/hour/day). A cada requisição: incrementar contador; se ultrapassar o limite, rejeitar com `429 Too Many Requests`.
- Janela deslizante ou fixa: documentar (ex.: janela fixa de 1 minuto a partir do primeiro request daquele minuto).

## Headers de resposta (rate limit)

- Em todas as respostas da API (ou nas que forem limitadas), incluir headers informativos:
  - `X-RateLimit-Limit`: limite máximo da janela (ex.: 100)
  - `X-RateLimit-Remaining`: requisições restantes na janela atual
  - `X-RateLimit-Reset`: timestamp (ou segundos) em que a janela é renovada (opcional)
- Em respostas `429`:
  - `Retry-After`: segundos até o cliente poder tentar novamente (recomendado)

## Boas práticas

- Não logar o valor da API key; apenas prefixo ou id.
- Permitir revogação (soft delete ou `active: false`) sem apagar o registro, para auditoria.
- Considerar rota para o cliente ver uso (requisições na janela) se necessário no produto.
- Rate limit deve ser aplicado **após** validação da API key (não consumir limite para requisições 401).

## Referências

- [Modelo de Dados – ApiKey](../product/data-model.md)
- [Visão do Produto – Autenticação e Rate Limit](../product/README.md)
- [Controllers e autenticação](./03-controllers.md)
