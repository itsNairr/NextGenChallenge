"use client";

import { useMemo } from "react";
import type { ChangeDirection, Holding } from "@/types";
import { createFormatters, resolveDirection, useFormatters } from "./useFormatters";
import type { Formatters } from "./useFormatters";

// Describe one display-ready entry in the top movers widget.
export interface TopMover {
  readonly ticker: string;
  readonly name: string;
  // Position in its list. 1 is the largest move.
  readonly rank: number;
  readonly changeLabel: string;
  readonly direction: ChangeDirection;
}

// Hold the ranked gainers and losers.
export interface TopMovers {
  readonly gainers: readonly TopMover[];
  readonly losers: readonly TopMover[];
}

// Define the inputs the top movers builder needs.
export interface UseTopMoversOptions {
  // Pass an empty array while the portfolio is not available yet.
  readonly holdings: readonly Holding[];
  // Show at most this many entries in each list.
  readonly limit?: number;
}

// Show the top three gainers and the top three losers by default.
export const DEFAULT_TOP_MOVERS_LIMIT = 3;

// Build the ranked gainers and losers by day change percent.
export function buildTopMovers(
  { holdings, limit = DEFAULT_TOP_MOVERS_LIMIT }: UseTopMoversOptions,
  formatters: Formatters = createFormatters("CAD")
): TopMovers {
  const { formatSignedPercent } = formatters;

  // Percentages are currency independent, so no conversion is applied.
  const toMover = (holding: Holding, index: number): TopMover => ({
    ticker: holding.ticker,
    name: holding.name,
    rank: index + 1,
    changeLabel: formatSignedPercent(holding.dayChangePercent),
    direction: resolveDirection(holding.dayChangePercent),
  });

  // Skip values that are not numbers. Flat holdings are neither gainers nor losers.
  const valid = holdings.filter((holding) => Number.isFinite(holding.dayChangePercent));

  const gainers = valid
    .filter((holding) => resolveDirection(holding.dayChangePercent) === "up")
    .sort((a, b) => b.dayChangePercent - a.dayChangePercent)
    .slice(0, limit)
    .map(toMover);

  const losers = valid
    .filter((holding) => resolveDirection(holding.dayChangePercent) === "down")
    .sort((a, b) => a.dayChangePercent - b.dayChangePercent)
    .slice(0, limit)
    .map(toMover);

  return { gainers, losers };
}

// Build the top movers and memoise them for the current holdings.
export function useTopMovers(options: UseTopMoversOptions): TopMovers {
  const { holdings, limit } = options;
  // Percent formatting does not depend on currency, so CAD formatters are reused.
  const formatters = useFormatters("CAD");

  return useMemo<TopMovers>(
    () => buildTopMovers({ holdings, limit }, formatters),
    [holdings, limit, formatters]
  );
}
