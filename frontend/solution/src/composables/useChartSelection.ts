"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ChartSelection,
  ChartSeriesPoint,
  CurrencyCode,
  Holding,
  HoldingContext,
  SelectionSummary,
} from "@/types";

// Reduce the holdings to the facts Portfolio AI needs. No money amounts are sent.
export function toHoldingContext(holdings: readonly Holding[]): readonly HoldingContext[] {
  return holdings.map((holding) => ({
    ticker: holding.ticker,
    name: holding.name,
    assetClass: holding.assetClass,
    weightPercent: holding.weightPercent,
    dayChangePercent: holding.dayChangePercent,
  }));
}

// Describe the selected period with the figures the panel and the model both use.
export function buildSelectionSummary(
  series: readonly ChartSeriesPoint[],
  selection: ChartSelection,
  currency: CurrencyCode
): SelectionSummary | null {
  const from = Math.min(selection.startIndex, selection.endIndex);
  const to = Math.max(selection.startIndex, selection.endIndex);

  if (series.length === 0 || from < 0 || to >= series.length) {
    return null;
  }

  const slice = series.slice(from, to + 1);
  const start = slice[0];
  const end = slice[slice.length - 1];

  let low = slice[0];
  let high = slice[0];
  for (const point of slice) {
    if (point.value < low.value) {
      low = point;
    }
    if (point.value > high.value) {
      high = point;
    }
  }

  const changeAmount = end.value - start.value;
  // Guard against a zero start value, which the empty dataset produces.
  const changePercent = start.value === 0 ? 0 : (changeAmount / start.value) * 100;

  return {
    startDate: start.date,
    endDate: end.date,
    startValue: start.value,
    endValue: end.value,
    changeAmount,
    changePercent,
    lowValue: low.value,
    lowDate: low.date,
    highValue: high.value,
    highDate: high.date,
    pointCount: slice.length,
    currency,
  };
}

// Describe the composable result.
export interface UseChartSelectionResult {
  // Hold null when no period is selected.
  readonly selection: ChartSelection | null;
  // Hold the first click while the second is awaited.
  readonly pendingIndex: number | null;
  readonly selectPoint: (index: number) => void;
  readonly clearSelection: () => void;
}

// Hold both clicks in one object, so each click has a single transition.
interface SelectionState {
  readonly pendingIndex: number | null;
  readonly selection: ChartSelection | null;
}

const EMPTY_STATE: SelectionState = { pendingIndex: null, selection: null };

// Decide the next state for one click on a point.
export function reduceSelection(current: SelectionState, index: number): SelectionState {
  // A click after a complete selection starts a new one.
  if (current.selection) {
    return { pendingIndex: index, selection: null };
  }
  if (current.pendingIndex === null) {
    return { pendingIndex: index, selection: null };
  }
  // The same point twice does not make a period.
  if (current.pendingIndex === index) {
    return current;
  }
  return {
    pendingIndex: null,
    selection: {
      startIndex: Math.min(current.pendingIndex, index),
      endIndex: Math.max(current.pendingIndex, index),
    },
  };
}

// Track the two clicks that make a period selection.
export function useChartSelection(): UseChartSelectionResult {
  const [state, setState] = useState<SelectionState>(EMPTY_STATE);

  const selectPoint = useCallback((index: number) => {
    setState((current) => reduceSelection(current, index));
  }, []);

  const clearSelection = useCallback(() => setState(EMPTY_STATE), []);

  return useMemo(
    () => ({
      selection: state.selection,
      pendingIndex: state.pendingIndex,
      selectPoint,
      clearSelection,
    }),
    [state, selectPoint, clearSelection]
  );
}
