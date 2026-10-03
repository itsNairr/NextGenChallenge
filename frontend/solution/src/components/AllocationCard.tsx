"use client";

import { useAllocation } from "@/composables";
import type { AllocationSegment } from "@/composables";
import type { AllocationSlice, CurrencyCode } from "@/types";
import { Card } from "./ui";

// Map each palette index to its stroke colour. Keep ALLOCATION_COLOR_COUNT entries.
const SEGMENT_STROKES: readonly string[] = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
  "text-chart-5",
  "text-chart-6",
];

// Map each palette index to its legend swatch colour.
const SEGMENT_SWATCHES: readonly string[] = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
];

// Leave a small gap between segments, as a fraction of the circle.
const SEGMENT_GAP = 0.004;

// Size the donut ring inside a 120 by 120 view box.
const RING_RADIUS = 48;
const RING_WIDTH = 16;

// Render the donut ring, one arc per segment.
function AllocationDonut({ segments }: { readonly segments: readonly AllocationSegment[] }) {
  // Only draw gaps when there is more than one segment.
  const gap = segments.length > 1 ? SEGMENT_GAP : 0;

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-44 w-44 shrink-0 -rotate-90"
      role="img"
      aria-label={segments.map((segment) => `${segment.name} ${segment.percentLabel}`).join(", ")}
    >
      {/* Track behind the segments */}
      <circle
        cx="60"
        cy="60"
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_WIDTH}
        className="stroke-line"
      />
      {segments.map((segment) => (
        <circle
          key={segment.id}
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_WIDTH}
          pathLength={1}
          strokeDasharray={`${segment.arcLength - gap} ${1 - segment.arcLength + gap}`}
          strokeDashoffset={-segment.arcStart}
          className={SEGMENT_STROKES[segment.colorIndex]}
        >
          <title>{`${segment.name}: ${segment.percentLabel} (${segment.value})`}</title>
        </circle>
      ))}
    </svg>
  );
}

// Render one legend row with the asset class, its share, and its value.
function AllocationLegendItem({ segment }: { readonly segment: AllocationSegment }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${SEGMENT_SWATCHES[segment.colorIndex]}`}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-body">{segment.name}</span>
      <span className="text-sm font-semibold tabular-nums text-heading">{segment.percentLabel}</span>
      <span className="hidden w-32 text-right text-sm tabular-nums text-subtle sm:block">
        {segment.value}
      </span>
    </li>
  );
}

// Define properties for the allocation card.
interface AllocationCardProps {
  readonly slices: readonly AllocationSlice[];
  readonly currency: CurrencyCode;
  readonly convertAmount: (amountInCad: number) => number;
}

// Render the asset allocation as a donut chart with a labelled legend.
export function AllocationCard({ slices, currency, convertAmount }: AllocationCardProps) {
  const segments = useAllocation({ slices, currency, convertAmount });

  return (
    <section aria-label="Asset allocation" className="min-w-0">
      <Card className="h-full">
        <p className="eyebrow text-subtle">Asset allocation</p>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-heading">By asset class</h2>

        {segments.length === 0 ? (
          <p className="mt-6 rounded-chip border border-dashed border-line p-6 text-center text-sm text-body">
            No allocation to display.
          </p>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:items-center">
            <div className="relative">
              <AllocationDonut segments={segments} />
              {/* Centre label inside the ring */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-heading">
                  {segments.length}
                </span>
                <span className="eyebrow mt-1.5 text-subtle">
                  {segments.length === 1 ? "Class" : "Classes"}
                </span>
              </div>
            </div>
            <ul className="w-full min-w-0 flex-1 divide-y divide-line">
              {segments.map((segment) => (
                <AllocationLegendItem key={segment.id} segment={segment} />
              ))}
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}
