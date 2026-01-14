"use client";

import { type ClassValue, clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { processData } from "@/components/vega/vega-altair-17/data";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function Visualization() {
	const { sites, globalMin, globalMax, processedData } = useMemo(
		() => processData(),
		[],
	);

	const [activeSiteIndex, setActiveSiteIndex] = useState(0);
	// Find the active site object from processedData based on the sorted sites array
	const activeSiteName = sites[activeSiteIndex];
	const activeSite = processedData.find((s) => s.site === activeSiteName);

	if (!activeSite) {
		return <div>Loading...</div>;
	}

	// Helper for linear scale
	const getX = (val: number) => {
		const range = globalMax - globalMin;
		const percent = (val - globalMin) / range;
		return percent * 100; // Return percentage
	};

	return (
		<div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
			{/* Header & Tabs */}
			<div className="flex-none pt-4 pb-2 px-4 bg-zinc-950/95 backdrop-blur-sm z-10 border-b border-zinc-800">
				<h1 className="text-lg font-bold mb-4 text-zinc-50 tracking-tight">
					Barley Yields{" "}
					<span className="text-zinc-500 font-normal text-sm ml-2">
						1931 vs 1932
					</span>
				</h1>

				{/* Site Tabs */}
				<div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
					{sites.map((site, idx) => (
						<button
							type="button"
							key={site}
							onClick={() => setActiveSiteIndex(idx)}
							className={cn(
								"px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 border",
								activeSiteIndex === idx
									? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-sm"
									: "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200",
							)}
						>
							{site}
						</button>
					))}
				</div>
			</div>

			{/* Main Chart Area */}
			<div className="flex-1 overflow-y-auto px-4 py-6 relative">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeSite.site}
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="space-y-7"
					>
						{activeSite.varieties.map((variety) => (
							<div key={variety.variety} className="relative group">
								{/* Label Row */}
								<div className="flex justify-between items-baseline mb-3">
									<span className="font-semibold text-zinc-200 text-sm tracking-wide">
										{variety.variety}
									</span>
									<div className="text-xs space-x-3 font-mono">
										<span className="text-amber-500 font-medium">
											{variety.yield1931.toFixed(1)}
										</span>
										<span className="text-zinc-600">|</span>
										<span className="text-indigo-400 font-medium">
											{variety.yield1932.toFixed(1)}
										</span>
									</div>
								</div>

								{/* Dumbbell Chart Row */}
								<div className="h-6 relative w-full">
									{/* Grid Lines / Axis (Background) */}
									<div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-800 w-full" />

									{/* Connector Line */}
									<div
										className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-zinc-700/60 rounded-full transition-all duration-500"
										style={{
											left: `${Math.min(getX(variety.yield1931), getX(variety.yield1932))}%`,
											width: `${Math.abs(getX(variety.yield1931) - getX(variety.yield1932))}%`,
										}}
									/>

									{/* 1931 Dot (Amber) */}
									<div
										className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-zinc-950 shadow-sm z-10 transition-all duration-500"
										style={{
											left: `calc(${getX(variety.yield1931)}% - 7px)`,
										}}
									/>

									{/* 1932 Dot (Indigo) */}
									<div
										className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-zinc-950 shadow-sm z-10 transition-all duration-500"
										style={{
											left: `calc(${getX(variety.yield1932)}% - 7px)`,
										}}
									/>
								</div>
							</div>
						))}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Footer / Legend / Axis */}
			<div className="flex-none bg-zinc-950 border-t border-zinc-800 p-4 pb-8 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] z-20">
				{/* X-Axis Scale */}
				<div className="relative h-8 mb-3">
					{/* Ticks */}
					{[20, 30, 40, 50, 60, 70].map((val) => {
						const pos = getX(val);
						if (pos < 0 || pos > 100) return null;
						return (
							<div
								key={val}
								className="absolute top-0 flex flex-col items-center transition-all duration-500"
								style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
							>
								<div className="h-2 w-px bg-zinc-700 mb-1" />
								<span className="text-[11px] text-zinc-500 font-medium">
									{val}
								</span>
							</div>
						);
					})}
					<div className="absolute bottom-0 w-full text-center text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">
						Yield (Bushels/Acre)
					</div>
				</div>

				{/* Legend */}
				<div className="flex items-center justify-center space-x-8 pt-2">
					<div className="flex items-center space-x-2.5 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
						<div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
						<span className="text-xs text-zinc-300 font-medium">1931</span>
					</div>
					<div className="flex items-center space-x-2.5 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
						<div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
						<span className="text-xs text-zinc-300 font-medium">1932</span>
					</div>
				</div>
			</div>
		</div>
	);
}
