"use client";

// Import composables and components.
import { useCurrency } from "@/composables";
import { Header } from "@/components";

// Render main application shell.
export default function Home() {
  // Use currency composable.
  const { currency, toggleCurrency } = useCurrency("CAD");

  return (
    // Application root container.
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Composable persistent header */}
      <Header title="Portfolio Dashboard" />

      {/* Main dashboard content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Foundation status card */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Project Foundation Initialized</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Next.js App Router, TypeScript, and Tailwind CSS configured with composable structure.
              </p>
            </div>
            {/* Currency toggle composable demonstration */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Currency Composable:</span>
              <button
                type="button"
                onClick={toggleCurrency}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Active: {currency} (Click to switch)
              </button>
            </div>
          </div>
        </section>

        {/* Placeholder overview container ready for milestones */}
        <section className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-950/50">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Base shell ready. Milestones pending implementation as requested.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Backend mock server available at http://localhost:4000
          </p>
        </section>
      </main>
    </div>
  );
}
