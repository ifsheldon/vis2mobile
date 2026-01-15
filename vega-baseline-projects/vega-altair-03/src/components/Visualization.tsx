"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { energyData } from "@/lib/transformed_data";

const COLORS = {
  fossil: "#3b82f6", // blue-500
  nuclear: "#f97316", // orange-500
  renewables: "#22c55e", // green-500
};

export function Visualization() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-white dark:bg-zinc-950">
        Loading...
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return value.toString();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 p-4 pt-12 overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Energy Generation in Iowa
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Net generation by source (2001-2017)
        </p>
      </div>

      <div className="h-[400px] w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={energyData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              interval={3}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={formatYAxis}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={50}
              iconType="circle"
              wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
            />
            <Area
              type="linear"
              dataKey="Fossil Fuels"
              stroke={COLORS.fossil}
              fill={COLORS.fossil}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area
              type="linear"
              dataKey="Nuclear Energy"
              stroke={COLORS.nuclear}
              fill={COLORS.nuclear}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area
              type="linear"
              dataKey="Renewables"
              stroke={COLORS.renewables}
              fill={COLORS.renewables}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl shrink-0 mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Insights
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The data shows a significant shift towards{" "}
          <span className="text-green-600 font-medium font-semibold">
            Renewables
          </span>{" "}
          in Iowa, which grew from 1,437 to 21,933 units between 2001 and 2017.
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          Meanwhile,{" "}
          <span className="text-blue-600 font-medium font-semibold">
            Fossil Fuels
          </span>{" "}
          generation peaked around 2010 and has been declining since then.
        </p>
      </div>
    </div>
  );
}
