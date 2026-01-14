"use client";

import { ChevronRight, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { cn } from "@/lib/utils";

interface DataItem {
	name: string;
	value: number;
	color: string;
}

// Data from original visualization: [12, 23, 47, 6, 52, 19]
// Mapping to generic groups and modern colors
const DATA: DataItem[] = [
	{ name: "Segment 1", value: 52, color: "#facc15" }, // amber-400
	{ name: "Segment 2", value: 47, color: "#10b981" }, // emerald-500
	{ name: "Segment 3", value: 23, color: "#14b8a6" }, // teal-500
	{ name: "Segment 4", value: 19, color: "#ef4444" }, // rose-500
	{ name: "Segment 5", value: 12, color: "#f97316" }, // orange-500
	{ name: "Segment 6", value: 6, color: "#3b82f6" }, // blue-500
].sort((a, b) => b.value - a.value);

const TOTAL = DATA.reduce((acc, curr) => acc + curr.value, 0);

const renderActiveShape = (props: {
	cx: number;
	cy: number;
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
	fill: string;
}) => {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
		props;

	return (
		<g>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 8}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				cornerRadius={4}
			/>
		</g>
	);
};

export function Visualization() {
	const [activeIndex, setActiveIndex] = useState(0);

	const activeData = DATA[activeIndex];
	const percentage = useMemo(
		() => ((activeData.value / TOTAL) * 100).toFixed(1),
		[activeData],
	);

	const onPieEnter = (_: unknown, index: number) => {
		setActiveIndex(index);
	};

	return (
		<div className="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
			{/* Header */}
			<div className="p-6 pb-2">
				<h1 className="text-2xl font-bold tracking-tight text-white">
					Data Distribution
				</h1>
				<p className="text-zinc-400 text-sm mt-1">
					Relative proportions of quantitative values
				</p>
			</div>

			{/* Chart Section */}
			<div className="relative flex-1 min-h-[300px] w-full flex items-center justify-center">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							activeIndex={activeIndex}
							activeShape={renderActiveShape}
							data={DATA}
							cx="50%"
							cy="50%"
							innerRadius={75}
							outerRadius={105}
							dataKey="value"
							onMouseEnter={onPieEnter}
							onClick={(_, index) => setActiveIndex(index)}
							animationBegin={0}
							animationDuration={1000}
							stroke="none"
							cornerRadius={2}
							paddingAngle={2}
						>
							{DATA.map((entry) => (
								<Cell
									key={entry.name}
									fill={entry.color}
									className="focus:outline-none"
								/>
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				{/* Center Text (Compensate Strategy) */}
				<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
					<span className="text-4xl font-extrabold text-white tabular-nums">
						{activeData.value}
					</span>
					<span className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-1">
						{percentage}%
					</span>
				</div>
			</div>

			{/* Stats List (Reposition & Serialize) */}
			<div className="px-6 pb-8 overflow-y-auto max-h-[40%]">
				<div className="space-y-2">
					{DATA.map((item, index) => (
						<button
							type="button"
							key={item.name}
							onClick={() => setActiveIndex(index)}
							className={cn(
								"w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border",
								activeIndex === index
									? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-700"
									: "bg-zinc-950 border-transparent hover:bg-zinc-900/50",
							)}
						>
							<div className="flex items-center gap-3">
								<div
									className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
									style={{ backgroundColor: item.color }}
								/>
								<span
									className={cn(
										"text-sm font-medium transition-colors",
										activeIndex === index ? "text-white" : "text-zinc-400",
									)}
								>
									{item.name}
								</span>
							</div>

							<div className="flex items-center gap-4">
								<div className="text-right">
									<div
										className={cn(
											"text-sm font-bold tabular-nums",
											activeIndex === index ? "text-white" : "text-zinc-300",
										)}
									>
										{item.value}
									</div>
									<div className="text-[10px] text-zinc-500 tabular-nums">
										{((item.value / TOTAL) * 100).toFixed(0)}%
									</div>
								</div>
								<ChevronRight
									className={cn(
										"w-4 h-4 transition-transform",
										activeIndex === index
											? "text-zinc-400 translate-x-0"
											: "text-zinc-700 -translate-x-1",
									)}
								/>
							</div>
						</button>
					))}
				</div>

				<div className="mt-6 flex items-start gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
					<Info className="w-4 h-4 text-zinc-500 mt-0.5" />
					<p className="text-[11px] text-zinc-500 leading-relaxed">
						The data represents six quantitative segments. Values are
						double-encoded in the original source as both angle and radius;
						here, they are visualized as proportional segments of a circle for
						better mobile readability.
					</p>
				</div>
			</div>
		</div>
	);
}
