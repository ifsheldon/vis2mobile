import { useMemo, useState } from "react";

type BarleyDatum = {
  yield: number;
  variety: string;
  year: 1931 | 1932;
  site: string;
};

type VarietyPoint = {
  variety: string;
  yield1931: number;
  yield1932: number;
  total: number;
};

const rawData: BarleyDatum[] = [
  { yield: 27, variety: "Manchuria", year: 1931, site: "University Farm" },
  { yield: 48.86667, variety: "Manchuria", year: 1931, site: "Waseca" },
  { yield: 27.43334, variety: "Manchuria", year: 1931, site: "Morris" },
  { yield: 39.93333, variety: "Manchuria", year: 1931, site: "Crookston" },
  { yield: 32.96667, variety: "Manchuria", year: 1931, site: "Grand Rapids" },
  { yield: 28.96667, variety: "Manchuria", year: 1931, site: "Duluth" },
  { yield: 43.06666, variety: "Glabron", year: 1931, site: "University Farm" },
  { yield: 55.2, variety: "Glabron", year: 1931, site: "Waseca" },
  { yield: 28.76667, variety: "Glabron", year: 1931, site: "Morris" },
  { yield: 38.13333, variety: "Glabron", year: 1931, site: "Crookston" },
  { yield: 29.13333, variety: "Glabron", year: 1931, site: "Grand Rapids" },
  { yield: 29.66667, variety: "Glabron", year: 1931, site: "Duluth" },
  { yield: 35.13333, variety: "Svansota", year: 1931, site: "University Farm" },
  { yield: 47.33333, variety: "Svansota", year: 1931, site: "Waseca" },
  { yield: 25.76667, variety: "Svansota", year: 1931, site: "Morris" },
  { yield: 40.46667, variety: "Svansota", year: 1931, site: "Crookston" },
  { yield: 29.66667, variety: "Svansota", year: 1931, site: "Grand Rapids" },
  { yield: 25.7, variety: "Svansota", year: 1931, site: "Duluth" },
  { yield: 39.9, variety: "Velvet", year: 1931, site: "University Farm" },
  { yield: 50.23333, variety: "Velvet", year: 1931, site: "Waseca" },
  { yield: 26.13333, variety: "Velvet", year: 1931, site: "Morris" },
  { yield: 41.33333, variety: "Velvet", year: 1931, site: "Crookston" },
  { yield: 23.03333, variety: "Velvet", year: 1931, site: "Grand Rapids" },
  { yield: 26.3, variety: "Velvet", year: 1931, site: "Duluth" },
  { yield: 36.56666, variety: "Trebi", year: 1931, site: "University Farm" },
  { yield: 63.8333, variety: "Trebi", year: 1931, site: "Waseca" },
  { yield: 43.76667, variety: "Trebi", year: 1931, site: "Morris" },
  { yield: 46.93333, variety: "Trebi", year: 1931, site: "Crookston" },
  { yield: 29.76667, variety: "Trebi", year: 1931, site: "Grand Rapids" },
  { yield: 33.93333, variety: "Trebi", year: 1931, site: "Duluth" },
  { yield: 43.26667, variety: "No. 457", year: 1931, site: "University Farm" },
  { yield: 58.1, variety: "No. 457", year: 1931, site: "Waseca" },
  { yield: 28.7, variety: "No. 457", year: 1931, site: "Morris" },
  { yield: 45.66667, variety: "No. 457", year: 1931, site: "Crookston" },
  { yield: 32.16667, variety: "No. 457", year: 1931, site: "Grand Rapids" },
  { yield: 33.6, variety: "No. 457", year: 1931, site: "Duluth" },
  { yield: 36.6, variety: "No. 462", year: 1931, site: "University Farm" },
  { yield: 65.7667, variety: "No. 462", year: 1931, site: "Waseca" },
  { yield: 30.36667, variety: "No. 462", year: 1931, site: "Morris" },
  { yield: 48.56666, variety: "No. 462", year: 1931, site: "Crookston" },
  { yield: 24.93334, variety: "No. 462", year: 1931, site: "Grand Rapids" },
  { yield: 28.1, variety: "No. 462", year: 1931, site: "Duluth" },
  { yield: 32.76667, variety: "Peatland", year: 1931, site: "University Farm" },
  { yield: 48.56666, variety: "Peatland", year: 1931, site: "Waseca" },
  { yield: 29.86667, variety: "Peatland", year: 1931, site: "Morris" },
  { yield: 41.6, variety: "Peatland", year: 1931, site: "Crookston" },
  { yield: 34.7, variety: "Peatland", year: 1931, site: "Grand Rapids" },
  { yield: 32, variety: "Peatland", year: 1931, site: "Duluth" },
  { yield: 24.66667, variety: "No. 475", year: 1931, site: "University Farm" },
  { yield: 46.76667, variety: "No. 475", year: 1931, site: "Waseca" },
  { yield: 22.6, variety: "No. 475", year: 1931, site: "Morris" },
  { yield: 44.1, variety: "No. 475", year: 1931, site: "Crookston" },
  { yield: 19.7, variety: "No. 475", year: 1931, site: "Grand Rapids" },
  { yield: 33.06666, variety: "No. 475", year: 1931, site: "Duluth" },
  {
    yield: 39.3,
    variety: "Wisconsin No. 38",
    year: 1931,
    site: "University Farm",
  },
  { yield: 58.8, variety: "Wisconsin No. 38", year: 1931, site: "Waseca" },
  { yield: 29.46667, variety: "Wisconsin No. 38", year: 1931, site: "Morris" },
  {
    yield: 49.86667,
    variety: "Wisconsin No. 38",
    year: 1931,
    site: "Crookston",
  },
  {
    yield: 34.46667,
    variety: "Wisconsin No. 38",
    year: 1931,
    site: "Grand Rapids",
  },
  { yield: 31.6, variety: "Wisconsin No. 38", year: 1931, site: "Duluth" },
  { yield: 26.9, variety: "Manchuria", year: 1932, site: "University Farm" },
  { yield: 33.46667, variety: "Manchuria", year: 1932, site: "Waseca" },
  { yield: 34.36666, variety: "Manchuria", year: 1932, site: "Morris" },
  { yield: 32.96667, variety: "Manchuria", year: 1932, site: "Crookston" },
  { yield: 22.13333, variety: "Manchuria", year: 1932, site: "Grand Rapids" },
  { yield: 22.56667, variety: "Manchuria", year: 1932, site: "Duluth" },
  { yield: 36.8, variety: "Glabron", year: 1932, site: "University Farm" },
  { yield: 37.73333, variety: "Glabron", year: 1932, site: "Waseca" },
  { yield: 35.13333, variety: "Glabron", year: 1932, site: "Morris" },
  { yield: 26.16667, variety: "Glabron", year: 1932, site: "Crookston" },
  { yield: 14.43333, variety: "Glabron", year: 1932, site: "Grand Rapids" },
  { yield: 25.86667, variety: "Glabron", year: 1932, site: "Duluth" },
  { yield: 27.43334, variety: "Svansota", year: 1932, site: "University Farm" },
  { yield: 38.5, variety: "Svansota", year: 1932, site: "Waseca" },
  { yield: 35.03333, variety: "Svansota", year: 1932, site: "Morris" },
  { yield: 20.63333, variety: "Svansota", year: 1932, site: "Crookston" },
  { yield: 16.63333, variety: "Svansota", year: 1932, site: "Grand Rapids" },
  { yield: 22.23333, variety: "Svansota", year: 1932, site: "Duluth" },
  { yield: 26.8, variety: "Velvet", year: 1932, site: "University Farm" },
  { yield: 37.4, variety: "Velvet", year: 1932, site: "Waseca" },
  { yield: 38.83333, variety: "Velvet", year: 1932, site: "Morris" },
  { yield: 32.06666, variety: "Velvet", year: 1932, site: "Crookston" },
  { yield: 32.23333, variety: "Velvet", year: 1932, site: "Grand Rapids" },
  { yield: 22.46667, variety: "Velvet", year: 1932, site: "Duluth" },
  { yield: 29.06667, variety: "Trebi", year: 1932, site: "University Farm" },
  { yield: 49.2333, variety: "Trebi", year: 1932, site: "Waseca" },
  { yield: 46.63333, variety: "Trebi", year: 1932, site: "Morris" },
  { yield: 41.83333, variety: "Trebi", year: 1932, site: "Crookston" },
  { yield: 20.63333, variety: "Trebi", year: 1932, site: "Grand Rapids" },
  { yield: 30.6, variety: "Trebi", year: 1932, site: "Duluth" },
  { yield: 26.43334, variety: "No. 457", year: 1932, site: "University Farm" },
  { yield: 42.2, variety: "No. 457", year: 1932, site: "Waseca" },
  { yield: 43.53334, variety: "No. 457", year: 1932, site: "Morris" },
  { yield: 34.33333, variety: "No. 457", year: 1932, site: "Crookston" },
  { yield: 19.46667, variety: "No. 457", year: 1932, site: "Grand Rapids" },
  { yield: 22.7, variety: "No. 457", year: 1932, site: "Duluth" },
  { yield: 25.56667, variety: "No. 462", year: 1932, site: "University Farm" },
  { yield: 44.7, variety: "No. 462", year: 1932, site: "Waseca" },
  { yield: 47, variety: "No. 462", year: 1932, site: "Morris" },
  { yield: 30.53333, variety: "No. 462", year: 1932, site: "Crookston" },
  { yield: 19.9, variety: "No. 462", year: 1932, site: "Grand Rapids" },
  { yield: 22.5, variety: "No. 462", year: 1932, site: "Duluth" },
  { yield: 28.06667, variety: "Peatland", year: 1932, site: "University Farm" },
  { yield: 36.03333, variety: "Peatland", year: 1932, site: "Waseca" },
  { yield: 43.2, variety: "Peatland", year: 1932, site: "Morris" },
  { yield: 25.23333, variety: "Peatland", year: 1932, site: "Crookston" },
  { yield: 26.76667, variety: "Peatland", year: 1932, site: "Grand Rapids" },
  { yield: 31.36667, variety: "Peatland", year: 1932, site: "Duluth" },
  { yield: 30, variety: "No. 475", year: 1932, site: "University Farm" },
  { yield: 41.26667, variety: "No. 475", year: 1932, site: "Waseca" },
  { yield: 44.23333, variety: "No. 475", year: 1932, site: "Morris" },
  { yield: 32.13333, variety: "No. 475", year: 1932, site: "Crookston" },
  { yield: 15.23333, variety: "No. 475", year: 1932, site: "Grand Rapids" },
  { yield: 27.36667, variety: "No. 475", year: 1932, site: "Duluth" },
  {
    yield: 38,
    variety: "Wisconsin No. 38",
    year: 1932,
    site: "University Farm",
  },
  { yield: 58.16667, variety: "Wisconsin No. 38", year: 1932, site: "Waseca" },
  { yield: 47.16667, variety: "Wisconsin No. 38", year: 1932, site: "Morris" },
  { yield: 35.9, variety: "Wisconsin No. 38", year: 1932, site: "Crookston" },
  {
    yield: 20.66667,
    variety: "Wisconsin No. 38",
    year: 1932,
    site: "Grand Rapids",
  },
  { yield: 29.33333, variety: "Wisconsin No. 38", year: 1932, site: "Duluth" },
];

