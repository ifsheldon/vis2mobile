"use client";

import { fetchAndProcessMovieData, type BinnedPoint } from "@/lib/data";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as BinnedPoint;
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-zinc-100 mb-1">Bin Details</p>
        <div className="space-y-1 text-zinc-400">
          <p>
            IMDB:{" "}
            <span className="text-zinc-100">
              {data.imdb} - {data.imdb + 1}
            </span>
          </p>
          <p>
            Rotten Tomatoes:{" "}
            <span className="text-zinc-100">
              {data.rotten}% - {data.rotten + 10}%
            </span>
          </p>
          <p>
            Movies Count:{" "}
            <span className="text-blue-400 font-bold">{data.count}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  const [data, setData] = useState<BinnedPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndProcessMovieData().then((processedData) => {
      setData(processedData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Calculate max count for opacity mapping
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 p-4 font-sans text-zinc-100">
      {/* Header Section */}
      <div className="mb-6 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Movie Ratings Distribution
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Correlation between IMDB (X) and Rotten Tomatoes (Y)
        </p>
      </div>

      {/* Legend Block */}
      <div className="flex items-center justify-between mb-6 px-2 py-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Volume:
          </span>
          <div className="flex items-end gap-3 ml-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500/40" />
              <span className="text-[9px] text-zinc-500">Low</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500/70" />
              <span className="text-[9px] text-zinc-500">Med</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-blue-500" />
              <span className="text-[9px] text-zinc-500">High</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-zinc-500">
          <Info size={12} />
          <span className="text-[10px]">Tap for details</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-[350px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              type="number"
              dataKey="imdb"
              name="IMDB Rating"
              domain={[1, 9]}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              label={{
                value: "IMDB Rating",
                position: "bottom",
                fill: "#52525b",
                fontSize: 10,
                offset: 10,
              }}
            />
            <YAxis
              type="number"
              dataKey="rotten"
              name="Rotten Tomatoes"
              domain={[0, 100]}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{
                value: "Rotten Tomatoes %",
                angle: -90,
                position: "insideLeft",
                fill: "#52525b",
                fontSize: 10,
                offset: 15,
                style: { textAnchor: "middle" },
              }}
            />
            <ZAxis type="number" dataKey="count" range={[30, 600]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#3f3f46", strokeDasharray: "5 5" }}
            />
            <Scatter name="Ratings" data={data} isAnimationActive={true}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.imdb}-${entry.rotten}`}
                  fill="#3b82f6"
                  fillOpacity={0.4 + (entry.count / maxCount) * 0.6}
                  stroke="#60a5fa"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center">
        <span className="text-[10px] text-zinc-600 font-medium">
          SOURCE: VEGA DATASETS
        </span>
        <div className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-400 text-[10px] font-bold">
          {data.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}{" "}
          MOVIES
        </div>
      </div>
    </div>
  );
}
