# Wealth Management Portfolio Dashboard

A modern, high-performance wealth management portfolio dashboard built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

The user interface follows the design principles and color tokens of [Electric Mind](https://www.electricmind.com/), featuring zero-dependency inline SVG visualizations, a composable architecture, and an integrated AI assistant named **FolioMind**.

---

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components & Client Components)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict typing, explicit interfaces)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS `@theme` design tokens, zero external CSS runtime)
- **Testing**: [Vitest](https://vitest.dev/) (138 hermetic unit tests + live API test suites)
- **Charting**: Zero external chart libraries. All line charts and donut charts are rendered using pure, responsive SVG.
- **AI Integration**: [OpenRouter API](https://openrouter.ai/) accessed via a secure, server-side Next.js route handler.

---

## Quick Start

### 1. Start the Backend Mock Server
From the repository root:
```sh
node frontend/mock-server.mjs
```
The mock server runs on `http://localhost:4000`.

### 2. Configure Environment (Optional for AI)
To enable the **FolioMind** AI panel, create `frontend/solution/.env.local`:
```sh
cp .env.example .env.local
```
Add your OpenRouter key:
```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-5
```
*Note: The dashboard functions completely even if the AI key is not configured.*

### 3. Install and Run the Frontend
From `frontend/solution/`:
```sh
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run the Test Suites
```sh
# Run hermetic unit tests (138 tests)
npm test

# Run live integration tests against the mock server
npm run test:live

# Production build check
npm run build
```

---

## Project Structure

The project uses a composable architecture. Domain logic, state management, and computations remain separated from presentation components:

```
frontend/solution/
├── next.config.ts                     # Framework configuration
├── eslint.config.mjs                  # Linter settings
├── postcss.config.mjs                 # PostCSS Tailwind v4 pipeline
├── tsconfig.json                      # Strict TypeScript compiler options
├── package.json                       # Scripts and dependencies
├── AGENTS.md                          # Coding guidelines and rules
└── src/
    ├── types/                         # Shared TypeScript domain contracts
    │   └── index.ts                   # Portfolio, Holding, Allocation, and Chart types
    ├── api/                           # API transport and network clients
    │   ├── http.ts                    # Resilient fetch wrapper with timeouts and ApiError
    │   ├── api.ts                     # Endpoint functions (/portfolios, /exchange-rate, etc.)
    │   ├── index.ts                   # Re-exports
    │   ├── api.test.ts                # Scenario and parameter unit tests
    │   ├── http.test.ts               # Error handling and timeout unit tests
    │   └── live.test.ts               # Live backend integration test suite
    ├── composables/                   # Reusable reactive logic and domain utilities
    │   ├── index.ts                   # Unified entry point
    │   ├── themeScript.ts             # Pre-paint inline theme script
    │   ├── useTheme.ts                # Light / Dark theme management
    │   ├── useCurrency.ts             # CAD <-> USD currency conversion and state
    │   ├── useFormatters.ts           # Number, currency, and percent formatting utilities
    │   ├── useApiResource.ts          # Async lifecycle, status, and abort signals
    │   ├── usePortfolio.ts            # Resource hook for active portfolio & exchange rate
    │   ├── usePortfolioSummary.ts     # Computations for summary metrics
    │   ├── useHoldingsTable.ts        # Column sorting, pagination, and total calculations
    │   ├── useTopMovers.ts            # Gainers and losers ranking logic
    │   ├── useAllocation.ts           # Donut chart geometry and share percent math
    │   ├── useElementWidth.ts         # Real-time ResizeObserver element measurements
    │   ├── useChartGeometry.ts        # SVG line, area, axis ticks, and gap band math
    │   ├── useChartSelection.ts       # Two-click period range selection
    │   ├── usePortfolioAi.ts          # FolioMind chat session management
    │   └── *.test.ts                  # Unit test suites for all composables
    ├── components/                    # Feature-level UI components
    │   ├── index.ts                   # Component exports
    │   ├── Navbar.tsx                 # Top navigation with Electric Mind logo & controls
    │   ├── Header.tsx                 # Page title with eyebrow badge
    │   ├── PortfolioSummaryCard.tsx   # Milestone 2: 4-metric summary row
    │   ├── HoldingsTable.tsx          # Milestone 3: Interactive, sortable positions table
    │   ├── PortfolioChartCard.tsx     # Milestone 4: Chart card container & controls
    │   ├── PortfolioValueChart.tsx    # Milestone 4: Custom interactive SVG line chart
    │   ├── AllocationCard.tsx         # Milestone 5: Asset allocation donut chart
    │   ├── TopMoversCard.tsx          # Milestone 10: Top gainers & losers widget
    │   ├── PortfolioAiPanel.tsx       # FolioMind AI assistant chat interface
    │   ├── ErrorState.tsx             # Friendly error boundary card with retry button
    │   ├── SummarySkeleton.tsx        # Skeleton loaders for summary tiles
    │   ├── HoldingsSkeleton.tsx       # Skeleton loaders for holdings table
    │   ├── WidgetsSkeleton.tsx        # Skeleton loaders for charts & widgets
    │   └── ui/                        # Atomic design system primitives
    │       ├── Button.tsx             # Monospace uppercase button
    │       ├── Card.tsx               # Bordered surface container
    │       ├── CurrencyToggle.tsx     # CAD / USD segmented pill switch
    │       ├── SegmentedControl.tsx   # Accessible segmented tab group
    │       ├── MiniStatistics.tsx     # Atomic metric card
    │       ├── IconBox.tsx            # Rounded icon badge
    │       ├── Skeleton.tsx           # Pulse animation placeholder
    │       ├── ThemeToggle.tsx        # Light / Dark mode toggle button
    │       └── icons.tsx              # SVG icons & official Electric Mind vectors
    └── app/                           # Next.js App Router entry points
        ├── layout.tsx                 # Root layout with fonts & inline theme script
        ├── page.tsx                   # Main dashboard overview view
        ├── globals.css                # CSS variables, tokens, and utility classes
        └── api/portfolio-ai/route.ts  # Server-side AI proxy to OpenRouter
```

---

## Accomplished Milestones & File Directory

The dashboard fulfills the core requirements from the project specification, plus value-add enhancements:

| Milestone | Feature | Implementation Files |
| :--- | :--- | :--- |
| **Milestone 1** | **Base App Shell**<br>Persistent layout, navigation, Electric Mind brand mark, theme switcher, responsive layout, error boundary, and skeleton loading states. | • `src/components/Navbar.tsx`<br>• `src/components/Header.tsx`<br>• `src/app/layout.tsx`<br>• `src/app/page.tsx`<br>• `src/components/ErrorState.tsx`<br>• `src/components/SummarySkeleton.tsx` |
| **Milestone 2** | **Portfolio Summary Card**<br>Displays Total Market Value, Day Change ($ and %), and Total Return Since Inception. Handles positive, negative, and neutral values with custom status badges and icons. | • `src/components/PortfolioSummaryCard.tsx`<br>• `src/composables/usePortfolioSummary.ts`<br>• `src/components/ui/MiniStatistics.tsx`<br>• `src/composables/usePortfolioSummary.test.ts` |
| **Milestone 3** | **Holdings Table**<br>Displays all position columns (ticker, name, quantity, price, market value, weight %, gain/loss). Multi-column sorting (asc/desc), visual gain/loss indicators, empty state handling, and portfolio totals row. | • `src/components/HoldingsTable.tsx`<br>• `src/composables/useHoldingsTable.ts`<br>• `src/components/HoldingsSkeleton.tsx`<br>• `src/composables/useHoldingsTable.test.ts` |
| **Milestone 4** | **Portfolio Value Line Chart**<br>Zero-dependency SVG line chart with gradient fill. Features crosshair hover tooltips, keyboard navigation, shaded bands for missing date gaps, degenerate 1–2 point support, and an accessible data table view. | • `src/components/PortfolioValueChart.tsx`<br>• `src/components/PortfolioChartCard.tsx`<br>• `src/composables/useChartGeometry.ts`<br>• `src/composables/useElementWidth.ts`<br>• `src/composables/useChartGeometry.test.ts` |
| **Milestone 5** | **Asset Allocation Chart**<br>Responsive SVG donut chart showing distribution across asset classes (Equity, Fixed Income, Cash, Alternatives). Features interactive hover segments, color badges, and empty/single-class edge case support. | • `src/components/AllocationCard.tsx`<br>• `src/composables/useAllocation.ts`<br>• `src/composables/useAllocation.test.ts` |
| **Milestone 7** | **Currency Toggle (CAD ↔ USD)**<br>Global toggle converting all currency figures using live exchange rates from `/exchange-rate` (with `0.73` fallback). Converts summary values, holdings table figures, chart points, and widget totals simultaneously without losing UI state. | • `src/components/ui/CurrencyToggle.tsx`<br>• `src/composables/useCurrency.ts`<br>• `src/composables/useFormatters.ts`<br>• `src/composables/useFormatters.test.ts` |
| **Milestone 10** | **Top Movers Widget**<br>Ranks the top 3 gainers and top 3 losers by daily change percentage. Gracefully handles edge cases including portfolios with fewer than 3 holdings and one-direction days (e.g., all gainers or all losers). | • `src/components/TopMoversCard.tsx`<br>• `src/composables/useTopMovers.ts`<br>• `src/components/WidgetsSkeleton.tsx`<br>• `src/composables/useTopMovers.test.ts` |
| **Bonus Feature** | **FolioMind (Portfolio AI)**<br>Allows users to click any two points on the line chart to define a time window. Summarizes performance and powers an interactive, context-aware AI chat answering attribution questions securely through OpenRouter. | • `src/components/PortfolioAiPanel.tsx`<br>• `src/composables/usePortfolioAi.ts`<br>• `src/composables/useChartSelection.ts`<br>• `src/app/api/portfolio-ai/route.ts`<br>• `src/composables/useChartSelection.test.ts` |

---

## Design System & Aesthetics

The visual design system draws inspiration from [Electric Mind](https://www.electricmind.com/):

### 1. Palette & Semantic Tokens
- **Brand Colors**: Electric Blue (`#3348FF` light / `#6D7CFD` dark), Neuron Lilac (`#C89FFD` / `#E5D2FC`).
- **Neutrals**: Warm eggshell page (`#F5F4F2`), crisp surface cards (`#FFFFFF`), granite borders (`#D8D0C8`), and graphite body text (`#3F3D3A`).
- **Status Accents**: Muted forest green (`#0B7A4B` / `#3FD39A`) for gains, crimson (`#B83224` / `#FF8A75`) for losses, and neutral grey for zero moves.

### 2. Typography & Micro-Interactions
- Primary typography uses **Inter** paired with **IBM Plex Mono** for uppercase eyebrow badges and numerical tabular figures.
- Micro-interactions include smooth hover states, SVG line chart crosshairs, pulsing skeleton loaders, and responsive container resizing via `ResizeObserver`.

### 3. Flicker-Free Theme Switching
- The inline script in `src/composables/themeScript.ts` executes in the document `<head>` prior to first paint.
- It detects saved preferences in `localStorage` or matches the system's `prefers-color-scheme`, avoiding light/dark flash of unstyled content (FOUC).

---

## Engineering Quality & Standards

- **Composable Architecture**: Pure business logic is extracted into composable functions with accompanying unit tests.
- **Strict Typing**: All components, hooks, and API responses are covered by strict TypeScript types.
- **Single-Line Comments**: Following team guidelines, the codebase uses concise single-line comments (`// ...`) with a one-line summary at the top of each file.
- **Hermetic Testing**: The test suite uses Vitest with mocked fetch responses, allowing complete CI execution without a running server.
- **Accessibility**: Includes keyboard navigation for charts, semantic HTML tags, ARIA attributes (`aria-busy`, `aria-live`, `aria-label`), and high-contrast color ratios exceeding WCAG AA standards.
