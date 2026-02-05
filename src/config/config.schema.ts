import * as Joi from "joi";

/** Padrão APP_*: mesmo nome no .env local e no App Hosting (evita prefixos reservados FIREBASE_, X_GOOGLE_, EXT_). */
export interface EnvSchema {
	NODE_ENV: string;
	PORT: number;
	APP_VERSION?: string;
	APP_PROJECT_ID?: string;
	APP_FIRESTORE_DATABASE_ID: string;
	APP_SA_CLIENT_EMAIL?: string;
	APP_SA_PRIVATE_KEY?: string;
	GOOGLE_APPLICATION_CREDENTIALS?: string;
}

const envSchema = Joi.object({
	NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
	PORT: Joi.number().port().default(3000),
	APP_VERSION: Joi.string().optional(),
	APP_PROJECT_ID: Joi.string().optional(),
	APP_FIRESTORE_DATABASE_ID: Joi.string().optional(),
	APP_SA_CLIENT_EMAIL: Joi.string().optional(),
	APP_SA_PRIVATE_KEY: Joi.string().optional(),
	// Compatibilidade: .env legado com FIREBASE_* ainda funciona (não usar no App Hosting – prefixo reservado)
	FIREBASE_PROJECT_ID: Joi.string().optional(),
	FIREBASE_FIRESTORE_DATABASE_ID: Joi.string().optional(),
	FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
	FIREBASE_PRIVATE_KEY: Joi.string().optional(),
	GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),
}).options({ stripUnknown: true });

/**
 * Valida o objeto de configuração (process.env) contra o schema.
 * Normaliza para APP_* (aceita APP_* ou FIREBASE_* como entrada).
 */
export function validate(config: Record<string, unknown>): EnvSchema {
	const { error, value } = envSchema.validate(config, { abortEarly: true });
	if (error) {
		throw new Error(`Config validation error: ${error.message}`);
	}
	const v = value as Record<string, unknown>;

	const normalized: EnvSchema = {
		NODE_ENV: v.NODE_ENV as string,
		PORT: v.PORT as number,
		APP_VERSION: v.APP_VERSION as string | undefined,
		APP_PROJECT_ID: (v.APP_PROJECT_ID ?? v.FIREBASE_PROJECT_ID) as string | undefined,
		APP_FIRESTORE_DATABASE_ID: (v.APP_FIRESTORE_DATABASE_ID ??
			v.FIREBASE_FIRESTORE_DATABASE_ID ??
			"sports-data") as string,
		APP_SA_CLIENT_EMAIL: (v.APP_SA_CLIENT_EMAIL ?? v.FIREBASE_CLIENT_EMAIL) as string | undefined,
		APP_SA_PRIVATE_KEY: (v.APP_SA_PRIVATE_KEY ?? v.FIREBASE_PRIVATE_KEY) as string | undefined,
		GOOGLE_APPLICATION_CREDENTIALS: v.GOOGLE_APPLICATION_CREDENTIALS as string | undefined,
	};

	if (normalized.NODE_ENV === "production" && !normalized.APP_PROJECT_ID) {
		throw new Error(
			"Config validation error: APP_PROJECT_ID (or FIREBASE_PROJECT_ID) is required in production",
		);
	}

	return normalized;
}
