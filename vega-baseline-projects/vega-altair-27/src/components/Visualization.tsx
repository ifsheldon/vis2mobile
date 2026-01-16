"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data } from "@/lib/data";
import { cn } from "@/lib/utils";

const COLORS = {
  A: "#4c78a8",
  B: "#f58518",
  C: "#e45756",
};

export function Visualization() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  const activeData = useMemo(() => {
    if (hoveredX === null) return null;
    return data.find((d) => d.x === hoveredX) || null;
  }, [hoveredX]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 font-sans">
      {/* Header section */}
      <div className="p-6 pt-10 pb-4">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Performance
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Tracking indices across 100 data points
        </p>
      </div>

      {/* Main Chart Section */}
      <div className="flex-1 min-h-[300px] w-full relative px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload) {
                setHoveredX(e.activeLabel);
              }
            }}
            onMouseLeave={() => setHoveredX(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 99]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              hide={hoveredX !== null}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={null} // Custom tooltip handled by the UI below
              trigger="click"
            />
            {hoveredX !== null && (
              <ReferenceLine
                x={hoveredX}
                stroke="#9ca3af"
                strokeDasharray="3 3"
              />
            )}

            {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((key) => (
              <Line
                key={key}
                type="basis"
                dataKey={key}
                stroke={COLORS[key]}
                strokeWidth={
                  activeCategory === null || activeCategory === key ? 3 : 1
                }
                strokeOpacity={
                  activeCategory === null || activeCategory === key ? 1 : 0.2
                }
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Hover info overlay */}
        {activeData && (
          <div className="absolute top-0 right-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm pointer-events-none">
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">
              Time: {activeData.x}
            </p>
            <div className="flex gap-3">
              {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-bold">
                    {Number(activeData[key as keyof typeof activeData]).toFixed(
                      1,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend / Stats Card */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((key) => {
            const isActive = activeCategory === key;
            const lastVal = data[data.length - 1][key];
            const firstVal = data[0][key];
            const diff = lastVal - firstVal;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(isActive ? null : key)}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden",
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
                )}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: COLORS[key] }}
                />
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Cat {key}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black">
                    {lastVal.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      diff >= 0 ? "text-green-500" : "text-red-500",
                      isActive && "text-white dark:text-zinc-900",
                    )}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff.toFixed(1)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Status Card */}
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              Market Insights
            </h3>
            <span className="text-xs font-medium text-zinc-500">
              Updated just now
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {activeCategory
              ? `Category ${activeCategory} is currently ${data[data.length - 1][activeCategory as keyof typeof COLORS] > 0 ? "outperforming" : "underperforming"} expectations with a ${data[data.length - 1][activeCategory as keyof typeof COLORS] - data[0][activeCategory as keyof typeof COLORS] > 0 ? "positive" : "negative"} trend.`
              : "Tap a category above to isolate its performance and see detailed trend analysis."}
          </p>
        </div>
      </div>
    </div>
  );
}
