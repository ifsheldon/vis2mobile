"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface MovieData {
	Title: string;
	"IMDB Rating": number | null;
	// Other fields are present but we focus on IMDB Rating
}

interface BinData {
	binStart: number;
	binEnd: number;
	label: string;
	count: number;
}

interface ProcessedData {
	bins: BinData[];
	mean: number;
	totalCount: number;
}

export function Visualization() {
	const [data, setData] = useState<ProcessedData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json",
				);
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const jsonData: MovieData[] = await response.json();

				// 1. Filter valid ratings
				const validRatings = jsonData
					.map((d) => d["IMDB Rating"])
					.filter((r): r is number => r !== null && !Number.isNaN(r));

				if (validRatings.length === 0) {
					throw new Error("No valid rating data found");
				}

				// 2. Calculate Mean
				const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
				const mean = sum / validRatings.length;

				// 3. Binning
				// Bin size 0.5 to get reasonable detail
				const binSize = 0.5;
				const minRating = Math.floor(Math.min(...validRatings));
				const maxRating = Math.ceil(Math.max(...validRatings));

				const binsMap = new Map<number, number>();

				// Initialize bins
				for (let i = minRating; i < maxRating; i += binSize) {
					binsMap.set(i, 0);
				}

				validRatings.forEach((rating) => {
					// Find the bin start
					const binStart = Math.floor(rating / binSize) * binSize;
					const currentCount = binsMap.get(binStart) || 0;
					binsMap.set(binStart, currentCount + 1);
				});

				const bins: BinData[] = Array.from(binsMap.entries())
					.sort((a, b) => a[0] - b[0])
					.map(([start, count]) => {
						// Handle float precision issues
						const cleanStart = Math.round(start * 10) / 10;
						const cleanEnd = Math.round((start + binSize) * 10) / 10;
						return {
							binStart: cleanStart,
							binEnd: cleanEnd,
							label: `${cleanStart}`,
							count,
						};
					});

				setData({
					bins,
					mean,
					totalCount: validRatings.length,
				});
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
				<div className="animate-pulse flex flex-col items-center">
					<div className="h-12 w-12 rounded-full bg-blue-300 mb-4"></div>
					<div className="h-4 w-32 bg-blue-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full w-full items-center justify-center text-red-500 bg-red-50 p-4 text-center">
				Error: {error}
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-sans text-slate-800 overflow-y-auto">
			{/* Header Section */}
			<header className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight text-slate-900">
					IMDB Ratings
				</h1>
				<p className="text-sm text-slate-500 mt-1">
					Distribution of user ratings for {data.totalCount.toLocaleString()}{" "}
					movies
				</p>
			</header>

			{/* Key Metric Card */}
			<div className="mb-6 relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200 border border-slate-100">
				<div className="absolute top-0 right-0 p-4 opacity-10">
					<Star className="w-24 h-24 text-red-500" />
				</div>
				<div className="relative z-10">
					<p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">
						Global Average
					</p>
					<div className="flex items-baseline gap-2">
						<span className="text-5xl font-extrabold text-slate-900 tracking-tighter">
							{data.mean.toFixed(1)}
						</span>
						<span className="text-lg text-slate-400">/ 10</span>
					</div>
					<div className="mt-2 flex items-center text-xs text-red-500 font-medium">
						<div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
						Marked on chart
					</div>
				</div>
			</div>

			{/* Chart Container */}
			<div className="flex-1 min-h-[400px] w-full bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-4 flex flex-col">
				<div className="flex items-center justify-between mb-4 px-2">
					<h2 className="text-sm font-semibold text-slate-700">
						Frequency Distribution
					</h2>
					{/* Legend-like indicator */}
					<div className="flex items-center gap-2 text-xs text-slate-400">
						<span className="w-3 h-3 rounded-sm bg-indigo-500/80"></span>
						<span>Movies</span>
					</div>
				</div>

				<div className="flex-1 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data.bins}
							margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
							barCategoryGap="10%"
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e2e8f0"
								opacity={0.5}
							/>
							<XAxis
								dataKey="binStart"
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#94a3b8", fontSize: 12 }}
								dy={10}
								// Only show integer ticks to avoid clutter
								ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
								domain={[1, 10]}
								type="number"
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#94a3b8", fontSize: 11 }}
								tickCount={5}
							/>
							<Tooltip
								cursor={{ fill: "#f1f5f9", opacity: 0.5 }}
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const binData = payload[0].payload as BinData;
										return (
											<div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
												<p className="font-semibold mb-1">
													Rating: {binData.binStart} - {binData.binEnd}
												</p>
												<p className="text-slate-300">
													Count:{" "}
													<span className="text-white font-bold">
														{binData.count}
													</span>
												</p>
											</div>
										);
									}
									return null;
								}}
							/>
							<Bar dataKey="count" radius={[4, 4, 0, 0]}>
								{data.bins.map((entry) => (
									<Cell
										key={`cell-${entry.binStart}`}
										fill="url(#colorGradient)"
									/>
								))}
							</Bar>
							<defs>
								<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
									<stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
								</linearGradient>
							</defs>

							{/* Mean Reference Line */}
							<ReferenceLine
								x={data.mean}
								stroke="#ef4444"
								strokeDasharray="4 4"
								strokeWidth={2}
							></ReferenceLine>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
