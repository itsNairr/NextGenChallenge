import { describe, test } from "vitest";
import assert from "node:assert/strict";
import {
  buildSelectionSummary,
  reduceSelection,
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
  test("sends identity and weight, but no money amounts", () => {
    const holdings: Holding[] = [
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
    ];
    const context = toHoldingContext(holdings);
    assert.deepEqual(context, [
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        assetClass: "Equity",
        weightPercent: 41.6,
        dayChangePercent: 2.4,
      },
    ]);
    const keys = Object.keys(context[0]);
    for (const money of ["marketValue", "gainLoss", "price", "costBasisPerShare", "quantity"]) {
      assert.ok(!keys.includes(money), `${money} is not sent`);
    }
  });
});
