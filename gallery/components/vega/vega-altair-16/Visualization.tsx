"use client";

import { max } from "d3-array";
import { scaleLinear, scaleSqrt } from "d3-scale";
import {
	Activity,
	ArrowDownWideNarrow,
	CloudLightning,
	Flame,
	HelpCircle,
	Mountain,
	Skull,
	Sun,
	Thermometer,
	Waves,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	type DisasterData,
	disasterData,
	sortedEntities,
} from "@/components/vega/vega-altair-16/disaster-data";
import { cn } from "@/lib/utils";

// --- Configuration ---
const YEAR_start = 1900;
const YEAR_end = 2017;
const PIXELS_PER_YEAR = 12; // Adjust for vertical density
const TOTAL_HEIGHT = (YEAR_end - YEAR_start) * PIXELS_PER_YEAR + 100; // + padding

// --- Icon Mapping ---
const ENTITY_CONFIG: Record<
	string,
	{ icon: React.ElementType; color: string; label: string }
> = {
	Drought: { icon: Sun, color: "text-amber-500", label: "Drought" },
	Epidemic: { icon: Skull, color: "text-purple-500", label: "Epidemic" },
	Flood: { icon: Waves, color: "text-blue-500", label: "Flood" },
	Earthquake: { icon: Activity, color: "text-amber-700", label: "Earthquake" },
	"Extreme weather": {
		icon: CloudLightning,
		color: "text-slate-500",
		label: "Storm",
	},
	"Extreme temperature": {
		icon: Thermometer,
		color: "text-red-500",
		label: "Temp",
	},
	"Volcanic activity": {
		icon: Mountain,
		color: "text-orange-600",
		label: "Volcano",
	},
	Landslide: {
		icon: ArrowDownWideNarrow,
		color: "text-stone-600",
		label: "Landslide",
	},
	"Mass movement (dry)": {
		icon: ArrowDownWideNarrow,
		color: "text-stone-400",
		label: "Dry Mass",
	},
	Wildfire: { icon: Flame, color: "text-orange-500", label: "Wildfire" },
};

export function Visualization() {
	const [selectedEvent, setSelectedEvent] = useState<DisasterData | null>(null);

	// --- Scales ---
	const yScale = useMemo(
		() =>
			scaleLinear()
				.domain([YEAR_start, YEAR_end])
				.range([0, TOTAL_HEIGHT - 100]), // Leave some bottom padding
		[],
	);

	const rScale = useMemo(() => {
		const maxDeaths = max(disasterData, (d) => d.Deaths) || 0;
		return scaleSqrt().domain([0, maxDeaths]).range([2, 16]); // Max radius 16px (32px width) fits in ~36px col
	}, []);

	// --- Formatters ---
	const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

	// --- Interaction ---
	const handleEventClick = (event: DisasterData) => {
		setSelectedEvent(event);
	};

	return (
		<div className="relative w-full h-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex flex-col font-sans">
			{/* --- Sticky Header --- */}
			<div className="flex-none h-14 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700 z-20 flex items-center px-2 shadow-sm">
				{/* Year Label Spacer */}
				<div className="w-8 flex-none text-xs font-bold text-zinc-400 text-center">
					Year
				</div>
				{/* Entity Icons */}
				<div className="flex-1 flex justify-between items-center px-1">
					{sortedEntities.map((entity) => {
						const config = ENTITY_CONFIG[entity] || {
							icon: HelpCircle,
							color: "text-gray-400",
							label: entity.substring(0, 2),
						};
						const Icon = config.icon;
						return (
							<div
								key={entity}
								className="flex flex-col items-center justify-center w-full"
								title={entity}
							>
								<Icon className={cn("w-5 h-5", config.color)} strokeWidth={2} />
								<span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[32px] mt-0.5">
									{config.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* --- Scrollable Timeline --- */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden relative">
				<div
					className="relative w-full"
					style={{ height: `${TOTAL_HEIGHT}px` }}
				>
					{/* Grid Lines & Year Markers */}
					{scaleLinear()
						.domain([YEAR_start, YEAR_end])
						.ticks(10)
						.map((year) => (
							<div
								key={year}
								className="absolute w-full border-t border-zinc-200 dark:border-zinc-800 flex items-center"
								style={{ top: yScale(year) }}
							>
								<span className="w-8 text-[10px] text-zinc-400 font-mono text-center -mt-2 bg-zinc-50 dark:bg-zinc-900 px-1">
									{year}
								</span>
							</div>
						))}

					{/* Swimlane Guidelines (Vertical) */}
					<div className="absolute inset-0 left-8 flex justify-between pointer-events-none">
						{sortedEntities.map((entity) => (
							<div
								key={entity}
								className="w-px h-full bg-zinc-100 dark:bg-zinc-800/50"
							/>
						))}
					</div>

					{/* Data Bubbles */}
					<div className="absolute inset-0 left-8 flex justify-between px-1">
						{sortedEntities.map((entity) => {
							const entityData = disasterData.filter(
								(d) => d.Entity === entity,
							);
							const config = ENTITY_CONFIG[entity];

							return (
								<div key={entity} className="relative w-full h-full">
									{entityData.map((d, i) => {
										const radius = rScale(d.Deaths);
										const top = yScale(d.Year);
										const isSelected =
											selectedEvent &&
											selectedEvent.Entity === d.Entity &&
											selectedEvent.Year === d.Year;

										const key = `${d.Entity}-${d.Year}-${d.Deaths}-${i}`;

										return (
											<button
												key={key}
												type="button"
												onClick={() => handleEventClick(d)}
												className={cn(
													"absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 border border-white/50 dark:border-black/20 shadow-sm hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 z-10",
													config?.color.replace("text-", "bg-"), // Use background color derived from text color class
													isSelected
														? "ring-2 ring-black dark:ring-white scale-110 z-20"
														: "opacity-80 hover:opacity-100",
												)}
												style={{
													top: top,
													left: "50%",
													width: radius * 2,
													height: radius * 2,
												}}
												aria-label={`${d.Entity} in ${d.Year}: ${formatNumber(d.Deaths)} deaths`}
											/>
										);
									})}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* --- Detail Bottom Sheet --- */}
			{selectedEvent && (
				<div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 z-30 animate-in slide-in-from-bottom-10 fade-in-0 duration-300">
					<button
						type="button"
						onClick={() => setSelectedEvent(null)}
						className="absolute top-2 right-2 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						<X className="w-4 h-4" />
					</button>
					<div className="flex items-start gap-4 pr-6">
						<div
							className={cn(
								"p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800",
								ENTITY_CONFIG[selectedEvent.Entity]?.color,
							)}
						>
							{(() => {
								const Icon =
									ENTITY_CONFIG[selectedEvent.Entity]?.icon || HelpCircle;
								return <Icon className="w-6 h-6" />;
							})()}
						</div>
						<div>
							<h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg leading-tight">
								{selectedEvent.Entity}
							</h3>
							<p className="text-zinc-500 text-sm font-medium mt-0.5">
								Year {selectedEvent.Year}
							</p>
							<div className="mt-2 flex items-baseline gap-1.5">
								<span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
									{formatNumber(selectedEvent.Deaths)}
								</span>
								<span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
									Deaths
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
