# Frontend Solution: Wealth Management Portfolio Dashboard

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

## Install and run

```sh
npm install
npm run dev
```

Open <http://localhost:3000>.

The dashboard reads live data, so start the mock API first, from the repository root:

```sh
node frontend/mock-server.mjs
```

It listens on `http://localhost:4000`. Override that with `NEXT_PUBLIC_API_BASE_URL`.

Portfolio AI needs an OpenRouter key. Copy `.env.example` to `.env.local` and fill it in:

```sh
cp .env.example .env.local
```

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-5
```

The key is read only on the server, in `src/app/api/portfolio-ai/route.ts`. Without it the panel
reports that the key is missing; the rest of the dashboard still works.

## Run the tests

```sh
npm test
```

That suite is hermetic: it stubs `fetch` and needs no server. To check the client against the running mock
API as well:

```sh
npm run test:live
```

Other scripts: `npm run lint`, `npm run build`, `npm run test:watch`.

## Design system

The theme follows the design practice of [electricmind.com](https://www.electricmind.com/). Tokens were read
from the live site's theme variables and ported into `src/app/globals.css` as Tailwind theme variables.

| Role | Token | Value |
| --- | --- | --- |
| Primary / link | `em-blue` | `#3348FF` |
| Primary hover | `em-blue-dark` | `#253AF3` |
| Accent | `em-neuron` / `em-lilac` | `#C89FFD` / `#E5D2FC` |
| Page background | `eggshell` | `#F5F4F2` |
| Alternate surface | `sand` | `#E9E8E4` |
| Border | `granite` | `#D8D0C8` |
| Body text | `graphite` | `#3F3D3A` |
| Dark surface | `slate` | `#19131F` |
| Foreground | `ink` | `#000000` |

Practices carried over from the site:

- Flat white cards on a warm eggshell page, separated by 1px `granite` borders rather than heavy shadows.
- Uppercase mono eyebrow labels at `0.6875rem` with `0.08em` tracking, exposed as the `eyebrow` utility.
- Uppercase mono buttons on solid electric blue, matching the site's `.button` rule.
- Top navbar at `4.5rem` minimum height with `60px` side padding, matching `.navbar1_component`.
- Tight `-0.01em` tracking on headings and body text.

Two deliberate departures:

- **Rounded corners are kept.** The Electric Mind site sets every radius to `0`. Cards use `18px`, controls
  `10px`, and icon chips `12px`.
- **Fonts are substituted.** The site uses FT System Blank and FT System Mono, which are licensed. This
  project uses Inter and IBM Plex Mono from Google Fonts as the closest free equivalents.

### Light and dark themes

Both themes are defined explicitly. Components use semantic tokens only, with no `dark:` colour variants:

| Token | Light | Dark |
| --- | --- | --- |
| `page` | `#F5F4F2` eggshell | `#000000` |
| `surface` | `#FFFFFF` | `#19131F` slate |
| `line` | `#D8D0C8` granite | `#2E2833` |
| `heading` | `#000000` | `#FFFFFF` |
| `body` | `#3F3D3A` graphite | `#C9C4BD` |
| `subtle` | `#666666` | `#A39E98` |
| `brand` | `#3348FF` | `#6D7CFD` |
| `gain` | `#0B7A4B` | `#3FD39A` |
| `loss` | `#B83224` | `#FF8A75` |
| `flat` | `#666666` | `#A39E98` |

Each semantic token in `@theme` points at a `--sc-*` variable that is redefined per theme, so one attribute
on `<html>` switches the whole dashboard. Every text pair above clears WCAG AA against both its surface and
the page. Icon colours on their tinted chips clear the 3:1 threshold for graphics.

The Electric Mind palette has no success or error colour, so `gain` and `loss` were chosen to sit with its
warm neutrals.

### Theme switching

The navbar has a light and dark toggle. It writes `data-theme` on `<html>` and stores the choice in
`localStorage`. With no stored choice, the theme follows the operating system.

Three details make this flicker free and safe:

- An inline script in `<head>` applies the theme while the browser parses the page, before first paint. It
  ships from `src/composables/themeScript.ts`, so the storage key and attribute name cannot drift from the
  composable that reads them. A test runs that exact string against a fake document.
