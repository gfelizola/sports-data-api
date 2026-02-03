# Padrões Firebase (Firestore)

## Objetivo

Definir como o Sports Data API usa o Firestore: coleções, documentos, conversão para Entities, soft delete e boas práticas.

## Serviço Firebase

- Um módulo/serviço central que encapsula o **Firebase App** e o **Firestore**.
- Inicialização com credenciais (arquivo de service account ou variáveis de ambiente).
- Exportar instância de `FirebaseFirestore` (ou wrapper) para injeção nos repositórios.

## Coleções

- Nomes no plural, em inglês: `sports`, `leagues`, `seasons`, `teams`, `players`, `venues`, `events`, `standings`, `statistics`.
- Coleções auxiliares: `webhook_endpoints`, `api_keys` (ou em Auth do Firebase, conforme decisão).
- Documentos identificados por `id` (string) gerado pela aplicação (ex.: ULID); opcionalmente campo `externalId` para sincronização com fontes externas.

## Estrutura do Documento

- Campos em **camelCase**.
- Timestamps: `createdAt`, `updatedAt` (Firestore `Timestamp` ou ISO string conforme convenção).
- Soft delete: campo `deletedAt` (timestamp ou null); queries devem filtrar `deletedAt == null` onde aplicável.

## Conversão Document → Entity

- Criar método estático na Entity ou mapper dedicado: `EventEntity.fromFirestore(doc)`.
- Tratar `Timestamp` do Firestore → `Date` em JavaScript.
- Não expor tipos do Firestore na camada de domínio; a interface do repositório retorna apenas Entities.

## Escrita (create/update)

- `create`: definir `id`, `createdAt`, `updatedAt`; usar `set` ou `add` com ID pré-gerado.
- `update`: atualizar apenas campos enviados; sempre atualizar `updatedAt`.
- `delete`: soft delete → `update` com `deletedAt: new Date()`.

## Consultas

- Usar `where` para filtros (sportId, seasonId, status, etc.).
- Ordenação: `orderBy('scheduledAt', 'asc')` (exemplo).
- Paginação: `limit()` + `startAfter(documentSnapshot)` para cursor-based pagination (recomendado no Firestore).
- Índices compostos: criar no Firebase Console conforme necessidade das queries (evitar muitas leituras desnecessárias).

## Segurança

- Não confiar apenas em regras do Firestore se a API for o único cliente; a API valida permissões (API Key, tenant). Regras do Firestore podem restringir acesso direto ao banco (ex.: apenas backend com service account).

## Variáveis de Ambiente

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (ou path para JSON de service account).
- Nunca commitar chaves no repositório.

## Referências

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Modelo de Dados](../product/data-model.md)
- [Repositories](./05-repositories.md)
