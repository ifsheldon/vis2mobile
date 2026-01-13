"use client";

import { scaleOrdinal } from "d3-scale";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { industries, processedData } from "@/lib/data";

const category20b = [
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

const colorScale = scaleOrdinal(category20b).domain(industries);

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const date = new Date(label || "");
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    // Sort payload by value descending to show top industries
    const sortedPayload = [...payload].sort(
      (a, b) => (b.value || 0) - (a.value || 0),
    );

    return (
      <div className="bg-white/95 backdrop-blur-sm p-2 border border-zinc-200 rounded-lg shadow-xl min-w-[160px]">
        <p className="font-bold text-[11px] mb-1.5 text-zinc-900 border-b border-zinc-100 pb-1">
          {dateStr}
        </p>
        <div className="space-y-1">
          {sortedPayload.slice(0, 6).map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-3 text-[10px]"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-zinc-700 truncate max-w-[90px]">
                  {entry.name}
                </span>
              </div>
              <span className="font-semibold text-zinc-900">
                {entry.value ? (entry.value * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
          {sortedPayload.length > 6 && (
            <p className="text-[9px] text-zinc-400 text-right pt-0.5 italic">
              + {sortedPayload.length - 6} others
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export function Visualization() {
  const [highlightedIndustry, setHighlightedIndustry] = useState<string | null>(
    null,
  );

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.getFullYear().toString();
  };

  // Filter industries to show every 2 years on X-axis to avoid crowding
  const xAxisTicks = useMemo(() => {
    const years = new Set<number>();
    return processedData
      .filter((d) => {
        const year = new Date(d.date).getFullYear();
        if (year % 2 === 0 && !years.has(year)) {
          years.add(year);
          return true;
        }
        return false;
      })
      .map((d) => d.date);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-white p-4 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            Unemployment
          </h2>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-tighter">
            Industry Composition (2000-2010)
          </p>
        </div>
        {highlightedIndustry && (
          <button
            type="button"
            onClick={() => setHighlightedIndustry(null)}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Summary Card / Tooltip Placeholder */}
      <div className="h-64 mb-6 relative bg-zinc-50 rounded-xl p-2 border border-zinc-100 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={processedData}
            stackOffset="expand"
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              ticks={xAxisTicks}
              interval={0}
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              dy={5}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              allowEscapeViewBox={{ x: false, y: true }}
              position={{ y: -10 }} // Slightly above the chart area
            />
            {industries.map((industry) => (
              <Area
                key={industry}
                type="monotone"
                dataKey={industry}
                stackId="1"
                stroke={colorScale(industry)}
                fill={colorScale(industry)}
                fillOpacity={
                  highlightedIndustry === null ||
                  highlightedIndustry === industry
                    ? 0.8
                    : 0.1
                }
                strokeOpacity={
                  highlightedIndustry === null ||
                  highlightedIndustry === industry
                    ? 1
                    : 0.1
                }
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto pr-1">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>Filter by Industry</span>
          <div className="h-px flex-1 bg-zinc-100" />
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {industries.map((industry) => (
            <button
              type="button"
              key={industry}
              onClick={() =>
                setHighlightedIndustry(
                  highlightedIndustry === industry ? null : industry,
                )
              }
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] transition-all border
                ${
                  highlightedIndustry === industry
                    ? "border-zinc-800 bg-zinc-900 text-white shadow-sm scale-[1.02]"
                    : "border-zinc-100 bg-white text-zinc-600 active:bg-zinc-50"
                }
              `}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: colorScale(industry) }}
              />
              <span className="truncate leading-tight">{industry}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-[9px] text-zinc-400 font-medium bg-zinc-50 p-2 rounded-lg border border-zinc-100 flex items-start gap-2">
        <span className="text-zinc-300">💡</span>
        <span>
          Touch and drag over the chart to see monthly details. Tap an industry
          below to focus on its specific trend.
        </span>
      </div>
    </div>
  );
}