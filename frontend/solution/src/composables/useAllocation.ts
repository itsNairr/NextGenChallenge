"use client";

import { useMemo } from "react";
import type { AllocationSlice, CurrencyCode } from "@/types";
import { createFormatters, useFormatters } from "./useFormatters";
import type { Formatters } from "./useFormatters";

// Describe one display-ready segment of the allocation chart.
export interface AllocationSegment {
  readonly id: string;
  readonly name: string;
  // Converted money value, formatted for the active currency.
  readonly value: string;
  // Exact share of the total. 12.5 means 12.5%.
  readonly percent: number;
  readonly percentLabel: string;
  // Index into the chart colour palette.
  readonly colorIndex: number;
  // Start of the drawn arc, as a fraction of the full circle.
  readonly arcStart: number;
  // Length of the drawn arc, as a fraction of the full circle.
  readonly arcLength: number;
}

// Define the inputs the allocation builder needs.
export interface UseAllocationOptions {
  // Pass an empty array while the portfolio is not available yet.
  readonly slices: readonly AllocationSlice[];
  readonly currency: CurrencyCode;
  // Convert a native CAD amount into the active currency.
  readonly convertAmount: (amountInCad: number) => number;
}

// Match the number of colours defined in the chart palette.
export const ALLOCATION_COLOR_COUNT = 6;

// Draw every slice at least this large, so a tiny allocation stays visible.
export const MIN_ARC_FRACTION = 0.015;

// Build the display-ready allocation segments, largest first.
export function buildAllocation(
  { slices, currency, convertAmount }: UseAllocationOptions,
  formatters: Formatters = createFormatters(currency)
): readonly AllocationSegment[] {
  const { formatCurrency, formatPercent } = formatters;

  // Ignore slices that hold no value, because they cannot be drawn.
  const positive = slices.filter((slice) => Number.isFinite(slice.value) && slice.value > 0);
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) {
    return [];
  }

  const sorted = [...positive].sort((a, b) => b.value - a.value);

  // Raise tiny slices to the minimum arc, then rescale so the arcs fill the circle.
  const raised = sorted.map((slice) => Math.max(slice.value / total, MIN_ARC_FRACTION));
  const raisedTotal = raised.reduce((sum, fraction) => sum + fraction, 0);

  let arcStart = 0;
  return sorted.map((slice, index) => {
    const arcLength = raised[index] / raisedTotal;
    const percent = (slice.value / total) * 100;
    const segment: AllocationSegment = {
      id: slice.assetClass,
      name: slice.assetClass,
      value: formatCurrency(convertAmount(slice.value)),
      percent,
      percentLabel: formatPercent(percent),
      colorIndex: index % ALLOCATION_COLOR_COUNT,
      arcStart,
      arcLength,
    };
    arcStart += arcLength;
    return segment;
  });
}

// Build the allocation segments and memoise them for the active currency.
export function useAllocation(options: UseAllocationOptions): readonly AllocationSegment[] {
  const { slices, currency, convertAmount } = options;
  const formatters = useFormatters(currency);

  return useMemo<readonly AllocationSegment[]>(
    () => buildAllocation({ slices, currency, convertAmount }, formatters),
    [slices, currency, convertAmount, formatters]
  );
}
