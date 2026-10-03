"use client";

import { useMemo } from "react";
import type { ChartSeriesPoint } from "@/types";

// Describe the inner plot area, inside the axis labels.
export interface PlotBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// Describe one data point placed in the plot.
export interface PlottedPoint {
  readonly index: number;
  readonly date: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
}

// Describe one axis label.
export interface AxisTick {
  readonly key: string;
  readonly offset: number;
  readonly label: string;
}

// Describe a stretch of missing dates.
export interface GapBand {
  readonly x: number;
  readonly width: number;
}

// Describe everything the chart needs to draw itself.
export interface ChartGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: PlotBox;
  readonly points: readonly PlottedPoint[];
  // Hold one path per unbroken run, so gaps are not drawn across.
  readonly linePaths: readonly string[];
  readonly areaPaths: readonly string[];
  readonly gaps: readonly GapBand[];
  readonly yTicks: readonly AxisTick[];
  readonly xTicks: readonly AxisTick[];
  readonly yMin: number;
  readonly yMax: number;
}

// Set the space reserved for axis labels.
const PADDING = { top: 16, right: 16, bottom: 28, left: 64 } as const;

// Treat a step longer than this multiple of the usual step as a gap.
const GAP_FACTOR = 1.5;

// Switch the x-axis label format at this span, in days.
const MONTH_LABEL_FROM_DAYS = 120;

const MS_PER_DAY = 86400000;

