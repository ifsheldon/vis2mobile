"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getYearlyData, years } from "@/lib/data";

export function Visualization() {
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(2000);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    return getYearlyData(year).map((item) => ({
      ...item,
      // For tooltip and display
      maleDisplay: item.male,
      femaleDisplay: item.female,
    }));
  }, [year]);

  const yearIndex = useMemo(() => years.indexOf(year), [year]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden font-sans">
      <div className="p-4 bg-white shadow-sm z-10">
        <h1 className="text-lg font-bold text-slate-800 text-center leading-tight">
          U.S. Population by Age & Sex
        </h1>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Year: <span className="text-blue-600 font-bold">{year}</span>
            </span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[steelblue]" />
                <span className="text-xs font-medium text-slate-500">Male</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[salmon]" />
                <span className="text-xs font-medium text-slate-500">
                  Female
                </span>
              </div>
            </div>
          </div>

          <div className="px-1">
            <input
              type="range"
              min={0}
              max={years.length - 1}
              step={1}
              value={yearIndex}
              onChange={(e) => setYear(years[parseInt(e.target.value, 10)])}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>{years[0]}</span>
              <span>1920</span>
              <span>{years[years.length - 1]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2 pt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              stackOffset="sign"
              margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
              />
              <XAxis
                type="number"
                domain={[-12000000, 12000000]}
                tickFormatter={(val) => `${Math.abs(val / 1000000)}M`}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="age"
                type="category"
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const male = payload.find((p) => p.dataKey === "maleNegative")
                      ?.payload.maleDisplay;
                    const female = payload.find((p) => p.dataKey === "female")
                      ?.payload.femaleDisplay;
                    return (
                      <div className="bg-white p-2 border border-slate-100 shadow-lg rounded-md text-xs">
                        <p className="font-bold text-slate-700 mb-1">
                          Age Group: {label}
                        </p>
                        <div className="space-y-0.5">
                          <p className="flex justify-between gap-4">
                            <span className="text-[steelblue]">Male:</span>
                            <span className="font-mono">
                              {male?.toLocaleString()}
                            </span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-[salmon]">Female:</span>
                            <span className="font-mono">
                              {female?.toLocaleString()}
                            </span>
                          </p>
                          <p className="pt-1 border-top mt-1 flex justify-between gap-4 font-bold border-t border-slate-100">
                            <span className="text-slate-500">Total:</span>
                            <span className="font-mono text-slate-700">
                              {((male || 0) + (female || 0)).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="maleNegative"
                stackId="stack"
                fill="steelblue"
                radius={[2, 0, 0, 2]}
              />
              <Bar
                dataKey="female"
                stackId="stack"
                fill="salmon"
                radius={[0, 2, 2, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>Source: US Census Bureau</span>
        <span>Units: Millions of People</span>
      </div>
    </div>
  );
}
