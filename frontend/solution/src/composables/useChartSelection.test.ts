import { describe, test } from "vitest";
import assert from "node:assert/strict";
import {
  buildSelectionSummary,
  reduceSelection,
  toAllocationContext,
  toHoldingContext,
} from "@/composables/useChartSelection";
import type { ChartSeriesPoint, Holding } from "@/types";

const SERIES: ChartSeriesPoint[] = [
  { date: "2026-01-01", value: 100 },
  { date: "2026-01-02", value: 120 },
  { date: "2026-01-03", value: 90 },
  { date: "2026-01-04", value: 110 },
];

const EMPTY_STATE = { pendingIndex: null, selection: null } as const;

describe("reduceSelection", () => {
  test("the first click holds a pending point", () => {
    const next = reduceSelection(EMPTY_STATE, 1);
    assert.equal(next.pendingIndex, 1);
    assert.equal(next.selection, null);
  });

  test("the second click completes the period", () => {
    const next = reduceSelection({ pendingIndex: 1, selection: null }, 3);
    assert.equal(next.pendingIndex, null);
    assert.deepEqual(next.selection, { startIndex: 1, endIndex: 3 });
  });

  test("the period is ordered whichever way it is drawn", () => {
    const next = reduceSelection({ pendingIndex: 3, selection: null }, 1);
    assert.deepEqual(next.selection, { startIndex: 1, endIndex: 3 });
  });

  test("clicking the same point twice does not make a period", () => {
    const current = { pendingIndex: 2, selection: null };
    assert.equal(reduceSelection(current, 2), current);
  });

  test("a click after a complete period starts a new one", () => {
    const current = { pendingIndex: null, selection: { startIndex: 0, endIndex: 2 } };
    const next = reduceSelection(current, 3);
    assert.equal(next.pendingIndex, 3);
    assert.equal(next.selection, null);
  });
});

describe("buildSelectionSummary", () => {
  test("describes the period with its change, low and high", () => {
    const summary = buildSelectionSummary(SERIES, { startIndex: 0, endIndex: 3 }, "CAD");
    assert.ok(summary);
    assert.equal(summary.startDate, "2026-01-01");
    assert.equal(summary.endDate, "2026-01-04");
    assert.equal(summary.startValue, 100);
    assert.equal(summary.endValue, 110);
    assert.equal(summary.changeAmount, 10);
    assert.equal(summary.changePercent, 10);
    assert.equal(summary.lowValue, 90);
    assert.equal(summary.lowDate, "2026-01-03");
    assert.equal(summary.highValue, 120);
    assert.equal(summary.highDate, "2026-01-02");
    assert.equal(summary.pointCount, 4);
    assert.equal(summary.currency, "CAD");
  });

  test("reads the same period when the indexes arrive reversed", () => {
    const forward = buildSelectionSummary(SERIES, { startIndex: 0, endIndex: 3 }, "CAD");
    const reversed = buildSelectionSummary(SERIES, { startIndex: 3, endIndex: 0 }, "CAD");
    assert.deepEqual(reversed, forward);
  });

  test("reports a fall as a negative change", () => {
    const summary = buildSelectionSummary(SERIES, { startIndex: 1, endIndex: 2 }, "CAD");
    assert.ok(summary);
    assert.equal(summary.changeAmount, -30);
    assert.equal(summary.changePercent, -25);
  });

  test("avoids dividing by a zero start value", () => {
    const zeros: ChartSeriesPoint[] = [
      { date: "2026-01-01", value: 0 },
      { date: "2026-01-02", value: 0 },
    ];
    const summary = buildSelectionSummary(zeros, { startIndex: 0, endIndex: 1 }, "CAD");
    assert.ok(summary);
    assert.equal(summary.changePercent, 0);
    assert.ok(Number.isFinite(summary.changePercent));
  });

  test("returns null for an empty series or an index out of range", () => {
    assert.equal(buildSelectionSummary([], { startIndex: 0, endIndex: 1 }, "CAD"), null);
    assert.equal(buildSelectionSummary(SERIES, { startIndex: 0, endIndex: 99 }, "CAD"), null);
  });

  test("carries the active currency", () => {
    const summary = buildSelectionSummary(SERIES, { startIndex: 0, endIndex: 1 }, "USD");
    assert.equal(summary?.currency, "USD");
  });
});

