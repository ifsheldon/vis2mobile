"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import dataRaw from "../lib/data.json";

interface Penguin {
  Species: string;
  Island: string;
  "Beak Length (mm)": number;
  "Beak Depth (mm)": number;
  "Flipper Length (mm)": number;
  "Body Mass (g)": number;
  Sex: string | null;
}

const data = dataRaw as Penguin[];

const COLORS: Record<string, string> = {
  Adelie: "#4C78A8",
  Chinstrap: "#F58518",
  Gentoo: "#E45756",
};

const SPECIES = ["All", "Adelie", "Chinstrap", "Gentoo"];

export function Visualization() {
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [selectedPoint, setSelectedPoint] = useState<
    (Penguin & { id: number }) | null
  >(null);

  const filteredData = useMemo(() => {
    return data
      .filter((d) => selectedSpecies === "All" || d.Species === selectedSpecies)
      .map((d, index) => ({
        ...d,
        id: index,
        x: d["Flipper Length (mm)"],
        y: d["Body Mass (g)"],
        z: d["Beak Depth (mm)"],
      }));
  }, [selectedSpecies]);

  const xDomain = useMemo(() => {
    const vals = data.map((d) => d["Flipper Length (mm)"]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [Math.floor(min / 10) * 10, Math.ceil(max / 10) * 10];
  }, []);

  const yDomain = useMemo(() => {
    const vals = data.map((d) => d["Body Mass (g)"]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [Math.floor(min / 500) * 500, Math.ceil(max / 500) * 500];
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-8 pb-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          Penguin Morphology
        </h1>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">
          Flipper Length vs. Body Mass
        </p>
      </header>

      {/* Filter Chips */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {SPECIES.map((species) => (
          <button
            type="button"
            key={species}
            onClick={() => {
              setSelectedSpecies(species);
              setSelectedPoint(null);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2 ${
              selectedSpecies === species
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200"
                : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-200"
            }`}
          >
            {species}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0 relative mt-2 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 15, bottom: 25, left: 0 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#f1f1f4"
            />
            <XAxis
              type="number"
              dataKey="x"
              name="Flipper Length"
              unit="mm"
              domain={xDomain}
              tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Flipper Length (mm)",
                position: "bottom",
                offset: 0,
                fontSize: 11,
                fill: "#71717a",
                fontWeight: 700,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Body Mass"
              unit="g"
              domain={yDomain}
              tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }}
              tickFormatter={(val) => `${val / 1000}k`}
              axisLine={false}
              tickLine={false}
              width={45}
              label={{
                value: "Body Mass (kg)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#71717a",
                fontWeight: 700,
                offset: 10,
              }}
            />
            <ZAxis
              type="number"
              dataKey="z"
              range={[80, 400]}
              name="Beak Depth"
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={null} />
            <Scatter
              data={filteredData}
              onClick={(props) => setSelectedPoint(props.payload)}
              isAnimationActive={false}
            >
              {filteredData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={COLORS[entry.Species]}
                  fillOpacity={
                    selectedPoint
                      ? selectedPoint.id === entry.id
                        ? 1
                        : 0.1
                      : 0.6
                  }
                  stroke={selectedPoint?.id === entry.id ? "#000" : "none"}
                  strokeWidth={2}
                  className="transition-all duration-300 cursor-pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Hint */}
      <div className="px-5 py-4 border-t border-zinc-50 bg-zinc-50/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {Object.entries(COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 italic">
            <Info size={10} className="text-zinc-300" />
            <span>Size ∝ Beak Depth</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-zinc-200 rounded-t-3xl shadow-2xl z-50 p-6 pb-10"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[selectedPoint.Species] }}
                  />
                  <h2 className="text-lg font-bold">{selectedPoint.Species}</h2>
                </div>
                <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">
                  {selectedPoint.Island} Island •{" "}
                  {selectedPoint.Sex || "Unknown Sex"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPoint(null)}
                className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
                  Flipper Length
                </p>
                <p className="text-xl font-semibold">
                  {selectedPoint["Flipper Length (mm)"]}{" "}
                  <span className="text-sm font-normal text-zinc-500">mm</span>
                </p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
                  Body Mass
                </p>
                <p className="text-xl font-semibold">
                  {selectedPoint["Body Mass (g)"]}{" "}
                  <span className="text-sm font-normal text-zinc-500">g</span>
                </p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
                  Beak Depth
                </p>
                <p className="text-xl font-semibold">
                  {selectedPoint["Beak Depth (mm)"]}{" "}
                  <span className="text-sm font-normal text-zinc-500">mm</span>
                </p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
                  Beak Length
                </p>
                <p className="text-xl font-semibold">
                  {selectedPoint["Beak Length (mm)"]}{" "}
                  <span className="text-sm font-normal text-zinc-500">mm</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedPoint && (
        <div className="px-6 py-4 bg-zinc-100/50 text-center">
          <p className="text-xs text-zinc-400">
            Tap a penguin dot to see detailed metrics
          </p>
        </div>
      )}
    </div>
  );
}
