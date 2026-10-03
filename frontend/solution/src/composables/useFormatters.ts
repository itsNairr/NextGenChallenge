// Summary: Composable hook and pure utilities for rounding, currency formatting, and percentages.
"use client";

import { useMemo } from "react";
import type { ChangeDirection, CurrencyCode } from "@/types";

// Match each display currency to its formatting locale.
const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  CAD: "en-CA",
  USD: "en-US",
};

// Use a fixed locale for percentages so digit grouping stays stable.
const PERCENT_LOCALE = "en-CA";

// Show two decimals everywhere so display rounding is predictable.
const DISPLAY_DIGITS = 2;

// Round a value to the number of digits the display shows.
export function roundToDisplay(value: number, digits: number = DISPLAY_DIGITS): number {
  const factor = 10 ** digits;
  // Add zero to remove a negative zero result.
  return Math.round(value * factor) / factor + 0;
}

// Resolve the direction of a change value at display precision.
export function resolveDirection(value: number): ChangeDirection {
  const rounded = roundToDisplay(value);
  if (rounded > 0) {
    return "up";
  }
  if (rounded < 0) {
    return "down";
  }
  return "flat";
}

// Describe the formatter set the composable returns.
export interface Formatters {
  // Format money without a forced sign.
  readonly formatCurrency: (amount: number) => string;
  // Format money with a leading + or -, and no sign at zero.
  readonly formatSignedCurrency: (amount: number) => string;
  // Format a value that is already a percent. 0.32 becomes "0.32%".
  readonly formatSignedPercent: (percent: number) => string;
  // Format a ratio as a percent. 0.187 becomes "+18.70%".
  readonly formatSignedRatio: (ratio: number) => string;
}

// Build the number formatters for one currency.
export function createFormatters(currency: CurrencyCode): Formatters {
  const money = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: DISPLAY_DIGITS,
    maximumFractionDigits: DISPLAY_DIGITS,
  });

  const signedMoney = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    signDisplay: "exceptZero",
    minimumFractionDigits: DISPLAY_DIGITS,
    maximumFractionDigits: DISPLAY_DIGITS,
  });

  const signedNumber = new Intl.NumberFormat(PERCENT_LOCALE, {
    signDisplay: "exceptZero",
    minimumFractionDigits: DISPLAY_DIGITS,
    maximumFractionDigits: DISPLAY_DIGITS,
  });

  return {
    formatCurrency: (amount) => money.format(roundToDisplay(amount)),
    formatSignedCurrency: (amount) => signedMoney.format(roundToDisplay(amount)),
    formatSignedPercent: (percent) => `${signedNumber.format(roundToDisplay(percent))}%`,
    formatSignedRatio: (ratio) => `${signedNumber.format(roundToDisplay(ratio * 100))}%`,
  };
}

// Provide memoised number formatters for the active currency.
export function useFormatters(currency: CurrencyCode): Formatters {
  return useMemo<Formatters>(() => createFormatters(currency), [currency]);
}
