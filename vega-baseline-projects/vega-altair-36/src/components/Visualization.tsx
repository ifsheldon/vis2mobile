"use client";

import { Car, Filter, Info } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import carsDataRaw from "@/lib/cars.json";

interface CarData {
  Name: string;

  Miles_per_Gallon: number | null;

  Cylinders: number;

  Displacement: number;

  Horsepower: number | null;

  Weight_in_lbs: number;

  Acceleration: number;

  Year: string;

  Origin: string;
}

const carsData = (carsDataRaw as CarData[]).filter(
  (d) => d.Horsepower !== null && d.Miles_per_Gallon !== null,
);

export function Visualization() {
  const [hpRange, setHpRange] = useState<[number, number]>([0, 250]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const hps = carsData
      .map((d) => d.Horsepower)
      .filter((hp): hp is number => hp !== null);

    const maxHp = Math.max(...hps, 0);

    const minHp = Math.min(...hps, 250);

    setHpRange([minHp, maxHp]);
  }, []);

  const filteredData = useMemo(() => {
    return carsData

      .filter((d) => {
        const hp = d.Horsepower;

        return hp !== null && hp >= hpRange[0] && hp <= hpRange[1];
      })

      .slice(0, 15); // Original spec limited to 15
  }, [hpRange]);

  if (!mounted) return null;

  const hps = carsData
    .map((d) => d.Horsepower)
    .filter((hp): hp is number => hp !== null);

  const maxHp = Math.max(...hps, 0);

  const minHp = Math.min(...hps, 0);

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = Number.parseInt(e.target.value, 10);

    const newRange: [number, number] = [...hpRange];

    newRange[index] = val;

    if (index === 0 && val > newRange[1]) newRange[1] = val;

    if (index === 1 && val < newRange[0]) newRange[0] = val;

    setHpRange(newRange);
  };

  return (
    <div className="flex flex-col w-full bg-white font-sans text-zinc-900 overflow-hidden h-full">
      {/* Header */}

      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold tracking-tight">Car Performance</h1>

        <p className="text-sm text-zinc-500">
          Horsepower vs. MPG across origins
        </p>
      </div>

      {/* Chart Section */}

      <div className="flex-1 min-h-[300px] w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <XAxis
              type="number"
              dataKey="Horsepower"
              name="Horsepower"
              unit="hp"
              domain={[0, "auto"]}
              tick={{ fontSize: 10 }}
              label={{
                value: "Horsepower",
                position: "bottom",
                offset: 0,
                fontSize: 12,
              }}
            />

            <YAxis
              type="number"
              dataKey="Miles_per_Gallon"
              name="MPG"
              unit="mpg"
              domain={[0, "auto"]}
              tick={{ fontSize: 10 }}
              label={{
                value: "MPG",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fontSize: 12,
              }}
            />

            <ZAxis type="number" range={[40, 40]} />

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CarData;

                  return (
                    <div className="bg-white p-2 border border-zinc-200 shadow-lg rounded-md text-xs">
                      <p className="font-bold">{data.Name}</p>

                      <p>HP: {data.Horsepower}</p>

                      <p>MPG: {data.Miles_per_Gallon}</p>

                      <p>Origin: {data.Origin}</p>
                    </div>
                  );
                }

                return null;
              }}
            />

            <Scatter data={carsData}>
              {carsData.map((entry, index) => {
                const hp = entry.Horsepower;

                const isSelected =
                  hp !== null && hp >= hpRange[0] && hp <= hpRange[1];

                return (
                  <Cell
                    key={`${entry.Name}-${index}`}
                    fill={isSelected ? "#3b82f6" : "#e4e4e7"}
                    fillOpacity={isSelected ? 0.8 : 0.3}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Filter Section */}

      <div className="px-6 py-4 bg-zinc-50 border-y border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-blue-500" />

          <span className="text-sm font-semibold">Filter Horsepower</span>

          <span className="ml-auto text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {hpRange[0]} - {hpRange[1]} hp
          </span>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min={minHp}
            max={maxHp}
            value={hpRange[0]}
            onChange={(e) => handleSliderChange(e, 0)}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <input
            type="range"
            min={minHp}
            max={maxHp}
            value={hpRange[1]}
            onChange={(e) => handleSliderChange(e, 1)}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Table Section */}

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Car size={16} className="text-zinc-400" />

          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Selected Cars (Top 15)
          </h2>
        </div>

        {filteredData.length > 0 ? (
          <div className="overflow-hidden border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-3 py-2 font-medium">Model</th>

                  <th className="px-3 py-2 font-medium text-right">HP</th>

                  <th className="px-3 py-2 font-medium text-right">MPG</th>

                  <th className="px-3 py-2 font-medium">Origin</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {filteredData.map((car, i) => (
                  <tr
                    key={`${car.Name}-${car.Horsepower}-${i}`}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium truncate max-w-[120px]">
                      {car.Name}
                    </td>

                    <td className="px-3 py-2 text-right">{car.Horsepower}</td>

                    <td className="px-3 py-2 text-right">
                      {car.Miles_per_Gallon}
                    </td>

                    <td className="px-3 py-2 text-zinc-500">{car.Origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
            <Info size={32} strokeWidth={1} className="mb-2" />

            <p className="text-sm">No cars match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
