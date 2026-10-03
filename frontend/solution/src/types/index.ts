// Define common status types for composable hooks.
export type AsyncStatus = "idle" | "loading" | "success" | "error";

// Define supported display currencies.
export type CurrencyCode = "CAD" | "USD";

// Define portfolio identification contract.
export interface AccountOption {
  readonly accountId: string;
  readonly label: string;
  readonly totalMarketValue: number;
}
