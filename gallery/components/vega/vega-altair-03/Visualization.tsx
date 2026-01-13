"use client";

import { useState } from "react";
import type { TooltipProps } from "recharts";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import data from "@/components/vega/vega-altair-03/data.json";

const transformedData = data.map((item) => ({
	...item,
	total: item["Fossil Fuels"] + item["Nuclear Energy"] + item.Renewables,
}));

type TransformedData = typeof transformedData;

type DataPoint = TransformedData[number];

const numberFormatter = (value: number) => {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}k`;
	}
	return value.toString();
};

const CustomTooltip = (_: TooltipProps<number, string>) => {
	return null;
};

export function Visualization() {
	const [activeDataPoint, setActiveDataPoint] = useState<DataPoint>(
		transformedData[transformedData.length - 1],
	);

	// biome-ignore lint/suspicious/noExplicitAny: Recharts mouse event state is complex to type precisely.
	const handleMouseMove = (state: any) => {
		if (state.activePayload && state.activePayload.length > 0) {
			setActiveDataPoint(state.activePayload[0].payload);
		}
	};

	const energySources = [
		{
			name: "Fossil Fuels",
			key: "Fossil Fuels",
			color: "#64748b",
			fill: "url(#colorFossil)",
			stroke: "#475569",
		},
		{
			name: "Nuclear",
			key: "Nuclear Energy",
			color: "#fb7185",
			fill: "url(#colorNuclear)",
			stroke: "#e11d48",
		},
		{
			name: "Renewables",
			key: "Renewables",
			color: "#34d399",
			fill: "url(#colorRenewable)",
			stroke: "#10b981",
		},
	];

	const ticks = [2001, 2005, 2010, 2015, 2017];

	return (
		<div className="w-full h-full bg-white font-sans flex flex-col overflow-hidden">
			<header className="p-6 pb-2">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
							Energy <span className="text-emerald-600">Trends</span>
						</h1>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
							US Net Generation • TWh
						</p>
					</div>
					<div className="bg-emerald-50 px-2 py-1 rounded text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
						2001 - 2017
					</div>
				</div>
			</header>

			<div className="px-6 py-4 flex-1 flex flex-col">
				<div className="bg-slate-900 rounded-2xl p-4 shadow-xl mb-6 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
					<div className="relative z-10 flex justify-between items-end">
						<div>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
								Focus Year
							</p>
							<p className="text-4xl font-black text-white tabular-nums tracking-tighter">
								{activeDataPoint.year}
							</p>
						</div>
						<div className="text-right">
							<p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">
								Total Generation
							</p>
							<p className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight">
								{numberFormatter(activeDataPoint.total)}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
						{energySources.map((source) => (
							<div key={source.name}>
								<p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">
									{source.name}
								</p>
								<div className="flex items-center gap-1.5 mt-0.5">
									<div
										className="w-1.5 h-1.5 rounded-full"
										style={{ backgroundColor: source.color }}
									/>
									<p className="text-sm font-bold text-slate-200 tabular-nums">
										{numberFormatter(
											activeDataPoint[source.key as keyof DataPoint] as number,
										)}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex-1 min-h-[250px] relative">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={transformedData}
							onMouseMove={handleMouseMove}
							onMouseLeave={() =>
								setActiveDataPoint(transformedData[transformedData.length - 1])
							}
							margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
						>
							<defs>
								<linearGradient id="colorRenewable" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
									<stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
								</linearGradient>
								<linearGradient id="colorFossil" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#64748b" stopOpacity={0.6} />
									<stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
								</linearGradient>
								<linearGradient id="colorNuclear" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#fb7185" stopOpacity={0.6} />
									<stop offset="95%" stopColor="#fb7185" stopOpacity={0.05} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f1f5f9"
							/>
							<XAxis
								dataKey="year"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 700, fill: "#cbd5e1" }}
								tickMargin={15}
								ticks={ticks}
								domain={["dataMin", "dataMax"]}
								type="number"
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 9, fontWeight: 600, fill: "#e2e8f0" }}
								tickFormatter={numberFormatter}
								width={40}
							/>

							<Tooltip content={<CustomTooltip />} cursor={false} />

							{activeDataPoint && (
								<ReferenceLine
									x={activeDataPoint.year}
									stroke="#f1f5f9"
									strokeWidth={2}
								/>
							)}

							<Area
								type="monotone"
								dataKey="Renewables"
								stackId="1"
								stroke="#10b981"
								fill="url(#colorRenewable)"
								strokeWidth={2}
								activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
								animationDuration={1000}
							/>
							<Area
								type="monotone"
								dataKey="Fossil Fuels"
								stackId="1"
								stroke="#475569"
								fill="url(#colorFossil)"
								strokeWidth={2}
								activeDot={{ r: 4, strokeWidth: 0, fill: "#475569" }}
								animationDuration={1000}
							/>
							<Area
								type="monotone"
								dataKey="Nuclear Energy"
								stackId="1"
								stroke="#e11d48"
								fill="url(#colorNuclear)"
								strokeWidth={2}
								activeDot={{ r: 4, strokeWidth: 0, fill: "#e11d48" }}
								animationDuration={1000}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
			<footer className="p-6 pt-0 flex justify-between items-center">
				<div className="flex gap-4">
					<span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
						EIA Open Data
					</span>
				</div>
				<div className="h-1 w-12 bg-slate-100 rounded-full" />
			</footer>
		</div>
	);
}
