"use client";

import { useMemo } from "react";
import {
  CurrencyToggle,
  ErrorState,
  Header,
  Navbar,
  PortfolioAiPanel,
  PortfolioChartCard,
  PortfolioSummaryCard,
  SummarySkeleton,
} from "@/components";
import {
  buildSelectionSummary,
  findRuns,
  formatFullDate,
  toHoldingContext,
  useChartSelection,
  useCurrency,
  useExchangeRate,
  useFormatters,
  usePortfolio,
  usePortfolioAi,
} from "@/composables";
import type { ChartSeriesPoint } from "@/types";

// Load the first account until the account selector arrives in milestone 8.
const DEFAULT_ACCOUNT_ID = "P-9001";

// Render the portfolio overview page.
export default function Home() {
  // Load the portfolio and the exchange rate.
  const portfolio = usePortfolio(DEFAULT_ACCOUNT_ID);
  const exchangeRate = useExchangeRate();

  // Hold the display currency. Fall back to the built in rate until the live one arrives.
  const { currency, setCurrency, convertAmount } = useCurrency(
    "CAD",
    exchangeRate.data?.CADtoUSD
  );

  const { formatCurrency, formatSignedCurrency, formatSignedPercent } = useFormatters(currency);

  const summary = portfolio.data?.portfolio ?? null;
  const holdings = useMemo(() => portfolio.data?.holdings ?? [], [portfolio.data]);

  // Convert the history into the active currency once, for every chart consumer.
  const series = useMemo<readonly ChartSeriesPoint[]>(
    () =>
      (portfolio.data?.performanceHistory ?? []).map((point) => ({
        date: point.date,
        value: convertAmount(point.marketValue),
      })),
    [portfolio.data, convertAmount]
  );

  const hasGaps = useMemo(() => findRuns(series).length > 1, [series]);

  // Track the two clicks that make a period.
  const { selection, pendingIndex, selectPoint, clearSelection } = useChartSelection();

  const selectionSummary = useMemo(
    () => (selection ? buildSelectionSummary(series, selection, currency) : null),
    [series, selection, currency]
  );

  const selectionLabel = selectionSummary
    ? `${formatFullDate(selectionSummary.startDate)} to ${formatFullDate(selectionSummary.endDate)}`
    : "";

  const holdingContext = useMemo(() => toHoldingContext(holdings), [holdings]);

  const ai = usePortfolioAi({
    selection: selectionSummary,
    holdings: holdingContext,
    selectionLabel,
  });

  return (
    <div className="min-h-screen">
      {/* Persistent top navigation */}
      <Navbar
        activeId="overview"
        actions={<CurrencyToggle currency={currency} onSelect={setCurrency} />}
      />

      {/* Main content column */}
      <div className="px-6 pb-16 lg:px-[60px]">
        <Header eyebrow={summary?.label ?? "Portfolio"} title="Overview" />

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

          {/* Value chart and the AI panel that explains a selected period */}
          {portfolio.status === "success" ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <PortfolioChartCard
                series={series}
                hasGaps={hasGaps}
                formatValue={formatCurrency}
                formatSignedValue={formatSignedCurrency}
                formatSignedPercent={formatSignedPercent}
                selection={selection}
                pendingIndex={pendingIndex}
                summary={selectionSummary}
                onSelectPoint={selectPoint}
                onClearSelection={clearSelection}
                onAsk={() => ai.ask("Explain what happened to the portfolio in this period.")}
                canAsk={ai.canAsk}
              />
              <PortfolioAiPanel
                messages={ai.messages}
                status={ai.status}
                error={ai.error}
                model={ai.model}
                canAsk={ai.canAsk}
                hasSelection={selectionSummary !== null}
                onAsk={ai.ask}
                onReset={ai.reset}
              />
            </div>
          ) : null}

          {/* Provenance line, so it is clear the figures come from the API */}
          {portfolio.data ? (
            <p className="eyebrow text-subtle">
              As of{" "}
              <time dateTime={portfolio.data.asOf}>
                {new Date(portfolio.data.asOf).toLocaleTimeString()}
              </time>
            </p>
          ) : null}

          {/* Placeholder region for the next milestones */}
          <section className="flex min-h-40 flex-col items-center justify-center rounded-card border border-dashed border-line p-10 text-center">
            <p className="eyebrow text-subtle">Next milestones</p>
            <p className="mt-3 max-w-md text-sm text-body">
              Holdings table, allocation chart, date range selector, and widgets arrive in later
              milestones.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