- The toggle's icon and its screen reader label swap through the `dark:` variant rather than React state, so
  the server and client markup always agree and nothing flashes on hydration.
- `useTheme` re-applies the attribute in a `useLayoutEffect`. React Strict Mode clears attributes it does not
  own from `<html>` on the development remount; this restores it and is a no operation in production.

## Structure

```
src/
  api/            API client: http.ts (fetch wrapper, errors) and api.ts (endpoints)
  app/            Route, root layout, global styles and design tokens
  components/     Feature components (navbar, page header, summary card, states)
  components/ui/  Design system primitives (Card, Button, MiniStatistics, icons)
  composables/    Reusable state and domain logic
  types/          Shared TypeScript contracts
```

## API layer

`src/api/http.ts` holds the transport. `getJson` is the only way the app talks to the network.

- Every failure arrives as a typed `ApiError`, so callers never handle a raw fetch rejection. Its `kind` is
  one of `network`, `timeout`, `http`, `parse`, or `aborted`, plus the HTTP `status` and the API's own
  `error` code when the server answered.
- Non-OK responses are read for the mock's `{ error, message }` body, and fall back to a status message when
  the body is not JSON.
- Requests carry a 10 second timeout, joined with the caller's abort signal.
- `describeApiError` turns an error into a line the user can act on, including how to start the mock.

`src/api/api.ts` holds the endpoints the current components need:

| Function | Route |
| --- | --- |
| `getPortfolio(accountId, options)` | `/portfolios/:id` |
| `getExchangeRate(options)` | `/exchange-rate` |
| `askPortfolioAi(body, options)` | `/api/portfolio-ai` in this app, not the mock |

Both accept an abort signal and the mock's test controls (`scenario`, `delayMs`, `fail`). The interface
does not use those controls; the live test suite does, to drive the loading and error paths. Both check the
response shape and raise a `parse` error if the figures are missing, so a wrong base URL fails loudly
instead of rendering blank tiles. `/accounts` and `/holdings/:ticker/detail` arrive with milestones 8 and 9.

`useApiResource` wraps a request in loading, success, and error state, aborts in flight work when its inputs
change or the component unmounts, and exposes `refetch` for the retry button. `usePortfolio` and
`useExchangeRate` build on it.

Each composable exports a pure function next to its hook, so the domain logic is testable without React:

- `createFormatters` / `useFormatters`
- `convertFromCad` / `useCurrency`
- `buildSummaryMetrics` / `usePortfolioSummary`
- `resolveInitialTheme`, `oppositeTheme` / `useTheme`

## Portfolio value chart

`PortfolioValueChart` draws the history as inline SVG. No charting library was added.

- One 2px line in the brand colour, with a gradient wash below it. A single series needs no legend,
  so the card title names it.
- Hairline gridlines, y-axis ticks rounded to clean numbers, and x-axis labels taken from real dates
  in the series.
- A crosshair snaps to the nearest date and shows the exact date and value. The same readout follows
  keyboard focus: arrow keys step through points, Home and End jump to the ends.
- Gaps break the line into separate paths rather than interpolating across them, and the missing
  stretch is shaded. The `gaps` dataset produces 58 runs and 57 shaded bands.
- One and two point histories render as markers, so they do not look degenerate.
- A collapsed table view keeps every value reachable without hovering. Its rows are built only while
  it is open.

Geometry lives in `useChartGeometry` as pure functions, so it is tested without a DOM.

## Portfolio AI

Click two points on the line to select a period. The period is shaded, summarised with its change,
low and high, and can be sent to Portfolio AI.

The browser never sees the OpenRouter key:

```
browser -> POST /api/portfolio-ai (same origin) -> OpenRouter
```

`src/app/api/portfolio-ai/route.ts` runs on the server. It reads `OPENROUTER_API_KEY`, builds the
system prompt and the context block, and calls OpenRouter. It returns only the reply text and the
model name.

### What the model receives

The context block carries the selected period plus the whole book, so answers can name positions
rather than restate the headline move:

- the period: start and end dates and values, change in money and percent, low and high,
- every asset class with its value and share of the portfolio,
- every holding, largest weight first: ticker, name, asset class, sector, quantity, price, cost
  basis, market value, gain or loss, return since purchase, weight, and day change,
