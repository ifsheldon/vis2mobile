"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data } from "@/lib/data";

const processedData = data.map((d) => ({
  ...d,
  y1: Math.min(d.y, 50),
  y2: Math.max(0, d.y - 50),
}));

export function Visualization() {
  return (
    <div className="flex flex-col w-full h-full bg-white p-4 pt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Horizon Graph</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Layered visualization of values above and below the 50 threshold.
        </p>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={processedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="x"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              domain={[0, 50]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any, name: any) => {
                if (name === "y1") return [value, "Base (0-50)"];
                if (name === "y2") return [value, "Over (50+)"];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="y1"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="y2"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-8 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              How to read
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              This horizon graph compresses the vertical scale by layering
              values. The{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 opacity-40 mr-1"></span>
              lighter blue represents values from 0 to 50. The{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 opacity-80 mr-1"></span>
              darker blue shows the excess value above 50, layered on top.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-1">
                Max Value
              </p>
              <p className="text-xl font-bold text-blue-900">
                {Math.max(...data.map((d) => d.y))}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1">
                Average
              </p>
              <p className="text-xl font-bold text-zinc-900">
                {(
                  data.reduce((acc, curr) => acc + curr.y, 0) / data.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
