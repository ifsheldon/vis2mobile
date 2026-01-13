"use client";

import { Info, MousePointer2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SiteData {
  year: string;
  [key: string]: string | number;
}

interface RawData {
  sites: string[];
  data: SiteData[];
}

const rawData: RawData = {
  sites: [
    "Crookston",
    "Duluth",
    "Grand Rapids",
    "Morris",
    "University Farm",
    "Waseca",
  ],
  data: [
    {
      year: "1931",
      Crookston: 42.85,
      Duluth: 30.633335000000002,
      "Grand Rapids": 29.71667,
      Morris: 28.733335,
      "University Farm": 36.583330000000004,
      Waseca: 52.716665000000006,
    },
    {
      year: "1932",
      Crookston: 32.099995,
      Duluth: 24.283335,
      "Grand Rapids": 20.266665,
      Morris: 43.36667,
      "University Farm": 27.750005,
      Waseca: 39.883335,
    },
  ],
};

const SITE_COLORS: Record<string, string> = {
  Crookston: "#ef4444",
  Duluth: "#3b82f6",
  "Grand Rapids": "#10b981",
  Morris: "#f59e0b",
  "University Farm": "#8b5cf6",
  Waseca: "#ec4899",
};

export function Visualization() {
  const [activeSite, setActiveSite] = useState<string | null>(null);

  const siteStats = useMemo(() => {
    const stats: Record<
      string,
      { start: number; end: number; change: number; percent: number }
    > = {};
    for (const site of rawData.sites) {
      const start = rawData.data[0][site] as number;
      const end = rawData.data[1][site] as number;
      const change = end - start;
      const percent = (change / start) * 100;
      stats[site] = { start, end, change, percent };
    }
    return stats;
  }, []);

  const handleSiteClick = (site: string) => {
    if (activeSite === site) {
      setActiveSite(null);
    } else {
      setActiveSite(site);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Crop Yield Trends
        </h1>
        <p className="text-sm text-slate-500">
          Median yield comparison (1931 vs 1932)
        </p>
      </div>

      {/* Legend / Chips */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex space-x-2 min-w-max">
          {rawData.sites.map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => handleSiteClick(site)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-2 ${
                activeSite === site
                  ? "border-slate-800 bg-slate-800 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: SITE_COLORS[site] }}
              />
              {site}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative p-4 flex flex-col justify-center">
        <div className="w-full h-64 bg-white rounded-xl shadow-sm border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rawData.data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 14, fontWeight: 600 }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                domain={[0, 70]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const sortedPayload = [...payload].sort(
                      (a, b) => (b.value as number) - (a.value as number),
                    );
                    return (
                      <div className="bg-white/90 backdrop-blur-sm p-3 border border-slate-200 rounded-lg shadow-xl text-xs">
                        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
                          {payload[0].payload.year} Yields
                        </p>
                        {sortedPayload.map((entry) => (
                          <div
                            key={entry.name}
                            className={`flex justify-between items-center py-0.5 space-x-4 ${activeSite === entry.name ? "font-bold" : "opacity-60"}`}
                          >
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}</span>
                            </div>
                            <span className="tabular-nums">
                              {(entry.value as number).toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {rawData.sites.map((site) => (
                <Line
                  key={site}
                  type="monotone"
                  dataKey={site}
                  stroke={SITE_COLORS[site]}
                  strokeWidth={
                    activeSite === site ? 4 : activeSite === null ? 2.5 : 1
                  }
                  strokeOpacity={
                    activeSite === site || activeSite === null ? 1 : 0.2
                  }
                  dot={{
                    r: activeSite === site ? 6 : 4,
                    fill: SITE_COLORS[site],
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!activeSite && (
          <div className="mt-4 flex items-center justify-center text-slate-400 space-x-2 animate-pulse">
            <MousePointer2 size={14} />
            <span className="text-xs font-medium">
              Tap a site above to focus
            </span>
          </div>
        )}
      </div>

      {/* Detail Block */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {activeSite ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2 shadow-sm"
                  style={{ backgroundColor: SITE_COLORS[activeSite] }}
                />
                <span className="font-bold text-slate-800">{activeSite}</span>
              </div>
              <div
                className={`flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  siteStats[activeSite].change >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {siteStats[activeSite].change >= 0 ? (
                  <TrendingUp size={12} className="mr-1" />
                ) : (
                  <TrendingDown size={12} className="mr-1" />
                )}
                {Math.abs(siteStats[activeSite].percent).toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  1931 Median
                </p>
                <p className="text-lg font-bold text-slate-700">
                  {siteStats[activeSite].start.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  1932 Median
                </p>
                <p className="text-lg font-bold text-slate-700">
                  {siteStats[activeSite].end.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-700 leading-relaxed">
              This slope graph shows the transition of crop yields across 6
              sites in Minnesota. <span className="font-bold"> Morris</span> was
              the only site that showed a significant increase in yield during
              1932.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
