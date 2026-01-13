
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import data from "../../../data.json";

export function Visualization() {
  return (
    <div className="w-full h-[500px] p-4 bg-white rounded-lg shadow">
      <h1 className="text-lg font-bold text-gray-800">
        Temperature Variation by Month
      </h1>
      <p className="text-sm text-gray-500 mb-4">Seattle Weather, 2012-2015</p>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 30, left: -10, bottom: 0 }}
        >
          <XAxis type="number" domain={[-15, 45]} hide />
          <YAxis
            dataKey="month"
            type="category"
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="maxTemp" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
