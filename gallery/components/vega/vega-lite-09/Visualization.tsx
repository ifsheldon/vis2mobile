"use client";

import { Activity, AlertTriangle, Clock, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const DATA = [
	{ range: "> 120 FPS", msRange: "0 - 8.33ms", residency: 0, status: "smooth" },
	{
		range: "80 - 120 FPS",
		msRange: "8.33 - 12.5ms",
		residency: 0,
		status: "smooth",
	},
	{
		range: "60 - 80 FPS",
		msRange: "12.5 - 16.67ms",
		residency: 31.17,
		status: "smooth",
	},
	{
		range: "30 - 60 FPS",
		msRange: "16.67 - 33.33ms",
		residency: 38.96,
		status: "good",
	},
	{
		range: "20 - 30 FPS",
		msRange: "33.33 - 50.0ms",
		residency: 6.49,
		status: "warning",
	},
	{
		range: "15 - 20 FPS",
		msRange: "50.0 - 66.67ms",
		residency: 2.9,
		status: "critical",
	},
	{
		range: "12 - 15 FPS",
		msRange: "66.67 - 83.33ms",
		residency: 2.6,
		status: "critical",
	},
	{
		range: "< 12 FPS",
		msRange: "> 83.33ms",
		residency: 16.88,
		status: "critical",
	},
];

const COLORS = {
	smooth: "#10B981", // emerald-500
	good: "#3B82F6", // blue-500
	warning: "#F59E0B", // amber-500
	critical: "#EF4444", // red-500
	empty: "#F3F4F6", // gray-100
};

interface CustomTickProps {
	x: number;
	y: number;
	payload: {
		value: string;
	};
}

const CustomYAxisTick = (props: CustomTickProps) => {
	const { x, y, payload } = props;
	const item = DATA.find((d) => d.range === payload.value);
	if (!item) return null;

	return (
		<g transform={`translate(${x},${y})`}>
			<text
				x={-12}
				y={-4}
				textAnchor="end"
				fill="#18181B"
				fontSize={12}
				fontWeight={700}
			>
				{item.range}
			</text>
			<text x={-12} y={10} textAnchor="end" fill="#71717A" fontSize={10}>
				{item.msRange}
			</text>
		</g>
	);
};

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		payload: (typeof DATA)[0];
	}>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-zinc-100 text-sm">
				<p className="font-bold text-zinc-900 mb-2">{data.range}</p>
				<div className="space-y-1.5">
					<div className="flex items-center gap-2 text-zinc-600">
						<Clock size={14} className="text-zinc-400" />
						<span>{data.msRange}</span>
					</div>
					<div className="flex items-center gap-2 font-semibold text-zinc-900">
						<Activity size={14} className="text-zinc-400" />
						<span>{data.residency.toFixed(2)}% of time</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
};

