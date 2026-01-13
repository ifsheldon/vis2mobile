"use client";

import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
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
import stocksData from "@/lib/stocks.json";

interface StockPoint {
  symbol: string;
  date: string;
  price: number;
}

const typedStocksData = stocksData as StockPoint[];

// Process data to get unique dates and group by date
const allDates = Array.from(new Set(typedStocksData.map((d) => d.date))).sort(
  (a, b) => new Date(a).getTime() - new Date(b).getTime(),
);

const symbols = ["AAPL", "AMZN", "GOOG", "IBM", "MSFT"];

const colors: Record<string, string> = {
  AAPL: "#10b981", // Emerald 500
  AMZN: "#3b82f6", // Blue 500
  GOOG: "#8b5cf6", // Violet 500
  IBM: "#f59e0b", // Amber 500
  MSFT: "#f43f5e", // Rose 500
};

type ProcessedDataPoint = {
  date: string;
  timestamp: number;
  [key: string]: string | number;
};

export function Visualization() {
  const [indexDateIdx, setIndexDateIdx] = useState(
    Math.floor(allDates.length / 2),
  );
  const selectedDate = allDates[indexDateIdx];

  const processedData = useMemo(() => {
    // 1. Get prices at the selected index date
    const indexPrices: Record<string, number> = {};
    typedStocksData
      .filter((d) => d.date === selectedDate)
      .forEach((d) => {
        indexPrices[d.symbol] = d.price;
      });

    // 2. Group all data by date and calculate indexed price
    const dataByDate: Record<string, ProcessedDataPoint> = {};
    typedStocksData.forEach((d) => {
      if (!dataByDate[d.date]) {
        dataByDate[d.date] = {
          date: d.date,
          timestamp: new Date(d.date).getTime(),
        };
      }
      const baseline = indexPrices[d.symbol];
      if (baseline && baseline > 0) {
        dataByDate[d.date][d.symbol] = (d.price - baseline) / baseline;
      } else {
        dataByDate[d.date][d.symbol] = 0;
      }
    });

    return Object.values(dataByDate).sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedDate]);

  const currentIndexDateDisplay = new Date(selectedDate).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    },
  );

  const finalReturns = useMemo(() => {
    const lastPoint = processedData[processedData.length - 1];
    return symbols
      .map((s) => ({
        symbol: s,
        value: (lastPoint ? lastPoint[s] : 0) as number,
      }))
      .sort((a, b) => b.value - a.value);
  }, [processedData]);

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Top Header */}
      <div className="px-6 pt-12 pb-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stock Explorer
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Calendar size={10} />
            Index: {currentIndexDateDisplay}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Chart Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Performance Over Time
            </h2>
            <p className="text-[10px] text-zinc-400 italic">
              Relative to index date (%)
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["auto", "auto"]}
                  tickFormatter={(ts) =>
                    new Date(ts).toLocaleDateString("en-US", {
                      year: "2-digit",
                    })
                  }
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl">
                          <p className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-tighter">
                            {new Date(label).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <div className="space-y-1">
                            {payload.map((entry) => (
                              <div
                                key={entry.name}
                                className="flex justify-between items-center gap-6"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                                    {entry.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                  {(Number(entry.value) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={1} />
                <ReferenceLine
                  x={new Date(selectedDate).getTime()}
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                {symbols.map((s) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={colors[s]}
                    dot={false}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Control Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Set Index Date
            </h2>
            <span className="text-xs font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg">
              {currentIndexDateDisplay}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={allDates.length - 1}
            value={indexDateIdx}
            onChange={(e) => setIndexDateIdx(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 mb-2"
          />
          <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>2000</span>
            <span>2005</span>
            <span>2010</span>
          </div>
        </div>

        {/* Legend / Rank Card */}
        <div className="space-y-3 pb-8">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">
            Final Returns Ranking
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {finalReturns.map((item, index) => {
              const isPositive = item.value >= 0;
              return (
                <div
                  key={item.symbol}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-black text-zinc-300 dark:text-zinc-700 w-4">
                      {index + 1}
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: colors[item.symbol] }}
                    >
                      {item.symbol.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.symbol}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        Since {currentIndexDateDisplay}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={`text-sm font-mono font-black flex items-center gap-1 ${
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {isPositive ? "+" : ""}
                      {(item.value * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
