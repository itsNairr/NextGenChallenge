// Summary: Integration tests running real HTTP requests against the local mock server.
import { describe, test } from "vitest";
import assert from "node:assert/strict";
import { getExchangeRate, getPortfolio } from "@/api/api";
import { isApiError } from "@/api/http";
import { buildSummaryMetrics } from "@/composables/usePortfolioSummary";
import { buildChartGeometry, findRuns } from "@/composables/useChartGeometry";
import { convertFromCad } from "@/composables/useCurrency";

// These tests call the real mock API on http://localhost:4000.
// `npm test` excludes this file so the default suite stays hermetic.
// Run `node frontend/mock-server.mjs`, then `npm run test:live`.
describe("live mock API", () => {
  test("exchange rate", async () => {
    const rate = await getExchangeRate();
    assert.ok(rate.CADtoUSD > 0);
  });

  test("summary tiles per scenario", async () => {
    for (const scenario of ["default", "negative", "zero", "large-value", "empty"] as const) {
      const res = await getPortfolio("P-9001", { scenario });
      const metrics = buildSummaryMetrics({
        summary: res.portfolio,
        currency: "CAD",
        convertAmount: (a) => convertFromCad(a, "CAD"),
      });
      assert.equal(metrics.length, 4);
    }
  });

  test("usd conversion uses the live rate", async () => {
    const { CADtoUSD } = await getExchangeRate();
    const res = await getPortfolio("P-9001");
    const metrics = buildSummaryMetrics({
      summary: res.portfolio,
      currency: "USD",
      convertAmount: (a) => convertFromCad(a, "USD", CADtoUSD),
    });
    assert.ok(metrics[0].value.includes("$"));
  });

  test("fail=true gives a 503 ApiError", async () => {
    const error = await getPortfolio("P-9001", { fail: true }).catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.status, 503);
    assert.equal(error.code, "unavailable");
  });

  test("unknown account gives a 404 ApiError", async () => {
    const error = await getPortfolio("P-0000").catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.status, 404);
  });

  test("delayMs actually delays", async () => {
    const start = Date.now();
    await getPortfolio("P-9001", { delayMs: 800 });
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 750, `expected a delay, got ${elapsed}ms`);
  });

  test("caller abort is reported as aborted", async () => {
    const controller = new AbortController();
    const promise = getPortfolio("P-9001", { delayMs: 3000, signal: controller.signal });
    controller.abort();
    const error = await promise.catch((e: unknown) => e);
    assert.ok(isApiError(error));
    assert.equal(error.kind, "aborted");
  });

  test("chart geometry holds for every history shape", async () => {
    const cases = [
      ["default", 401],
      ["gaps", 230],
      ["one-point", 1],
      ["two-points", 2],
      ["short-history", 60],
      ["empty", 401],
    ] as const;

    for (const [scenario, expectedPoints] of cases) {
      const res = await getPortfolio("P-9001", { scenario });
      const series = res.performanceHistory.map((point) => ({
        date: point.date,
        value: point.marketValue,
      }));
      assert.equal(series.length, expectedPoints, `${scenario} point count`);

      const geometry = buildChartGeometry(series, { width: 800, height: 300 });
      const runs = findRuns(series);

      // Every coordinate must be a real number, or the SVG breaks.
      for (const point of geometry.points) {
        assert.ok(
          Number.isFinite(point.x) && Number.isFinite(point.y),
          `${scenario} produced a non finite coordinate`
        );
      }
      for (const tick of geometry.yTicks) {
        assert.ok(Number.isFinite(tick.offset), `${scenario} y tick is not finite`);
      }
      assert.ok(!geometry.linePaths.join(" ").includes("NaN"), `${scenario} path has NaN`);

      // A gap must break the line rather than draw across it.
      assert.equal(geometry.linePaths.length, series.length < 2 ? 0 : runs.length);
      assert.equal(geometry.gaps.length, Math.max(runs.length - 1, 0));

      if (scenario === "gaps") {
        assert.ok(runs.length > 1, "the gaps dataset must break into runs");
      }
      if (scenario === "default") {
        assert.equal(runs.length, 1, "the default dataset is unbroken");
      }
    }
  });
});
