import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import { FirebaseService } from "./firebase.service";

const mockFirestore = {
	collection: jest.fn(() => ({})),
} as unknown as Firestore;

const mockApp = {} as App;

jest.mock("firebase-admin/app", () => ({
	getApps: jest.fn(() => []),
	initializeApp: jest.fn(() => mockApp),
	cert: jest.fn(() => ({})),
	applicationDefault: jest.fn(() => ({})),
}));

jest.mock("firebase-admin/firestore", () => ({
	getFirestore: jest.fn(() => mockFirestore),
}));

describe("FirebaseService", () => {
	let service: FirebaseService;
	let configGet: jest.Mock;

	beforeEach(async () => {
		configGet = jest.fn();
		const moduleRef: TestingModule = await Test.createTestingModule({
			providers: [
				FirebaseService,
				{
					provide: ConfigService,
					useValue: { get: configGet },
				},
			],
		}).compile();

		service = moduleRef.get<FirebaseService>(FirebaseService);
		jest.clearAllMocks();
	});

	it("deve retornar null em getFirestore quando NODE_ENV=test e sem FIREBASE_PROJECT_ID", () => {
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "test";
			if (key === "FIREBASE_PROJECT_ID") return undefined;
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			return undefined;
		});

		const result = service.getFirestore();
		expect(result).toBeNull();
	});

	it("deve usar database ID sports-data ao inicializar Firestore", async () => {
		const { getFirestore } = await import("firebase-admin/firestore");
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			if (key === "FIREBASE_CLIENT_EMAIL") return "test@project.iam.gserviceaccount.com";
			if (key === "FIREBASE_PRIVATE_KEY") return "fake-key";
			return undefined;
		});

		const db = service.getFirestore();
		expect(db).not.toBeNull();
		expect(getFirestore).toHaveBeenCalledWith(mockApp, "sports-data");
	});

	it("getCollection deve lançar quando Firestore não está inicializado", () => {
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "test";
			if (key === "FIREBASE_PROJECT_ID") return undefined;
			return undefined;
		});

		expect(() => service.getCollection("sports")).toThrow("Firestore not initialized");
	});

	it("getCollection deve retornar referência da coleção quando Firestore está inicializado", () => {
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			if (key === "FIREBASE_CLIENT_EMAIL") return "test@project.iam.gserviceaccount.com";
			if (key === "FIREBASE_PRIVATE_KEY") return "fake-key";
			return undefined;
		});

		const col = service.getCollection("leagues");
		expect(col).toBeDefined();
		expect(mockFirestore.collection).toHaveBeenCalledWith("leagues");
	});

	it("deve retornar mesma instância em chamadas sucessivas a getFirestore", () => {
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			if (key === "FIREBASE_CLIENT_EMAIL") return "test@project.iam.gserviceaccount.com";
			if (key === "FIREBASE_PRIVATE_KEY") return "fake-key";
			return undefined;
		});

		const a = service.getFirestore();
		const b = service.getFirestore();
		expect(a).toBe(b);
	});

	it("deve reutilizar app existente quando getApps retorna app", async () => {
		const appModule = await import("firebase-admin/app");
		const getAppsMock = appModule.getApps as jest.Mock;
		const initAppMock = appModule.initializeApp as jest.Mock;
		getAppsMock.mockReturnValueOnce([mockApp]);
		initAppMock.mockClear();

		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			return undefined;
		});

		const db = service.getFirestore();
		expect(db).not.toBeNull();
		expect(initAppMock).not.toHaveBeenCalled();
	});

	it("deve retornar null quando não há projectId e applicationDefault falha", async () => {
		const appModule = await import("firebase-admin/app");
		(appModule.initializeApp as jest.Mock).mockImplementationOnce(() => {
			throw new Error("No credentials");
		});

		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return undefined;
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			return undefined;
		});

		const db = service.getFirestore();
		expect(db).toBeNull();
	});

	it("deve inicializar com applicationDefault quando não há projectId mas applicationDefault funciona", () => {
		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return undefined;
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			return undefined;
		});

		const db = service.getFirestore();
		expect(db).not.toBeNull();
	});

	it("deve retornar null quando há projectId mas sem clientEmail e applicationDefault falha", async () => {
		const appModule = await import("firebase-admin/app");
		(appModule.initializeApp as jest.Mock).mockImplementationOnce(() => {
			throw new Error("No credentials");
		});

		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			if (key === "FIREBASE_CLIENT_EMAIL") return undefined;
			if (key === "FIREBASE_PRIVATE_KEY") return undefined;
			return undefined;
		});

		const db = service.getFirestore();
		expect(db).toBeNull();
	});

	it("deve reutilizar this.app na segunda chamada a ensureApp quando getFirestore(app, id) falhou na primeira", async () => {
		const firestoreModule = await import("firebase-admin/firestore");
		const getFirestoreMock = firestoreModule.getFirestore as jest.Mock;

		configGet.mockImplementation((key: string) => {
			if (key === "NODE_ENV") return "development";
			if (key === "FIREBASE_PROJECT_ID") return "my-project";
			if (key === "FIREBASE_FIRESTORE_DATABASE_ID") return "sports-data";
			if (key === "FIREBASE_CLIENT_EMAIL") return "test@project.iam.gserviceaccount.com";
			if (key === "FIREBASE_PRIVATE_KEY") return "fake-key";
			return undefined;
		});

		getFirestoreMock.mockImplementationOnce(() => {
			throw new Error("Firestore unavailable");
		});
		expect(() => service.getFirestore()).toThrow("Firestore unavailable");

		getFirestoreMock.mockReturnValueOnce(mockFirestore);
		const db = service.getFirestore();
		expect(db).toBe(mockFirestore);
	});
});
