import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { json } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { validate } from "./config/config.schema";
import { ListAndTotalResponseDto } from "./shared/dto/list-and-total-response.dto";
import { PaginationQueryDto } from "./shared/dto/pagination-query.dto";

async function bootstrap() {
	const env = validate(process.env as unknown as Record<string, unknown>);

	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.set("trust proxy", 1);

	app.use(
		helmet({
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					"script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					"script-src-elem": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					"style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					"style-src-elem": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					"img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
					"font-src": ["'self'", "https://cdn.jsdelivr.net"],
					"connect-src": ["'self'", "https://cdn.jsdelivr.net"],
				},
			},
		}),
	);

	app.use(json({ limit: "1mb" }));

	app.enableCors({
		origin:
			process.env.CORS_ORIGINS?.split(",")
				.map((o) => o.trim())
				.filter(Boolean) ?? (env.NODE_ENV === "production" ? [] : true),
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Requested-With"],
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.enableVersioning({
		type: VersioningType.URI,
		prefix: "v",
	});

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Sports Data API")
		.setDescription(
			"API de dados esportivos: esportes, ligas, temporadas, times, jogadores, jogos, webhooks. Documentação completa com DTOs de request e response.",
		)
		.setVersion(env.APP_VERSION ?? "1.0.0")
		.addTag("health", "Health check e disponibilidade")
		.addTag("firebase", "Teste de conexão Firestore (banco sports-data)")
		.addTag("sports", "Esportes")
		.addTag("leagues", "Ligas")
		.addTag("seasons", "Temporadas")
		.addTag("teams", "Times")
		.addTag("players", "Jogadores")
		.addTag("venues", "Locais")
		.addTag("events", "Jogos / Partidas")
		.addTag("webhooks", "Webhooks")
		.addApiKey({ type: "apiKey", name: "X-API-Key", in: "header" }, "apiKey")
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig, {
		extraModels: [PaginationQueryDto, ListAndTotalResponseDto],
	});

	SwaggerModule.setup("docs", app, document, {
		jsonDocumentUrl: "docs-json",
		swaggerOptions: { persistAuthorization: true },
	});

	app.use(
		"/reference",
		apiReference({
			content: document,
			theme: "purple",
		}),
	);

	const port = env.PORT ?? 3000;
	const host = process.env.HOST ?? "0.0.0.0";
	await app.listen(port, host);
}

bootstrap().catch((err) => {
	console.error("Bootstrap failed:", err);
	process.exit(1);
});
