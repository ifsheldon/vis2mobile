"use client";

import { Car, Gauge, Globe, Zap } from "lucide-react";
import { useMemo } from "react";
import {
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import carDataRaw from "@/components/vega/vega-altair-36/data.json";

interface CarData {
	Name: string;
	Miles_per_Gallon: number | null;
	Cylinders: number;
	Displacement: number;
	Horsepower: number | null;
	Weight_in_lbs: number;
	Acceleration: number;
	Year: string;
	Origin: string;
}

const data = carDataRaw as CarData[];

const COLORS = {
	USA: "#6366f1", // Indigo
	Europe: "#10b981", // Emerald
	Japan: "#f59e0b", // Amber
};

export function Visualization() {
	const filteredData = useMemo(() => {
		return data.filter(
			(d) => d.Horsepower !== null && d.Miles_per_Gallon !== null,
		);
	}, []);

	// Grouped data for the list (e.g., top 15 by MPG)
	const topEfficientCars = useMemo(() => {
		return [...filteredData]
			.sort((a, b) => (b.Miles_per_Gallon || 0) - (a.Miles_per_Gallon || 0))
			.slice(0, 15);
	}, [filteredData]);

	const CustomTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		payload?: { payload: CarData }[];
	}) => {
		if (active && payload && payload.length) {
			const car = payload[0].payload;
			return (
				<div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
					<p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1 leading-tight">
						{car.Name.toUpperCase()}
					</p>
					<div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
						<div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
							<Zap size={10} />
							<span>{car.Horsepower} HP</span>
						</div>
						<div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
							<Gauge size={10} />
							<span>{car.Miles_per_Gallon} MPG</span>
						</div>
						<div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
							<Globe size={10} />
							<span>{car.Origin}</span>
						</div>
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-y-auto no-scrollbar">
			{/* Header */}
			<div className="px-6 pt-8 pb-4">
				<h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
					Vehicle Performance
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
					Horsepower vs. Fuel Efficiency
				</p>
			</div>

			{/* Chart Section */}
			<div className="w-full px-4 h-[320px] shrink-0">
				<ResponsiveContainer width="100%" height="100%">
					<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#e4e4e7"
						/>
						<XAxis
							type="number"
							dataKey="Horsepower"
							name="Horsepower"
							unit=" HP"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#71717a" }}
							label={{
								value: "Horsepower",
								position: "insideBottom",
								offset: -10,
								fontSize: 10,
								fill: "#a1a1aa",
							}}
						/>
						<YAxis
							type="number"
							dataKey="Miles_per_Gallon"
							name="MPG"
							unit=" MPG"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#71717a" }}
							label={{
								value: "MPG",
								angle: -90,
								position: "insideLeft",
								fontSize: 10,
								fill: "#a1a1aa",
							}}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ strokeDasharray: "3 3" }}
						/>
						<Scatter name="Cars" data={filteredData}>
							{filteredData.map((entry, index) => (
								<Cell
									key={`${entry.Name}-${index}`}
									fill={
										COLORS[entry.Origin as keyof typeof COLORS] || "#94a3b8"
									}
									fillOpacity={0.6}
									strokeWidth={1}
									stroke={
										COLORS[entry.Origin as keyof typeof COLORS] || "#94a3b8"
									}
								/>
							))}
						</Scatter>
					</ScatterChart>
				</ResponsiveContainer>
			</div>

			{/* Legend */}
			<div className="flex justify-center gap-4 py-2">
				{Object.entries(COLORS).map(([origin, color]) => (
					<div key={origin} className="flex items-center gap-1.5">
						<div
							className="w-2.5 h-2.5 rounded-full"
							style={{ backgroundColor: color }}
						/>
						<span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
							{origin}
						</span>
					</div>
				))}
			</div>

			{/* Data List Section */}
			<div className="px-6 py-6 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
						Most Efficient Models
					</h2>
					<span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
						Top 15
					</span>
				</div>

				<div className="space-y-3 pb-8">
					{topEfficientCars.map((car, idx) => (
						<div
							key={`${car.Name}-${idx}`}
							className="group relative bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all active:scale-[0.98]"
						>
							<div className="flex justify-between items-start mb-2">
								<div className="flex flex-col">
									<span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
										{car.Origin}
									</span>
									<h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 capitalize leading-snug">
										{car.Name}
									</h3>
								</div>
								<div className="flex flex-col items-end">
									<span className="text-lg font-black text-zinc-900 dark:text-zinc-100 italic leading-none">
										{car.Miles_per_Gallon}
									</span>
									<span className="text-[10px] font-bold text-zinc-400 uppercase">
										MPG
									</span>
								</div>
							</div>

							<div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
								<div className="flex items-center gap-1.5">
									<Zap size={12} className="text-zinc-400" />
									<span className="text-xs text-zinc-600 dark:text-zinc-400">
										<strong className="text-zinc-800 dark:text-zinc-200">
											{car.Horsepower}
										</strong>{" "}
										HP
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Car size={12} className="text-zinc-400" />
									<span className="text-xs text-zinc-600 dark:text-zinc-400">
										<strong className="text-zinc-800 dark:text-zinc-200">
											{car.Cylinders}
										</strong>{" "}
										Cyl
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
