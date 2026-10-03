"use client";

import { useState } from "react";
import type { PortfolioScenario } from "@/api";
import {
  AllocationCard,
  CurrencyToggle,
  ErrorState,
  Header,
  HoldingsSkeleton,
  HoldingsTable,
  MockApiControls,
  Navbar,
  PortfolioSummaryCard,
  SLOW_REQUEST_DELAY_MS,
  SummarySkeleton,
  TopMoversCard,
  WidgetsSkeleton,
} from "@/components";
import type { RequestMode } from "@/components";
import { useCurrency, useExchangeRate, usePortfolio } from "@/composables";
import type { AllocationSlice, Holding } from "@/types";

// Load the first account until the account selector arrives in milestone 8.
const DEFAULT_ACCOUNT_ID = "P-9001";

// Reuse stable empty lists so memoised widgets do not rebuild on every render.
const NO_ALLOCATION: readonly AllocationSlice[] = [];
const NO_HOLDINGS: readonly Holding[] = [];

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
  const allocation = portfolio.data?.allocation ?? NO_ALLOCATION;
  const holdings = portfolio.data?.holdings ?? NO_HOLDINGS;

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

          {/* Allocation and top movers region. The summary error state covers failures. */}
          {portfolio.status === "loading" ? (
            <WidgetsSkeleton />
          ) : portfolio.error ? null : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <AllocationCard
                slices={allocation}
                currency={currency}
                convertAmount={convertAmount}
              />
              <TopMoversCard holdings={holdings} />
            </div>
          )}

          {/* Holdings region. The summary error state covers failures. */}
          {portfolio.status === "loading" ? (
            <HoldingsSkeleton />
          ) : portfolio.error ? null : (
            <HoldingsTable holdings={holdings} currency={currency} convertAmount={convertAmount} />
          )}

          {/* Placeholder region for the next milestones */}
          <section className="flex min-h-56 flex-col items-center justify-center rounded-card border border-dashed border-line p-10 text-center">
            <p className="eyebrow text-subtle">Next milestones</p>
            <p className="mt-3 max-w-md text-sm text-body">
              Performance chart, selectors, and the holding detail view arrive in later milestones.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
