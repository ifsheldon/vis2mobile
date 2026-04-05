"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// --- Inlined from lib/data.ts ---
interface RawDatum {
	yield: number;
	variety: string;
	year: number;
	site: string;
}

const rawData: RawDatum[] = [
	{ yield: 27, variety: "Manchuria", year: 1931, site: "University Farm" },
	{ yield: 48.86667, variety: "Manchuria", year: 1931, site: "Waseca" },
	{ yield: 27.43334, variety: "Manchuria", year: 1931, site: "Morris" },
	{ yield: 39.93333, variety: "Manchuria", year: 1931, site: "Crookston" },
	{ yield: 32.96667, variety: "Manchuria", year: 1931, site: "Grand Rapids" },
	{ yield: 28.96667, variety: "Manchuria", year: 1931, site: "Duluth" },
	{ yield: 43.06666, variety: "Glabron", year: 1931, site: "University Farm" },
	{ yield: 55.2, variety: "Glabron", year: 1931, site: "Waseca" },
	{ yield: 28.76667, variety: "Glabron", year: 1931, site: "Morris" },
	{ yield: 38.13333, variety: "Glabron", year: 1931, site: "Crookston" },
	{ yield: 29.13333, variety: "Glabron", year: 1931, site: "Grand Rapids" },
	{ yield: 29.66667, variety: "Glabron", year: 1931, site: "Duluth" },
	{ yield: 35.13333, variety: "Svansota", year: 1931, site: "University Farm" },
	{ yield: 47.33333, variety: "Svansota", year: 1931, site: "Waseca" },
	{ yield: 25.76667, variety: "Svansota", year: 1931, site: "Morris" },
	{ yield: 40.46667, variety: "Svansota", year: 1931, site: "Crookston" },
	{ yield: 29.66667, variety: "Svansota", year: 1931, site: "Grand Rapids" },
	{ yield: 25.7, variety: "Svansota", year: 1931, site: "Duluth" },
	{ yield: 39.9, variety: "Velvet", year: 1931, site: "University Farm" },
	{ yield: 50.23333, variety: "Velvet", year: 1931, site: "Waseca" },
	{ yield: 26.13333, variety: "Velvet", year: 1931, site: "Morris" },
	{ yield: 41.33333, variety: "Velvet", year: 1931, site: "Crookston" },
	{ yield: 23.03333, variety: "Velvet", year: 1931, site: "Grand Rapids" },
	{ yield: 26.3, variety: "Velvet", year: 1931, site: "Duluth" },
	{ yield: 36.56666, variety: "Trebi", year: 1931, site: "University Farm" },
	{ yield: 63.8333, variety: "Trebi", year: 1931, site: "Waseca" },
	{ yield: 43.76667, variety: "Trebi", year: 1931, site: "Morris" },
	{ yield: 46.93333, variety: "Trebi", year: 1931, site: "Crookston" },
	{ yield: 29.76667, variety: "Trebi", year: 1931, site: "Grand Rapids" },
	{ yield: 33.93333, variety: "Trebi", year: 1931, site: "Duluth" },
	{ yield: 32.73333, variety: "No. 457", year: 1931, site: "University Farm" },
	{ yield: 48.16667, variety: "No. 457", year: 1931, site: "Waseca" },
	{ yield: 28.23333, variety: "No. 457", year: 1931, site: "Morris" },
	{ yield: 40.23333, variety: "No. 457", year: 1931, site: "Crookston" },
	{ yield: 26.2, variety: "No. 457", year: 1931, site: "Grand Rapids" },
	{ yield: 30.46667, variety: "No. 457", year: 1931, site: "Duluth" },
	{ yield: 31.36667, variety: "No. 462", year: 1931, site: "University Farm" },
	{ yield: 48.56667, variety: "No. 462", year: 1931, site: "Waseca" },
	{ yield: 25.23333, variety: "No. 462", year: 1931, site: "Morris" },
	{ yield: 44.8, variety: "No. 462", year: 1931, site: "Crookston" },
	{ yield: 25.33333, variety: "No. 462", year: 1931, site: "Grand Rapids" },
	{ yield: 30.6, variety: "No. 462", year: 1931, site: "Duluth" },
	{ yield: 32.6, variety: "Peatland", year: 1931, site: "University Farm" },
	{ yield: 52.6, variety: "Peatland", year: 1931, site: "Waseca" },
	{ yield: 23.33333, variety: "Peatland", year: 1931, site: "Morris" },
	{ yield: 41.36667, variety: "Peatland", year: 1931, site: "Crookston" },
	{ yield: 31.36667, variety: "Peatland", year: 1931, site: "Grand Rapids" },
	{ yield: 32.3, variety: "Peatland", year: 1931, site: "Duluth" },
	{ yield: 39.3, variety: "No. 475", year: 1931, site: "University Farm" },
	{ yield: 44.23333, variety: "No. 475", year: 1931, site: "Waseca" },
	{ yield: 26.33333, variety: "No. 475", year: 1931, site: "Morris" },
	{ yield: 44.1, variety: "No. 475", year: 1931, site: "Crookston" },
	{ yield: 27.36667, variety: "No. 475", year: 1931, site: "Grand Rapids" },
	{ yield: 29.33333, variety: "No. 475", year: 1931, site: "Duluth" },
	{ yield: 26.96667, variety: "Wisconsin No. 38", year: 1931, site: "University Farm" },
	{ yield: 58.1, variety: "Wisconsin No. 38", year: 1931, site: "Waseca" },
	{ yield: 25.46667, variety: "Wisconsin No. 38", year: 1931, site: "Morris" },
	{ yield: 46.86667, variety: "Wisconsin No. 38", year: 1931, site: "Crookston" },
	{ yield: 29.66667, variety: "Wisconsin No. 38", year: 1931, site: "Grand Rapids" },
	{ yield: 25.73333, variety: "Wisconsin No. 38", year: 1931, site: "Duluth" },
	{ yield: 26.9, variety: "Manchuria", year: 1932, site: "University Farm" },
	{ yield: 33.46667, variety: "Manchuria", year: 1932, site: "Waseca" },
	{ yield: 34.36666, variety: "Manchuria", year: 1932, site: "Morris" },
	{ yield: 32.96667, variety: "Manchuria", year: 1932, site: "Crookston" },
	{ yield: 22.13333, variety: "Manchuria", year: 1932, site: "Grand Rapids" },
	{ yield: 22.56667, variety: "Manchuria", year: 1932, site: "Duluth" },
	{ yield: 36.8, variety: "Glabron", year: 1932, site: "University Farm" },
	{ yield: 37.73333, variety: "Glabron", year: 1932, site: "Waseca" },
	{ yield: 35.13333, variety: "Glabron", year: 1932, site: "Morris" },
	{ yield: 26.16667, variety: "Glabron", year: 1932, site: "Crookston" },
	{ yield: 14.43333, variety: "Glabron", year: 1932, site: "Grand Rapids" },
	{ yield: 25.86667, variety: "Glabron", year: 1932, site: "Duluth" },
	{ yield: 27.43334, variety: "Svansota", year: 1932, site: "University Farm" },
	{ yield: 38.5, variety: "Svansota", year: 1932, site: "Waseca" },
	{ yield: 35.03333, variety: "Svansota", year: 1932, site: "Morris" },
	{ yield: 20.63333, variety: "Svansota", year: 1932, site: "Crookston" },
	{ yield: 16.63333, variety: "Svansota", year: 1932, site: "Grand Rapids" },
	{ yield: 22.23333, variety: "Svansota", year: 1932, site: "Duluth" },
	{ yield: 26.8, variety: "Velvet", year: 1932, site: "University Farm" },
	{ yield: 37.4, variety: "Velvet", year: 1932, site: "Waseca" },
	{ yield: 38.83333, variety: "Velvet", year: 1932, site: "Morris" },
	{ yield: 32.03333, variety: "Velvet", year: 1932, site: "Crookston" },
	{ yield: 19.46667, variety: "Velvet", year: 1932, site: "Grand Rapids" },
	{ yield: 22.46667, variety: "Velvet", year: 1932, site: "Duluth" },
	{ yield: 29.06667, variety: "Trebi", year: 1932, site: "University Farm" },
	{ yield: 49.2333, variety: "Trebi", year: 1932, site: "Waseca" },
	{ yield: 46.63333, variety: "Trebi", year: 1932, site: "Morris" },
	{ yield: 41.83333, variety: "Trebi", year: 1932, site: "Crookston" },
	{ yield: 20.63333, variety: "Trebi", year: 1932, site: "Grand Rapids" },
	{ yield: 30.6, variety: "Trebi", year: 1932, site: "Duluth" },
	{ yield: 21.43333, variety: "No. 457", year: 1932, site: "University Farm" },
	{ yield: 44.43333, variety: "No. 457", year: 1932, site: "Waseca" },
	{ yield: 41.6, variety: "No. 457", year: 1932, site: "Morris" },
	{ yield: 29.53333, variety: "No. 457", year: 1932, site: "Crookston" },
	{ yield: 13.5, variety: "No. 457", year: 1932, site: "Grand Rapids" },
	{ yield: 22.66667, variety: "No. 457", year: 1932, site: "Duluth" },
	{ yield: 21, variety: "No. 462", year: 1932, site: "University Farm" },
	{ yield: 43.53333, variety: "No. 462", year: 1932, site: "Waseca" },
	{ yield: 39.7, variety: "No. 462", year: 1932, site: "Morris" },
	{ yield: 32.66667, variety: "No. 462", year: 1932, site: "Crookston" },
	{ yield: 19.46667, variety: "No. 462", year: 1932, site: "Grand Rapids" },
	{ yield: 22.5, variety: "No. 462", year: 1932, site: "Duluth" },
	{ yield: 25.23333, variety: "Peatland", year: 1932, site: "University Farm" },
	{ yield: 33.5, variety: "Peatland", year: 1932, site: "Waseca" },
	{ yield: 39.1, variety: "Peatland", year: 1932, site: "Morris" },
	{ yield: 36.9, variety: "Peatland", year: 1932, site: "Crookston" },
	{ yield: 17, variety: "Peatland", year: 1932, site: "Grand Rapids" },
	{ yield: 26.76667, variety: "Peatland", year: 1932, site: "Duluth" },
	{ yield: 30.6, variety: "No. 475", year: 1932, site: "University Farm" },
	{ yield: 33.33333, variety: "No. 475", year: 1932, site: "Waseca" },
	{ yield: 33.9, variety: "No. 475", year: 1932, site: "Morris" },
	{ yield: 30.43333, variety: "No. 475", year: 1932, site: "Crookston" },
	{ yield: 15.43333, variety: "No. 475", year: 1932, site: "Grand Rapids" },
	{ yield: 27.36667, variety: "No. 475", year: 1932, site: "Duluth" },
	{ yield: 21.36667, variety: "Wisconsin No. 38", year: 1932, site: "University Farm" },
	{ yield: 47.33333, variety: "Wisconsin No. 38", year: 1932, site: "Waseca" },
	{ yield: 38.16667, variety: "Wisconsin No. 38", year: 1932, site: "Morris" },
	{ yield: 35.13333, variety: "Wisconsin No. 38", year: 1932, site: "Crookston" },
	{ yield: 15.9, variety: "Wisconsin No. 38", year: 1932, site: "Grand Rapids" },
	{ yield: 29.33333, variety: "Wisconsin No. 38", year: 1932, site: "Duluth" },
];

