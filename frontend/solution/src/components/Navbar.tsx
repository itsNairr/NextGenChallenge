// Summary: Persistent top navigation bar displaying the Electric Mind brand and utility controls.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, Button, ElectricMindSymbol, ElectricMindWordmark, ThemeToggle } from "./ui";

// Define properties for the navbar.
interface NavbarProps {
  readonly activeId?: string;
  readonly actions?: ReactNode;
}

// Render the top navigation bar in the Electric Mind style.
export function Navbar({ actions }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur-xl">
      <div className="flex min-h-[4.5rem] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3 lg:px-[60px]">
        {/* Brand identity linking to home */}
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Electric Mind Wealth Portfolio">
          <div className="flex items-center gap-2 text-heading">
            <ElectricMindSymbol className="h-6 w-auto shrink-0" />
            <ElectricMindWordmark className="h-4 w-auto shrink-0" />
          </div>
          <span className="hidden h-4 w-px bg-line sm:inline-block" aria-hidden="true" />
        </Link>

        {/* Controls and call to action */}
        <div className="ms-auto flex items-center gap-3">
          {actions}
          <ThemeToggle />
          {/* Placeholder call to action. No contact flow exists yet. */}
          <Button className="hidden sm:inline-flex">
            Talk to us
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
