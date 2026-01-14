"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Pyramid } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";

const data = [
	{ name: "Shady side of a pyramid", value: 10, color: "#674028" },
	{ name: "Sunny side of a pyramid", value: 15, color: "#DEAC58" },
	{ name: "Sky", value: 75, color: "#416D9D" },
];

interface ActiveShapeProps {
	cx: number;
	cy: number;
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
	fill: string;
}

const renderActiveShape = (props: unknown) => {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
		props as ActiveShapeProps;

	return (
		<g>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 8}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
			/>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={outerRadius + 12}
				outerRadius={outerRadius + 15}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				opacity={0.3}
			/>
		</g>
	);
};

export function Visualization() {
	const [activeIndex, setActiveIndex] = useState(2); // Default to Sky
	const total = useMemo(
		() => data.reduce((sum, item) => sum + item.value, 0),
		[],
	);

	const activeItem = data[activeIndex];
	const activePercent = Math.round((activeItem.value / total) * 100);

	return (
		<div className="h-full w-full overflow-y-auto bg-[#f8f9fa] px-5 pb-10 pt-8 text-slate-900">
			<div className="mx-auto flex max-w-md flex-col gap-6">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DEAC58]/20 text-[#674028] shadow-sm">
							<Pyramid size={24} />
						</span>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#674028]/60 leading-none mb-1">
								Visual Pun
							</p>
							<h1 className="text-xl font-black text-slate-900 leading-tight">
								Pyramid View
							</h1>
						</div>
					</div>
					<button
						type="button"
						className="text-slate-400 hover:text-slate-600 transition-colors"
					>
						<Info size={20} />
					</button>
				</header>

				<section className="relative overflow-hidden rounded-[40px] bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
					<div className="relative h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									activeIndex={activeIndex}
									activeShape={renderActiveShape}
									data={data}
									cx="50%"
									cy="50%"
									innerRadius={75}
									outerRadius={105}
									dataKey="value"
									onClick={(_, index) => setActiveIndex(index)}
									onMouseEnter={(_, index) => setActiveIndex(index)}
									startAngle={-45} // Corresponds to Vega-Lite 135 deg (bottom-right)
									endAngle={-405} // Full circle clockwise
									stroke="none"
									paddingAngle={2}
									animationBegin={0}
									animationDuration={800}
								>
									{data.map((entry) => (
										<Cell
											key={`cell-${entry.name}`}
											fill={entry.color}
											className="cursor-pointer outline-none"
										/>
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>

						<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeIndex}
									initial={{ opacity: 0, scale: 0.8, y: 10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 1.1, y: -10 }}
									transition={{ duration: 0.2 }}
									className="px-10"
								>
									<p className="text-5xl font-black text-slate-900 leading-none">
										{activePercent}%
									</p>
									<p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight max-w-[120px] mx-auto">
										{activeItem.name}
									</p>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>

					<div className="mt-2 flex justify-center gap-2 pb-4">
						{data.map((item, index) => (
							<div
								key={`dot-${item.name}`}
								className={`h-1.5 rounded-full transition-all duration-300 ${
									index === activeIndex
										? "w-8 bg-slate-800"
										: "w-1.5 bg-slate-200"
								}`}
							/>
						))}
					</div>
				</section>

				<section className="space-y-3">
					<h2 className="px-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
						Composition Details
					</h2>
					<div className="grid gap-3">
						{data.map((item, index) => {
							const isActive = index === activeIndex;
							return (
								<motion.button
									key={item.name}
									whileTap={{ scale: 0.98 }}
									onClick={() => setActiveIndex(index)}
									className={`relative flex items-center justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all ${
										isActive
											? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200"
											: "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
									}`}
								>
									<div className="flex items-center gap-3">
										<div
											className="h-4 w-4 rounded-full shadow-inner"
											style={{
												backgroundColor: item.color,
												border: isActive ? "2px solid white" : "none",
											}}
										/>
										<span className="text-sm font-bold tracking-tight">
											{item.name}
										</span>
									</div>
									<span
										className={`text-sm font-black ${
											isActive ? "text-white" : "text-slate-900"
										}`}
									>
										{Math.round((item.value / total) * 100)}%
									</span>
								</motion.button>
							);
						})}
					</div>
				</section>
			</div>
		</div>
	);
}
