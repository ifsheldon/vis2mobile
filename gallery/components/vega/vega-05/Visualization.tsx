"use client";

import { type ClassValue, clsx } from "clsx";
import { useMemo, useState } from "react";
import {
	CartesianGrid,
	ComposedChart,
	ErrorBar,
	ResponsiveContainer,
	Scatter,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const DATA = [
	{
		variety: "Trebi",
		mean: 39.4,
		stdev: { min: 27.74, max: 51.06 },
		stderr: { min: 36.03, max: 42.77 },
		ci: { min: 31.99, max: 46.81 },
		iqr: { min: 30.39, max: 46.71 },
	},
	{
		variety: "Wisconsin No. 38",
		mean: 39.39,
		stdev: { min: 27.53, max: 51.26 },
		stderr: { min: 35.97, max: 42.82 },
		ci: { min: 31.86, max: 46.93 },
		iqr: { min: 31.07, max: 47.84 },
	},
	{
		variety: "No. 457",
		mean: 35.85,
		stdev: { min: 24.78, max: 46.92 },
		stderr: { min: 32.65, max: 39.04 },
		ci: { min: 28.81, max: 42.88 },
		iqr: { min: 28.13, max: 43.33 },
	},
	{
		variety: "No. 462",
		mean: 35.38,
		stdev: { min: 21.78, max: 48.97 },
		stderr: { min: 31.45, max: 39.3 },
		ci: { min: 26.74, max: 44.02 },
		iqr: { min: 25.41, max: 45.28 },
	},
	{
		variety: "Peatland",
		mean: 34.18,
		stdev: { min: 27.09, max: 41.27 },
		stderr: { min: 32.13, max: 36.23 },
		ci: { min: 29.68, max: 38.68 },
		iqr: { min: 29.42, max: 37.42 },
	},
	{
		variety: "Glabron",
		mean: 33.34,
		stdev: { min: 23.13, max: 43.55 },
		stderr: { min: 30.39, max: 36.29 },
		ci: { min: 26.85, max: 39.83 },
		iqr: { min: 28.12, max: 37.83 },
	},
	{
		variety: "Velvet",
		mean: 33.06,
		stdev: { min: 24.48, max: 41.64 },
		stderr: { min: 30.58, max: 35.54 },
		ci: { min: 27.61, max: 38.51 },
		iqr: { min: 26.26, max: 39.1 },
	},
	{
		variety: "No. 475",
		mean: 31.76,
		stdev: { min: 21.31, max: 42.21 },
		stderr: { min: 28.75, max: 34.78 },
		ci: { min: 25.12, max: 38.4 },
		iqr: { min: 24.15, max: 41.98 },
	},
	{
		variety: "Manchuria",
		mean: 31.46,
		stdev: { min: 23.95, max: 38.98 },
		stderr: { min: 29.29, max: 33.63 },
		ci: { min: 26.69, max: 36.24 },
		iqr: { min: 26.98, max: 33.69 },
	},
	{
		variety: "Svansota",
		mean: 30.38,
		stdev: { min: 21.32, max: 39.43 },
		stderr: { min: 27.76, max: 32.99 },
		ci: { min: 24.62, max: 36.13 },
		iqr: { min: 24.83, max: 35.97 },
	},
];

type Metric = "stdev" | "stderr" | "ci" | "iqr";

const METRICS: { id: Metric; label: string }[] = [
	{ id: "ci", label: "95% CI" },
	{ id: "stderr", label: "SE" },
	{ id: "stdev", label: "SD" },
	{ id: "iqr", label: "IQR" },
];

export function Visualization() {
	const [metric, setMetric] = useState<Metric>("ci");

	const chartData = useMemo(() => {
		return DATA.map((item) => {
			const m = item[metric];
			return {
				...item,
				error: [item.mean - m.min, m.max - item.mean],
				currentMetric: m,
			};
		});
	}, [metric]);

	return (
		<div className="w-full min-h-screen bg-zinc-50 flex flex-col p-4 font-sans max-w-md mx-auto">
			<div className="mb-6 space-y-4">
				<h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
					Barley Yield
				</h1>

				<div className="flex p-1 bg-zinc-200/80 rounded-xl backdrop-blur-sm">
					{METRICS.map((m) => (
						<button
							type="button"
							key={m.id}
							onClick={() => setMetric(m.id)}
							className={cn(
								"flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
								metric === m.id
									? "bg-white text-zinc-900 shadow-sm"
									: "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50",
							)}
						>
							{m.label}
						</button>
					))}
				</div>
				<div className="text-xs text-zinc-500 text-center px-2">
					Comparing yield distribution across varieties
				</div>
			</div>

			<div className="flex-1 w-full bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
				<ResponsiveContainer width="100%" height={600}>
					<ComposedChart
						layout="vertical"
						data={chartData}
						margin={{ top: 10, right: 20, bottom: 40, left: 10 }}
					>
						<CartesianGrid horizontal={false} stroke="#f4f4f5" />
						<XAxis
							type="number"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
							domain={["auto", "auto"]}
							tickCount={4}
							label={{
								value: "Barley Yield (bushels/acre)",
								position: "insideBottom",
								offset: -20,
								fill: "#71717a",
								fontSize: 12,
								fontWeight: 600,
							}}
						/>
						<YAxis
							type="category"
							dataKey="variety"
							width={0}
							tick={({ y, payload }) => (
								<text
									x={0}
									y={y - 18}
									fill="#18181b"
									fontSize={13}
									fontWeight={700}
									textAnchor="start"
								>
									{payload.value}
								</text>
							)}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							cursor={{ fill: "#f4f4f5", opacity: 0.5, radius: 8 }}
							content={({ active, payload }) => {
								if (!active || !payload || !payload.length) return null;
								const data = payload[0].payload;
								return (
									<div className="bg-white/90 backdrop-blur p-3 border border-zinc-200 shadow-xl rounded-xl text-sm z-50">
										<div className="font-bold text-zinc-900 mb-1">
											{data.variety}
										</div>
										<div className="text-zinc-600 flex justify-between gap-4">
											<span>Mean Yield:</span>
											<span className="font-mono font-bold text-indigo-600">
												{data.mean}
											</span>
										</div>
										<div className="text-zinc-500 text-xs mt-1 border-t border-zinc-100 pt-1 flex justify-between gap-4">
											<span>
												{METRICS.find((m) => m.id === metric)?.label} Range:
											</span>
											<span className="font-mono">
												{data.currentMetric.min} - {data.currentMetric.max}
											</span>
										</div>
									</div>
								);
							}}
						/>

						<Scatter
							name="Yield"
							dataKey="mean"
							fill="#4f46e5"
							line={false}
							shape={(props: unknown) => {
								const { cx, cy } = props as { cx: number; cy: number };
								return (
									<circle
										cx={cx}
										cy={cy}
										r={5}
										fill="#4f46e5"
										stroke="white"
										strokeWidth={2}
									/>
								);
							}}
						>
							<ErrorBar
								dataKey="error"
								width={0}
								strokeWidth={2.5}
								stroke="#94a3b8"
								direction="x"
							/>
						</Scatter>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
