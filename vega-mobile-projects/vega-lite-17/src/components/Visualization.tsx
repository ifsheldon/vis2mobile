"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";

const data = [
  { category: "1", value: 4 },
  { category: "2", value: 6 },
  { category: "3", value: 10 },
  { category: "4", value: 3 },
  { category: "5", value: 7 },
  { category: "6", value: 8 },
];

const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
];

const total = data.reduce((sum, item) => sum + item.value, 0);

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

const renderActiveShape = (props: unknown) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props as ActiveShapeProps;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ opacity: 0.4 }}
      />
    </g>
  );
};

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieClick = (_: unknown, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const activeData = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="w-full h-full bg-white dark:bg-black font-sans flex flex-col relative overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full overflow-y-auto px-6 pt-16 pb-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Distribution
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium text-sm">
            Category Breakdown Analysis
          </p>
        </header>

        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl p-4 mb-6 shadow-xl">
          <div className="relative w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={onPieClick}
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${data[index].category}`}
                      fill={COLORS[index % COLORS.length]}
                      className="cursor-pointer transition-all duration-300 outline-none"
                      style={{
                        opacity:
                          activeIndex === null || activeIndex === index
                            ? 1
                            : 0.3,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text Information */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500">
              <div className="bg-white/80 dark:bg-zinc-800/80 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner border border-white dark:border-zinc-700/50">
                {activeData ? (
                  <>
                    <span className="text-3xl font-bold transition-all duration-300">
                      {activeData.value}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      Category {activeData.category}
                    </span>
                    <div
                      className="mt-1 h-1 w-8 rounded-full"
                      style={{ backgroundColor: COLORS[activeIndex ?? 0] }}
                    />
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold">{total}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      Total Units
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {activeData && (
            <div className="mt-2 flex justify-between items-center px-4 py-3 bg-zinc-900/5 dark:bg-white/5 rounded-2xl transition-all duration-300">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Contribution
              </span>
              <span className="text-lg font-bold">
                {((activeData.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
            Legend Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {data.map((item, index) => (
              <button
                type="button"
                key={item.category}
                onClick={() =>
                  setActiveIndex(index === activeIndex ? null : index)
                }
                className={`flex items-center p-3 rounded-2xl transition-all duration-300 border text-left group ${
                  activeIndex === index
                    ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white shadow-lg"
                    : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-3 shrink-0 transition-transform duration-300 ${
                    activeIndex === index
                      ? "scale-125"
                      : "group-hover:scale-110"
                  }`}
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold transition-colors duration-300 ${
                      activeIndex === index
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Category {item.category}
                  </span>
                  <span
                    className={`text-sm font-black transition-colors duration-300 ${
                      activeIndex === index
                        ? "text-white dark:text-black"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {item.value} units
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
