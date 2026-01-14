"use client";

import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// --- Data ---
interface BoxPlotData {
	species: string;
	min: number;
	q1: number;
	median: number;
	q3: number;
	max: number;
	outliers: number[];
	color: string;
}

const PENGUIN_DATA: BoxPlotData[] = [
	{
		species: "Adelie",
		min: 2850,
		q1: 3350,
		median: 3700,
		q3: 4000,
		max: 4775,
		outliers: [],
		color: "#4c78a8",
	},
	{
		species: "Chinstrap",
		min: 2700,
		q1: 3487.5,
		median: 3700,
		q3: 3950,
		max: 4800,
		outliers: [2700, 4800],
		color: "#f58518",
	},
	{
		species: "Gentoo",
		min: 3950,
		q1: 4700,
		median: 5000,
		q3: 5500,
		max: 6300,
		outliers: [],
		color: "#e45756",
	},
];

// Flatten outliers for the scatter plot
const outlierData = PENGUIN_DATA.flatMap((d) =>
	d.outliers.map((val) => ({ species: d.species, mass: val, color: d.color })),
);

export function Visualization() {
	const [activeSpecies, setActiveSpecies] = useState<string | null>(null);

	const activeData = activeSpecies
		? PENGUIN_DATA.find((d) => d.species === activeSpecies)
		: null;

	const chart = {
		width: 320,
		height: 260,
		padding: { top: 20, right: 20, bottom: 30, left: 30 },
	};
	const yTicks = [2500, 3500, 4500, 5500, 6500];
	const yMin = 2500;
	const yMax = 6500;
	const xStep =
		(chart.width - chart.padding.left - chart.padding.right) /
		PENGUIN_DATA.length;
	const getX = (index: number) => chart.padding.left + xStep * (index + 0.5);
	const yScale = (value: number) =>
		chart.padding.top +
		(chart.height - chart.padding.top - chart.padding.bottom) *
			(1 - (value - yMin) / (yMax - yMin));

	return (
		<div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
			{/* Header */}
			<header className="px-6 pt-6 pb-2 shrink-0">
				<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
					Penguin Body Mass
				</h1>
				<p className="text-sm text-slate-500 font-medium">
					Distribution by Species (g)
				</p>
			</header>

			{/* Chart Area */}
			<div className="flex-1 w-full min-h-0 relative px-2">
				<div className="absolute inset-0">
					<svg
						viewBox={`0 0 ${chart.width} ${chart.height}`}
						className="w-full h-full"
						role="img"
						aria-label="Penguin body mass distribution by species"
					>
						{/* Gridlines + Y-axis labels */}
						{yTicks.map((tick) => {
							const y = yScale(tick);
							return (
								<g key={`tick-${tick}`}>
									<line
										x1={chart.padding.left}
										y1={y}
										x2={chart.width - chart.padding.right}
										y2={y}
										stroke="#e2e8f0"
										strokeDasharray="4 4"
									/>
									<text
										x={chart.padding.left - 8}
										y={y + 4}
										fontSize="10"
										fill="#94a3b8"
										textAnchor="end"
									>
										{tick / 1000}k
									</text>
								</g>
							);
						})}

						{/* Box plots */}
						{PENGUIN_DATA.map((entry, index) => {
							const center = getX(index);
							const boxWidth = xStep * 0.6;
							const boxLeft = center - boxWidth / 2;
							const minPos = yScale(entry.min);
							const q1Pos = yScale(entry.q1);
							const medianPos = yScale(entry.median);
							const q3Pos = yScale(entry.q3);
							const maxPos = yScale(entry.max);
							const isActive =
								activeSpecies === null || activeSpecies === entry.species;

							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: SVG group used for chart interaction.
								<g
									key={entry.species}
									onClick={() => setActiveSpecies(entry.species)}
									style={{ cursor: "pointer", opacity: isActive ? 1 : 0.3 }}
								>
									<line
										x1={center}
										y1={minPos}
										x2={center}
										y2={maxPos}
										stroke={entry.color}
										strokeWidth={2}
									/>
									<line
										x1={center - boxWidth / 4}
										y1={minPos}
										x2={center + boxWidth / 4}
										y2={minPos}
										stroke={entry.color}
										strokeWidth={2}
									/>
									<line
										x1={center - boxWidth / 4}
										y1={maxPos}
										x2={center + boxWidth / 4}
										y2={maxPos}
										stroke={entry.color}
										strokeWidth={2}
									/>
									<rect
										x={boxLeft}
										y={q3Pos}
										width={boxWidth}
										height={Math.abs(q1Pos - q3Pos)}
										stroke={entry.color}
										strokeWidth={2}
										fill={entry.color}
										fillOpacity={0.4}
										rx={4}
									/>
									<line
										x1={boxLeft}
										y1={medianPos}
										x2={boxLeft + boxWidth}
										y2={medianPos}
										stroke={entry.color}
										strokeWidth={3}
									/>
								</g>
							);
						})}

						{/* Outliers */}
						{outlierData.map((entry) => {
							const index = PENGUIN_DATA.findIndex(
								(item) => item.species === entry.species,
							);
							if (index === -1) return null;
							return (
								<circle
									key={`${entry.species}-${entry.mass}`}
									cx={getX(index)}
									cy={yScale(entry.mass)}
									r={4}
									fill={entry.color}
									stroke="#fff"
									strokeWidth={2}
								/>
							);
						})}

						{/* X-axis labels */}
						{PENGUIN_DATA.map((entry, index) => (
							<text
								key={`label-${entry.species}`}
								x={getX(index)}
								y={chart.height - chart.padding.bottom + 18}
								fontSize="12"
								fontWeight={600}
								fill="#64748b"
								textAnchor="middle"
							>
								{entry.species}
							</text>
						))}
					</svg>
				</div>

				{/* Interaction Hint (Only show if nothing selected) */}
				{!activeSpecies && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
					>
						<span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
							<Info size={14} />
							Tap a column for details
						</span>
					</motion.div>
				)}
			</div>

			{/* Details Card (Bottom Sheet style) */}
			<AnimatePresence>
				{activeData && (
					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="shrink-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] border-t border-slate-100 p-6 z-10"
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
								<span
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: activeData.color }}
								/>
								{activeData.species}
							</h2>
							<button
								type="button"
								onClick={() => setActiveSpecies(null)}
								className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md"
							>
								CLOSE
							</button>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<StatBox label="Min" value={activeData.min} />
							<StatBox label="Median" value={activeData.median} highlight />
							<StatBox label="Max" value={activeData.max} />
							<StatBox label="Q1" value={activeData.q1} secondary />
							<div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/50">
								<span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
									Outliers
								</span>
								<span className="text-sm font-semibold text-slate-600 mt-0.5">
									{activeData.outliers.length > 0
										? activeData.outliers.length
										: "None"}
								</span>
							</div>
							<StatBox label="Q3" value={activeData.q3} secondary />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function StatBox({
	label,
	value,
	highlight = false,
	secondary = false,
}: {
	label: string;
	value: number;
	highlight?: boolean;
	secondary?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center p-3 rounded-xl border",
				highlight
					? "bg-indigo-50 border-indigo-100"
					: "bg-white border-slate-100",
				secondary && "bg-slate-50 border-slate-100",
			)}
		>
			<span
				className={cn(
					"text-xs font-medium uppercase tracking-wider mb-1",
					highlight ? "text-indigo-600" : "text-slate-400",
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"text-lg font-bold tabular-nums tracking-tight",
					highlight ? "text-indigo-900" : "text-slate-700",
				)}
			>
				{value.toLocaleString()}
			</span>
		</div>
	);
}
