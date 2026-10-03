// Summary: Atomic metric card displaying an eyebrow label, bold numerical value, and footer.
import type { ReactNode } from "react";
import { Card } from "./Card";

// Define properties for one statistic tile.
interface MiniStatisticsProps {
  readonly name: string;
  readonly value: string;
  readonly startContent?: ReactNode;
  readonly footer?: ReactNode;
  readonly valueClassName?: string;
}

// Shrink the value text so long figures stay on one line.
function resolveValueSize(value: string): string {
  if (value.length > 18) {
    return "text-[1.375rem]";
  }
  if (value.length > 13) {
    return "text-[1.625rem]";
  }
  return "text-[1.875rem]";
}

// Render a statistic tile with an uppercase mono eyebrow label.
export function MiniStatistics({
  name,
  value,
  startContent,
  footer,
  valueClassName = "text-heading",
}: MiniStatisticsProps) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        {startContent}
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-subtle">{name}</p>
          <p
            className={`mt-3 font-semibold tabular-nums tracking-tight ${resolveValueSize(value)} ${valueClassName}`}
          >
            {value}
          </p>
          {footer ? <div className="mt-2 flex items-center">{footer}</div> : null}
        </div>
      </div>
    </Card>
  );
}
