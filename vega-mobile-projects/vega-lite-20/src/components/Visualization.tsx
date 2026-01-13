"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import data from "../lib/data.json";

interface RatingData {
  genre: string;
  rating: number;
}

const ratingLabels: Record<number, string> = {
  0: "Poor",
  5: "Neutral",
  10: "Great",
};

const getColor = (rating: number) => {
  if (rating < 4) return "#ef4444"; // Red
  if (rating < 7) return "#f59e0b"; // Amber
  return "#10b981"; // Emerald
};

interface YTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const CustomYTick = (props: YTickProps) => {
  const { x, y, payload } = props;
  if (x === undefined || y === undefined || payload === undefined) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={-18}
        dy={0}
        textAnchor="start"
        className="text-sm font-semibold tracking-tight fill-zinc-200"
      >
        {payload.value}
      </text>
    </g>
  );
};

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: RatingData;
}

const CustomDot = (props: DotProps) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || payload === undefined)
    return null;
  const color = getColor(payload.rating);
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={color}
        className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      />
      <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.2} />
      <text
        x={cx + 15}
        y={cy + 4}
        fill={color}
        className="text-xs font-bold font-mono"
      >
        {payload.rating.toFixed(1)}
      </text>
    </g>
  );
};

export function Visualization() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-zinc-950 p-4 font-sans text-zinc-100 flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-1">
          Movie Genre Ratings
        </h2>
        <p className="text-zinc-400 text-sm">
          Mean IMDB Rating per Major Genre
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={data.length * 52 + 40}>
          <ScatterChart
            layout="vertical"
            margin={{ top: 20, right: 40, bottom: 20, left: 0 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="#3f3f46"
            />
            <XAxis
              type="number"
              dataKey="rating"
              domain={[0, 10]}
              ticks={[0, 5, 10]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => ratingLabels[val] || val}
              className="text-[10px] font-medium fill-zinc-500"
              orientation="top"
            />
            <YAxis
              type="category"
              dataKey="genre"
              axisLine={false}
              tickLine={false}
              width={10}
              interval={0}
              tick={<CustomYTick />}
            />
            <ZAxis type="number" range={[64, 64]} />

            {/* Background lines for each genre */}
            {data.map((entry) => (
              <ReferenceLine
                key={`line-${entry.genre}`}
                y={entry.genre}
                stroke="#27272a"
                strokeWidth={2}
              />
            ))}

            <Scatter name="Genres" data={data} shape={<CustomDot />}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.genre}`}
                  fill={getColor(entry.rating)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1 border-t border-zinc-800 pt-4">
        <span>0 Poor</span>
        <span>5 Neutral</span>
        <span>10 Great</span>
      </div>
    </div>
  );
}
