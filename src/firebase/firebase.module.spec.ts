import { ConfigModule } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { validate } from "../config/config.schema";
import { FirebaseModule } from "./firebase.module";
import { FirebaseService } from "./firebase.service";

describe("FirebaseModule", () => {
	let moduleRef: TestingModule;

	beforeEach(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					validate: (config: Record<string, unknown>) =>
						validate({ ...config, NODE_ENV: "test", PORT: 3000 }),
				}),
				FirebaseModule,
			],
		}).compile();
	});

	it("deve compilar o módulo", () => {
		expect(moduleRef).toBeDefined();
	});

	it("deve exportar FirebaseService", () => {
		const service = moduleRef.get<FirebaseService>(FirebaseService);
		expect(service).toBeDefined();
	});
});
