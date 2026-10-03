// Summary: Unit tests verifying timeout handling, HTTP error parsing, and URL construction.
import { afterEach, describe, expect, test, vi } from "vitest";
import assert from "node:assert/strict";
import { API_BASE_URL, ApiError, buildUrl, getJson, isApiError, toApiError } from "@/api/http";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Answer the next fetch call with this response.
function stubFetch(impl: (url: string, init: RequestInit) => Promise<Response> | Response) {
  const spy = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    (input, init) => Promise.resolve(impl(String(input), init ?? {}))
  );
  vi.stubGlobal("fetch", spy);
  return spy;
}

// Read the request options of the first call.
function initOf(spy: ReturnType<typeof stubFetch>): RequestInit {
  return spy.mock.calls[0][1] ?? {};
}

// Build a JSON response without a real server.
function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("buildUrl", () => {
  test("joins the path onto the base URL", () => {
    assert.equal(buildUrl("/accounts"), `${API_BASE_URL}/accounts`);
  });

  test("adds the query values that were supplied", () => {
    const url = new URL(buildUrl("/portfolios/P-9001", { scenario: "zero", delayMs: 250 }));
    assert.equal(url.pathname, "/portfolios/P-9001");
    assert.equal(url.searchParams.get("scenario"), "zero");
    assert.equal(url.searchParams.get("delayMs"), "250");
  });

  test("drops undefined query values", () => {
    const url = new URL(buildUrl("/accounts", { scenario: undefined, fail: undefined }));
    assert.equal(url.search, "");
  });

  test("escapes a path segment", () => {
    assert.ok(buildUrl(`/portfolios/${encodeURIComponent("a b")}`).endsWith("/portfolios/a%20b"));
  });
});

describe("getJson success", () => {
  test("returns the decoded body", async () => {
    stubFetch(() => jsonResponse(200, { CADtoUSD: 0.73 }));
    const body = await getJson<{ CADtoUSD: number }>("/exchange-rate");
    assert.deepEqual(body, { CADtoUSD: 0.73 });
  });

  test("sends GET and asks for JSON", async () => {
    const spy = stubFetch(() => jsonResponse(200, {}));
    await getJson("/health");
    const init = initOf(spy);
    assert.equal(init.method, "GET");
    assert.deepEqual(init.headers, { Accept: "application/json" });
  });
});

describe("getJson failure", () => {
  test("maps a 404 to an http ApiError carrying the API code and message", async () => {
    stubFetch(() =>
      jsonResponse(404, { error: "not_found", message: "Unknown route, portfolio or holding." })
    );
    const error = await getJson("/portfolios/NOPE").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "http");
    assert.equal(error.status, 404);
    assert.equal(error.code, "not_found");
    assert.equal(error.message, "Unknown route, portfolio or holding.");
  });

  test("maps a 503 from fail=true", async () => {
    stubFetch(() =>
      jsonResponse(503, { error: "unavailable", message: "Simulated network failure." })
    );
    const error = await getJson("/accounts", { query: { fail: true } }).catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.status, 503);
    assert.equal(error.code, "unavailable");
  });

  test("maps a 400 invalid scenario", async () => {
    stubFetch(() =>
      jsonResponse(400, { error: "invalid_scenario", message: "Use a scenario from /scenarios." })
    );
    const error = await getJson("/accounts", { query: { scenario: "bogus" } }).catch(
      (e: unknown) => e
    );
    assert.ok(isApiError(error));
    assert.equal(error.code, "invalid_scenario");
  });

  test("still fails cleanly when an error body is not JSON", async () => {
    stubFetch(() => new Response("<html>502</html>", { status: 502 }));
    const error = await getJson("/accounts").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "http");
    assert.equal(error.status, 502);
    assert.equal(error.message, "Request failed with status 502.");
  });

  test("reports a parse error when a successful body is not JSON", async () => {
    stubFetch(() => new Response("not json", { status: 200 }));
    const error = await getJson("/accounts").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "parse");
  });

  test("reports a network error when the server is unreachable", async () => {
    stubFetch(() => {
      throw new TypeError("fetch failed");
    });
    const error = await getJson("/accounts").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "network");
    assert.ok(error.message.includes(API_BASE_URL));
  });

  test("reports a timeout when the request runs out of time", async () => {
    stubFetch(() => {
      throw Object.assign(new Error("timed out"), { name: "TimeoutError" });
    });
    const error = await getJson("/accounts").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "timeout");
  });

  test("reports an abort when the caller cancels", async () => {
    const controller = new AbortController();
    controller.abort();
    stubFetch(() => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    const error = await getJson("/accounts", { signal: controller.signal }).catch(
      (e: unknown) => e
    );
    assert.ok(isApiError(error));
    assert.equal(error.kind, "aborted");
  });

  test("passes an abort signal through to fetch", async () => {
    const controller = new AbortController();
    const spy = stubFetch(() => jsonResponse(200, {}));
    await getJson("/health", { signal: controller.signal });
    expect(initOf(spy).signal).toBeInstanceOf(AbortSignal);
  });
});

describe("toApiError", () => {
  test("passes an ApiError through unchanged", () => {
    const original = new ApiError("http", "nope", "u", 500, "boom");
    assert.equal(toApiError(original), original);
  });

  test("wraps anything else", () => {
    const wrapped = toApiError(new Error("odd"));
    assert.ok(isApiError(wrapped));
    assert.equal(wrapped.kind, "network");
    assert.equal(wrapped.message, "odd");
  });
});
