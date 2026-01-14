"use client";

import { Info, Layers, MousePointer2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";

interface DataPoint {
	u: number;
	v: number;
	id?: string;
}

export function Visualization() {
	const [data, setData] = useState<DataPoint[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"https://vega.github.io/editor/data/normal-2d.json",
				);
				const json = await response.json();
				const dataWithIds = json.map((d: DataPoint, i: number) => ({
					...d,
					id: `point-${i}`,
				}));
				setData(dataWithIds);
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const activePoint = useMemo(() => {
		if (activeIndex !== null && data[activeIndex]) {
			return data[activeIndex];
		}
		return null;
	}, [activeIndex, data]);

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
					<span className="text-sm font-medium animate-pulse">
						Loading Distribution...
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col bg-zinc-950 text-white font-sans">
			<div className="pt-12 px-6 pb-4 flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<Layers className="w-6 h-6 text-blue-500" />
						Normal 2D
					</h1>
					<p className="text-zinc-400 text-sm mt-1">
						Bivariate distribution of {data.length} samples.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setActiveIndex(null)}
					className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					<RefreshCcw className="w-5 h-5" />
				</button>
			</div>

			<div className="flex-1 min-h-0 px-2 py-2 relative">
				<div className="w-full h-full bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-2 overflow-hidden shadow-2xl backdrop-blur-sm relative">
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart
							margin={{ top: 20, right: 30, bottom: 50, left: 30 }}
							onMouseMove={(e) => {
								if (e && typeof e.activeTooltipIndex === "number") {
									setActiveIndex(e.activeTooltipIndex);
								}
							}}
							onMouseLeave={() => setActiveIndex(null)}
							onTouchMove={(e) => {
								if (e && typeof e.activeTooltipIndex === "number") {
									setActiveIndex(e.activeTooltipIndex);
								}
							}}
							onTouchEnd={() => setActiveIndex(null)}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#333"
								vertical={true}
								horizontal={true}
							/>
							<XAxis
								type="number"
								dataKey="u"
								name="u"
								domain={["auto", "auto"]}
								stroke="#d4d4d8"
								fontSize={11}
								tickLine={true}
								axisLine={false}
								label={{
									value: "U Dimension",
									position: "bottom",
									offset: 30,
									fill: "#a1a1aa",
									fontSize: 13,
									fontWeight: 600,
								}}
							/>
							<YAxis
								type="number"
								dataKey="v"
								name="v"
								domain={["auto", "auto"]}
								stroke="#d4d4d8"
								fontSize={11}
								tickLine={true}
								axisLine={false}
								label={{
									value: "V Dimension",
									angle: -90,
									position: "left",
									offset: 15,
									fill: "#a1a1aa",
									fontSize: 13,
									fontWeight: 600,
								}}
							/>
							<ZAxis type="number" range={[70, 70]} />
							<Tooltip
								cursor={{ strokeDasharray: "3 3", stroke: "#3b82f6" }}
								content={() => null}
							/>
							<Scatter
								name="Points"
								data={data}
								fill="#3b82f6"
								fillOpacity={0.6}
							>
								{data.map((entry, index) => (
									<Cell
										key={entry.id}
										fill={index === activeIndex ? "#fb7185" : "#3b82f6"}
										fillOpacity={index === activeIndex ? 1 : 0.6}
										stroke={index === activeIndex ? "#fff" : "none"}
										strokeWidth={index === activeIndex ? 2 : 0}
									/>
								))}
							</Scatter>
						</ScatterChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="px-6 pb-8 pt-2">
				<div
					className={`
          w-full p-4 rounded-3xl border transition-all duration-500
          ${activePoint
							? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
							: "bg-zinc-900 border-zinc-800"
						}
        `}
				>
					{activePoint ? (
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-500">
									Selected Point
								</span>
								<div className="flex gap-6 mt-2">
									<div>
										<span className="text-zinc-500 text-[10px] uppercase font-bold block">
											U Axis
										</span>
										<span className="text-xl font-mono font-bold text-white leading-none">
											{activePoint.u.toFixed(4)}
										</span>
									</div>
									<div className="border-l border-zinc-800 pl-6">
										<span className="text-zinc-500 text-[10px] uppercase font-bold block">
											V Axis
										</span>
										<span className="text-xl font-mono font-bold text-white leading-none">
											{activePoint.v.toFixed(4)}
										</span>
									</div>
								</div>
							</div>
							<div className="bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
								<MousePointer2 className="w-5 h-5 text-white" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-4 text-zinc-500 py-2">
							<div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
								<Info className="w-5 h-5" />
							</div>
							<p className="text-sm font-medium leading-tight">
								Touch and drag on the chart to explore the distribution data.
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="h-4" />
		</div>
	);
}
