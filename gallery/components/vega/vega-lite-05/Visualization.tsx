"use client";

import { useMemo } from "react";
import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// --- Data & Types ---

type RawDataPoint = {
	label: string;
	amount: number;
};

type ProcessedDataPoint = {
	label: string;
	originalAmount: number;
	runningTotal: number;
	start: number;
	end: number;
	placeholder: number; // Transparent stack
	barSize: number; // Colored stack
	type: "total" | "inc" | "dec";
	fill: string;
	displayAmount: string;
};

const RAW_DATA: RawDataPoint[] = [
	{ label: "Begin", amount: 4000 },
	{ label: "Jan", amount: 1707 },
	{ label: "Feb", amount: -1425 },
	{ label: "Mar", amount: -1030 },
	{ label: "Apr", amount: 1812 },
	{ label: "May", amount: -1067 },
	{ label: "Jun", amount: -1481 },
	{ label: "Jul", amount: 1228 },
	{ label: "Aug", amount: 1176 },
	{ label: "Sep", amount: 1146 },
	{ label: "Oct", amount: 1205 },
	{ label: "Nov", amount: -1388 },
	{ label: "Dec", amount: 1492 },
	{ label: "End", amount: 0 },
];

const COLORS = {
	total: "#f7e0b6", // amber-200
	inc: "#93c4aa", // emerald-400
	dec: "#f78a64", // orange-400
};

// --- Transformation Logic ---

function processData(data: RawDataPoint[]): ProcessedDataPoint[] {
	let currentSum = 0;
	return data.map((item) => {
		const isTotal = item.label === "Begin" || item.label === "End";
		let start = 0;
		let end = 0;
		let type: ProcessedDataPoint["type"] = "inc";

		if (item.label === "Begin") {
			start = 0;
			end = item.amount;
			currentSum = item.amount;
			type = "total";
		} else if (item.label === "End") {
			start = 0;
			end = currentSum;
			type = "total";
		} else {
			const prevSum = currentSum;
			currentSum += item.amount;
			start = Math.min(prevSum, currentSum);
			end = Math.max(prevSum, currentSum);
			type = item.amount >= 0 ? "inc" : "dec";
		}

		return {
			label: item.label,
			originalAmount: item.amount,
			runningTotal: currentSum,
			start,
			end,
			placeholder: start,
			barSize: end - start,
			type,
			fill: COLORS[type],
			displayAmount:
				item.label === "End"
					? `${currentSum}`
					: item.amount > 0 && !isTotal
						? `+${item.amount}`
						: `${item.amount}`,
		};
	});
}

// --- Components ---