- an estimated contribution per holding, which applies the holding weight to the period move.

The contribution is labelled as an estimate in the prompt. The mock API has no per holding history
for an arbitrary period, and its `/holdings/:ticker/detail` prices are generated from one shape
function scaled by the starting price, so every holding moves the same percent over any window.
Fetching those endpoints would add one request per holding and tell the model nothing new.

Money values are converted before they are sent, so the period figures and the holdings always use
the same currency as the dashboard.

### Route safeguards

- Validates the body and rejects a malformed selection or an empty message list with HTTP 400.
- Caps the request at 12 messages, 2000 characters each, 25 holdings, and 25 asset classes, so it
  cannot be used as an open proxy. Holdings arrive sorted by weight, so the trim keeps the largest
  positions, and the model is told how many were left out.
- Tells the model that the context block is data, not instructions.
- Tells the model it is not an adviser, and passes the provider error message through on failure.

## Milestone status

| # | Task | Status |
| --- | --- | --- |
| 1 | Scaffold the base app shell | Done |
| 2 | Portfolio summary card | Done |
| 3 | Holdings table | Done |
| 4 | Portfolio value line chart | Done |
| 5 | Asset allocation chart | Done |
| 10 | Top movers widget | Done |
| 6-9 | Date range selector, currency toggle, account selector, holding detail view | Not started |
| - | Portfolio AI (addition, not in the spec) | Done |

### Milestone 2 notes

The summary renders as a row of four statistic tiles: total market value, day change in money, day change
percent, and total return since inception.

Percentage units follow the mock API contract:

- `dayChangePercent` is already a percent. `0.32` renders as `0.32%`.
- `totalReturnSinceInception` is a ratio. `0.187` renders as `18.70%`.

Direction states:

- Gain: green value, green arrow, green icon tint.
- Loss: red value, red arrow, red icon tint.
- Zero: neutral navy value, dash icon, grey icon tint. A zero day change is never styled as a gain or a loss.
- Total market value carries no direction, so it is never coloured.

All figures come from the API. The page shows a skeleton while the request is in flight, and an error panel
with a retry button when it fails. Stop the mock server to see that panel.

There is no dataset picker in the interface. To check another dataset, call the API with its `scenario`
parameter and compare:

```sh
curl "http://localhost:4000/portfolios/P-9001?scenario=negative"
curl "http://localhost:4000/portfolios/P-9001?scenario=zero"
```

`npm run test:live` does this for every state, including the 503 and 404 paths.

## Assumptions

- All API money values are native CAD. The currency toggle converts for display only, using the rate from
  `/exchange-rate`. If that request fails the app falls back to the documented `0.73`, which is the same
  value the mock returns.
- The page loads account `P-9001`. The account selector arrives in milestone 8.
- The chart y-axis fits the data instead of starting at zero, which is the usual convention for a
  value-over-time line.
- A gap is any step longer than 1.5 times the usual step between points.
- Portfolio AI reads fictional mock data. It is a demonstration, not advice.
- Direction colour is derived from the native CAD figure, so toggling currency never changes a tile's colour.
- Figures are rounded to two decimals before both formatting and direction checks, so a value that rounds to
  zero reads as neutral rather than showing a signed `0.00`.
- Very long values shrink one or two type steps so large portfolios stay on one line and keep their thousands
  separators.
- Milestone 2 reads from `src/mocks/`, as the task specifies mock JSON input. Wiring the live mock API is
  planned with the account selector in milestone 8.
- The navbar lists one working link, because only the overview page exists today. Its "Talk to us"
  button reproduces the Electric Mind call to action style but is not wired to anything yet.
- The theme follows the operating system until the user picks one with the navbar toggle. After that the
  stored choice wins. The app does not follow later operating system changes within a session.

## Unfinished work

- Milestones 3 to 10.
- Tests cover the domain logic and the API client. Component rendering tests need a DOM environment and are
  not set up yet.
- The date range selector (milestone 6) is not built, so the chart always shows the full history.
- Portfolio AI replies are not streamed. The panel waits for the whole answer.
- Requests are not cached or deduplicated. A data layer such as TanStack Query would be worth adding once
  several components fetch at once.
