"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type RawDatum = {
  year: number;
  age: number;
  sex: number;
  people: number;
};

type BinRow = {
  ageStart: number;
  ageLabel: string;
  male: number;
  female: number;
  maleDisplay: number;
  femaleDisplay: number;
};

const DATA_URL =
  "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json";
const BIN_SIZE = 5;
const MAX_BIN = 90;

function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size } as const;
}

function formatCompact(value: number) {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    const formatted = (absValue / 1_000_000).toFixed(1);
    return `${formatted.replace(/\.0$/, "")}M`;
  }
  if (absValue >= 1_000) {
    const formatted = (absValue / 1_000).toFixed(1);
    return `${formatted.replace(/\.0$/, "")}K`;
  }
  return absValue.toString();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.abs(value));
}

function niceMax(value: number) {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const normalized = value / magnitude;
  let nice = 10;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  return nice * magnitude;
}

function buildBins(rows: RawDatum[]) {
  const bins = new Map<
    number,
    { ageStart: number; male: number; female: number }
  >();
  for (const row of rows) {
    const ageStart =
      row.age >= MAX_BIN ? MAX_BIN : Math.floor(row.age / BIN_SIZE) * BIN_SIZE;
    const current = bins.get(ageStart) ?? { ageStart, male: 0, female: 0 };
    if (row.sex === 1) {
      current.male += row.people;
    } else {
      current.female += row.people;
    }
    bins.set(ageStart, current);
  }

  return Array.from(bins.values())
    .sort((a, b) => a.ageStart - b.ageStart)
    .map((bin) => ({
      ageStart: bin.ageStart,
      ageLabel:
        bin.ageStart >= MAX_BIN
          ? "90+"
          : `${bin.ageStart}-${bin.ageStart + BIN_SIZE - 1}`,
      male: bin.male,
      female: -bin.female,
      maleDisplay: bin.male,
      femaleDisplay: bin.female,
    }));
}