interface CustomTooltipProps {
	active?: boolean;
	payload?: {
		payload: ProcessedDataPoint;
	}[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 text-sm">
				<p className="font-bold text-slate-800 mb-2">{data.label}</p>
				<div className="space-y-1.5">
					{data.type !== "total" ? (
						<>
							<div className="flex justify-between gap-8">
								<span className="text-slate-500 font-medium">
									Monthly Change:
								</span>
								<span
									className={`font-bold ${data.originalAmount >= 0 ? "text-emerald-600" : "text-orange-500"}`}
								>
									{data.originalAmount > 0 ? "+" : ""}
									{data.originalAmount}
								</span>
							</div>
							<div className="flex justify-between gap-8">
								<span className="text-slate-500 font-medium">
									Cumulative Total:
								</span>
								<span className="font-bold text-slate-800">
									{data.runningTotal}
								</span>
							</div>
						</>
					) : (
						<div className="flex justify-between gap-8">
							<span className="text-slate-500 font-medium">Balance:</span>
							<span className="font-bold text-slate-800">
								{data.runningTotal}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}
	return null;
};

interface CustomYAxisTickProps {
	x?: number;
	y?: number;
	payload?: {
		value: string;
	};
}

const CustomYAxisTick = (props: CustomYAxisTickProps) => {
	const { x, y, payload } = props;
	return (
		<g transform={`translate(${x},${y})`}>
			<text
				x={-8}
				y={0}
				dy={4}
				textAnchor="end"
				fill="#475569" // slate-600
				fontSize={12}
				fontWeight={600}
			>
				{payload?.value}
			</text>
		</g>
	);
};

interface LabelProps {
	x: number;
	y: number;
	width: number;
	height: number;
	value: string;
	index: number;
}

export function Visualization() {
	const processedData = useMemo(() => processData(RAW_DATA), []);

	// Calculate dynamic height based on data items
	const chartHeight = Math.max(RAW_DATA.length * 48, 400);

	return (
		<div className="w-full h-full bg-slate-50 flex flex-col">
			{/* Header - Added pt-8 for notch clearance */}
			<div className="p-4 pt-10 bg-white shadow-sm z-10 sticky top-0">
				<h1 className="text-xl font-extrabold text-slate-900 leading-tight">
					Annual Financial Flow
				</h1>
				<p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
					Monthly Deviation & Cumulative Balance
				</p>

				{/* Legend */}
				<div className="flex gap-4 mt-4">
					<div className="flex items-center gap-1.5">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: COLORS.total }}
						/>
						<span className="text-[10px] font-bold text-slate-500 uppercase">
							Total
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: COLORS.inc }}
						/>
						<span className="text-[10px] font-bold text-slate-500 uppercase">
							Increase
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: COLORS.dec }}
						/>
						<span className="text-[10px] font-bold text-slate-500 uppercase">
							Decrease
						</span>
					</div>
				</div>
			</div>

			{/* Chart Container */}
			<div className="flex-1 overflow-y-auto w-full">
				<div
					style={{ height: chartHeight, width: "100%" }}
					className="pr-12 pb-8"
				>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							layout="vertical"
							data={processedData}
							margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
							barCategoryGap="25%"
						>
							<XAxis
								type="number"
								hide
								domain={[0, "dataMax + 1500"]} // Add some room for labels
							/>
							<YAxis
								type="category"
								dataKey="label"
								tick={<CustomYAxisTick />}
								width={55}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip
								content={<CustomTooltip />}
								cursor={{ fill: "rgba(0,0,0,0.02)" }}
								trigger="click"
							/>

							{/* Transparent Placeholder Stack */}
							<Bar
								dataKey="placeholder"
								stackId="a"
								fill="transparent"
								isAnimationActive={false}
							/>

							{/* Actual Value Bar */}
							<Bar dataKey="barSize" stackId="a" isAnimationActive={true}>
								{processedData.map((entry) => (
									<Cell key={entry.label} fill={entry.fill} />
								))}
								<LabelList
									dataKey="displayAmount"
									content={(props: unknown) => {
										const { x, y, width, height, value, index } =
											props as LabelProps;
										const dataPoint = processedData[index];

										// We want to avoid overlaps
										// Increment (value) and Running Total (dataPoint.runningTotal)

										const isWide = width > 65;
										const textColor = isWide
											? dataPoint.type === "total"
												? "#92400e"
												: "#fff"
											: dataPoint.type === "inc"
												? "#059669"
												: dataPoint.type === "dec"
													? "#ea580c"
													: "#475569";

										// If wide: Increment inside, Total outside
										// If narrow: Increment outside, Total further outside

										const incrementX = isWide ? x + width / 2 : x + width + 6;
										const totalX = x + width + (isWide ? 10 : 55);
										const incrementAnchor = isWide ? "middle" : "start";

										return (
											<g>
												{/* Bar Label (Increment) */}
												<text
													x={incrementX}
													y={y + height / 2 + 4}
													textAnchor={incrementAnchor}
													fill={textColor}
													fontSize={11}
													fontWeight={700}
												>
													{value}
												</text>

												{/* Running Total Label (only for intermediate steps) */}
												{dataPoint.type !== "total" && (
													<text
														x={totalX}
														y={y + height / 2 + 4}
														textAnchor="start"
														fill="#94a3b8"
														fontSize={10}
														fontWeight={500}
													>
														{dataPoint.runningTotal}
													</text>
												)}
											</g>
										);
									}}
								/>
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Footer / Hint */}
			<div className="p-4 bg-white border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
				Tap on bars for detailed breakdown
			</div>
		</div>
	);
}
