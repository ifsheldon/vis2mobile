"use client";

import { Calendar, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data } from "@/lib/data";

export function Visualization() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      formattedDate: new Date(d.month).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      year: new Date(d.month).getFullYear(),
    }));
  }, []);

  const latest = chartData[chartData.length - 1];
  const isPositive = latest.nonfarm_change > 0;

  const stats = [
    {
      label: "Latest Total",
      value: `${(latest.nonfarm / 1000).toFixed(1)}M`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Monthly Change",
      value: `${latest.nonfarm_change > 0 ? "+" : ""}${latest.nonfarm_change}K`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-emerald-600" : "text-orange-600",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-50 overflow-y-auto">
      {/* Header */}
      <div className="p-6 pt-12 bg-white border-b border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 leading-tight">
          Nonfarm Employment
        </h1>
        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Jan 2006 — Apr 2012
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-50 p-3 rounded-xl border border-zinc-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                  {stat.label}
                </span>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 pb-12">
        {/* Monthly Change Chart */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-800 mb-4 px-2">
            Monthly Change (in thousands)
          </h2>
          <div className="h-[240px] w-full bg-white rounded-2xl p-2 shadow-sm border border-zinc-100">
            {isMounted && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    interval={11} // Show every year
                    tick={{ fill: "#a1a1aa" }}
                  />
                  <YAxis
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#a1a1aa" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="nonfarm_change">
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.month}
                        fill={entry.nonfarm_change > 0 ? "#4682b4" : "#ffa500"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Total Employment Trend */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-800 mb-4 px-2">
            Total Nonfarm Employment Trend
          </h2>
          <div className="h-[200px] w-full bg-white rounded-2xl p-2 shadow-sm border border-zinc-100">
            {isMounted && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4682b4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4682b4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    interval={11}
                    tick={{ fill: "#a1a1aa" }}
                  />
                  <YAxis
                    domain={["dataMin - 1000", "dataMax + 1000"]}
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#a1a1aa" }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: number | string | undefined) => [
                      value ? `${(Number(value) / 1000).toFixed(2)}M` : "0",
                      "Total",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="nonfarm"
                    stroke="#4682b4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <div className="px-2 py-4">
          <p className="text-[10px] text-zinc-400 italic leading-relaxed">
            The charts highlight the impact of the 2008 financial crisis,
            showing a significant dip in total employment and prolonged negative
            monthly changes during 2008-2009.
          </p>
        </div>
      </div>
    </div>
  );
}
