"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { data } from "@/lib/data";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function Visualization() {
  const totalValue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [],
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Category Overview
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Distribution of values across six categories.
        </p>
      </div>

      <div className="relative h-[280px] w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">
            {totalValue}
          </span>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            Total Units
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 space-y-2">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Breakdown
          </h2>
          <span className="text-xs text-zinc-400">Values & Percentage</span>
        </div>

        {data.map((item, index) => {
          const percentage = ((item.value / totalValue) * 100).toFixed(1);
          return (
            <div
              key={item.category}
              className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full ring-4 ring-white dark:ring-zinc-800"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {item.value}
                </span>
                <span className="text-sm font-medium text-zinc-400 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
