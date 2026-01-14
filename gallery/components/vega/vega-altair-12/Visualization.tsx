"use client";

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { data } from "@/components/vega/vega-altair-12/data";

export function Visualization() {
	return (
		<div className="flex flex-col h-full w-full bg-slate-950 text-white p-6 rounded-[2rem] shadow-2xl overflow-hidden relative font-sans">
			{/* Background gradients for aesthetics */}
			<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black z-0 pointer-events-none" />
			<div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />
			<div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] z-0 pointer-events-none" />

			{/* Content */}
			<div className="relative z-10 flex flex-col h-full">
				<header className="mb-8 mt-2">
					<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-200">
						Top Rated Movies
					</h1>
					<p className="text-sm text-slate-400 mt-1 font-medium">
						Based on IMDB Ratings
					</p>
				</header>

				<div className="flex-1 w-full min-h-0">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data}
							layout="vertical"
							margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
						>
							<XAxis type="number" domain={[0, 10]} hide />
							<YAxis
								type="category"
								dataKey="title"
								width={130}
								tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
								axisLine={false}
								tickLine={false}
								interval={0}
							/>
							<Tooltip
								cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
								contentStyle={{
									backgroundColor: "#0f172a",
									borderColor: "#334155",
									color: "#f8fafc",
									borderRadius: "12px",
									fontSize: "12px",
									padding: "8px 12px",
									boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
								}}
								itemStyle={{ color: "#fbbf24" }}
								formatter={(value) => [
									typeof value === "number"
										? value.toString()
										: `${value ?? ""}`,
									"Rating",
								]}
							/>
							<Bar
								dataKey="rating"
								fill="#f59e0b"
								radius={[0, 6, 6, 0]}
								barSize={32}
								isAnimationActive={false}
								activeBar={{ fill: "#fbbf24" }}
								label={{
									position: "right",
									fill: "#f8fafc",
									fontSize: 12,
									fontWeight: "bold",
									formatter: (val) =>
										typeof val === "number" ? val.toFixed(1) : (val ?? ""),
								}}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-600 text-center uppercase tracking-wider font-semibold">
					Source: Vega Datasets
				</div>
			</div>
		</div>
	);
}
