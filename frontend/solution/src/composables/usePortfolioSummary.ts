// Summary: Composable hook transforming portfolio figures into formatted, color-coded summary tiles.
"use client";

import { useMemo } from "react";
import type {
  ChangeDirection,
  CurrencyCode,
  MetricIconName,
  PortfolioSummary,
} from "@/types";
import { createFormatters, resolveDirection, useFormatters } from "./useFormatters";
import type { Formatters } from "./useFormatters";

// Describe one display-ready tile in the summary row.
export interface SummaryMetric {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly caption: string;
  readonly icon: MetricIconName;
  // Hold null when the metric is not a change value.
  readonly direction: ChangeDirection | null;
}

// Define the inputs the summary builder needs.
export interface UsePortfolioSummaryOptions {
  // Pass null while the portfolio is not available yet.
  readonly summary: PortfolioSummary | null;
  readonly currency: CurrencyCode;
  // Convert a native CAD amount into the active currency.
  readonly convertAmount: (amountInCad: number) => number;
}

// Show this when a figure is not available.
const MISSING_VALUE = "--";

// Build the display-ready summary metrics.
export function buildSummaryMetrics(
  { summary, currency, convertAmount }: UsePortfolioSummaryOptions,
  formatters: Formatters = createFormatters(currency)
): readonly SummaryMetric[] {
  const { formatCurrency, formatSignedCurrency, formatSignedPercent, formatSignedRatio } =
    formatters;

  // Derive direction from the native CAD figures.
  // This keeps colours identical in both currencies.
  const dayDirection = summary ? resolveDirection(summary.dayChangeAmount) : null;
  const dayPercentDirection = summary ? resolveDirection(summary.dayChangePercent) : null;
  const returnDirection = summary ? resolveDirection(summary.totalReturnSinceInception) : null;

  return [
    {
      id: "total-market-value",
      name: "Total Market Value",
      value: summary ? formatCurrency(convertAmount(summary.totalMarketValue)) : MISSING_VALUE,
      caption: currency,
      icon: "wallet",
      direction: null,
    },
    {
      id: "day-change-amount",
      name: "Day Change",
      value: summary ? formatSignedCurrency(convertAmount(summary.dayChangeAmount)) : MISSING_VALUE,
      caption: "today",
      icon: "dollar",
      direction: dayDirection,
    },
    {
      id: "day-change-percent",
      name: "Day Change %",
      // Percentages are currency independent, so no conversion is applied.
      value: summary ? formatSignedPercent(summary.dayChangePercent) : MISSING_VALUE,
      caption: "today",
      icon: "percent",
      direction: dayPercentDirection,
    },
    {
      id: "total-return",
      name: "Total Return",
      // The source value is a ratio, so it is scaled to a percent.
      value: summary ? formatSignedRatio(summary.totalReturnSinceInception) : MISSING_VALUE,
      caption: "since inception",
      icon: "trend",
      direction: returnDirection,
    },
  ];
}

// Build the summary metrics and memoise them for the active currency.
export function usePortfolioSummary(
  options: UsePortfolioSummaryOptions
): readonly SummaryMetric[] {
  const { summary, currency, convertAmount } = options;
  const formatters = useFormatters(currency);

  return useMemo<readonly SummaryMetric[]>(
    () => buildSummaryMetrics({ summary, currency, convertAmount }, formatters),
    [summary, currency, convertAmount, formatters]
  );
}
