"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const dataset = [
	{ x: 1, y: 28 },
	{ x: 2, y: 55 },
	{ x: 3, y: 43 },
	{ x: 4, y: 91 },
	{ x: 5, y: 81 },
	{ x: 6, y: 53 },
	{ x: 7, y: 19 },
	{ x: 8, y: 87 },
	{ x: 9, y: 52 },
	{ x: 10, y: 48 },
	{ x: 11, y: 24 },
	{ x: 12, y: 49 },
	{ x: 13, y: 87 },
	{ x: 14, y: 66 },
	{ x: 15, y: 17 },
	{ x: 16, y: 27 },
	{ x: 17, y: 68 },
	{ x: 18, y: 16 },
	{ x: 19, y: 49 },
	{ x: 20, y: 15 },
];

export function Visualization() {
	const [activeData, setActiveData] = useState<{ x: number; y: number } | null>(
		null,
	);

	const off = 0.5;

	const currentY = activeData ? activeData.y : null;

	return (
		<div className="flex h-full w-full flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-6 relative overflow-hidden font-sans">
			<div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
				<div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
				<div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
			</div>

			<div className="z-10 mb-8 flex flex-col items-start justify-between">
				<div className="flex items-center gap-2 mb-1 opacity-80">
					<h2 className="text-sm font-medium tracking-wider uppercase text-slate-400">
						Data Density
					</h2>
					<Info className="w-4 h-4 text-slate-500" />
				</div>

				<div className="flex items-baseline gap-2">
					<span className="text-5xl font-bold tracking-tight text-white transition-all duration-200 tabular-nums">
						{currentY !== null ? currentY : "—"}
					</span>
					<span
						className={`text-lg font-medium transition-colors duration-200 ${
							currentY !== null
								? currentY > 50
									? "text-violet-400"
									: "text-blue-400"
								: "text-slate-400"
						}`}
					>
						{currentY !== null
							? currentY > 50
								? "High"
								: "Normal"
							: "Select point"}
					</span>
				</div>

				<div className="mt-2 text-xs text-slate-500">
					{activeData
						? `Reading at Point ${activeData.x}`
						: "Touch graph to inspect"}
				</div>
			</div>

			<div className="flex-1 w-full min-h-0 z-10">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={dataset}
						margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
						onMouseMove={(state) => {
							if (state.activePayload?.[0]) {
								setActiveData(state.activePayload[0].payload);
							}
						}}
						onMouseLeave={() => setActiveData(null)}
						onTouchMove={(state) => {
							if (state.activePayload?.[0]) {
								setActiveData(state.activePayload[0].payload);
							}
						}}
						onTouchEnd={() => setActiveData(null)}
					>
						<defs>
							<linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
								<stop offset={off} stopColor="#a78bfa" stopOpacity={1} />
								<stop offset={off} stopColor="#60a5fa" stopOpacity={1} />
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="rgba(255,255,255,0.1)"
						/>

						<XAxis
							dataKey="x"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#94a3b8", fontSize: 10 }}
							interval={3}
							dy={10}
						/>
						<YAxis hide domain={[0, 100]} />

						<Tooltip
							content={() => null}
							cursor={{ stroke: "rgba(255,255,255,0.3)", strokeWidth: 1 }}
						/>

						<ReferenceLine
							y={50}
							stroke="#ffffff"
							strokeOpacity={0.2}
							strokeDasharray="3 3"
						/>

						<Area
							type="monotone"
							dataKey="y"
							stroke="#cbd5e1"
							strokeWidth={2}
							fill="url(#splitColor)"
							animationDuration={500}
							activeDot={{ r: 6, strokeWidth: 0, fill: "#fff" }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-4 flex items-center justify-between text-xs text-slate-500 z-10">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-violet-400" />
					<span>&gt; 50 (High)</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-blue-400" />
					<span>0-50 (Normal)</span>
				</div>
			</div>
		</div>
	);
}
