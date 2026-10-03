"use client";

import { useState } from "react";
import type { PortfolioScenario } from "@/api";
import {
  CurrencyToggle,
  ErrorState,
  Header,
  MockApiControls,
  Navbar,
  PortfolioSummaryCard,
  SLOW_REQUEST_DELAY_MS,
  SummarySkeleton,
} from "@/components";
import type { RequestMode } from "@/components";
import { useCurrency, useExchangeRate, usePortfolio } from "@/composables";

// Load the first account until the account selector arrives in milestone 8.
const DEFAULT_ACCOUNT_ID = "P-9001";

// Render the portfolio overview page.
export default function Home() {
  // Hold the mock API controls.
  const [scenario, setScenario] = useState<PortfolioScenario>("default");
  const [requestMode, setRequestMode] = useState<RequestMode>("normal");

  // Load the portfolio for the selected dataset.
  const portfolio = usePortfolio({
    accountId: DEFAULT_ACCOUNT_ID,
    scenario,
    delayMs: requestMode === "slow" ? SLOW_REQUEST_DELAY_MS : undefined,
    fail: requestMode === "fail",
  });

  // Load the exchange rate. Fall back to the built in rate until it arrives.
  const exchangeRate = useExchangeRate();

  // Hold the display currency.
  const { currency, setCurrency, convertAmount } = useCurrency(
    "CAD",
    exchangeRate.data?.CADtoUSD
  );

  const summary = portfolio.data?.portfolio ?? null;

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
          eyebrow={summary?.label ?? "Portfolio"}
          title="Overview"
          actions={
            <MockApiControls
              scenario={scenario}
              onScenarioChange={setScenario}
              requestMode={requestMode}
              onRequestModeChange={setRequestMode}
            />
          }
        />

        <main className="flex flex-col gap-6">
          {/* Summary region, with its loading and error states */}
          {portfolio.status === "loading" ? (
            <SummarySkeleton />
          ) : portfolio.error ? (
            <ErrorState error={portfolio.error} onRetry={portfolio.refetch} />
          ) : (
            <PortfolioSummaryCard
              summary={summary}
              currency={currency}
              convertAmount={convertAmount}
            />
          )}

          {/* Provenance line, so it is clear the figures come from the mock API */}
          {portfolio.data ? (
            <p className="eyebrow text-subtle">
              Mock API &middot; as of{" "}
              <time dateTime={portfolio.data.asOf}>
                {new Date(portfolio.data.asOf).toLocaleTimeString()}
              </time>
            </p>
          ) : null}

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
