"use client";

import { TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

type Co2Point = {
  date: Date;
  year: number;
  month: number;
  decade: number;
  scaledDate: number;
  value: number;
};

type Series = {
  decade: number;
  points: Co2Point[];
  color: string;
};

type ActiveInfo = {
  point: Co2Point;
  decade: number;
};

const DATA_URL =
  "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/co2-concentration.csv";

const MAGMA_STOPS = [
  "#000004",
  "#1b0c41",
  "#4a0c6b",
  "#781c6d",
  "#a52c60",
  "#cf4446",
  "#ed6925",
  "#fb9b06",
  "#f7d13d",
  "#fcfdbf",
];

const formatMonth = (month: number) =>
  new Date(2020, month - 1, 1).toLocaleString("en-US", { month: "short" });

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

const getMagmaColor = (index: number, total: number) => {
  if (total <= 1) return MAGMA_STOPS[MAGMA_STOPS.length - 1];
  const t = index / (total - 1);
  const scaled = t * (MAGMA_STOPS.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(MAGMA_STOPS.length - 1, lower + 1);
  const localT = scaled - lower;
  const start = hexToRgb(MAGMA_STOPS[lower]);
  const end = hexToRgb(MAGMA_STOPS[upper]);
  return rgbToHex(
    Math.round(lerp(start.r, end.r, localT)),
    Math.round(lerp(start.g, end.g, localT)),
    Math.round(lerp(start.b, end.b, localT)),
  );
};

const parseCsv = (raw: string) => {
  const lines = raw.trim().split("\n");
  const header = lines[0]?.split(",") ?? [];
  const dateIndex = header.findIndex((col) => col.toLowerCase() === "date");
  const co2Index = header.findIndex((col) =>
    col.toLowerCase().startsWith("co2"),
  );

  return lines.slice(1).flatMap((line) => {
    const parts = line.split(",");
    const dateValue = parts[dateIndex];
    const co2Value = parts[co2Index];
    if (!dateValue || !co2Value) return [];
    const date = new Date(dateValue);
    const value = Number.parseFloat(co2Value);
    if (Number.isNaN(value)) return [];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const decade = Math.floor(year / 10) * 10;
    const scaledDate = (year % 10) + month / 12;
    return [
      {
        date,
        year,
        month,
        decade,
        scaledDate,
        value,
      },
    ];
  });
};

const groupByDecade = (points: Co2Point[]) => {
  const map = new Map<number, Co2Point[]>();
  points.forEach((point) => {
    const bucket = map.get(point.decade) ?? [];
    bucket.push(point);
    map.set(point.decade, bucket);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([decade, items], index, all) => ({
      decade,
      points: items.sort((a, b) => a.scaledDate - b.scaledDate),
      color: getMagmaColor(index, all.length),
    }));
};

const getNiceTicks = (min: number, max: number, targetCount: number) => {
  const range = max - min;
  const roughStep = range / Math.max(1, targetCount - 1);
  const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const stepOptions = [1, 2, 5, 10];
  const step =
    stepOptions
      .map((option) => option * pow10)
      .find((option) => range / option <= targetCount) ?? pow10;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(2)));
  }
  return ticks;
};

const useElementSize = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
};

