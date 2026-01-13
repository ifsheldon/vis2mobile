"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { movieData } from "@/lib/movieData";

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
}

const CustomLabel = (props: CustomLabelProps) => {
  const { x, y, width, height, value, index } = props;
  const movie = index !== undefined ? movieData.movies[index] : null;

  if (
    !movie ||
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  )
    return null;

  return (
    <g>
      <text
        x={0}
        y={y - 14}
        fill="#fafafa"
        fontSize={15}
        fontWeight="600"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {movie.Title.length > 32
          ? `${movie.Title.substring(0, 29)}...`
          : movie.Title}
      </text>
      <text
        x={x + width + 8}
        y={y + height / 2 + 5}
        fill="#ffffff"
        fontSize={13}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        textAnchor="start"
      >
        {value}
      </text>
    </g>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = (data["IMDB Rating"] - movieData.averageRating).toFixed(2);
    return (
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl shadow-2xl text-sm ring-1 ring-white/10">
        <p className="font-bold text-zinc-100 mb-2 text-base">{data.Title}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-8 items-center">
            <span className="text-zinc-400">IMDB Rating</span>
            <span className="text-purple-400 font-bold text-lg">
              {data["IMDB Rating"]}
            </span>
          </div>
          <div className="flex justify-between gap-8 items-center">
            <span className="text-zinc-400">Vs. Global Avg</span>
            <span className="text-pink-400 font-medium">+{diff} pts</span>
          </div>
          {data["Major Genre"] && (
            <div className="pt-2 mt-2 border-t border-zinc-800">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium uppercase tracking-wider">
                {data["Major Genre"]}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function Visualization() {
  // Each item needs space for title (above bar) + bar + gap.
  // Using 90px per item to give plenty of vertical breathing room.
  const chartHeight = movieData.movies.length * 90;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Glassmorphic Header */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
            Movie Giants
          </h1>
          <div className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 uppercase tracking-tighter">
            IMDB Outliers
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.2em]">
          Exceeding Global Average by 2.5+
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {/* Legend/Context info */}
        <div className="mb-8 flex items-center gap-3 bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50">
          <div className="w-1 h-8 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              Global Average Rating
            </p>
            <p className="text-sm font-mono text-rose-400">
              {movieData.averageRating.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ height: chartHeight, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={movieData.movies}
              margin={{ top: 25, right: 45, left: 0, bottom: 20 }}
              barSize={32}
              barGap={-32} // Perfectly overlap the bars
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <XAxis type="number" hide domain={[0, 10]} />
              <YAxis type="category" dataKey="Title" hide />

              <Tooltip
                cursor={{ fill: "white", opacity: 0.05, radius: 12 }}
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: false, y: true }}
              />

              {/* Background track */}
              <Bar
                dataKey={() => 10}
                fill="#18181b"
                radius={[8, 8, 8, 8]}
                isAnimationActive={false}
              />

              {/* Reference Line (Mean) */}
              <ReferenceLine
                x={movieData.averageRating}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={2}
                strokeOpacity={0.6}
              />

              {/* Main Data Bar */}
              <Bar
                dataKey="IMDB Rating"
                fill="url(#barGradient)"
                radius={[0, 8, 8, 0]}
                isAnimationActive={false}
                style={{ filter: "url(#glow)" }}
              >
                <LabelList dataKey="IMDB Rating" content={<CustomLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}
