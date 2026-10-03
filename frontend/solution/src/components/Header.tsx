"use client";

// Define properties for Header component.
interface HeaderProps {
  readonly title: string;
}

// Render persistent top navigation bar.
export function Header({ title }: HeaderProps) {
  return (
    // Top navigation container.
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity area */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-semibold shadow-sm">
            WM
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Wealth Management Platform</p>
          </div>
        </div>
        {/* Environment badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Live Ready
          </span>
        </div>
      </div>
    </header>
  );
}
