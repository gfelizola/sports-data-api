import { mockConfig } from "@/shared/mocks/config.mock";
import { validate } from "./config.schema";

describe("validate (config.schema)", () => {
	it("deve retornar config válido quando env está correto", () => {
		const config = {
			NODE_ENV: "test",
			PORT: 3000,
			APP_VERSION: "0.1.0",
		};
		const result = validate(config);
		expect(result.NODE_ENV).toBe("test");
		expect(result.PORT).toBe(3000);
		expect(result.APP_VERSION).toBe("0.1.0");
	});

	it("deve aceitar config do mock shared", () => {
		const result = validate(mockConfig as unknown as Record<string, unknown>);
		expect(result.NODE_ENV).toBe(mockConfig.NODE_ENV);
		expect(result.PORT).toBe(mockConfig.PORT);
	});

	it("deve usar default para PORT quando ausente", () => {
		const result = validate({ NODE_ENV: "development" });
		expect(result.PORT).toBe(3000);
	});

	it("deve usar default para NODE_ENV quando ausente", () => {
		const result = validate({ PORT: 4000 });
		expect(result.NODE_ENV).toBe("development");
	});

	it("deve lançar quando NODE_ENV é inválido", () => {
		expect(() => validate({ NODE_ENV: "invalid", PORT: 3000 })).toThrow("Config validation error");
	});

	it("deve lançar quando PORT não é número", () => {
		expect(() => validate({ NODE_ENV: "test", PORT: "abc" })).toThrow("Config validation error");
	});

	it("deve lançar quando PORT está fora da faixa de porta", () => {
		expect(() => validate({ NODE_ENV: "test", PORT: 99999 })).toThrow("Config validation error");
	});

	it("deve usar default sports-data para FIREBASE_FIRESTORE_DATABASE_ID quando ausente", () => {
		const result = validate({ NODE_ENV: "development", PORT: 3000 });
		expect(result.FIREBASE_FIRESTORE_DATABASE_ID).toBe("sports-data");
	});

	it("deve aceitar FIREBASE_FIRESTORE_DATABASE_ID customizado", () => {
		const result = validate({
			NODE_ENV: "test",
			PORT: 3000,
			FIREBASE_FIRESTORE_DATABASE_ID: "my-db",
		});
		expect(result.FIREBASE_FIRESTORE_DATABASE_ID).toBe("my-db");
	});

	it("deve exigir FIREBASE_PROJECT_ID em production", () => {
		expect(() => validate({ NODE_ENV: "production", PORT: 3000 })).toThrow(
			"Config validation error",
		);
	});

	it("deve aceitar FIREBASE_PROJECT_ID em production", () => {
		const result = validate({
			NODE_ENV: "production",
			PORT: 3000,
			FIREBASE_PROJECT_ID: "my-project",
		});
		expect(result.FIREBASE_PROJECT_ID).toBe("my-project");
	});
});
