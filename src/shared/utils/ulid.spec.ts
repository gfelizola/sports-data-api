import { ulid } from "./ulid";

describe("ulid", () => {
	it("deve retornar string de 26 caracteres", () => {
		const id = ulid();
		expect(typeof id).toBe("string");
		expect(id).toHaveLength(26);
	});

	it("deve conter apenas caracteres Crockford base32", () => {
		const id = ulid();
		expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
	});

	it("deve gerar IDs diferentes em chamadas sucessivas", () => {
		const a = ulid();
		const b = ulid();
		expect(a).not.toBe(b);
	});
});
