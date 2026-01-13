"use client";

import { useEffect, useMemo, useState } from "react";

type PopulationRecord = {
  age: number | string;
  people: number;
};

type BoxplotStats = {
  age: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

const DATA_URL =
  "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json";

const fallbackData: BoxplotStats[] = [
  {
    age: 0,
    min: 1800000,
    q1: 2600000,
    median: 3400000,
    q3: 4600000,
    max: 12000000,
  },
  {
    age: 5,
    min: 1600000,
    q1: 2400000,
    median: 3200000,
    q3: 4200000,
    max: 11500000,
  },
  {
    age: 10,
    min: 1400000,
    q1: 2300000,
    median: 3000000,
    q3: 4000000,
    max: 11000000,
  },
  {
    age: 15,
    min: 1300000,
    q1: 2200000,
    median: 2900000,
    q3: 3900000,
    max: 10500000,
  },
  {
    age: 20,
    min: 1200000,
    q1: 2100000,
    median: 2800000,
    q3: 3800000,
    max: 10000000,
  },
  {
    age: 25,
    min: 1100000,
    q1: 2000000,
    median: 2700000,
    q3: 3600000,
    max: 9500000,
  },
  {
    age: 30,
    min: 1000000,
    q1: 1900000,
    median: 2500000,
    q3: 3400000,
    max: 9000000,
  },
  {
    age: 35,
    min: 900000,
    q1: 1700000,
    median: 2300000,
    q3: 3200000,
    max: 8500000,
  },
  {
    age: 40,
    min: 800000,
    q1: 1500000,
    median: 2100000,
    q3: 3000000,
    max: 8000000,
  },
  {
    age: 45,
    min: 700000,
    q1: 1400000,
    median: 1900000,
    q3: 2800000,
    max: 7500000,
  },
  {
    age: 50,
    min: 600000,
    q1: 1200000,
    median: 1700000,
    q3: 2600000,
    max: 7000000,
  },
  {
    age: 55,
    min: 500000,
    q1: 1100000,
    median: 1500000,
    q3: 2400000,
    max: 6400000,
  },
  {
    age: 60,
    min: 400000,
    q1: 900000,
    median: 1300000,
    q3: 2100000,
    max: 5800000,
  },
  {
    age: 65,
    min: 300000,
    q1: 800000,
    median: 1150000,
    q3: 1900000,
    max: 5200000,
  },
  {
    age: 70,
    min: 250000,
    q1: 700000,
    median: 1000000,
    q3: 1700000,
    max: 4600000,
  },
  {
    age: 75,
    min: 200000,
    q1: 600000,
    median: 850000,
    q3: 1500000,
    max: 4000000,
  },
  {
    age: 80,
    min: 150000,
    q1: 500000,
    median: 700000,
    q3: 1300000,
    max: 3400000,
  },
  {
    age: 85,
    min: 120000,
    q1: 420000,
    median: 600000,
    q3: 1100000,
    max: 2800000,
  },
  {
    age: 90,
    min: 100000,
    q1: 360000,
    median: 520000,
    q3: 950000,
    max: 2200000,
  },
];

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const quantile = (sorted: number[], p: number) => {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const rest = position - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
};

const buildBoxplotStats = (records: PopulationRecord[]): BoxplotStats[] => {
  const grouped = new Map<number, number[]>();
  for (const record of records) {
    const age =
      typeof record.age === "string" ? Number(record.age) : record.age;
    if (!grouped.has(age)) grouped.set(age, []);
    grouped.get(age)?.push(record.people);
  }

  return Array.from(grouped.entries())
    .map(([age, values]) => {
      const sorted = values.slice().sort((a, b) => a - b);
      return {
        age,
        min: sorted[0] ?? 0,
        q1: quantile(sorted, 0.25),
        median: quantile(sorted, 0.5),
        q3: quantile(sorted, 0.75),
        max: sorted[sorted.length - 1] ?? 0,
      };
    })
    .sort((a, b) => a.age - b.age);
};

export function Visualization() {
  const [data, setData] = useState<BoxplotStats[]>(fallbackData);
  const [selectedAge, setSelectedAge] = useState<number | null>(
    fallbackData[0]?.age ?? null,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setStatus("loading");
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load data");
        const json = (await response.json()) as PopulationRecord[];
        if (!active) return;
        const stats = buildBoxplotStats(json);
        if (stats.length > 0) {
          setData(stats);
          setSelectedAge(stats[0]?.age ?? null);
        }
        setStatus("ready");
      } catch {
        if (!active) return;
        setStatus("ready");
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const maxValue = useMemo(
    () => Math.max(...data.map((item) => item.max), 1),
    [data],
  );

  const selected = useMemo(
    () => data.find((item) => item.age === selectedAge) ?? null,
    [data, selectedAge],
  );

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_55%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Mobile Boxplot
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-white">
            Population Distribution by Age
          </h1>
          <p className="text-sm text-slate-300">
            Tap an age group to explore how population values vary across years
            and gender. Scroll to compare each cohort.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>Age</span>
              <span>Population</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>0</span>
              <div className="relative h-1 flex-1 rounded-full bg-white/10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/70 via-sky-400/70 to-blue-500/70" />
              </div>
              <span>{compactNumber(maxValue)}</span>
            </div>
            {status === "loading" ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                Loading population data…
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((item) => {
                  const isSelected = item.age === selectedAge;
                  const scale = (value: number) => (value / maxValue) * 100;
                  const gradientId = `boxGradient-${item.age}`;
                  const ariaLabel = `Age ${item.age} has median population ${compactNumber(
                    item.median,
                  )}.`;

                  return (
                    <button
                      key={item.age}
                      type="button"
                      onClick={() => setSelectedAge(item.age)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-4 text-left transition ${
                        isSelected
                          ? "border-cyan-400/60 bg-cyan-500/10"
                          : "border-white/5 bg-white/0 hover:bg-white/5"
                      }`}
                      aria-label={ariaLabel}
                    >
                      <span className="w-10 shrink-0 text-sm font-semibold text-slate-100">
                        {item.age}
                      </span>
                      <svg
                        className="h-8 flex-1"
                        viewBox="0 0 100 24"
                        role="img"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                      >
                        <line
                          x1={scale(item.min)}
                          y1="12"
                          x2={scale(item.max)}
                          y2="12"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          opacity="0.7"
                        />
                        <rect
                          x={scale(item.q1)}
                          y="6"
                          width={Math.max(scale(item.q3) - scale(item.q1), 1)}
                          height="12"
                          rx="3"
                          fill={`url(#${gradientId})`}
                          opacity={isSelected ? 0.95 : 0.7}
                        />
                        <line
                          x1={scale(item.median)}
                          y1="4"
                          x2={scale(item.median)}
                          y2="20"
                          stroke="#f8fafc"
                          strokeWidth="2"
                        />
                        <defs>
                          <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="w-16 shrink-0 text-right text-xs text-slate-300">
                        {compactNumber(item.median)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        <div className="sticky bottom-4 z-10">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Selected Age
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {selected.age}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Median
                    </p>
                    <p className="text-lg font-semibold text-cyan-300">
                      {compactNumber(selected.median)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Min
                    </p>
                    <p className="text-base font-semibold text-white">
                      {compactNumber(selected.min)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Q1
                    </p>
                    <p className="text-base font-semibold text-white">
                      {compactNumber(selected.q1)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Median
                    </p>
                    <p className="text-base font-semibold text-white">
                      {compactNumber(selected.median)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Q3
                    </p>
                    <p className="text-base font-semibold text-white">
                      {compactNumber(selected.q3)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Max
                    </p>
                    <p className="text-base font-semibold text-white">
                      {compactNumber(selected.max)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {status === "ready" && data !== fallbackData
                    ? "Values summarize the distribution of population counts across years and gender."
                    : "Showing sample values until the dataset loads."}
                </p>
              </div>
            ) : (
              <div className="text-sm text-slate-300">
                Tap an age group to see details about min, quartiles, and max
                values.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
