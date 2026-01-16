"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { salesData } from "@/lib/data";

export function Visualization() {
  const totalApple = salesData.reduce((acc, curr) => acc + curr.apple, 0);
  const totalBanana = salesData.reduce((acc, curr) => acc + curr.banana, 0);

  return (
    <div className="w-full h-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col pt-12 px-4 pb-8 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
          Weekly Sales
        </h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Apple vs Banana (Units)
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#4682b4]" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Apple
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
            {totalApple}
          </div>
          <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
            Total Units
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[orange]" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              Banana
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">
            {totalBanana}
          </div>
          <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
            Total Units
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesData}
            margin={{
              top: 20,
              right: 10,
              left: -25, // Adjusted to fit Y-axis labels better
              bottom: 10,
            }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-zinc-800"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "12px",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: 600 }}
              labelStyle={{
                color: "#71717a",
                marginBottom: "4px",
                fontSize: "11px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
            />
            <Bar
              dataKey="apple"
              name="Apple"
              fill="#4682b4"
              radius={[6, 6, 6, 6]}
              maxBarSize={50}
            />
            <Bar
              dataKey="banana"
              name="Banana"
              fill="orange"
              radius={[6, 6, 6, 6]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
