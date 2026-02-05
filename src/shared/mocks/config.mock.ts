/**
 * Mock de configuração (env) para testes.
 * Alterar aqui reflete em todos os testes que importam mockConfig.
 */
export const mockConfig = {
	NODE_ENV: "test",
	PORT: 3000,
	APP_VERSION: "0.1.0",
	APP_FIRESTORE_DATABASE_ID: "sports-data",
} as const;

export type MockConfig = typeof mockConfig;
