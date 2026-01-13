"use client";

import { Info, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  u: number;
  v: number;
}

export function Visualization() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://vega.github.io/editor/data/normal-2d.json",
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data, using fallback:", error);
        // Fallback: Generate ~200 points with Gaussian distribution
        const fallbackData = Array.from({ length: 200 }, () => {
          const u0 = Math.random();
          const u1 = Math.random();
          const v0 = Math.random();
          const v1 = Math.random();
          // Box-Muller transform approximation
          const u =
            Math.sqrt(-2.0 * Math.log(u0)) * Math.cos(2.0 * Math.PI * u1);
          const v =
            Math.sqrt(-2.0 * Math.log(v0)) * Math.cos(2.0 * Math.PI * v1);
          return { u, v };
        });
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate domain with padding
  const domain = useMemo(() => {
    if (data.length === 0)
      return {
        x: [-3, 3] as [number, number],
        y: [-3, 3] as [number, number],
      };
    const uValues = data.map((d) => d.u);
    const vValues = data.map((d) => d.v);
    const minU = Math.min(...uValues);
    const maxU = Math.max(...uValues);
    const minV = Math.min(...vValues);
    const maxV = Math.max(...vValues);
    const paddingU = (maxU - minU) * 0.1;
    const paddingV = (maxV - minV) * 0.1;
    return {
      x: [minU - paddingU, maxU + paddingU] as [number, number],
      y: [minV - paddingV, maxV + paddingV] as [number, number],
    };
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 p-4 font-sans">
      {/* Header / Info Panel */}
      <div className="flex-none mb-4 p-4 rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
              Distribution Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive 2D Normal Distribution
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPoint(null)}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Reset Selection"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Selected Point Details */}
        <div className="h-12 flex items-center">
          {selectedPoint ? (
            <div className="flex items-center gap-4 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                  X-Axis (u)
                </span>
                <span className="font-mono text-indigo-300">
                  {selectedPoint.u.toFixed(3)}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                  Y-Axis (v)
                </span>
                <span className="font-mono text-rose-300">
                  {selectedPoint.v.toFixed(3)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Info size={16} />
              <span>Tap any point to view details</span>
            </div>
          )}
        </div>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 min-h-0 w-full relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/30">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="u"
                type="number"
                domain={domain.x}
                tickCount={5}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => val.toFixed(1)}
              />
              <YAxis
                dataKey="v"
                type="number"
                domain={domain.y}
                tickCount={5}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={30}
                tickFormatter={(val: number) => val.toFixed(1)}
              />
              <Scatter
                name="Values"
                data={data}
                fill="#6366f1" // indigo-500
                fillOpacity={0.6}
                // biome-ignore lint/suspicious/noExplicitAny: Recharts event types are complex
                onClick={(data: any) => {
                  if (data?.payload) {
                    setSelectedPoint(data.payload);
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.u}-${entry.v}-${index}`}
                    fill={selectedPoint === entry ? "#f43f5e" : "#6366f1"} // rose-500 vs indigo-500
                    fillOpacity={selectedPoint === entry ? 1 : 0.6}
                    stroke={selectedPoint === entry ? "#fff" : "none"}
                    strokeWidth={2}
                    r={selectedPoint === entry ? 8 : 4}
                  />
                ))}
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
