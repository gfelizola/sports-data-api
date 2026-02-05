import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * DTO de query para listagens paginadas.
 * Uso: GET /v1/items?page=1&limit=20
 */
export class PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Página (1-based)",
		minimum: 1,
		default: DEFAULT_PAGE,
	})
	@IsOptional()
	@Transform(({ value }) => (value !== undefined && value !== "" ? Number(value) : DEFAULT_PAGE))
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = DEFAULT_PAGE;

	@ApiPropertyOptional({
		description: "Quantidade por página",
		minimum: 1,
		maximum: MAX_LIMIT,
		default: DEFAULT_LIMIT,
	})
	@IsOptional()
	@Transform(({ value }) => (value !== undefined && value !== "" ? Number(value) : DEFAULT_LIMIT))
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_LIMIT)
	limit?: number = DEFAULT_LIMIT;
}

export { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT };
