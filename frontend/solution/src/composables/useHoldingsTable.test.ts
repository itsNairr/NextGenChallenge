import { test, describe } from "vitest";
import assert from "node:assert/strict";
import {
  buildHoldingRows,
  buildHoldingTotals,
  DEFAULT_HOLDING_SORT,
  nextSort,
} from "@/composables/useHoldingsTable";
import type { HoldingSort } from "@/composables/useHoldingsTable";
import { convertFromCad } from "@/composables/useCurrency";
import type { CurrencyCode, Holding } from "@/types";

// Build a holding from the fields the table reads.
function holding(
  ticker: string,
  quantity: number,
  price: number,
  weightPercent: number,
  gainLoss: number
): Holding {
  return {
    ticker,
    name: `${ticker} name`,
    assetClass: "Equity",
    sector: "Technology",
    quantity,
    price,
    costBasisPerShare: price,
    marketValue: quantity * price,
    gainLoss,
    dayChangeAmount: 0,
    dayChangePercent: 0,
    weightPercent,
  };
}

// Use the sample holdings from the task brief.
const SAMPLE: readonly Holding[] = [
  holding("AAPL", 120, 227.5, 5.66, 3200),
  holding("BND", 300, 72.1, 4.48, -410.5),
];

// Build the options for one holdings list in one currency.
function optionsFor(holdings: readonly Holding[], currency: CurrencyCode = "CAD") {
  return { holdings, currency, convertAmount: (amount: number) => convertFromCad(amount, currency) };
}

// Read the ticker order of the rows for one sort.
function tickers(holdings: readonly Holding[], sort: HoldingSort): string[] {
  return buildHoldingRows(optionsFor(holdings), sort).map((row) => row.ticker);
}

describe("buildHoldingRows with the sample holdings", () => {
  const [aapl, bnd] = buildHoldingRows(optionsFor(SAMPLE));

  test("formats every column", () => {
    assert.equal(aapl.quantity, "120");
    assert.equal(aapl.price, "$227.50");
    assert.equal(aapl.marketValue, "$27,300.00");
    assert.equal(aapl.weight, "5.66%");
    assert.equal(aapl.gainLoss, "+$3,200.00");
  });

  test("marks gains and losses", () => {
    assert.equal(aapl.gainDirection, "up");
    assert.equal(bnd.gainDirection, "down");
    assert.equal(bnd.gainLoss, "-$410.50");
  });

  test("converts money but not quantity or weight in USD", () => {
    const [usd] = buildHoldingRows(optionsFor(SAMPLE, "USD"));
    assert.equal(usd.marketValue, "$19,929.00");
    assert.equal(usd.quantity, aapl.quantity);
    assert.equal(usd.weight, aapl.weight);
  });
});

describe("sorting", () => {
  const holdings = [
    holding("MSFT", 60, 314.78, 11.76, 5685.24),
    holding("ZAG", 2000, 10.15, 12.63, -1022),
    holding("CGL", 350, 17.96, 3.91, 1226.4),
  ];

  test("sorts by market value, largest first, by default", () => {
    assert.deepEqual(tickers(holdings, DEFAULT_HOLDING_SORT), ["ZAG", "MSFT", "CGL"]);
  });

  test("sorts by weight and by gain/loss in both directions", () => {
    assert.deepEqual(tickers(holdings, { key: "weightPercent", direction: "desc" }), [
      "ZAG",
      "MSFT",
      "CGL",
    ]);
    assert.deepEqual(tickers(holdings, { key: "gainLoss", direction: "asc" }), [
      "ZAG",
      "CGL",
      "MSFT",
    ]);
  });

  test("sorts tickers alphabetically", () => {
    assert.deepEqual(tickers(holdings, { key: "ticker", direction: "asc" }), ["CGL", "MSFT", "ZAG"]);
  });

  test("flips the order on a repeated click", () => {
    const first = nextSort(DEFAULT_HOLDING_SORT, "gainLoss");
    assert.deepEqual(first, { key: "gainLoss", direction: "desc" });
    assert.deepEqual(nextSort(first, "gainLoss"), { key: "gainLoss", direction: "asc" });
  });

  test("starts text ascending and numbers descending", () => {
    assert.equal(nextSort(DEFAULT_HOLDING_SORT, "ticker").direction, "asc");
    assert.equal(nextSort(DEFAULT_HOLDING_SORT, "price").direction, "desc");
  });
});

describe("buildHoldingTotals", () => {
  test("sums the money columns and the weights", () => {
    const totals = buildHoldingTotals(optionsFor(SAMPLE));
    assert.equal(totals.count, 2);
    assert.equal(totals.marketValue, "$48,930.00");
    assert.equal(totals.weight, "10.14%");
    assert.equal(totals.gainLoss, "+$2,789.50");
  });

  test("converts the total once, so it does not drift from row rounding", () => {
    const rows = [holding("A", 1, 0.005, 50, 0), holding("B", 1, 0.005, 50, 0)];
    assert.equal(buildHoldingTotals(optionsFor(rows)).marketValue, "$0.01");
  });

  test("handles an empty portfolio", () => {
    const totals = buildHoldingTotals(optionsFor([]));
    assert.equal(totals.count, 0);
    assert.equal(buildHoldingRows(optionsFor([])).length, 0);
  });
});

describe("a large portfolio", () => {
  test("builds 60 rows in market value order", () => {
    const many = Array.from({ length: 60 }, (_, index) => holding(`T${index}`, index + 1, 10, 1, 0));
    const rows = buildHoldingRows(optionsFor(many));
    assert.equal(rows.length, 60);
    assert.equal(rows[0].ticker, "T59");
  });
});
