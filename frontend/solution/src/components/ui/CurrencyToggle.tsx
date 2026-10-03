// Summary: Segmented toggle control switching the active dashboard currency between CAD and USD.
"use client";

import type { CurrencyCode } from "@/types";
import { SegmentedControl } from "./SegmentedControl";
import type { SegmentOption } from "./SegmentedControl";

// List the currencies the toggle offers.
const CURRENCY_OPTIONS: readonly SegmentOption<CurrencyCode>[] = [
  { id: "CAD", label: "CAD" },
  { id: "USD", label: "USD" },
];

// Define properties for the currency toggle.
interface CurrencyToggleProps {
  readonly currency: CurrencyCode;
  readonly onSelect: (currency: CurrencyCode) => void;
}

// Render a segmented control for the display currency.
export function CurrencyToggle({ currency, onSelect }: CurrencyToggleProps) {
  return (
    <SegmentedControl
      label="Display currency"
      options={CURRENCY_OPTIONS}
      value={currency}
      onSelect={onSelect}
    />
  );
}
