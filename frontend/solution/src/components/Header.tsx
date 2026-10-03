// Summary: Page heading component with eyebrow badge, title, and slot for header actions.
import type { ReactNode } from "react";

// Define properties for the page heading.
interface HeaderProps {
  readonly title: string;
  readonly eyebrow?: string;
  readonly actions?: ReactNode;
}

// Render the page heading with an uppercase mono eyebrow.
export function Header({ title, eyebrow = "Portfolio", actions }: HeaderProps) {
  return (
    <div className="flex flex-col gap-5 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow text-subtle">{eyebrow}</p>
        <h1 className="mt-3 text-[2.5rem] leading-[1.1] font-bold tracking-tight text-heading">
          {title}
        </h1>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
