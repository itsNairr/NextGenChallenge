// Summary: Unit tests verifying inline theme script execution in simulated browser contexts.
import { test, describe } from "vitest";
import assert from "node:assert/strict";
import vm from "node:vm";
import { THEME_ATTRIBUTE, THEME_SCRIPT, THEME_STORAGE_KEY } from "@/composables/themeScript";

// Describe how the fake browser behaves for one run.
interface RunOptions {
  readonly stored?: string | null;
  readonly prefersDark?: boolean;
  readonly storageThrows?: boolean;
}

// Execute the shipped inline script against a fake document and storage.
// This checks the exact string the page ships, not a copy of its logic.
function runScript({ stored = null, prefersDark = false, storageThrows = false }: RunOptions) {
  const attributes = new Map<string, string>();
  const sandbox = {
    localStorage: {
      getItem(key: string) {
        if (storageThrows) {
          throw new Error("storage is blocked");
        }
        return key === THEME_STORAGE_KEY ? stored : null;
      },
    },
    window: {
      matchMedia: (query: string) => ({ matches: query.includes("dark") && prefersDark }),
    },
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => attributes.set(name, value),
      },
    },
  };
  vm.runInNewContext(THEME_SCRIPT, sandbox);
  return attributes.get(THEME_ATTRIBUTE) ?? null;
}

describe("inline theme script", () => {
  test("applies a stored dark choice", () => {
    assert.equal(runScript({ stored: "dark", prefersDark: false }), "dark");
  });

  test("applies a stored light choice over a dark system setting", () => {
    assert.equal(runScript({ stored: "light", prefersDark: true }), "light");
  });

  test("falls back to the system setting when nothing is stored", () => {
    assert.equal(runScript({ stored: null, prefersDark: true }), "dark");
    assert.equal(runScript({ stored: null, prefersDark: false }), "light");
  });

  test("falls back when the stored value is damaged", () => {
    assert.equal(runScript({ stored: "purple", prefersDark: true }), "dark");
    assert.equal(runScript({ stored: "", prefersDark: false }), "light");
  });

  test("still uses the system setting when storage throws", () => {
    assert.equal(runScript({ storageThrows: true, prefersDark: true }), "dark");
    assert.equal(runScript({ storageThrows: true, prefersDark: false }), "light");
  });

  test("agrees with the composable on the storage key and attribute", () => {
    assert.ok(THEME_SCRIPT.includes(`"${THEME_STORAGE_KEY}"`));
    assert.ok(THEME_SCRIPT.includes(`"${THEME_ATTRIBUTE}"`));
  });
});
