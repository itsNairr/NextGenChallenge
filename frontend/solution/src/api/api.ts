import type { ExchangeRate, PortfolioResponse } from "@/types";
import { ApiError, buildUrl, getJson } from "./http";
import type { RequestOptions } from "./http";

// List the datasets the mock API serves. Source: GET /scenarios.
export const PORTFOLIO_SCENARIOS = [
  "default",
  "empty",
  "large",
  "zero",
  "negative",
  "large-value",
  "single-account",
  "single-class",
  "tiny-allocation",
  "few-holdings",
  "all-gainers",
  "all-losers",
  "one-point",
  "two-points",
  "gaps",
  "short-history",
] as const;

export type PortfolioScenario = (typeof PORTFOLIO_SCENARIOS)[number];

// Describe the test controls the mock API accepts on every route.
export interface MockRequestParams {
  // Pick a dataset. Use the same one across related requests.
  readonly scenario?: PortfolioScenario;
  // Hold the response back, to exercise the loading state. 0 to 10000.
  readonly delayMs?: number;
  // Force an HTTP 503, to exercise the error state.
  readonly fail?: boolean;
}

// Combine the mock controls with the standard request options.
export type ApiOptions = MockRequestParams & Pick<RequestOptions, "signal" | "timeoutMs">;

// Split the caller options into query parameters and transport options.
function toRequestOptions({ scenario, delayMs, fail, signal, timeoutMs }: ApiOptions): RequestOptions {
  return {
    // Omit fail entirely unless it is on, because the mock reads the literal string.
    query: { scenario, delayMs, fail: fail ? true : undefined },
    signal,
    timeoutMs,
  };
}

// Reject a body that does not look like the endpoint's contract.
function assertShape(ok: boolean, path: string, what: string): void {
  if (!ok) {
    throw new ApiError("parse", `The service returned an unexpected ${what}.`, buildUrl(path));
  }
}

// Check that a value is a finite number.
function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

// Fetch one account's portfolio, holdings, allocation, and performance history.
// All money values are CAD.
export async function getPortfolio(
  accountId: string,
  options: ApiOptions = {}
): Promise<PortfolioResponse> {
  const path = `/portfolios/${encodeURIComponent(accountId)}`;
  const body = await getJson<PortfolioResponse>(path, toRequestOptions(options));

  assertShape(
    typeof body === "object" &&
      body !== null &&
      typeof body.portfolio === "object" &&
      body.portfolio !== null &&
      isNumber(body.portfolio.totalMarketValue) &&
      isNumber(body.portfolio.dayChangeAmount) &&
      isNumber(body.portfolio.dayChangePercent) &&
      isNumber(body.portfolio.totalReturnSinceInception),
    path,
    "portfolio"
  );

  return body;
}

// Fetch the CAD to USD rate used by the currency toggle.
export async function getExchangeRate(options: ApiOptions = {}): Promise<ExchangeRate> {
  const path = "/exchange-rate";
  const body = await getJson<ExchangeRate>(path, toRequestOptions(options));

  assertShape(
    typeof body === "object" && body !== null && isNumber(body.CADtoUSD) && body.CADtoUSD > 0,
    path,
    "exchange rate"
  );

  return body;
}
