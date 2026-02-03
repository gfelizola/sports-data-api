# Sports Data API

API backend (SaaS) para fornecimento de dados esportivos: jogos, campeonatos, temporadas, times, jogadores e entidades relacionadas. Suporta múltiplos esportes (futebol, basquete, futebol americano, baseball, F1 e outros) com armazenamento no Firebase e notificação de clientes via webhooks.

## Visão Geral

- **Stack**: Node.js, NestJS
- **Banco de dados**: Firebase (Firestore)
- **Funcionalidades**: API REST versionada, webhooks para clientes, atualização automatizada de dados. Documentação completa da API com **Swagger (OpenAPI)** e **Scalar** (cada endpoint com DTOs de request e response).
- **Esportes**: Modelo genérico para esportes coletivos e individuais

## Pré-requisitos

- [Node](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/) ou pnpm
- Conta [Firebase](https://firebase.google.com/) (Firestore)
- (Opcional) Credenciais de APIs externas para ingestão de dados

## Estrutura do Repositório

```
sports-data-api/
├── docs/                    # Documentação
│   ├── product/             # Visão do produto e escopo
│   └── code-standards/      # Padrões técnicos (NestJS, Firebase, API)
├── src/                     # Código fonte (a ser implementado)
└── README.md
```

## Documentação

- **[Visão do produto e escopo](./docs/product/README.md)** – Esportes cobertos, entidades, casos de uso
- **[Padrões de código e arquitetura](./docs/code-standards/README.md)** – Arquitetura, convenções, API, webhooks, Firebase, automação
- **[Documentação de API (Swagger + Scalar)](./docs/code-standards/08-api-documentation.md)** – Regra de documentar todos os endpoints com DTOs de request/response; uso de Swagger e Scalar

## Setup (após implementação)

```bash
# Dependências
npm install

# Variáveis de ambiente (copiar .env.example e configurar Firebase)
cp .env.example .env

# Desenvolvimento
npm run start:dev
```

## Licença

Projeto privado.
