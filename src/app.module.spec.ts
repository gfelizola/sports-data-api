import { Test, type TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { HealthController } from "./health/health.controller";

describe("AppModule", () => {
	let moduleRef: TestingModule;

	beforeEach(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
	});

	it("deve compilar o módulo", () => {
		expect(moduleRef).toBeDefined();
	});

	it("deve ter HealthController registrado", () => {
		const controller = moduleRef.get<HealthController>(HealthController);
		expect(controller).toBeDefined();
	});
});
