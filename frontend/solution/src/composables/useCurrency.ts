"use client";

import { useState, useCallback } from "react";
// Import currency types.
import type { CurrencyCode } from "@/types";

// Define exchange rate constant from CAD to USD.
const DEFAULT_CAD_TO_USD_RATE = 0.73;

// Provide composable state for currency selection and conversion.
export function useCurrency(initialCurrency: CurrencyCode = "CAD") {
  // Store the active currency selection.
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);

  // Toggle active currency between CAD and USD.
  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === "CAD" ? "USD" : "CAD"));
  }, []);

  // Convert native CAD amount to active currency value.
  const convertAmount = useCallback(
    (amountInCad: number): number => {
      // Return CAD amount directly when CAD is selected.
      if (currency === "CAD") {
        return amountInCad;
      }
      // Apply exchange rate when USD is selected.
      return amountInCad * DEFAULT_CAD_TO_USD_RATE;
    },
    [currency]
  );

  // Return composable state and utility functions.
  return {
    currency,
    setCurrency,
    toggleCurrency,
    convertAmount,
  };
}
