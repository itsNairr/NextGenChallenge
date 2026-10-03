// Summary: Theme toggle button switching between light mode and dark mode.
"use client";

import { useTheme } from "@/composables";
import { MoonIcon, SunIcon } from "./icons";

// Render a button that switches between the light and dark themes.
// The icon and the label swap through CSS, so both are correct before React hydrates.
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-control border border-line text-subtle transition-colors hover:border-heading hover:text-heading"
    >
      <MoonIcon className="h-4 w-4 dark:hidden" />
      <SunIcon className="hidden h-4 w-4 dark:block" />
      <span className="sr-only dark:hidden">Switch to the dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to the light theme</span>
    </button>
  );
}
