"use client";

import React, { useState, useMemo } from "react";
import data from "../lib/data.json";
import { interpolateRdYlBu } from "d3-scale-chromatic";
import { scaleSequential } from "d3-scale";
import {
  Sun,
  CloudRain,
  Snowflake,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
} from "lucide-react";

interface WeatherRecord {
  date: string;
  precipitation: number;
  temp_max: number;
  temp_min: number;
  wind: number;
  weather: string;
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const WEATHER_ICONS: Record<string, React.ReactNode> = {
  sun: <Sun className="w-6 h-6 text-yellow-500" />,
  rain: <CloudRain className="w-6 h-6 text-blue-500" />,
  snow: <Snowflake className="w-6 h-6 text-blue-200" />,
  drizzle: <CloudDrizzle className="w-6 h-6 text-blue-400" />,
  fog: <CloudFog className="w-6 h-6 text-gray-400" />,
};

export function Visualization() {
  const [selectedDate, setSelectedDate] = useState<WeatherRecord | null>(null);

  // Process data into a grid: months (0-11) x days (1-31)
  const gridData = useMemo(() => {
    const grid: (WeatherRecord | null)[][] = Array.from({ length: 31 }, () =>
      Array.from({ length: 12 }, () => null),
    );

    let maxTemp = -Infinity;
    let minTemp = Infinity;

    (data as WeatherRecord[]).forEach((d) => {
      const date = new Date(d.date);
      const m = date.getMonth();
      const day = date.getDate() - 1; // 0-indexed for grid
      if (day < 31) {
        grid[day][m] = d;
        if (d.temp_max > maxTemp) maxTemp = d.temp_max;
        if (d.temp_max < minTemp) minTemp = d.temp_max;
      }
    });

    return { grid, minTemp, maxTemp };
  }, []);

  // Use a red-yellow-blue scale (inverted because RdYlBu has red at 0 and blue at 1)
  const colorScale = useMemo(() => {
    return scaleSequential()
      .domain([gridData.maxTemp, gridData.minTemp])
      .interpolator(interpolateRdYlBu);
  }, [gridData.minTemp, gridData.maxTemp]);

  const handleCellClick = (record: WeatherRecord | null) => {
    if (record) {
      setSelectedDate(record);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <h1 className="text-xl font-bold text-slate-800">
          Seattle Weather 2012
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
          Daily Max Temperatures (°C)
        </p>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {gridData.minTemp}°C
          </span>
          <div
            className="flex-1 h-3 rounded-full"
            style={{
              background: `linear-gradient(to right, ${interpolateRdYlBu(1)}, ${interpolateRdYlBu(0.5)}, ${interpolateRdYlBu(0)})`,
            }}
          />
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {gridData.maxTemp}°C
          </span>
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="flex-1 overflow-auto p-4 pb-40">
        <div className="relative inline-block min-w-full">
          {/* X-Axis Labels (Months) */}
          <div className="flex mb-1 ml-7 gap-0.5">
            {MONTHS.map((m, i) => (
              <div
                key={`month-${i}`}
                className="flex-1 text-center text-[10px] font-bold text-slate-400"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-0.5">
            {gridData.grid.map((row, dayIdx) => (
              <div
                key={`day-row-${dayIdx}`}
                className="flex gap-0.5 items-center"
              >
                {/* Y-Axis Labels (Days) */}
                <div className="w-7 text-right text-[10px] font-bold text-slate-400 pr-2">
                  {(dayIdx + 1) % 5 === 0 || dayIdx === 0 ? dayIdx + 1 : ""}
                </div>

                {/* Month Cells */}
                {row.map((cell, monthIdx) => (
                  <button
                    type="button"
                    key={`cell-${dayIdx}-${monthIdx}`}
                    onClick={() => handleCellClick(cell)}
                    aria-label={
                      cell ? `Weather for ${formatDate(cell.date)}` : "No data"
                    }
                    className={`flex-1 aspect-square rounded-[1px] transition-transform active:scale-95 ${
                      cell
                        ? "cursor-pointer"
                        : "bg-transparent pointer-events-none"
                    } ${
                      selectedDate && cell && selectedDate.date === cell.date
                        ? "ring-2 ring-slate-800 ring-offset-0 z-20"
                        : ""
                    }`}
                    style={{
                      backgroundColor: cell
                        ? colorScale(cell.temp_max)
                        : "transparent",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Card (Sticky Bottom) */}
      <div
        className={`fixed bottom-4 left-4 right-4 transition-all duration-300 transform ${
          selectedDate
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-5 overflow-hidden">
          {selectedDate && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {formatDate(selectedDate.date)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">
                      {selectedDate.temp_max.toFixed(1)}°
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400">
                        MAX
                      </span>
                      <span className="text-xs font-bold text-slate-400 border-t border-slate-100">
                        {selectedDate.temp_min.toFixed(1)}° MIN
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                  {WEATHER_ICONS[selectedDate.weather] || (
                    <Sun className="w-6 h-6 text-slate-400" />
                  )}
                  <p className="text-[10px] font-black uppercase mt-1 text-center text-slate-500">
                    {selectedDate.weather}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <Droplets className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Precip
                    </p>
                    <p className="text-sm font-black text-slate-700">
                      {selectedDate.precipitation}mm
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Wind className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Wind
                    </p>
                    <p className="text-sm font-black text-slate-700">
                      {selectedDate.wind}m/s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
