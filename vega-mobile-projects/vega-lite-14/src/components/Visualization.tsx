"use client";

import { ChevronDown, CloudRain, Sun } from "lucide-react";
import { useState } from "react";
import { type WeatherDay, weatherData } from "@/data/weather-data";

// Domain for the visualization
const MIN_TEMP = 10;
const MAX_TEMP = 75; // Increased slightly to give breathing room
const TEMP_RANGE = MAX_TEMP - MIN_TEMP;

const getPercent = (temp: number) => {
  return Math.max(0, Math.min(100, ((temp - MIN_TEMP) / TEMP_RANGE) * 100));
};

const getWidth = (low: number, high: number) => {
  return Math.abs(getPercent(high) - getPercent(low));
};

// Helper to determine primary range (Actual or Forecast)
const getPrimaryRange = (day: WeatherDay) => {
  if (day.actual) {
    return { min: day.actual.low, max: day.actual.high, isForecast: false };
  }
  if (day.forecast) {
    // Flatten forecast for the main bar: min of low.low, max of high.high
    // Or closer to visual: low.high to high.low?
    // Looking at the original vega spec:
    // Forecast has 3 bars:
    // 1. low.low to low.high
    // 2. low.high to high.low (thin connecting bar)
    // 3. high.low to high.high
    // For the main collapsed view, let's show the full range of uncertainty or the "likely" range.
    // Let's stick to the "likely" central range if possible, or just the full range.
    // The plan says: "take the absolute min of the low forecast and absolute max of the high forecast"
    return {
      min: day.forecast.low.low,
      max: day.forecast.high.high,
      isForecast: true,
      // Pass full details for expansion
      details: day.forecast,
    };
  }
  return { min: 0, max: 0, isForecast: false };
};

export function Visualization() {
  const [expandedDayId, setExpandedDayId] = useState<number | null>(null);

  const toggleDay = (id: number) => {
    setExpandedDayId(expandedDayId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white text-slate-900 font-sans shadow-xl overflow-hidden rounded-xl border border-slate-200">
      {/* Header */}
      <header className="px-6 py-5 bg-white border-b border-slate-100 z-10 sticky top-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Weekly Weather
          </h1>
          <Sun className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Observations & Predictions
        </p>
      </header>

      {/* Legend */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-4 text-xs font-semibold text-slate-600 sticky top-[85px] z-10 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          <span>Record</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-8 h-3 rounded-full bg-slate-900" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-8 h-3 rounded-full bg-[repeating-linear-gradient(45deg,#1f2937,#1f2937_2px,transparent_2px,transparent_4px)] border border-slate-800" />
          <span>Forecast</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {weatherData.map((day) => {
          const isExpanded = expandedDayId === day.id;
          const primary = getPrimaryRange(day);

          return (
            <button
              key={day.id}
              onClick={() => toggleDay(day.id)}
              type="button"
              className={`
                group relative w-full text-left bg-white rounded-2xl border border-slate-100 transition-all duration-300 ease-out overflow-hidden cursor-pointer
                ${
                  isExpanded
                    ? "ring-2 ring-slate-900 shadow-lg"
                    : "hover:shadow-md hover:border-slate-200"
                }
              `}
            >
              {/* Main Row Content */}
              <div className="p-4 flex flex-col gap-4">
                {/* Top Row: Day Name + Primary Temp + Chevron */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                      ${
                        isExpanded
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }
                    `}
                    >
                      {day.day}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        {primary.isForecast ? "Forecast" : "Actual"}
                      </div>
                      <div className="text-lg font-bold text-slate-900 tabular-nums leading-none mt-0.5">
                        {primary.min}° — {primary.max}°
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-slate-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </div>

                {/* Visual Bar Chart Track */}
                <div className="relative w-full h-8 mt-1">
                  {/* Grid Lines (Subtle) */}
                  <div className="absolute inset-0 flex justify-between px-0 pointer-events-none opacity-20">
                    {[MIN_TEMP, 30, 50, 70].map((t) => (
                      <div
                        key={t}
                        className="h-full border-r border-slate-900 first:border-l"
                        style={{ left: `${getPercent(t)}%` }}
                      />
                    ))}
                  </div>

                  {/* Layer 1: Record Range */}
                  <div
                    className="absolute top-0 bottom-0 bg-slate-100 rounded-full border border-slate-200"
                    style={{
                      left: `${getPercent(day.record.low)}%`,
                      width: `${getWidth(day.record.low, day.record.high)}%`,
                    }}
                  />

                  {/* Layer 2: Normal Range */}
                  <div
                    className="absolute top-1.5 bottom-1.5 bg-slate-300 rounded-full opacity-80"
                    style={{
                      left: `${getPercent(day.normal.low)}%`,
                      width: `${getWidth(day.normal.low, day.normal.high)}%`,
                    }}
                  />

                  {/* Layer 3: Primary Range (Actual/Forecast) */}
                  <div
                    className={`
                      absolute top-2.5 bottom-2.5 rounded-full shadow-sm z-10 flex items-center justify-center
                      ${
                        primary.isForecast
                          ? "bg-[repeating-linear-gradient(45deg,#374151,#374151_2px,transparent_2px,transparent_4px)] border border-slate-700"
                          : "bg-slate-900"
                      }
                    `}
                    style={{
                      left: `${getPercent(primary.min)}%`,
                      width: `${getWidth(primary.min, primary.max)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Expanded Details Panel */}
              <div
                className={`
                grid transition-[grid-template-rows] duration-300 ease-out
                ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
              `}
              >
                <div className="overflow-hidden bg-slate-50 border-t border-slate-100">
                  <div className="p-4 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Record
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-slate-500 text-xs">
                          {day.record.low}°
                        </span>
                        <div className="w-8 h-1 bg-slate-200 rounded-full" />
                        <span className="text-slate-900 font-bold">
                          {day.record.high}°
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Normal
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-slate-500 text-xs">
                          {day.normal.low}°
                        </span>
                        <div className="w-8 h-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-900 font-bold">
                          {day.normal.high}°
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-slate-100 shadow-sm ring-1 ring-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {primary.isForecast ? "Forecast" : "Actual"}
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-slate-500 text-xs">
                          {primary.min}°
                        </span>
                        <div
                          className={`w-8 h-1 rounded-full ${
                            primary.isForecast ? "bg-slate-500" : "bg-slate-900"
                          }`}
                        />
                        <span className="text-slate-900 font-bold">
                          {primary.max}°
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Detailed Breakdown if available */}
                  {primary.isForecast && day.forecast && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                        <CloudRain
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-500"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold">Uncertainty Range</p>
                          <p className="opacity-80">
                            Low temp expected between{" "}
                            <span className="font-mono font-bold">
                              {day.forecast.low.low}°-{day.forecast.low.high}°
                            </span>
                            . High temp expected between{" "}
                            <span className="font-mono font-bold">
                              {day.forecast.high.low}°-{day.forecast.high.high}°
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Bottom spacer for scrolling */}
        <div className="h-10 text-center text-slate-300 text-xs italic">
          Data source: Vega-Lite Weekly Weather
        </div>
      </div>
    </div>
  );
}
