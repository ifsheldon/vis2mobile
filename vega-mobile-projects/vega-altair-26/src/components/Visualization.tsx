"use client";

import { Calendar, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { sp500Data } from "../lib/data";

export function Visualization() {
  const [range, setRange] = useState<{ startIndex: number; endIndex: number }>({
    startIndex: Math.floor(sp500Data.length * 0.7), // Default to last 30%
    endIndex: sp500Data.length - 1,
  });

  const [hoverData, setHoverData] = useState<{
    date: string;
    price: number;
  } | null>(null);

  const focusData = useMemo(() => {
    // Ensure indices are within bounds
    const start = Math.max(0, range.startIndex);
    const end = Math.min(sp500Data.length - 1, range.endIndex);
    return sp500Data.slice(start, end + 1);
  }, [range]);

  const currentPrice = hoverData
    ? hoverData.price
    : focusData[focusData.length - 1]?.price || 0;
  const currentDate = hoverData
    ? hoverData.date
    : focusData[focusData.length - 1]?.date || "";

  // Calculate percentage change for the visible range (simple start to end of view)
  const startPrice = focusData[0]?.price || 0;
  const endPrice = focusData[focusData.length - 1]?.price || 0;
  const percentChange = startPrice
    ? ((endPrice - startPrice) / startPrice) * 100
    : 0;
  const isPositive = percentChange >= 0;

  const handleBrushChange = (newRange: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (newRange.startIndex !== undefined && newRange.endIndex !== undefined) {
      setRange({
        startIndex: newRange.startIndex,
        endIndex: newRange.endIndex,
      });
    }
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: unknown[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      // Lift state up for header display
      // We can't easily call setState during render, so we rely on onMouseMove of the chart
      // specific logic handled via AreaChart onMouseMove/onMouseLeave
      return null;
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white p-4 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background Gradients for Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-900/10 blur-3xl rounded-full translate-y-1/2 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-4 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> S&P 500 Index
          </h1>
          <div
            className={`px-2 py-1 rounded text-xs font-bold ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
          >
            {isPositive ? "+" : ""}
            {percentChange.toFixed(2)}%
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-4xl font-bold font-mono tracking-tight text-white flex items-center">
            <span className="text-2xl text-slate-500 mr-1">$</span>
            {currentPrice.toFixed(2)}
          </div>
          <div className="text-sm text-slate-400 font-mono mt-1 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(currentDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Main Focus Chart */}
      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={focusData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e.activePayload?.[0]) {
                setHoverData(
                  e.activePayload[0].payload as { date: string; price: number },
                );
              }
            }}
            onMouseLeave={() => setHoverData(null)}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#334155"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              tickFormatter={(str) => {
                const d = new Date(str);
                return `'${d.getFullYear().toString().slice(-2)}`;
              }}
              minTickGap={50}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              orientation="right"
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#fff",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Context Chart (Brush) */}
      <div className="h-24 w-full mt-4 shrink-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sp500Data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorContext" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke="#94a3b8"
              strokeWidth={1}
              fill="url(#colorContext)"
            />
            <Brush
              dataKey="date"
              height={40}
              stroke="#6366f1"
              fill="#1e293b"
              tickFormatter={() => ""}
              startIndex={range.startIndex}
              endIndex={range.endIndex}
              onChange={handleBrushChange}
              travellerWidth={20} // Larger touch target
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
