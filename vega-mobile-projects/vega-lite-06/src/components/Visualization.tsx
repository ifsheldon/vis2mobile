"use client";

import { Info } from "lucide-react";
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
import penguinsData from "../lib/penguins.json";

// --- Types ---
interface Penguin {
  Species: string;
  "Body Mass (g)": number | null;
}

interface DensityPoint {
  mass: number;
  Adelie: number;
  Chinstrap: number;
  Gentoo: number;
}

interface HoverPayload {
  name: string;
  value: number;
  color?: string;
  stroke?: string;
}

// --- KDE Logic ---

function kernelDensityEstimator(kernel: (u: number) => number, X: number[]) {
  return (V: number[]) => X.map((x) => [x, d3_mean(V, (v) => kernel(x - v))]);
}

function d3_mean<T>(data: T[], accessor: (d: T) => number) {
  let sum = 0;
  let count = 0;
  for (const d of data) {
    const value = accessor(d);
    if (value !== undefined && value !== null && !Number.isNaN(value)) {
      sum += value;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

function gaussianKernel(scale: number) {
  return (u: number) => {
    const x = u / scale;
    return (1 / (Math.sqrt(2 * Math.PI) * scale)) * Math.exp(-0.5 * x * x);
  };
}

// --- Component ---

export function Visualization() {
  const [hoverData, setHoverData] = useState<{
    mass: number;
    payload: HoverPayload[];
  } | null>(null);

  const processedData = useMemo(() => {
    const groups: Record<string, number[]> = {
      Adelie: [],
      Chinstrap: [],
      Gentoo: [],
    };

    (penguinsData as Penguin[]).forEach((p) => {
      if (p["Body Mass (g)"] !== null && p.Species && groups[p.Species]) {
        groups[p.Species].push(p["Body Mass (g)"] as number);
      }
    });

    const minMass = 2500;
    const maxMass = 6500;
    const step = 50;
    const ticks = [];
    for (let i = minMass; i <= maxMass; i += step) {
      ticks.push(i);
    }

    const bandwidth = 180; // Slightly tighter bandwidth for more detail
    const kde = kernelDensityEstimator(gaussianKernel(bandwidth), ticks);

    const chartData: DensityPoint[] = ticks.map((tick) => ({
      mass: tick,
      Adelie: 0,
      Chinstrap: 0,
      Gentoo: 0,
    }));

    Object.keys(groups).forEach((species) => {
      const values = groups[species];
      if (values.length === 0) return;

      const density = kde(values);
      density.forEach((d, i) => {
        // @ts-expect-error - species is used as key for DensityPoint
        chartData[i][species] = d[1];
      });
    });

    return chartData;
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-slate-50 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Section */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Penguin Mass
            </h2>
            <Info className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-6">
            Body mass distribution by species
          </p>

          {/* Fixed Info Box / Legend Area */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-2 border border-slate-100 min-h-[100px] flex flex-col justify-center transition-all duration-200">
            {!hoverData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Species</span>
                  <span>Avg. Mass</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-semibold text-slate-700">
                      Adelie
                    </span>
                  </div>
                  <span className="text-sm font-mono text-slate-600">
                    ~3700g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-semibold text-slate-700">
                      Chinstrap
                    </span>
                  </div>
                  <span className="text-sm font-mono text-slate-600">
                    ~3733g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                    <span className="text-sm font-semibold text-slate-700">
                      Gentoo
                    </span>
                  </div>
                  <span className="text-sm font-mono text-slate-600">
                    ~5076g
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Current Point</span>
                  <span className="text-slate-900">{hoverData.mass}g</span>
                </div>
                <div className="space-y-2">
                  {hoverData.payload.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: entry.color || entry.stroke,
                          }}
                        ></div>
                        <span className="text-sm font-semibold text-slate-700">
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-slate-900">
                        {(entry.value * 1000).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full h-[260px] px-2 pb-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.activePayload && state.activeLabel) {
                  setHoverData({
                    mass: Number(state.activeLabel),
                    payload: state.activePayload as unknown as HoverPayload[],
                  });
                }
              }}
              onMouseLeave={() => setHoverData(null)}
            >
              <defs>
                <linearGradient id="colorAdelie" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorChinstrap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorGentoo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="mass"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis hide={true} domain={[0, "auto"]} />

              <Tooltip
                cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                content={null}
              />

              <Area
                type="monotone"
                dataKey="Adelie"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAdelie)"
                animationDuration={1000}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Chinstrap"
                stroke="#ea580c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorChinstrap)"
                animationDuration={1000}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Gentoo"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorGentoo)"
                animationDuration={1000}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Swipe to explore mass distribution
          </p>
        </div>
      </div>
    </div>
  );
}
