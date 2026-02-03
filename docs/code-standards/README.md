# Documentação de Padrões de Código – Sports Data API

## Visão Geral

Esta documentação descreve os padrões de código e decisões técnicas do Sports Data API, baseado em NestJS, Clean Architecture e Domain-Driven Design (DDD), com persistência no **Firebase (Firestore)** e suporte a **webhooks** e **automação de dados**.

Estrutura inspirada no [TrinoCore](https://github.com/trinobank/TrinoCore) (NestJS).

## Índice

### Fundamentos

1. **[Visão Geral da Arquitetura](./01-architecture-overview.md)**
   - Princípios (Clean Architecture, DDD)
   - Estrutura de pastas
   - Camadas e dependências

2. **[Convenções de Nomenclatura](./02-naming-conventions.md)**
   - Arquivos, classes, variáveis, DTOs, UseCases, Repositories

### Componentes Principais

3. **[Padrões de Controllers](./03-controllers.md)**
   - Versionamento, Swagger, autenticação (API Key)

4. **[Padrões de Use Cases](./04-usecases.md)**
   - Estrutura, Logger, Result Pattern, erros

5. **[Padrões de Repositories](./05-repositories.md)**
   - Interface abstrata + implementação Firebase

6. **[Padrões Firebase (Firestore)](./06-firebase-patterns.md)**
   - Coleções, documentos, conversão para Entities, soft delete

7. **[Webhooks](./07-webhooks.md)**
   - Eventos, payload, assinatura, retentativas

8. **[Documentação de API (Swagger + Scalar)](./08-api-documentation.md)**
   - Documentação obrigatória em todos os endpoints; DTOs de request e response; OpenAPI (Swagger) + Scalar para UI

### Automação e Configuração

9. **[Automação e Sincronização de Dados](./09-automation.md)**
   - Jobs, fontes externas, idempotência, webhooks

10. **[Configuração](./10-configuration.md)**
    - TypeScript, NestJS, variáveis de ambiente

11. **[Tratamento de Erros](./11-error-handling.md)**
    - Códigos de erro, exceções NestJS, resposta padronizada

12. **[API Key e Rate Limit](./12-api-key-and-rate-limit.md)**
    - API key emitida pelo SaaS, rate limit variável por chave, headers e 429

### Referência Rápida

- **Entidades**: Ver [Modelo de Dados](../product/data-model.md)
- **Produto**: Ver [Visão do Produto](../product/README.md)

## Princípios

1. **Clean Architecture**: Controllers → UseCases → Repositories → Firestore
2. **DDD**: Entities representam o domínio; repositórios abstraem persistência
3. **Injeção de dependências**: NestJS DI em toda a aplicação
4. **Type safety**: TypeScript estrito
5. **Testabilidade**: Interfaces para repositórios e serviços externos

## Stack

- **Runtime**: Node.js (v20+)
- **Framework**: NestJS
- **Banco de dados**: Firebase (Firestore)
- **Documentação API**: Swagger/OpenAPI
- **Eventos internos**: EventEmitter2 (para disparar webhooks após alterações)

## Como Usar

1. **Novos devs**: Começar por [01-architecture-overview](./01-architecture-overview.md) e [02-naming-conventions](./02-naming-conventions.md).
2. **Implementar features**: Consultar o documento do componente (Controllers, UseCases, Repositories, Webhooks).
3. **Integrar dados**: Ver [09-automation](./09-automation.md) e [06-firebase-patterns](./06-firebase-patterns.md).