export function Visualization() {
  const [rawData, setRawData] = useState<RawDatum[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [year, setYear] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const { ref: chartRef, size } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetch(DATA_URL)
      .then((response) => response.json())
      .then((data: RawDatum[]) => {
        if (!active) return;
        setRawData(data);
        setStatus("idle");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const byYear = useMemo(() => {
    const map = new Map<number, RawDatum[]>();
    for (const row of rawData) {
      const list = map.get(row.year) ?? [];
      list.push(row);
      map.set(row.year, list);
    }
    return map;
  }, [rawData]);

  const years = useMemo(
    () => Array.from(byYear.keys()).sort((a, b) => a - b),
    [byYear],
  );

  useEffect(() => {
    if (year === null && years.length > 0) {
      setYear(years[years.length - 1]);
    }
  }, [year, years]);

  useEffect(() => {
    if (!isPlaying || years.length === 0) return;
    const id = window.setInterval(() => {
      setYear((current) => {
        if (current === null) return years[0];
        const index = years.indexOf(current);
        const next =
          index >= 0 && index < years.length - 1 ? years[index + 1] : years[0];
        return next;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [isPlaying, years]);

  const bins = useMemo(() => {
    if (year === null) return [] as BinRow[];
    return buildBins(byYear.get(year) ?? []);
  }, [byYear, year]);

  const totals = useMemo(() => {
    let male = 0;
    let female = 0;
    for (const row of bins) {
      male += row.maleDisplay;
      female += row.femaleDisplay;
    }
    return { male, female, total: male + female };
  }, [bins]);

  const selectedBin = useMemo(() => {
    if (!selectedAge) return null;
    return bins.find((bin) => bin.ageLabel === selectedAge) ?? null;
  }, [bins, selectedAge]);

  const chartWidth = size.width;
  const chartHeight = size.height;
  const paddingX = 18;
  const paddingTop = 12;
  const paddingBottom = 38;
  const usableHeight = Math.max(chartHeight - paddingTop - paddingBottom, 0);
  const rowHeight = bins.length > 0 ? usableHeight / bins.length : 0;
  const barHeight = Math.max(rowHeight * 0.72, 8);
  const midX = chartWidth / 2;
  const halfWidth = Math.max((chartWidth - paddingX * 2) / 2 - 8, 40);
  const maxValue = niceMax(
    bins.reduce(
      (max, bin) => Math.max(max, bin.maleDisplay, bin.femaleDisplay),
      0,
    ),
  );
  const ticks = [0, maxValue / 3, (2 * maxValue) / 3, maxValue];

  const handlePrev = () => {
    if (!year || years.length === 0) return;
    const index = years.indexOf(year);
    const nextIndex = index > 0 ? index - 1 : years.length - 1;
    setYear(years[nextIndex]);
  };

  const handleNext = () => {
    if (!year || years.length === 0) return;
    const index = years.indexOf(year);
    const nextIndex = index >= 0 && index < years.length - 1 ? index + 1 : 0;
    setYear(years[nextIndex]);
  };

  const handleReset = () => {
    if (years.length === 0) return;
    setYear(years[years.length - 1]);
    setIsPlaying(false);
  };

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.35),_rgba(3,7,18,0.95))] text-white">
      <div className="flex h-full flex-col">
        <header className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                US Population
              </p>
              <h1 className="text-2xl font-semibold">Population Pyramid</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-300">Year</p>
              <p className="text-2xl font-semibold tabular-nums">
                {year ?? "—"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-200">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Total {formatNumber(totals.total)}
            </span>
            <span className="rounded-full bg-sky-400/20 px-3 py-1">
              Male {formatNumber(totals.male)}
            </span>
            <span className="rounded-full bg-pink-400/20 px-3 py-1">
              Female {formatNumber(totals.female)}
            </span>
          </div>
          {selectedBin && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300">
                  Age
                </span>
                <span className="text-base font-semibold">
                  {selectedBin.ageLabel}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-sky-200">
                  Male {formatNumber(selectedBin.maleDisplay)}
                </span>
                <span className="text-pink-200">
                  Female {formatNumber(selectedBin.femaleDisplay)}
                </span>
                <span className="text-slate-200">
                  Total{" "}
                  {formatNumber(
                    selectedBin.maleDisplay + selectedBin.femaleDisplay,
                  )}
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 px-4 pb-6 pt-4">
          <div
            ref={chartRef}
            className="relative h-full w-full rounded-[28px] border border-white/10 bg-white/5 shadow-[0_40px_80px_-45px_rgba(14,116,144,0.8)]"
          >
            {status === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-200">
                Loading population data…
              </div>
            )}
            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-200">
                <p>We couldn't load the population dataset.</p>
                <p className="text-xs text-slate-400">
                  Connect to the internet to fetch the data.
                </p>
              </div>
            )}
            {status === "idle" &&
              bins.length > 0 &&
              chartWidth > 0 &&
              chartHeight > 0 && (
                <svg
                  width={chartWidth}
                  height={chartHeight}
                  className="touch-manipulation"
                  role="img"
                  aria-labelledby="population-pyramid-title"
                >
                  <title id="population-pyramid-title">
                    Population pyramid by age group
                  </title>
                  <rect
                    x={0}
                    y={0}
                    width={chartWidth}
                    height={chartHeight}
                    rx={28}
                    fill="transparent"
                  />
                  <g>
                    {ticks.map((tick) => {
                      const offset = (tick / maxValue) * halfWidth;
                      const leftX = midX - offset;
                      const rightX = midX + offset;
                      return (
                        <g key={`grid-${tick}`}>
                          <line
                            x1={leftX}
                            x2={leftX}
                            y1={paddingTop}
                            y2={chartHeight - paddingBottom + 8}
                            stroke="rgba(148,163,184,0.25)"
                            strokeDasharray="4 6"
                          />
                          {tick > 0 && (
                            <line
                              x1={rightX}
                              x2={rightX}
                              y1={paddingTop}
                              y2={chartHeight - paddingBottom + 8}
                              stroke="rgba(148,163,184,0.25)"
                              strokeDasharray="4 6"
                            />
                          )}
                        </g>
                      );
                    })}
                    <line
                      x1={midX}
                      x2={midX}
                      y1={paddingTop - 4}
                      y2={chartHeight - paddingBottom + 12}
                      stroke="rgba(226,232,240,0.6)"
                    />
                  </g>

                  <g>
                    {bins.map((bin, index) => {
                      const y =
                        paddingTop +
                        index * rowHeight +
                        (rowHeight - barHeight) / 2;
                      const maleWidth =
                        (bin.maleDisplay / maxValue) * halfWidth;
                      const femaleWidth =
                        (Math.abs(bin.female) / maxValue) * halfWidth;
                      return (
                        <g key={bin.ageLabel}>
                          <rect
                            x={midX - femaleWidth}
                            y={y}
                            width={femaleWidth}
                            height={barHeight}
                            rx={6}
                            fill="rgba(236,72,153,0.9)"
                            onPointerDown={() => setSelectedAge(bin.ageLabel)}
                          />
                          <rect
                            x={midX}
                            y={y}
                            width={maleWidth}
                            height={barHeight}
                            rx={6}
                            fill="rgba(56,189,248,0.9)"
                            onPointerDown={() => setSelectedAge(bin.ageLabel)}
                          />
                          <rect
                            x={midX - 32}
                            y={y + barHeight / 2 - 8}
                            width={64}
                            height={16}
                            rx={8}
                            fill="rgba(15,23,42,0.85)"
                            stroke="rgba(148,163,184,0.35)"
                          />
                          <text
                            x={midX}
                            y={y + barHeight / 2 + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fill="rgba(226,232,240,0.9)"
                            fontFamily="ui-sans-serif, system-ui"
                          >
                            {bin.ageLabel}
                          </text>
                        </g>
                      );
                    })}
                  </g>

                  <g>
                    {ticks.map((tick) => {
                      const offset = (tick / maxValue) * halfWidth;
                      const label = formatCompact(tick);
                      return (
                        <g key={`label-${tick}`}>
                          <text
                            x={midX - offset}
                            y={chartHeight - 12}
                            textAnchor="middle"
                            fontSize={10}
                            fill="rgba(148,163,184,0.9)"
                          >
                            {label}
                          </text>
                          {tick > 0 && (
                            <text
                              x={midX + offset}
                              y={chartHeight - 12}
                              textAnchor="middle"
                              fontSize={10}
                              fill="rgba(148,163,184,0.9)"
                            >
                              {label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    <text
                      x={midX}
                      y={chartHeight - 26}
                      textAnchor="middle"
                      fontSize={11}
                      fill="rgba(226,232,240,0.8)"
                    >
                      Population (mirror scale)
                    </text>
                  </g>

                  <g>
                    <text
                      x={paddingX}
                      y={paddingTop - 4}
                      textAnchor="start"
                      fontSize={11}
                      fill="rgba(148,163,184,0.9)"
                    >
                      Female
                    </text>
                    <text
                      x={chartWidth - paddingX}
                      y={paddingTop - 4}
                      textAnchor="end"
                      fontSize={11}
                      fill="rgba(148,163,184,0.9)"
                    >
                      Male
                    </text>
                  </g>
                </svg>
              )}
          </div>
        </div>

        <div className="px-4 pb-6">
          <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
                onClick={() => setIsPlaying((value) => !value)}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
                onClick={handleNext}
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
                onClick={handleReset}
              >
                <RefreshCcw size={18} />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{years[0] ?? "—"}</span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {year ?? "—"}
                </span>
                <span>{years[years.length - 1] ?? "—"}</span>
              </div>
              <input
                type="range"
                min={years[0] ?? 0}
                max={years[years.length - 1] ?? 0}
                step={10}
                value={year ?? 0}
                onChange={(event) => setYear(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, #67e8f9, #0ea5e9);
          border: 3px solid rgba(15, 23, 42, 0.8);
          box-shadow: 0 8px 20px rgba(14, 116, 144, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, #67e8f9, #0ea5e9);
          border: 3px solid rgba(15, 23, 42, 0.8);
          box-shadow: 0 8px 20px rgba(14, 116, 144, 0.5);
        }
      `}</style>
    </div>
  );
}
