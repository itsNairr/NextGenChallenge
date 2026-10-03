"use client";

import { useMemo, useState } from "react";
import {
  CurrencyToggle,
  Header,
  Navbar,
  PortfolioSummaryCard,
  ScenarioSwitcher,
} from "@/components";
import { useCurrency } from "@/composables";
import { DEFAULT_SUMMARY_SCENARIO, SUMMARY_SCENARIOS } from "@/mocks";

// Render the portfolio overview page.
export default function Home() {
  // Hold the display currency.
  const { currency, setCurrency, convertAmount } = useCurrency("CAD");

  // Hold the active mock dataset.
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SUMMARY_SCENARIO.id);

  // Resolve the summary for the active dataset.
  const summary = useMemo(
    () =>
      SUMMARY_SCENARIOS.find((scenario) => scenario.id === scenarioId)?.summary ??
      DEFAULT_SUMMARY_SCENARIO.summary,
    [scenarioId]
  );

  return (
    <div className="min-h-screen">
      {/* Persistent top navigation */}
      <Navbar
        activeId="overview"
        actions={<CurrencyToggle currency={currency} onSelect={setCurrency} />}
      />

      {/* Main content column */}
      <div className="px-6 pb-16 lg:px-[60px]">
        <Header
          eyebrow="Portfolio"
          title="Overview"
          actions={
            <ScenarioSwitcher
              scenarios={SUMMARY_SCENARIOS}
              activeId={scenarioId}
              onSelect={setScenarioId}
            />
          }
        />

        <main className="flex flex-col gap-6">
          {/* Summary region */}
          <PortfolioSummaryCard
            summary={summary}
            currency={currency}
            convertAmount={convertAmount}
          />

          {/* Placeholder region for the next milestones */}
          <section className="flex min-h-56 flex-col items-center justify-center rounded-card border border-dashed border-line p-10 text-center">
            <p className="eyebrow text-subtle">Next milestones</p>
            <p className="mt-3 max-w-md text-sm text-body">
              Holdings table, performance chart, allocation chart, and widgets arrive in later
              milestones.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
