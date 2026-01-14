"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Car as CarIcon, Gauge, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";
import { type Car, cars } from "@/components/vega/vega-lite-21/data";

const CYLINDER_OPTIONS = [3, 4, 5, 6, 8];

const ORIGIN_COLORS: Record<string, string> = {
	USA: "#3b82f6", // Blue
	Europe: "#10b981", // Green
	Japan: "#f59e0b", // Amber
};

interface ProcessedCar extends Car {
	jitteredY: number;
	id: number;
}

export function Visualization() {
	const [selectedCar, setSelectedCar] = useState<ProcessedCar | null>(null);

	const processedData: ProcessedCar[] = useMemo(() => {
		return cars
			.filter((car) => car.Horsepower !== null && car.Cylinders !== null)
			.map((car, index) => ({
				...car,
				// Add jitter: Cylinders + random value between -0.3 and 0.3
				jitteredY: car.Cylinders + (Math.random() - 0.5) * 0.6,
				id: index,
			}));
	}, []);

	const hpDomain = useMemo(() => {
		const hps = processedData.map((d) => d.Horsepower as number);
		return [0, Math.ceil(Math.max(...hps) / 50) * 50];
	}, [processedData]);

	const handlePointClick = (data: { payload?: ProcessedCar }) => {
		if (data?.payload) {
			setSelectedCar(data.payload);
		}
	};

	return (
		<div className="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 p-6 font-sans select-none">
			{/* Header */}
			<div className="mb-4">
				<h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
					Power <span className="text-blue-500">Stats</span>
				</h1>
				<p className="text-zinc-500 text-xs font-medium tracking-wide uppercase">
					Horsepower vs Cylinders
				</p>
			</div>

			{/* Legend */}
			<div className="flex gap-4 mb-4">
				{Object.entries(ORIGIN_COLORS).map(([origin, color]) => (
					<div key={origin} className="flex items-center gap-1.5">
						<div
							className="w-2 h-2 rounded-full"
							style={{ backgroundColor: color }}
						/>
						<span className="text-[10px] font-bold text-zinc-400 uppercase">
							{origin}
						</span>
					</div>
				))}
			</div>

			{/* Main Chart Area */}
			<div className="flex-1 relative min-h-[350px] -ml-4">
				<ResponsiveContainer width="100%" height="100%">
					<ScatterChart
						margin={{ top: 10, right: 10, bottom: 40, left: 0 }}
						onClick={(data) => {
							const payload = (data as { activePayload?: Array<unknown> })
								?.activePayload;
							if (!payload || payload.length === 0) {
								setSelectedCar(null);
							}
						}}
					>
						{/* Horizontal Lane Backgrounds */}
						{CYLINDER_OPTIONS.map((cyl) => (
							<ReferenceLine
								key={`lane-${cyl}`}
								y={cyl}
								stroke="#27272a"
								strokeWidth={44}
								strokeOpacity={0.2}
							/>
						))}

						<XAxis
							type="number"
							dataKey="Horsepower"
							name="Horsepower"
							unit=" HP"
							domain={hpDomain}
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#52525b", fontSize: 10, fontWeight: 700 }}
							label={{
								value: "Horsepower (HP)",
								position: "bottom",
								offset: 20,
								fill: "#71717a",
								fontSize: 10,
								fontWeight: 800,
								className: "uppercase tracking-widest",
							}}
						/>
						<YAxis
							type="number"
							dataKey="jitteredY"
							name="Cylinders"
							domain={[2, 9]}
							hide
						/>
						<ZAxis type="number" range={[100, 100]} />

						{/* Custom Labels for Lanes */}
						{CYLINDER_OPTIONS.map((cyl) => (
							<ReferenceLine
								key={`label-${cyl}`}
								y={cyl}
								stroke="transparent"
								label={{
									value: `${cyl} Cyl`,
									position: "left",
									fill: "#a1a1aa",
									fontSize: 10,
									fontWeight: 900,
									offset: 10,
									className: "uppercase tracking-tighter",
								}}
							/>
						))}

						<Scatter
							name="Cars"
							data={processedData}
							onClick={handlePointClick}
							isAnimationActive={true}
							animationBegin={0}
							animationDuration={800}
						>
							{processedData.map((entry) => (
								<Cell
									key={`cell-${entry.id}`}
									fill={ORIGIN_COLORS[entry.Origin] || "#3b82f6"}
									fillOpacity={selectedCar?.id === entry.id ? 1 : 0.5}
									stroke={selectedCar?.id === entry.id ? "#fff" : "transparent"}
									strokeWidth={selectedCar?.id === entry.id ? 2 : 0}
									className="transition-all duration-300 cursor-pointer"
								/>
							))}
						</Scatter>

						<Tooltip
							cursor={{ strokeDasharray: "3 3", stroke: "#3f3f46" }}
							content={() => null}
						/>
					</ScatterChart>
				</ResponsiveContainer>
			</div>

			{/* Bottom Detail Card */}
			<div className="h-44 mt-4">
				<AnimatePresence mode="wait">
					{selectedCar ? (
						<motion.div
							key="detail-card"
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden"
						>
							<div
								className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-3xl"
								style={{ backgroundColor: ORIGIN_COLORS[selectedCar.Origin] }}
							/>

							<div className="flex justify-between items-start z-10">
								<div className="flex-1">
									<div className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-1 flex items-center gap-1">
										<CarIcon size={10} />
										Vehicle Details
									</div>
									<h2 className="text-xl font-black text-white leading-none line-clamp-1 italic uppercase tracking-tighter">
										{selectedCar.Name}
									</h2>
								</div>
								<div
									className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
									style={{
										backgroundColor: `${ORIGIN_COLORS[selectedCar.Origin]}10`,
										color: ORIGIN_COLORS[selectedCar.Origin],
										borderColor: `${ORIGIN_COLORS[selectedCar.Origin]}30`,
									}}
								>
									{selectedCar.Origin}
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3 mt-3 z-10">
								<div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/50">
									<div className="flex items-center gap-1 text-zinc-500 mb-1 uppercase tracking-tighter">
										<Gauge size={12} className="text-blue-500" />
										<span className="text-[9px] font-black">Power</span>
									</div>
									<div className="text-base font-black text-zinc-100">
										{selectedCar.Horsepower}
										<span className="text-[9px] font-medium text-zinc-500 ml-1 italic">
											HP
										</span>
									</div>
								</div>
								<div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/50">
									<div className="flex items-center gap-1 text-zinc-500 mb-1 uppercase tracking-tighter">
										<Activity size={12} className="text-emerald-500" />
										<span className="text-[9px] font-black">Engine</span>
									</div>
									<div className="text-base font-black text-zinc-100">
										{selectedCar.Cylinders}
										<span className="text-[9px] font-medium text-zinc-500 ml-1 italic">
											CYL
										</span>
									</div>
								</div>
								<div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/50">
									<div className="flex items-center gap-1 text-zinc-500 mb-1 uppercase tracking-tighter">
										<Info size={12} className="text-amber-500" />
										<span className="text-[9px] font-black">Year</span>
									</div>
									<div className="text-base font-black text-zinc-100">
										{"'"}
										{new Date(selectedCar.Year)
											.getFullYear()
											.toString()
											.slice(-2)}
									</div>
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="empty-state"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="w-full h-full bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-500 p-6 text-center"
						>
							<div className="w-12 h-12 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-3 border border-zinc-800 shadow-inner">
								<Activity size={24} className="text-zinc-700" />
							</div>
							<p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
								Select a data point for details
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
