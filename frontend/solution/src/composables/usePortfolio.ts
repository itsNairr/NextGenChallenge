// Summary: Composable hooks for fetching active portfolio data and live exchange rate resources.
"use client";

import { useCallback } from "react";
import { getExchangeRate, getPortfolio } from "@/api";
import type { ExchangeRate, PortfolioResponse } from "@/types";
import { useApiResource } from "./useApiResource";
import type { ApiResource } from "./useApiResource";

// Load one account's portfolio from the API.
export function usePortfolio(accountId: string): ApiResource<PortfolioResponse> {
  const load = useCallback(
    (signal: AbortSignal) => getPortfolio(accountId, { signal }),
    [accountId]
  );

  return useApiResource(load);
}

// Load the CAD to USD rate from the API.
export function useExchangeRate(): ApiResource<ExchangeRate> {
  const load = useCallback((signal: AbortSignal) => getExchangeRate({ signal }), []);

  return useApiResource(load);
}
