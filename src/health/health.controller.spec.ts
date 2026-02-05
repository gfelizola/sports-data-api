import { Test, type TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { mockHealthResponse } from "./mocks/health-response.mock";

describe("HealthController", () => {
	let controller: HealthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
		}).compile();

		controller = module.get<HealthController>(HealthController);
	});

	it("deve estar definido", () => {
		expect(controller).toBeDefined();
	});

	it("deve retornar status ok e timestamp em getHealth", () => {
		const result = controller.getHealth();
		expect(result.status).toBe(mockHealthResponse.status);
		expect(result.timestamp).toBeDefined();
		expect(typeof result.timestamp).toBe("string");
		expect(new Date(result.timestamp).getTime()).not.toBeNaN();
	});
});
