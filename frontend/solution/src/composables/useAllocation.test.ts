import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { buildAllocation, MIN_ARC_FRACTION } from "@/composables/useAllocation";
import { convertFromCad } from "@/composables/useCurrency";
import type { AllocationSlice, CurrencyCode } from "@/types";

// Use the sample breakdown from the task brief.
const SAMPLE: readonly AllocationSlice[] = [
  { assetClass: "Equity", value: 289410.0 },
  { assetClass: "Fixed Income", value: 120500.0 },
  { assetClass: "Cash", value: 42340.12 },
  { assetClass: "Alternatives", value: 30100.0 },
];

// Build the segments for one breakdown in one currency.
function segmentsFor(slices: readonly AllocationSlice[], currency: CurrencyCode = "CAD") {
  return buildAllocation({
    slices,
    currency,
    convertAmount: (amount) => convertFromCad(amount, currency),
  });
}

describe("buildAllocation with the sample breakdown", () => {
  const segments = segmentsFor(SAMPLE);

  test("shows one segment per asset class, largest first", () => {
    assert.deepEqual(
      segments.map((segment) => segment.name),
      ["Equity", "Fixed Income", "Cash", "Alternatives"]
    );
  });

  test("labels each segment with its share of the total", () => {
    assert.equal(segments[0].percentLabel, "60.00%");
    assert.equal(segments[3].percentLabel, "6.24%");
  });

  test("gives each segment a distinct colour", () => {
    const colors = new Set(segments.map((segment) => segment.colorIndex));
    assert.equal(colors.size, segments.length);
  });

  test("fills the full circle", () => {
    const total = segments.reduce((sum, segment) => sum + segment.arcLength, 0);
    assert.ok(Math.abs(total - 1) < 1e-9);
  });

  test("converts the values but not the percentages in USD", () => {
    const usd = segmentsFor(SAMPLE, "USD");
    assert.equal(usd[0].value, "$211,269.30");
    assert.equal(usd[0].percentLabel, segments[0].percentLabel);
  });
});

describe("buildAllocation edge cases", () => {
  test("draws a single asset class as the full circle", () => {
    const [only, ...rest] = segmentsFor([{ assetClass: "Equity", value: 1000 }]);
    assert.equal(rest.length, 0);
    assert.equal(only.percentLabel, "100.00%");
    assert.equal(only.arcLength, 1);
  });

  test("keeps a very small slice visible and labelled", () => {
    const segments = segmentsFor([
      { assetClass: "Equity", value: 99950 },
      { assetClass: "Cash", value: 50 },
    ]);
    const cash = segments.find((segment) => segment.name === "Cash");
    assert.ok(cash);
    assert.equal(cash.percentLabel, "0.05%");
    assert.ok(cash.arcLength >= MIN_ARC_FRACTION * 0.95);
  });

  test("returns no segments for an empty or zero breakdown", () => {
    assert.equal(segmentsFor([]).length, 0);
    assert.equal(segmentsFor([{ assetClass: "Cash", value: 0 }]).length, 0);
  });
});
