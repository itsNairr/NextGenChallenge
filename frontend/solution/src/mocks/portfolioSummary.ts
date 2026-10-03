import type { PortfolioSummary } from "@/types";

// Describe one named summary dataset.
export interface SummaryScenario {
  readonly id: string;
  readonly label: string;
  readonly summary: PortfolioSummary;
}

// Provide mock summaries. Scenario names match the mock API scenarios.
// All money values are native CAD.
export const SUMMARY_SCENARIOS: readonly SummaryScenario[] = [
  {
    id: "default",
    label: "Positive",
    summary: {
      totalMarketValue: 482350.12,
      dayChangeAmount: 1520.44,
      dayChangePercent: 0.32,
      totalReturnSinceInception: 0.187,
    },
  },
  {
    id: "negative",
    label: "Negative",
    summary: {
      totalMarketValue: 311204.8,
      dayChangeAmount: -2184.17,
      dayChangePercent: -0.69,
      totalReturnSinceInception: -0.0425,
    },
  },
  {
    id: "zero",
    label: "Zero",
    summary: {
      totalMarketValue: 482350.12,
      dayChangeAmount: 0,
      dayChangePercent: 0,
      totalReturnSinceInception: 0,
    },
  },
  {
    id: "large-value",
    label: "Large value",
    summary: {
      totalMarketValue: 18472650934.55,
      dayChangeAmount: 24158903.12,
      dayChangePercent: 0.13,
      totalReturnSinceInception: 1.4062,
    },
  },
  {
    id: "empty",
    label: "Empty",
    summary: {
      totalMarketValue: 0,
      dayChangeAmount: 0,
      dayChangePercent: 0,
      totalReturnSinceInception: 0,
    },
  },
];

// Use the first scenario as the default dataset.
export const DEFAULT_SUMMARY_SCENARIO: SummaryScenario = SUMMARY_SCENARIOS[0];
