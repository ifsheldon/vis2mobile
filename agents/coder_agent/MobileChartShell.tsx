"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ComposedChart,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// [AGENT_ACTION]: INSERT DATA HERE
// Expected format: array of objects
const DATA = [
	{ name: "A", value: 400 },
	{ name: "B", value: 300 },
	{ name: "C", value: 300 },
	{ name: "D", value: 200 },
];

// [AGENT_ACTION]: CONFIGURE HEIGHT LOGIC
// If the chart needs to scroll (e.g., many bars), set a threshold and calculate height.
// Otherwise, use a fixed height (e.g., 300 or 400).
const ROW_HEIGHT = 50;
const SCROLL_THRESHOLD = 10;
const isScrollable = DATA.length > SCROLL_THRESHOLD;
const CHART_HEIGHT = isScrollable ? DATA.length * ROW_HEIGHT : 400;

// [AGENT_ACTION]: DEFINE CUSTOM TOOLTIP IF NEEDED
// interface CustomTooltipProps { ... }
// const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => { ... }

export default function MobileChartShell() {
	return (
		// [AGENT_ACTION]: PRESERVE UI SHELL STYLING
		<div className="w-full bg-white dark:bg-black rounded-3xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
			{/* Header Section */}
			<div className="p-6 sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
				{/* [AGENT_ACTION]: INSERT TITLE */}
				<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
					Chart Title
				</h2>
				{/* [AGENT_ACTION]: INSERT DESCRIPTION */}
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
					Chart description goes here. Explain what the user is seeing.
				</p>
			</div>

			{/* Chart Container */}
			{/* [AGENT_ACTION]: CONFIGURE CHART LAYOUT */}
			<div className="relative w-full" style={{ height: CHART_HEIGHT }}>
				<ResponsiveContainer width="100%" height="100%">
					{/* [AGENT_ACTION]: REPLACE WITH SPECIFIC CHART TYPE (BarChart, LineChart, PieChart, etc.) */}
					<BarChart
						data={DATA}
						layout={isScrollable ? "vertical" : "horizontal"}
						margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#e4e4e7"
							opacity={0.3}
							// [AGENT_ACTION]: ADJUST GRID ORIENTATION BASED ON LAYOUT
							horizontal={!isScrollable}
							vertical={isScrollable}
						/>
						
						{/* [AGENT_ACTION]: CONFIGURE AXES */}
						<XAxis
							type={isScrollable ? "number" : "category"}
							dataKey={isScrollable ? undefined : "name"}
							hide={false}
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12, fill: "#71717a" }}
						/>
						<YAxis
							type={isScrollable ? "category" : "number"}
							dataKey={isScrollable ? "name" : undefined}
							axisLine={false}
							tickLine={false}
							width={50}
							tick={{ fontSize: 13, fontWeight: 500, fill: "#3f3f46" }}
						/>

						<Tooltip
							cursor={{ fill: "rgba(0,0,0,0.03)" }}
							wrapperStyle={{ outline: "none" }}
							// content={<CustomTooltip />}
						/>

						{/* [AGENT_ACTION]: INSERT CHART ELEMENTS (Bar, Line, Pie, etc.) */}
						<Bar
							dataKey="value"
							fill="#18181b" // zinc-900
							radius={[0, 4, 4, 0]}
							animationDuration={1000}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Footer / Legend / Scroll Hint */}
			<div className="p-4 text-center border-t border-zinc-100 dark:border-zinc-800">
				{/* [AGENT_ACTION]: INSERT LEGEND OR SCROLL HINT */}
				{isScrollable ? (
					<span className="text-xs text-zinc-400">Scroll for more data</span>
				) : (
					<span className="text-xs text-zinc-400">Data source: Source Name</span>
				)}
			</div>
		</div>
	);
}
