import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Resposta do endpoint de teste de conexão com o Firestore (banco sports-data).
 */
export class FirebaseTestResponseDto {
	@ApiProperty({
		description: "Indica se a API está conectada ao Firestore",
		example: true,
	})
	connected!: boolean;

	@ApiProperty({
		description: "ID do banco Firestore utilizado (ex.: sports-data)",
		example: "sports-data",
	})
	databaseId!: string;

	@ApiProperty({
		description: "Mensagem descritiva do status",
		example: "Conectado ao banco sports-data",
	})
	message!: string;

	@ApiPropertyOptional({
		description: "IDs das coleções existentes no banco (confirma que está no banco correto)",
		example: ["sports", "leagues", "events"],
		isArray: true,
	})
	collections?: string[];
}
