import type { ReactNode } from "react";

// Define properties for the card surface.
interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

// Render a flat, bordered card in the Electric Mind style.
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`relative flex w-full min-w-0 flex-col break-words rounded-card border border-line bg-surface p-5 shadow-card dark:shadow-none ${className}`}
    >
      {children}
    </div>
  );
}
