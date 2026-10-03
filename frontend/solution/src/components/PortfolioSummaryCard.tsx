// Summary: Metric grid component rendering total value, day change, and total return cards.
"use client";

import type { ComponentType } from "react";
import { usePortfolioSummary } from "@/composables";
import type { SummaryMetric } from "@/composables";
import type { ChangeDirection, CurrencyCode, MetricIconName, PortfolioSummary } from "@/types";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DashIcon,
  DollarIcon,
  IconBox,
  MiniStatistics,
  PercentIcon,
  TrendIcon,
  WalletIcon,
} from "./ui";

// Map each metric icon name to its component.
const METRIC_ICONS: Record<MetricIconName, ComponentType<{ className?: string }>> = {
  wallet: WalletIcon,
  dollar: DollarIcon,
  percent: PercentIcon,
  trend: TrendIcon,
};

// Map each direction to its arrow component.
const DIRECTION_ICONS: Record<ChangeDirection, ComponentType<{ className?: string }>> = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  flat: DashIcon,
};

// Describe the colours used for one direction.
interface DirectionStyle {
  readonly iconBox: string;
  readonly icon: string;
  readonly value: string;
  readonly accent: string;
}

// Use neutral colours when a metric carries no direction.
const NEUTRAL_STYLE: DirectionStyle = {
  iconBox: "bg-accent-soft",
  icon: "text-brand",
  value: "text-heading",
  accent: "text-subtle",
};

// Style gains, losses, and flat values differently.
const DIRECTION_STYLES: Record<ChangeDirection, DirectionStyle> = {
  up: {
    iconBox: "bg-gain-soft",
    icon: "text-gain",
    value: "text-gain",
    accent: "text-gain",
  },
  down: {
    iconBox: "bg-loss-soft",
    icon: "text-loss",
    value: "text-loss",
    accent: "text-loss",
  },
  flat: {
    iconBox: "bg-flat-soft",
    icon: "text-flat",
    value: "text-heading",
    accent: "text-flat",
  },
};

// Describe the direction for assistive technology.
const DIRECTION_LABELS: Record<ChangeDirection, string> = {
  up: "Gain",
  down: "Loss",
  flat: "No change",
};

// Render one summary tile from its metric descriptor.
function SummaryTile({ metric }: { readonly metric: SummaryMetric }) {
  const style = metric.direction ? DIRECTION_STYLES[metric.direction] : NEUTRAL_STYLE;
  const MetricIcon = METRIC_ICONS[metric.icon];
  const DirectionIcon = metric.direction ? DIRECTION_ICONS[metric.direction] : null;

  return (
    <MiniStatistics
      name={metric.name}
      value={metric.value}
      valueClassName={style.value}
      startContent={
        <IconBox className={style.iconBox}>
          <MetricIcon className={`h-5 w-5 ${style.icon}`} />
        </IconBox>
      }
      footer={
        <>
          {DirectionIcon && metric.direction ? (
            <>
              <DirectionIcon className={`me-1.5 h-3.5 w-3.5 ${style.accent}`} />
              <span className="sr-only">{`${DIRECTION_LABELS[metric.direction]}. `}</span>
            </>
          ) : null}
          <span className="eyebrow text-subtle">{metric.caption}</span>
        </>
      }
    />
  );
}

// Define properties for the summary row.
interface PortfolioSummaryCardProps {
  // Pass null while the portfolio is not available yet.
  readonly summary: PortfolioSummary | null;
  readonly currency: CurrencyCode;
  readonly convertAmount: (amountInCad: number) => number;
}

// Render the portfolio summary as a row of Horizon UI tiles.
export function PortfolioSummaryCard({
  summary,
  currency,
  convertAmount,
}: PortfolioSummaryCardProps) {
  const metrics = usePortfolioSummary({ summary, currency, convertAmount });

  return (
    <section aria-label="Portfolio summary">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SummaryTile key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}
