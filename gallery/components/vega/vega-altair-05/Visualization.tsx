"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	type ProcessedDataPoint,
	processBarleyData,
	siteColors,
	sites,
} from "@/components/vega/vega-altair-05/data";

const chartData = processBarleyData();

interface BarClickData {
	payload: ProcessedDataPoint;
}

export function Visualization() {
	const [activeYear, setActiveYear] = useState<"1931" | "1932">("1931");
	const [selectedVariety, setSelectedVariety] =
		useState<ProcessedDataPoint | null>(null);

	const data = chartData[activeYear];

	const handleBarClick = (barData: BarClickData) => {
		setSelectedVariety(barData.payload);
	};

	return (
		<div className="w-full h-full bg-zinc-900 text-white p-4 pt-12 flex flex-col relative overflow-hidden">
			<div className="flex-shrink-0">
				<h1 className="text-xl font-bold text-center">Barley Yield Analysis</h1>
				<div className="flex justify-center my-4">
					<ToggleGroup.Root
						type="single"
						value={activeYear}
						onValueChange={(value: "1931" | "1932") => {
							if (value) setActiveYear(value);
						}}
						className="inline-flex bg-zinc-800 rounded-md p-1"
					>
						<ToggleGroup.Item
							value="1931"
							className="px-4 py-1 rounded-md text-sm data-[state=on]:bg-zinc-600"
						>
							1931
						</ToggleGroup.Item>
						<ToggleGroup.Item
							value="1932"
							className="px-4 py-1 rounded-md text-sm data-[state=on]:bg-zinc-600"
						>
							1932
						</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
			</div>

			<div className="flex-grow w-full h-64">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
						onClick={(e) => {
							if (!e) setSelectedVariety(null);
						}}
					>
						<XAxis
							type="number"
							tick={{ fill: "#a1a1aa" }}
							tickLine={{ stroke: "#a1a1aa" }}
							axisLine={{ stroke: "#a1a1aa" }}
						/>
						<YAxis
							type="category"
							dataKey="variety"
							tick={{ fill: "#a1a1aa", fontSize: 12 }}
							tickLine={{ stroke: "#a1a1aa" }}
							axisLine={{ stroke: "#a1a1aa" }}
						/>
						<Tooltip
							cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
							contentStyle={{
								backgroundColor: "#27272a",
								border: "1px solid #3f3f46",
							}}
						/>
						{sites.map((site, index) => (
							<Bar
								key={site}
								dataKey={site}
								stackId="a"
								fill={siteColors[site]}
								onClick={handleBarClick}
								isAnimationActive={true}
							>
								{data.map((entry, entryIndex) => (
									<Cell
										key={`cell-${entry.variety}-${entryIndex}`}
										opacity={
											selectedVariety === null ||
											selectedVariety.variety === entry.variety
												? 1
												: 0.3
										}
										radius={
											index === sites.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]
										}
										className="transition-opacity duration-300"
									/>
								))}
							</Bar>
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="flex-shrink-0 mt-4 mb-8">
				<div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
					{sites.map((site) => (
						<div key={site} className="flex items-center text-xs">
							<div
								className="w-3 h-3 rounded-full mr-2"
								style={{ backgroundColor: siteColors[site] }}
							/>
							{site}
						</div>
					))}
				</div>
			</div>

			<AnimatePresence>
				{selectedVariety && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/40 z-10"
							onClick={() => setSelectedVariety(null)}
						/>
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute bottom-0 left-0 right-0 bg-zinc-800 p-6 rounded-t-2xl shadow-2xl z-20 border-t border-zinc-700"
						>
							<div className="w-12 h-1.5 bg-zinc-600 rounded-full mx-auto mb-6" />
							<div className="flex justify-between items-start mb-4">
								<h3 className="text-xl font-bold text-white">
									{selectedVariety.variety}
								</h3>
								<button
									type="button"
									onClick={() => setSelectedVariety(null)}
									className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors"
								>
									Close
								</button>
							</div>
							<div className="grid grid-cols-1 gap-3">
								{sites
									.map((site) => ({
										site,
										yield: selectedVariety[
											site as keyof ProcessedDataPoint
										] as number,
									}))
									.sort((a, b) => b.yield - a.yield)
									.map(({ site, yield: yieldValue }) => (
										<div
											key={site}
											className="flex justify-between items-center bg-zinc-700/50 p-3 rounded-lg"
										>
											<div className="flex items-center">
												<div
													className="w-3 h-3 rounded-full mr-3"
													style={{ backgroundColor: siteColors[site] }}
												/>
												<span className="text-zinc-200">{site}</span>
											</div>
											<span className="font-mono font-bold text-lg text-white">
												{yieldValue.toFixed(2)}
											</span>
										</div>
									))}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
