import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO de resposta do health check.
 */
export class HealthResponseDto {
	@ApiProperty({
		description: "Status do serviço",
		example: "ok",
	})
	status!: string;

	@ApiProperty({
		description: "Data/hora da resposta em ISO 8601",
		example: "2025-02-03T12:00:00.000Z",
	})
	timestamp!: string;
}
