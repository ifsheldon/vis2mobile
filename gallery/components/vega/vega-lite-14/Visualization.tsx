"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	CloudRain,
	Info,
	Sun,
	Thermometer,
	Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { weatherData } from "@/components/vega/vega-lite-14/data";

export function Visualization() {
	const [selectedId, setSelectedId] = useState<number>(0);

	const dayNames = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
	];
	const dates = [
		"Jan 13",
		"Jan 14",
		"Jan 15",
		"Jan 16",
		"Jan 17",
		"Jan 18",
		"Jan 19",
		"Jan 20",
		"Jan 21",
		"Jan 22",
	];

	const selectedData = useMemo(() => {
		return weatherData.find((d) => d.id === selectedId) || weatherData[0];
	}, [selectedId]);

	// Transform data for Recharts to handle the ranges
	const chartData = useMemo(() => {
		return weatherData.map((d) => ({
			...d,
			recordRange: [d.record.low, d.record.high],
			normalRange: [d.normal.low, d.normal.high],
			actualRange: d.actual ? [d.actual.low, d.actual.high] : null,
			forecastLowRange: d.forecast
				? [d.forecast.low.low, d.forecast.low.high]
				: null,
			forecastHighRange: d.forecast
				? [d.forecast.high.low, d.forecast.high.high]
				: null,
			forecastConnector: d.forecast
				? [d.forecast.low.high, d.forecast.high.low]
				: null,
		}));
	}, []);

	const handleBarClick = (data: {
		activePayload?: { payload: { id: number } }[];
	}) => {
		if (data?.activePayload) {
			setSelectedId(data.activePayload[0].payload.id);
		}
	};

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pt-10">
			{/* Header */}
			<div className="px-6 py-4">
				<h1 className="text-2xl font-bold tracking-tight">Weather</h1>
				<p className="text-zinc-500 dark:text-zinc-400 text-sm italic">
					Observations and Predictions
				</p>
			</div>

			{/* Legend */}
			<div className="px-6 flex flex-wrap gap-4 mb-2">
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 bg-zinc-200 rounded-sm" />
					<span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
						Record
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 bg-zinc-400 rounded-sm" />
					<span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
						Normal
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 bg-black dark:bg-white rounded-sm" />
					<span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
						Actual/Forecast
					</span>
				</div>
			</div>

			{/* Chart Container - Scrollable */}
			<div className="relative flex-1 min-h-0">
				<div className="overflow-x-auto overflow-y-hidden h-full no-scrollbar px-4">
					<div style={{ width: weatherData.length * 70 + 40 }}>
						<ResponsiveContainer width="100%" height={320}>
							<BarChart
								data={chartData}
								margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
								barGap="-100%"
								onClick={handleBarClick}
							>
								<CartesianGrid
									vertical={false}
									strokeDasharray="3 3"
									stroke="#e5e7eb"
									opacity={0.5}
								/>
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fontWeight: 700 }}
									dy={10}
								/>
								<YAxis
									domain={[10, 70]}
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fill: "#94a3b8" }}
								/>

								{/* Single Bar that renders all layers */}
								<Bar
									dataKey="recordRange"
									barSize={32}
									shape={(props: {
										x?: number;
										y?: number;
										width?: number;
										height?: number;
										payload?: {
											id: number;
											record: { low: number; high: number };
											normal: { low: number; high: number };
											actual?: { low: number; high: number };
											forecast?: {
												high: { low: number; high: number };
												low: { low: number; high: number };
											};
										};
									}) => {
										const { x, y, width, height, payload } = props;
										if (
											x === undefined ||
											y === undefined ||
											width === undefined ||
											height === undefined ||
											!payload
										) {
											return null;
										}
										const isSelected = payload.id === selectedId;

										// Calculate yScale based on the recordRange [low, high]
										// y = scale(high), y + height = scale(low)
										const low = payload.record.low;
										const high = payload.record.high;
										if (high === low) return null;

										const A = -height / (high - low);
										const B = y - A * high;
										const scale = (val: number) => A * val + B;

										const renderRect = (
											vLow: number,
											vHigh: number,
											offset: number,
											fill: string,
											radius: number,
										) => {
											const rY = scale(vHigh);
											const rH = scale(vLow) - rY;
											if (rH <= 0) return null;
											return (
												<rect
													x={x + offset}
													y={rY}
													width={width - 2 * offset}
													height={rH}
													fill={fill}
													rx={radius}
													ry={radius}
												/>
											);
										};

										return (
											<g key={payload.id}>
												{/* Record Layer */}
												{renderRect(
													payload.record.low,
													payload.record.high,
													0,
													isSelected ? "#e5e7eb" : "#f3f4f6",
													4,
												)}
												{isSelected && (
													<rect
														x={x}
														y={y}
														width={width}
														height={height}
														fill="none"
														stroke="#d1d5db"
														strokeWidth={1}
														rx={4}
														ry={4}
													/>
												)}

												{/* Normal Layer */}
												{renderRect(
													payload.normal.low,
													payload.normal.high,
													6,
													isSelected ? "#94a3b8" : "#cbd5e1",
													2,
												)}

												{/* Actual Layer */}
												{payload.actual &&
													renderRect(
														payload.actual.low,
														payload.actual.high,
														12,
														isSelected ? "#000" : "#18181b",
														1,
													)}

												{/* Forecast Layers */}
												{payload.forecast && (
													<>
														{renderRect(
															payload.forecast.low.low,
															payload.forecast.low.high,
															12,
															isSelected ? "#000" : "#18181b",
															1,
														)}
														{renderRect(
															payload.forecast.high.low,
															payload.forecast.high.high,
															12,
															isSelected ? "#000" : "#18181b",
															1,
														)}
														{renderRect(
															payload.forecast.low.high,
															payload.forecast.high.low,
															15,
															isSelected ? "#000" : "#18181b",
															0,
														)}
													</>
												)}
											</g>
										);
									}}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Detail Card */}
			<AnimatePresence mode="wait">
				<motion.div
					key={selectedId}
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -20, opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="px-6 py-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-[2rem]"
				>
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
								<Calendar className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
							</div>
							<div>
								<span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
									Day {selectedId + 1}
								</span>
								<h2 className="text-xl font-bold">
									{dayNames[selectedId]}, {dates[selectedId]}
								</h2>
							</div>
						</div>
						<div className="text-right">
							<span className="text-3xl font-black">
								{selectedData.actual
									? selectedData.actual.high
									: selectedData.forecast?.high.high}
								°
							</span>
							<p className="text-[10px] text-zinc-400 uppercase font-bold">
								Current Max
							</p>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
							<p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
								Record
							</p>
							<div className="flex flex-col">
								<span className="text-lg font-bold text-zinc-300 dark:text-zinc-600">
									{selectedData.record.high}°
								</span>
								<span className="text-lg font-bold text-zinc-300 dark:text-zinc-600">
									{selectedData.record.low}°
								</span>
							</div>
						</div>
						<div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
							<p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">
								Normal
							</p>
							<div className="flex flex-col">
								<span className="text-lg font-bold text-zinc-500">
									{selectedData.normal.high}°
								</span>
								<span className="text-lg font-bold text-zinc-500">
									{selectedData.normal.low}°
								</span>
							</div>
						</div>
						<div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-900 dark:border-zinc-100 ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-zinc-900">
							<p className="text-[10px] text-black dark:text-white uppercase font-bold mb-1">
								{selectedData.actual ? "Actual" : "Forecast"}
							</p>
							<div className="flex flex-col">
								<span className="text-lg font-bold">
									{selectedData.actual
										? selectedData.actual.high
										: selectedData.forecast?.high.high}
									°
								</span>
								<span className="text-lg font-bold">
									{selectedData.actual
										? selectedData.actual.low
										: selectedData.forecast?.low.low}
									°
								</span>
							</div>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-between p-4 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl">
						<div className="flex items-center gap-2">
							<Info className="w-4 h-4 text-zinc-500" />
							<span className="text-xs text-zinc-600 dark:text-zinc-400 italic">
								{selectedData.actual
									? "Recorded values for this day."
									: "Predicted values based on current trends."}
							</span>
						</div>
					</div>
				</motion.div>
			</AnimatePresence>

			{/* Tab Bar Placeholder */}
			<div className="h-16 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-8 bg-white dark:bg-zinc-950 pb-2">
				<div className="p-2 text-black dark:text-white">
					<Sun className="w-6 h-6" />
				</div>
				<div className="p-2 text-zinc-400">
					<CloudRain className="w-6 h-6" />
				</div>
				<div className="p-2 text-zinc-400">
					<Wind className="w-6 h-6" />
				</div>
				<div className="p-2 text-zinc-400">
					<Thermometer className="w-6 h-6" />
				</div>
			</div>
		</div>
	);
}
