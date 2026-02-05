/**
 * Padrão de soft delete no Firestore.
 *
 * - Documentos que suportam exclusão lógica têm campo `deletedAt: Timestamp | null`.
 * - Exclusão: update com `deletedAt: toFirestoreTimestamp(now())`.
 * - Consultas: filtrar com `where(DELETED_AT_FIELD, '==', null)` para não retornar excluídos.
 *
 * @see docs/code-standards/06-firebase-patterns.md
 */

export const DELETED_AT_FIELD = "deletedAt" as const;
