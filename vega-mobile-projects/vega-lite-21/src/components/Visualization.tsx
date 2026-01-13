"use client";

import { Cpu, Gauge, Info, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

interface CarData {
  Name: string;
  Horsepower: number;
  Cylinders: number;
  Origin: string;
  Year: string;
  [key: string]: string | number;
}

interface CustomTickProps {
  cx?: number;
  cy?: number;
  fill?: string;
}

const CYLINDER_COLORS: Record<number, string> = {
  3: "#10b981", // emerald-500
  4: "#3b82f6", // blue-500
  5: "#8b5cf6", // violet-500
  6: "#f59e0b", // amber-500
  8: "#ef4444", // red-500
};

const CustomTick = (props: CustomTickProps) => {
  const { cx, cy, fill } = props;
  if (cx === undefined || cy === undefined) return null;
  return (
    <rect
      x={cx - 15}
      y={cy - 1}
      width={30}
      height={2}
      fill={fill}
      fillOpacity={0.6}
      rx={1}
    />
  );
};

export function Visualization() {
  const [data, setData] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  useEffect(() => {
    fetch("https://vega.github.io/editor/data/cars.json")
      .then((res) => res.json())
      .then((json: CarData[]) => {
        const filtered = json.filter(
          (d) => d.Horsepower != null && d.Cylinders != null,
        );
        setData(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const cylinderCounts = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.Cylinders))).sort(
      (a, b) => a - b,
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-blue-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading automotive data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-blue-500" aria-hidden="true" />
          Horsepower Analysis
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Distribution by Cylinder count
        </p>
      </header>

      {/* Chart Area */}
      <main className="flex-1 relative min-h-0 pt-4 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 10, right: 30, bottom: 40, left: 10 }}
            onClick={(e) => {
              const payload = e?.activePayload?.[0]?.payload;
              if (payload) {
                setSelectedCar(payload);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-zinc-800"
            />
            <XAxis
              type="number"
              dataKey="Cylinders"
              name="Cylinders"
              domain={[2, 9]}
              ticks={[3, 4, 5, 6, 8]}
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Cylinders",
                position: "bottom",
                offset: 20,
                className:
                  "fill-zinc-400 text-[10px] font-medium uppercase tracking-wider",
              }}
            />
            <YAxis
              type="number"
              dataKey="Horsepower"
              name="Horsepower"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Horsepower (HP)",
                angle: -90,
                position: "left",
                offset: -5,
                className:
                  "fill-zinc-400 text-[10px] font-medium uppercase tracking-wider",
              }}
            />
            <RechartsTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={() => null}
            />
            <Scatter
              name="Cars"
              data={data}
              shape={<CustomTick />}
              onClick={(data) => setSelectedCar(data)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.Name}-${index}`}
                  fill={CYLINDER_COLORS[entry.Cylinders] || "#71717a"}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </main>

      {/* Legend */}
      <section className="px-6 py-3 flex flex-wrap justify-center gap-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
        {cylinderCounts.map((cyl) => (
          <div key={cyl} className="flex items-center gap-1.5">
            <div
              className="w-3 h-1 rounded-full"
              style={{ backgroundColor: CYLINDER_COLORS[cyl] }}
            />
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
              {cyl} CYL
            </span>
          </div>
        ))}
      </section>

      {/* Interaction Card (Bottom Sheet) */}
      <footer
        className={`
                px-6 py-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-out shadow-[0_-8px_30px_rgb(0,0,0,0.04)]
                ${selectedCar ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}
            `}
        style={{ height: selectedCar ? "auto" : "0px" }}
      >
        {selectedCar && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                  {selectedCar.Name.toUpperCase()}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                    {selectedCar.Origin}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                    Model Year: {new Date(selectedCar.Year).getFullYear()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCar(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Power
                  </div>
                  <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-none">
                    {selectedCar.Horsepower}
                    <span className="text-[10px] ml-1 font-normal text-zinc-500">
                      HP
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                  <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Engine
                  </div>
                  <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-none">
                    {selectedCar.Cylinders}
                    <span className="text-[10px] ml-1 font-normal text-zinc-500">
                      CYL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Placeholder for when no car is selected */}
      {!selectedCar && (
        <div className="px-6 py-8 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
          <Info className="w-5 h-5 text-zinc-300" aria-hidden="true" />
          <p className="text-xs text-zinc-400 font-medium">
            Tap on a mark to view vehicle specifications
          </p>
        </div>
      )}
    </div>
  );
}