export function Visualization() {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const maxResidency = useMemo(
		() => Math.max(...DATA.map((d) => d.residency)),
		[],
	);

	const mostFrequent = useMemo(() => {
		const sorted = [...DATA].sort((a, b) => b.residency - a.residency);
		return sorted[0];
	}, []);

	// Calculate summary stats
	const smoothPerf = DATA.filter((d) =>
		["smooth", "good"].includes(d.status),
	).reduce((acc, curr) => acc + curr.residency, 0);
	const criticalPerf = DATA.filter((d) =>
		["warning", "critical"].includes(d.status),
	).reduce((acc, curr) => acc + curr.residency, 0);

	return (
		<div className="h-full w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
			{/* Header */}
			<div className="p-6 pb-2 pt-14 bg-white shadow-sm">
				<h1 className="text-2xl font-black text-zinc-900 tracking-tight">
					Performance
				</h1>
				<p className="text-sm font-medium text-zinc-500 mt-0.5">
					Frame render distribution
				</p>
			</div>

			{/* Insight Banner */}
			<div className="px-6 py-4">
				<div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 flex items-start gap-3">
					<Info size={18} className="mt-0.5 shrink-0 opacity-80" />
					<div>
						<p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">
							Primary Insight
						</p>
						<p className="text-sm font-medium leading-tight">
							Most frames are rendering at{" "}
							<span className="font-bold underline decoration-2 underline-offset-2">
								{mostFrequent.range}
							</span>
							, taking up {mostFrequent.residency.toFixed(1)}% of total
							residency.
						</p>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="px-6 py-2 grid grid-cols-2 gap-4">
				<div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
					<div className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-2 relative z-10">
						Acceptable
					</div>
					<div className="flex items-baseline gap-1 relative z-10">
						<span className="text-3xl font-black text-zinc-900">
							{smoothPerf.toFixed(0)}
						</span>
						<span className="text-sm font-bold text-zinc-400">%</span>
					</div>
					<div className="text-[10px] text-zinc-500 mt-1 font-semibold relative z-10">
						&gt; 30 FPS target
					</div>
				</div>
				<div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
					<div className="flex items-center gap-1 text-red-600 text-[11px] font-bold uppercase tracking-wider mb-2 relative z-10">
						<AlertTriangle size={11} />
						Suboptimal
					</div>
					<div className="flex items-baseline gap-1 relative z-10">
						<span className="text-3xl font-black text-zinc-900">
							{criticalPerf.toFixed(0)}
						</span>
						<span className="text-sm font-bold text-zinc-400">%</span>
					</div>
					<div className="text-[10px] text-zinc-500 mt-1 font-semibold relative z-10">
						&lt; 30 FPS issues
					</div>
				</div>
			</div>

			{/* Main Chart */}
			<div className="flex-1 px-2 pt-4 pb-2 overflow-visible min-h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={DATA}
						layout="vertical"
						margin={{ top: 0, right: 55, left: 15, bottom: 0 }}
						onMouseMove={(state) => {
							if (state.activeTooltipIndex !== undefined) {
								setActiveIndex(state.activeTooltipIndex);
							}
						}}
						onMouseLeave={() => setActiveIndex(null)}
					>
						<XAxis
							type="number"
							hide
							domain={[0, Math.max(50, maxResidency)]}
						/>
						<YAxis
							dataKey="range"
							type="category"
							axisLine={false}
							tickLine={false}
							width={100}
							tick={(props) => <CustomYAxisTick {...props} />}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "transparent" }}
							trigger="click"
						/>
						<Bar
							dataKey="residency"
							radius={[0, 8, 8, 0]}
							barSize={32}
							animationDuration={1500}
							label={{
								position: "right",
								fill: "#18181B",
								fontSize: 12,
								fontWeight: 800,
								formatter: (val: number) =>
									val > 0 ? `${val.toFixed(1)}%` : "",
								offset: 10,
							}}
						>
							{DATA.map((entry, index) => (
								<Cell
									key={entry.range}
									fill={
										entry.residency === 0
											? COLORS.empty
											: COLORS[entry.status as keyof typeof COLORS]
									}
									fillOpacity={
										activeIndex === null || activeIndex === index ? 1 : 0.6
									}
									stroke={activeIndex === index ? "#18181B" : "none"}
									strokeWidth={2}
									style={{ transition: "all 0.3s ease" }}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Detail List */}
			<div className="px-6 pb-12 mt-2">
				<div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">
							Detailed Breakdown
						</h3>
					</div>
					<div className="space-y-5 overflow-y-auto max-h-[160px] pr-2 scrollbar-hide">
						{DATA.slice()
							.reverse()
							.map((item) => (
								<div
									key={item.range}
									className={`flex items-center justify-between transition-opacity ${item.residency === 0 ? "opacity-30" : "opacity-100"}`}
								>
									<div className="flex flex-col">
										<span className="text-sm font-bold text-zinc-900 leading-tight">
											{item.range}
										</span>
										<span className="text-[11px] font-medium text-zinc-500">
											{item.msRange}
										</span>
									</div>
									<div className="flex items-center gap-4">
										<span className="text-sm font-black text-zinc-900">
											{item.residency.toFixed(1)}%
										</span>
										<div
											className="w-2 h-8 rounded-full shadow-inner"
											style={{
												backgroundColor:
													item.residency === 0
														? COLORS.empty
														: COLORS[item.status as keyof typeof COLORS],
											}}
										/>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
