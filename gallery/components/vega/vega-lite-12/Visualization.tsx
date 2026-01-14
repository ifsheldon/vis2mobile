"use client";

import { Calendar, CloudRain, Thermometer } from "lucide-react";
import { useState } from "react";
import {
	Area,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	seattleWeatherData,
	type WeatherData,
} from "@/components/vega/vega-lite-12/data";

export function Visualization() {
	const [activeData, setActiveData] = useState<WeatherData | null>(null);

	const handleMouseMove = (state: {
		activePayload?: { payload: WeatherData }[];
	}) => {
		if (state?.activePayload && state.activePayload.length > 0) {
			setActiveData(state.activePayload[0].payload);
		}
	};

	const handleMouseLeave = () => {
		setActiveData(null);
	};

	// Calculate annual averages for default view
	const avgMax = (
		seattleWeatherData.reduce((sum, d) => sum + d.temp_max, 0) / 12
	).toFixed(1);
	const avgMin = (
		seattleWeatherData.reduce((sum, d) => sum + d.temp_min, 0) / 12
	).toFixed(1);
	const totalPrecip = seattleWeatherData
		.reduce((sum, d) => sum + d.precipitation, 0)
		.toFixed(1);

	return (
		<div className="flex flex-col w-full h-full bg-white font-sans">
			{/* Header / HUD */}
			<div className="p-5 pb-2">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
							Seattle Weather
						</h1>
						<p className="text-sm text-zinc-500 font-medium">
							Monthly Averages
						</p>
					</div>
					<div className="bg-zinc-50 p-2 rounded-xl border border-zinc-100">
						<Calendar className="w-5 h-5 text-zinc-400" />
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 mb-2">
					{/* Temperature HUD */}
					<div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 transition-all duration-200">
						<div className="flex items-center gap-2 mb-1">
							<Thermometer className="w-4 h-4 text-emerald-600" />
							<span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
								Temperature
							</span>
						</div>
						<div className="flex items-baseline gap-1">
							<span className="text-xl font-bold text-emerald-900">
								{activeData ? activeData.temp_min : avgMin}°
							</span>
							<span className="text-sm text-emerald-600/70">to</span>
							<span className="text-xl font-bold text-emerald-900">
								{activeData ? activeData.temp_max : avgMax}°C
							</span>
						</div>
					</div>

					{/* Precipitation HUD */}
					<div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 transition-all duration-200">
						<div className="flex items-center gap-2 mb-1">
							<CloudRain className="w-4 h-4 text-blue-600" />
							<span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
								Rainfall
							</span>
						</div>
						<div className="flex items-baseline gap-1">
							<span className="text-xl font-bold text-blue-900">
								{activeData
									? activeData.precipitation
									: (Number(totalPrecip) / 12).toFixed(1)}
							</span>
							<span className="text-sm text-blue-600/70 font-medium">in</span>
						</div>
					</div>
				</div>

				<div className="h-6 flex items-center">
					{activeData ? (
						<span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
							{activeData.month}
						</span>
					) : (
						<span className="text-sm text-zinc-400">
							Scrub chart to see monthly details
						</span>
					)}
				</div>
			</div>

			{/* Chart Section */}
			<div className="flex-1 w-full min-h-[250px] pr-2">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						data={seattleWeatherData}
						margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						onTouchMove={handleMouseMove}
						onTouchEnd={handleMouseLeave}
					>
						<defs>
							<linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#85C5A6" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#85C5A6" stopOpacity={0.05} />
							</linearGradient>
						</defs>

						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#A1A1AA", fontSize: 12, fontWeight: 500 }}
							dy={10}
						/>

						{/* Hidden Y Axes for scaling */}
						<YAxis yAxisId="temp" hide domain={[0, 30]} />
						<YAxis yAxisId="precip" hide domain={[0, 6]} />

						<Tooltip
							content={() => null}
							cursor={{
								stroke: "#E4E4E7",
								strokeWidth: 2,
								strokeDasharray: "4 4",
							}}
						/>

						{/* Temperature Range Area */}
						<Area
							yAxisId="temp"
							type="monotone"
							dataKey={(d) => [d.temp_min, d.temp_max]}
							stroke="#85C5A6"
							strokeWidth={2}
							fill="url(#tempGradient)"
							animationDuration={1000}
						/>

						{/* Precipitation Line */}
						<Line
							yAxisId="precip"
							type="monotone"
							dataKey="precipitation"
							stroke="#85A9C5"
							strokeWidth={4}
							dot={{ r: 0 }}
							activeDot={{
								r: 6,
								fill: "#85A9C5",
								stroke: "white",
								strokeWidth: 2,
							}}
							animationDuration={1000}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>

			{/* Legend */}
			<div className="px-5 py-4 flex items-center justify-center gap-6 border-t border-zinc-50">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#85C5A6] opacity-60" />
					<span className="text-xs font-medium text-zinc-500">Temp Range</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-6 h-1 rounded-full bg-[#85A9C5]" />
					<span className="text-xs font-medium text-zinc-500">Rainfall</span>
				</div>
			</div>
		</div>
	);
}
