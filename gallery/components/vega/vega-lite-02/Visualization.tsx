"use client";

import { ChevronRight, Info, Weight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PenguinStat {
	species: string;
	min: number;
	max: number;
	median: number;
	q1: number;
	q3: number;
	count: number;
	color: string;
}

const PENGUIN_STATS: PenguinStat[] = [
	{
		species: "Adelie",
		min: 2850,
		max: 4775,
		median: 3700,
		q1: 3350,
		q3: 4000,
		count: 151,
		color: "#3b82f6", // Blue
	},
	{
		species: "Chinstrap",
		min: 2700,
		max: 4800,
		median: 3700,
		q1: 3462.5,
		q3: 3950,
		count: 68,
		color: "#f97316", // Orange
	},
	{
		species: "Gentoo",
		min: 3950,
		max: 6300,
		median: 5000,
		q1: 4700,
		q3: 5500,
		count: 123,
		color: "#ef4444", // Red
	},
];

export function Visualization() {
	const [selectedSpecies, setSelectedSpecies] = useState<string>("Gentoo");

	const minVal = 2500;
	const maxVal = 6500;
	const range = maxVal - minVal;

	const getX = (val: number) => ((val - minVal) / range) * 100;

	const activeStat =
		PENGUIN_STATS.find((s) => s.species === selectedSpecies) ||
		PENGUIN_STATS[0];

	return (
		<div className="flex flex-col h-full bg-zinc-50 font-sans select-none overflow-hidden">
			{/* Header */}
			<header className="px-6 pt-10 pb-4">
				<div className="flex items-center gap-2.5 mb-2">
					<div className="p-2 bg-blue-600 rounded-xl shadow-sm shadow-blue-200">
						<Weight className="w-5 h-5 text-white" />
					</div>
					<h1 className="text-2xl font-black text-zinc-900 tracking-tight">
						Penguin Body Mass
					</h1>
				</div>
				<p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[280px]">
					Distribution of weight (g) across Palmer Archipelago species.
				</p>
			</header>

			{/* Insight Card */}
			<div className="mx-6 mb-6">
				<div className="relative overflow-hidden p-4 bg-white rounded-2xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
					<div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
					<div className="flex items-start gap-3">
						<div className="mt-0.5 p-1 bg-blue-50 rounded-lg">
							<Info className="w-4 h-4 text-blue-600" />
						</div>
						<p className="text-sm text-zinc-600 leading-snug">
							<span className="text-zinc-900 font-bold">Key Insight:</span>{" "}
							Gentoo penguins are significantly heavier, with medians often
							exceeding 5kg.
						</p>
					</div>
				</div>
			</div>

			{/* Main Chart Area */}
			<div className="flex-1 px-6">
				<div className="relative h-full flex flex-col justify-around py-6">
					{/* Vertical Gridlines */}
					<div className="absolute inset-0 pointer-events-none mb-6">
						{[2500, 3500, 4500, 5500, 6500].map((tick) => (
							<div
								key={tick}
								className="absolute top-0 bottom-0 border-l border-zinc-200/80 border-dashed"
								style={{ left: `${getX(tick)}%` }}
							>
								<span className="absolute -bottom-6 left-0 -translate-x-1/2 text-[11px] font-bold text-zinc-400 tabular-nums">
									{tick >= 1000 ? `${tick / 1000}k` : tick}
								</span>
							</div>
						))}
					</div>

					{/* Species Tracks */}
					<div className="flex flex-col gap-4">
						{PENGUIN_STATS.map((stat) => (
							<button
								type="button"
								key={stat.species}
								className={cn(
									"relative h-20 w-full flex items-center transition-all duration-300 rounded-2xl px-3 cursor-pointer outline-none",
									selectedSpecies === stat.species
										? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-200 scale-[1.02] z-10"
										: "hover:bg-zinc-100/80 opacity-70 grayscale-[0.2]",
								)}
								onClick={() => setSelectedSpecies(stat.species)}
							>
								<div className="absolute top-2.5 left-3 text-[12px] font-black text-zinc-800 uppercase tracking-widest">
									{stat.species}
								</div>

								{/* Box Plot SVG */}
								<div className="w-full h-10 relative mt-4 pointer-events-none">
									<svg
										width="100%"
										height="100%"
										className="overflow-visible"
										role="img"
									>
										<title>{`Box plot for ${stat.species}`}</title>
										{/* Whisker Line (Full Range) */}
										<line
											x1={`${getX(stat.min)}%`}
											y1="50%"
											x2={`${getX(stat.max)}%`}
											y2="50%"
											stroke={stat.color}
											strokeWidth="2"
											strokeLinecap="round"
											strokeDasharray="2,3"
										/>

										{/* Min/Max Ticks */}
										<line
											x1={`${getX(stat.min)}%`}
											y1="30%"
											x2={`${getX(stat.min)}%`}
											y2="70%"
											stroke={stat.color}
											strokeWidth="2.5"
											strokeLinecap="round"
										/>
										<line
											x1={`${getX(stat.max)}%`}
											y1="30%"
											x2={`${getX(stat.max)}%`}
											y2="70%"
											stroke={stat.color}
											strokeWidth="2.5"
											strokeLinecap="round"
										/>

										{/* IQR Box */}
										<rect
											x={`${getX(stat.q1)}%`}
											y="15%"
											width={`${getX(stat.q3) - getX(stat.q1)}%`}
											height="70%"
											fill={stat.color}
											fillOpacity={selectedSpecies === stat.species ? 0.4 : 0.2}
											stroke={stat.color}
											strokeWidth="2"
											rx="6"
										/>

										{/* Median Line */}
										<line
											x1={`${getX(stat.median)}%`}
											y1="10%"
											x2={`${getX(stat.median)}%`}
											y2="90%"
											stroke={stat.color}
											strokeWidth="4"
											strokeLinecap="round"
										/>
									</svg>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Details Panel */}
			<div className="bg-white border-t border-zinc-100 px-6 pt-8 pb-12 rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div
							className="w-4 h-4 rounded-full ring-4 ring-zinc-50"
							style={{ backgroundColor: activeStat.color }}
						/>
						<h2 className="text-2xl font-black text-zinc-900">
							{activeStat.species}
						</h2>
					</div>
					<span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
						{activeStat.count} samples
					</span>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100/50">
						<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
							Median
						</p>
						<p className="text-2xl font-black text-zinc-900 tabular-nums">
							{activeStat.median}
							<span className="text-sm font-bold text-zinc-400 ml-1">g</span>
						</p>
					</div>
					<div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100/50">
						<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
							IQR
						</p>
						<p className="text-lg font-black text-zinc-900 tabular-nums leading-none mt-1">
							{activeStat.q1} - {activeStat.q3}
							<span className="text-xs font-bold text-zinc-400 ml-1">g</span>
						</p>
					</div>
					<div className="col-span-2 bg-zinc-900 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-zinc-200">
						<div>
							<p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
								Full Range (Min - Max)
							</p>
							<p className="text-base font-bold text-white tabular-nums">
								{activeStat.min}g <span className="text-zinc-500 mx-2">to</span>{" "}
								{activeStat.max}g
							</p>
						</div>
						<div className="p-2 bg-white/10 rounded-xl">
							<ChevronRight className="w-5 h-5 text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