// Parse a YYYY-MM-DD date as UTC, so labels never shift by a day.
function parseDate(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

// Return the middle value of a list.
function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

// Describe a rounded axis scale.
interface NiceScale {
  readonly min: number;
  readonly max: number;
  readonly values: readonly number[];
}

// Round an axis to clean numbers that read well as labels.
export function niceScale(min: number, max: number, tickCount: number): NiceScale {
  let low = min;
  let high = max;

  // Give a flat series a band, so the line does not sit on an edge.
  if (!(high > low)) {
    if (high === 0) {
      low = 0;
      high = 1;
    } else {
      const pad = Math.abs(high) * 0.05;
      low = high - pad;
      high = high + pad;
    }
  }

  const rawStep = (high - low) / Math.max(tickCount, 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalised = rawStep / magnitude;
  const niceNormalised = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  const step = niceNormalised * magnitude;

  const niceMin = Math.floor(low / step) * step;
  const niceMax = Math.ceil(high / step) * step;

  const values: number[] = [];
  for (let value = niceMin; value <= niceMax + step / 2; value += step) {
    // Clear floating point noise from repeated addition.
    values.push(Number(value.toFixed(10)));
  }

  return { min: niceMin, max: niceMax, values };
}

// Format a y-axis label compactly, so wide figures still fit.
export function formatAxisValue(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 1_000_000_000) {
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  }
  if (magnitude >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  }
  if (magnitude >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }
  return value.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

// Format an x-axis label. Long spans show the month, short spans show the day.
export function formatAxisDate(date: string, spanDays: number): string {
  const options: Intl.DateTimeFormatOptions =
    spanDays >= MONTH_LABEL_FROM_DAYS
      ? { month: "short", year: "2-digit", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-CA", options).format(new Date(parseDate(date)));
}

// Format a date for the tooltip and the selection summary.
export function formatFullDate(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(parseDate(date)));
}

// Split the series into runs of consecutive dates.
// A run break marks missing dates, which the chart must not draw across.
export function findRuns(series: readonly ChartSeriesPoint[]): readonly number[][] {
  if (series.length === 0) {
    return [];
  }

  const times = series.map((point) => parseDate(point.date));
  const steps: number[] = [];
  for (let i = 1; i < times.length; i += 1) {
    steps.push(times[i] - times[i - 1]);
  }

  const usualStep = median(steps);
  const runs: number[][] = [[0]];

  for (let i = 1; i < series.length; i += 1) {
    const isGap = usualStep > 0 && times[i] - times[i - 1] > usualStep * GAP_FACTOR;
    if (isGap) {
      runs.push([i]);
    } else {
      runs[runs.length - 1].push(i);
    }
  }

  return runs;
}

// Describe the size of the chart to build.
export interface ChartGeometryOptions {
  readonly width: number;
  readonly height: number;
  readonly yTickCount?: number;
  readonly xTickCount?: number;
}

// Place the series inside the plot and build every path and label.
export function buildChartGeometry(
  series: readonly ChartSeriesPoint[],
  { width, height, yTickCount = 4, xTickCount = 5 }: ChartGeometryOptions
): ChartGeometry {
  const plot: PlotBox = {
    x: PADDING.left,
    y: PADDING.top,
    width: Math.max(width - PADDING.left - PADDING.right, 1),
    height: Math.max(height - PADDING.top - PADDING.bottom, 1),
  };

  const empty: ChartGeometry = {
    width,
    height,
    plot,
    points: [],
    linePaths: [],
    areaPaths: [],
    gaps: [],
    yTicks: [],
    xTicks: [],
    yMin: 0,
    yMax: 0,
  };

  if (series.length === 0) {
    return empty;
  }

  const values = series.map((point) => point.value);
  const scale = niceScale(Math.min(...values), Math.max(...values), yTickCount);

  const times = series.map((point) => parseDate(point.date));
  const firstTime = times[0];
  const lastTime = times[times.length - 1];
  const timeSpan = lastTime - firstTime;
  const spanDays = timeSpan / MS_PER_DAY;

  // Centre a single point, because its time span is zero.
  const toX = (time: number): number =>
    timeSpan === 0 ? plot.x + plot.width / 2 : plot.x + ((time - firstTime) / timeSpan) * plot.width;

  const valueSpan = scale.max - scale.min;
  const toY = (value: number): number =>
    valueSpan === 0
      ? plot.y + plot.height / 2
      : plot.y + plot.height - ((value - scale.min) / valueSpan) * plot.height;

  const points: PlottedPoint[] = series.map((point, index) => ({
    index,
    date: point.date,
    value: point.value,
    x: toX(times[index]),
    y: toY(point.value),
  }));

  const runs = findRuns(series);
  const baseline = plot.y + plot.height;
  const linePaths: string[] = [];
  const areaPaths: string[] = [];

  for (const run of runs) {
    // A single point has no line, only a marker.
    if (run.length < 2) {
      continue;
    }
    const steps = run
      .map((index, position) => {
        const point = points[index];
        return `${position === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      })
      .join(" ");
    linePaths.push(steps);

    const start = points[run[0]];
    const end = points[run[run.length - 1]];
    areaPaths.push(
      `${steps} L${end.x.toFixed(2)} ${baseline.toFixed(2)} L${start.x.toFixed(2)} ${baseline.toFixed(2)} Z`
    );
  }

  // Shade each stretch of missing dates between two runs.
  const gaps: GapBand[] = [];
  for (let i = 1; i < runs.length; i += 1) {
    const before = points[runs[i - 1][runs[i - 1].length - 1]];
    const after = points[runs[i][0]];
    gaps.push({ x: before.x, width: Math.max(after.x - before.x, 1) });
  }

  const yTicks: AxisTick[] = scale.values.map((value) => ({
    key: String(value),
    offset: toY(value),
    label: formatAxisValue(value),
  }));

  // Take evenly spaced real points, so every label matches a date in the data.
  const xTickIndexes: number[] = [];
  const wanted = Math.min(xTickCount, series.length);
  for (let i = 0; i < wanted; i += 1) {
    const index =
      wanted === 1 ? 0 : Math.round((i / (wanted - 1)) * (series.length - 1));
    if (!xTickIndexes.includes(index)) {
      xTickIndexes.push(index);
    }
  }

  const xTicks: AxisTick[] = xTickIndexes.map((index) => ({
    key: series[index].date,
    offset: points[index].x,
    label: formatAxisDate(series[index].date, spanDays),
  }));

  return {
    width,
    height,
    plot,
    points,
    linePaths,
    areaPaths,
    gaps,
    yTicks,
    xTicks,
    yMin: scale.min,
    yMax: scale.max,
  };
}

// Find the point nearest a pointer position on the x-axis.
export function findNearestIndex(
  points: readonly PlottedPoint[],
  x: number
): number | null {
  if (points.length === 0) {
    return null;
  }
  let best = 0;
  let bestDistance = Infinity;
  for (const point of points) {
    const distance = Math.abs(point.x - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point.index;
    }
  }
  return best;
}

// Build the chart geometry and keep it until the series or the size changes.
export function useChartGeometry(
  series: readonly ChartSeriesPoint[],
  options: ChartGeometryOptions
): ChartGeometry {
  const { width, height, yTickCount, xTickCount } = options;
  return useMemo(
    () => buildChartGeometry(series, { width, height, yTickCount, xTickCount }),
    [series, width, height, yTickCount, xTickCount]
  );
}
