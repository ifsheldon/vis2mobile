"use client";

import { BarChart3, Film, Info, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import processedData from "../lib/processed_movies.json";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length && label !== undefined) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="font-bold text-slate-800 mb-1">
          IMDB Rating: {label}-{label + 1}
        </p>
        <div className="space-y-1">
          <p className="text-sm flex justify-between gap-4">
            <span className="text-amber-600 font-medium">Frequency:</span>
            <span className="text-slate-600">{payload[1].value} movies</span>
          </p>
          <p className="text-sm flex justify-between gap-4">
            <span className="text-blue-600 font-medium">Cumulative:</span>
            <span className="text-slate-600">{payload[0].value} movies</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  const totalMovies = useMemo(() => {
    return processedData[processedData.length - 1].cumulative;
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-4 font-sans overflow-y-auto">
      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Film className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IMDB Rating Distribution
          </h1>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Analysis of {totalMovies.toLocaleString()} movies. Frequency vs.
          Cumulative growth.
        </p>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-1 flex flex-col min-h-[450px]">
        <div className="flex justify-between items-end mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Growth & Density
            </span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Movie Ratings
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" />
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Cumulative
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-400" />
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Frequency
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="colorCumulative"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="bin"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                width={35}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                trigger="click"
              />

              {/* Cumulative Area (Background) */}
              <Area
                type="stepAfter"
                dataKey="cumulative"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCumulative)"
                isAnimationActive={false}
              />

              {/* Frequency Bar (Foreground) */}
              <Bar
                dataKey="count"
                fill="#fbbf24"
                radius={[4, 4, 0, 0]}
                barSize={24}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 leading-normal">
            The <span className="text-blue-600 font-bold">blue line</span> shows
            total movies cumulative growth. The{" "}
            <span className="text-amber-600 font-bold">amber bars</span>{" "}
            represent the count of movies in each rating bracket.
          </p>
        </div>
      </div>

      {/* Summary Footer Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Peak Range
            </p>
            <p className="text-lg font-black text-slate-800">6.0 - 7.0</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Data
            </p>
            <p className="text-lg font-black text-slate-800">{totalMovies}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
