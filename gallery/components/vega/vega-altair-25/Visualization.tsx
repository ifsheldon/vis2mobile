"use client";

import { scaleSequential } from "d3-scale";
import { interpolateGnBu } from "d3-scale-chromatic";
import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface Movie {
	Title: string;
	"Major Genre": string;
	"IMDB Rating": number | null;
	"Rotten Tomatoes Rating": number | null;
}

interface MovieWithRatings {
	Title: string;
	"Major Genre": string;
	"IMDB Rating": number;
	"Rotten Tomatoes Rating": number;
}

interface HeatmapBin {
	x: number; // IMDB bin start
	y: number; // Rotten Tomatoes bin start
	totalCount: number;
	selectedCount: number;
}

interface CustomShapeProps {
	cx: number;
	cy: number;
	payload: HeatmapBin;
}

const IMDB_BIN_SIZE = 1;
const RT_BIN_SIZE = 10;

export function Visualization() {
	const [data, setData] = useState<MovieWithRatings[]>([]);
	const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json")
			.then((res) => res.json())
			.then((jsonData) => {
				// Filter out records with missing essential data
				const cleanData = jsonData.filter(
					(d: Movie) =>
						d["Major Genre"] &&
						d["IMDB Rating"] !== null &&
						d["Rotten Tomatoes Rating"] !== null,
				) as MovieWithRatings[];
				setData(cleanData);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Failed to fetch data", err);
				setLoading(false);
			});
	}, []);

	const genreData = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const d of data) {
			const genre = d["Major Genre"];
			counts[genre] = (counts[genre] || 0) + 1;
		}
		return Object.entries(counts)
			.map(([genre, count]) => ({ genre, count }))
			.sort((a, b) => b.count - a.count);
	}, [data]);

	const heatmapData = useMemo(() => {
		const bins: Record<string, HeatmapBin> = {};

		for (const d of data) {
			const imdb = d["IMDB Rating"];
			const rt = d["Rotten Tomatoes Rating"];

			// Binning
			const xBin = Math.floor(imdb / IMDB_BIN_SIZE) * IMDB_BIN_SIZE;
			const yBin = Math.floor(rt / RT_BIN_SIZE) * RT_BIN_SIZE;
			const key = `${xBin}-${yBin}`;

			if (!bins[key]) {
				bins[key] = { x: xBin, y: yBin, totalCount: 0, selectedCount: 0 };
			}

			bins[key].totalCount += 1;

			if (selectedGenre && d["Major Genre"] === selectedGenre) {
				bins[key].selectedCount += 1;
			} else if (!selectedGenre) {
				bins[key].selectedCount += 1;
			}
		}

		return Object.values(bins);
	}, [data, selectedGenre]);

	const colorScale = useMemo(() => {
		const maxCount = Math.max(...heatmapData.map((d) => d.totalCount), 1);
		return scaleSequential(interpolateGnBu).domain([0, maxCount]);
	}, [heatmapData]);

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center text-zinc-500">
				Loading data...
			</div>
		);
	}

	// Custom Shape for Heatmap Background (Rectangles)
	const renderShape = (props: unknown) => {
		const { cx, cy, payload } = props as CustomShapeProps;
		const side = 24; // Approximation

		return (
			<rect
				x={cx - side / 2}
				y={cy - side / 2}
				width={side}
				height={side}
				fill={colorScale(payload.totalCount)}
				opacity={0.8}
			/>
		);
	};

	const renderSelectedShape = (props: unknown) => {
		const { cx, cy, payload } = props as CustomShapeProps;
		if (payload.selectedCount === 0) return <g />;

		const size = Math.min(Math.max(payload.selectedCount * 2, 4), 18);

		return (
			<circle
				cx={cx}
				cy={cy}
				r={size / 2}
				fill="#333"
				opacity={0.9}
				stroke="#fff"
				strokeWidth={1}
			/>
		);
	};

	return (
		<div className="w-full h-full overflow-y-auto bg-zinc-50 flex flex-col p-4 gap-6 font-sans">
			<header>
				<h1 className="text-xl font-bold text-zinc-900">
					Movie Ratings Analysis
				</h1>
				<p className="text-sm text-zinc-600">
					Comparing IMDB vs Rotten Tomatoes
				</p>
				<p className="text-xs text-zinc-500 mt-1">
					{selectedGenre ? `Showing: ${selectedGenre}` : "Showing: All Genres"}
				</p>
			</header>

			{/* Heatmap / Scatter Section */}
			<section className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex flex-col">
				<h2 className="text-sm font-semibold text-zinc-700 mb-2">
					Ratings Distribution
				</h2>
				<div className="h-[300px] w-full relative">
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
							<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
							<XAxis
								type="number"
								dataKey="x"
								name="IMDB"
								domain={[0, 10]}
								tickCount={6}
								label={{
									value: "IMDB Rating",
									position: "insideBottom",
									offset: -10,
									fontSize: 12,
								}}
								tick={{ fontSize: 10 }}
							/>
							<YAxis
								type="number"
								dataKey="y"
								name="Rotten Tomatoes"
								domain={[0, 100]}
								tickCount={6}
								label={{
									value: "Rotten Tomatoes",
									angle: -90,
									position: "insideLeft",
									fontSize: 12,
								}}
								tick={{ fontSize: 10 }}
							/>
							<Tooltip
								cursor={{ strokeDasharray: "3 3" }}
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const data = payload[0].payload as HeatmapBin;
										return (
											<div className="bg-white p-2 border border-zinc-200 shadow-md rounded text-xs">
												<p className="font-semibold">
													IMDB: {data.x} - {data.x + IMDB_BIN_SIZE}
												</p>
												<p className="font-semibold">
													RT: {data.y} - {data.y + RT_BIN_SIZE}
												</p>
												<div className="mt-1">
													<p>Total Movies: {data.totalCount}</p>
													<p>Selected: {data.selectedCount}</p>
												</div>
											</div>
										);
									}
									return null;
								}}
							/>
							{/* Background Heatmap Layer */}
							<Scatter
								data={heatmapData}
								shape={renderShape}
								isAnimationActive={false}
							/>
							{/* Foreground Selection Layer */}
							<Scatter
								data={heatmapData}
								shape={renderSelectedShape}
								isAnimationActive={true}
							/>
						</ScatterChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-2 text-xs text-zinc-400 text-center">
					Darker squares = more movies overall. Dots = selected genre.
				</div>
			</section>

			{/* Genre Filter Section */}
			<section className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex flex-col flex-1">
				<h2 className="text-sm font-semibold text-zinc-700 mb-2">
					Filter by Genre
				</h2>
				<div
					className="w-full flex-1"
					style={{ minHeight: `${Math.max(genreData.length * 40, 300)}px` }}
				>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							layout="vertical"
							data={genreData}
							margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								horizontal={false}
								opacity={0.3}
							/>
							<XAxis type="number" hide />
							<YAxis
								dataKey="genre"
								type="category"
								width={80}
								tick={{ fontSize: 11, fill: "#52525b" }} // zinc-600
								interval={0}
							/>
							<Tooltip
								cursor={{ fill: "transparent" }}
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										return (
											<div className="bg-white p-2 border border-zinc-200 shadow-md rounded text-xs">
												<span className="font-semibold">
													{payload[0].payload.genre}
												</span>
												: {payload[0].value}
											</div>
										);
									}
									return null;
								}}
							/>
							<Bar
								dataKey="count"
								radius={[0, 4, 4, 0]}
								barSize={24}
								// biome-ignore lint/suspicious/noExplicitAny: Recharts event typing is complex.
								onClick={(data: any) => {
									setSelectedGenre((prev) =>
										prev === data.genre ? null : data.genre,
									);
								}}
								cursor="pointer"
							>
								{genreData.map((entry) => (
									<Cell
										key={entry.genre}
										fill={selectedGenre === entry.genre ? "#3b82f6" : "#cbd5e1"}
										className="transition-colors duration-300"
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</section>
		</div>
	);
}
