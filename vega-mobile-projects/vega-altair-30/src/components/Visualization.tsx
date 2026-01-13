"use client";

import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { x: 1, y: 0.8414709848078965 },
  { x: 1.1224489795918366, y: 0.9011647193541048 },
  { x: 1.2448979591836735, y: 0.947363487374668 },
  { x: 1.3673469387755102, y: 0.9793754610443571 },
  { x: 1.489795918367347, y: 0.996721260174607 },
  { x: 1.6122448979591837, y: 0.9991411309450606 },
  { x: 1.7346938775510203, y: 0.9865988357241925 },
  { x: 1.8571428571428572, y: 0.9592821957288404 },
  { x: 1.9795918367346939, y: 0.9176002783963034 },
  { x: 2.1020408163265305, y: 0.862177271588186 },
  { x: 2.2244897959183674, y: 0.793843136359957 },
  { x: 2.3469387755102042, y: 0.7136211782712532 },
  { x: 2.4693877551020407, y: 0.6227127233569034 },
  { x: 2.5918367346938775, y: 0.5224791282364234 },
  { x: 2.7142857142857144, y: 0.4144213937610953 },
  { x: 2.836734693877551, y: 0.3001576874848237 },
  { x: 2.9591836734693877, y: 0.18139911156038566 },
  { x: 3.0816326530612246, y: 0.05992407893750542 },
  { x: 3.204081632653061, y: -0.06244831842011605 },
  { x: 3.326530612244898, y: -0.1838855504871279 },
  { x: 3.4489795918367347, y: -0.30256909136419585 },
  { x: 3.571428571428571, y: -0.41672165175349946 },
  { x: 3.693877551020408, y: -0.5246337939149841 },
  { x: 3.816326530612245, y: -0.6246895305436606 },
  { x: 3.9387755102040813, y: -0.7153905242240666 },
  { x: 4.061224489795919, y: -0.7953785250743864 },
  { x: 4.183673469387755, y: -0.8634557105758878 },
  { x: 4.3061224489795915, y: -0.9186026229981786 },
  { x: 4.428571428571429, y: -0.9599934358068326 },
  { x: 4.551020408163265, y: -0.9870083204385179 },
  { x: 4.673469387755102, y: -0.9992427282508292 },
  { x: 4.795918367346939, y: -0.9965134486493629 },
  { x: 4.918367346938775, y: -0.978861352671422 },
  { x: 5.040816326530612, y: -0.9465507809411055 },
  { x: 5.163265306122449, y: -0.900065585161171 },
  { x: 5.285714285714286, y: -0.8401018824204437 },
  { x: 5.408163265306122, y: -0.7675576308212114 },
  { x: 5.530612244897959, y: -0.6835191825318773 },
  { x: 5.653061224489796, y: -0.5892450156332808 },
  { x: 5.775510204081632, y: -0.48614688837472503 },
  { x: 5.8979591836734695, y: -0.37576869805526025 },
  { x: 6.020408163265306, y: -0.2597633611190539 },
  { x: 6.142857142857142, y: -0.13986806068604837 },
  { x: 6.26530612244898, y: -0.017878232186832283 },
  { x: 6.387755102040816, y: 0.1043793233324464 },
  { x: 6.5102040816326525, y: 0.22507379560613325 },
  { x: 6.63265306122449, y: 0.34239778158328493 },
  { x: 6.755102040816326, y: 0.45459435133820136 },
  { x: 6.877551020408163, y: 0.5599833581445223 },
  { x: 7, y: 0.6569865987187891 },
];

interface PayloadItem {
  payload: {
    x: number;
    y: number;
  };
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xl text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500 uppercase tracking-wider font-medium text-[9px]">
              Position
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {payload[0].payload.x.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500 uppercase tracking-wider font-medium text-[9px]">
              Amplitude
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface AnnotationProps {
  cx?: number;
  cy?: number;
  label: string;
  icon: React.ElementType;
  color: string;
  isUp?: boolean;
}

const Annotation = (props: AnnotationProps) => {
  const { cx, cy, label, icon: Icon, color, isUp } = props;
  if (cx === undefined || cy === undefined) return null;

  const yOffset = isUp ? -50 : 20;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        className="animate-pulse"
        style={{ opacity: 0.8 }}
      />
      <circle cx={cx} cy={cy} r={3} fill="#fff" />

      <foreignObject x={cx - 60} y={cy + yOffset} width={120} height={40}>
        <div className="flex justify-center items-center h-full">
          <div
            className="flex items-center gap-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border shadow-lg"
            style={{ borderColor: `${color}40` }}
          >
            <div
              className="p-1 rounded-full"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={12} style={{ color }} />
            </div>
            <span
              className="text-[11px] font-bold tracking-tight"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

export function Visualization() {
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 font-sans">
      {/* Header Area */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Activity size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Live Analysis
            </span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400">
            Jan 13, 2026
          </span>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          Sine Wave <span className="text-blue-600">Trends</span>
        </h2>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
          Decomposition of harmonic oscillation over a spatial domain.
        </p>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full px-2 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 40, right: 20, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="x"
              type="number"
              domain={[1, 7]}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              ticks={[1, 3, 5, 7]}
              dy={10}
            />

            <YAxis
              domain={[-1.3, 1.3]}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              ticks={[-1, 0, 1]}
              width={40}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
            />

            <Line
              type="monotone"
              dataKey="y"
              stroke="url(#lineGradient)"
              strokeWidth={4}
              dot={false}
              animationDuration={1500}
              activeDot={{
                r: 8,
                fill: "#3b82f6",
                stroke: "#fff",
                strokeWidth: 3,
                className: "shadow-xl",
              }}
            />

            {/* Annotations */}
            <ReferenceDot
              x={2.8}
              y={0.33}
              shape={(props: unknown) => (
                <Annotation
                  {...(props as AnnotationProps)}
                  label="Decreasing"
                  icon={TrendingDown}
                  color="#f59e0b"
                  isUp={true}
                />
              )}
            />
            <ReferenceDot
              x={5.4}
              y={-0.76}
              shape={(props: unknown) => (
                <Annotation
                  {...(props as AnnotationProps)}
                  label="Increasing"
                  icon={TrendingUp}
                  color="#10b981"
                  isUp={false}
                />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="p-6 grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Domain Range
          </p>
          <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            1.0 - 7.0
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Avg Velocity
          </p>
          <p className="text-lg font-black text-blue-600 tracking-tight">
            0.12 <span className="text-xs font-medium text-zinc-400">m/s</span>
          </p>
        </div>
      </div>
    </div>
  );
}
