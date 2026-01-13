"use client";

import { Activity, ArrowLeft, Info, Maximize2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";

interface DataPoint {
  category: string;
  value: number;
  color: string;
}

const data: DataPoint[] = [
  { category: "1", value: 4, color: "#3b82f6" }, // blue-500
  { category: "2", value: 6, color: "#f97316" }, // orange-500
  { category: "3", value: 10, color: "#ef4444" }, // red-500
  { category: "4", value: 3, color: "#14b8a6" }, // teal-500
  { category: "5", value: 7, color: "#22c55e" }, // green-500
  { category: "6", value: 8, color: "#eab308" }, // yellow-500
];

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <defs>
        <filter id="activeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#activeShadow)"
      />
    </g>
  );
};

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [],
  );
  const maxValue = useMemo(
    () => Math.max(...data.map((item) => item.value)),
    [],
  );

  const onPieClick = (_: unknown, index: number) => {
    setActiveIndex(index === activeIndex ? undefined : index);
  };

  const activeItem = activeIndex !== undefined ? data[activeIndex] : null;

  if (!mounted) {
    return <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950" />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Dynamic Status Bar Area */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-20 pointer-events-none">
        <span className="text-xs font-bold text-zinc-400">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
          <div className="w-4 h-2.5 bg-zinc-300 dark:bg-zinc-700 rounded-sm" />
        </div>
      </div>

      {/* Modern App Bar */}
      <div className="px-6 pt-14 pb-4 bg-white dark:bg-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Analytics
            </span>
          </div>
          <div className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Info className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
          Data Insights
        </h2>
        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Distribution by performance category
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-12">
        {/* Main Chart Section */}
        <div className="mt-6 relative flex flex-col items-center">
          <div className="w-full aspect-square relative bg-white dark:bg-zinc-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-100 dark:border-zinc-800 p-6 flex items-center justify-center overflow-hidden transition-all duration-500">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full" />

            <div className="w-full h-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="88%"
                    paddingAngle={4}
                    dataKey="value"
                    onClick={onPieClick}
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={entry.color}
                        className="outline-none cursor-pointer transition-all duration-500"
                        style={{
                          filter:
                            activeIndex !== undefined && activeIndex !== index
                              ? "opacity(0.3) grayscale(0.6) blur(1px)"
                              : "none",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Info Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500">
                <div
                  className={`flex flex-col items-center transition-all duration-500 ${
                    activeItem ? "scale-110" : "scale-100"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                    {activeItem
                      ? `Category ${activeItem.category}`
                      : "Cumulative"}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-6xl font-black tabular-nums text-zinc-900 dark:text-zinc-50 leading-none">
                      {activeItem ? activeItem.value : totalValue}
                    </span>
                    {!activeItem && (
                      <span className="text-lg font-bold text-zinc-400">
                        pts
                      </span>
                    )}
                  </div>
                  <div
                    className={`mt-2 flex items-center gap-1.5 transition-all duration-500 ${
                      activeItem
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    {activeItem && (
                      <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-sm flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: activeItem.color }}
                        />
                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-200">
                          {((activeItem.value / totalValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="absolute bottom-6 right-6 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700"
            >
              <Maximize2 className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Legend / Breakdown Section */}
        <div className="mt-10 px-2 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              Breakdown
            </h3>
            <div className="h-1 w-8 bg-blue-500 rounded-full mt-1" />
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(undefined)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm text-[10px] font-bold text-zinc-500 transition-all duration-300 ${
              activeIndex !== undefined
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <RefreshCcw className="w-3 h-3" />
            RESET
          </button>
        </div>

        {/* Improved Interactive Legend Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 pb-10">
          {data.map((item, index) => (
            <button
              key={`legend-${item.category}`}
              type="button"
              onClick={() =>
                setActiveIndex(index === activeIndex ? undefined : index)
              }
              className={`group relative flex flex-col items-start p-5 rounded-[2rem] transition-all duration-500 border ${
                activeIndex === index
                  ? "bg-white dark:bg-zinc-800 shadow-2xl border-zinc-100 dark:border-zinc-700 -translate-y-1 scale-[1.03] z-10"
                  : "bg-white/40 dark:bg-zinc-900/40 border-transparent hover:bg-white/60 dark:hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeIndex === index ? "shadow-inner" : "shadow-sm"
                  }`}
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    Rank
                  </span>
                  <span className="text-sm font-black text-zinc-300">
                    #0{index + 1}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                  Category
                </span>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                  {item.category}
                </span>
              </div>

              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                  <span className="text-zinc-400">Efficiency</span>
                  <span style={{ color: item.color }}>
                    {Math.round((item.value / maxValue) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full transition-all duration-1000 ease-out rounded-full"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                      opacity:
                        activeIndex === index || activeIndex === undefined
                          ? 1
                          : 0.4,
                      boxShadow: `0 0 10px ${item.color}40`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 w-full border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500">
                  {item.value} Units
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 transition-all duration-500 ${activeIndex === index ? "scale-[2.5]" : "scale-100"}`}
                  style={{
                    backgroundColor:
                      activeIndex === index ? item.color : undefined,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
