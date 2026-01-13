"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

// --- Types ---

interface RawDataPoint {
  series: string;
  year: number;
  month: number;
  count: number;
  rate: number;
  date: string;
}

interface ChartDataPoint {
  date: string; // ISO string for sorting/key
  displayDate: string; // "Jan 2000"
  year: number;
  month: number;
  [key: string]: number | string;
}

// --- Constants ---

const DATA_URL =
  "https://vega.github.io/editor/data/unemployment-across-industries.json";

// Vega Category20b-like palette (manually approximated or standard hex codes)
// 20 colors distinct enough for stacking
const PALETTE = [
  "#393b79",
  "#5254a3",
  "#6b6ecf",
  "#9c9ede",
  "#637939",
  "#8ca252",
  "#b5cf6b",
  "#cedb9c",
  "#8c6d31",
  "#bd9e39",
  "#e7ba52",
  "#e7cb94",
  "#843c39",
  "#ad494a",
  "#d6616b",
  "#e7969c",
  "#7b4173",
  "#a55194",
  "#ce6dbd",
  "#de9ed6",
];

// Map industries to colors securely
const getIndustryColor = (index: number) => PALETTE[index % PALETTE.length];

// --- Helper Components ---

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Main Component ---

export function Visualization() {
  const [rawData, setRawData] = useState<RawDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [focusedSeries, setFocusedSeries] = useState<string | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data: RawDataPoint[]) => {
        setRawData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Process Data (Pivot)
  const { chartData, industries } = useMemo(() => {
    if (!rawData.length) return { chartData: [], industries: [] };

    const industriesSet = new Set<string>();
    const groupedByDate: Record<string, ChartDataPoint> = {};

    // Helper to format date
    const formatDate = (y: number, m: number) => {
      const date = new Date(y, m - 1);
      return {
        iso: date.toISOString(),
        display: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      };
    };

    rawData.forEach((d) => {
      industriesSet.add(d.series);
      const { iso, display } = formatDate(d.year, d.month);

      if (!groupedByDate[iso]) {
        groupedByDate[iso] = {
          date: iso,
          displayDate: display,
          year: d.year,
          month: d.month,
        };
      }
      groupedByDate[iso][d.series] = d.count;
    });

    // Convert to array and sort
    const chartData = Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const industries = Array.from(industriesSet).sort();

    return { chartData, industries };
  }, [rawData]);

  // 3. Derived State for Tooltip/Focus
  const currentDataPoint = useMemo(() => {
    if (!activeDate) return null;
    return chartData.find((d) => d.date === activeDate) || null;
  }, [activeDate, chartData]);

  // Top 5 industries for the active date
  const topIndustriesForDate = useMemo(() => {
    if (!currentDataPoint) return [];

    const series = industries.map((ind) => ({
      name: ind,
      count: (currentDataPoint[ind] as number) || 0,
      color: getIndustryColor(industries.indexOf(ind)),
    }));

    // Calculate total for percentage
    const total = series.reduce((sum, item) => sum + item.count, 0);

    return series
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        percent: total > 0 ? (item.count / total) * 100 : 0,
      }));
  }, [currentDataPoint, industries]);

  // Chart Handlers
  // biome-ignore lint/suspicious/noExplicitAny: Recharts event type is complex
  const handleTouchMove = (e: any) => {
    if (e?.activePayload && e.activePayload.length > 0) {
      const payload = e.activePayload[0].payload;
      if (payload && payload.date !== activeDate) {
        setActiveDate(payload.date);
      }
    }
  };

  const handleLegendClick = (series: string) => {
    setFocusedSeries(focusedSeries === series ? null : series);
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Loading data...
      </div>
    );
  if (error)
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden font-sans">
      {/* Header / Title */}
      <div className="pt-12 pb-3 px-4 border-b border-zinc-100 flex-none bg-white/90 backdrop-blur-sm z-10">
        <h1 className="text-lg font-bold text-zinc-900 leading-tight">
          Unemployment Distribution
        </h1>
        <p className="text-xs text-zinc-500">
          Normalized by Industry (2000 - 2010)
        </p>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 min-h-0 relative w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            stackOffset="expand"
            onMouseMove={handleTouchMove}
            onTouchMove={handleTouchMove}
            onClick={() => setActiveDate(null)} // Clear focus on background click
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="date"
              hide={true} // Hide X axis to save space, rely on tooltip
            />
            <YAxis hide={true} domain={[0, 1]} ticks={[0, 0.5, 1]} />
            <Tooltip
              content={() => null}
              cursor={{ stroke: "#666", strokeWidth: 1 }}
            />

            {industries.map((ind, i) => (
              <Area
                key={ind}
                type="monotone"
                dataKey={ind}
                stackId="1"
                stroke="none"
                fill={getIndustryColor(i)}
                fillOpacity={
                  focusedSeries ? (focusedSeries === ind ? 1 : 0.1) : 0.85
                }
                animationDuration={300}
                isAnimationActive={false} // Performance on mobile
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Overlay Date Label (Sticky top inside chart) */}
        {currentDataPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900/80 text-white px-3 py-1 rounded-full text-xs font-mono pointer-events-none backdrop-blur-md">
            {currentDataPoint.displayDate}
          </div>
        )}
      </div>

      {/* Interaction / Detail Panel (Bottom) */}
      <div className="flex-none bg-zinc-50 border-t border-zinc-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        {/* Dynamic Detail Card (Visible when scrubbing) */}
        {currentDataPoint ? (
          <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Top Contributors ({currentDataPoint.displayDate})
            </div>
            <div className="grid grid-cols-1 gap-2">
              {topIndustriesForDate.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-3 h-3 rounded-full flex-none shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-zinc-700 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-none">
                    <span className="text-zinc-500">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="font-bold w-10 text-right">
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-zinc-400 text-center mt-2">
              Tap chart to lock • Scroll list below to filter
            </div>
          </div>
        ) : (
          // Default / Legend View
          <div className="p-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              All Industries (Tap to Focus)
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
              {industries.map((ind, i) => (
                <button
                  type="button"
                  key={ind}
                  onClick={() => handleLegendClick(ind)}
                  className={cn(
                    "flex-none flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all border whitespace-nowrap",
                    focusedSeries === ind
                      ? "bg-zinc-800 text-white border-zinc-800 shadow-md transform scale-105"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300",
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getIndustryColor(i) }}
                  />
                  {ind}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
