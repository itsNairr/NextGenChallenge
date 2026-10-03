"use client";

import { useCallback, useId, useState } from "react";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  findNearestIndex,
  formatFullDate,
  useChartGeometry,
  useElementWidth,
} from "@/composables";
import type { ChartSelection, ChartSeriesPoint } from "@/types";

// Draw the chart at this height. The width follows the container.
const CHART_HEIGHT = 300;

// Use this width until the container is measured.
const FALLBACK_WIDTH = 820;

// Define properties for the chart.
interface PortfolioValueChartProps {
  readonly series: readonly ChartSeriesPoint[];
  // Format a value for the tooltip and the axis readout.
  readonly formatValue: (value: number) => string;
  readonly selection: ChartSelection | null;
  readonly pendingIndex: number | null;
  readonly onSelectPoint: (index: number) => void;
}

// Draw the portfolio value over time as a single line.
export function PortfolioValueChart({
  series,
  formatValue,
  selection,
  pendingIndex,
  onSelectPoint,
}: PortfolioValueChartProps) {
  const gradientId = useId();
  const { ref, width } = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH);
  const geometry = useChartGeometry(series, { width, height: CHART_HEIGHT });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { plot, points } = geometry;

  // Snap the pointer to the nearest date, so the reader aims at a point.
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGRectElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left + plot.x;
      setHoverIndex(findNearestIndex(points, x));
    },
    [plot.x, points]
  );

  // Move the readout with the keyboard, so hover is not the only way in.
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<SVGSVGElement>) => {
      if (points.length === 0) {
        return;
      }
      const current = hoverIndex ?? 0;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        setHoverIndex(Math.min(Math.max(current + step, 0), points.length - 1));
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setHoverIndex(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setHoverIndex(points.length - 1);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelectPoint(current);
      }
    },
    [hoverIndex, points.length, onSelectPoint]
  );

  if (series.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-subtle">
        No performance history to display.
      </div>
    );
  }

  const active = hoverIndex === null ? null : points[hoverIndex];
  const selectionFrom = selection ? points[selection.startIndex] : null;
  const selectionTo = selection ? points[selection.endIndex] : null;
  const pending = pendingIndex === null ? null : points[pendingIndex];

  // Keep the tooltip inside the card on both edges.
  const tooltipLeft = active
    ? Math.min(Math.max(active.x, plot.x + 70), plot.x + plot.width - 70)
    : 0;

  return (
    <div ref={ref} className="relative w-full">
      <svg
        role="img"
        tabIndex={0}
        aria-label={`Portfolio value from ${formatFullDate(series[0].date)} to ${formatFullDate(series[series.length - 1].date)}. Use the arrow keys to read each point.`}
        width={width}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="block w-full touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onKeyDown={handleKeyDown}
        onBlur={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shade the stretches with missing dates */}
        {geometry.gaps.map((gap) => (
          <rect
            key={`gap-${gap.x}`}
            x={gap.x}
            y={plot.y}
            width={gap.width}
            height={plot.height}
            fill="var(--color-line)"
            opacity="0.35"
          />
        ))}

        {/* Mark the selected period */}
        {selectionFrom && selectionTo ? (
          <rect
            x={selectionFrom.x}
            y={plot.y}
            width={Math.max(selectionTo.x - selectionFrom.x, 1)}
            height={plot.height}
            fill="var(--color-selection-soft)"
          />
        ) : null}

        {/* Hairline gridlines and value labels */}
        {geometry.yTicks.map((tick) => (
          <g key={tick.key}>
            <line
              x1={plot.x}
              y1={tick.offset}
              x2={plot.x + plot.width}
              y2={tick.offset}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={plot.x - 10}
              y={tick.offset + 4}
              textAnchor="end"
              className="fill-subtle text-[11px] tabular-nums"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Date labels */}
        {geometry.xTicks.map((tick) => (
          <text
            key={tick.key}
            x={tick.offset}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            className="fill-subtle text-[11px] tabular-nums"
          >
            {tick.label}
          </text>
        ))}

        {/* Wash under the line, one run per unbroken stretch */}
        {geometry.areaPaths.map((path) => (
          <path key={`area-${path.slice(0, 24)}`} d={path} fill={`url(#${gradientId})`} />
        ))}

        {/* The line itself, broken across gaps */}
        {geometry.linePaths.map((path) => (
          <path
            key={`line-${path.slice(0, 24)}`}
            d={path}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Show every point when there are too few to make a line read */}
        {points.length <= 2
          ? points.map((point) => (
              <circle
                key={`dot-${point.index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill="var(--color-brand)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            ))
          : null}

        {/* Mark the first click while the second is awaited */}
        {pending ? (
          <circle
            cx={pending.x}
            cy={pending.y}
            r="6"
            fill="var(--color-selection)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        ) : null}

        {/* Mark both ends of the selected period */}
        {selectionFrom && selectionTo
          ? [selectionFrom, selectionTo].map((point) => (
              <circle
                key={`sel-${point.index}`}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--color-selection)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            ))
          : null}

        {/* Crosshair and marker for the hovered date */}
        {active ? (
          <g>
            <line
              x1={active.x}
              y1={plot.y}
              x2={active.x}
              y2={plot.y + plot.height}
              stroke="var(--color-subtle)"
              strokeWidth="1"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r="5"
              fill="var(--color-brand)"
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
          </g>
        ) : null}

        {/* Transparent hit area, wider than the line */}
        <rect
          x={plot.x}
          y={plot.y}
          width={plot.width}
          height={plot.height}
          fill="transparent"
          className="cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          onClick={() => {
            if (hoverIndex !== null) {
              onSelectPoint(hoverIndex);
            }
          }}
        />
      </svg>

      {/* Readout for the hovered or focused date */}
      {active ? (
        <div
          role="status"
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-control border border-line bg-surface px-3 py-2 shadow-card"
          style={{ left: tooltipLeft }}
        >
          <p className="text-sm font-semibold tabular-nums text-heading">
            {formatValue(active.value)}
          </p>
          <p className="mt-0.5 text-[11px] whitespace-nowrap text-subtle">
            {formatFullDate(active.date)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
