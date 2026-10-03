"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChangeDirection, CurrencyCode, Holding } from "@/types";
import { createFormatters, resolveDirection, useFormatters } from "./useFormatters";
import type { Formatters } from "./useFormatters";

// Name the columns the table can sort by.
export type HoldingSortKey =
  | "ticker"
  | "quantity"
  | "price"
  | "marketValue"
  | "weightPercent"
  | "gainLoss";

// Describe the sort order.
export type SortDirection = "asc" | "desc";

// Hold the active sort column and order.
export interface HoldingSort {
  readonly key: HoldingSortKey;
  readonly direction: SortDirection;
}

// Describe one display-ready row in the holdings table.
export interface HoldingRow {
  readonly ticker: string;
  readonly name: string;
  readonly quantity: string;
  readonly price: string;
  readonly marketValue: string;
  readonly weight: string;
  readonly gainLoss: string;
  readonly gainDirection: ChangeDirection;
  // Keep the source record so a row can open its detail view.
  readonly holding: Holding;
}

// Describe the display-ready totals row.
export interface HoldingTotals {
  readonly count: number;
  readonly marketValue: string;
  readonly weight: string;
  readonly gainLoss: string;
  readonly gainDirection: ChangeDirection;
}

// Define the inputs the table builder needs.
export interface UseHoldingsTableOptions {
  // Pass an empty array while the portfolio is not available yet.
  readonly holdings: readonly Holding[];
  readonly currency: CurrencyCode;
  // Convert a native CAD amount into the active currency.
  readonly convertAmount: (amountInCad: number) => number;
}

// Describe what the table hook returns.
export interface HoldingsTable {
  readonly rows: readonly HoldingRow[];
  readonly totals: HoldingTotals;
  readonly sort: HoldingSort;
  // Sort by a column, or flip the order when it is already active.
  readonly toggleSort: (key: HoldingSortKey) => void;
}

// Sort by the largest position first, as most clients scan by size.
export const DEFAULT_HOLDING_SORT: HoldingSort = { key: "marketValue", direction: "desc" };

// Sort text ascending and numbers descending on the first click.
export function initialDirection(key: HoldingSortKey): SortDirection {
  return key === "ticker" ? "asc" : "desc";
}

// Work out the next sort after a header click.
export function nextSort(current: HoldingSort, key: HoldingSortKey): HoldingSort {
  if (current.key === key) {
    return { key, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { key, direction: initialDirection(key) };
}

// Sort holdings on their native CAD values. Conversion keeps the same order.
export function sortHoldings(
  holdings: readonly Holding[],
  { key, direction }: HoldingSort
): readonly Holding[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...holdings].sort((a, b) => {
    const result =
      key === "ticker" ? a.ticker.localeCompare(b.ticker) : a[key] - b[key];
    // Break ties on the ticker so the order is stable and predictable.
    return result === 0 ? a.ticker.localeCompare(b.ticker) : result * factor;
  });
}

// Build the display-ready rows in the requested order.
export function buildHoldingRows(
  { holdings, currency, convertAmount }: UseHoldingsTableOptions,
  sort: HoldingSort = DEFAULT_HOLDING_SORT,
  formatters: Formatters = createFormatters(currency)
): readonly HoldingRow[] {
  const { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } = formatters;

  return sortHoldings(holdings, sort).map((holding) => ({
    ticker: holding.ticker,
    name: holding.name,
    // Quantity and weight are currency independent, so no conversion is applied.
    quantity: formatQuantity(holding.quantity),
    price: formatCurrency(convertAmount(holding.price)),
    marketValue: formatCurrency(convertAmount(holding.marketValue)),
    weight: formatPercent(holding.weightPercent),
    gainLoss: formatSignedCurrency(convertAmount(holding.gainLoss)),
    // Derive direction from the native CAD figure, as the summary does.
    gainDirection: resolveDirection(holding.gainLoss),
    holding,
  }));
}

// Build the totals row. Sum in CAD, then convert once, so rounding matches the summary.
export function buildHoldingTotals(
  { holdings, currency, convertAmount }: UseHoldingsTableOptions,
  formatters: Formatters = createFormatters(currency)
): HoldingTotals {
  const { formatCurrency, formatSignedCurrency, formatPercent } = formatters;

  const marketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const gainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  // Weights may not sum to exactly 100% because of rounding. This is not corrected.
  const weight = holdings.reduce((sum, holding) => sum + holding.weightPercent, 0);

  return {
    count: holdings.length,
    marketValue: formatCurrency(convertAmount(marketValue)),
    weight: formatPercent(weight),
    gainLoss: formatSignedCurrency(convertAmount(gainLoss)),
    gainDirection: resolveDirection(gainLoss),
  };
}

// Hold the sort state and build the sorted rows and totals for the active currency.
export function useHoldingsTable(options: UseHoldingsTableOptions): HoldingsTable {
  const { holdings, currency, convertAmount } = options;
  const formatters = useFormatters(currency);
  const [sort, setSort] = useState<HoldingSort>(DEFAULT_HOLDING_SORT);

  const toggleSort = useCallback(
    (key: HoldingSortKey) => setSort((current) => nextSort(current, key)),
    []
  );

  const rows = useMemo<readonly HoldingRow[]>(
    () => buildHoldingRows({ holdings, currency, convertAmount }, sort, formatters),
    [holdings, currency, convertAmount, sort, formatters]
  );

  const totals = useMemo<HoldingTotals>(
    () => buildHoldingTotals({ holdings, currency, convertAmount }, formatters),
    [holdings, currency, convertAmount, formatters]
  );

  return { rows, totals, sort, toggleSort };
}
