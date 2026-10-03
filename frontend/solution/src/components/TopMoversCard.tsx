"use client";

import { useTopMovers } from "@/composables";
import type { TopMover } from "@/composables";
import type { Holding } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Card } from "./ui";

// Describe the look of one movers list.
interface MoverListStyle {
  readonly title: string;
  readonly emptyMessage: string;
  readonly chip: string;
  readonly icon: typeof ArrowUpIcon;
  readonly srLabel: string;
}

// Style the gainers and losers lists differently.
const LIST_STYLES: Record<"gainers" | "losers", MoverListStyle> = {
  gainers: {
    title: "Top gainers",
    emptyMessage: "No gainers today.",
    chip: "bg-gain-soft text-gain",
    icon: ArrowUpIcon,
    srLabel: "Gain",
  },
  losers: {
    title: "Top losers",
    emptyMessage: "No losers today.",
    chip: "bg-loss-soft text-loss",
    icon: ArrowDownIcon,
    srLabel: "Loss",
  },
};

// Render one ranked mover with its ticker, name, and day change.
function MoverRow({ mover, style }: { readonly mover: TopMover; readonly style: MoverListStyle }) {
  const Icon = style.icon;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="eyebrow w-4 shrink-0 text-subtle">{mover.rank}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight text-heading">{mover.ticker}</p>
        <p className="truncate text-xs text-subtle">{mover.name}</p>
      </div>
      <span
        className={`flex shrink-0 items-center rounded-control px-2 py-1 text-sm font-semibold tabular-nums ${style.chip}`}
      >
        <Icon className="me-1 h-3.5 w-3.5" />
        <span className="sr-only">{`${style.srLabel}. `}</span>
        {mover.changeLabel}
      </span>
    </li>
  );
}

// Render one titled list, or a message when it has no entries.
function MoverList({
  movers,
  style,
}: {
  readonly movers: readonly TopMover[];
  readonly style: MoverListStyle;
}) {
  return (
    <div className="min-w-0">
      <p className="eyebrow text-subtle">{style.title}</p>
      {movers.length === 0 ? (
        <p className="mt-3 rounded-chip border border-dashed border-line p-4 text-center text-sm text-body">
          {style.emptyMessage}
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-line">
          {movers.map((mover) => (
            <MoverRow key={`${mover.rank}-${mover.ticker}`} mover={mover} style={style} />
          ))}
        </ol>
      )}
    </div>
  );
}

// Define properties for the top movers card.
interface TopMoversCardProps {
  readonly holdings: readonly Holding[];
  readonly limit?: number;
}

// Render today's largest gainers and losers by day change percent.
export function TopMoversCard({ holdings, limit }: TopMoversCardProps) {
  const { gainers, losers } = useTopMovers({ holdings, limit });

  return (
    <section aria-label="Top movers today" className="min-w-0">
      <Card className="h-full">
        <p className="eyebrow text-subtle">Top movers</p>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-heading">Today</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <MoverList movers={gainers} style={LIST_STYLES.gainers} />
          <MoverList movers={losers} style={LIST_STYLES.losers} />
        </div>
      </Card>
    </section>
  );
}
