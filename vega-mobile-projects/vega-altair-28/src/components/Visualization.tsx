"use client";

import { type ClassValue, clsx } from "clsx";
import { Pause, Play, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Region mapping based on the original visualization
const REGIONS = {
  0: "South Asia",
  1: "Europe & Central Asia",
  2: "Sub-Saharan Africa",
  3: "The Americas",
  4: "East Asia & Pacific",
  5: "Middle East & North Africa",
};

const REGION_COLORS = {
  0: "#1b9e77", // Green
  1: "#d95f02", // Orange
  2: "#7570b3", // Purple
  3: "#e7298a", // Pink
  4: "#66a61e", // Light Green
  5: "#e6ab02", // Yellow
};

interface DataPoint {
  year: number;
  country: string;
  cluster: number;
  pop: number;
  life_expect: number;
  fertility: number;
}

export function Visualization() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentYear, setCurrentYear] = useState(1955);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    fetch("/gapminder.json")
      .then((res) => res.json())
      .then((json) => {
        // Filter out North Korea and South Korea as per original spec
        const filteredData = json.filter(
          (d: DataPoint) =>
            d.country !== "North Korea" && d.country !== "South Korea",
        );
        setData(filteredData);
        setIsLoading(false);
      });
  }, []);

  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear((prev) => {
          if (prev >= 2005) {
            setIsPlaying(false);
            return 2005;
          }
          return prev + 5;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const yearData = useMemo(() => {
    return data.filter((d) => d.year === currentYear);
  }, [data, currentYear]);

  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(data.map((d) => d.country)));
    return uniqueCountries.sort();
  }, [data]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return [];
    return countries.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [countries, searchQuery]);

  const selectedCountryTrail = useMemo(() => {
    if (!selectedCountry) return [];
    return data
      .filter((d) => d.country === selectedCountry && d.year <= currentYear)
      .sort((a, b) => a.year - b.year);
  }, [data, selectedCountry, currentYear]);

  const selectedCountryData = useMemo(() => {
    return yearData.find((d) => d.country === selectedCountry);
  }, [yearData, selectedCountry]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-zinc-500">
        <div className="animate-pulse">Loading Gapminder Data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden safe-area-inset-bottom">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-md z-20">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 leading-tight">
            Life Expectancy
          </h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            vs Babies per woman
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="p-2 rounded-full bg-zinc-100 text-zinc-600 active:scale-95 transition-transform"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Background Year */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[140px] font-black text-zinc-900 opacity-[0.03] leading-none tracking-tighter">
            {currentYear}
          </span>
        </div>

        {/* Selected Country HUD */}
        <div
          className={cn(
            "absolute top-2 left-4 right-4 z-10 transition-all duration-500 transform",
            selectedCountry
              ? "translate-y-0 opacity-100"
              : "-translate-y-10 opacity-0 pointer-events-none",
          )}
        >
          {selectedCountryData && (
            <div className="bg-white/95 backdrop-blur-md border border-zinc-200 p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                    style={{
                      backgroundColor:
                        REGION_COLORS[
                          selectedCountryData.cluster as keyof typeof REGION_COLORS
                        ],
                    }}
                  />
                  <h2 className="font-extrabold text-zinc-900 text-base">
                    {selectedCountryData.country}
                  </h2>
                </div>
                <div className="flex gap-5 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 leading-none mb-1">
                      Life Expectancy
                    </span>
                    <span className="text-sm font-bold text-zinc-800 leading-none">
                      {selectedCountryData.life_expect}{" "}
                      <span className="text-[10px] font-medium text-zinc-500">
                        yrs
                      </span>
                    </span>
                  </div>
                  <div className="w-px h-6 bg-zinc-100 mt-1" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 leading-none mb-1">
                      Babies / Woman
                    </span>
                    <span className="text-sm font-bold text-zinc-800 leading-none">
                      {selectedCountryData.fertility}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="ml-4 p-2 rounded-full bg-zinc-50 text-zinc-400 active:bg-zinc-100 active:scale-90 transition-all"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Axis Labels in Chart Area */}
        <div className="absolute bottom-10 left-8 pointer-events-none z-10">
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            Fertility →
          </span>
        </div>
        <div className="absolute top-8 left-2 pointer-events-none z-10 -rotate-90 origin-bottom-left translate-y-full">
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            Life Expectancy →
          </span>
        </div>

        {/* Chart Area */}
        <div className="flex-1 w-full min-h-0 pt-2 px-1">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 15, bottom: 5, left: -25 }}>
              <XAxis
                type="number"
                dataKey="fertility"
                name="fertility"
                domain={[0, 9]}
                tickCount={5}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }}
              />
              <YAxis
                type="number"
                dataKey="life_expect"
                name="life expect"
                domain={[20, 90]}
                tickCount={6}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }}
              />
              <ZAxis type="number" dataKey="pop" range={[80, 2500]} />

              {/* Trail for selected country */}
              {selectedCountry && (
                <Scatter
                  data={selectedCountryTrail}
                  line={{
                    stroke: "#444",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  lineType="joint"
                  shape={() => null}
                  isAnimationActive={false}
                />
              )}

              <Scatter
                data={yearData}
                onClick={(node) =>
                  setSelectedCountry(
                    node.country === selectedCountry ? null : node.country,
                  )
                }
                isAnimationActive={true}
              >
                {yearData.map((entry) => (
                  <Cell
                    key={entry.country}
                    fill={
                      REGION_COLORS[entry.cluster as keyof typeof REGION_COLORS]
                    }
                    stroke={selectedCountry === entry.country ? "#000" : "#fff"}
                    strokeWidth={selectedCountry === entry.country ? 2 : 0.5}
                    fillOpacity={
                      selectedCountry
                        ? selectedCountry === entry.country
                          ? 1
                          : 0.15
                        : 0.75
                    }
                    style={{
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-6 pb-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause fill="currentColor" size={24} />
            ) : (
              <Play fill="currentColor" size={24} className="ml-1" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-zinc-900">
                {currentYear}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-tighter font-semibold">
                Slide to change year
              </span>
            </div>
            <input
              type="range"
              min="1955"
              max="2005"
              step="5"
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(parseInt(e.target.value, 10));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4">
          {Object.entries(REGIONS).map(([cluster, name]) => (
            <div
              key={cluster}
              className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap bg-white px-2 py-1 rounded-full border border-zinc-200 text-[10px] font-medium text-zinc-600"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    REGION_COLORS[
                      cluster as unknown as keyof typeof REGION_COLORS
                    ],
                }}
              />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-100">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search country..."
                className="w-full bg-zinc-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-zinc-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="text-sm font-semibold text-zinc-900 px-2"
            >
              Cancel
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {searchQuery ? (
              filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    type="button"
                    key={country}
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 border-b border-zinc-50 last:border-none"
                  >
                    <span className="text-sm font-medium text-zinc-900">
                      {country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-400">
                  No countries found matching "{searchQuery}"
                </div>
              )
            ) : (
              <div className="p-4">
                <p className="text-xs font-bold text-zinc-400 uppercase mb-3">
                  Popular Countries
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "China",
                    "India",
                    "United States",
                    "Brazil",
                    "Japan",
                    "Nigeria",
                  ].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => {
                        setSelectedCountry(c);
                        setShowSearch(false);
                      }}
                      className="text-left px-3 py-2 bg-zinc-50 rounded-lg text-sm font-medium text-zinc-700"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
