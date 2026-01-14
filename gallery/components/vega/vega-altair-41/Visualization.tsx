"use client";

import { BarChart3, Car, ChevronRight, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import data from "@/components/vega/vega-altair-41/data.json";

interface DataEntry {
	origin: string;
	totalCount: number;
	cyl3: number;
	cyl4: number;
	cyl5: number;
	cyl6: number;
	cyl8: number;
	breakdown: Array<{
		cylinder: number;
		count: number;
		percentage: number;
	}>;
}

type NormalizedEntry = DataEntry &
	Record<string, number | string | DataEntry["breakdown"]>;

const CYLINDER_COLORS: { [key: string]: string } = {
	cyl3: "#94a3b8", // Slate-400
	cyl4: "#34d399", // Emerald-400
	cyl5: "#fbbf24", // Yellow-400
	cyl6: "#f97316", // Orange-500
	cyl8: "#e11d48", // Rose-600
};

const CYLINDER_LABELS: { [key: string]: string } = {
	cyl3: "3 Cylinders",
	cyl4: "4 Cylinders",
	cyl5: "5 Cylinders",
	cyl6: "6 Cylinders",
	cyl8: "8 Cylinders",
};

export function Visualization() {
	const [activeOrigin, setActiveOrigin] = useState<string | null>(null);

	const processedData = useMemo(() => {
		return (data as DataEntry[]).map((d) => {
			const normalized: NormalizedEntry = { ...d };
			const keys = ["cyl3", "cyl4", "cyl5", "cyl6", "cyl8"] as const;
			for (const key of keys) {
				normalized[`${key}_perc`] = (d[key] / d.totalCount) * 100;
			}
			return normalized;
		});
	}, []);

	const selectedData = useMemo(() => {
		return (data as DataEntry[]).find((d) => d.origin === activeOrigin) || null;
	}, [activeOrigin]);

	const handleBarClick = (payload: { origin?: string } | null) => {
		if (payload?.origin) {
			setActiveOrigin(payload.origin === activeOrigin ? null : payload.origin);
		}
	};

	return (
		<div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 font-sans overflow-hidden">
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
					Cylinder Distribution
				</h2>
				<p className="text-zinc-400 text-xs mt-1">
					Analysis of car engines by origin of manufacture
				</p>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-2 mb-6">
				{Object.entries(CYLINDER_LABELS).map(([key, label]) => (
					<div
						key={key}
						className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10"
					>
						<div
							className="w-2 h-2 rounded-full"
							style={{ backgroundColor: CYLINDER_COLORS[key] }}
						/>
						<span className="text-[10px] text-zinc-300 font-medium">
							{label.split(" ")[0]} Cyl
						</span>
					</div>
				))}
			</div>

			{/* Chart Container */}
			<div className="flex-1 min-h-[250px] relative">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={processedData}
						margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
						onClick={(state) => {
							if (state?.activePayload) {
								handleBarClick(state.activePayload[0].payload);
							}
						}}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#27272a"
						/>
						<XAxis
							dataKey="origin"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
							dy={10}
							label={{
								value: "Origin",
								position: "bottom",
								fill: "#71717a",
								fontSize: 10,
							}}
						/>
						<YAxis hide={true} domain={[0, 100]} />
						<Tooltip
							cursor={{ fill: "rgba(255,255,255,0.05)" }}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<div className="bg-zinc-900 border border-white/10 p-2 rounded-lg shadow-xl backdrop-blur-md">
											<p className="font-bold text-xs mb-1">
												{payload[0].payload.origin}
											</p>
											<p className="text-[10px] text-zinc-400 mb-2">
												Total: {payload[0].payload.totalCount} cars
											</p>
											<div className="space-y-1">
												{payload.map(
													(entry: {
														name: string;
														dataKey: string;
														color: string;
														value: number;
													}) => (
														<div
															key={entry.name}
															className="flex items-center justify-between gap-4"
														>
															<div className="flex items-center gap-1.5">
																<div
																	className="w-1.5 h-1.5 rounded-full"
																	style={{ backgroundColor: entry.color }}
																/>
																<span className="text-[10px] text-zinc-300">
																	{
																		CYLINDER_LABELS[
																			entry.dataKey.replace("_perc", "")
																		]
																	}
																</span>
															</div>
															<span className="text-[10px] font-mono text-zinc-400">
																{entry.value.toFixed(1)}%
															</span>
														</div>
													),
												)}
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar
							dataKey="cyl3_perc"
							stackId="a"
							fill={CYLINDER_COLORS.cyl3}
							radius={[0, 0, 0, 0]}
						/>
						<Bar dataKey="cyl4_perc" stackId="a" fill={CYLINDER_COLORS.cyl4} />
						<Bar dataKey="cyl5_perc" stackId="a" fill={CYLINDER_COLORS.cyl5} />
						<Bar dataKey="cyl6_perc" stackId="a" fill={CYLINDER_COLORS.cyl6} />
						<Bar
							dataKey="cyl8_perc"
							stackId="a"
							fill={CYLINDER_COLORS.cyl8}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Detail Panel */}
			<div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
				{!activeOrigin ? (
					<div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
						<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
							<Info className="w-6 h-6 text-blue-400" />
						</div>
						<p className="text-sm font-medium text-zinc-300">Compare Regions</p>
						<p className="text-xs text-zinc-500 mt-1">
							Tap a bar to see detailed cylinder breakdown and car counts.
						</p>
					</div>
				) : (
					<div className="bg-white/5 border border-white/10 rounded-2xl p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
									<Car className="w-5 h-5 text-emerald-400" />
								</div>
								<div>
									<h3 className="font-bold text-zinc-100">{activeOrigin}</h3>
									<p className="text-xs text-zinc-500">
										{selectedData?.totalCount} Total Cars
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setActiveOrigin(null)}
								className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400"
							>
								Clear
							</button>
						</div>

						<div className="grid grid-cols-1 gap-2">
							{selectedData?.breakdown.map((item) => (
								<div
									key={item.cylinder}
									className="flex items-center justify-between p-2 rounded-xl bg-white/5"
								>
									<div className="flex items-center gap-3">
										<div
											className="w-1.5 h-8 rounded-full"
											style={{
												backgroundColor: CYLINDER_COLORS[`cyl${item.cylinder}`],
											}}
										/>
										<div>
											<p className="text-xs font-semibold text-zinc-200">
												{item.cylinder} Cylinders
											</p>
											<p className="text-[10px] text-zinc-500">
												{item.count} vehicles
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm font-mono font-bold text-zinc-100">
											{item.percentage}%
										</p>
										<div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
											<div
												className="h-full rounded-full"
												style={{
													width: `${item.percentage}%`,
													backgroundColor:
														CYLINDER_COLORS[`cyl${item.cylinder}`],
												}}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Footer / Meta */}
			<div className="mt-4 flex items-center justify-between px-1">
				<div className="flex items-center gap-1.5">
					<BarChart3 className="w-3 h-3 text-zinc-600" />
					<span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
						Data Report 2026
					</span>
				</div>
				<div className="flex items-center gap-1 text-[10px] text-zinc-600">
					<span>Scroll for more</span>
					<ChevronRight className="w-3 h-3" />
				</div>
			</div>
		</div>
	);
}
