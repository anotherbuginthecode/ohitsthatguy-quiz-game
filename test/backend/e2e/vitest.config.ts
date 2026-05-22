import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30_000, // Lambda cold starts can take several seconds
    hookTimeout: 10_000,
    reporters: ["verbose"],
    setupFiles: ["./src/setup.ts"],
    // Run test files sequentially to avoid hammering cold Lambda instances
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
