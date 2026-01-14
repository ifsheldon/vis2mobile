"use client";

import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { data } from "@/components/vega/vega-lite-06/data";

const SPECIES_COLORS: Record<string, string> = {
	Adelie: "#4C78A8",
	Chinstrap: "#F58518",
	Gentoo: "#E45756",
};

interface DataPoint {
	mass: number;
	Adelie: number;
	Chinstrap: number;
	Gentoo: number;
}

export function Visualization() {
	const [activeData, setActiveData] = useState<DataPoint | null>(null);

	const handleMouseMove = (state: {
		activePayload?: { payload: DataPoint }[];
	}) => {
		if (state?.activePayload && state.activePayload.length > 0) {
			setActiveData(state.activePayload[0].payload as DataPoint);
		}
	};

	const handleMouseLeave = () => {
		setActiveData(null);
	};

	return (
		<div className="w-full h-full p-4 flex flex-col items-center justify-center bg-slate-50">
			<div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 flex flex-col gap-6">
				{/* Header */}
				<div className="flex flex-col gap-1">
					<h2 className="text-xl font-bold text-slate-800 tracking-tight">
						Penguin Mass Distribution
					</h2>
					<p className="text-sm text-slate-500 font-medium">
						Density of body mass (g) by species
					</p>
				</div>

				{/* Dynamic Data Header / Legend */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-3">
						{Object.entries(SPECIES_COLORS).map(([species, color]) => (
							<div
								key={species}
								className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200"
							>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: color }}
								/>
								<span className="text-xs font-bold text-slate-700">
									{species}
								</span>
								{activeData && (
									<span className="text-xs font-mono text-slate-500 ml-1">
										{(
											(activeData[species as keyof DataPoint] as number) * 1000
										).toFixed(2)}
									</span>
								)}
							</div>
						))}
					</div>

					{activeData ? (
						<div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex justify-between items-center animate-in fade-in zoom-in duration-200">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
								Current Mass
							</span>
							<span className="text-lg font-black">{activeData.mass}g</span>
						</div>
					) : (
						<div className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl flex justify-between items-center border border-dashed border-slate-300">
							<span className="text-xs font-medium italic">
								Scrub chart to see details
							</span>
							<span className="text-sm">---</span>
						</div>
					)}
				</div>

				{/* Chart Area */}
				<div className="h-[300px] w-full mt-2 relative">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={data}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
						>
							<defs>
								{Object.entries(SPECIES_COLORS).map(([species, color]) => (
									<linearGradient
										key={`gradient-${species}`}
										id={`color${species}`}
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor={color} stopOpacity={0.4} />
										<stop offset="95%" stopColor={color} stopOpacity={0} />
									</linearGradient>
								))}
							</defs>
							<CartesianGrid
								vertical={false}
								strokeDasharray="3 3"
								stroke="#e2e8f0"
							/>
							<XAxis
								dataKey="mass"
								type="number"
								domain={[2500, 6500]}
								ticks={[3000, 4000, 5000, 6000]}
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
								dy={10}
							/>
							<YAxis hide domain={[0, 0.002]} />
							<Tooltip
								content={() => null}
								cursor={{
									stroke: "#475569",
									strokeWidth: 2,
									strokeDasharray: "4 4",
								}}
							/>
							<Area
								type="monotone"
								dataKey="Adelie"
								stroke={SPECIES_COLORS.Adelie}
								strokeWidth={3}
								fillOpacity={1}
								fill="url(#colorAdelie)"
								animationDuration={1500}
							/>
							<Area
								type="monotone"
								dataKey="Chinstrap"
								stroke={SPECIES_COLORS.Chinstrap}
								strokeWidth={3}
								fillOpacity={1}
								fill="url(#colorChinstrap)"
								animationDuration={1500}
							/>
							<Area
								type="monotone"
								dataKey="Gentoo"
								stroke={SPECIES_COLORS.Gentoo}
								strokeWidth={3}
								fillOpacity={1}
								fill="url(#colorGentoo)"
								animationDuration={1500}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Footer Insight */}
				<div className="mt-2 pt-4 border-t border-slate-100">
					<p className="text-[11px] leading-relaxed text-slate-400">
						Adelie and Chinstrap penguins show similar mass distributions, while
						Gentoo penguins are significantly heavier on average.
					</p>
				</div>
			</div>
		</div>
	);
}
