import { DEFAULT_NODE_ENV, DEFAULT_PORT } from "./configs";

describe("configs", () => {
	it("DEFAULT_PORT deve ser 3000", () => {
		expect(DEFAULT_PORT).toBe(3000);
	});

	it("DEFAULT_NODE_ENV deve ser development", () => {
		expect(DEFAULT_NODE_ENV).toBe("development");
	});
});
