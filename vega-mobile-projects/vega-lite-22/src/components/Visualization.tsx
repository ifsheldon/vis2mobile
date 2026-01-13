"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATA = [
  { cylinders: 3, Europe: 0, Japan: 4, USA: 0 },
  { cylinders: 4, Europe: 66, Japan: 69, USA: 72 },
  { cylinders: 5, Europe: 3, Japan: 0, USA: 0 },
  { cylinders: 6, Europe: 4, Japan: 6, USA: 74 },
  { cylinders: 8, Europe: 0, Japan: 0, USA: 108 },
];

const ORIGINS = ["Europe", "Japan", "USA"] as const;
type Origin = (typeof ORIGINS)[number];

const MAX_VAL = 108;

// YlGnBu color scale interpolation
// 0: #f7fcb9 (light)
// 54: #41b6c4 (mid)
// 108: #081d58 (dark)
function getColor(val: number) {
  if (val === 0) return "#f3f4f6"; // gray-100 for empty

  // Simple interpolation logic
  const r1 = 247,
    g1 = 252,
    b1 = 185; // #f7fcb9
  const r2 = 65,
    g2 = 182,
    b2 = 196; // #41b6c4
  const r3 = 8,
    g3 = 29,
    b3 = 88; // #081d58

  let r: number, g: number, b: number;
  if (val <= MAX_VAL / 2) {
    const p = val / (MAX_VAL / 2);
    r = Math.round(r1 + (r2 - r1) * p);
    g = Math.round(g1 + (g2 - g1) * p);
    b = Math.round(b1 + (b2 - b1) * p);
  } else {
    const p = (val - MAX_VAL / 2) / (MAX_VAL / 2);
    r = Math.round(r2 + (r3 - r2) * p);
    g = Math.round(g2 + (g3 - g2) * p);
    b = Math.round(b2 + (b3 - b2) * p);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function getContrastColor(val: number) {
  return val > 40 ? "white" : "black";
}

export function Visualization() {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: Origin;
  } | null>(null);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 bg-white min-h-[500px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-zinc-900 leading-tight">
          Cars by Origin & Cylinders
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Distribution of car models across manufacturing origins and engine
          sizes.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Frequency
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#f7fcb9] via-[#41b6c4] to-[#081d58]" />
        <div className="flex justify-between mt-1 text-[10px] font-medium text-zinc-500">
          <span>0</span>
          <span>50</span>
          <span>100+</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Column Headers */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr] mb-2">
          <div /> {/* Empty corner */}
          {ORIGINS.map((origin) => (
            <div key={origin} className="text-center">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">
                {origin}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {DATA.map((row) => (
            <div
              key={row.cylinders}
              className="grid grid-cols-[60px_1fr_1fr_1fr] items-center"
            >
              {/* Row Header */}
              <div className="pr-4 text-right">
                <span className="text-xs font-bold text-zinc-500">
                  {row.cylinders}{" "}
                  <span className="font-normal text-[10px] text-zinc-400 block -mt-1">
                    CYL
                  </span>
                </span>
              </div>

              {/* Data Cells */}
              {ORIGINS.map((origin) => {
                const val = row[origin];
                const isHovered =
                  hoveredCell?.row === row.cylinders &&
                  hoveredCell?.col === origin;

                return (
                  <motion.div
                    key={`${row.cylinders}-${origin}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: isHovered ? 1.05 : 1,
                      zIndex: isHovered ? 10 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="aspect-square p-1"
                    onMouseEnter={() =>
                      setHoveredCell({ row: row.cylinders, col: origin })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    onTouchStart={() =>
                      setHoveredCell({ row: row.cylinders, col: origin })
                    }
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-lg flex items-center justify-center transition-shadow duration-200 shadow-sm",
                        isHovered && "shadow-md ring-2 ring-zinc-900/10",
                      )}
                      style={{
                        backgroundColor: getColor(val),
                        color: getContrastColor(val),
                      }}
                    >
                      {val > 0 ? (
                        <span className="text-lg font-bold tabular-nums">
                          {val}
                        </span>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-zinc-300" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-xl p-4">
          <h4 className="text-xs font-bold text-zinc-900 uppercase mb-2 tracking-wide">
            Key Insight
          </h4>
          <p className="text-sm text-zinc-600 leading-relaxed">
            <strong className="text-zinc-900">USA</strong> manufactures all
            8-cylinder models (108), while{" "}
            <strong className="text-zinc-900">Europe</strong> and{" "}
            <strong className="text-zinc-900">Japan</strong> focus heavily on
            4-cylinder engines.
          </p>
        </div>
      </div>
    </div>
  );
}
