"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import type { StockData } from "../data";

interface StockCardProps {
  symbol: string;
  data: StockData[];
  color: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "2-digit", month: "short" }); // e.g., "Jan '00"
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" }); // e.g., "January 2000"
}

export function StockCard({ symbol, data, color }: StockCardProps) {
  const [activeData, setActiveData] = useState<StockData | null>(null);

  const latestData = data[data.length - 1];
  const displayData = activeData || latestData;
  const isInteracting = !!activeData;

  const gradientId = `gradient-${symbol}`;

  // Calculate min/max for domain to make the chart look good
  const minPrice = useMemo(() => Math.min(...data.map((d) => d.price)), [data]);
  const maxPrice = useMemo(() => Math.max(...data.map((d) => d.price)), [data]);

  // Add some padding to the domain
  const domainMin = Math.floor(minPrice * 0.9);
  const domainMax = Math.ceil(maxPrice * 1.05);

  return (
    <div className="flex flex-col w-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg mb-4">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-start">
        <div>
          <h2
            className={twMerge(
              "text-2xl font-bold tracking-tight",
              isInteracting
                ? "text-zinc-100"
                : "text-zinc-400 transition-colors",
            )}
          >
            {symbol}
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            {formatFullDate(displayData.date)}
          </p>
        </div>
        <div className="text-right">
          <div
            className={twMerge(
              "text-3xl font-mono font-medium",
              isInteracting ? "text-white" : "text-zinc-300",
            )}
          >
            ${displayData.price.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
            {isInteracting ? "Price" : "Latest"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(
              // biome-ignore lint/suspicious/noExplicitAny: Recharts event types are complex
              e: any,
            ) => {
              if (e?.activePayload?.[0]) {
                setActiveData(e.activePayload[0].payload as StockData);
              }
            }}
            onMouseLeave={() => setActiveData(null)}
            onTouchMove={(
              // biome-ignore lint/suspicious/noExplicitAny: Recharts event types are complex
              e: any,
            ) => {
              if (e?.activePayload?.[0]) {
                setActiveData(e.activePayload[0].payload as StockData);
              }
            }}
            onTouchEnd={() => setActiveData(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              minTickGap={30}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={[domainMin, domainMax]} />
            <Tooltip
              content={() => null} // Hide default tooltip
              cursor={{
                stroke: "#52525b",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
