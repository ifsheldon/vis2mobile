"use client";

import { clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { Activity, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import rawData from "@/components/vega/vega-altair-07/extracted_data.json";

// Type definition for the data
type DataPoint = {
	month: string;
	nonfarm_change: number;
	private: number;
	government: number;
	[key: string]: string | number;
};

const data = rawData as DataPoint[];

export function Visualization() {
	// State for the selected data point. Default to the last one or a significant one.
	// The plan suggested late 2008, let's try to find the minimum value (deepest crash) as initial default or just the last one.
	// Finding the minimum value index for initial state might be interesting.
	const minIndex = useMemo(() => {
		let minVal = Infinity;
		let idx = 0;
		data.forEach((d, i) => {
			if (d.nonfarm_change < minVal) {
				minVal = d.nonfarm_change;
				idx = i;
			}
		});
		return idx;
	}, []);

	const [activeIndex, setActiveIndex] = useState<number>(minIndex);
	const selectedData = data[activeIndex];

	// Calculate chart width based on number of data points to ensure scrollability
	const BAR_WIDTH = 16; // px
	const chartWidth = Math.max(data.length * BAR_WIDTH, 300); // Ensure at least container width

	return (
		<div className="flex flex-col h-full bg-zinc-50 font-sans text-zinc-900 relative overflow-hidden">
			{/* Fixed Detail Card (Header) */}
			<header className="flex-none pt-12 px-4 pb-2 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-10 shadow-sm">
				<div className="flex justify-between items-start mb-2">
					<div>
						<h1 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
							<Activity size={12} />
							Employment Change
						</h1>
						<div className="flex items-baseline gap-2 mt-1">
							<span
								className={clsx(
									"text-3xl font-bold tabular-nums tracking-tight",
									selectedData.nonfarm_change > 0
										? "text-blue-600"
										: "text-orange-600",
								)}
							>
								{selectedData.nonfarm_change > 0 ? "+" : ""}
								{new Intl.NumberFormat("en-US").format(
									selectedData.nonfarm_change,
								)}
								k
							</span>
							<span className="text-sm font-medium text-zinc-400">jobs</span>
						</div>
					</div>
					<div className="text-right">
						<div className="flex items-center justify-end gap-1 text-zinc-500 text-sm font-medium">
							<Calendar size={14} />
							{format(parseISO(selectedData.month), "MMM yyyy")}
						</div>
						<div
							className={clsx(
								"flex items-center justify-end gap-1 text-xs font-medium mt-1",
								selectedData.nonfarm_change > 0
									? "text-blue-600"
									: "text-orange-600",
							)}
						>
							{selectedData.nonfarm_change > 0 ? (
								<TrendingUp size={12} />
							) : (
								<TrendingDown size={12} />
							)}
							{selectedData.nonfarm_change > 0 ? "Growth" : "Decline"}
						</div>
					</div>
				</div>

				{/* Breakdown / Secondary Info */}
				<div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100">
					<div className="flex flex-col">
						<span className="text-[10px] text-zinc-400 uppercase font-semibold">
							Private
						</span>
						<span className="text-sm font-medium text-zinc-700 tabular-nums">
							{new Intl.NumberFormat("en-US").format(selectedData.private)}
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-[10px] text-zinc-400 uppercase font-semibold">
							Government
						</span>
						<span className="text-sm font-medium text-zinc-700 tabular-nums">
							{new Intl.NumberFormat("en-US").format(selectedData.government)}
						</span>
					</div>
				</div>
			</header>

			{/* Scrollable Chart Area */}
			<div className="flex-1 overflow-x-auto overflow-y-hidden relative scrollbar-hide">
				<div style={{ width: chartWidth, height: "100%" }} className="relative">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data}
							margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
							barCategoryGap={2}
							onClick={(state) => {
								if (state && typeof state.activeTooltipIndex === "number") {
									setActiveIndex(state.activeTooltipIndex);
								}
							}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e4e4e7"
							/>
							<XAxis
								dataKey="month"
								tickFormatter={(value) => format(parseISO(value), "yyyy")}
								interval={11} // Show roughly one tick per year
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fill: "#71717a" }}
								dy={10}
							/>
							<YAxis
								width={40}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fill: "#71717a" }}
								tickFormatter={(value) => `${value / 1000}k`}
							/>
							<ReferenceLine y={0} stroke="#52525b" strokeWidth={1} />
							<Tooltip
								cursor={{ fill: "rgba(0,0,0,0.05)" }}
								content={() => null}
							/>
							<Bar
								dataKey="nonfarm_change"
								radius={[2, 2, 2, 2]} // Slight rounding
								// We handle color via Cell
							>
								{data.map((entry, index) => (
									<Cell
										key={entry.month}
										fill={entry.nonfarm_change > 0 ? "#3b82f6" : "#f97316"}
										stroke={index === activeIndex ? "#18181b" : "none"}
										strokeWidth={index === activeIndex ? 2 : 0}
										// Make the selected bar slightly darker/opacity change if needed,
										// but stroke is good for selection indication.
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Scroll hint if needed, or user will discover natural swipe */}
			</div>

			{/* Legend / Footer */}
			<div className="flex-none p-2 bg-zinc-50 border-t border-zinc-200 text-[10px] text-zinc-400 text-center flex justify-center gap-4">
				<div className="flex items-center gap-1">
					<div className="w-2 h-2 rounded-full bg-blue-500"></div>
					<span>Positive</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-2 h-2 rounded-full bg-orange-500"></div>
					<span>Negative</span>
				</div>
			</div>
		</div>
	);
}
