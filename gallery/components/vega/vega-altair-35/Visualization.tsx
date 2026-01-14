"use client";

import { useState } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

interface ObservationData {
	hour: number;
	observations: number;
	label: string;
}

const observationsData: ObservationData[] = [
	{ hour: 0, observations: 2, label: "00:00" },
	{ hour: 1, observations: 2, label: "01:00" },
	{ hour: 2, observations: 2, label: "02:00" },
	{ hour: 3, observations: 2, label: "03:00" },
	{ hour: 4, observations: 2, label: "04:00" },
	{ hour: 5, observations: 3, label: "05:00" },
	{ hour: 6, observations: 4, label: "06:00" },
	{ hour: 7, observations: 4, label: "07:00" },
	{ hour: 8, observations: 8, label: "08:00" },
	{ hour: 9, observations: 8, label: "09:00" },
	{ hour: 10, observations: 9, label: "10:00" },
	{ hour: 11, observations: 7, label: "11:00" },
	{ hour: 12, observations: 5, label: "12:00" },
	{ hour: 13, observations: 6, label: "13:00" },
	{ hour: 14, observations: 8, label: "14:00" },
	{ hour: 15, observations: 8, label: "15:00" },
	{ hour: 16, observations: 7, label: "16:00" },
	{ hour: 17, observations: 7, label: "17:00" },
	{ hour: 18, observations: 4, label: "18:00" },
	{ hour: 19, observations: 3, label: "19:00" },
	{ hour: 20, observations: 3, label: "20:00" },
	{ hour: 21, observations: 2, label: "21:00" },
	{ hour: 22, observations: 2, label: "22:00" },
	{ hour: 23, observations: 2, label: "23:00" },
];

export function Visualization() {
	const [activeData, setActiveData] = useState<ObservationData | null>(null);

	const peakHour = [...observationsData].sort(
		(a, b) => b.observations - a.observations,
	)[0];

	const displayData = activeData || peakHour;

	const formatHour = (hour: number) => {
		if (hour === 0) return "12am";
		if (hour === 12) return "12pm";
		if (hour < 12) return `${hour}am`;
		return `${hour - 12}pm`;
	};

	return (
		<div className="w-full h-full bg-slate-950 p-4 flex flex-col items-center justify-between text-slate-200">
			<div className="w-full text-center space-y-2 mb-4">
				<h1 className="text-2xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
					Daily Cycle
				</h1>
				<p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
					Observation Frequency Analysis
				</p>
			</div>

			<div className="relative w-full aspect-square max-w-[320px]">
				{/* Center Display Overlay */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center z-10 bg-slate-900/40 backdrop-blur-xl rounded-full w-28 h-28 flex flex-col items-center justify-center border border-slate-700/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
							{formatHour(displayData.hour)}
						</span>
						<span className="text-3xl font-black text-white leading-none tracking-tighter">
							{displayData.observations}
						</span>
						<span className="text-[9px] text-blue-400/80 font-bold uppercase tracking-widest mt-1">
							Observations
						</span>
					</div>
				</div>

				<ResponsiveContainer width="100%" height="100%">
					<RadarChart
						cx="50%"
						cy="50%"
						outerRadius="80%"
						data={observationsData}
						onMouseMove={(
							data: { activePayload?: { payload: ObservationData }[] } | null,
						) => {
							if (data?.activePayload && data.activePayload.length > 0) {
								setActiveData(data.activePayload[0].payload);
							}
						}}
						onMouseLeave={() => setActiveData(null)}
					>
						<defs>
							<linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#60a5fa" stopOpacity={0.2} />
							</linearGradient>
						</defs>
						<PolarGrid stroke="#334155" strokeDasharray="3 3" />
						<PolarAngleAxis
							dataKey="hour"
							tick={({ payload, x, y, textAnchor }) => {
								// Only show 0, 6, 12, 18
								if ([0, 6, 12, 18].includes(payload.value)) {
									return (
										<text
											x={x}
											y={y}
											textAnchor={textAnchor}
											fill="#94a3b8"
											fontSize={13}
											fontWeight="700"
										>
											{formatHour(payload.value)}
										</text>
									);
								}
								return <g />;
							}}
						/>
						<PolarRadiusAxis
							angle={90}
							domain={[0, 10]}
							tick={false}
							axisLine={false}
						/>
						<Radar
							name="Observations"
							dataKey="observations"
							stroke="#60a5fa"
							strokeWidth={3}
							fill="url(#radarGradient)"
							fillOpacity={0.6}
							animationDuration={500}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>

			<div className="w-full grid grid-cols-2 gap-4 mt-6">
				<div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 rounded-3xl transition-all hover:border-blue-500/30">
					<p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
						Peak Activity
					</p>
					<p className="text-xl font-bold text-white">
						{formatHour(peakHour.hour)}
					</p>
				</div>
				<div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 rounded-3xl transition-all hover:border-blue-500/30">
					<p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
						Max Volume
					</p>
					<p className="text-xl font-bold text-blue-400">
						{peakHour.observations}
					</p>
				</div>
			</div>

			<div className="mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center">
				Interactive Temporal Mapping
			</div>
		</div>
	);
}
