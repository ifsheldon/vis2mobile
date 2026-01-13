"use client";

import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATA = [
  { origin: "Europe", cylinders: 4, count: 66 },
  { origin: "Europe", cylinders: 5, count: 3 },
  { origin: "Europe", cylinders: 6, count: 4 },
  { origin: "Japan", cylinders: 3, count: 4 },
  { origin: "Japan", cylinders: 4, count: 69 },
  { origin: "Japan", cylinders: 6, count: 6 },
  { origin: "USA", cylinders: 4, count: 72 },
  { origin: "USA", cylinders: 6, count: 74 },
  { origin: "USA", cylinders: 8, count: 108 },
];

const ORIGINS = ["Europe", "Japan", "USA"];
const CYLINDERS = [3, 4, 5, 6, 8];

const MAX_COUNT = Math.max(...DATA.map((d) => d.count));

const getBackgroundColor = (count: number) => {
  if (count === 0) return "rgba(244, 244, 245, 0.5)"; // zinc-100 with opacity
  const ratio = count / MAX_COUNT;
  // Using a blue-to-indigo gradient scale
  // 0 -> bg-blue-50 (or similar)
  // 1 -> bg-indigo-900
  // We can use hsl for smooth interpolation
  const h = 220 + (240 - 220) * ratio; // Blue to Indigo
  const s = 70 + (90 - 70) * ratio; // Increase saturation
  const l = 95 - (95 - 30) * ratio; // Decrease lightness
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const getTextColor = (count: number) => {
  const ratio = count / MAX_COUNT;
  return ratio > 0.5 ? "white" : "rgb(39, 39, 42)"; // zinc-800
};
export function Visualization() {
  const [selectedCell, setSelectedCell] = useState<{
    origin: string;
    cylinders: number;
  } | null>(null);

  const getCount = (origin: string, cylinders: number) => {
    return (
      DATA.find((d) => d.origin === origin && d.cylinders === cylinders)
        ?.count || 0
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Car Distribution
        </h1>
        <p className="text-zinc-500 text-sm">
          Frequency of cars by Origin and Cylinders
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 self-end px-2">
        <span className="text-xs text-zinc-400 font-medium">0</span>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-900" />
        <span className="text-xs text-zinc-400 font-medium">{MAX_COUNT}</span>
      </div>

      <div className="relative bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-xl shadow-indigo-500/10">
        {/* Column Headers (Origin) */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr] mb-2">
          <div /> {/* Empty top-left corner */}
          {ORIGINS.map((origin) => (
            <div key={origin} className="text-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {origin}
              </span>
            </div>
          ))}
        </div>

        {/* Rows (Cylinders) */}
        <div className="flex flex-col gap-2">
          {CYLINDERS.map((cylinder) => (
            <div
              key={cylinder}
              className="grid grid-cols-[60px_1fr_1fr_1fr] items-center gap-2"
            >
              <div className="flex flex-col items-end pr-4">
                <span className="text-lg font-bold text-zinc-800">
                  {cylinder}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-medium leading-none">
                  Cyl
                </span>
              </div>

              {ORIGINS.map((origin) => {
                const count = getCount(origin, cylinder);
                const isSelected =
                  selectedCell?.origin === origin &&
                  selectedCell?.cylinders === cylinder;

                return (
                  <motion.button
                    key={origin}
                    whileTap={{ scale: 0.92 }}
                    onClick={() =>
                      setSelectedCell(
                        isSelected ? null : { origin, cylinders: cylinder },
                      )
                    }
                    className={cn(
                      "relative aspect-[4/3] rounded-xl flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "ring-4 ring-indigo-500 ring-offset-2 z-10"
                        : "hover:brightness-95",
                    )}
                    style={{ backgroundColor: getBackgroundColor(count) }}
                  >
                    <span
                      className="text-lg font-bold transition-colors duration-300"
                      style={{ color: getTextColor(count) }}
                    >
                      {count}
                    </span>

                    {/* Highlight effect for selected */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          layoutId="highlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-xl bg-white/10"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Detail Info */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedCell ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex gap-4 items-center"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Region
                </span>
                <span className="text-sm font-bold text-indigo-900">
                  {selectedCell.origin}
                </span>
              </div>
              <div className="w-px h-8 bg-indigo-200" />
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Engine
                </span>
                <span className="text-sm font-bold text-indigo-900">
                  {selectedCell.cylinders} Cyl
                </span>
              </div>
              <div className="w-px h-8 bg-indigo-200" />
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Records
                </span>
                <span className="text-sm font-bold text-indigo-900">
                  {getCount(selectedCell.origin, selectedCell.cylinders)}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-400 text-sm italic"
            >
              Tap a cell for details
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
