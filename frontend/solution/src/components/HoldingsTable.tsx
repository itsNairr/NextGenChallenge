"use client";

import type { KeyboardEvent } from "react";
import { useHoldingsTable } from "@/composables";
import type { HoldingRow, HoldingSort, HoldingSortKey } from "@/composables";
import type { ChangeDirection, CurrencyCode, Holding } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Card, SortIcon } from "./ui";

// Describe one column of the table.
interface HoldingColumn {
  readonly key: HoldingSortKey;
  readonly label: string;
  // Show the active currency code next to money columns.
  readonly money: boolean;
  readonly align: "left" | "right";
}

// List the columns in display order. Every column is sortable.
const COLUMNS: readonly HoldingColumn[] = [
  { key: "ticker", label: "Ticker / Name", money: false, align: "left" },
  { key: "quantity", label: "Qty", money: false, align: "right" },
  { key: "price", label: "Price", money: true, align: "right" },
  { key: "marketValue", label: "Market value", money: true, align: "right" },
  { key: "weightPercent", label: "Weight", money: false, align: "right" },
  { key: "gainLoss", label: "Gain / loss", money: true, align: "right" },
];

// Colour gains, losses, and flat values like the summary tiles.
const GAIN_STYLES: Record<ChangeDirection, string> = {
  up: "text-gain",
  down: "text-loss",
  flat: "text-flat",
};

// Share the cell spacing between the header, body, and totals.
const CELL = "px-5 py-4";

// Render one sortable column header with its sort state.
function SortHeader({
  column,
  currency,
  sort,
  onSort,
}: {
  readonly column: HoldingColumn;
  readonly currency: CurrencyCode;
  readonly sort: HoldingSort;
  readonly onSort: (key: HoldingSortKey) => void;
}) {
  const active = sort.key === column.key;
  const Icon = !active ? SortIcon : sort.direction === "asc" ? ArrowUpIcon : ArrowDownIcon;
  const label = column.money ? `${column.label} (${currency})` : column.label;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={`sticky top-0 z-10 border-b border-line bg-surface ${CELL} ${
        column.align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className={`eyebrow inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-heading ${
          active ? "font-semibold text-heading" : "text-subtle"
        }`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

// Render one holding row. The row opens the detail view when a handler is given.
function HoldingTableRow({
  row,
  onSelect,
}: {
  readonly row: HoldingRow;
  readonly onSelect?: (holding: Holding) => void;
}) {
  // Let keyboard users open a row with Enter or Space.
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (onSelect && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onSelect(row.holding);
    }
  };

  return (
    <tr
      onClick={onSelect ? () => onSelect(row.holding) : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      tabIndex={onSelect ? 0 : undefined}
      className={onSelect ? "cursor-pointer transition-colors hover:bg-page focus-visible:bg-page" : ""}
    >
      <td className={`border-b border-line ${CELL}`}>
        <p className="text-sm font-semibold tracking-tight text-heading">{row.ticker}</p>
        <p className="mt-1 truncate text-xs text-subtle">{row.name}</p>
      </td>
      <td className={`border-b border-line text-right text-sm tabular-nums text-heading ${CELL}`}>
        {row.quantity}
      </td>
      <td className={`border-b border-line text-right text-sm tabular-nums text-heading ${CELL}`}>
        {row.price}
      </td>
      <td className={`border-b border-line text-right text-sm tabular-nums text-heading ${CELL}`}>
        {row.marketValue}
      </td>
      <td className={`border-b border-line text-right text-sm tabular-nums text-heading ${CELL}`}>
        {row.weight}
      </td>
      <td
        className={`border-b border-line text-right text-sm font-semibold tabular-nums ${GAIN_STYLES[row.gainDirection]} ${CELL}`}
      >
        {row.gainLoss}
      </td>
    </tr>
  );
}

// Define properties for the holdings table.
interface HoldingsTableProps {
  readonly holdings: readonly Holding[];
  readonly currency: CurrencyCode;
  readonly convertAmount: (amountInCad: number) => number;
  // Open the detail view for a holding. Rows are not clickable without it.
  readonly onSelectHolding?: (holding: Holding) => void;
}

// Render all positions as a sortable table with a totals row.
export function HoldingsTable({
  holdings,
  currency,
  convertAmount,
  onSelectHolding,
}: HoldingsTableProps) {
  const { rows, totals, sort, toggleSort } = useHoldingsTable({ holdings, currency, convertAmount });

  return (
    <section aria-label="Holdings" className="min-w-0">
      <Card>
        {/* Title row */}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-heading">Holdings</h2>
            <span className="eyebrow text-subtle">
              {totals.count === 1 ? "1 position" : `${totals.count} positions`}
            </span>
          </div>
          {onSelectHolding && rows.length > 0 ? (
            <p className="text-sm text-subtle">Click a row for details</p>
          ) : null}
        </div>

        {/* Scroll region. The header and totals stay in view for long lists. */}
        <div className="-mx-5 -mb-5 mt-5 max-h-[640px] overflow-auto border-t border-line">
          <table className="w-full min-w-[760px] border-separate border-spacing-0">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <SortHeader
                    key={column.key}
                    column={column}
                    currency={currency}
                    sort={sort}
                    onSort={toggleSort}
                  />
                ))}
              </tr>
            </thead>

            {rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-body">
                    No holdings to display.
                  </td>
                </tr>
              </tbody>
            ) : (
              <>
                <tbody>
                  {rows.map((row) => (
                    <HoldingTableRow key={row.ticker} row={row} onSelect={onSelectHolding} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="[&>td]:sticky [&>td]:bottom-0 [&>td]:border-t-2 [&>td]:border-heading [&>td]:bg-surface">
                    <td className={`text-sm font-semibold text-heading ${CELL}`}>Total</td>
                    <td className={CELL} />
                    <td className={CELL} />
                    <td
                      className={`text-right text-sm font-semibold tabular-nums text-heading ${CELL}`}
                    >
                      {totals.marketValue}
                    </td>
                    <td className={`text-right text-sm tabular-nums text-subtle ${CELL}`}>
                      {totals.weight}
                    </td>
                    <td
                      className={`text-right text-sm font-semibold tabular-nums ${GAIN_STYLES[totals.gainDirection]} ${CELL}`}
                    >
                      {totals.gainLoss}
                    </td>
                  </tr>
                </tfoot>
              </>
            )}
          </table>
        </div>
      </Card>
    </section>
  );
}
