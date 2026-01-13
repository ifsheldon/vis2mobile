"use client";

import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Data ---
interface BoxPlotData {
  species: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  color: string;
}

const PENGUIN_DATA: BoxPlotData[] = [
  {
    species: "Adelie",
    min: 2850,
    q1: 3350,
    median: 3700,
    q3: 4000,
    max: 4775,
    outliers: [],
    color: "#4c78a8",
  },
  {
    species: "Chinstrap",
    min: 2700,
    q1: 3487.5,
    median: 3700,
    q3: 3950,
    max: 4800,
    outliers: [2700, 4800],
    color: "#f58518",
  },
  {
    species: "Gentoo",
    min: 3950,
    q1: 4700,
    median: 5000,
    q3: 5500,
    max: 6300,
    outliers: [],
    color: "#e45756",
  },
];

// Flatten outliers for the scatter plot
const outlierData = PENGUIN_DATA.flatMap((d) =>
  d.outliers.map((val) => ({ species: d.species, mass: val, color: d.color })),
);

// --- Custom Shape for Box Plot ---
// biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape props are complex
const CustomBoxPlot = (props: any) => {
  const { x, width, payload, yAxis } = props;

  if (!payload || !payload.min || !yAxis) return null;

  const yScale = yAxis.scale;

  const minPos = yScale(payload.min);
  const q1Pos = yScale(payload.q1);
  const medianPos = yScale(payload.median);
  const q3Pos = yScale(payload.q3);
  const maxPos = yScale(payload.max);

  const center = x + width / 2;
  const boxWidth = width * 0.6; // Slightly narrower than the column
  const boxLeft = center - boxWidth / 2;

  // Colors
  const strokeColor = payload.color;
  const fillColor = payload.color;

  return (
    <g>
      {/* Whisker Line (Min to Max) - Draw behind box */}
      <line
        x1={center}
        y1={minPos}
        x2={center}
        y2={maxPos}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Min Cap */}
      <line
        x1={center - boxWidth / 4}
        y1={minPos}
        x2={center + boxWidth / 4}
        y2={minPos}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Max Cap */}
      <line
        x1={center - boxWidth / 4}
        y1={maxPos}
        x2={center + boxWidth / 4}
        y2={maxPos}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Box (Q1 to Q3) */}
      <rect
        x={boxLeft}
        y={q3Pos}
        width={boxWidth}
        height={Math.abs(q1Pos - q3Pos)}
        stroke={strokeColor}
        strokeWidth={2}
        fill={fillColor}
        fillOpacity={0.4}
        rx={4}
      />

      {/* Median Line */}
      <line
        x1={boxLeft}
        y1={medianPos}
        x2={boxLeft + boxWidth}
        y2={medianPos}
        stroke={strokeColor}
        strokeWidth={3}
      />
    </g>
  );
};

export function Visualization() {
  const [activeSpecies, setActiveSpecies] = useState<string | null>(null);

  const activeData = activeSpecies
    ? PENGUIN_DATA.find((d) => d.species === activeSpecies)
    : null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-6 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Penguin Body Mass
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Distribution by Species (g)
        </p>
      </header>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0 relative px-2">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={PENGUIN_DATA}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              onClick={(state) => {
                if (state?.activeLabel) {
                  setActiveSpecies(String(state.activeLabel));
                } else {
                  // Deselect if clicking empty space? Maybe better to keep selected.
                  // setActiveSpecies(null);
                }
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="species"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 14, fontWeight: 600 }}
                dy={10}
                allowDuplicatedCategory={false}
              />
              <YAxis
                domain={[2500, 6500]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickCount={6}
              />

              {/* The Box Plot Layer */}
              {/* We use Bar to allocate space, but draw custom shape. 
                We need to bind the custom shape. 
                dataKey can be anything numeric, strictly speaking, as long as we have the payload.
                But Recharts passes `payload` from the data object to the shape.
            */}
              <Bar
                dataKey="max" // Dummy key to control height logic if needed, but custom shape handles y-pos
                shape={<CustomBoxPlot />}
                isAnimationActive={true}
                // biome-ignore lint/suspicious/noExplicitAny: Recharts event types are complex
                onClick={(data: any) =>
                  setActiveSpecies(data.species || data.payload?.species)
                }
              >
                {PENGUIN_DATA.map((entry) => (
                  <Cell
                    key={entry.species}
                    cursor="pointer"
                    fillOpacity={activeSpecies === entry.species ? 1 : 0.7} // Highlight active
                  />
                ))}
              </Bar>

              {/* Outliers Layer */}
              <Scatter
                data={outlierData}
                fill="#8884d8"
                shape="circle" // Default circle
              >
                {outlierData.map((entry, index) => (
                  <Cell
                    key={`${entry.species}-${index}`}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Interaction Hint (Only show if nothing selected) */}
        {!activeSpecies && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
          >
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
              <Info size={14} />
              Tap a column for details
            </span>
          </motion.div>
        )}
      </div>

      {/* Details Card (Bottom Sheet style) */}
      <AnimatePresence>
        {activeData && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="shrink-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] border-t border-slate-100 p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeData.color }}
                />
                {activeData.species}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSpecies(null)}
                className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md"
              >
                CLOSE
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Min" value={activeData.min} />
              <StatBox label="Median" value={activeData.median} highlight />
              <StatBox label="Max" value={activeData.max} />
              <StatBox label="Q1" value={activeData.q1} secondary />
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/50">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Outliers
                </span>
                <span className="text-sm font-semibold text-slate-600 mt-0.5">
                  {activeData.outliers.length > 0
                    ? activeData.outliers.length
                    : "None"}
                </span>
              </div>
              <StatBox label="Q3" value={activeData.q3} secondary />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
  secondary = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  secondary?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border",
        highlight
          ? "bg-indigo-50 border-indigo-100"
          : "bg-white border-slate-100",
        secondary && "bg-slate-50 border-slate-100",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wider mb-1",
          highlight ? "text-indigo-600" : "text-slate-400",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-lg font-bold tabular-nums tracking-tight",
          highlight ? "text-indigo-900" : "text-slate-700",
        )}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}
