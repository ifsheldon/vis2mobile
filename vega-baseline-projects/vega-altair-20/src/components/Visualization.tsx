"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  Sky: "#416D9D",
  "Shady side of a pyramid": "#674028",
  "Sunny side of a pyramid": "#DEAC58",
};

interface LegendItem {
  value: string;
  color: string;
  payload: {
    value: number;
  };
}

interface CustomLegendProps {
  payload?: LegendItem[];
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex flex-col gap-3 px-2">
      {payload.map((entry) => (
        <div
          key={entry.value}
          className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-lg shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-semibold text-zinc-700">
              {entry.value}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-zinc-900">
              {entry.payload.value}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function Visualization() {
  // Order of data matches the original spec for the pyramid visual gag
  const chartData = [
    { name: "Sky", value: 75, color: COLORS.Sky },
    {
      name: "Shady side of a pyramid",
      value: 10,
      color: COLORS["Shady side of a pyramid"],
    },
    {
      name: "Sunny side of a pyramid",
      value: 15,
      color: COLORS["Sunny side of a pyramid"],
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center pt-14 pb-8 px-6 overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Pyramid
        </h2>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Visualizing the obvious
        </p>
      </div>

      <div className="w-full aspect-square max-w-[280px] relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              startAngle={135}
              endAngle={495}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Central Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-zinc-900">100%</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Pyramid
          </span>
        </div>
      </div>

      <div className="w-full mt-10">
        <CustomLegend
          payload={chartData.map((d) => ({
            value: d.name,
            color: d.color,
            payload: { value: d.value },
          }))}
        />
      </div>

      <div className="mt-auto pt-12 text-[10px] text-zinc-400 font-medium">
        Source: altair-viz.github.io/gallery/pyramid.html
      </div>
    </div>
  );
}
