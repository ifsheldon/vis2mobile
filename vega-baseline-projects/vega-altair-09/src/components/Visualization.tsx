"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ErrorBar,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { processedData } from "@/lib/data";

export function Visualization() {
	return (
		<div className="w-full h-full flex flex-col p-4 bg-white dark:bg-black pt-12">
			<div className="mb-6">
				<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
					Barley Yield by Site
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Comparing mean yields between 1931 and 1932 with 95% CI.
				</p>
			</div>

			<div className="flex-1 w-full min-h-[500px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={processedData}
						layout="vertical"
						margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={true}
							vertical={false}
						/>
						<XAxis
							type="number"
							domain={[0, 70]}
							label={{
								value: "Mean Yield",
								position: "insideBottom",
								offset: -5,
							}}
						/>
						<YAxis
							dataKey="site"
							type="category"
							width={100}
							tick={{ fontSize: 12 }}
						/>
						<Tooltip
							formatter={(value: any) =>
								typeof value === "number" ? value.toFixed(2) : value
							}
							contentStyle={{
								borderRadius: "8px",
								border: "none",
								boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
							}}
						/>
						<Legend verticalAlign="top" height={36} />
						<Bar
							dataKey="mean_1931"
							name="1931"
							fill="#3b82f6"
							radius={[0, 4, 4, 0]}
						>
							<ErrorBar
								dataKey="error_1931"
								width={4}
								strokeWidth={2}
								stroke="#1d4ed8"
							/>
						</Bar>
						<Bar
							dataKey="mean_1932"
							name="1932"
							fill="#10b981"
							radius={[0, 4, 4, 0]}
						>
							<ErrorBar
								dataKey="error_1932"
								width={4}
								strokeWidth={2}
								stroke="#047857"
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
				<p className="text-xs text-zinc-500 leading-relaxed">
					Data shows the average yield of 10 barley varieties per site. Error
					bars represent the 95% confidence interval. Faceted layout from
					original desktop version has been optimized for mobile readability
					using a vertical grouped bar chart.
				</p>
			</div>
		</div>
	);
}
