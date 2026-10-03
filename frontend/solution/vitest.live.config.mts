import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Run only the tests that call the real mock API. See npm run test:live.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/api/live.test.ts"],
  },
});