export function Visualization() {
  const [series, setSeries] = useState<Series[]>([]);
  const [activeInfo, setActiveInfo] = useState<ActiveInfo | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const { ref: chartRef, size } = useElementSize();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const response = await fetch(DATA_URL);
        const text = await response.text();
        const points = parseCsv(text);
        const grouped = groupByDecade(points);
        if (!isMounted) return;
        setSeries(grouped);
        const latest = grouped[grouped.length - 1];
        const latestPoint = latest?.points[latest.points.length - 1];
        if (latestPoint) {
          setActiveInfo({ point: latestPoint, decade: latest.decade });
        }
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const { yMin, yMax, yTicks } = useMemo(() => {
    if (series.length === 0) {
      return { yMin: 0, yMax: 1, yTicks: [] as number[] };
    }
    const values = series.flatMap((line) => line.points.map((p) => p.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.05;
    const yMin = min - padding;
    const yMax = max + padding;
    const yTicks = getNiceTicks(yMin, yMax, 5);
    return { yMin, yMax, yTicks };
  }, [series]);

  const chartWidth = Math.max(size.width, 240);
  const chartHeight = Math.max(size.height, 240);
  const margin = { top: 18, right: 18, bottom: 40, left: 48 };
  const plotWidth = Math.max(chartWidth - margin.left - margin.right, 1);
  const plotHeight = Math.max(chartHeight - margin.top - margin.bottom, 1);

  const scaleX = (value: number) => margin.left + (value / 10) * plotWidth;
  const scaleY = (value: number) =>
    margin.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

  const xTicks = [0, 2, 4, 6, 8, 10];

  const getClosestPoint = (points: Co2Point[], targetX: number): Co2Point => {
    let left = 0;
    let right = points.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (points[mid].scaledDate < targetX) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const candidate = points[left];
    const prev = points[Math.max(0, left - 1)];
    if (!prev) return candidate;
    return Math.abs(prev.scaledDate - targetX) <
      Math.abs(candidate.scaledDate - targetX)
      ? prev
      : candidate;
  };

  const handlePointer = (event: PointerEvent<SVGRectElement>) => {
    if (!series.length || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const withinX = x >= margin.left && x <= margin.left + plotWidth;
    const withinY = y >= margin.top && y <= margin.top + plotHeight;
    if (!withinX || !withinY) return;
    const scaledDate = ((x - margin.left) / plotWidth) * 10;
    const value = yMax - ((y - margin.top) / plotHeight) * (yMax - yMin);
    let closest: ActiveInfo | null = null;
    let smallestDistance = Number.POSITIVE_INFINITY;
    series.forEach((line) => {
      const point = getClosestPoint(line.points, scaledDate);
      const distance = Math.abs(point.value - value);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closest = { point, decade: line.decade };
      }
    });
    if (closest) {
      setActiveInfo(closest);
    }
  };

  const activeDecade = activeInfo?.decade;
  const firstSeries = series[0];
  const lastSeries = series[series.length - 1];

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#f7f5ef,_#f2efe6_45%,_#e9e4d7_100%)] text-zinc-900">
      <div className="flex h-full w-full flex-col gap-4 px-4 py-5">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_16px_40px_-28px_rgba(30,30,30,0.6)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                CO2 Concentration
              </div>
              <h1 className="mt-2 text-xl font-semibold text-zinc-900">
                Seasonal swings are rising decade over decade
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Drag across the chart to reveal each decade’s monthly CO2
                values.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50/80 px-3 py-2 text-right text-xs text-orange-700">
              <div className="font-semibold">Year into decade</div>
              <div className="text-[11px] text-orange-500">0 → 10</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-700">
            {activeInfo ? (
              <>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Active point
                  </div>
                  <div className="text-base font-semibold text-zinc-900">
                    {formatMonth(activeInfo.point.month)}{" "}
                    {activeInfo.point.year}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    CO2 (ppm)
                  </div>
                  <div className="text-base font-semibold text-zinc-900">
                    {activeInfo.point.value.toFixed(2)}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-500">
                Touch the chart to inspect a decade.
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div
            ref={chartRef}
            className="relative h-full min-h-[320px] w-full rounded-[28px] border border-white/70 bg-white/60 shadow-[0_18px_40px_-26px_rgba(35,35,35,0.55)] backdrop-blur"
          >
            {status !== "ready" ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                {status === "loading"
                  ? "Loading CO2 data…"
                  : "Unable to load data."}
              </div>
            ) : (
              <svg
                className="h-full w-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                <rect
                  x={margin.left}
                  y={margin.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="url(#chart-wash)"
                  rx={18}
                />
                <defs>
                  <linearGradient id="chart-wash" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fff7ed" />
                    <stop offset="100%" stopColor="#f5f5f4" />
                  </linearGradient>
                </defs>

                {yTicks.map((tick) => (
                  <g key={`y-${tick}`}>
                    <line
                      x1={margin.left}
                      x2={margin.left + plotWidth}
                      y1={scaleY(tick)}
                      y2={scaleY(tick)}
                      stroke="#e7e3d9"
                      strokeDasharray="4 6"
                    />
                    <text
                      x={margin.left - 10}
                      y={scaleY(tick) + 4}
                      textAnchor="end"
                      className="fill-zinc-500 text-[11px] font-medium"
                    >
                      {tick.toFixed(0)}
                    </text>
                  </g>
                ))}

                {xTicks.map((tick) => (
                  <g key={`x-${tick}`}>
                    <line
                      x1={scaleX(tick)}
                      x2={scaleX(tick)}
                      y1={margin.top + plotHeight}
                      y2={margin.top + plotHeight + 6}
                      stroke="#d7d3ca"
                    />
                    <text
                      x={scaleX(tick)}
                      y={margin.top + plotHeight + 22}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[11px] font-medium"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {series.map((line) => {
                  const path = line.points
                    .map((point, index) => {
                      const x = scaleX(point.scaledDate);
                      const y = scaleY(point.value);
                      return `${index === 0 ? "M" : "L"}${x},${y}`;
                    })
                    .join(" ");
                  const isActive = activeDecade === line.decade;
                  return (
                    <path
                      key={line.decade}
                      d={path}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={isActive ? 3.2 : 1.4}
                      strokeOpacity={isActive ? 0.95 : 0.45}
                    />
                  );
                })}

                {firstSeries && (
                  <text
                    x={scaleX(firstSeries.points[0].scaledDate)}
                    y={scaleY(firstSeries.points[0].value) - 8}
                    textAnchor="start"
                    className="fill-zinc-600 text-[11px] font-semibold"
                  >
                    {firstSeries.decade}
                  </text>
                )}
                {lastSeries && (
                  <text
                    x={scaleX(
                      lastSeries.points[lastSeries.points.length - 1]
                        .scaledDate,
                    )}
                    y={
                      scaleY(
                        lastSeries.points[lastSeries.points.length - 1].value,
                      ) - 8
                    }
                    textAnchor="end"
                    className="fill-zinc-700 text-[11px] font-semibold"
                  >
                    {lastSeries.decade}
                  </text>
                )}

                {activeInfo && (
                  <g>
                    <circle
                      cx={scaleX(activeInfo.point.scaledDate)}
                      cy={scaleY(activeInfo.point.value)}
                      r={5}
                      fill="#111827"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  </g>
                )}

                <rect
                  x={margin.left}
                  y={margin.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="transparent"
                  onPointerDown={handlePointer}
                  onPointerMove={handlePointer}
                  onPointerLeave={() => undefined}
                />

                <text
                  x={margin.left}
                  y={margin.top - 6}
                  className="fill-zinc-500 text-[11px] font-medium"
                >
                  CO2 concentration (ppm)
                </text>
                <text
                  x={margin.left + plotWidth}
                  y={margin.top + plotHeight + 34}
                  textAnchor="end"
                  className="fill-zinc-500 text-[11px] font-medium"
                >
                  Year into decade
                </text>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
