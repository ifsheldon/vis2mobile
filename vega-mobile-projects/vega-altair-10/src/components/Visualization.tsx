"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
  ReferenceArea,
} from "recharts";
import { data, BoxPlotData } from "@/lib/data";

interface CustomBoxPlotProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: BoxPlotData;
  xAxis?: any; // Recharts internal xAxis object is complex
  isSelected?: boolean;
}

const CustomBoxPlot = (props: CustomBoxPlotProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload, xAxis, isSelected } = props;
  if (!payload) return null;

  const { min, q1, median, q3, max } = payload;

  // Try to get scale from xAxis, or fallback to linear calculation
  let xMin = 0;
  let xQ1 = 0;
  let xMedian = 0;
  let xQ3 = 0;
  let xMax = 0;

  if (xAxis && typeof xAxis.scale === "function") {
    xMin = xAxis.scale(min);
    xQ1 = xAxis.scale(q1);
    xMedian = xAxis.scale(median);
    xQ3 = xAxis.scale(q3);
    xMax = xAxis.scale(max);
  } else {
    // Fallback: use the width which corresponds to 'max' value
    // This assumes the x-axis starts at 0 and x is the pixel offset for 0
    const scale = max !== 0 ? width / max : 0;
    xMin = x + min * scale;
    xQ1 = x + q1 * scale;
    xMedian = x + median * scale;
    xQ3 = x + q3 * scale;
    xMax = x + max * scale;
  }

  const centerY = y + height / 2;
  const boxHeight = Math.min(height * 0.7, 32);
  const topY = centerY - boxHeight / 2;

  const mainColor = isSelected ? "#6366f1" : "#818cf8";
  const boxOpacity = isSelected ? 0.9 : 0.6;
  const strokeColor = isSelected ? "#fff" : "#c7d2fe";

  return (
    <g className="transition-all duration-300">
      {/* Whisker Line (Full extent) */}
      <line
        x1={xMin}
        y1={centerY}
        x2={xMax}
        y2={centerY}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />

      {/* Min Tick */}
      <line
        x1={xMin}
        y1={centerY - 6}
        x2={xMin}
        y2={centerY + 6}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Max Tick */}
      <line
        x1={xMax}
        y1={centerY - 6}
        x2={xMax}
        y2={centerY + 6}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Box Q1 to Q3 */}
      <rect
        x={xQ1}
        y={topY}
        width={Math.max(xQ3 - xQ1, 2)}
        height={boxHeight}
        fill={mainColor}
        fillOpacity={boxOpacity}
        stroke={strokeColor}
        strokeWidth={1.5}
        rx={4}
      />

      {/* Median Line */}
      <line
        x1={xMedian}
        y1={topY}
        x2={xMedian}
        y2={topY + boxHeight}
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Interaction overlay */}
      <rect
        x={xMin - 10}
        y={y}
        width={xMax - xMin + 20}
        height={height}
        fill="transparent"
        className="cursor-pointer"
      />
    </g>
  );
};

export function Visualization() {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const selectedData = data.find((d) => d.age === selectedAge);

  const handleClick = (state: any) => {
    if (state?.activePayload && state.activePayload.length > 0) {
      const age = state.activePayload[0].payload.age;
      setSelectedAge(age === selectedAge ? null : age);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-200 font-sans select-none overflow-hidden">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
          Population Distribution
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          U.S. Census Data • Age Group Analysis
        </p>
      </div>

      <div className="px-2 bg-slate-950 z-20 relative border-b border-slate-800">
        <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Age
        </div>
        <div style={{ height: "55px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              layout="vertical"
              margin={{ top: 40, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, "dataMax + 1000000"]}
                tickFormatter={formatNumber}
                stroke="#cbd5e1"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                orientation="top"
              />
              <YAxis dataKey="age" type="category" width={45} hide />
              <Bar dataKey="max" fill="transparent" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2">
        <div style={{ height: "1100px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
              onClick={handleClick}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#1e293b"
              />
              <XAxis type="number" domain={[0, "dataMax + 1000000"]} hide />
              <YAxis
                dataKey="age"
                type="category"
                stroke="#94a3b8"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                width={45}
                tick={{ fill: "#94a3b8", fontWeight: 600 }}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "#1e293b", fillOpacity: 0.4 }}
                content={() => null}
              />
              <Bar
                dataKey="max"
                shape={(props: any) => (
                  <CustomBoxPlot
                    {...props}
                    isSelected={selectedAge === props.payload.age}
                  />
                )}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} cursor="pointer" />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interaction Detail Card */}
      <div className="p-4 bg-slate-950 border-t border-slate-900">
        {selectedData ? (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Selected Group
                </span>
                <h3 className="text-xl font-bold text-white">
                  Age: {selectedData.age}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAge(null)}
                className="bg-slate-800 p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-medium text-slate-500 mb-1 uppercase">
                  Min
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {formatNumber(selectedData.min)}
                </div>
              </div>
              <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/20">
                <div className="text-[10px] font-medium text-indigo-400 mb-1 uppercase">
                  Median
                </div>
                <div className="text-sm font-bold text-white">
                  {formatNumber(selectedData.median)}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-medium text-slate-500 mb-1 uppercase">
                  Max
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {formatNumber(selectedData.max)}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-medium text-slate-500 mb-1 uppercase">
                  Q1 (25%)
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {formatNumber(selectedData.q1)}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 col-span-2">
                <div className="text-[10px] font-medium text-slate-500 mb-1 uppercase">
                  Q3 (75%)
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {formatNumber(selectedData.q3)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[148px] flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <svg
              className="w-8 h-8 mb-2 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              ></path>
            </svg>
            <p className="text-sm italic">
              Tap an age group bar to explore detailed distribution statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
