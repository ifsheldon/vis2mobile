"use client";

import { ArrowUpDown, Feather, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type DensityPoint, getProcessedData } from "@/lib/data-processing";

interface ChartCardProps {
  title: string;
  data: DensityPoint[];
  color: string;
  icon: React.ReactNode;
  unit: string;
  gradientId: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number | string; payload: unknown }[];
  label?: string | number;
  unit: string;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
  color,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900/90 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-xl">
        <p className="text-neutral-400 text-xs mb-1">Value</p>
        <p className="text-lg font-bold" style={{ color: color }}>
          {Number(label).toFixed(1)}{" "}
          <span className="text-sm text-neutral-500">{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

function DensityChart({
  title,
  data,
  color,
  icon,
  unit,
  gradientId,
}: ChartCardProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Calculate domain for better X-axis scaling
  const xValues = data.map((d) => d.value);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const padding = (maxX - minX) * 0.05;

  return (
    <div className="relative group rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-100">{title}</h3>
            <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">
              Kernel Density
            </p>
          </div>
        </div>
        {hoverValue !== null && (
          <div className="text-right animate-in fade-in slide-in-from-right-2 duration-200">
            <p
              className="text-2xl font-bold tabular-nums tracking-tight"
              style={{ color }}
            >
              {hoverValue.toFixed(1)}
              <span className="text-sm ml-0.5 opacity-60">{unit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activeLabel) {
                setHoverValue(Number(e.activeLabel));
              }
            }}
            onMouseLeave={() => setHoverValue(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={true}
              horizontal={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="value"
              type="number"
              domain={[minX - padding, maxX + padding]}
              tickCount={6}
              tick={{ fill: "#737373", fontSize: 11 }}
              tickLine={{ stroke: "#404040" }}
              axisLine={false}
              tickFormatter={(val) => Math.round(val).toString()}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              content={<CustomTooltip unit={unit} color={color} />}
              cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: "4 4" }}
              isAnimationActive={false} // Performance
            />
            <Area
              type="monotone"
              dataKey="density"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Visualization() {
  const data = useMemo(() => getProcessedData(), []);

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-4 font-sans selection:bg-white/20">
      <div className="max-w-md mx-auto flex flex-col gap-6 pb-10">
        {/* Main Header */}
        <header className="pt-4 pb-2">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
            Penguin Metrics
          </h1>
          <p className="text-neutral-400 mt-1">
            Distribution of physical characteristics across Adelie, Chinstrap,
            and Gentoo species.
          </p>
        </header>

        {/* Charts Stack */}
        <div className="flex flex-col gap-6">
          <DensityChart
            title="Beak Length"
            data={data.beakLength}
            color="#f472b6" // Pink-400
            icon={<Ruler className="w-5 h-5 text-pink-400" />}
            unit="mm"
            gradientId="gradBeakLength"
          />

          <DensityChart
            title="Beak Depth"
            data={data.beakDepth}
            color="#c084fc" // Purple-400
            icon={<ArrowUpDown className="w-5 h-5 text-purple-400" />}
            unit="mm"
            gradientId="gradBeakDepth"
          />

          <DensityChart
            title="Flipper Length"
            data={data.flipperLength}
            color="#22d3ee" // Cyan-400
            icon={<Feather className="w-5 h-5 text-cyan-400" />}
            unit="mm"
            gradientId="gradFlipper"
          />
        </div>

        <footer className="text-center text-xs text-neutral-600 mt-8">
          Data Source: Palmer Station Antarctica LTER
        </footer>
      </div>
    </div>
  );
}
