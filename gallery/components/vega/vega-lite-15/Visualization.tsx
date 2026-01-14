"use client";

import { Calendar, Info, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { stocksData } from "@/components/vega/vega-lite-15/data";

const COMPANIES = [
	{ id: "AAPL", name: "Apple", color: "#2563eb" },
	{ id: "AMZN", name: "Amazon", color: "#7c3aed" },
	{ id: "GOOG", name: "Google", color: "#db2777" },
	{ id: "IBM", name: "IBM", color: "#ea580c" },
	{ id: "MSFT", name: "Microsoft", color: "#16a34a" },
];

interface StockPoint {
	date: string;
	AAPL: number;
	AMZN: number;
	GOOG: number | null;
	IBM: number;
	MSFT: number;
	timestamp?: number;
}

export function Visualization() {
	const [activeSeries, setActiveSeries] = useState<string | null>(null);
	const [currData, setCurrData] = useState<StockPoint | null>(null);

	const formattedData = useMemo(() => {
		return (stocksData as StockPoint[]).map((d) => ({
			...d,
			timestamp: new Date(d.date).getTime(),
		}));
	}, []);

	const handleToggle = (id: string) => {
		setActiveSeries(activeSeries === id ? null : id);
	};

	const currentPoint = currData || formattedData[formattedData.length - 1];

	return (
		<div className="flex flex-col h-full bg-white dark:bg-black font-sans select-none pt-10">
			{/* Header & Fixed Info Block */}
			<div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-2 mb-1">
					<TrendingUp className="w-5 h-5 text-blue-600" />
					<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
						Tech Stock History
					</h1>
				</div>
				<p className="text-sm text-zinc-500 mb-4">Stock prices 2000 — 2010</p>

				{/* Fixed Info Block (Scrubbing Feedback) */}
				<div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 flex flex-col gap-2 shadow-sm border border-zinc-100 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-zinc-500">
							<Calendar className="w-4 h-4" />
							<span className="text-xs font-medium uppercase tracking-wider">
								{currentPoint?.date || "---"}
							</span>
						</div>
						{activeSeries && (
							<span
								className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
								style={{
									backgroundColor: `${
										COMPANIES.find((c) => c.id === activeSeries)?.color
									}20`,
									color: COMPANIES.find((c) => c.id === activeSeries)?.color,
								}}
							>
								{activeSeries}
							</span>
						)}
					</div>

					<div className="grid grid-cols-3 gap-2">
						{COMPANIES.map((company) => {
							const isDimmed = activeSeries && activeSeries !== company.id;
							const val = currentPoint
								? currentPoint[company.id as keyof StockPoint]
								: null;

							return (
								<div
									key={company.id}
									className={`flex flex-col transition-opacity duration-200 ${
										isDimmed ? "opacity-30" : "opacity-100"
									}`}
								>
									<span className="text-[10px] text-zinc-400 font-semibold truncate">
										{company.id}
									</span>
									<span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
										{typeof val === "number" ? `$${val.toFixed(1)}` : "—"}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Chart Area */}
			<div className="flex-1 w-full mt-4 min-h-0 relative">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={formattedData}
						margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
						onMouseMove={(e) => {
							if (e?.activePayload) {
								setCurrData(e.activePayload[0].payload as StockPoint);
							}
						}}
						onMouseLeave={() => setCurrData(null)}
						onTouchMove={(e) => {
							if (e?.activePayload) {
								setCurrData(e.activePayload[0].payload as StockPoint);
							}
						}}
					>
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
							stroke="#e5e7eb"
							opacity={0.5}
						/>
						<XAxis
							dataKey="timestamp"
							type="number"
							domain={["dataMin", "dataMax"]}
							tickFormatter={(unix) => {
								const date = new Date(unix);
								return `'${date.getFullYear().toString().slice(2)}`;
							}}
							ticks={[
								new Date("2000-01-01").getTime(),
								new Date("2002-01-01").getTime(),
								new Date("2004-01-01").getTime(),
								new Date("2006-01-01").getTime(),
								new Date("2008-01-01").getTime(),
								new Date("2010-01-01").getTime(),
							]}
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 11, fill: "#94a3b8" }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 11, fill: "#94a3b8" }}
							domain={[0, "auto"]}
							tickFormatter={(val) => `$${val}`}
						/>
						<Tooltip content={() => null} />
						{COMPANIES.map((company) => (
							<Line
								key={company.id}
								type="monotone"
								dataKey={company.id}
								stroke={company.color}
								strokeWidth={activeSeries === company.id ? 3 : 1.5}
								dot={false}
								activeDot={{ r: 4, strokeWidth: 0 }}
								opacity={
									activeSeries === null || activeSeries === company.id ? 1 : 0.1
								}
								animationDuration={300}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Legend Block */}
			<div className="px-6 py-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
				<div className="flex items-center gap-2 mb-3">
					<Info className="w-3.5 h-3.5 text-zinc-400" />
					<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
						Select to highlight
					</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{COMPANIES.map((company) => {
						const isActive = activeSeries === company.id;
						const isDimmed = activeSeries !== null && !isActive;
						return (
							<button
								key={company.id}
								type="button"
								onClick={() => handleToggle(company.id)}
								className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-2 ${
									isActive
										? "bg-white dark:bg-zinc-800 shadow-md scale-105"
										: isDimmed
											? "bg-zinc-100/50 dark:bg-zinc-800/30 border-transparent text-zinc-500 opacity-40 grayscale"
											: "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm"
								}`}
								style={{
									borderColor: isActive ? company.color : undefined,
									borderWidth: isActive ? "2px" : "1px",
								}}
							>
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: company.color }}
								/>
								{company.name}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