describe("toHoldingContext", () => {
  const holdings: Holding[] = [
    {
      ticker: "BND",
      name: "Vanguard Total Bond ETF",
      assetClass: "Fixed Income",
      sector: "Bonds",
      quantity: 300,
      price: 72.1,
      costBasisPerShare: 74,
      marketValue: 21630,
      gainLoss: -570,
      dayChangeAmount: -12,
      dayChangePercent: -0.1,
      weightPercent: 32.9,
    },
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      assetClass: "Equity",
      sector: "Technology",
      quantity: 120,
      price: 227.5,
      costBasisPerShare: 200,
      marketValue: 27300,
      gainLoss: 3300,
      dayChangeAmount: 100,
      dayChangePercent: 2.4,
      weightPercent: 41.6,
    },
    {
      ticker: "CASH",
      name: "Canadian Dollar Cash",
      assetClass: "Cash",
      sector: "Cash",
      quantity: 8000,
      price: 1,
      costBasisPerShare: 0,
      marketValue: 8000,
      gainLoss: 0,
      dayChangeAmount: 0,
      dayChangePercent: 0,
      weightPercent: 12.2,
    },
  ];

  const asIs = (amount: number): number => amount;

  test("sorts by weight, largest position first", () => {
    const context = toHoldingContext(holdings, asIs);
    assert.deepEqual(
      context.map((item) => item.ticker),
      ["AAPL", "BND", "CASH"]
    );
  });

  test("carries the detail the model needs for a deeper answer", () => {
    const [apple] = toHoldingContext(holdings, asIs);
    assert.equal(apple.sector, "Technology");
    assert.equal(apple.assetClass, "Equity");
    assert.equal(apple.quantity, 120);
    assert.equal(apple.marketValue, 27300);
    assert.equal(apple.gainLoss, 3300);
    assert.equal(apple.costBasisPerShare, 200);
    assert.equal(apple.weightPercent, 41.6);
  });

  test("works out the return since purchase", () => {
    const [apple, bond] = toHoldingContext(holdings, asIs);
    assert.equal(apple.returnSincePurchasePercent.toFixed(2), "13.75");
    assert.equal(bond.returnSincePurchasePercent.toFixed(2), "-2.57");
  });

  test("avoids dividing by a zero cost basis", () => {
    const cash = toHoldingContext(holdings, asIs).find((item) => item.ticker === "CASH");
    assert.ok(cash);
    assert.equal(cash.returnSincePurchasePercent, 0);
    assert.ok(Number.isFinite(cash.returnSincePurchasePercent));
  });

  test("converts every money field, so the context uses one currency", () => {
    const [apple] = toHoldingContext(holdings, (amount) => amount * 0.73);
    assert.equal(apple.marketValue.toFixed(2), "19929.00");
    assert.equal(apple.price.toFixed(2), "166.07");
    assert.equal(apple.costBasisPerShare.toFixed(2), "146.00");
    assert.equal(apple.gainLoss.toFixed(2), "2409.00");
  });

  test("leaves percentages untouched by the currency", () => {
    const cad = toHoldingContext(holdings, asIs)[0];
    const usd = toHoldingContext(holdings, (amount) => amount * 0.73)[0];
    assert.equal(usd.weightPercent, cad.weightPercent);
    assert.equal(usd.dayChangePercent, cad.dayChangePercent);
    assert.equal(usd.returnSincePurchasePercent, cad.returnSincePurchasePercent);
  });

  test("handles an empty portfolio", () => {
    assert.deepEqual(toHoldingContext([], asIs), []);
  });
});

describe("toAllocationContext", () => {
  const slices = [
    { assetClass: "Cash", value: 8000 },
    { assetClass: "Equity", value: 32000 },
  ];
  const asIs = (amount: number): number => amount;

  test("works out each share and sorts by it", () => {
    const context = toAllocationContext(slices, asIs);
    assert.deepEqual(
      context.map((item) => item.assetClass),
      ["Equity", "Cash"]
    );
    assert.equal(context[0].sharePercent, 80);
    assert.equal(context[1].sharePercent, 20);
  });

  test("converts the values", () => {
    const context = toAllocationContext(slices, (amount) => amount * 0.73);
    assert.equal(context[0].value.toFixed(2), "23360.00");
  });

  test("avoids dividing by a zero total", () => {
    const context = toAllocationContext([{ assetClass: "Cash", value: 0 }], asIs);
    assert.equal(context[0].sharePercent, 0);
  });

  test("handles no slices", () => {
    assert.deepEqual(toAllocationContext([], asIs), []);
  });
});
