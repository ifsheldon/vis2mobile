"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import monthlyData from "../lib/monthly_weather.json";

interface DataPoint {
  month: string;
  min: number;
  max: number;
  range: [number, number];
}

const data: DataPoint[] = monthlyData.map((d) => ({
  month: d.month,
  min: d.min,
  max: d.max,
  range: [d.min, d.max],
}));

interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: [number, number];
}

const MinLabel = (props: LabelProps) => {
  const { x, y, height, value } = props;
  if (
    value === undefined ||
    x === undefined ||
    y === undefined ||
    height === undefined
  )
    return null;
  return (
    <text
      x={x}
      y={y + height / 2}
      fill="#666"
      textAnchor="end"
      dominantBaseline="middle"
      className="text-[10px] font-medium"
      dx={-5}
    >
      {value[0]}°
    </text>
  );
};

const MaxLabel = (props: LabelProps) => {
  const { x, y, width, height, value } = props;
  if (
    value === undefined ||
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  )
    return null;
  return (
    <text
      x={x + width}
      y={y + height / 2}
      fill="#666"
      textAnchor="start"
      dominantBaseline="middle"
      className="text-[10px] font-medium"
      dx={5}
    >
      {value[1]}°
    </text>
  );
};

export function Visualization() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-6 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Temperature Variation
        </h1>
        <p className="text-sm text-gray-500">
          Seattle weather monthly range, 2012-2015
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 35, left: 0, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f0f0f0"
            />
            <XAxis type="number" domain={[-15, 45]} hide />
            <YAxis
              dataKey="month"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4b5563", fontSize: 13, fontWeight: 600 }}
              width={45}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as DataPoint;
                  return (
                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
                      <p className="font-bold text-gray-900 mb-1">{d.month}</p>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-gray-500">Min</span>
                          <span className="text-xs font-semibold text-blue-600">
                            {d.min}°C
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-gray-500">Max</span>
                          <span className="text-xs font-semibold text-red-600">
                            {d.max}°C
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="range"
              radius={[8, 8, 8, 8]}
              background={{ fill: "#f9fafb", radius: 8 }}
            >
              {data.map((entry) => {
                let color = "#f59e0b"; // moderate
                if (entry.max > 30)
                  color = "#ef4444"; // hot
                else if (entry.min < 0) color = "#3b82f6"; // cold

                return (
                  <Cell key={entry.month} fill={color} fillOpacity={0.85} />
                );
              })}
              <LabelList dataKey="range" content={<MinLabel />} />
              <LabelList dataKey="range" content={<MaxLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        <div className="flex flex-col items-center">
          <div className="w-full h-1.5 rounded-full bg-blue-500 mb-1 opacity-80" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Cold
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-1.5 rounded-full bg-amber-500 mb-1 opacity-80" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Mild
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-1.5 rounded-full bg-red-500 mb-1 opacity-80" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Hot
          </span>
        </div>
      </div>
    </div>
  );
}
