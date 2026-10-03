"use client";

import type { PortfolioScenario } from "@/api";
import { SegmentedControl } from "./ui";
import type { SegmentOption } from "./ui";

// Offer the datasets that change what the summary shows.
const SCENARIO_OPTIONS: readonly SegmentOption<PortfolioScenario>[] = [
  { id: "default", label: "Positive" },
  { id: "negative", label: "Negative" },
  { id: "zero", label: "Zero" },
  { id: "large-value", label: "Large" },
  { id: "empty", label: "Empty" },
];

// Name the ways the mock API can answer.
export type RequestMode = "normal" | "slow" | "fail";

// Offer the request behaviours that exercise the loading and error states.
const REQUEST_OPTIONS: readonly SegmentOption<RequestMode>[] = [
  { id: "normal", label: "Normal" },
  { id: "slow", label: "Slow" },
  { id: "fail", label: "Fail" },
];

// Hold the mock API delay used by the slow mode, in milliseconds.
export const SLOW_REQUEST_DELAY_MS = 2000;

// Define properties for the controls.
interface MockApiControlsProps {
  readonly scenario: PortfolioScenario;
  readonly onScenarioChange: (scenario: PortfolioScenario) => void;
  readonly requestMode: RequestMode;
  readonly onRequestModeChange: (mode: RequestMode) => void;
}

// Render controls that drive the mock API query parameters.
// They prove the summary reacts to new data, and they exercise the loading and error states.
export function MockApiControls({
  scenario,
  onScenarioChange,
  requestMode,
  onRequestModeChange,
}: MockApiControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow text-subtle">Dataset</span>
        <SegmentedControl
          label="Mock dataset"
          options={SCENARIO_OPTIONS}
          value={scenario}
          onSelect={onScenarioChange}
          tone="neutral"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow text-subtle">Request</span>
        <SegmentedControl
          label="Mock request behaviour"
          options={REQUEST_OPTIONS}
          value={requestMode}
          onSelect={onRequestModeChange}
          tone="neutral"
        />
      </div>
    </div>
  );
}
