import { FIRESTORE_COLLECTIONS } from "./firestore-collections";

describe("FIRESTORE_COLLECTIONS", () => {
	it("deve conter todas as coleções do modelo de dados", () => {
		expect(FIRESTORE_COLLECTIONS.SPORTS).toBe("sports");
		expect(FIRESTORE_COLLECTIONS.LEAGUES).toBe("leagues");
		expect(FIRESTORE_COLLECTIONS.SEASONS).toBe("seasons");
		expect(FIRESTORE_COLLECTIONS.TEAMS).toBe("teams");
		expect(FIRESTORE_COLLECTIONS.PLAYERS).toBe("players");
		expect(FIRESTORE_COLLECTIONS.VENUES).toBe("venues");
		expect(FIRESTORE_COLLECTIONS.EVENTS).toBe("events");
		expect(FIRESTORE_COLLECTIONS.GAME_EVENTS).toBe("game_events");
		expect(FIRESTORE_COLLECTIONS.STANDINGS).toBe("standings");
		expect(FIRESTORE_COLLECTIONS.STATISTICS).toBe("statistics");
		expect(FIRESTORE_COLLECTIONS.API_KEYS).toBe("api_keys");
		expect(FIRESTORE_COLLECTIONS.WEBHOOK_ENDPOINTS).toBe("webhook_endpoints");
	});
});
