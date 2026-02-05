import { ulid as generateUlid } from "ulid";

/**
 * Gera um ID no formato ULID (lexicograficamente ordenável, único).
 * Usado como identificador opaco de documentos no Firestore.
 */
export function ulid(): string {
	return generateUlid();
}
