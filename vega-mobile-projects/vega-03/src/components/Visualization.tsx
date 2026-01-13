"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { type StockDataPoint, useStockData } from "../lib/useStockData";

const SYMBOL_COLORS: Record<string, string> = {
  MSFT: "#0ea5e9", // Sky 500
  AMZN: "#f59e0b", // Amber 500
  IBM: "#8b5cf6", // Violet 500
  GOOG: "#ec4899", // Pink 500
  AAPL: "#10b981", // Emerald 500
};

export function Visualization() {
  const { data, symbols, loading } = useStockData();
  const [indexDate, setIndexDate] = useState<Date | null>(null);

  // Initialize indexDate when data loads
  useEffect(() => {
    if (data.length > 0 && !indexDate) {
      setIndexDate(data[0].date);
    }
  }, [data, indexDate]);

  // Find the closest data point to the current indexDate
  const indexedDataPoint = useMemo(() => {
    if (!indexDate || data.length === 0) return [];
    // Find exact match or closest
    return (
      data.find((d) => d.date.getTime() === indexDate.getTime()) || data[0]
    );
  }, [data, indexDate]);

  // Transform data: Calculate % return relative to indexDate
  const transformedData = useMemo(() => {
    if (!indexedDataPoint || data.length === 0) return [];

    return data.map((d) => {
      const newPoint: Record<string, number | Date> = {
        date: d.date.getTime(), // Store timestamp for XAxis
        originalDate: d.date,
      };

      symbols.forEach((symbol) => {
        const price = d[symbol] as number;
        // Cast to StockDataPoint to avoid TS error about 'never[]' or implicit any
        const indexPrice = (indexedDataPoint as StockDataPoint)[
          symbol
        ] as number;

        if (
          typeof price === "number" &&
          typeof indexPrice === "number" &&
          indexPrice !== 0
        ) {
          newPoint[symbol] = (price - indexPrice) / indexPrice;
        } else {
          newPoint[symbol] = 0;
        }
      });
      return newPoint;
    });
  }, [data, symbols, indexedDataPoint]);

  // biome-ignore lint/suspicious/noExplicitAny: Recharts interaction state is complex to type accurately
  const handleInteraction = useCallback((state: any) => {
    if (state?.activePayload && state.activePayload.length > 0) {
      // activePayload[0].payload is the data point
      const payloadDate = state.activePayload[0].payload.originalDate;
      setIndexDate(payloadDate);
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatPercentage = (val: number) => {
    return `${(val * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        Loading Data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden">
      {/* Background gradient for subtle styling */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />

      {/* Header / HUD */}
      <div className="flex-none p-6 z-10">
        <h1 className="text-xl font-bold tracking-tight mb-1">
          Market Returns
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Indexed to{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {indexDate ? formatDate(indexDate) : "..."}
          </span>
        </p>

        {/* Legend / Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {symbols.map((symbol) => {
            const currentValue = indexedDataPoint
              ? ((indexedDataPoint as StockDataPoint)[symbol] as number)
              : 0;

            return (
              <div
                key={symbol}
                className="flex items-center justify-between bg-white/50 dark:bg-zinc-800/50 rounded-lg p-2 border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: SYMBOL_COLORS[symbol] }}
                  />
                  <span className="font-semibold text-sm">{symbol}</span>
                </div>
                <span className="text-sm font-mono tabular-nums text-zinc-600 dark:text-zinc-300">
                  ${currentValue.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Drag across the chart to compare returns relative to different dates.
        </p>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={transformedData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            onMouseMove={handleInteraction}
            onTouchMove={handleInteraction}
            onTouchStart={handleInteraction}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <XAxis
              dataKey="date"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) =>
                new Date(timestamp).getFullYear().toString().slice(2)
              }
              tick={{ fontSize: 12, fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
              className="text-zinc-400"
            />
            {/* YAxis: Percentage */}
            <YAxis
              tickFormatter={formatPercentage}
              tick={{ fontSize: 12, fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
              width={40}
              className="text-zinc-400"
            />

            {/* Reference Line for 0% baseline */}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

            {/* Reference Line for Index Date (User Cursor) */}
            {indexDate && (
              <ReferenceLine
                x={indexDate.getTime()}
                stroke="#ef4444"
                strokeWidth={2}
              />
            )}

            {symbols.map((symbol) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={SYMBOL_COLORS[symbol]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false} // Disable animation for responsiveness during drag
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
