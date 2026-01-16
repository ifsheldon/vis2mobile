"use client";

import { useState } from "react";
import { frenchElectionData, type RegionData } from "./french-election-data";

const CANDIDATE_COLORS: Record<string, string> = {
	"Candidate A": "#8fbcef",
	"Candidate B": "#f9ad8f",
	"Candidate C": "#1f77b4",
	"Candidate D": "#7c4ba5",
	"Candidate E": "#e2de83",
};

export function FrenchElectionChart() {
	const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

	// Filter regions that have narrative labels for the "Stories" section
	const stories = frenchElectionData.filter((d) => d.label);

	return (
		<div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-950 w-full max-w-md mx-auto h-full overflow-y-auto">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
					French Election Results
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Tap map regions for details.
				</p>
			</div>

			{/* Map */}
			<div className="relative w-full">
				{/* Aspect ratio can be handled by viewBox scaling naturally in flex/block or explicit aspect-ratio class */}
				<div className="w-full aspect-[1.13]">
					{" "}
					{/* 1060/936 ~= 1.13 */}
					<svg
						viewBox="0 0 1060 936"
						className="w-full h-full drop-shadow-sm"
						style={{ touchAction: "manipulation" }}
					>
						<title>French election map</title>
						{frenchElectionData.map((region) => {
							const isSelected = selectedRegion?.id === region.id;
							const fill = CANDIDATE_COLORS[region.winner] || "#ccc";

							return (
								// biome-ignore lint/a11y/useSemanticElements: svg paths need explicit interaction handling.
								<path
									key={region.id}
									d={region.path}
									fill={fill}
									stroke={isSelected ? "#000" : "white"}
									strokeWidth={isSelected ? 3 : 0.5}
									className="transition-all duration-200 cursor-pointer hover:opacity-90 active:opacity-100"
									onClick={() => setSelectedRegion(region)}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											setSelectedRegion(region);
										}
									}}
									role="button"
									tabIndex={0}
									style={{
										opacity: selectedRegion ? (isSelected ? 1 : 0.6) : 1,
									}}
								/>
							);
						})}
					</svg>
				</div>

				{/* Floating Tooltip/Legend for Selected Region */}
				{selectedRegion && (
					<div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all animate-in fade-in slide-in-from-bottom-2">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
									{selectedRegion.name}
								</h3>
								<div className="flex items-center gap-2 mt-1">
									<div
										className="w-3 h-3 rounded-full"
										style={{
											backgroundColor: CANDIDATE_COLORS[selectedRegion.winner],
										}}
									/>
									<span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
										{selectedRegion.winner}
									</span>
								</div>
								<p className="text-xs text-zinc-500 mt-1">
									Pop: {selectedRegion.population.toLocaleString()}
								</p>
							</div>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setSelectedRegion(null);
								}}
								className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
							>
								✕
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Stories / Annotations */}
			<div className="space-y-3 mt-2">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
					Key Insights
				</h3>
				{stories.map((story) => (
					<button
						key={story.id}
						type="button"
						onClick={() => {
							setSelectedRegion(story);
							// Ideally scroll map into view if needed
						}}
						className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
							selectedRegion?.id === story.id
								? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
								: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
						}`}
					>
						<div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
							{story.name}
						</div>
						<div className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
							{story.label?.replace(/<[^>]*>/g, "")}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
