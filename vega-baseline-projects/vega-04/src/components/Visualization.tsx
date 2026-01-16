"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { data } from "@/lib/data";

const COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
];

export function Visualization() {
  const [mounted, setMounted] = useState(false);
  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-6 bg-white overflow-y-auto">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Distribution by Country
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Breakdown of total values across regions
        </p>
      </div>

      <div className="relative w-full aspect-square max-w-[280px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              nameKey="id"
              stroke="none"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px",
              }}
              itemStyle={{ fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-4xl font-black text-zinc-900">{total}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Total Units
          </div>
        </div>
      </div>

      <div className="w-full space-y-2 pb-8">
        <div className="flex justify-between items-center px-1 mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Region
          </span>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Value
          </span>
        </div>
        {data.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100/80 transition-all active:scale-[0.98] hover:bg-zinc-100/50"
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-3.5 h-3.5 rounded-full ring-4 ring-white shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-semibold text-zinc-700">
                {item.id}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm font-bold text-zinc-900">
                {item.value}
              </div>
              <div className="text-[10px] font-medium text-zinc-400 bg-white px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">
                {Math.round((item.value / total) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
