import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { FirebaseController } from "./firebase.controller";
import { FirebaseService } from "./firebase.service";

describe("FirebaseController", () => {
	let controller: FirebaseController;
	let firebaseService: { getFirestore: jest.Mock };
	let configGet: jest.Mock;

	beforeEach(async () => {
		firebaseService = { getFirestore: jest.fn() };
		configGet = jest.fn();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [FirebaseController],
			providers: [
				{ provide: FirebaseService, useValue: firebaseService },
				{ provide: ConfigService, useValue: { get: configGet } },
			],
		}).compile();

		controller = module.get<FirebaseController>(FirebaseController);
		configGet.mockImplementation((key: string) =>
			key === "APP_FIRESTORE_DATABASE_ID" ? "sports-data" : undefined,
		);
	});

	it("deve estar definido", () => {
		expect(controller).toBeDefined();
	});

	it("deve retornar connected: false quando getFirestore retorna null", async () => {
		firebaseService.getFirestore.mockReturnValue(null);

		const result = await controller.testConnection();

		expect(result.connected).toBe(false);
		expect(result.databaseId).toBe("sports-data");
		expect(result.message).toContain("não inicializado");
		expect(result.collections).toBeUndefined();
	});

	it("deve retornar connected: true e listar coleções quando Firestore está conectado", async () => {
		const mockCollections = [{ id: "sports" }, { id: "leagues" }] as Array<{ id: string }>;
		firebaseService.getFirestore.mockReturnValue({
			listCollections: jest.fn().mockResolvedValue(mockCollections),
		});

		const result = await controller.testConnection();

		expect(result.connected).toBe(true);
		expect(result.databaseId).toBe("sports-data");
		expect(result.message).toContain("sports-data");
		expect(result.collections).toEqual(["sports", "leagues"]);
	});
});
