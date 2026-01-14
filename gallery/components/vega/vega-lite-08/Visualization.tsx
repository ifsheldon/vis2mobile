"use client";

import { scaleLinear } from "d3-scale";
import { BarChart3, Info, Percent, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";
import {
	type BinnedData,
	fetchAndProcessMovies,
} from "@/components/vega/vega-lite-08/movies";

const COLOR_RANGE = ["#f7feae", "#0c2c84"];

export function Visualization() {
	const [data, setData] = useState<BinnedData[]>([]);
	const [maxCount, setMaxCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [activePoint, setActivePoint] = useState<BinnedData | null>(null);

	useEffect(() => {
		fetchAndProcessMovies().then((res) => {
			setData(res.data);
			setMaxCount(res.maxCount);
			setLoading(false);
		});
	}, []);

	const colorScale = useMemo(() => {
		return scaleLinear<string>().domain([0, maxCount]).range(COLOR_RANGE);
	}, [maxCount]);

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-white dark:bg-zinc-950">
				<div className="flex flex-col items-center gap-3">
					<div className="w-10 h-10 border-4 border-zinc-100 border-t-indigo-600 rounded-full animate-spin" />
					<span className="text-zinc-500 text-sm font-medium animate-pulse">
						Analyzing movie trends...
					</span>
				</div>
			</div>
		);
	}

	const handleMouseMove = (state: {
		activePayload?: { payload: BinnedData }[];
	}) => {
		if (state?.activePayload && state.activePayload.length > 0) {
			setActivePoint(state.activePayload[0].payload);
		}
	};

	const handleMouseLeave = () => {
		// Keep it for better mobile ux
	};

	return (
		<div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 p-6 font-sans pt-10">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-2 mb-1">
					<div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
						<BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
					</div>
					<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
						Movie Ratings
					</h1>
				</div>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
					Density correlation between IMDB and Rotten Tomatoes scores.
				</p>
			</div>

			{/* Legend Card */}
			<div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
				<div className="flex justify-between items-center mb-2.5">
					<span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
						Movie Count
					</span>
					<div className="flex items-center gap-1.5">
						<div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
						<span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
							Max: {maxCount}
						</span>
					</div>
				</div>
				<div
					className="h-3 w-full rounded-full shadow-inner"
					style={{
						background: `linear-gradient(to right, ${COLOR_RANGE[0]}, ${COLOR_RANGE[1]})`,
					}}
				/>
				<div className="flex justify-between mt-1.5 px-0.5">
					<span className="text-[9px] text-zinc-400 font-bold uppercase">
						Sparse
					</span>
					<span className="text-[9px] text-zinc-400 font-bold uppercase">
						Dense
					</span>
				</div>
			</div>

			{/* Chart Area */}
			<div className="relative flex-grow flex items-center justify-center -mx-2">
				<div className="w-full aspect-[4/5] max-h-[400px]">
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart
							margin={{ top: 20, right: 20, bottom: 45, left: 10 }}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
							onTouchMove={handleMouseMove}
							onClick={handleMouseMove}
						>
							<XAxis
								type="number"
								dataKey="x0"
								name="IMDB"
								domain={[1, 10]}
								ticks={[2, 4, 6, 8, 10]}
								tick={{ fontSize: 11, fill: "#A1A1AA", fontWeight: 500 }}
								axisLine={{ stroke: "#E4E4E7", strokeWidth: 1 }}
								tickLine={false}
								label={{
									value: "IMDB Rating",
									position: "bottom",
									offset: 25,
									fontSize: 12,
									fontWeight: 700,
									fill: "#71717A",
								}}
							/>
							<YAxis
								type="number"
								dataKey="y0"
								name="RT"
								domain={[0, 100]}
								ticks={[0, 25, 50, 75, 100]}
								tick={{ fontSize: 11, fill: "#A1A1AA", fontWeight: 500 }}
								axisLine={{ stroke: "#E4E4E7", strokeWidth: 1 }}
								tickLine={false}
								label={{
									value: "RT %",
									angle: -90,
									position: "insideLeft",
									offset: -5,
									fontSize: 12,
									fontWeight: 700,
									fill: "#71717A",
								}}
							/>
							<ZAxis type="number" dataKey="count" range={[0, 1]} />
							<Tooltip cursor={false} content={() => null} />
							<Scatter
								data={data}
								isAnimationActive={false}
								shape={(props: {
									cx: number;
									cy: number;
									payload: BinnedData;
								}) => {
									const { cx, cy, payload } = props;
									const isActive = activePoint === payload;
									// Adjusted sizes for better fit: width ~8.5 (for 30 bins in ~260px), height ~13 (for 20 bins in ~300px)
									return (
										<rect
											x={cx - 4}
											y={cy - 6.5}
											width={8}
											height={13}
											fill={colorScale(payload.count)}
											stroke={isActive ? "#000" : "none"}
											strokeWidth={isActive ? 1.5 : 0}
											className="transition-all duration-150"
										/>
									);
								}}
							/>
						</ScatterChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Info Panel */}
			<div className="mt-6">
				<div className="bg-zinc-900 dark:bg-zinc-50 p-5 rounded-[2rem] shadow-2xl text-zinc-100 dark:text-zinc-900">
					{!activePoint ? (
						<div className="flex items-center gap-4">
							<div className="bg-indigo-500/20 p-3 rounded-2xl">
								<Info className="w-6 h-6 text-indigo-400 dark:text-indigo-600" />
							</div>
							<div>
								<p className="text-sm font-bold tracking-tight">
									Explore the Data
								</p>
								<p className="text-[12px] opacity-60 font-medium">
									Drag across the heatmap to see movie counts
								</p>
							</div>
						</div>
					) : (
						<div className="flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
									<span className="text-sm font-bold">
										IMDB: {activePoint.x0.toFixed(1)} -{" "}
										{activePoint.x1.toFixed(1)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Percent className="w-4 h-4 text-rose-500" />
									<span className="text-sm font-bold">
										Rotten Tomatoes: {activePoint.y0}-{activePoint.y1}%
									</span>
								</div>
							</div>
							<div className="text-right border-l border-zinc-800 dark:border-zinc-200 pl-6 py-1">
								<p className="text-[10px] uppercase opacity-50 font-black tracking-widest">
									Count
								</p>
								<p className="text-3xl font-black tabular-nums tracking-tighter">
									{activePoint.count}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
