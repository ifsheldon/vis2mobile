"use client";

import { useState } from "react";
import {
  Bar,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import data from "../lib/data.json";

// Define the color scale based on rating
const getColor = (rating: number) => {
  if (rating < 6) return "#ef4444"; // red-500
  if (rating < 6.5) return "#f59e0b"; // amber-500
  return "#10b981"; // emerald-500
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-zinc-200">
        <p className="font-bold text-zinc-900">{item.genre}</p>
        <p className="text-sm text-zinc-600">
          Mean Rating:{" "}
          <span className="font-mono font-bold text-zinc-900">
            {item.rating.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Prepare data for the chart
  // We need a background bar that always goes to 10
  const chartData = data.map((item) => ({
    ...item,
    fullRange: 10,
  }));

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-50 overflow-y-auto">
      <div className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-zinc-100">
        <h2 className="text-xl font-extrabold text-zinc-900 mb-1">
          Genre Ratings
        </h2>
        <p className="text-sm text-zinc-500 leading-tight">
          Average IMDB ratings by major genre. <br />
          Scale from{" "}
          <span className="text-red-500 font-semibold">Poor (0)</span> to{" "}
          <span className="text-emerald-500 font-semibold">Great (10)</span>.
        </p>
      </div>

      <div className="flex-1 min-h-[600px] bg-white rounded-3xl shadow-sm border border-zinc-100 p-2 py-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            onClick={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
          >
            <XAxis type="number" domain={[0, 10]} hide />
            <YAxis
              dataKey="genre"
              type="category"
              width={100}
              tick={{ fontSize: 12, fontWeight: 500, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
              trigger="click"
            />

            {/* Background Track */}
            <Bar
              dataKey="fullRange"
              barSize={8}
              fill="#f4f4f5"
              radius={[4, 4, 4, 4]}
              isAnimationActive={false}
            />

            {/* Dots */}
            <Scatter
              dataKey="rating"
              fill="#3b82f6"
              onClick={(_data, index) => setActiveIndex(index)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.genre}
                  fill={getColor(entry.rating)}
                  stroke={activeIndex === index ? "#18181b" : "transparent"}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
              ))}
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-center px-4 py-3 bg-zinc-900 rounded-2xl text-white text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Poor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Great</span>
        </div>
      </div>
    </div>
  );
}
