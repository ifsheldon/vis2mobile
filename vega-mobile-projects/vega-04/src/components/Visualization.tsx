"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const DATA = [
  { id: "Canada", value: 10, color: "#6366f1" }, // Indigo 500
  { id: "Argentina", value: 8, color: "#ec4899" }, // Pink 500
  { id: "India", value: 7, color: "#eab308" }, // Yellow 500
  { id: "China", value: 3, color: "#10b981" }, // Emerald 500
  { id: "United States", value: 1, color: "#f97316" }, // Orange 500
  { id: "France", value: 1, color: "#8b5cf6" }, // Violet 500
  { id: "Germany", value: 1, color: "#06b6d4" }, // Cyan 500
  { id: "Italy", value: 1, color: "#14b8a6" }, // Teal 500
  { id: "UK", value: 1, color: "#f43f5e" }, // Rose 500
].sort((a, b) => b.value - a.value);

const TOTAL = DATA.reduce((sum, item) => sum + item.value, 0);

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(index);
    }
  };

  const activeItem = activeIndex !== null ? DATA[activeIndex] : null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Chart Section */}
      <div className="relative h-1/2 min-h-[300px] w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900/50">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              onClick={(_, index) => handleClick(index)}
              cursor="pointer"
              stroke="none"
            >
              {DATA.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.3
                  }
                  className="transition-opacity duration-300"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">
            {activeItem ? activeItem.id : "Total"}
          </span>
          <span className="text-4xl font-bold mt-1">
            {activeItem ? activeItem.value : TOTAL}
          </span>
          {activeItem && (
            <span className="text-xs text-zinc-400 mt-1">
              {((activeItem.value / TOTAL) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {DATA.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                w-full flex items-center justify-between p-4 cursor-pointer transition-colors outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800
                ${activeIndex === index ? "bg-zinc-50 dark:bg-zinc-800/50" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`font-medium ${activeIndex === index ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}
                >
                  {item.id}
                </span>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${activeIndex === index ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  {item.value}
                </div>
                <div className="text-xs text-zinc-400">
                  {((item.value / TOTAL) * 100).toFixed(1)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
