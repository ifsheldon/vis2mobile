"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fruitSalesData } from "@/lib/data";

export function Visualization() {
  return (
    <div className="w-full h-full bg-white p-4 flex flex-col font-sans">
      <h2 className="text-xl font-bold text-center mb-1 text-gray-800">
        Fruit Sales
      </h2>
      <p className="text-sm text-center text-gray-500 mb-4">
        Weekly sales performance
      </p>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={fruitSalesData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="shortDay"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ fontSize: "14px", fontWeight: 500 }}
              cursor={{
                stroke: "#9ca3af",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "10px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="apple"
              name="Apple"
              stroke="#6f58e9"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#6f58e9" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#6f58e9" }}
            />
            <Line
              type="monotone"
              dataKey="banana"
              name="Banana"
              stroke="#94d13d"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#94d13d" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#94d13d" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col items-center justify-center">
          <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
            Top Apple
          </div>
          <div className="text-2xl font-bold text-indigo-900">Friday</div>
          <div className="text-sm text-indigo-700 font-medium">160 units</div>
        </div>
        <div className="bg-lime-50 p-4 rounded-xl border border-lime-100 flex flex-col items-center justify-center">
          <div className="text-xs text-lime-600 font-semibold uppercase tracking-wider mb-1">
            Top Banana
          </div>
          <div className="text-2xl font-bold text-lime-900">Friday</div>
          <div className="text-sm text-lime-700 font-medium">220 units</div>
        </div>
      </div>
    </div>
  );
}
