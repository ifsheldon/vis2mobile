"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ellipsePoints,
  scatterData,
  type ScatterPoint,
  type Species,
} from "../data/penguinData";

type SpeciesFilter = Species | "All";

type SpeciesConfig = {
  label: Species;
  color: string;
  glow: string;
};

const SPECIES_CONFIG: Record<Species, SpeciesConfig> = {
  Adelie: { label: "Adelie", color: "#3B82F6", glow: "rgba(59,130,246,0.35)" },
  Chinstrap: {
    label: "Chinstrap",
    color: "#F97316",
    glow: "rgba(249,115,22,0.35)",
  },
  Gentoo: { label: "Gentoo", color: "#EF4444", glow: "rgba(239,68,68,0.35)" },
};

const ellipseBySpecies: Record<Species, typeof ellipsePoints> = {
  Adelie: ellipsePoints
    .filter((point) => point.species === "Adelie")
    .sort((a, b) => a.order - b.order),
  Chinstrap: ellipsePoints
    .filter((point) => point.species === "Chinstrap")
    .sort((a, b) => a.order - b.order),
  Gentoo: ellipsePoints
    .filter((point) => point.species === "Gentoo")
    .sort((a, b) => a.order - b.order),
};

const ranges = scatterData.reduce(
  (acc, point) => {
    acc.minFlipper = Math.min(acc.minFlipper, point.flipperLength);
    acc.maxFlipper = Math.max(acc.maxFlipper, point.flipperLength);
    acc.minMass = Math.min(acc.minMass, point.bodyMass);
    acc.maxMass = Math.max(acc.maxMass, point.bodyMass);
    return acc;
  },
  {
    minFlipper: Number.POSITIVE_INFINITY,
    maxFlipper: Number.NEGATIVE_INFINITY,
    minMass: Number.POSITIVE_INFINITY,
    maxMass: Number.NEGATIVE_INFINITY,
  },
);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

const makeTicks = (min: number, max: number, count: number) => {
  if (count <= 1) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
};

