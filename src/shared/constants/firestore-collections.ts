/**
 * Nomes das coleções do Firestore (banco sports-data).
 * Evita strings soltas no código.
 */
export const FIRESTORE_COLLECTIONS = {
	SPORTS: "sports",
	LEAGUES: "leagues",
	SEASONS: "seasons",
	TEAMS: "teams",
	PLAYERS: "players",
	VENUES: "venues",
	EVENTS: "events",
	GAME_EVENTS: "game_events",
	STANDINGS: "standings",
	STATISTICS: "statistics",
	API_KEYS: "api_keys",
	WEBHOOK_ENDPOINTS: "webhook_endpoints",
} as const;

export type FirestoreCollectionName =
	(typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS];
