import * as Joi from "joi";

export interface EnvSchema {
	NODE_ENV: string;
	PORT: number;
	APP_VERSION?: string;
	// Firebase
	FIREBASE_PROJECT_ID?: string;
	FIREBASE_FIRESTORE_DATABASE_ID: string;
	FIREBASE_CLIENT_EMAIL?: string;
	FIREBASE_PRIVATE_KEY?: string;
	GOOGLE_APPLICATION_CREDENTIALS?: string;
}

const envSchema = Joi.object<EnvSchema>({
	NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
	PORT: Joi.number().port().default(3000),
	APP_VERSION: Joi.string().optional(),
	// Firebase: obrigatório em production; opcional em dev/test
	FIREBASE_PROJECT_ID: Joi.string().when("NODE_ENV", {
		is: "production",
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	FIREBASE_FIRESTORE_DATABASE_ID: Joi.string().default("sports-data"),
	FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
	FIREBASE_PRIVATE_KEY: Joi.string().optional(),
	GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),
}).options({ stripUnknown: true });

/**
 * Valida o objeto de configuração (process.env) contra o schema.
 * Lança se inválido; retorna o config validado e convertido.
 */
export function validate(config: Record<string, unknown>): EnvSchema {
	const { error, value } = envSchema.validate(config, { abortEarly: true });
	if (error) {
		throw new Error(`Config validation error: ${error.message}`);
	}
	return value as EnvSchema;
}
