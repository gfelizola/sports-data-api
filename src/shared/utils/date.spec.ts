import { now, toFirestoreTimestamp } from "./date";

describe("date utils", () => {
	describe("toFirestoreTimestamp", () => {
		it("deve converter Date para Firestore Timestamp", () => {
			const date = new Date("2025-02-03T12:00:00.000Z");
			const ts = toFirestoreTimestamp(date);
			expect(ts).toBeDefined();
			expect(ts.seconds).toBe(Math.floor(date.getTime() / 1000));
			expect(ts.nanoseconds).toBe(0);
		});

		it("deve preservar milissegundos em nanoseconds", () => {
			const date = new Date("2025-02-03T12:00:00.123Z");
			const ts = toFirestoreTimestamp(date);
			expect(ts.nanoseconds).toBe(123_000_000);
		});
	});

	describe("now", () => {
		it("deve retornar instância de Date", () => {
			const n = now();
			expect(n).toBeInstanceOf(Date);
		});
	});
});
