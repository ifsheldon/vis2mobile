"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import processedData from "@/lib/processed_data.json";

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length && label !== undefined) {
    const date = new Date(label);
    return (
      <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold mb-1">
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-zinc-500">
          Max Temp:{" "}
          <span className="text-zinc-900 font-medium">
            {payload[0].value.toFixed(1)}°C
          </span>
        </p>
        {payload[1] && (
          <p className="text-red-500">
            Rolling Mean:{" "}
            <span className="font-medium">{payload[1].value.toFixed(1)}°C</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function Visualization() {
  const data = useMemo(() => {
    // Sample data to improve performance and readability on mobile
    // 1461 points is too many for dots. We'll show the line for rolling mean
    // and maybe points only if we zoom, but here we'll use a light area or
    // just the line to keep it clean.
    return processedData.map((d) => ({
      ...d,
      timestamp: new Date(d.date).getTime(),
    }));
  }, []);

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(data.map((d) => new Date(d.date).getFullYear())),
    );
    return uniqueYears;
  }, [data]);

  return (
    <div className="flex flex-col h-full w-full bg-white px-2 py-8 overflow-hidden">
      <div className="mb-6 px-4">
        <h2 className="text-2xl font-bold text-zinc-900 leading-tight">
          Seattle Temperature Trends
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Daily maximum temperature and 31-day rolling mean (2012-2015)
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(ts) => new Date(ts).getFullYear().toString()}
              ticks={years.map((y) => new Date(`${y}-01-01`).getTime())}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              unit="°"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Raw data as light points */}
            <Scatter
              name="Max Temp"
              dataKey="temp_max"
              fill="#94a3b8"
              opacity={0.3}
              shape={<circle r={1} />}
            />

            {/* Rolling Mean as a bold red line */}
            <Line
              type="monotone"
              dataKey="rolling_mean"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              name="Rolling Mean"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 px-4 flex gap-4 items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-400 opacity-50" />
          <span className="text-xs text-zinc-600 font-medium">Daily Max</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-0.5 bg-red-500" />
          <span className="text-xs text-zinc-600 font-medium">31-day Avg</span>
        </div>
      </div>

      <div className="mt-8 px-4 py-4 bg-zinc-50 rounded-2xl mx-2">
        <p className="text-xs text-zinc-500 leading-relaxed italic">
          Source: Seattle weather dataset. The red line represents the rolling
          average, smoothing out daily fluctuations to show seasonal patterns.
        </p>
      </div>
    </div>
  );
}