interface ProcessedVariety {
	name: string;
	total: number;
	sites: { [siteName: string]: number };
}

function processData(): { data: ProcessedVariety[]; sites: string[] } {
	const varietiesMap: { [name: string]: ProcessedVariety } = {};
	const sitesSet = new Set<string>();

	rawData.forEach((d) => {
		if (!varietiesMap[d.variety]) {
			varietiesMap[d.variety] = { name: d.variety, total: 0, sites: {} };
		}
		if (!varietiesMap[d.variety].sites[d.site]) {
			varietiesMap[d.variety].sites[d.site] = 0;
		}
		varietiesMap[d.variety].sites[d.site] += d.yield;
		varietiesMap[d.variety].total += d.yield;
		sitesSet.add(d.site);
	});

	const data = Object.values(varietiesMap).sort((a, b) => b.total - a.total);
	return { data, sites: Array.from(sitesSet) };
}
// --- End inlined data ---

const SITE_COLORS: { [key: string]: string } = {
	"University Farm": "#4c78a8",
	Waseca: "#f58518",
	Morris: "#e45756",
	Crookston: "#72b7b2",
	"Grand Rapids": "#54a24b",
	Duluth: "#eeca3b",
};

const VarietyCard = ({
	variety,
	sites,
}: {
	variety: ProcessedVariety;
	sites: string[];
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const chartData = useMemo(() => {
		return [variety.sites];
	}, [variety]);

	const toggleExpand = () => setIsExpanded(!isExpanded);

	return (
		<div className="mb-4 overflow-hidden border border-zinc-200 shadow-sm rounded-xl bg-white">
			<button
				type="button"
				className="w-full p-4 flex flex-row items-center justify-between cursor-pointer bg-white/50 backdrop-blur-sm active:bg-zinc-100 transition-colors"
				onClick={toggleExpand}
			>
				<div className="flex flex-col">
					<h3 className="text-base font-bold text-zinc-800">{variety.name}</h3>
					<span className="text-xs font-medium text-zinc-500">
						Total Yield: {variety.total.toFixed(1)}
					</span>
				</div>
				<div className="flex items-center space-x-2">
					{isExpanded ? (
						<ChevronUp className="w-5 h-5 text-zinc-400" />
					) : (
						<ChevronDown className="w-5 h-5 text-zinc-400" />
					)}
				</div>
			</button>
			<div className="p-4 pt-0">
				<div className="h-12 w-full mt-2 min-h-[48px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							layout="vertical"
							data={chartData}
							margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
						>
							<XAxis type="number" hide domain={[0, 450]} />
							<YAxis type="category" hide />
							{sites.map((site) => (
								<Bar
									key={site}
									dataKey={site}
									stackId="a"
									fill={SITE_COLORS[site]}
									isAnimationActive={false}
								/>
							))}
						</BarChart>
					</ResponsiveContainer>
				</div>

				{isExpanded && (
					<div className="mt-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
						{sites.map((site) => (
							<div
								key={site}
								className="flex items-center space-x-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100"
							>
								<div
									className="w-2.5 h-2.5 rounded-full flex-shrink-0"
									style={{ backgroundColor: SITE_COLORS[site] }}
								/>
								<div className="flex flex-col min-w-0">
									<span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 truncate leading-tight">
										{site}
									</span>
									<span className="text-sm font-bold text-zinc-700">
										{variety.sites[site]?.toFixed(1) || 0}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export function Visualization() {
	const { data, sites } = useMemo(() => processData(), []);

	return (
		<div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
			{/* Header & Sticky Legend */}
			<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-zinc-200 p-5 shadow-sm">
				<div className="mb-4">
					<h1 className="text-xl font-black text-zinc-900 leading-tight">
						Barley Varieties
					</h1>
					<p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
						Yield Analysis by Site
					</p>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					{sites.map((site) => (
						<div key={site} className="flex items-center space-x-1.5">
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: SITE_COLORS[site] }}
							/>
							<span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">
								{site}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Scrollable List */}
			<div className="flex-1 overflow-y-auto p-4 pb-24">
				{data.map((variety) => (
					<VarietyCard key={variety.name} variety={variety} sites={sites} />
				))}
			</div>
		</div>
	);
}
