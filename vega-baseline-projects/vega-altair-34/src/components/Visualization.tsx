"use client";

import { data } from "@/lib/data";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
];

export function Visualization() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 bg-white overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-zinc-800 self-start">
        Distribution by Category
      </h2>

      <div className="relative w-full flex justify-center mb-8">
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.category}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
        </PieChart>

        {/* Central Total Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-zinc-800">{total}</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Total
          </span>
        </div>
      </div>
      {/* Custom Legend */}
      <div className="w-full space-y-3">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-zinc-700">{item.category}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-600 font-bold">{item.value}</span>
              <span className="text-sm text-zinc-400 w-14 text-right">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
