"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import SalesChart from "@/components/cicero/bar/SalesChart";

export default function BarPreviewPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent -z-10" />

			<div className="w-full max-w-lg space-y-8 z-10">
				<SalesChart />

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-[1.02]">
						<div className="flex items-center justify-between mb-2">
							<div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Apple Sales
							</div>
							<div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
								<TrendingDown className="w-4 h-4 text-violet-600 dark:text-violet-400" />
							</div>
						</div>
						<div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
							705
						</div>
					</div>

					<div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-[1.02]">
						<div className="flex items-center justify-between mb-2">
							<div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Banana Sales
							</div>
							<div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
								<TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
							</div>
						</div>
						<div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
							1,025
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
