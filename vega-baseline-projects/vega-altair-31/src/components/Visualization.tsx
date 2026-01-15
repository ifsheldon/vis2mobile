"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { barleyData } from "@/lib/barley_data";

export function Visualization() {
  const sites = useMemo(
    () => Array.from(new Set(barleyData.map((d) => d.site))),
    [],
  );
  const years = [1931, 1932];

  const chartData = useMemo(() => {
    return years.map((year) => {
      const row: Record<string, any> = { year: year.toString() };
      sites.forEach((site) => {
        const found = barleyData.find(
          (d) => d.site === site && d.year === year,
        );
        row[site] = found ? found.yield : null;
      });
      return row;
    });
  }, [sites]);

  const colors = [
    "#6366f1", // indigo
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#3b82f6", // blue
    "#8b5cf6", // violet
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 p-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Barley Yield Trends
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Median yield by site (1931 vs 1932)
        </p>
      </div>

      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-2 min-h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 30, right: 50, left: 50, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="year"
              padding={{ left: 10, right: 10 }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 16, fontWeight: 700, fill: "#64748b" }}
            />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingTop: "30px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            {sites.map((site, index) => (
              <Line
                key={site}
                type="linear"
                dataKey={site}
                stroke={colors[index % colors.length]}
                strokeWidth={4}
                dot={{ r: 6, fill: "#fff", strokeWidth: 3 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                isAnimationActive={false}
                label={(props: any) => {
                  const { x, y, value, index: pointIndex } = props;
                  const isLeft = pointIndex === 0;

                  let dy = 0;
                  if (isLeft) {
                    if (site === "Duluth") dy = -12;
                    if (site === "Grand Rapids") dy = 4;
                    if (site === "Morris") dy = 16;
                  } else {
                    if (site === "Waseca") dy = 12;
                    if (site === "Morris") dy = -12;
                  }

                  return (
                    <text
                      x={isLeft ? x - 12 : x + 12}
                      y={y + dy}
                      fill={colors[index % colors.length]}
                      fontSize={13}
                      fontWeight="bold"
                      textAnchor={isLeft ? "end" : "start"}
                      alignmentBaseline="middle"
                    >
                      {value.toFixed(1)}
                    </text>
                  );
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-center px-2">
        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          Data: MN Ag Experiment Station
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          Unit: Bushels/Acre
        </div>
      </div>
    </div>
  );
}
