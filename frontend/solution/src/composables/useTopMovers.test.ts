import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { buildTopMovers } from "@/composables/useTopMovers";
import type { Holding } from "@/types";

// Build a holding with only the fields the widget reads.
function holding(ticker: string, dayChangePercent: number): Holding {
  return {
    ticker,
    name: `${ticker} Inc.`,
    assetClass: "Equity",
    sector: "Technology",
    quantity: 1,
    price: 1,
    costBasisPerShare: 1,
    marketValue: 1,
    gainLoss: 0,
    dayChangeAmount: 0,
    dayChangePercent,
    weightPercent: 1,
  };
}

// Use the sample movers from the task brief, plus extra rows to rank.
const SAMPLE: readonly Holding[] = [
  holding("AAPL", 2.4),
  holding("BND", -0.6),
  holding("TSLA", -4.1),
  holding("MSFT", 1.1),
  holding("NVDA", 3.8),
  holding("SHOP", 0.4),
  holding("XIU", 0),
  holding("ENB", -1.7),
];

describe("buildTopMovers with the sample holdings", () => {
  const { gainers, losers } = buildTopMovers({ holdings: SAMPLE });

  test("ranks the top three gainers, largest first", () => {
    assert.deepEqual(
      gainers.map((mover) => mover.ticker),
      ["NVDA", "AAPL", "MSFT"]
    );
    assert.deepEqual(
      gainers.map((mover) => mover.rank),
      [1, 2, 3]
    );
  });

  test("ranks the top three losers, largest drop first", () => {
    assert.deepEqual(
      losers.map((mover) => mover.ticker),
      ["TSLA", "ENB", "BND"]
    );
  });

  test("formats the day change with a sign and a direction", () => {
    assert.equal(gainers[0].changeLabel, "+3.80%");
    assert.equal(gainers[0].direction, "up");
    assert.equal(losers[0].changeLabel, "-4.10%");
    assert.equal(losers[0].direction, "down");
  });

  test("leaves flat holdings out of both lists", () => {
    const tickers = [...gainers, ...losers].map((mover) => mover.ticker);
    assert.ok(!tickers.includes("XIU"));
  });
});

describe("buildTopMovers edge cases", () => {
  test("shows only the available holdings when there are fewer than N", () => {
    const { gainers, losers } = buildTopMovers({
      holdings: [holding("AAPL", 2.4), holding("BND", -0.6)],
    });
    assert.equal(gainers.length, 1);
    assert.equal(losers.length, 1);
  });

  test("returns no losers when every holding gained", () => {
    const { gainers, losers } = buildTopMovers({
      holdings: [holding("AAPL", 2.4), holding("MSFT", 1.1)],
    });
    assert.equal(gainers.length, 2);
    assert.equal(losers.length, 0);
  });

  test("returns empty lists for no holdings", () => {
    const { gainers, losers } = buildTopMovers({ holdings: [] });
    assert.equal(gainers.length, 0);
    assert.equal(losers.length, 0);
  });

  test("respects a custom limit", () => {
    const { gainers } = buildTopMovers({ holdings: SAMPLE, limit: 1 });
    assert.deepEqual(
      gainers.map((mover) => mover.ticker),
      ["NVDA"]
    );
  });
});
