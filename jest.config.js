"use strict";

module.exports = {
	rootDir: "src",
	testRegex: ".*\\.spec\\.ts$",
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	transformIgnorePatterns: ["<rootDir>/../node_modules/"],
	collectCoverageFrom: [
		"**/*.(t|j)s",
		"!**/*.spec.ts",
		"!**/__mocks__/**",
		"!**/mocks/**",
		"!main.ts",
		"!**/health/dto/health-response.dto.ts",
		"!**/shared/dto/list-and-total-response.dto.ts",
		"!**/shared/utils/soft-delete.ts",
	],
	coverageDirectory: "../coverage",
	coverageThreshold: {
		global: {
			statements: 90,
			branches: 86,
			functions: 90,
			lines: 90,
		},
	},
	coverageReporters: ["text", "text-summary", "html", "json-summary"],
	moduleFileExtensions: ["js", "json", "ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	testEnvironment: "node",
	setupFilesAfterEnv: ["<rootDir>/../jest.setup.js"],
};
