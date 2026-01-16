"use client";

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
import { penguinData } from "@/lib/data";

const SPECIES_COLORS: Record<string, string> = {
  Adelie: "#FF8C00", // Orange
  Chinstrap: "#9932CC", // Purple
  Gentoo: "#008080", // Teal
};

export function Visualization() {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return penguinData.filter(
      (d) =>
        d["Flipper Length (mm)"] !== null &&
        d["Body Mass (g)"] !== null &&
        d["Beak Depth (mm)"] !== null &&
        (selectedSpecies === null || d.Species === selectedSpecies),
    );
  }, [selectedSpecies]);

  const speciesList = Array.from(new Set(penguinData.map((d) => d.Species)));

  return (
    <div className="flex flex-col w-full h-full bg-white p-4 space-y-4 overflow-hidden">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">
          Penguin Characteristics
        </h2>
        <p className="text-sm text-gray-500">Flipper Length vs. Body Mass</p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedSpecies(null)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
            selectedSpecies === null
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {speciesList.map((species) => (
          <button
            key={species}
            type="button"
            onClick={() => setSelectedSpecies(species)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              selectedSpecies === species
                ? "text-white shadow-sm scale-105 border-transparent"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
            style={
              selectedSpecies === species
                ? { backgroundColor: SPECIES_COLORS[species] }
                : {}
            }
          >
            {species}
          </button>
        ))}
      </div>

      <div className="text-center">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
          Showing {filteredData.length} penguins
        </span>
      </div>

      <div className="flex-1 min-h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 10,
              bottom: 40,
              left: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />
            <XAxis
              type="number"
              dataKey="Flipper Length (mm)"
              name="Flipper Length"
              unit="mm"
              domain={["auto", "auto"]}
              tick={{ fontSize: 9, fill: "#999" }}
              tickCount={5}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Flipper Length (mm)",
                position: "bottom",
                offset: 20,
                fontSize: 10,
                fontWeight: 600,
                fill: "#666",
              }}
            />
            <YAxis
              type="number"
              dataKey="Body Mass (g)"
              name="Body Mass"
              unit="g"
              domain={["auto", "auto"]}
              tick={{ fontSize: 9, fill: "#999" }}
              tickCount={6}
              axisLine={false}
              tickLine={false}
              width={45}
              label={{
                value: "Body Mass (g)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fontSize: 10,
                fontWeight: 600,
                fill: "#666",
              }}
            />
            <ZAxis
              type="number"
              dataKey="Beak Depth (mm)"
              range={[40, 400]}
              name="Beak Depth"
              unit="mm"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#ccc" }}
              trigger="click"
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #eee",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                fontSize: "11px",
                padding: "8px",
              }}
            />
            <Scatter name="Penguins" data={filteredData}>
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.Species}-${index}`}
                  fill={SPECIES_COLORS[entry.Species] || "#8884d8"}
                  fillOpacity={0.6}
                  stroke={SPECIES_COLORS[entry.Species]}
                  strokeWidth={0.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 p-2 rounded-lg">
        <p className="text-[10px] text-blue-700 leading-tight text-center">
          <strong>Tip:</strong> Tap a bubble to see details. Bubble size shows{" "}
          <strong>Beak Depth</strong>.
        </p>
      </div>
    </div>
  );
}
