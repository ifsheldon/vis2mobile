"use client";

import { Clock, Moon, Sun } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { observationData } from "@/lib/data";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; [key: string]: unknown }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-zinc-200 rounded-lg shadow-lg">
        <p className="text-sm font-bold text-zinc-900 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-4 bg-indigo-600 rounded-full" />
          <p className="text-sm text-zinc-600">
            <span className="font-bold text-indigo-600">
              {payload[0].value}
            </span>{" "}
            observations
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  const totalObservations = observationData.reduce(
    (acc, curr) => acc + curr.observations,
    0,
  );
  const maxObs = Math.max(...observationData.map((d) => d.observations));
  const peakHour = observationData.find(
    (d) => d.observations === maxObs,
  )?.label;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Observations
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Daily cycle activity monitoring
        </p>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Main Chart Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Peak
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Regular
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Moon className="w-3.5 h-3.5 text-slate-300" />
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={observationData}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke="#f8fafc"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  interval={5}
                  tickFormatter={(val) => `${val}:00`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#cbd5e1", fontSize: 10 }}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f1f5f9", radius: 4 }}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="observations"
                  radius={[4, 4, 2, 2]}
                  animationDuration={800}
                >
                  {observationData.map((entry) => {
                    const isPeak = entry.observations >= 7;
                    return (
                      <Cell
                        key={`cell-${entry.hour}`}
                        fill={isPeak ? "#4f46e5" : "#e2e8f0"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mt-4 px-2">
            <span className="text-[10px] font-bold text-slate-400">
              MIDNIGHT
            </span>
            <span className="text-[10px] font-bold text-slate-400">NOON</span>
            <span className="text-[10px] font-bold text-slate-400">
              MIDNIGHT
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-md shadow-indigo-100">
            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mb-1">
              Peak Traffic
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-white">{maxObs}</p>
              <p className="text-[10px] text-indigo-100 font-medium">units</p>
            </div>
            <p className="text-[10px] text-indigo-200 mt-2 flex items-center gap-1 font-bold">
              <Clock className="w-2.5 h-2.5" /> AT {peakHour}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Total Volume
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-slate-900">
                {totalObservations}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">units</p>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-400 h-full w-3/4 rounded-full" />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Daylight Activity
            </p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              Activity levels significantly increase between 08:00 and 17:00,
              peaking at midday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
