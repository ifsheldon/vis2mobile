"use client";

import {
	CartesianGrid,
	Cell,
	ComposedChart,
	ResponsiveContainer,
	Scatter,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const data = [
	{ justice: "Gorsuch", percentage: 82 },
	{ justice: "Kennedy", percentage: 76 },
	{ justice: "White", percentage: 68 },
	{ justice: "O'Connor", percentage: 66 },
	{ justice: "Roberts", percentage: 65 },
	{ justice: "Rehnquist", percentage: 65 },
	{ justice: "Thomas", percentage: 63 },
	{ justice: "Scalia", percentage: 62 },
	{ justice: "Alito", percentage: 61 },
	{ justice: "Blackmun", percentage: 57 },
	{ justice: "Souter", percentage: 47 },
	{ justice: "Stevens", percentage: 46 },
	{ justice: "Brennan", percentage: 46 },
	{ justice: "Kagan", percentage: 45 },
	{ justice: "Sotomayor", percentage: 44 },
	{ justice: "Breyer", percentage: 44 },
	{ justice: "Ginsburg", percentage: 42 },
	{ justice: "Marshall", percentage: 42 },
];

export function KennedyChart() {
	return (
		<div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-md mx-auto h-[600px]">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold leading-tight text-gray-900">
					In close decisions, Kennedy voted in the majority 76 percent of the
					time.
				</h2>
				<p className="text-sm text-gray-500">
					Percentage of votes in the majority, over each justice’s career
				</p>
			</div>

			<div className="flex-1 min-h-0">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						layout="vertical"
						data={data}
						margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={true}
							vertical={true}
						/>
						<XAxis
							type="number"
							dataKey="percentage"
							domain={[35, 95]}
							tickCount={6}
							tickFormatter={(value) => `${value}%`}
							tick={{ fontSize: 12, fill: "#666" }}
						/>
						<YAxis
							type="category"
							dataKey="justice"
							width={80}
							tick={{ fontSize: 13, fill: "#333" }}
							interval={0}
						/>
						<Tooltip
							cursor={{ strokeDasharray: "3 3" }}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const d = payload[0].payload;
									return (
										<div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
											<p className="font-semibold">{d.justice}</p>
											<p>{d.percentage}%</p>
										</div>
									);
								}
								return null;
							}}
						/>
						<Scatter name="Votes" dataKey="percentage" fill="#000">
							{data.map((entry) => (
								<Cell
									key={`cell-${entry.justice}`}
									fill={entry.justice === "Kennedy" ? "#ffe100" : "#000"}
									stroke={entry.justice === "Kennedy" ? "#000" : "none"} // Add border to yellow dot for visibility
									strokeWidth={1}
								/>
							))}
						</Scatter>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
