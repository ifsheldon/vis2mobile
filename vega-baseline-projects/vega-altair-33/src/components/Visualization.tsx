"use client";

import { ChevronDown, ChevronUp, MapPin, Plane } from "lucide-react";
import { useMemo, useState } from "react";
import airportDataRaw from "../lib/airports_by_state.json";
import stateNamesRaw from "../lib/state_names.json";

interface AirportData {
  state: string;
  count: number;
  latitude: number;
  longitude: number;
}

const stateNames = stateNamesRaw as Record<string, string>;
const airportData = airportDataRaw as AirportData[];

export function Visualization() {
  const [showAll, setShowAll] = useState(false);

  const sortedData = useMemo(() => {
    return [...airportData].sort((a, b) => b.count - a.count);
  }, []);

  const totalAirports = useMemo(() => {
    return sortedData.reduce((sum, item) => sum + item.count, 0);
  }, [sortedData]);

  const displayedData = showAll ? sortedData : sortedData.slice(0, 15);
  const maxCount = sortedData[0]?.count || 1;

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Plane className="text-blue-600" size={28} />
          US Airports
        </h1>
        <p className="text-slate-500 mt-1">
          Distribution of airports across states
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Total Airports
            </span>
            <div className="text-3xl font-black text-blue-900 mt-1">
              {totalAirports.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top State
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {sortedData[0]?.state}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-lg font-bold text-slate-800">Ranking by State</h2>
          <span className="text-xs text-slate-400 font-medium">
            Count of airports
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-5">
            {displayedData.map((item, index) => (
              <div key={item.state} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">
                    <span className="text-slate-300 mr-2 tabular-nums">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    {stateNames[item.state] || item.state}
                  </span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {item.count}
                  </span>
                </div>
                <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!showAll && sortedData.length > 15 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full mt-8 py-3 flex items-center justify-center gap-2 text-blue-600 font-bold border-2 border-blue-100 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all"
            >
              Show All {sortedData.length} States
              <ChevronDown size={20} />
            </button>
          )}

          {showAll && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="w-full mt-8 py-3 flex items-center justify-center gap-2 text-slate-500 font-bold border-2 border-slate-100 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
            >
              Show Top 15 Only
              <ChevronUp size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Small Map Reference - Placeholder for Visual Context */}
      <div className="px-6 py-4">
        <div className="bg-slate-800 rounded-3xl p-6 text-white overflow-hidden relative min-h-[160px] flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MapPin size={20} className="text-blue-400" />
              Geographic Spread
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-[200px]">
              Airports are concentrated in large coastal states and Alaska.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 scale-150">
            <Plane size={140} />
          </div>
        </div>
      </div>
    </div>
  );
}
