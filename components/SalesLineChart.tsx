"use client";

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// SVG Coordinate System Constants for Line Chart
// Y-Axis: 100 at y=330, 225 at y=51
// Range: 225 - 100 = 125 units
// Pixels: 330 - 51 = 279 pixels
const SVG_Y_BOTTOM = 330;
const SVG_Y_TOP = 51;
const VALUE_MIN = 100;
const VALUE_MAX = 225;

// Raw Y-coordinates extracted from the SVG path 'd' attributes
// Apple (purple): M 59.6 234.36 ...
// Banana (green): M 59.6 55.8 ...
// Note: The SVG uses bezier curves, but markers are at specific points.
// I will use the marker coordinates for accuracy.
// Apple Markers:
// Mon: 238, Tue: 205, Wed: 171, Thu: 194, Fri: 149
// Banana Markers:
// Mon: 56 (center of diamond approx), Tue: 78, Wed: 33, Thu: 45, Fri: 11
// Actually, looking at the 'd' for markers:
// Apple (circle): cy values are 238, 205, 171, 194, 149
// Banana (diamond): center y seems to be:
// Mon: 52-60 -> 56
// Tue: 74-82 -> 78
// Wed: 29-37 -> 33
// Thu: 41-49 -> 45
// Fri: 7-15 -> 11

const RAW_SVG_DATA = [
	{ day: "Mon", appleY: 238, bananaY: 56 },
	{ day: "Tue", appleY: 205, bananaY: 78 },
	{ day: "Wed", appleY: 171, bananaY: 33 },
	{ day: "Thu", appleY: 194, bananaY: 45 },
	{ day: "Fri", appleY: 149, bananaY: 11 },
];

// Helper function to calculate value from SVG Y coordinate
// Formula: Value = Min + (BottomY - CurrentY) * (ValueRange / PixelRange)
const calculateValue = (y: number) => {
	const pixelRange = SVG_Y_BOTTOM - SVG_Y_TOP;
	const valueRange = VALUE_MAX - VALUE_MIN;
	const pixelHeight = SVG_Y_BOTTOM - y;
	const value = VALUE_MIN + pixelHeight * (valueRange / pixelRange);
	return Math.round(value);
};

const data = RAW_SVG_DATA.map((item) => ({
	name: item.day,
	Apple: calculateValue(item.appleY),
	Banana: calculateValue(item.bananaY),
}));

interface CustomTooltipProps {
	active?: boolean;
	payload?: {
		name: string;
		value: number;
		color: string;
	}[];
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
				<p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
					{label}
				</p>
				{payload.map((entry) => (
					<div key={entry.name} className="flex items-center gap-2 text-sm">
						<div
							className="w-2 h-2 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-zinc-500 dark:text-zinc-400">
							{entry.name}:
						</span>
						<span className="font-medium text-zinc-900 dark:text-zinc-100">
							{entry.value}
						</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

export default function SalesLineChart() {
	return (
		<div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
					Fruit Trends
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Sales trend over the week
				</p>
			</div>

			<div className="p-6 h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#e4e4e7"
							className="dark:stroke-zinc-800"
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#71717a", fontSize: 12 }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#71717a", fontSize: 12 }}
							domain={[100, 225]}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ stroke: "#e4e4e7", strokeWidth: 2 }}
						/>
						<Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />

						<Line
							type="monotone"
							dataKey="Apple"
							stroke="#8b5cf6" // Violet-500
							strokeWidth={3}
							dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
							activeDot={{ r: 6, strokeWidth: 0 }}
							animationDuration={1000}
						/>
						<Line
							type="monotone"
							dataKey="Banana"
							stroke="#84cc16" // Lime-500 (matching the green in SVG)
							strokeWidth={3}
							dot={{ r: 4, fill: "#84cc16", strokeWidth: 0 }}
							activeDot={{ r: 6, strokeWidth: 0 }}
							animationDuration={1000}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
