declare module "bun:test" {
	type Matchers = {
		not: Matchers
		toBe(expected: unknown): void
		toBeFalse(): void
		toBeNull(): void
		toBeTrue(): void
		toContain(expected: string): void
		toEqual(expected: unknown): void
		toHaveLength(expected: number): void
		toMatch(expected: RegExp): void
		toMatchObject(expected: object): void
		toThrow(expected?: string): void
	}

	type Expect = {
		(actual: unknown): Matchers
		arrayContaining(items: readonly unknown[]): unknown
	}

	export const describe: (name: string, run: () => void) => void
	export const expect: Expect
	export const mock: { module(name: string, factory: () => object): void }
	export const test: (name: string, run: () => void | Promise<void>) => void
}
