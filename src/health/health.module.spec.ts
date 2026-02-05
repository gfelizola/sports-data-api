import { Test, type TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthModule } from "./health.module";

describe("HealthModule", () => {
	let moduleRef: TestingModule;

	beforeEach(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [HealthModule],
		}).compile();
	});

	it("deve compilar o módulo", () => {
		expect(moduleRef).toBeDefined();
	});

	it("deve exportar HealthController", () => {
		const controller = moduleRef.get<HealthController>(HealthController);
		expect(controller).toBeDefined();
	});
});
