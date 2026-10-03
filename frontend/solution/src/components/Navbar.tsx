// Summary: Persistent top navigation bar displaying the Electric Mind brand and utility controls.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, Button, ElectricMindSymbol, ElectricMindWordmark, ThemeToggle } from "./ui";

// Describe one navbar link.
interface NavLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

// List the navigation entries. Only the overview page exists today.
const NAV_LINKS: readonly NavLink[] = [{ id: "overview", label: "Overview", href: "/" }];

// Define properties for the navbar.
interface NavbarProps {
  readonly activeId: string;
  readonly actions?: ReactNode;
}

// Render the top navigation bar in the Electric Mind style.
export function Navbar({ activeId, actions }: NavbarProps) {
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

        {/* Primary navigation */}
        <nav aria-label="Main" className="flex items-center">
          {NAV_LINKS.map((link) => {
            const isActive = link.id === activeId;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-4 py-2 text-sm transition-colors ${
                  isActive ? "font-semibold text-heading" : "text-subtle hover:text-heading"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

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
