# Soft delete

- Documentos que suportam exclusão lógica possuem o campo **`deletedAt`** (`Timestamp | null`).
- **Excluir**: fazer `update` com `deletedAt: toFirestoreTimestamp(now())` (nunca remover o documento).
- **Consultas**: sempre filtrar com `where(DELETED_AT_FIELD, '==', null)` para listar apenas registros não excluídos.

Constante e referências: `src/shared/utils/soft-delete.ts`.
