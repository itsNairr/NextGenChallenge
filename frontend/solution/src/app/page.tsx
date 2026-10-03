"use client";

import { useMemo } from "react";
import {
  AllocationCard,
  CurrencyToggle,
  ErrorState,
  Header,
  HoldingsSkeleton,
  HoldingsTable,
  Navbar,
  PortfolioAiPanel,
  PortfolioChartCard,
  PortfolioSummaryCard,
  SummarySkeleton,
  TopMoversCard,
  WidgetsSkeleton,
} from "@/components";
import {
  buildSelectionSummary,
  findRuns,
  formatFullDate,
  toAllocationContext,
  toHoldingContext,
  useChartSelection,
  useCurrency,
  useExchangeRate,
  useFormatters,
  usePortfolio,
  usePortfolioAi,
} from "@/composables";
import type { AllocationSlice, ChartSeriesPoint, Holding } from "@/types";

// Load the first account until the account selector arrives in milestone 8.
const DEFAULT_ACCOUNT_ID = "P-9001";

// Reuse stable empty lists so memoised widgets do not rebuild on every render.
const NO_ALLOCATION: readonly AllocationSlice[] = [];
const NO_HOLDINGS: readonly Holding[] = [];

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
  const allocation = portfolio.data?.allocation ?? NO_ALLOCATION;
  const holdings = portfolio.data?.holdings ?? NO_HOLDINGS;

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

  // Convert the holdings and asset classes once, so the AI context uses one currency.
  const holdingContext = useMemo(
    () => toHoldingContext(holdings, convertAmount),
    [holdings, convertAmount]
  );
  const allocationContext = useMemo(
    () => toAllocationContext(allocation, convertAmount),
    [allocation, convertAmount]
  );

  const ai = usePortfolioAi({
    selection: selectionSummary,
    holdings: holdingContext,
    allocation: allocationContext,
    totalHoldings: holdings.length,
    selectionLabel,
  });

  const isLoading = portfolio.status === "loading";

  return (
    <div className="min-h-screen">
      {/* Persistent top navigation */}
      <Navbar actions={<CurrencyToggle currency={currency} onSelect={setCurrency} />} />

      {/* Main content column */}
      <div className="px-6 pb-16 lg:px-[60px]">
        <Header eyebrow={summary?.label ?? "Portfolio"} title="Overview" />

        <main className="flex flex-col gap-6">
          {/* Summary region, with its loading and error states */}
          {isLoading ? (
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

          {/* Allocation and top movers region. The summary error state covers failures. */}
          {isLoading ? (
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
          {isLoading ? (
            <HoldingsSkeleton />
          ) : portfolio.error ? null : (
            <HoldingsTable holdings={holdings} currency={currency} convertAmount={convertAmount} />
          )}

          {/* Provenance line, so it is clear the figures come from the API */}
          {portfolio.data ? (
            <p className="eyebrow text-subtle">
              As of{" "}
              <time dateTime={portfolio.data.asOf}>
                {new Date(portfolio.data.asOf).toLocaleTimeString()}
              </time>
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
