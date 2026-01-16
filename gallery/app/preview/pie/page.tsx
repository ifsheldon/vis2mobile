"use client";

import SalesPieChart from "@/components/cicero/pie/SalesPieChart";

export default function PiePreviewPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 sm:p-8 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent -z-10" />

			<div className="w-full max-w-lg space-y-8 z-10">
				<SalesPieChart />

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-[1.02]">
						<div className="flex items-center justify-between mb-2">
							<div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Top Seller
							</div>
							<div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
								<span className="text-lg">🍌</span>
							</div>
						</div>
						<div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
							Bananas
						</div>
						<div className="text-xs text-zinc-500 mt-1">37.4% share</div>
					</div>

					<div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-[1.02]">
						<div className="flex items-center justify-between mb-2">
							<div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Runner Up
							</div>
							<div className="p-1.5 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
								<span className="text-lg">🍎</span>
							</div>
						</div>
						<div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
							Apples
						</div>
						<div className="text-xs text-zinc-500 mt-1">22.4% share</div>
					</div>
				</div>
			</div>
		</main>
	);
}
