/**
 * Mock da resposta do health check para testes.
 * Alterar aqui reflete em todos os testes que importam mockHealthResponse.
 */
export const mockHealthResponse = {
	status: "ok",
	timestamp: "2025-02-03T12:00:00.000Z",
} as const;

export function createMockHealthResponse(overrides?: { timestamp?: string }) {
	return {
		...mockHealthResponse,
		...overrides,
	};
}