const sitesOrder = [
  "Grand Rapids",
  "Duluth",
  "University Farm",
  "Morris",
  "Crookston",
  "Waseca",
] as const;

const formatYield = (value: number) => value.toFixed(1);

const createTicks = (min: number, max: number) => {
  const padding = 2;
  const start = Math.floor((min - padding) / 5) * 5;
  const end = Math.ceil((max + padding) / 5) * 5;
  const range = Math.max(end - start, 5);
  const step = Math.ceil(range / 4 / 5) * 5;
  const ticks: number[] = [];
  for (let t = start; t <= end; t += step) {
    ticks.push(t);
  }
  return ticks;
};

export function Visualization() {
  const grouped = useMemo(() => {
    const bySite: Record<string, Record<string, VarietyPoint>> = {};
    for (const datum of rawData) {
      if (!bySite[datum.site]) {
        bySite[datum.site] = {};
      }
      if (!bySite[datum.site][datum.variety]) {
        bySite[datum.site][datum.variety] = {
          variety: datum.variety,
          yield1931: 0,
          yield1932: 0,
          total: 0,
        };
      }
      if (datum.year === 1931) {
        bySite[datum.site][datum.variety].yield1931 = datum.yield;
      } else {
        bySite[datum.site][datum.variety].yield1932 = datum.yield;
      }
    }

    const result: Record<string, VarietyPoint[]> = {};
    for (const site of Object.keys(bySite)) {
      const values = Object.values(bySite[site]).map((point) => ({
        ...point,
        total: point.yield1931 + point.yield1932,
      }));
      values.sort((a, b) => b.total - a.total);
      result[site] = values;
    }
    return result;
  }, []);

  const [activeSite, setActiveSite] = useState<(typeof sitesOrder)[number]>(
    sitesOrder[0],
  );
  const activeData = grouped[activeSite] ?? [];
  const [activeVariety, setActiveVariety] = useState<VarietyPoint | null>(
    activeData[0] ?? null,
  );

  const data = activeData;
  const minYield = Math.min(...data.flatMap((d) => [d.yield1931, d.yield1932]));
  const maxYield = Math.max(...data.flatMap((d) => [d.yield1931, d.yield1932]));
  const ticks = createTicks(minYield, maxYield);

  const baseWidth = 360;
  const margin = { top: 18, right: 18, bottom: 34, left: 122 };
  const rowHeight = 34;
  const chartHeight = margin.top + margin.bottom + data.length * rowHeight;
  const chartWidth = baseWidth;
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  const xScale = (value: number) => {
    const padding = 1;
    const domainMin = minYield - padding;
    const domainMax = maxYield + padding;
    return (
      margin.left + ((value - domainMin) / (domainMax - domainMin)) * plotWidth
    );
  };

  const yForIndex = (index: number) =>
    margin.top + index * rowHeight + rowHeight / 2;

  const details = activeVariety ?? data[0];
  const delta =
    details !== undefined ? details.yield1932 - details.yield1931 : 0;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6">
        <header className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Barley Yield Analysis
            </p>
            <h1 className="text-2xl font-semibold text-slate-50">
              The Morris Mistake
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Compare yield shifts between 1931 and 1932 for each variety. Tap a
              row to inspect the exact change.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm shadow-[0_20px_45px_-30px_rgba(59,130,246,0.6)] backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
              <span className="text-slate-200">1931</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              <span className="text-slate-200">1932</span>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Site
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sitesOrder.map((site) => {
              const isActive = site === activeSite;
              return (
                <button
                  key={site}
                  type="button"
                  onClick={() => {
                    setActiveSite(site);
                    const first = grouped[site]?.[0] ?? null;
                    setActiveVariety(first);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-50 text-slate-950 shadow-[0_10px_30px_-15px_rgba(148,163,184,0.8)]"
                      : "border border-slate-700/80 text-slate-300"
                  }`}
                >
                  {site}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 shadow-[0_40px_90px_-60px_rgba(14,116,144,0.7)]">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-[0.25em]">Yield</span>
            <span>bushels / acre</span>
          </div>
          <div className="w-full overflow-hidden">
            <svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="block"
              role="img"
              aria-labelledby="barley-chart-title"
            >
              <title id="barley-chart-title">
                Dumbbell plot comparing barley yields for 1931 and 1932
              </title>
              <defs>
                <linearGradient id="dumbbell" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              {ticks.map((tick) => {
                const x = xScale(tick);
                return (
                  <g key={`grid-${tick}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={margin.top}
                      y2={margin.top + plotHeight}
                      stroke="rgba(148,163,184,0.25)"
                      strokeDasharray="3 5"
                    />
                    <text
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill="rgba(226,232,240,0.65)"
                      fontSize="10"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {data.map((row, index) => {
                const y = yForIndex(index);
                const x1931 = xScale(row.yield1931);
                const x1932 = xScale(row.yield1932);
                const isActive = activeVariety?.variety === row.variety;
                return (
                  <g
                    key={row.variety}
                    style={{
                      opacity: activeVariety ? (isActive ? 1 : 0.35) : 1,
                    }}
                  >
                    <line
                      x1={x1931}
                      x2={x1932}
                      y1={y}
                      y2={y}
                      stroke="url(#dumbbell)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={x1931}
                      cy={y}
                      r="5.4"
                      fill="#818cf8"
                      stroke="#1e1b4b"
                      strokeWidth="1"
                    />
                    <circle
                      cx={x1932}
                      cy={y}
                      r="5.4"
                      fill="#22d3ee"
                      stroke="#0e7490"
                      strokeWidth="1"
                    />
                    <text
                      x={margin.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="rgba(226,232,240,0.9)"
                      fontSize="12"
                    >
                      {row.variety}
                    </text>
                    <rect
                      x={0}
                      y={y - rowHeight / 2}
                      width={chartWidth}
                      height={rowHeight}
                      fill="transparent"
                      onClick={() => setActiveVariety(row)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${row.variety}`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveVariety(row);
                        }
                      }}
                    />
                  </g>
                );
              })}

              <text
                x={margin.left}
                y={14}
                textAnchor="start"
                fill="rgba(226,232,240,0.9)"
                fontSize="12"
              >
                Variety
              </text>
            </svg>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Selected variety
            </p>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {activeSite}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">
            {details?.variety ?? "Select a variety"}
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-slate-950/70 p-2">
              <p className="text-slate-400">1931</p>
              <p className="mt-1 text-base font-semibold text-indigo-300">
                {details ? formatYield(details.yield1931) : "--"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-2">
              <p className="text-slate-400">1932</p>
              <p className="mt-1 text-base font-semibold text-cyan-200">
                {details ? formatYield(details.yield1932) : "--"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-2">
              <p className="text-slate-400">Delta</p>
              <p
                className={`mt-1 text-base font-semibold ${
                  delta >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {details
                  ? `${delta >= 0 ? "+" : ""}${formatYield(delta)}`
                  : "--"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
