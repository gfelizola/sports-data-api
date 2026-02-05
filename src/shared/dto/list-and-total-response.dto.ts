import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO genérico de resposta paginada (lista + total).
 * Uso: ListAndTotalResponseDto<EventResponseDto>
 */
export class ListAndTotalResponseDto<T> {
	@ApiProperty({ description: "Lista de itens", isArray: true })
	items!: T[];

	@ApiProperty({ description: "Total de registros" })
	total!: number;

	@ApiProperty({ description: "Página atual (1-based)" })
	page!: number;

	@ApiProperty({ description: "Quantidade por página" })
	limit!: number;
}
