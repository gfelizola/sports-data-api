import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT, PaginationQueryDto } from "./pagination-query.dto";

describe("PaginationQueryDto", () => {
	it("deve usar default page e limit quando vazio", async () => {
		const dto = plainToInstance(PaginationQueryDto, {});
		await expect(validate(dto)).resolves.toHaveLength(0);
		expect(dto.page).toBe(DEFAULT_PAGE);
		expect(dto.limit).toBe(DEFAULT_LIMIT);
	});

	it("deve aceitar page e limit válidos", async () => {
		const dto = plainToInstance(PaginationQueryDto, {
			page: 2,
			limit: 10,
		});
		await expect(validate(dto)).resolves.toHaveLength(0);
		expect(dto.page).toBe(2);
		expect(dto.limit).toBe(10);
	});

	it("deve transformar strings de query em número para page e limit", async () => {
		const dto = plainToInstance(PaginationQueryDto, {
			page: "3",
			limit: "15",
		});
		await expect(validate(dto)).resolves.toHaveLength(0);
		expect(dto.page).toBe(3);
		expect(dto.limit).toBe(15);
	});

	it("deve aceitar limit no máximo MAX_LIMIT", async () => {
		const dto = plainToInstance(PaginationQueryDto, {
			page: 1,
			limit: MAX_LIMIT,
		});
		await expect(validate(dto)).resolves.toHaveLength(0);
		expect(dto.limit).toBe(MAX_LIMIT);
	});

	it("deve rejeitar limit acima de MAX_LIMIT", async () => {
		const dto = plainToInstance(PaginationQueryDto, {
			page: 1,
			limit: MAX_LIMIT + 1,
		});
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("deve rejeitar page menor que 1", async () => {
		const dto = plainToInstance(PaginationQueryDto, { page: 0, limit: 10 });
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("deve rejeitar limit não inteiro", async () => {
		const dto = plainToInstance(PaginationQueryDto, {
			page: 1,
			limit: 10.5,
		});
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});
});
