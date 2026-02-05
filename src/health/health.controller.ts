import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthResponseDto } from "./dto/health-response.dto";

@ApiTags("health")
@Controller({ path: "health", version: "1" })
export class HealthController {
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Health check",
		description: "Verifica se a API está disponível. Rota pública, não exige API Key.",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Serviço disponível",
		type: HealthResponseDto,
	})
	getHealth(): HealthResponseDto {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	}
}
