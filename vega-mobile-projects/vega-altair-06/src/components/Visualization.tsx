"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import rawData from "../lib/weather-data.json";

const data = rawData.map((d) => ({
  ...d,
  range: [d.min, d.max] as [number, number],
}));

// biome-ignore lint/suspicious/noExplicitAny: Recharts Tooltip props are complex
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { min, max } = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-zinc-100 text-xs">
        <p className="font-bold text-zinc-800 mb-1">{label}</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-4">
            <span className="text-cyan-600 font-medium">Min</span>
            <span className="font-mono">{min.toFixed(1)}°C</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-orange-500 font-medium">Max</span>
            <span className="font-mono">{max.toFixed(1)}°C</span>
          </p>
          <div className="h-px bg-zinc-200 my-1" />
          <p className="flex justify-between gap-4 text-zinc-500">
            <span>Range</span>
            <span className="font-mono">{(max - min).toFixed(1)}°C</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-50 p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-900">Seattle Weather</h2>
        <p className="text-sm text-zinc-500">
          Temperature range by month (2012-2015)
        </p>
      </div>

      <div className="flex-1 w-full min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
                <stop offset="100%" stopColor="#f97316" /> {/* Orange-500 */}
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e4e4e7"
            />
            <XAxis
              type="number"
              hide
              domain={[-15, 45]} // Slightly wider than data range
            />
            <YAxis
              dataKey="month"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Bar
              dataKey="range"
              fill="url(#tempGradient)"
              radius={[4, 4, 4, 4]}
              barSize={24} // Thicker bars for touch
              isAnimationActive={false}
            >
              <LabelList
                dataKey="min"
                position="left"
                // biome-ignore lint/suspicious/noExplicitAny: Recharts props are complex
                content={(props: any) => {
                  const { x, y, height, value } = props;
                  return (
                    <text
                      x={x - 6}
                      y={y + height / 2}
                      dy={4}
                      textAnchor="end"
                      fill="#06b6d4"
                      fontSize={11}
                      fontWeight={600}
                    >
                      {value.toFixed(1)}
                    </text>
                  );
                }}
              />
              <LabelList
                dataKey="max"
                position="right"
                // biome-ignore lint/suspicious/noExplicitAny: Recharts props are complex
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  // The 'x' prop for right-aligned label in Recharts with range bars
                  // can be tricky. Usually 'x' is the start of the bar?
                  // For range bars, the 'width' is the length of the bar.
                  // 'x' is the left starting point.
                  // So the right end is x + width.
                  return (
                    <text
                      x={x + width + 6}
                      y={y + height / 2}
                      dy={4}
                      textAnchor="start"
                      fill="#f97316"
                      fontSize={11}
                      fontWeight={600}
                    >
                      {value.toFixed(1)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
