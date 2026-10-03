"use client";

import { useCallback } from "react";
import { getExchangeRate, getPortfolio } from "@/api";
import type { PortfolioScenario } from "@/api";
import type { ExchangeRate, PortfolioResponse } from "@/types";
import { useApiResource } from "./useApiResource";
import type { ApiResource } from "./useApiResource";

// Describe which portfolio to load and how the mock should behave.
export interface UsePortfolioOptions {
  readonly accountId: string;
  readonly scenario?: PortfolioScenario;
  readonly delayMs?: number;
  readonly fail?: boolean;
}

// Load one account's portfolio from the mock API.
export function usePortfolio({
  accountId,
  scenario,
  delayMs,
  fail,
}: UsePortfolioOptions): ApiResource<PortfolioResponse> {
  const load = useCallback(
    (signal: AbortSignal) => getPortfolio(accountId, { scenario, delayMs, fail, signal }),
    [accountId, scenario, delayMs, fail]
  );

  return useApiResource(load);
}

// Load the CAD to USD rate from the mock API.
export function useExchangeRate(): ApiResource<ExchangeRate> {
  const load = useCallback((signal: AbortSignal) => getExchangeRate({ signal }), []);

  return useApiResource(load);
}
