"use client";

import { Loader2, TrendingUp } from "lucide-react";
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

interface DataPoint {
  date: number; // Unix timestamp for correct X-axis scaling
  year: number;
  month: number;
  value: number;
  formattedDate: string;
}

interface RawDataPoint {
  series: string;
  year: number;
  month: number;
  count: number;
  rate: number;
  date: string;
}

export function Visualization() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment-across-industries.json",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const rawData: RawDataPoint[] = await response.json();

        // Group by Year-Month and sum count
        const groupedData = new Map<
          string,
          { year: number; month: number; count: number }
        >();

        rawData.forEach((item) => {
          const key = `${item.year}-${item.month}`;
          if (!groupedData.has(key)) {
            groupedData.set(key, {
              year: item.year,
              month: item.month,
              count: 0,
            });
          }
          const group = groupedData.get(key);
          if (group) {
            group.count += item.count;
          }
        });

        // Convert to array and sort
        const processedData: DataPoint[] = Array.from(groupedData.values())
          .map((item) => {
            // Create a date object to format correctly
            const dateObj = new Date(item.year, item.month - 1);
            return {
              date: dateObj.getTime(),
              year: item.year,
              month: item.month,
              value: item.count,
              formattedDate: dateObj.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
            };
          })
          .sort((a, b) => a.date - b.date);

        setData(processedData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeData = useMemo(() => {
    if (activeIndex !== null && data[activeIndex]) {
      return data[activeIndex];
    }
    return data.length > 0 ? data[data.length - 1] : null;
  }, [activeIndex, data]);

  const ticks = useMemo(() => {
    if (data.length === 0) return [];
    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const result = [];
    for (let y = minYear; y <= maxYear; y += 2) {
      result.push(new Date(y, 0, 1).getTime());
    }
    return result;
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 pt-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-white/20 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col mb-2 shrink-0">
        <div className="flex items-center space-x-2 text-amber-600 mb-1">
          <TrendingUp className="w-4 h-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">
            Unemployment Trends
          </h2>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
              {activeData ? `${(activeData.value / 1000).toFixed(1)}M` : "0.0M"}
            </span>
            <span className="text-sm text-zinc-500 font-medium">
              {activeData ? activeData.formattedDate : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onTouchMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#e4e4e7"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              domain={["dataMin", "dataMax"]}
              type="number"
              scale="time"
              ticks={ticks}
              tickFormatter={(unixTime) =>
                new Date(unixTime).getFullYear().toString()
              }
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={[0, "auto"]} />

            <Tooltip
              content={() => null}
              cursor={{
                stroke: "#a1a1aa",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d97706"
              strokeWidth={2}
              fill="url(#colorValue)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[10px] text-zinc-400 text-center">
        Touch and drag to explore data
      </div>
    </div>
  );
}
