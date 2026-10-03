// Summary: Unit tests verifying API query parameters, scenario handling, and error mapping.
import { afterEach, describe, test, vi } from "vitest";
import assert from "node:assert/strict";
import { getExchangeRate, getPortfolio, PORTFOLIO_SCENARIOS } from "@/api/api";
import { isApiError } from "@/api/http";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Capture the URL each call requests and answer with a fixed body.
function stubFetch(body: unknown, status = 200) {
  const spy = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    )
  );
  vi.stubGlobal("fetch", spy);
  return spy;
}

// Build a portfolio body that satisfies the contract.
function portfolioBody() {
  return {
    asOf: "2026-10-03T17:44:23.991Z",
    portfolio: {
      portfolioId: "P-9001",
      accountId: "P-9001",
      clientId: "abc123",
      label: "Taxable Brokerage",
      currency: "CAD",
      totalMarketValue: 65680,
      dayChangeAmount: 397.25,
      dayChangePercent: 0.61,
      totalReturnSinceInception: 0.187,
    },
    holdings: [],
    allocation: [],
    performanceHistory: [],
  };
}

// Read the URL of the first fetch call.
function calledUrl(spy: ReturnType<typeof stubFetch>): URL {
  return new URL(String(spy.mock.calls[0][0]));
}

describe("getPortfolio", () => {
  test("requests the account path and returns the body", async () => {
    const spy = stubFetch(portfolioBody());
    const result = await getPortfolio("P-9001");
    assert.equal(calledUrl(spy).pathname, "/portfolios/P-9001");
    assert.equal(result.portfolio.totalMarketValue, 65680);
  });

  test("passes the scenario and delay through", async () => {
    const spy = stubFetch(portfolioBody());
    await getPortfolio("P-9001", { scenario: "negative", delayMs: 2000 });
    const url = calledUrl(spy);
    assert.equal(url.searchParams.get("scenario"), "negative");
    assert.equal(url.searchParams.get("delayMs"), "2000");
  });

  test("sends fail only when it is on", async () => {
    const off = stubFetch(portfolioBody());
    await getPortfolio("P-9001", { fail: false });
    assert.equal(calledUrl(off).searchParams.has("fail"), false);

    vi.unstubAllGlobals();
    const on = stubFetch(portfolioBody());
    await getPortfolio("P-9001", { fail: true });
    assert.equal(calledUrl(on).searchParams.get("fail"), "true");
  });

  test("escapes the account id", async () => {
    const spy = stubFetch(portfolioBody());
    await getPortfolio("P 9001/../secret");
    assert.equal(calledUrl(spy).pathname, "/portfolios/P%209001%2F..%2Fsecret");
  });

  test("rejects a body that is missing the summary figures", async () => {
    const broken = portfolioBody();
    // @ts-expect-error removing a required field on purpose
    delete broken.portfolio.dayChangePercent;
    stubFetch(broken);
    const error = await getPortfolio("P-9001").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "parse");
  });

  test("rejects a body with no portfolio at all", async () => {
    stubFetch({ asOf: "now" });
    const error = await getPortfolio("P-9001").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "parse");
  });
});

describe("getExchangeRate", () => {
  test("returns the rate", async () => {
    const spy = stubFetch({ CADtoUSD: 0.73 });
    const rate = await getExchangeRate();
    assert.equal(calledUrl(spy).pathname, "/exchange-rate");
    assert.equal(rate.CADtoUSD, 0.73);
  });

  test("rejects a rate that is not a positive number", async () => {
    for (const body of [{ CADtoUSD: 0 }, { CADtoUSD: -1 }, { CADtoUSD: "0.73" }, {}]) {
      vi.unstubAllGlobals();
      stubFetch(body);
      const error = await getExchangeRate().catch((e: unknown) => e);
      assert.ok(isApiError(error), `expected a parse error for ${JSON.stringify(body)}`);
      assert.equal(error.kind, "parse");
    }
  });
});

describe("PORTFOLIO_SCENARIOS", () => {
  test("matches the datasets the mock API documents", () => {
    assert.equal(PORTFOLIO_SCENARIOS.length, 16);
    for (const name of ["default", "empty", "zero", "negative", "large-value"]) {
      assert.ok(PORTFOLIO_SCENARIOS.includes(name as never), `missing ${name}`);
    }
  });
});
