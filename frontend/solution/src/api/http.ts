// Base URL of the portfolio mock API. Override it with NEXT_PUBLIC_API_BASE_URL.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// Give up on a request after this long.
const DEFAULT_TIMEOUT_MS = 10000;

// Name the ways a request can fail.
export type ApiErrorKind = "network" | "timeout" | "http" | "parse" | "aborted";

// Carry a failed request as a typed error.
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly url: string;
  // Hold the HTTP status, when the server answered.
  readonly status?: number;
  // Hold the API error code, for example "not_found" or "unavailable".
  readonly code?: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    url: string,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.url = url;
    this.status = status;
    this.code = code;
  }
}

// Narrow an unknown value to an ApiError.
export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

// Describe the error shape the mock API returns.
interface ApiErrorBody {
  readonly error?: unknown;
  readonly message?: unknown;
}

// Accept the query values the mock API understands.
export type QueryValue = string | number | boolean | undefined;

// Describe one request.
export interface RequestOptions {
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

// Build the full URL, dropping any query value that was not supplied.
export function buildUrl(
  path: string,
  query: Readonly<Record<string, QueryValue>> = {},
  baseUrl: string = API_BASE_URL
): string {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Join the caller's signal with the timeout signal.
function combineSignals(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) {
    return timeout;
  }
  // AbortSignal.any is missing on older browsers. Fall back to the timeout.
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([signal, timeout])
    : timeout;
}

// Pull a useful message out of an error body.
function readErrorBody(body: unknown, status: number) {
  if (typeof body === "object" && body !== null) {
    const { error, message } = body as ApiErrorBody;
    return {
      code: typeof error === "string" ? error : undefined,
      message: typeof message === "string" ? message : `Request failed with status ${status}.`,
    };
  }
  return { code: undefined, message: `Request failed with status ${status}.` };
}

// Decide which kind of failure a thrown fetch error represents.
function classifyThrown(error: unknown, signal?: AbortSignal): ApiErrorKind {
  const name = error instanceof Error ? error.name : "";
  if (name === "TimeoutError") {
    return "timeout";
  }
  if (name === "AbortError") {
    // The caller aborted. Anything else that aborts is the timeout.
    return signal?.aborted ? "aborted" : "timeout";
  }
  return "network";
}

// Send a GET request and return the decoded JSON body.
// Every failure arrives as an ApiError, so callers never see a raw fetch error.
export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = buildUrl(path, query);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: combineSignals(timeoutMs, signal),
    });
  } catch (error) {
    const kind = classifyThrown(error, signal);
    throw new ApiError(kind, describeTransportFailure(kind), url);
  }

  if (!response.ok) {
    // The mock API sends { error, message } with every failure.
    const body = await response.json().catch(() => null);
    const { code, message } = readErrorBody(body, response.status);
    throw new ApiError("http", message, url, response.status, code);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("parse", "The service returned a response the app could not read.", url);
  }
}

// Write the message for a failure that happened before the server answered.
function describeTransportFailure(kind: ApiErrorKind): string {
  if (kind === "timeout") {
    return "The request took too long and was stopped.";
  }
  if (kind === "aborted") {
    return "The request was cancelled.";
  }
  return `Cannot reach the portfolio service at ${API_BASE_URL}.`;
}

// Turn any thrown value into an ApiError.
export function toApiError(error: unknown, url = API_BASE_URL): ApiError {
  if (isApiError(error)) {
    return error;
  }
  const message = error instanceof Error ? error.message : "The request failed.";
  return new ApiError("network", message, url);
}

// Write a short line the user can act on.
export function describeApiError(error: ApiError): string {
  if (error.kind === "network") {
    return `Cannot reach the portfolio service at ${API_BASE_URL}. Start it with "node frontend/mock-server.mjs".`;
  }
  if (error.kind === "http" && error.status === 404) {
    return "That portfolio was not found.";
  }
  return error.message;
}
