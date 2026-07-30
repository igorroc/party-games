import { mock } from "bun:test"

// Bun does not provide Next's compile-time server-only alias during unit tests.
mock.module("server-only", () => ({}))
