"use client";

import { BulletCard } from "./BulletCard";

const data = [
	{
		title: "Revenue",
		subtitle: "US$, in thousands",
		ranges: [150, 225, 300],
		measures: [220, 270],
		markers: [250],
	},
	{
		title: "Profit",
		subtitle: "%",
		ranges: [20, 25, 30],
		measures: [21, 23],
		markers: [26],
	},
	{
		title: "Order Size",
		subtitle: "US$, average",
		ranges: [350, 500, 600],
		measures: [100, 320],
		markers: [550],
	},
	{
		title: "New Customers",
		subtitle: "count",
		ranges: [1400, 2000, 2500],
		measures: [1000, 1650],
		markers: [2100],
	},
	{
		title: "Satisfaction",
		subtitle: "out of 5",
		ranges: [3.5, 4.25, 5],
		measures: [3.2, 4.7],
		markers: [4.4],
	},
];

export function Visualization() {
	return (
		<div className="w-full h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
			<div className="max-w-md mx-auto p-4 flex flex-col gap-4 pb-12">
				<header className="mb-2 px-1">
					<h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
						Performance Metrics
					</h1>
					<p className="text-zinc-500 dark:text-zinc-400 text-sm">
						Comparison of current values against forecasts and targets.
					</p>
				</header>

				{data.map((item) => (
					<BulletCard key={item.title} data={item} />
				))}

				<footer className="mt-4 px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
					<h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
						Legend
					</h4>
					<div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
						<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
							<div className="w-3 h-3 bg-blue-600 rounded-sm" />
							<span>Current</span>
						</div>
						<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
							<div className="w-3 h-3 bg-blue-300 rounded-sm" />
							<span>Forecast</span>
						</div>
						<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
							<div className="w-1 h-3 bg-black" />
							<span>Target</span>
						</div>
						<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
							<div className="flex gap-0.5">
								<div className="w-2 h-3 bg-zinc-300" />
								<div className="w-2 h-3 bg-zinc-200" />
								<div className="w-2 h-3 bg-zinc-100" />
							</div>
							<span>Qualitative Ranges</span>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
