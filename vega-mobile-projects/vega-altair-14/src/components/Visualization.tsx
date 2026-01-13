"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildPopulationSummary,
  fetchPopulationData,
  type PopulationDatum,
} from "@/utils/population";

const formatCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatFull = new Intl.NumberFormat("en-US");

const YEAR_MIN = 1900;
const YEAR_MAX = 2000;
const YEAR_STEP = 10;

function formatAgeLabel(age: number) {
  if (age >= 90) {
    return "90+";
  }
  return `${age}-${age + 4}`;
}

export function Visualization() {
  const [year, setYear] = useState(2000);
  const [rawData, setRawData] = useState<PopulationDatum[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPopulationData()
      .then((data) => {
        if (active) {
          setRawData(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!rawData) {
      return null;
    }
    return buildPopulationSummary(rawData, year);
  }, [rawData, year]);

  const data = summary?.data ?? [];
  const maxValue = summary?.maxValue ?? 1;

  const chartWidth = 320;
  const margin = { top: 12, bottom: 16, left: 14, right: 14 };
  const centerGap = 46;
  const rowHeight = 16;
  const rowGap = 6;
  const chartHeight = data.length
    ? data.length * (rowHeight + rowGap) - rowGap
    : 240;
  const svgHeight = margin.top + chartHeight + margin.bottom;

  const halfWidth = (chartWidth - margin.left - margin.right - centerGap) / 2;
  const centerX = margin.left + halfWidth + centerGap / 2;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              U.S. Population by Age & Sex
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{year}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-sm font-semibold text-slate-800">
              {summary
                ? formatCompact.format(summary.maleTotal + summary.femaleTotal)
                : "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Male
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {summary ? formatCompact.format(summary.maleTotal) : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Female
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {summary ? formatCompact.format(summary.femaleTotal) : "—"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28">
        <div className="rounded-3xl bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between px-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Male</span>
            <span>Age</span>
            <span>Female</span>
          </div>
          {error ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${svgHeight}`}
                className="h-auto w-full"
                role="img"
                aria-label="Population pyramid chart"
              >
                <line
                  x1={centerX}
                  x2={centerX}
                  y1={margin.top - 6}
                  y2={svgHeight - margin.bottom + 6}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />

                {data.map((row, index) => {
                  const y = margin.top + index * (rowHeight + rowGap);
                  const maleWidth = (row.male / maxValue) * halfWidth;
                  const femaleWidth = (row.female / maxValue) * halfWidth;
                  const maleX = centerX - maleWidth;
                  const femaleX = centerX + centerGap / 2;

                  return (
                    <g key={row.age}>
                      <rect
                        x={maleX}
                        y={y}
                        width={maleWidth}
                        height={rowHeight}
                        rx={6}
                        fill="#6366f1"
                        className="transition-all duration-300 ease-out"
                      >
                        <title>
                          {`Male ${formatAgeLabel(
                            row.age,
                          )}: ${formatFull.format(row.male)}`}
                        </title>
                      </rect>
                      <rect
                        x={femaleX}
                        y={y}
                        width={femaleWidth}
                        height={rowHeight}
                        rx={6}
                        fill="#fb7185"
                        className="transition-all duration-300 ease-out"
                      >
                        <title>
                          {`Female ${formatAgeLabel(
                            row.age,
                          )}: ${formatFull.format(row.female)}`}
                        </title>
                      </rect>
                      <text
                        x={centerX}
                        y={y + rowHeight / 2 + 4}
                        textAnchor="middle"
                        className="fill-slate-500 text-[11px]"
                      >
                        {formatAgeLabel(row.age)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-slate-500">
                <span>{formatCompact.format(maxValue)}</span>
                <span>0</span>
                <span>{formatCompact.format(maxValue)}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0">
        <div className="mx-auto max-w-xl px-4 pb-4">
          <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{YEAR_MIN}</span>
              <span className="font-semibold text-slate-700">Year {year}</span>
              <span>{YEAR_MAX}</span>
            </div>
            <input
              type="range"
              min={YEAR_MIN}
              max={YEAR_MAX}
              step={YEAR_STEP}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="mt-3 h-2 w-full appearance-none rounded-full bg-slate-200 accent-indigo-500"
              aria-label="Select year"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
