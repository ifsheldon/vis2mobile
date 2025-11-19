"use client";

import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// SVG Coordinate System Constants
const SVG_Y_BOTTOM = 340; // The pixel value for y-axis 0
const SVG_Y_TOP = 40; // The pixel value for y-axis max
const VALUE_MIN = 0; // The data value at y-axis 0
const VALUE_MAX = 220; // The data value at y-axis max

// Raw Y-coordinates extracted from the SVG path 'd' attributes
// Format: { day: string, appleY: number, bananaY: number }
const RAW_SVG_DATA = [
	{ day: "Mon", appleY: 176.36, bananaY: 67.27 },
	{ day: "Tue", appleY: 155.91, bananaY: 80.91 },
	{ day: "Wed", appleY: 135.45, bananaY: 53.64 },
	{ day: "Thu", appleY: 149.09, bananaY: 60.45 },
	{ day: "Fri", appleY: 121.82, bananaY: 40.0 },
];

// Helper function to calculate value from SVG Y coordinate
// Formula: Value = (BottomY - CurrentY) * (ValueRange / PixelRange)
const calculateValue = (y: number) => {
	const pixelRange = SVG_Y_BOTTOM - SVG_Y_TOP;
	const valueRange = VALUE_MAX - VALUE_MIN;
	const pixelHeight = SVG_Y_BOTTOM - y;
	const value = pixelHeight * (valueRange / pixelRange);
	return Math.round(value); // Round to nearest integer
};

// Generate the chart data dynamically
const data = RAW_SVG_DATA.map((item) => ({
	name: item.day,
	Apple: calculateValue(item.appleY),
	Banana: calculateValue(item.bananaY),
}));

type FilterType = "all" | "Apple" | "Banana";

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

export default function SalesChart() {
	const [filter, setFilter] = useState<FilterType>("all");

	return (
		<div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
							Daily Sales
						</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Units sold per day
						</p>
					</div>

					<div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
						{(["all", "Apple", "Banana"] as const).map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => setFilter(type)}
								className={`
                  px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                  ${
										filter === type
											? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
											: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
									}
                `}
							>
								{type === "all" ? "Overview" : type}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="p-6 h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						barGap={8}
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
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "transparent" }}
						/>
						<Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />

						{(filter === "all" || filter === "Apple") && (
							<Bar
								dataKey="Apple"
								fill="#8b5cf6" // Violet-500
								radius={[6, 6, 0, 0]}
								animationDuration={1000}
								name="Apple"
							/>
						)}
						{(filter === "all" || filter === "Banana") && (
							<Bar
								dataKey="Banana"
								fill="#f59e0b" // Amber-500
								radius={[6, 6, 0, 0]}
								animationDuration={1000}
								name="Banana"
							/>
						)}
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
