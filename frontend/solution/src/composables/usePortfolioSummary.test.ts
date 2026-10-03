// Summary: Unit tests validating metric calculation, sign formatting, and color tones.
import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { buildSummaryMetrics } from "@/composables/usePortfolioSummary";
import { convertFromCad } from "@/composables/useCurrency";
import type { CurrencyCode, PortfolioSummary } from "@/types";

// Hold one summary per state under test. All money values are CAD.
// The default case uses the sample from REQUIREMENTS.md task 2.
const FIXTURES: Readonly<Record<string, PortfolioSummary>> = {
  default: {
    totalMarketValue: 482350.12,
    dayChangeAmount: 1520.44,
    dayChangePercent: 0.32,
    totalReturnSinceInception: 0.187,
  },
  negative: {
    totalMarketValue: 311204.8,
    dayChangeAmount: -2184.17,
    dayChangePercent: -0.69,
    totalReturnSinceInception: -0.0425,
  },
  zero: {
    totalMarketValue: 482350.12,
    dayChangeAmount: 0,
    dayChangePercent: 0,
    totalReturnSinceInception: 0,
  },
  "large-value": {
    totalMarketValue: 18472650934.55,
    dayChangeAmount: 24158903.12,
    dayChangePercent: 0.13,
    totalReturnSinceInception: 1.4062,
  },
  empty: {
    totalMarketValue: 0,
    dayChangeAmount: 0,
    dayChangePercent: 0,
    totalReturnSinceInception: 0,
  },
};

// Look up a named fixture.
function scenario(id: string): PortfolioSummary {
  const match = FIXTURES[id];
  assert.ok(match, `missing fixture ${id}`);
  return match;
}

// Build the metrics for one summary in one currency.
function metricsFor(summary: PortfolioSummary | null, currency: CurrencyCode = "CAD") {
  const list = buildSummaryMetrics({
    summary,
    currency,
    convertAmount: (amount) => convertFromCad(amount, currency),
  });
  return Object.fromEntries(list.map((metric) => [metric.id, metric]));
}

describe("buildSummaryMetrics with the sample portfolio", () => {
  const m = metricsFor(scenario("default"));

  test("shows four tiles", () => {
    assert.equal(Object.keys(m).length, 4);
  });

  test("formats the total market value as currency", () => {
    assert.equal(m["total-market-value"].value, "$482,350.12");
    assert.equal(m["total-market-value"].caption, "CAD");
  });

  test("shows the day change as money and as a percent", () => {
    assert.equal(m["day-change-amount"].value, "+$1,520.44");
    assert.equal(m["day-change-percent"].value, "+0.32%");
  });

  test("shows the total return since inception as a percent", () => {
    assert.equal(m["total-return"].value, "+18.70%");
  });

  test("marks every change tile as a gain", () => {
    assert.equal(m["day-change-amount"].direction, "up");
    assert.equal(m["day-change-percent"].direction, "up");
    assert.equal(m["total-return"].direction, "up");
  });

  test("leaves the total market value without a direction", () => {
    assert.equal(m["total-market-value"].direction, null);
  });
});

describe("buildSummaryMetrics direction states", () => {
  test("marks a negative portfolio as a loss", () => {
    const m = metricsFor(scenario("negative"));
    assert.equal(m["day-change-amount"].value, "-$2,184.17");
    assert.equal(m["day-change-amount"].direction, "down");
    assert.equal(m["day-change-percent"].direction, "down");
    assert.equal(m["total-return"].direction, "down");
  });

  test("treats a zero day change as neutral, not as a gain or a loss", () => {
    const m = metricsFor(scenario("zero"));
    assert.equal(m["day-change-amount"].direction, "flat");
    assert.equal(m["day-change-percent"].direction, "flat");
    assert.equal(m["day-change-amount"].value, "$0.00");
    assert.equal(m["day-change-percent"].value, "0.00%");
  });

  test("keeps a very large portfolio legible", () => {
    const m = metricsFor(scenario("large-value"));
    assert.equal(m["total-market-value"].value, "$18,472,650,934.55");
    assert.equal(m["total-return"].value, "+140.62%");
  });

  test("renders an empty portfolio without a direction colour", () => {
    const m = metricsFor(scenario("empty"));
    assert.equal(m["total-market-value"].value, "$0.00");
    assert.equal(m["day-change-amount"].direction, "flat");
  });
});

describe("buildSummaryMetrics with a currency change", () => {
  const summary = scenario("default");
  const cad = metricsFor(summary, "CAD");
  const usd = metricsFor(summary, "USD");

  test("converts every money tile", () => {
    assert.equal(usd["total-market-value"].value, "$352,115.59");
    assert.equal(usd["day-change-amount"].value, "+$1,109.92");
  });

  test("leaves percent tiles unchanged", () => {
    assert.equal(usd["day-change-percent"].value, cad["day-change-percent"].value);
    assert.equal(usd["total-return"].value, cad["total-return"].value);
  });

  test("labels the active currency", () => {
    assert.equal(cad["total-market-value"].caption, "CAD");
    assert.equal(usd["total-market-value"].caption, "USD");
  });

  test("keeps the direction identical in both currencies", () => {
    assert.equal(usd["day-change-amount"].direction, cad["day-change-amount"].direction);
  });
});

describe("buildSummaryMetrics without data", () => {
  const m = metricsFor(null);

  test("shows a placeholder in every tile", () => {
    for (const metric of Object.values(m)) {
      assert.equal(metric.value, "--");
      assert.equal(metric.direction, null);
    }
  });
});
