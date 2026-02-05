import { Timestamp } from "firebase-admin/firestore";

/**
 * Converte um Date para Firestore Timestamp.
 * Usado em createdAt, updatedAt, deletedAt.
 */
export function toFirestoreTimestamp(date: Date): Timestamp {
	return Timestamp.fromDate(date);
}

/**
 * Retorna a data/hora atual (UTC).
 */
export function now(): Date {
	return new Date();
}
