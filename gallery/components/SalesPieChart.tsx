"use client";

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

// Data extracted from Fruit Sales Pie Chart.svg
const DATA = [
	{ name: "Apples", value: 22.4, color: "#94d13d" },
	{ name: "Bananas", value: 37.4, color: "#6f58e9" },
	{ name: "Oranges", value: 16.8, color: "#2d99fe" },
	{ name: "Grapes", value: 14.0, color: "#2ddac1" },
	{ name: "Strawberries", value: 9.3, color: "#1ea9f3" },
];

interface CustomTooltipProps {
	active?: boolean;
	payload?: {
		name: string;
		value: number;
		payload: {
			color: string;
		};
	}[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0];
		return (
			<div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
				<div className="flex items-center gap-2 text-sm">
					<div
						className="w-2 h-2 rounded-full"
						style={{ backgroundColor: data.payload.color }}
					/>
					<span className="font-medium text-zinc-900 dark:text-zinc-100">
						{data.name}:
					</span>
					<span className="text-zinc-500 dark:text-zinc-400">
						{data.value}%
					</span>
				</div>
			</div>
		);
	}
	return null;
};

export default function SalesPieChart() {
	return (
		<div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
					Fruit Sales Distribution
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Percentage share by fruit type
				</p>
			</div>

			<div className="p-6 h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={DATA}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={100}
							paddingAngle={2}
							dataKey="value"
						>
							{DATA.map((entry) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={entry.color}
									strokeWidth={0}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
						<Legend
							verticalAlign="bottom"
							height={36}
							iconType="circle"
							formatter={(value) => (
								<span className="text-zinc-600 dark:text-zinc-400 ml-1">
									{value}
								</span>
							)}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
