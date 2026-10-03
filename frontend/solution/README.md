# Frontend Solution: Wealth Management Portfolio Dashboard

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

## Install and run

```sh
npm install
npm run dev
```

Open <http://localhost:3000>.

The mock API is optional for the current milestones. Start it from the repository root when you need it:

```sh
node frontend/mock-server.mjs
```

## Run the tests

```sh
npm test
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
  app/            Route, root layout, global styles and design tokens
  components/     Feature components (navbar, page header, summary card)
  components/ui/  Design system primitives (Card, Button, IconBox, MiniStatistics, icons)
  composables/    Reusable state and domain logic
  mocks/          Mock datasets
  types/          Shared TypeScript contracts
```

Each composable exports a pure function next to its hook, so the domain logic is testable without React:

- `createFormatters` / `useFormatters`
- `convertFromCad` / `useCurrency`
- `buildSummaryMetrics` / `usePortfolioSummary`
- `resolveInitialTheme`, `oppositeTheme` / `useTheme`

## Milestone status

| # | Task | Status |
| --- | --- | --- |
| 1 | Scaffold the base app shell | Done |
| 2 | Portfolio summary card | Done |
| 3 | Holdings table | Done |
| 4, 6-9 | Performance chart, selectors, detail view | Not started |
| 5 | Asset allocation chart | Done |
| 10 | Top movers widget | Done |

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

Use the **Mock dataset** control under the summary to switch between the positive, negative, zero, large value,
and empty datasets. The tiles re-render from the new input without a page reload.

## Assumptions

- All mock money values are native CAD. The currency toggle converts for display only, at a fixed rate of
  `0.73` CAD to USD. Milestone 7 will read the rate from `/exchange-rate`.
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
- No live API calls yet, so loading and error states are not built.
- Tests cover the domain logic. Component rendering tests need a DOM environment and are not set up yet.
