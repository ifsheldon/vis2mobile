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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Chart Section */}
      <div className="relative h-[45%] min-h-[320px] w-full flex items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              onClick={(_, index) => handleClick(index)}
              cursor="pointer"
              stroke="none"
              animationBegin={0}
              animationDuration={1000}
            >
              {DATA.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.3
                  }
                  style={{
                    filter:
                      activeIndex === index
                        ? `drop-shadow(0 0 8px ${entry.color}44)`
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1 transition-all duration-300">
            {activeItem ? activeItem.id : "Total Values"}
          </span>
          <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums transition-all duration-300">
            {activeItem ? activeItem.value : TOTAL}
          </span>
          <div className="h-6 flex items-center">
            {activeItem ? (
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 animate-in fade-in slide-in-from-bottom-1">
                {((activeItem.value / TOTAL) * 100).toFixed(1)}% of total
              </span>
            ) : (
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {DATA.length} Countries
              </span>
            )}
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 shadow-inner">
        <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Breakdown by Country
          </span>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Value / %
          </span>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
          {DATA.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                w-full flex items-center justify-between p-4 cursor-pointer transition-all duration-200 outline-none
                ${
                  activeIndex === index
                    ? "bg-zinc-100/50 dark:bg-zinc-900/80"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/20 active:bg-zinc-100 dark:active:bg-zinc-800/40"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full shadow-inner ring-2 ring-white dark:ring-zinc-900"
                  style={{
                    backgroundColor: item.color,
                    boxShadow:
                      activeIndex === index
                        ? `0 0 12px ${item.color}66`
                        : "none",
                  }}
                />
                <div className="flex flex-col items-start">
                  <span
                    className={`text-sm font-bold transition-colors ${
                      activeIndex === index
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Contributor
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-base font-black tabular-nums transition-colors ${
                    activeIndex === index
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {item.value}
                </div>
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
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
