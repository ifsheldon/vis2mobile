"use client";

import { ExternalLink, Smartphone } from "lucide-react";
import { useState } from "react";
import { SideMenu } from "./components/SideMenu";

const MOBILE_RATIOS = [
	{ name: "iPhone X", width: 375, height: 812 },
	{ name: "Pixel 7", width: 412, height: 915 },
	{ name: "iPhone 14 Pro Max", width: 430, height: 932 },
	{ name: "Galaxy S20 Ultra", width: 412, height: 915 },
];

export default function GalleryPage() {
	const [selectedRatio, setSelectedRatio] = useState(MOBILE_RATIOS[0]);

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-sans">
			<SideMenu />
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
							Mobile Visualization Gallery
						</h1>
						<p className="text-zinc-500 dark:text-zinc-400 mt-1">
							Preview mobile-optimized charts across different device ratios.
						</p>
					</div>

					<div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
						<Smartphone className="w-5 h-5 text-zinc-500" />
						<select
							value={selectedRatio.name}
							onChange={(e) => {
								const ratio = MOBILE_RATIOS.find(
									(r) => r.name === e.target.value,
								);
								if (ratio) setSelectedRatio(ratio);
							}}
							className="bg-transparent border-none text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer"
						>
							{MOBILE_RATIOS.map((ratio) => (
								<option key={ratio.name} value={ratio.name}>
									{ratio.name} ({ratio.width}x{ratio.height})
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Cicero Examples Section */}
				<section id="cicero" className="space-y-6 scroll-mt-24">
					<div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
							Cicero Examples
						</h2>
					</div>

					{/* Gallery Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* French Election Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									French Election (Mobile)
								</h2>
								<a
									href="/more-examples/french-election-desktop.html"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original HTML
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/french-election"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="French Election Chart Preview"
									/>
								</div>
							</div>
						</div>

						{/* Kennedy Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Justice Kennedy (Mobile)
								</h2>
								<a
									href="/more-examples/kennedy-desktop.html"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original HTML
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/kennedy"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Kennedy Chart Preview"
									/>
								</div>
							</div>
						</div>
						{/* Disaster Cost Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Disaster Cost (Mobile)
								</h2>
								<a
									href="/more-examples/cost-desktop.html"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original HTML
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/cost"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Disaster Cost Chart Preview"
									/>
								</div>
							</div>
						</div>

						{/* Budgets Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Budgets (Grouped Bar Chart)
								</h2>
								<a
									href="/more-examples/budgets-desktop.html"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original HTML
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/budgets"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Budgets Chart Preview"
									/>
								</div>
							</div>
						</div>

						{/* Bar Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Daily Sales (Bar Chart)
								</h2>
								<a
									href="/apple-banana.svg"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original SVG
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/bar"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Bar Chart Preview"
									/>
								</div>
							</div>
						</div>

						{/* Line Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Fruit Trends (Line Chart)
								</h2>
								<a
									href="/Fruit Sales Line Chart.svg"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original SVG
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/line"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Line Chart Preview"
									/>
								</div>
							</div>
						</div>

						{/* Pie Chart Card */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Fruit Distribution (Pie Chart)
								</h2>
								<a
									href="/Fruit Sales Pie Chart.svg"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
								>
									Original SVG
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									{/* Notch */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/pie"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Pie Chart Preview"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Vega Examples Section */}
				<section id="vega" className="space-y-6 scroll-mt-24">
					<div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega Examples
						</h2>
						<p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
							Mobile-optimized visualizations from Vega.
						</p>
					</div>

					{/* Gallery Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Flight Explorer (Vega 01)
								</h2>
							</div>

							<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
								<div
									className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
									style={{
										width: selectedRatio.width,
										height: selectedRatio.height,
									}}
								>
									<div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

									<iframe
										src="/preview/vega/vega-01"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Flight Explorer Preview"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
