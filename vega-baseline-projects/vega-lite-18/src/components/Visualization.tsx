"use client";

import { ArrowUpRight, BarChart3, Info, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import embed, { type VisualizationSpec } from "vega-embed";

const rawData = [12, 23, 47, 6, 52, 19];
const data = rawData.map((v, i) => ({
  id: i,
  value: v,
  label: `Item ${String.fromCharCode(65 + i)}`, // Item A, B, C...
}));

const colors = [
  "#6366f1", // Indigo 500
  "#0ea5e9", // Sky 500
  "#10b981", // Emerald 500
  "#f59e0b", // Amber 500
  "#ef4444", // Red 500
  "#a855f7", // Purple 500
];

const total = rawData.reduce((acc, v) => acc + v, 0);

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const spec: VisualizationSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v6.json",
        description: "Mobile optimized radial chart",
        width: 280,
        height: 280,
        padding: 10,
        background: "transparent",
        data: { values: data },
        layer: [
          {
            mark: {
              type: "arc",
              innerRadius: 35,
              stroke: "#fff",
              strokeWidth: 2,
              cornerRadius: 4,
            },
          },
          {
            mark: {
              type: "text",
              radiusOffset: 18,
              fontSize: 14,
              fontWeight: 700,
              fill: "#1e293b",
            },
            encoding: {
              text: { field: "value", type: "quantitative" },
            },
          },
        ],
        encoding: {
          theta: { field: "value", type: "quantitative", stack: true },
          radius: {
            field: "value",
            scale: { type: "sqrt", zero: true, rangeMin: 35, rangeMax: 120 },
          },
          color: {
            field: "id",
            type: "nominal",
            scale: { range: colors },
            legend: null,
          },
        },
        config: {
          view: { stroke: null },
        },
      };

      embed(containerRef.current, spec, { actions: false, renderer: "svg" })
        .then(() => setIsLoaded(true))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto">
      {/* App Bar */}
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-slate-100 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Analytics
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
            Radial Breakdown
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Main Chart Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <Info className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center transition-transform duration-500 hover:scale-105">
              <div
                ref={containerRef}
                className={`${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}
              />

              {/* Center Overlay */}
              <div className="absolute flex flex-col items-center justify-center bg-white/90 backdrop-blur-md w-24 h-24 rounded-full shadow-lg border border-slate-50 z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Total
                </span>
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {total}
                </span>
                <div className="w-6 h-0.5 bg-indigo-500 rounded-full mt-1" />
              </div>

              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Live Distribution Data
              </span>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-4 px-2 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              Categories
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              6 SAMPLES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {data
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const percentage = Math.round((item.value / total) * 100);
                const colorIndex = data.findIndex((d) => d.id === item.id);
                const color = colors[colorIndex];

                return (
                  <div
                    key={item.id}
                    className="group bg-white p-4 rounded-3xl flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.97] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm relative group-hover:rotate-6 transition-transform"
                        style={{ backgroundColor: `${color}10` }}
                      >
                        <div
                          className="w-4 h-4 rounded-full shadow-inner"
                          style={{ backgroundColor: color }}
                        />
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-white rounded-2xl transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {item.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-none">
                          {item.value}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                          Units
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
