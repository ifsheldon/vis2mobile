"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { energyData } from "@/lib/energyData";

const COLORS = {
  "Fossil Fuels": "#4c78a8",
  "Nuclear Energy": "#f58518",
  Renewables: "#e45756",
};

export function Visualization() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-4 pt-12">
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold text-zinc-900 leading-tight">
          Energy Generation Trends
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Net energy generation by source from 2001 to 2017.
        </p>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={energyData}
            stackOffset="expand"
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717a" }}
              interval={2}
            />
            <YAxis
              tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717a" }}
              width={45}
            />
            <Tooltip
              formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="Fossil Fuels"
              stackId="1"
              stroke={COLORS["Fossil Fuels"]}
              fill={COLORS["Fossil Fuels"]}
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="Nuclear Energy"
              stackId="1"
              stroke={COLORS["Nuclear Energy"]}
              fill={COLORS["Nuclear Energy"]}
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="Renewables"
              stackId="1"
              stroke={COLORS.Renewables}
              fill={COLORS.Renewables}
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 px-2 grid grid-cols-1 gap-3">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-800">{key}</span>
              <span className="text-xs text-zinc-500">
                {key === "Renewables"
                  ? "Growing share of total output"
                  : key === "Fossil Fuels"
                    ? "Gradually declining since 2010"
                    : "Stable baseload power source"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 px-2 text-[10px] text-zinc-400 border-t border-zinc-100">
        Source: US Energy Information Administration
      </div>
    </div>
  );
}
