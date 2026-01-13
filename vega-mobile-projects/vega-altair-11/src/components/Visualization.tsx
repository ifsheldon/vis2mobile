"use client";

import { Calendar, Clock, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const rawData = [
  { task: "A", start: 1, end: 3 },
  { task: "B", start: 3, end: 8 },
  { task: "C", start: 8, end: 10 },
];

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    return rawData.map((item) => ({
      ...item,
      duration: item.end - item.start,
    }));
  }, []);

  const handleBarClick = (_: unknown, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const activeTask = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans p-4 pt-10">
      {/* Header section */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
            Project Timeline
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Gantt Overview
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Timeline of task execution and dependencies.
        </p>
      </header>

      {/* Active Details Card */}
      <div className="mb-6 h-28">
        {activeTask ? (
          <div className="w-full h-full rounded-2xl bg-indigo-600/20 border border-indigo-500/30 p-4 flex flex-col justify-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-tighter">
                  Selected Task
                </p>
                <h2 className="text-xl font-bold text-white">
                  Task {activeTask.task}
                </h2>
              </div>
              <div className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
                <span className="text-xs font-bold text-indigo-200">
                  {activeTask.duration} Days
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Start: {activeTask.start}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>End: {activeTask.end}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-2xl bg-slate-900/50 border border-slate-800 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Info className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                Tap a bar to see details
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Start, end dates and total duration.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[300px] w-full bg-slate-900/40 rounded-3xl border border-white/5 p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              horizontal={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
            <XAxis type="number" domain={[0, 10]} hide />
            <YAxis
              dataKey="task"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 14, fontWeight: 600 }}
            />
            <Tooltip cursor={false} content={<div className="hidden" />} />

            {/* The "Invisible" offset bar */}
            <Bar
              dataKey="start"
              stackId="a"
              fill="transparent"
              isAnimationActive={false}
            />

            {/* The actual Gantt bar */}
            <Bar
              dataKey="duration"
              stackId="a"
              radius={[8, 8, 8, 8]}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              {data.map((item) => (
                <Cell
                  key={item.task}
                  fill={item.task === activeTask?.task ? "#818cf8" : "#4f46e5"}
                  fillOpacity={item.task === activeTask?.task ? 1 : 0.8}
                  stroke={item.task === activeTask?.task ? "#c7d2fe" : "none"}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
              ))}
              <LabelList
                dataKey="task"
                position="center"
                content={(props) => {
                  const { x, y, width, height, value } = props;
                  if (
                    typeof x !== "number" ||
                    typeof y !== "number" ||
                    typeof width !== "number" ||
                    typeof height !== "number"
                  )
                    return null;
                  if (width < 30) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-bold pointer-events-none"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* X-Axis labels at the bottom */}
      <div className="mt-4 px-4 flex justify-between text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">
        <span>Day 0</span>
        <span>Day 5</span>
        <span>Day 10</span>
      </div>
    </div>
  );
}
