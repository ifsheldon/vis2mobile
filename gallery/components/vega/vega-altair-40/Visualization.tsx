"use client";

import { scaleSequential } from "d3-scale";
import { interpolateYlGnBu } from "d3-scale-chromatic";
import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudRain,
	Snowflake,
	Sun,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import rawData from "@/components/vega/vega-altair-40/data.json";

const WEATHER_ICONS: Record<string, React.ReactNode> = {
	sun: <Sun className="text-yellow-500 w-8 h-8" />,
	rain: <CloudRain className="text-blue-500 w-8 h-8" />,
	snow: <Snowflake className="text-cyan-400 w-8 h-8" />,
	drizzle: <CloudDrizzle className="text-blue-400 w-8 h-8" />,
	fog: <CloudFog className="text-gray-400 w-8 h-8" />,
};

type WeatherData = {
	date: string;
	temp_max: number;
	temp_min: number;
	precipitation: number;
	wind: number;
	weather: string;
};

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const Y_LABEL_DAYS = new Set([1, 5, 10, 15, 20, 25, 30]);

export function Visualization() {
	// Build a 31-day × 12-month grid, keeping the hottest reading for any
	// duplicate (date, day) so the heatmap shows daily max temperature.
	const { grid, minTemp, maxTemp } = useMemo(() => {
		const g: (WeatherData | null)[][] = Array.from({ length: 31 }, () =>
			Array.from({ length: 12 }, () => null),
		);
		let minT = Infinity;
		let maxT = -Infinity;

		for (const d of rawData as WeatherData[]) {
			const [, month, day] = d.date.split("T")[0].split("-");
			const monthIdx = parseInt(month, 10) - 1;
			const dayIdx = parseInt(day, 10) - 1;

			const existing = g[dayIdx][monthIdx];
			if (!existing || d.temp_max > existing.temp_max) {
				g[dayIdx][monthIdx] = d;
			}
			if (d.temp_max < minT) minT = d.temp_max;
			if (d.temp_max > maxT) maxT = d.temp_max;
		}

		return { grid: g, minTemp: minT, maxTemp: maxT };
	}, []);

	const colorScale = useMemo(
		() => scaleSequential(interpolateYlGnBu).domain([minTemp, maxTemp]),
		[minTemp, maxTemp],
	);

	// Default selection: hottest day in the dataset.
	const [selectedDay, setSelectedDay] = useState<WeatherData | null>(() => {
		let hottest: WeatherData | null = null;
		for (const row of grid) {
			for (const cell of row) {
				if (cell && (!hottest || cell.temp_max > hottest.temp_max)) {
					hottest = cell;
				}
			}
		}
		return hottest;
	});

	const gradientStops = Array.from({ length: 10 })
		.map((_, i) => {
			const val = i / 9;
			return `${interpolateYlGnBu(val)} ${val * 100}%`;
		})
		.join(", ");

	return (
		<div className="flex flex-col w-full h-full bg-slate-50 relative overflow-hidden font-sans">
			{/* Header */}
			<div className="px-4 pt-10 pb-4 bg-white shadow-sm z-10 flex flex-col gap-2 shrink-0">
				<h1 className="text-xl font-bold text-slate-800 tracking-tight">
					Seattle Daily Max Temp
				</h1>
				<div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
					<span>{Math.round(minTemp)}°C</span>
					<div
						className="flex-1 h-3 rounded-full"
						style={{
							background: `linear-gradient(to right, ${gradientStops})`,
						}}
					/>
					<span>{Math.round(maxTemp)}°C</span>
				</div>
			</div>

			{/* Scrollable Heatmap */}
			<div className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-56 custom-scrollbar">
				{/* Month header row */}
				<div className="flex items-center mb-2">
					<div className="w-7 shrink-0" />
					<div className="grid grid-cols-12 flex-1 gap-1">
						{MONTHS.map((m, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: month order is fixed
								key={`month-${i}`}
								className="text-center text-[13px] font-semibold text-slate-500"
							>
								{m}
							</div>
						))}
					</div>
				</div>

				{/* Day rows — flex-col-reverse renders day 1 at the bottom and day 31
				    at the top, matching the original reversed Y axis. */}
				<div className="flex flex-col-reverse gap-1">
					{grid.map((row, dayIdx) => {
						const day = dayIdx + 1;
						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: day order is fixed
								key={`day-${dayIdx}`}
								className="flex items-center"
							>
								<div className="w-7 shrink-0 pr-2 text-right text-[13px] font-medium text-slate-500">
									{Y_LABEL_DAYS.has(day) ? day : ""}
								</div>
								<div className="grid grid-cols-12 flex-1 gap-1">
									{row.map((cell, monthIdx) => {
										if (!cell) {
											return (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: positions are fixed
													key={`empty-${dayIdx}-${monthIdx}`}
													className="aspect-square"
												/>
											);
										}
										const isSelected =
											selectedDay !== null && selectedDay.date === cell.date;
										return (
											<button
												type="button"
												// biome-ignore lint/suspicious/noArrayIndexKey: positions are fixed
												key={`cell-${dayIdx}-${monthIdx}`}
												onClick={() => setSelectedDay(cell)}
												aria-label={`${cell.date.split("T")[0]}: ${cell.temp_max}°C`}
												className={`aspect-square rounded transition-transform active:scale-95 ${
													isSelected
														? "ring-2 ring-slate-800 ring-offset-1 ring-offset-slate-50 z-10"
														: ""
												}`}
												style={{
													backgroundColor: colorScale(cell.temp_max),
												}}
											/>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Floating Detail Card */}
			{selectedDay && (
				<div className="absolute bottom-6 left-4 right-4 bg-white/85 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-5 flex flex-col gap-4 z-20 transition-all">
					<div className="flex justify-between items-start">
						<div>
							<p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
								{new Date(selectedDay.date).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</p>
							<div className="flex items-baseline gap-1">
								<span className="text-4xl font-extrabold text-slate-800 tracking-tighter">
									{selectedDay.temp_max}°
								</span>
								<span className="text-lg font-medium text-slate-500">Max</span>
							</div>
						</div>
						<div className="bg-slate-100 p-3 rounded-2xl shadow-inner">
							{WEATHER_ICONS[selectedDay.weather] || (
								<Cloud className="text-gray-400 w-8 h-8" />
							)}
						</div>
					</div>

					<div className="grid grid-cols-3 gap-3 mt-1 pt-4 border-t border-slate-200/60">
						<div className="flex flex-col bg-slate-50 p-2 rounded-xl">
							<span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
								Min Temp
							</span>
							<span className="text-sm font-bold text-slate-700">
								{selectedDay.temp_min}°C
							</span>
						</div>
						<div className="flex flex-col bg-slate-50 p-2 rounded-xl">
							<span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
								Precip
							</span>
							<span className="text-sm font-bold text-slate-700">
								{selectedDay.precipitation} mm
							</span>
						</div>
						<div className="flex flex-col bg-slate-50 p-2 rounded-xl">
							<span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
								Wind
							</span>
							<span className="text-sm font-bold text-slate-700">
								{selectedDay.wind} m/s
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
