// Summary: Core TypeScript domain types, API models, and shared interfaces.
// Define common status types for composable hooks.
export type AsyncStatus = "idle" | "loading" | "success" | "error";

// Define the selectable colour themes.
export type ThemeName = "light" | "dark";

// Define supported display currencies.
export type CurrencyCode = "CAD" | "USD";

// Define portfolio identification contract.
export interface AccountOption {
  readonly accountId: string;
  readonly label: string;
  readonly totalMarketValue: number;
}

// Describe the portfolio summary figures. All money fields are native CAD.
export interface PortfolioSummary {
  readonly totalMarketValue: number;
  // Day change in money.
  readonly dayChangeAmount: number;
  // Day change already expressed as a percent. 0.32 means 0.32%.
  readonly dayChangePercent: number;
  // Total return expressed as a ratio. 0.187 means 18.7%.
  readonly totalReturnSinceInception: number;
}

// Describe the direction of a change value.
export type ChangeDirection = "up" | "down" | "flat";

// Name the icons available to summary tiles.
export type MetricIconName = "wallet" | "dollar" | "percent" | "trend";

// Describe one holding row returned by the portfolio endpoint.
export interface Holding {
  readonly ticker: string;
  readonly name: string;
  readonly assetClass: string;
  readonly sector: string;
  readonly quantity: number;
  readonly price: number;
  readonly costBasisPerShare: number;
  readonly marketValue: number;
  readonly gainLoss: number;
  readonly dayChangeAmount: number;
  readonly dayChangePercent: number;
  readonly weightPercent: number;
}

// Describe one asset class slice.
export interface AllocationSlice {
  readonly assetClass: string;
  readonly value: number;
}

// Describe one point on the performance chart.
export interface PerformancePoint {
  readonly date: string;
  readonly marketValue: number;
}

// Describe the portfolio object, which extends the summary with identity fields.
export interface Portfolio extends PortfolioSummary {
  readonly portfolioId: string;
  readonly accountId: string;
  readonly clientId: string;
  readonly label: string;
  readonly currency: string;
}

// Describe the full response from the portfolio endpoint.
export interface PortfolioResponse {
  readonly asOf: string;
  readonly portfolio: Portfolio;
  readonly holdings: readonly Holding[];
  readonly allocation: readonly AllocationSlice[];
  readonly performanceHistory: readonly PerformancePoint[];
}

// Describe the exchange rate endpoint response.
export interface ExchangeRate {
  readonly CADtoUSD: number;
}

// Describe one point on the value chart, after currency conversion.
export interface ChartSeriesPoint {
  readonly date: string;
  readonly value: number;
}

// Describe a period the user picked by clicking two points on the chart.
export interface ChartSelection {
  readonly startIndex: number;
  readonly endIndex: number;
}

// Describe the facts about a selected period that Portfolio AI receives.
export interface SelectionSummary {
  readonly startDate: string;
  readonly endDate: string;
  readonly startValue: number;
  readonly endValue: number;
  readonly changeAmount: number;
  readonly changePercent: number;
  readonly lowValue: number;
  readonly lowDate: string;
  readonly highValue: number;
  readonly highDate: string;
  readonly pointCount: number;
  readonly currency: CurrencyCode;
}

// Describe one holding sent as context. Money fields use the display currency.
export interface HoldingContext {
  readonly ticker: string;
  readonly name: string;
  readonly assetClass: string;
  readonly sector: string;
  readonly quantity: number;
  readonly price: number;
  readonly costBasisPerShare: number;
  readonly marketValue: number;
  readonly gainLoss: number;
  readonly weightPercent: number;
  readonly dayChangePercent: number;
  // Return on this position since purchase, as a percent.
  readonly returnSincePurchasePercent: number;
}

// Describe one asset class share sent as context.
export interface AllocationContext {
  readonly assetClass: string;
  readonly value: number;
  readonly sharePercent: number;
}

// Name who wrote a chat message.
export type ChatRole = "user" | "assistant";

// Describe one chat message.
export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  // Name the chart period this message was asked about.
  readonly chip?: string;
}

// Describe the request body sent to the Portfolio AI route in this app.
export interface PortfolioAiRequest {
  readonly selection: SelectionSummary;
  // Hold the holdings sorted by weight, largest first.
  readonly holdings: readonly HoldingContext[];
  readonly allocation: readonly AllocationContext[];
  // Count every holding, so the model knows when the list was trimmed.
  readonly totalHoldings: number;
  readonly messages: readonly Pick<ChatMessage, "role" | "content">[];
}

// Describe the response from the Portfolio AI route in this app.
export interface PortfolioAiResponse {
  readonly reply: string;
  readonly model: string;
}
