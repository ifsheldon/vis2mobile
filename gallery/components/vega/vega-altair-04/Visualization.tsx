"use client";

import { motion } from "framer-motion";
import { Atom, Leaf, Zap } from "lucide-react";
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
import rawData from "@/components/vega/vega-altair-04/data.json";

interface ProcessedData {
	[year: string]: {
		year: string;
		"Fossil Fuels"?: number;
		"Nuclear Energy"?: number;
		Renewables?: number;
	};
}

interface ChartDataPoint {
	year: string;
	"Fossil Fuels"?: number;
	"Nuclear Energy"?: number;
	Renewables?: number;
}

const processedData = rawData.reduce<ProcessedData>((acc, item) => {
	const year = new Date(item.year).getFullYear().toString();
	if (!acc[year]) {
		acc[year] = { year };
	}
	if (item.source === "Fossil Fuels") {
		acc[year]["Fossil Fuels"] = item.net_generation;
	} else if (item.source === "Nuclear Energy") {
		acc[year]["Nuclear Energy"] = item.net_generation;
	} else if (item.source === "Renewables") {
		acc[year].Renewables = item.net_generation;
	}
	return acc;
}, {});

const chartData: ChartDataPoint[] = Object.values(processedData);

const sources = [
	{ name: "Fossil Fuels", color: "bg-slate-500", icon: Zap },
	{ name: "Nuclear Energy", color: "bg-amber-500", icon: Atom },
	{ name: "Renewables", color: "bg-emerald-500", icon: Leaf },
];

export function Visualization() {
	const [activeYear, setActiveYear] = useState<ChartDataPoint>(
		chartData[chartData.length - 1],
	);

	return (
		<div className="w-full h-full bg-[#0f172a] text-slate-200 p-5 flex flex-col font-sans overflow-hidden">
			<header className="mb-6">
				<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
					Energy Source Share
				</h1>
				<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
					U.S. Net Generation Distribution (2001-2017)
				</p>
			</header>

			<div className="flex flex-wrap gap-2 mb-6">
				{sources.map((source) => (
					<div
						key={source.name}
						className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
					>
						<source.icon
							className={`w-3.5 h-3.5 ${
								source.name === "Fossil Fuels"
									? "text-slate-400"
									: source.name === "Nuclear Energy"
										? "text-amber-400"
										: "text-emerald-400"
							}`}
						/>
						<span className="text-[10px] font-bold uppercase tracking-tight text-slate-300">
							{source.name.split(" ")[0]}
						</span>
					</div>
				))}
			</div>

			<div
				className="w-full relative flex-grow min-h-[300px]"
				style={{ aspectRatio: "1/1" }}
			>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						stackOffset="expand"
						margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
						onMouseMove={(event) => {
							if (event?.activePayload && event.activePayload.length > 0) {
								setActiveYear(event.activePayload[0].payload);
							}
						}}
						onTouchMove={(event) => {
							if (event?.activePayload && event.activePayload.length > 0) {
								setActiveYear(event.activePayload[0].payload);
							}
						}}
					>
						<defs>
							<linearGradient id="colorFossil" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#64748b" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#64748b" stopOpacity={0.2} />
							</linearGradient>
							<linearGradient id="colorNuclear" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
							</linearGradient>
							<linearGradient id="colorRenewable" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
							</linearGradient>
						</defs>
						<CartesianGrid
							vertical={false}
							strokeDasharray="4 4"
							stroke="rgba(255,255,255,0.05)"
						/>
						<XAxis
							dataKey="year"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
							tickFormatter={(tick) => `'${tick.substring(2)}`}
							ticks={["2001", "2005", "2009", "2013", "2017"]}
							interval={0}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tickFormatter={(tick) => `${Math.round(tick * 100)}%`}
							tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
							ticks={[0, 0.5, 1]}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
						/>
						<Area
							type="monotone"
							dataKey="Fossil Fuels"
							stackId="1"
							stroke="#94a3b8"
							strokeWidth={2}
							fill="url(#colorFossil)"
							animationDuration={1000}
						/>
						<Area
							type="monotone"
							dataKey="Nuclear Energy"
							stackId="1"
							stroke="#fbbf24"
							strokeWidth={2}
							fill="url(#colorNuclear)"
							animationDuration={1000}
						/>
						<Area
							type="monotone"
							dataKey="Renewables"
							stackId="1"
							stroke="#34d399"
							strokeWidth={2}
							fill="url(#colorRenewable)"
							animationDuration={1000}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-8 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 via-amber-500/50 to-emerald-500/50" />
				<motion.div
					key={activeYear.year}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.2 }}
					className="flex flex-col items-center"
				>
					<span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
						Year Selected
					</span>
					<p className="text-3xl font-black text-white mb-6 tabular-nums">
						{activeYear.year}
					</p>
					<div className="flex justify-between w-full gap-2">
						{sources.map((source) => {
							const total = Object.values(activeYear).reduce(
								(acc: number, value) => {
									if (typeof value === "number") {
										return acc + value;
									}
									return acc;
								},
								0,
							);
							const percentage =
								((activeYear[source.name as keyof ChartDataPoint] as number) /
									total) *
								100;
							return (
								<div
									key={source.name}
									className="flex-1 flex flex-col items-center p-2 rounded-2xl bg-white/5"
								>
									<source.icon
										className={`w-5 h-5 mb-2 ${
											source.name === "Fossil Fuels"
												? "text-slate-400"
												: source.name === "Nuclear Energy"
													? "text-amber-400"
													: "text-emerald-400"
										}`}
									/>
									<p className="text-xs font-bold text-slate-400 mb-0.5">
										{source.name.split(" ")[0]}
									</p>
									<p className="text-lg font-black text-white tabular-nums">
										{percentage.toFixed(0)}
										<span className="text-[10px] ml-0.5 font-bold text-slate-500">
											%
										</span>
									</p>
								</div>
							);
						})}
					</div>
				</motion.div>
			</div>
		</div>
	);
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ payload: ChartDataPoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return null;
	}
	return null;
};
