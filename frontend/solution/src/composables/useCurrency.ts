"use client";

import { useState, useCallback, useMemo } from "react";
// Import currency types.
import type { CurrencyCode } from "@/types";

// Define exchange rate constant from CAD to USD.
export const DEFAULT_CAD_TO_USD_RATE = 0.73;

// Convert a native CAD amount into the target currency.
export function convertFromCad(
  amountInCad: number,
  currency: CurrencyCode,
  cadToUsdRate: number = DEFAULT_CAD_TO_USD_RATE
): number {
  // Return the CAD amount unchanged when CAD is selected.
  if (currency === "CAD") {
    return amountInCad;
  }
  // Apply the exchange rate when USD is selected.
  return amountInCad * cadToUsdRate;
}

// Provide composable state for currency selection and conversion.
export function useCurrency(
  initialCurrency: CurrencyCode = "CAD",
  cadToUsdRate: number = DEFAULT_CAD_TO_USD_RATE
) {
  // Store the active currency selection.
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);

  // Toggle active currency between CAD and USD.
  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === "CAD" ? "USD" : "CAD"));
  }, []);

  // Convert native CAD amount to active currency value.
  const convertAmount = useCallback(
    (amountInCad: number): number => convertFromCad(amountInCad, currency, cadToUsdRate),
    [currency, cadToUsdRate]
  );

  // Return composable state and utility functions.
  return useMemo(
    () => ({
      currency,
      setCurrency,
      toggleCurrency,
      convertAmount,
    }),
    [currency, toggleCurrency, convertAmount]
  );
}
