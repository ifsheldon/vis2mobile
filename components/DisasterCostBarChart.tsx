"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Data extracted and transformed from cost-desktop.html
// "highlighted" means labeled=true (Crimson), "normal" means labeled=false (Gray)
const RAW_DATA = [
	{ year: 1980, cost: 40, labeled: false },
	{ year: 1981, cost: 5, labeled: false },
	{ year: 1982, cost: 25, labeled: false },
	{ year: 1983, cost: 35, labeled: false },
	{ year: 1984, cost: 10, labeled: false },
	{ year: 1985, cost: 25, labeled: false },
	{ year: 1986, cost: 15, labeled: false },
	{ year: 1987, cost: 0, labeled: false },
	{ year: 1988, cost: 45, labeled: false },
	{ year: 1989, cost: 35, labeled: false },
	{ year: 1990, cost: 20, labeled: false },
	{ year: 1991, cost: 30, labeled: false },
	{ year: 1992, cost: 60, labeled: false },
	{ year: 1993, cost: 50, labeled: false },
	{ year: 1994, cost: 20, labeled: false },
	{ year: 1995, cost: 25, labeled: false },
	{ year: 1996, cost: 20, labeled: false },
	{ year: 1997, cost: 15, labeled: false },
	{ year: 1998, cost: 35, labeled: false },
	{ year: 1999, cost: 30, labeled: false },
	{ year: 2000, cost: 20, labeled: false },
	{ year: 2001, cost: 30, labeled: false },
	{ year: 2002, cost: 25, labeled: false },
	{ year: 2003, cost: 35, labeled: false },
	{ year: 2004, cost: 75, labeled: false },
	{ year: 2005, cost: 161, labeled: true, label: "Hurricane Katrina" },
	{ year: 2005, cost: 60, labeled: false },
	{ year: 2006, cost: 30, labeled: false },
	{ year: 2007, cost: 25, labeled: false },
	{ year: 2008, cost: 75, labeled: false },
	{ year: 2009, cost: 25, labeled: false },
	{ year: 2010, cost: 25, labeled: false },
	{ year: 2011, cost: 75, labeled: false },
	{ year: 2012, cost: 125, labeled: false },
	{ year: 2013, cost: 40, labeled: false },
	{ year: 2014, cost: 30, labeled: false },
	{ year: 2015, cost: 40, labeled: false },
	{ year: 2016, cost: 45, labeled: false },
	{ year: 2017, cost: 125, labeled: true, label: "Hurricane Harvey" },
	{ year: 2017, cost: 90, labeled: true, label: "Hurricane Maria" },
	{ year: 2017, cost: 50, labeled: true, label: "Hurricane Irma" },
	{ year: 2017, cost: 18, labeled: true, label: "California wildfires" },
	{ year: 2017, cost: 25, labeled: false },
];

interface TransformedDataPoint {
	year: string;
	normalCost: number;
	highlightedCost: number;
	highlightEvents: { name: string; cost: number }[];
	totalCost: number;
}

// Group by year and aggregate
const calculateData = (): TransformedDataPoint[] => {
	const map = new Map<number, TransformedDataPoint>();

	// Initialize all years first to ensure order
	const startYear = 1980;
	const endYear = 2017;
	for (let y = startYear; y <= endYear; y++) {
		map.set(y, {
			year: y.toString(),
			normalCost: 0,
			highlightedCost: 0,
			highlightEvents: [],
			totalCost: 0,
		});
	}

	RAW_DATA.forEach((item) => {
		const entry = map.get(item.year);
		if (!entry) return;

		entry.totalCost += item.cost;
		if (item.labeled) {
			entry.highlightedCost += item.cost;
			if (item.label) {
				entry.highlightEvents.push({ name: item.label, cost: item.cost });
			}
		} else {
			entry.normalCost += item.cost;
		}
	});

	return Array.from(map.values());
};

const DATA = calculateData();
const CHART_HEIGHT = DATA.length * 50; // 50px per row

interface CustomTooltipProps {
	active?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: Recharts payload typing is complex
	payload?: any[];
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as TransformedDataPoint;

		return (
			<div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[200px] z-50">
				<h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
					{label}
				</h3>

				<div className="space-y-2">
					{/* Highlighted Events */}
					{data.highlightEvents.map((event) => (
						<div
							key={event.name}
							className="flex justify-between items-start text-sm"
						>
							<span className="text-crimson-600 dark:text-crimson-400 font-medium mr-3 text-left">
								• {event.name}
							</span>
							<span className="font-bold text-zinc-900 dark:text-zinc-200 whitespace-nowrap">
								${event.cost}B
							</span>
						</div>
					))}

					{/* Normal Cost */}
					{data.normalCost > 0 && (
						<div className="flex justify-between items-center text-sm">
							<span className="text-zinc-500 dark:text-zinc-400 mr-3">
								{data.highlightEvents.length > 0
									? "• Other Events"
									: "Total Cost"}
							</span>
							<span className="font-medium text-zinc-700 dark:text-zinc-300">
								${data.normalCost}B
							</span>
						</div>
					)}

					{/* Total Summary if composite */}
					{data.highlightedCost > 0 && data.normalCost > 0 && (
						<div className="flex justify-between items-center text-sm pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800">
							<span className="font-bold text-zinc-900 dark:text-zinc-100">
								Total
							</span>
							<span className="font-bold text-zinc-900 dark:text-zinc-100">
								${data.totalCost}B
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}
	return null;
};

export default function DisasterCostBarChart() {
	return (
		<div className="w-full bg-white dark:bg-black rounded-3xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
			<div className="p-6 sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
				<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
					Major Natural Disasters
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
					Total cost per year (1980-2017). Highlighted bars indicate specific
					major events like Hurricane Katrina.
				</p>
			</div>

			<div className="relative w-full" style={{ height: CHART_HEIGHT }}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						layout="vertical"
						data={DATA}
						margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
						barCategoryGap={10}
						barGap={0}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={false}
							stroke="#e4e4e7"
							opacity={0.3}
						/>
						<XAxis
							type="number"
							hide={false}
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12, fill: "#71717a" }}
							tickFormatter={(val) => `$${val}B`}
							domain={[0, "dataMax + 20"]}
							orientation="top"
							interval="preserveStartEnd"
						/>
						<YAxis
							dataKey="year"
							type="category"
							axisLine={false}
							tickLine={false}
							width={50}
							tick={{ fontSize: 13, fontWeight: 500, fill: "#3f3f46" }}
							dx={-5}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "rgba(0,0,0,0.03)" }}
							wrapperStyle={{ outline: "none" }}
						/>

						{/* Stacked Bars: Labels (Red) first, then Others (Gray) or vice versa? 
                Usually we want the most important one visible if starting from 0? 
                Actually, stacking order doesn't matter too much if they don't overlap. 
                But let's put 'normal' first then 'highlighted' so red pops at the end? 
                Or highlighted first? Let's do highlighted then normal? 
                No, standard is usually base + extra. 
                Let's do Normal (Gray) + Highlighted (Crimson).
            */}

						<Bar
							dataKey="normalCost"
							stackId="a"
							fill="#e3dcd1" // The original gray
							radius={[0, 4, 4, 0]} // Round ends if it's the only one
							animationDuration={800}
						/>

						<Bar
							dataKey="highlightedCost"
							stackId="a"
							fill="#DC143C" // Crimson
							radius={[0, 4, 4, 0]}
							animationDuration={800}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="p-4 text-center border-t border-zinc-100 dark:border-zinc-800">
				<span className="text-xs text-zinc-400">Scroll for more years</span>
			</div>
		</div>
	);
}