export function Visualization() {
  const [activeSpecies, setActiveSpecies] = useState<SpeciesFilter>("All");
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint | null>(null);

  const view = useMemo(
    () => ({
      width: 360,
      height: 520,
      margin: { top: 28, right: 18, bottom: 68, left: 62 },
    }),
    [],
  );

  const { xScale, yScale, xTicks, yTicks } = useMemo(() => {
    const innerWidth = view.width - view.margin.left - view.margin.right;
    const innerHeight = view.height - view.margin.top - view.margin.bottom;
    const xScaleFn = (value: number) =>
      view.margin.left +
      ((value - ranges.minFlipper) / (ranges.maxFlipper - ranges.minFlipper)) *
        innerWidth;
    const yScaleFn = (value: number) =>
      view.margin.top +
      innerHeight -
      ((value - ranges.minMass) / (ranges.maxMass - ranges.minMass)) *
        innerHeight;
    return {
      xScale: xScaleFn,
      yScale: yScaleFn,
      xTicks: makeTicks(ranges.minFlipper, ranges.maxFlipper, 5),
      yTicks: makeTicks(ranges.minMass, ranges.maxMass, 5),
    };
  }, [view]);

  const displayPoints = useMemo(() => {
    if (activeSpecies === "All") return scatterData;
    return scatterData.filter((point) => point.species === activeSpecies);
  }, [activeSpecies]);

  const stats = useMemo(() => {
    if (displayPoints.length === 0) return null;
    const sumMass = displayPoints.reduce((acc, p) => acc + p.bodyMass, 0);
    const sumFlipper = displayPoints.reduce(
      (acc, p) => acc + p.flipperLength,
      0,
    );
    return {
      avgMass: sumMass / displayPoints.length,
      avgFlipper: sumFlipper / displayPoints.length,
      count: displayPoints.length,
    };
  }, [displayPoints]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#E0F2FE,_#F8FAFC_55%,_#FFF7ED)] px-4 py-6 text-slate-900 font-sans">
      <div className="pointer-events-none absolute -left-24 top-10 h-44 w-44 rounded-full bg-[#F97316]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-28 h-56 w-56 rounded-full bg-[#3B82F6]/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col gap-4">
        <header className="rounded-3xl border border-white/40 bg-white/70 px-4 py-4 shadow-lg shadow-slate-200/60 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Penguin Morphology
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Body Mass vs Flipper
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {["All", "Adelie", "Chinstrap", "Gentoo"].map((species) => {
              const isActive = activeSpecies === species;
              const config =
                species === "All" ? null : SPECIES_CONFIG[species as Species];
              const baseColor = config ? config.color : "#0F172A";
              return (
                <motion.button
                  key={species}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setSelectedPoint(null);
                    setActiveSpecies(species as SpeciesFilter);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    isActive
                      ? "border-transparent text-white shadow-md"
                      : "border-slate-200 bg-white/70 text-slate-700"
                  }`}
                  style={
                    isActive
                      ? {
                          background: baseColor,
                          boxShadow: `0 4px 12px ${config?.glow ?? "rgba(15,23,42,0.25)"}`,
                        }
                      : undefined
                  }
                >
                  {species}
                </motion.button>
              );
            })}
          </div>
        </header>

        <div className="flex-1 rounded-[32px] border border-white/50 bg-white/60 p-2 shadow-xl shadow-slate-200/50 backdrop-blur">
          <div className="relative h-full w-full">
            <svg
              viewBox={`0 0 ${view.width} ${view.height}`}
              className="h-full w-full touch-none"
              onClick={() => setSelectedPoint(null)}
            >
              <rect
                x={view.margin.left}
                y={view.margin.top}
                width={view.width - view.margin.left - view.margin.right}
                height={view.height - view.margin.top - view.margin.bottom}
                rx={24}
                fill="#F8FAFC"
                opacity={0.5}
              />

              {yTicks.map((tick) => {
                const y = yScale(tick);
                return (
                  <g key={`grid-y-${tick}`}>
                    <line
                      x1={view.margin.left}
                      x2={view.width - view.margin.right}
                      y1={y}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                    <text
                      x={view.margin.left - 12}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={11}
                      fontWeight="500"
                      fill="#94A3B8"
                    >
                      {formatNumber(tick)}
                    </text>
                  </g>
                );
              })}

              {xTicks.map((tick) => {
                const x = xScale(tick);
                return (
                  <g key={`grid-x-${tick}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={view.margin.top}
                      y2={view.height - view.margin.bottom}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={view.height - view.margin.bottom + 24}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="500"
                      fill="#94A3B8"
                    >
                      {Math.round(tick)}
                    </text>
                  </g>
                );
              })}

              <text
                x={
                  view.margin.left +
                  (view.width - view.margin.left - view.margin.right) / 2
                }
                y={view.height - 20}
                textAnchor="middle"
                fontSize={13}
                fontWeight="600"
                fill="#64748B"
              >
                Flipper length (mm)
              </text>
              <text
                x={18}
                y={
                  view.margin.top +
                  (view.height - view.margin.top - view.margin.bottom) / 2
                }
                textAnchor="middle"
                fontSize={13}
                fontWeight="600"
                fill="#64748B"
                transform={`rotate(-90 18 ${view.margin.top + (view.height - view.margin.top - view.margin.bottom) / 2})`}
              >
                Body mass (g)
              </text>

              {(Object.keys(SPECIES_CONFIG) as Species[]).map((species) => {
                const points = ellipseBySpecies[species];
                const isActive =
                  activeSpecies === "All" || activeSpecies === species;
                const d = points
                  .map((point, index) => {
                    const x = xScale(point.flipperLength);
                    const y = yScale(point.bodyMass);
                    return `${index === 0 ? "M" : "L"}${x} ${y}`;
                  })
                  .join(" ");
                return (
                  <motion.path
                    key={`ellipse-${species}`}
                    initial={false}
                    animate={{
                      opacity: isActive ? 0.18 : 0.02,
                      fill: SPECIES_CONFIG[species].color,
                    }}
                    transition={{ duration: 0.4 }}
                    d={`${d} Z`}
                  />
                );
              })}

              {scatterData.map((point, index) => {
                const x = xScale(point.flipperLength);
                const y = yScale(point.bodyMass);
                const isFocused =
                  activeSpecies === "All" || activeSpecies === point.species;
                const isSelected = selectedPoint === point;

                return (
                  <motion.circle
                    key={`point-${index}`}
                    cx={x}
                    cy={y}
                    initial={false}
                    animate={{
                      r: isSelected ? 8 : isFocused ? 5.5 : 4,
                      opacity: isFocused ? 0.9 : 0.1,
                      strokeWidth: isSelected ? 2.5 : 1,
                      stroke: isSelected ? "#0F172A" : "#FFFFFF",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    fill={SPECIES_CONFIG[point.species].color}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPoint(point);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}

              <rect
                x={view.margin.left}
                y={view.margin.top}
                width={view.width - view.margin.left - view.margin.right}
                height={view.height - view.margin.top - view.margin.bottom}
                rx={24}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth={1.5}
              />
            </svg>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={
              selectedPoint
                ? `selected-${selectedPoint.flipperLength}-${selectedPoint.bodyMass}`
                : `summary-${activeSpecies}`
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/50 bg-white/70 px-5 py-5 shadow-lg shadow-slate-200/60 backdrop-blur"
          >
            {selectedPoint ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Specimen Profile
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm"
                    style={{
                      background: SPECIES_CONFIG[selectedPoint.species].color,
                    }}
                  >
                    {selectedPoint.species}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {formatNumber(selectedPoint.bodyMass)}
                    <span className="text-sm font-medium text-slate-500 ml-1">
                      g mass
                    </span>
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    {selectedPoint.flipperLength} mm flipper length
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400">
                      Island
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedPoint.island}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400">
                      Sex
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedPoint.sex ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400">
                      Beak (L×D)
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedPoint.beakLength}×{selectedPoint.beakDepth}mm
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {activeSpecies === "All"
                      ? "Global Overview"
                      : `${activeSpecies} Summary`}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    Avg: {formatNumber(stats?.avgMass ?? 0)}g ·{" "}
                    {Math.round(stats?.avgFlipper ?? 0)}mm
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Based on {stats?.count} recorded specimens
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xs font-bold">{stats?.count}</span>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
