"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { twMerge } from "tailwind-merge";
import rawData from "@/components/vega/vega-altair-22/data.json";

// --- Types ---
type RawDataPoint = {
	"Trial A": number;
	"Trial B": number;
	"Trial C": number;
};

type BinData = {
	binStart: number;
	binEnd: number;
	"Trial A": number;
	"Trial B": number;
	"Trial C": number;
	mid: number;
};

type TrialKey = "Trial A" | "Trial B" | "Trial C";
type FilterType = "All" | TrialKey;

type ChartMouseState = {
	activePayload?: { payload: BinData }[];
};

// --- Helpers ---
function cn(...inputs: (string | undefined | null | false)[]) {
	return twMerge(clsx(inputs));
}

const COLORS = {
	"Trial A": "#3b82f6", // blue-500
	"Trial B": "#f97316", // orange-500
	"Trial C": "#ef4444", // red-500
};

// --- Data Processing ---
const PROCESS_DATA = () => {
	const data = rawData as RawDataPoint[];
	let min = Infinity;
	let max = -Infinity;

	// Find global min/max
	for (const d of data) {
		min = Math.min(min, d["Trial A"], d["Trial B"], d["Trial C"]);
		max = Math.max(max, d["Trial A"], d["Trial B"], d["Trial C"]);
	}

	// Add some padding to min/max
	min = Math.floor(min);
	max = Math.ceil(max);

	const BIN_COUNT = 40;
	const step = (max - min) / BIN_COUNT;

	// Initialize bins
	const bins: BinData[] = [];
	for (let i = 0; i < BIN_COUNT; i++) {
		bins.push({
			binStart: min + i * step,
			binEnd: min + (i + 1) * step,
			mid: min + (i + 0.5) * step,
			"Trial A": 0,
			"Trial B": 0,
			"Trial C": 0,
		});
	}

	// Populate bins
	for (const d of data) {
		(["Trial A", "Trial B", "Trial C"] as TrialKey[]).forEach((trial) => {
			const val = d[trial];
			// Find bin index
			let idx = Math.floor((val - min) / step);
			if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
			if (idx < 0) idx = 0;
			bins[idx][trial]++;
		});
	}

	return bins;
};

export function Visualization() {
	const [activeTab, setActiveTab] = useState<FilterType>("All");
	const [activeBin, setActiveBin] = useState<BinData | null>(null);

	const chartData = useMemo(() => PROCESS_DATA(), []);

	// Handle chart interaction
	const handleMouseMove = (state: unknown) => {
		const payload = (state as ChartMouseState | undefined)?.activePayload;
		if (payload && payload.length > 0) {
			setActiveBin(payload[0].payload);
		} else {
			setActiveBin(null);
		}
	};

	const handleMouseLeave = () => {
		setActiveBin(null);
	};

	return (
		<div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
			{/* Header */}
			<div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
				<h1 className="text-xl font-bold tracking-tight">Experiment Results</h1>
				<p className="text-sm text-slate-500">
					Distribution of measurements across trials
				</p>
			</div>

			{/* Controls */}
			<div className="p-2 bg-slate-100 border-b border-slate-200 sticky top-0 z-10 overflow-x-auto">
				<div className="flex space-x-2 min-w-max px-2">
					{(["All", "Trial A", "Trial B", "Trial C"] as FilterType[]).map(
						(tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={cn(
									"px-4 py-2 rounded-full text-sm font-medium transition-colors",
									activeTab === tab
										? "bg-slate-900 text-white shadow-md"
										: "bg-white text-slate-600 hover:bg-slate-200 border border-slate-300",
								)}
							>
								{tab}
							</button>
						),
					)}
				</div>
			</div>

			{/* Chart Area */}
			<div className="flex-1 w-full min-h-0 relative p-4">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						onTouchMove={handleMouseMove} // For mobile touch support
					>
						<XAxis
							dataKey="mid"
							type="number"
							domain={["dataMin", "dataMax"]}
							tickCount={6}
							tick={{ fontSize: 12, fill: "#64748b" }}
							tickFormatter={(val) => val.toFixed(1)}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							cursor={{ fill: "rgba(0,0,0,0.05)" }}
							content={() => null} // Hide default tooltip, we use the bottom panel
						/>

						{/* Trial A */}
						{(activeTab === "All" || activeTab === "Trial A") && (
							<Bar
								dataKey="Trial A"
								fill={COLORS["Trial A"]}
								opacity={activeTab === "All" ? 0.6 : 1}
								radius={[4, 4, 0, 0]}
								animationDuration={300}
							/>
						)}

						{/* Trial B */}
						{(activeTab === "All" || activeTab === "Trial B") && (
							<Bar
								dataKey="Trial B"
								fill={COLORS["Trial B"]}
								opacity={activeTab === "All" ? 0.6 : 1}
								radius={[4, 4, 0, 0]}
								animationDuration={300}
							/>
						)}

						{/* Trial C */}
						{(activeTab === "All" || activeTab === "Trial C") && (
							<Bar
								dataKey="Trial C"
								fill={COLORS["Trial C"]}
								opacity={activeTab === "All" ? 0.6 : 1}
								radius={[4, 4, 0, 0]}
								animationDuration={300}
							/>
						)}
					</BarChart>
				</ResponsiveContainer>

				{/* Overlay instructions if no interaction yet? Maybe not needed. */}
			</div>

			{/* Bottom Stats Panel */}
			<div className="bg-white border-t border-slate-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
				<div className="flex justify-between items-center mb-2">
					<span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
						Range
					</span>
					<span className="text-sm font-mono font-medium text-slate-900">
						{activeBin
							? `${activeBin.binStart.toFixed(2)} — ${activeBin.binEnd.toFixed(2)}`
							: "Touch chart to inspect"}
					</span>
				</div>

				<div className="grid grid-cols-3 gap-2">
					{(["Trial A", "Trial B", "Trial C"] as TrialKey[]).map((trial) => {
						const isActive = activeTab === "All" || activeTab === trial;
						return (
							<div
								key={trial}
								className={cn(
									"flex flex-col p-2 rounded-lg border",
									isActive
										? "border-slate-200 bg-slate-50"
										: "border-transparent opacity-40",
								)}
							>
								<div className="flex items-center space-x-1 mb-1">
									<div
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: COLORS[trial] }}
									/>
									<span className="text-[10px] text-slate-500 font-medium truncate">
										{trial.replace("Trial ", "")}
									</span>
								</div>
								<span className="text-lg font-bold text-slate-900 leading-none">
									{activeBin ? activeBin[trial] : "-"}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
