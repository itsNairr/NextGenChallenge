// Summary: Card component hosting the portfolio value line chart and FolioMind selection actions.
"use client";

import { useState } from "react";
import { formatFullDate } from "@/composables";
import type { ChartSelection, ChartSeriesPoint, SelectionSummary } from "@/types";
import { PortfolioValueChart } from "./PortfolioValueChart";
import { Button, Card, ElectricMindSymbol } from "./ui";

// Define properties for the chart card.
interface PortfolioChartCardProps {
  readonly series: readonly ChartSeriesPoint[];
  readonly hasGaps: boolean;
  readonly formatValue: (value: number) => string;
  readonly formatSignedValue: (value: number) => string;
  readonly formatSignedPercent: (percent: number) => string;
  readonly selection: ChartSelection | null;
  readonly pendingIndex: number | null;
  readonly summary: SelectionSummary | null;
  readonly onSelectPoint: (index: number) => void;
  readonly onClearSelection: () => void;
  readonly onAsk: () => void;
  readonly canAsk: boolean;
}

// Render the portfolio value chart with its selection summary.
export function PortfolioChartCard({
  series,
  hasGaps,
  formatValue,
  formatSignedValue,
  formatSignedPercent,
  selection,
  pendingIndex,
  summary,
  onSelectPoint,
  onClearSelection,
  onAsk,
  canAsk,
}: PortfolioChartCardProps) {
  // Build the table rows only while the details is open.
  const [isTableOpen, setIsTableOpen] = useState(false);

  // Colour the change by direction, the same way the summary tiles do.
  const changeTone = summary
    ? summary.changeAmount > 0
      ? "text-gain"
      : summary.changeAmount < 0
        ? "text-loss"
        : "text-heading"
    : "text-heading";

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-heading">Portfolio value</h2>
          <p className="mt-1 text-sm text-body">
            {pendingIndex !== null
              ? "Now click the end of the period."
              : "Click two points to select a period and ask FolioMind."}
          </p>
        </div>
        {series.length > 0 ? (
          <p className="eyebrow text-subtle">{series.length} points</p>
        ) : null}
      </div>

      <div className="mt-4">
        <PortfolioValueChart
          series={series}
          formatValue={formatValue}
          selection={selection}
          pendingIndex={pendingIndex}
          onSelectPoint={onSelectPoint}
        />
      </div>

      {hasGaps ? (
        <p className="mt-2 text-xs text-subtle">
          Shaded bands mark missing dates. The line breaks instead of drawing across them.
        </p>
      ) : null}

      {summary ? (
        <div className="mt-4 flex flex-col gap-4 border-t border-line pt-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-subtle">Selected period</p>
            <p className="mt-2 text-sm text-body">
              {formatFullDate(summary.startDate)} to {formatFullDate(summary.endDate)}
            </p>
            <p className={`mt-2 text-xl font-semibold tabular-nums ${changeTone}`}>
              {formatSignedValue(summary.changeAmount)}{" "}
              <span className="text-base">({formatSignedPercent(summary.changePercent)})</span>
            </p>
            <p className="mt-2 text-xs text-subtle tabular-nums">
              {formatValue(summary.startValue)} to {formatValue(summary.endValue)} &middot; low{" "}
              {formatValue(summary.lowValue)} &middot; high {formatValue(summary.highValue)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button onClick={onAsk} disabled={!canAsk}>
              <ElectricMindSymbol className="h-3.5 w-auto" />
              Ask FolioMind
            </Button>
            <Button variant="ghost" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* The table keeps every value reachable without hovering the chart */}
      {series.length > 0 ? (
        <details
          className="mt-4 border-t border-line pt-4"
          onToggle={(event) => setIsTableOpen(event.currentTarget.open)}
        >
          <summary className="eyebrow cursor-pointer text-subtle">Table view</summary>
          <div className="mt-3 max-h-64 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="text-subtle">
                  <th scope="col" className="py-1 pr-4 font-medium">
                    Date
                  </th>
                  <th scope="col" className="py-1 text-right font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="text-body">
                {(isTableOpen ? series : []).map((point) => (
                  <tr key={point.date} className="border-t border-line">
                    <td className="py-1 pr-4 tabular-nums">{point.date}</td>
                    <td className="py-1 text-right tabular-nums">{formatValue(point.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </Card>
  );
}
