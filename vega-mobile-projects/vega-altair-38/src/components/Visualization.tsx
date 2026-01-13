"use client";

import { type ClassValue, clsx } from "clsx";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import rawData from "@/lib/data.json";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RawDataPoint {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  wind: number;
  weather: string;
}

interface DataPoint extends RawDataPoint {
  rolling_mean?: number;
  year: string;
  month: string;
  day: string;
}

export function Visualization() {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [activeDataPoint, setActiveDataPoint] = useState<DataPoint | null>(
    null,
  );

  // Pre-process data
  const processedData = useMemo(() => {
    const data = (rawData as RawDataPoint[]).map((d) => ({
      ...d,
      dateObj: new Date(d.date),
      year: d.date.substring(0, 4),
      month: d.date.substring(5, 7),
      day: d.date.substring(8, 10),
    }));

    // Calculate 31-day rolling mean ([-15, 15] window)
    return data.map((d, i) => {
      let sum = 0;
      let count = 0;
      for (let j = i - 15; j <= i + 15; j++) {
        if (j >= 0 && j < data.length) {
          sum += data[j].temp_max;
          count++;
        }
      }
      return {
        ...d,
        rolling_mean: sum / count,
      } as DataPoint;
    });
  }, []);

  const years = ["All", "2012", "2013", "2014", "2015"];

  const filteredData = useMemo(() => {
    if (selectedYear === "All") return processedData;
    return processedData.filter((d) => d.year === selectedYear);
  }, [processedData, selectedYear]);

  // X-axis tick formatter
  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    if (selectedYear === "All") {
      // Show year if it's the start of the year
      if (d.getUTCMonth() === 0 && d.getUTCDate() === 1) {
        return d.getUTCFullYear().toString();
      }
      return "";
    }
    // Show short month names
    return d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  };

  const ticks = useMemo(() => {
    if (selectedYear === "All") {
      return processedData
        .filter((d) => d.month === "01" && d.day === "01")
        .map((d) => d.date);
    }
    // For single year, show every 2 months to save space
    return filteredData
      .filter((d) => d.day === "01" && parseInt(d.month, 10) % 2 === 1)
      .map((d) => d.date);
  }, [filteredData, processedData, selectedYear]);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 pt-10 px-4 pb-4 font-sans select-none overflow-hidden">
      {/* Header */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Seattle Climate
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
          Max Temperature Analysis • 2012-2015
        </p>
      </div>

      {/* Year Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-md">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => {
              setSelectedYear(year);
              setActiveDataPoint(null);
            }}
            className={cn(
              "flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-300",
              selectedYear === year
                ? "bg-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Value Display Area (Fixed Tooltip) */}
      <div className="h-20 mb-6 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-zinc-900/50 to-transparent rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-red-500/5 opacity-50" />
        {activeDataPoint ? (
          <>
            <div className="flex flex-col z-10">
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                {new Date(activeDataPoint.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
              <span className="text-lg font-light text-zinc-200 capitalize tracking-tight">
                {activeDataPoint.weather}
              </span>
            </div>
            <div className="flex gap-8 z-10">
              <div className="flex flex-col items-end">
                <span className="text-blue-500/80 text-[10px] uppercase tracking-widest font-black">
                  Daily
                </span>
                <span className="text-2xl font-medium tracking-tighter text-blue-400">
                  {activeDataPoint.temp_max.toFixed(1)}°
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-red-500/80 text-[10px] uppercase tracking-widest font-black">
                  Avg
                </span>
                <span className="text-2xl font-medium tracking-tighter text-red-500">
                  {activeDataPoint.rolling_mean?.toFixed(1)}°
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full text-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
            Swipe to Explore History
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload.length > 0) {
                setActiveDataPoint(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setActiveDataPoint(null)}
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#ffffff08"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 9, fontWeight: 600 }}
              tickFormatter={formatXAxis}
              ticks={ticks}
              minTickGap={5}
            />
            <YAxis
              domain={[
                (dataMin: number) => Math.floor(dataMin - 5),
                (dataMax: number) => Math.ceil(dataMax + 5),
              ]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 9, fontWeight: 600 }}
            />
            <Tooltip
              content={null}
              cursor={{ stroke: "#ffffff15", strokeWidth: 2 }}
            />

            {/* Scatter Plot */}
            {selectedYear !== "All" && (
              <Scatter
                name="Daily"
                dataKey="temp_max"
                fill="#3b82f6"
                fillOpacity={0.3}
                line={false}
                shape="circle"
              >
                {filteredData.map((_entry) => (
                  <Cell key={_entry.date} r={1.5} />
                ))}
              </Scatter>
            )}

            {/* Rolling Mean Line with Glow */}
            <Line
              type="monotone"
              dataKey="rolling_mean"
              stroke="url(#lineGradient)"
              strokeWidth={selectedYear === "All" ? 2 : 3}
              dot={false}
              filter="url(#glow)"
              activeDot={{
                r: 5,
                stroke: "#ef4444",
                strokeWidth: 2,
                fill: "#000",
              }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-8 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">
            Record
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">
            Trend
          </span>
        </div>
      </div>
    </div>
  );
}
