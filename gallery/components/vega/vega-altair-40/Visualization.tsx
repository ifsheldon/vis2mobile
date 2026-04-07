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
import {
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts";
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
	monthIndex: number;
	dayOfMonth: number;
	temp_max: number;
	temp_min: number;
	precipitation: number;
	wind: number;
	weather: string;
};

export function Visualization() {
	const data: WeatherData[] = useMemo(() => {
		const grouped = new Map<string, WeatherData>();
		for (const d of rawData as Record<string, unknown>[]) {
			const dateStr = String(d.date).split("T")[0];
			const [_year, month, day] = dateStr.split("-");
			const monthIndex = parseInt(month, 10) - 1;
			const dayOfMonth = parseInt(day, 10);
			const key = `${monthIndex}-${dayOfMonth}`;

			const mapped = {
				...(d as unknown as WeatherData),
				monthIndex,
				dayOfMonth,
			};

			if (
				!grouped.has(key) ||
				mapped.temp_max > (grouped.get(key)?.temp_max ?? -Infinity)
			) {
				grouped.set(key, mapped);
			}
		}
		return Array.from(grouped.values());
	}, []);

	const tempMaxArray = data.map((d) => d.temp_max);
	const minTemp = Math.min(...tempMaxArray);
	const maxTemp = Math.max(...tempMaxArray);

	const colorScale = scaleSequential(interpolateYlGnBu).domain([
		minTemp,
		maxTemp,
	]);

	const [selectedDay, setSelectedDay] = useState<WeatherData | null>(
		data.find((d) => d.temp_max === maxTemp) || data[0],
	);

	const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
	const yTicks = [1, 5, 10, 15, 20, 25, 30];

	const gradientStops = Array.from({ length: 10 })
		.map((_, i) => {
			const val = i / 9;
			return `${interpolateYlGnBu(val)} ${val * 100}%`;
		})
		.join(", ");

	const CustomShape = (props: Record<string, unknown>) => {
		const { cx, cy, payload } = props as {
			cx?: number;
			cy?: number;
			payload?: WeatherData;
		};
		if (cx == null || cy == null || !payload) return null;

		// Visible cell is 24x24, but the actual pitch between data points is
		// larger, so we add an invisible larger hit rect to cover the gap and
		// catch clicks that fall between the visible cells.
		const cellWidth = 24;
		const cellHeight = 24;
		const hitWidth = 36;
		const hitHeight = 32;

		const isSelected = selectedDay && selectedDay.date === payload.date;

		return (
			// biome-ignore lint/a11y/useSemanticElements: SVG <g> cannot be a <button>
			<g
				onClick={() => setSelectedDay(payload)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setSelectedDay(payload);
					}
				}}
				role="button"
				tabIndex={0}
				className="cursor-pointer transition-transform active:scale-95"
			>
				<rect
					x={cx - hitWidth / 2}
					y={cy - hitHeight / 2}
					width={hitWidth}
					height={hitHeight}
					fill="transparent"
				/>
				<rect
					x={cx - cellWidth / 2}
					y={cy - cellHeight / 2}
					width={cellWidth}
					height={cellHeight}
					fill={colorScale(payload.temp_max)}
					stroke={isSelected ? "#1e293b" : "none"}
					strokeWidth={isSelected ? 2 : 0}
					rx={4}
					ry={4}
					pointerEvents="none"
				/>
			</g>
		);
	};

	return (
		<div className="flex flex-col w-full h-full bg-slate-50 relative overflow-hidden font-sans">
			{/* Header */}
			<div className="px-4 pt-10 pb-4 bg-white shadow-sm z-10 flex flex-col gap-2 shrink-0">
				<h1 className="text-xl font-bold text-slate-800 tracking-tight">
					Seattle Daily Max Temp
				</h1>

				{/* Legend */}
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

			{/* Scrollable Chart Area */}
			<div className="flex-1 overflow-y-auto w-full relative pb-48 custom-scrollbar">
				<div className="w-full h-[900px]">
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart margin={{ top: 30, right: 24, bottom: 20, left: 10 }}>
							<XAxis
								type="number"
								dataKey="monthIndex"
								domain={[0, 11]}
								tickFormatter={(val) => months[val]}
								tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }}
								axisLine={false}
								tickLine={false}
								interval={0}
								orientation="top"
								tickMargin={10}
							/>
							<YAxis
								type="number"
								dataKey="dayOfMonth"
								domain={[31, 1]}
								ticks={yTicks}
								tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }}
								axisLine={false}
								tickLine={false}
								width={36}
								tickMargin={8}
							/>
							<Scatter
								data={data}
								shape={<CustomShape />}
								isAnimationActive={false}
							/>
						</ScatterChart>
					</ResponsiveContainer>
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
