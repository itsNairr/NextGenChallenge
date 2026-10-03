// Summary: Unit tests validating theme identification, toggling, and fallback resolution.
import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { isThemeName, oppositeTheme, resolveInitialTheme } from "@/composables/useTheme";

describe("isThemeName", () => {
  test("accepts the two real themes", () => {
    assert.equal(isThemeName("light"), true);
    assert.equal(isThemeName("dark"), true);
  });

  test("rejects anything else", () => {
    for (const value of [null, undefined, "", "Dark", "system", 1, {}]) {
      assert.equal(isThemeName(value), false);
    }
  });
});

describe("resolveInitialTheme", () => {
  test("uses a stored choice over the system setting", () => {
    assert.equal(resolveInitialTheme("light", true), "light");
    assert.equal(resolveInitialTheme("dark", false), "dark");
  });

  test("falls back to the system setting when nothing is stored", () => {
    assert.equal(resolveInitialTheme(null, true), "dark");
    assert.equal(resolveInitialTheme(null, false), "light");
  });

  test("falls back when the stored value is damaged", () => {
    assert.equal(resolveInitialTheme("purple", true), "dark");
    assert.equal(resolveInitialTheme("", false), "light");
  });
});

describe("oppositeTheme", () => {
  test("swaps the theme", () => {
    assert.equal(oppositeTheme("light"), "dark");
    assert.equal(oppositeTheme("dark"), "light");
  });

  test("returns to the start after two swaps", () => {
    assert.equal(oppositeTheme(oppositeTheme("light")), "light");
  });
});
