import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { EnvSchema } from "../config/config.schema";
import { FirebaseTestResponseDto } from "./dto/firebase-test-response.dto";
import { FirebaseService } from "./firebase.service";

@ApiTags("firebase")
@Controller({ path: "firebase", version: "1" })
export class FirebaseController {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly configService: ConfigService<EnvSchema, true>,
	) {}

	@Get("test")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Teste de conexão Firestore",
		description:
			"Verifica se a API está conectada ao banco Firestore configurado (sports-data) e lista as coleções existentes. Rota pública para diagnóstico.",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Teste executado (conectado ou não)",
		type: FirebaseTestResponseDto,
	})
	async testConnection(): Promise<FirebaseTestResponseDto> {
		const db = this.firebaseService.getFirestore();
		const databaseId =
			this.configService.get("APP_FIRESTORE_DATABASE_ID", { infer: true }) ?? "sports-data";

		if (db === null) {
			return {
				connected: false,
				databaseId,
				message:
					"Firestore não inicializado. Verifique APP_PROJECT_ID e credenciais (APP_SA_CLIENT_EMAIL/APP_SA_PRIVATE_KEY ou GOOGLE_APPLICATION_CREDENTIALS).",
			};
		}

		const collections = await db.listCollections();
		const collectionIds = collections.map((col) => col.id);

		return {
			connected: true,
			databaseId,
			message: `Conectado ao banco ${databaseId}`,
			collections: collectionIds,
		};
	}
}
