"use client";

import { useMemo } from "react";
import weatherData from "../lib/weather_data.json";

interface DataPoint {
  date: string;
  temp_max: number;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function Visualization() {
  const data = weatherData as DataPoint[];

  const { minTemp, maxTemp } = useMemo(() => {
    const temps = data.map((d) => d.temp_max);
    return {
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
    };
  }, [data]);

  const heatmapData = useMemo(() => {
    const grid: Record<string, number> = {};
    for (const d of data) {
      const date = new Date(d.date);
      const month = date.getMonth();
      const day = date.getDate();
      const key = `${month}-${day}`;
      grid[key] = d.temp_max;
    }
    return grid;
  }, [data]);

  const getColor = (temp: number | undefined) => {
    if (temp === undefined) return "#f4f4f5"; // Zinc-100 for no data
    const ratio = (temp - minTemp) / (maxTemp - minTemp);

    // Viridis-like color scale (Dark Purple -> Blue -> Green -> Yellow)
    // More standard and accessible for weather data
    if (ratio < 0.25) {
      const r = Math.floor(68 - (68 - 72) * (ratio / 0.25));
      const g = Math.floor(1 - (1 - 40) * (ratio / 0.25));
      const b = Math.floor(84 - (84 - 120) * (ratio / 0.25));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.5) {
      const r = Math.floor(72 - (72 - 33) * ((ratio - 0.25) / 0.25));
      const g = Math.floor(40 - (40 - 145) * ((ratio - 0.25) / 0.25));
      const b = Math.floor(120 - (120 - 140) * ((ratio - 0.25) / 0.25));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.75) {
      const r = Math.floor(33 - (33 - 70) * ((ratio - 0.5) / 0.25));
      const g = Math.floor(145 - (145 - 193) * ((ratio - 0.5) / 0.25));
      const b = Math.floor(140 - (140 - 110) * ((ratio - 0.5) / 0.25));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = Math.floor(70 - (70 - 253) * ((ratio - 0.75) / 0.25));
      const g = Math.floor(193 - (193 - 231) * ((ratio - 0.75) / 0.25));
      const b = Math.floor(110 - (110 - 37) * ((ratio - 0.75) / 0.25));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 border-b border-zinc-100">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Seattle WA
        </h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">
          Daily Maximum Temperatures (2012)
        </p>

        {/* Legend */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {Math.round(minTemp)}°C
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {Math.round(maxTemp)}°C
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${getColor(minTemp)}, ${getColor(minTemp + (maxTemp - minTemp) * 0.25)}, ${getColor(minTemp + (maxTemp - minTemp) * 0.5)}, ${getColor(minTemp + (maxTemp - minTemp) * 0.75)}, ${getColor(maxTemp)})`,
            }}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar bg-zinc-50/50">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {MONTHS.map((monthName, mIdx) => {
            const year = 2012;
            const daysInMonth = getDaysInMonth(mIdx, year);
            const firstDay = getFirstDayOfMonth(mIdx, year);
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const blanks = Array.from({ length: firstDay }, (_, i) => i);

            return (
              <div key={monthName} className="flex flex-col">
                <h2 className="text-[12px] font-bold text-zinc-800 mb-3 ml-0.5">
                  {monthName}
                </h2>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((wd, i) => (
                    <div
                      key={`${monthName}-wd-${wd}-${i}`}
                      className="text-[8px] font-bold text-zinc-300 text-center mb-1"
                    >
                      {wd}
                    </div>
                  ))}

                  {blanks.map((b) => (
                    <div
                      key={`${monthName}-blank-${b}`}
                      className="aspect-square"
                    />
                  ))}
                  {days.map((day) => {
                    const temp = heatmapData[`${mIdx}-${day}`];
                    return (
                      <div
                        key={`${monthName}-${day}`}
                        className="aspect-square rounded-[2px] shadow-sm"
                        style={{ backgroundColor: getColor(temp) }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-12" /> {/* Bottom spacer */}
      </div>

      <style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #e4e4e7;
					border-radius: 10px;
				}
			`}</style>
    </div>
  );
}
