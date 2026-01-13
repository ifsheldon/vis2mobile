"use client";

import { clsx } from "clsx";
import { Info } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Data ---
// Box Plot Statistics (in grams) for Palmer Penguins
const penguinData = [
  {
    species: "Adelie",
    min: 2850,
    q1: 3350,
    median: 3700,
    q3: 4000,
    max: 4775,
    color: "#06b6d4", // Cyan-500
    displayColor: "text-cyan-500",
    bgGradient: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "stroke-cyan-500",
  },
  {
    species: "Chinstrap",
    min: 2700,
    q1: 3487,
    median: 3700,
    q3: 3950,
    max: 4800,
    color: "#8b5cf6", // Violet-500
    displayColor: "text-violet-500",
    bgGradient: "from-violet-500/20 to-violet-500/5",
    borderColor: "stroke-violet-500",
  },
  {
    species: "Gentoo",
    min: 3950,
    q1: 4700,
    median: 5000,
    q3: 5500,
    max: 6300,
    color: "#f43f5e", // Rose-500
    displayColor: "text-rose-500",
    bgGradient: "from-rose-500/20 to-rose-500/5",
    borderColor: "stroke-rose-500",
  },
];

// --- Types ---
type PenguinData = (typeof penguinData)[0];

interface CustomBoxShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: PenguinData;
  xAxis: {
    scale: (value: number) => number;
  };
}

// --- Custom Shape ---
const CustomBoxShape = (props: unknown) => {
  const { y, height, payload, xAxis } = props as CustomBoxShapeProps;
  const data = payload;

  if (!data) return null;

  // We need to map the data values (min, q1, median, q3, max) to pixels.
  // The 'xAxis' prop in CustomShape contains the scale function.
  const scale = xAxis.scale;

  const minPos = scale(data.min);
  const q1Pos = scale(data.q1);
  const medianPos = scale(data.median);
  const q3Pos = scale(data.q3);
  const maxPos = scale(data.max);

  const boxHeight = 24; // Thicker box for better touch/visibility
  const centerY = y + height / 2;
  const topY = centerY - boxHeight / 2;
  const bottomY = centerY + boxHeight / 2;

  return (
    <g>
      {/* Range Line (Whisker) */}
      <line
        x1={minPos}
        y1={centerY}
        x2={maxPos}
        y2={centerY}
        stroke={data.color}
        strokeWidth={2}
        opacity={0.6}
      />

      {/* Min Cap */}
      <line
        x1={minPos}
        y1={centerY - 6}
        x2={minPos}
        y2={centerY + 6}
        stroke={data.color}
        strokeWidth={2}
      />

      {/* Max Cap */}
      <line
        x1={maxPos}
        y1={centerY - 6}
        x2={maxPos}
        y2={centerY + 6}
        stroke={data.color}
        strokeWidth={2}
      />

      {/* IQR Box */}
      <rect
        x={q1Pos}
        y={topY}
        width={q3Pos - q1Pos}
        height={boxHeight}
        fill={data.color}
        fillOpacity={0.3}
        stroke={data.color}
        strokeWidth={2}
        rx={4} // Rounded corners for modern feel
      />

      {/* Median Line */}
      <line
        x1={medianPos}
        y1={topY}
        x2={medianPos}
        y2={bottomY}
        stroke="#ffffff"
        strokeWidth={3}
      />
    </g>
  );
};

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PenguinData;
    return (
      <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700 p-4 rounded-xl shadow-xl min-w-[200px]">
        <h3 className={clsx("font-bold text-lg mb-2", data.displayColor)}>
          {data.species}
        </h3>
        <div className="space-y-1 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span className="opacity-60">Max:</span>
            <span className="font-mono">{data.max}g</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60">Q3 (75%):</span>
            <span className="font-mono">{data.q3}g</span>
          </div>
          <div className="flex justify-between font-semibold text-white">
            <span>Median:</span>
            <span className="font-mono">{data.median}g</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60">Q1 (25%):</span>
            <span className="font-mono">{data.q1}g</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-60">Min:</span>
            <span className="font-mono">{data.min}g</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
export function Visualization() {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Penguin Mass
          </h1>
          <button
            type="button"
            className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400"
          >
            <Info size={20} />
          </button>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Distribution of body mass (g) across three penguin species in the
          Palmer Archipelago.
        </p>
      </header>

      {/* Chart Container */}
      <div className="flex-1 w-full px-2 relative min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={penguinData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#3f3f46"
              strokeOpacity={0.4}
              strokeDasharray="4 4"
            />
            <XAxis
              type="number"
              domain={[2000, 7000]}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <YAxis
              dataKey="species"
              type="category"
              width={80}
              tick={{ fill: "#ffffff", fontSize: 13, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
              trigger="click" // Better for mobile
            />
            <Bar dataKey="median" shape={<CustomBoxShape />}>
              {penguinData.map((entry) => (
                <Cell key={`cell-${entry.species}`} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Tip */}
      <div className="px-6 pb-8 pt-2">
        <div className="flex gap-4 items-center justify-center text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-zinc-700/50 border border-zinc-600" />
            <span>IQR (50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-white" />
            <span>Median</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-zinc-600 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-zinc-600" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-zinc-600" />
            </div>
            <span>Range</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3">
          Tap on a bar to view details
        </p>
      </div>
    </div>
  );
}
