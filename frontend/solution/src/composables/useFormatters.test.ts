import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { createFormatters, resolveDirection, roundToDisplay } from "@/composables/useFormatters";

describe("roundToDisplay", () => {
  test("rounds to two decimals", () => {
    assert.equal(roundToDisplay(1520.4449), 1520.44);
    assert.equal(roundToDisplay(1520.4451), 1520.45);
  });

  test("never returns negative zero", () => {
    assert.equal(Object.is(roundToDisplay(-0.001), 0), true);
    assert.equal(Object.is(roundToDisplay(-0), 0), true);
  });
});

describe("resolveDirection", () => {
  test("reports a gain for positive values", () => {
    assert.equal(resolveDirection(1520.44), "up");
    assert.equal(resolveDirection(0.32), "up");
  });

  test("reports a loss for negative values", () => {
    assert.equal(resolveDirection(-2184.17), "down");
    assert.equal(resolveDirection(-0.0425), "down");
  });

  test("reports flat for zero", () => {
    assert.equal(resolveDirection(0), "flat");
    assert.equal(resolveDirection(-0), "flat");
  });

  test("reports flat when the value rounds away at display precision", () => {
    assert.equal(resolveDirection(0.0001), "flat");
    assert.equal(resolveDirection(-0.0001), "flat");
  });
});

describe("createFormatters in CAD", () => {
  const f = createFormatters("CAD");

  test("formats money with thousands separators", () => {
    assert.equal(f.formatCurrency(482350.12), "$482,350.12");
  });

  test("keeps very large money legible", () => {
    assert.equal(f.formatCurrency(18472650934.55), "$18,472,650,934.55");
  });

  test("adds a sign to a non zero day change", () => {
    assert.equal(f.formatSignedCurrency(1520.44), "+$1,520.44");
    assert.equal(f.formatSignedCurrency(-2184.17), "-$2,184.17");
  });

  test("omits the sign at zero", () => {
    assert.equal(f.formatSignedCurrency(0), "$0.00");
    assert.equal(f.formatSignedPercent(0), "0.00%");
    assert.equal(f.formatSignedRatio(0), "0.00%");
  });

  test("treats a day change percent as already a percent", () => {
    assert.equal(f.formatSignedPercent(0.32), "+0.32%");
    assert.equal(f.formatSignedPercent(-0.69), "-0.69%");
  });

  test("scales a total return ratio into a percent", () => {
    assert.equal(f.formatSignedRatio(0.187), "+18.70%");
    assert.equal(f.formatSignedRatio(-0.0425), "-4.25%");
    assert.equal(f.formatSignedRatio(1.4062), "+140.62%");
  });
});

describe("createFormatters in USD", () => {
  const f = createFormatters("USD");

  test("formats money with thousands separators", () => {
    assert.equal(f.formatCurrency(352115.59), "$352,115.59");
  });

  test("adds a sign to a non zero day change", () => {
    assert.equal(f.formatSignedCurrency(1109.92), "+$1,109.92");
  });
});
