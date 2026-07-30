import { describe, expect, test } from "bun:test"
import { nemAPatoCatalogItemSchema } from "./schemas"

describe("nemAPatoCatalogItemSchema", () => {
	test("aceita registros configuráveis", () => {
		expect(nemAPatoCatalogItemSchema.parse({ name: "Especialista", slug: "especialista" })).toEqual(
			{
				name: "Especialista",
				slug: "especialista",
			},
		)
	})

	test("rejeita identificadores incompatíveis com URLs", () => {
		expect(
			nemAPatoCatalogItemSchema.safeParse({ name: "Teste", slug: "Muito difícil" }).success,
		).toBeFalse()
	})
})
