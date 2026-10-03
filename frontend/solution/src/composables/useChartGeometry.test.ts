import { describe, test } from "vitest";
import assert from "node:assert/strict";
import {
  buildChartGeometry,
  findNearestIndex,
  findRuns,
  formatAxisDate,
  formatAxisValue,
  formatFullDate,
  niceScale,
} from "@/composables/useChartGeometry";
import type { ChartSeriesPoint } from "@/types";

const SIZE = { width: 800, height: 300 };

// Build a run of consecutive daily points.
function daily(count: number, start = "2026-01-01", value = 1000): ChartSeriesPoint[] {
  const first = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(first + i * 86400000).toISOString().slice(0, 10),
    value: value + i,
  }));
}

describe("niceScale", () => {
  test("rounds the axis to clean steps", () => {
    const scale = niceScale(55852.57, 66923.77, 4);
    assert.ok(scale.min <= 55852.57);
    assert.ok(scale.max >= 66923.77);
    const step = scale.values[1] - scale.values[0];
    for (let i = 1; i < scale.values.length; i += 1) {
      assert.ok(Math.abs(scale.values[i] - scale.values[i - 1] - step) < 1e-6);
    }
  });

  test("gives a flat non zero series a band around it", () => {
    const scale = niceScale(65680, 65680, 4);
    assert.ok(scale.min < 65680);
    assert.ok(scale.max > 65680);
  });

  test("gives an all zero series a zero to one band", () => {
    const scale = niceScale(0, 0, 4);
    assert.equal(scale.min, 0);
    assert.ok(scale.max > 0);
    assert.ok(Number.isFinite(scale.max));
  });
});

describe("formatAxisValue", () => {
  test("shortens large figures", () => {
    assert.equal(formatAxisValue(65680), "65.7k");
    assert.equal(formatAxisValue(18472650934), "18.5B");
    assert.equal(formatAxisValue(2500000), "2.5M");
    assert.equal(formatAxisValue(0), "0");
  });
});

describe("date formatting", () => {
  test("uses UTC, so a label never shifts by a day", () => {
    assert.ok(formatFullDate("2026-01-01").includes("1"));
    assert.ok(formatFullDate("2026-01-01").includes("2026"));
    assert.ok(!formatFullDate("2026-01-01").includes("31"));
  });

  test("shows the month on a long span and the day on a short one", () => {
    assert.match(formatAxisDate("2026-03-14", 400), /Mar/);
    assert.match(formatAxisDate("2026-03-14", 30), /14/);
  });
});

describe("findRuns", () => {
  test("returns one run for consecutive dates", () => {
    assert.equal(findRuns(daily(10)).length, 1);
  });

  test("splits where dates are missing", () => {
    const series: ChartSeriesPoint[] = [
      { date: "2026-01-01", value: 1 },
      { date: "2026-01-02", value: 2 },
      { date: "2026-01-09", value: 3 },
      { date: "2026-01-10", value: 4 },
    ];
    const runs = findRuns(series);
    assert.equal(runs.length, 2);
    assert.deepEqual(runs[0], [0, 1]);
    assert.deepEqual(runs[1], [2, 3]);
  });

  test("handles an empty series and a single point", () => {
    assert.deepEqual(findRuns([]), []);
    assert.deepEqual(findRuns(daily(1)), [[0]]);
  });

  test("treats evenly spaced weekly data as one run", () => {
    const weekly: ChartSeriesPoint[] = ["2026-01-01", "2026-01-08", "2026-01-15"].map(
      (date, i) => ({ date, value: i })
    );
    assert.equal(findRuns(weekly).length, 1);
  });
});

describe("buildChartGeometry", () => {
  test("returns an empty geometry for no data", () => {
    const geometry = buildChartGeometry([], SIZE);
    assert.deepEqual(geometry.points, []);
    assert.deepEqual(geometry.linePaths, []);
    assert.deepEqual(geometry.xTicks, []);
  });

  test("places every point inside the plot", () => {
    const geometry = buildChartGeometry(daily(401), SIZE);
    assert.equal(geometry.points.length, 401);
    for (const point of geometry.points) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), "coordinates are numbers");
      assert.ok(point.x >= geometry.plot.x - 0.01);
      assert.ok(point.x <= geometry.plot.x + geometry.plot.width + 0.01);
      assert.ok(point.y >= geometry.plot.y - 0.01);
      assert.ok(point.y <= geometry.plot.y + geometry.plot.height + 0.01);
    }
  });

  test("centres a single point and draws no line", () => {
    const geometry = buildChartGeometry(daily(1), SIZE);
    assert.equal(geometry.points.length, 1);
    assert.equal(geometry.linePaths.length, 0);
    assert.ok(Number.isFinite(geometry.points[0].x));
    assert.equal(geometry.points[0].x, geometry.plot.x + geometry.plot.width / 2);
  });

  test("draws a line for two points", () => {
    const geometry = buildChartGeometry(daily(2), SIZE);
    assert.equal(geometry.linePaths.length, 1);
    assert.equal(geometry.xTicks.length, 2);
  });

  test("breaks the line across gaps instead of interpolating", () => {
    const series: ChartSeriesPoint[] = [
      { date: "2026-01-01", value: 10 },
      { date: "2026-01-02", value: 11 },
      { date: "2026-01-20", value: 12 },
      { date: "2026-01-21", value: 13 },
    ];
    const geometry = buildChartGeometry(series, SIZE);
    assert.equal(geometry.linePaths.length, 2, "one path per unbroken run");
    assert.equal(geometry.gaps.length, 1, "the missing stretch is shaded");
    assert.ok(geometry.gaps[0].width > 0);
  });

  test("survives an all zero series", () => {
    const flat: ChartSeriesPoint[] = daily(401).map((point) => ({ ...point, value: 0 }));
    const geometry = buildChartGeometry(flat, SIZE);
    for (const point of geometry.points) {
      assert.ok(Number.isFinite(point.y));
    }
    assert.ok(geometry.yTicks.length > 0);
    for (const tick of geometry.yTicks) {
      assert.ok(Number.isFinite(tick.offset));
    }
  });

  test("labels every x tick with a real date from the series", () => {
    const series = daily(401);
    const dates = new Set(series.map((point) => point.date));
    const geometry = buildChartGeometry(series, SIZE);
    assert.ok(geometry.xTicks.length >= 2);
    for (const tick of geometry.xTicks) {
      assert.ok(dates.has(tick.key), `${tick.key} is a date in the series`);
    }
  });

  test("keeps the x axis band inside the height", () => {
    const geometry = buildChartGeometry(daily(50), SIZE);
    assert.ok(geometry.plot.y + geometry.plot.height < SIZE.height);
  });
});

describe("findNearestIndex", () => {
  test("snaps to the closest point", () => {
    const geometry = buildChartGeometry(daily(11), SIZE);
    const third = geometry.points[3];
    assert.equal(findNearestIndex(geometry.points, third.x + 2), 3);
    assert.equal(findNearestIndex(geometry.points, geometry.plot.x - 500), 0);
    assert.equal(findNearestIndex(geometry.points, geometry.plot.x + 5000), 10);
  });

  test("returns null with no points", () => {
    assert.equal(findNearestIndex([], 10), null);
  });
});
