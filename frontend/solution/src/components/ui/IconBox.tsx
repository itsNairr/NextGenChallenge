// Summary: Rounded chip container for consistent icon placement and background accents.
import type { ReactNode } from "react";

// Define properties for the icon chip.
interface IconBoxProps {
  readonly children: ReactNode;
  readonly className?: string;
}

// Render a rounded square icon chip.
export function IconBox({ children, className = "" }: IconBoxProps) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-chip ${className}`}
    >
      {children}
    </div>
  );
}
