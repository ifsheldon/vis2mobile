"use client";

import { type ClassValue, clsx } from "clsx";
import { useMemo, useState } from "react";
import {
	CartesianGrid,
	ComposedChart,
	Line,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import rawData from "@/components/vega/vega-altair-29/data.json";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface DataPoint {
	symbol: string;
	date: string;
	price: number;
}

interface ChartDataEntry {
	date: string;
	timestamp: number;
	[key: string]: string | number;
}

const SYMBOLS = ["MSFT", "AMZN", "GOOG", "IBM", "AAPL"];
const COLORS: Record<string, string> = {
	MSFT: "#3b82f6", // Blue
	AMZN: "#f97316", // Orange
	GOOG: "#ef4444", // Red
	IBM: "#8b5cf6", // Violet
	AAPL: "#10b981", // Emerald
};

export function Visualization() {
	const [activeSymbols, setActiveSymbols] = useState<Set<string>>(
		new Set(SYMBOLS),
	);
	const [hoverData, setHoverData] = useState<ChartDataEntry | null>(null);

	const data = useMemo(() => {
		const grouped: Record<string, ChartDataEntry> = {};
		let totalSum = 0;
		let totalCount = 0;

		(rawData as DataPoint[]).forEach((d) => {
			const dateStr = d.date.split("T")[0];
			if (!grouped[dateStr]) {
				grouped[dateStr] = {
					date: dateStr,
					timestamp: new Date(dateStr).getTime(),
				};
			}
			grouped[dateStr][d.symbol] = d.price;
			totalSum += d.price;
			totalCount += 1;
		});

		const sorted = Object.values(grouped).sort(
			(a, b) => a.timestamp - b.timestamp,
		);
		const globalAvg = totalSum / totalCount;

		return { chartData: sorted, globalAvg };
	}, []);

	const toggleSymbol = (symbol: string) => {
		const newSet = new Set(activeSymbols);
		if (newSet.has(symbol)) {
			if (newSet.size > 1) {
				newSet.delete(symbol);
			}
		} else {
			newSet.add(symbol);
		}
		setActiveSymbols(newSet);
	};

	const formatXAxis = (tickItem: string) => {
		return tickItem.split("-")[0].substring(2); // '00, '01 etc
	};

	const formatYAxis = (value: number) => {
		return `$${value}`;
	};

	const activeData = hoverData || data.chartData[data.chartData.length - 1];

	return (
		<div className="flex flex-col w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100 font-sans h-[600px]">
			{/* Header / Fixed Tooltip */}
			<div className="p-6 bg-zinc-50 border-b border-zinc-100">
				<div className="flex justify-between items-baseline mb-1">
					<h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
						Tech Stock Evolution
					</h2>
					<span className="text-zinc-400 text-[10px] font-medium">
						{activeData?.date}
					</span>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
					{SYMBOLS.map((s) => (
						<div
							key={s}
							className={cn(
								"flex flex-col transition-opacity duration-200",
								!activeSymbols.has(s) && "opacity-20",
							)}
						>
							<span
								className="text-[10px] font-bold"
								style={{ color: COLORS[s] }}
							>
								{s}
							</span>
							<span className="text-sm font-bold text-zinc-800">
								{activeData?.[s]
									? `$${Number(activeData[s]).toFixed(1)}`
									: "--"}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Filter Chips */}
			<div className="px-4 py-3 flex flex-wrap gap-2 bg-white text-center justify-center">
				{SYMBOLS.map((s) => (
					<button
						key={s}
						type="button"
						onClick={() => toggleSymbol(s)}
						className={cn(
							"px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-200 border",
							activeSymbols.has(s)
								? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
								: "bg-white text-zinc-400 border-zinc-200",
						)}
						style={
							activeSymbols.has(s)
								? { backgroundColor: COLORS[s], borderColor: COLORS[s] }
								: {}
						}
					>
						{s}
					</button>
				))}
			</div>

			{/* Chart Area */}
			<div className="flex-1 w-full pt-4 pr-4 relative">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						data={data.chartData}
						onMouseMove={(e) => {
							if (e.activePayload) {
								setHoverData(e.activePayload[0].payload);
							}
						}}
						onMouseLeave={() => setHoverData(null)}
						onTouchMove={(e) => {
							if (e.activePayload) {
								setHoverData(e.activePayload[0].payload);
							}
						}}
						onTouchEnd={() => setHoverData(null)}
						margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
					>
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
							stroke="#f0f0f0"
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#a1a1aa" }}
							tickFormatter={formatXAxis}
							interval={24} // roughly every 2 years
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#a1a1aa" }}
							tickFormatter={formatYAxis}
							width={40}
							domain={[0, "auto"]}
						/>
						<Tooltip content={() => null} />
						<ReferenceLine
							y={data.globalAvg}
							stroke="#d4d4d8"
							strokeDasharray="5 5"
							label={{
								value: "AVG",
								position: "right",
								fill: "#d4d4d8",
								fontSize: 10,
								fontWeight: "bold",
							}}
						/>
						{SYMBOLS.map((s) => (
							<Line
								key={s}
								type="monotone"
								dataKey={s}
								stroke={COLORS[s]}
								strokeWidth={activeSymbols.has(s) ? 2.5 : 0}
								dot={false}
								activeDot={{ r: 4, strokeWidth: 0 }}
								connectNulls
								animationDuration={1000}
								hide={!activeSymbols.has(s)}
							/>
						))}
					</ComposedChart>
				</ResponsiveContainer>
			</div>

			<div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
				<span className="text-[10px] text-zinc-400 font-medium italic">
					Jan 2000 - Mar 2010
				</span>
				<div className="flex items-center gap-1">
					<div className="w-2 h-2 rounded-full bg-zinc-300"></div>
					<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
						Stock Index
					</span>
				</div>
			</div>
		</div>
	);
}
