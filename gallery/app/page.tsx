"use client";

import { ExternalLink, Smartphone } from "lucide-react";
import { useState } from "react";

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
				<section className="space-y-6">
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
				<section className="space-y-6">
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

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Normal 2D (Vega 02)
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
										src="/preview/vega/vega-02"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Normal 2D Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Stock Explorer (Vega 03)
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
										src="/preview/vega/vega-03"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Stock Explorer Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Country Breakdown (Vega 04)
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
										src="/preview/vega/vega-04"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Country Breakdown Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Barley Yield (Vega 05)
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
										src="/preview/vega/vega-05"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Barley Yield Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Market Trends (Vega Altair 01)
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
										src="/preview/vega/vega-altair-01"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Market Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Data Density (Vega Altair 02)
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
										src="/preview/vega/vega-altair-02"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Data Density Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Energy Trends (Vega Altair 03)
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
										src="/preview/vega/vega-altair-03"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Energy Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Energy Source Share (Vega Altair 04)
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
										src="/preview/vega/vega-altair-04"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Energy Source Share Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Barley Yield Analysis (Vega Altair 05)
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
										src="/preview/vega/vega-altair-05"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Barley Yield Analysis Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Seattle Weather (Vega Altair 06)
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
										src="/preview/vega/vega-altair-06"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Seattle Weather Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Employment Change (Vega Altair 07)
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
										src="/preview/vega/vega-altair-07"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Employment Change Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									TODO Placeholder (Vega Altair 08)
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
										src="/preview/vega/vega-altair-08"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Vega Altair 08 Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Barley Yields (Vega Altair 09)
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
										src="/preview/vega/vega-altair-09"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Barley Yields Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Gantt Overview (Vega Altair 11)
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
										src="/preview/vega/vega-altair-11"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Gantt Overview Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Top Rated Movies (Vega Altair 12)
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
										src="/preview/vega/vega-altair-12"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Top Rated Movies Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Population Pyramid (Vega Altair 13)
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
										src="/preview/vega/vega-altair-13"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Population Pyramid Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Population by Age & Sex (Vega Altair 14)
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
										src="/preview/vega/vega-altair-14"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Population by Age & Sex Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									US State Capitals (Vega Altair 15)
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
										src="/preview/vega/vega-altair-15"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="US State Capitals Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Disaster Timeline (Vega Altair 16)
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
										src="/preview/vega/vega-altair-16"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Disaster Timeline Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Barley Yield Dumbbell (Vega Altair 17)
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
										src="/preview/vega/vega-altair-17"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Barley Yield Dumbbell Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									CO2 Atmosphere Trends (Vega Altair 18)
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
										src="/preview/vega/vega-altair-18"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="CO2 Atmosphere Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Penguin Morphology (Vega Altair 19)
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
										src="/preview/vega/vega-altair-19"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Penguin Morphology Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Pyramid View (Vega Altair 20)
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
										src="/preview/vega/vega-altair-20"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Pyramid View Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Penguin Metrics (Vega Altair 21)
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
										src="/preview/vega/vega-altair-21"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Penguin Metrics Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Experiment Results (Vega Altair 22)
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
										src="/preview/vega/vega-altair-22"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Experiment Results Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									IMDB Ratings (Vega Altair 23)
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
										src="/preview/vega/vega-altair-23"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="IMDB Ratings Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Unemployment Trends (Vega Altair 24)
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
										src="/preview/vega/vega-altair-24"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Unemployment Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Movie Ratings Analysis (Vega Altair 25)
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
										src="/preview/vega/vega-altair-25"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Movie Ratings Analysis Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									S&P 500 Focus (Vega Altair 26)
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
										src="/preview/vega/vega-altair-26"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="S&P 500 Focus Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Metric Analysis (Vega Altair 27)
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
										src="/preview/vega/vega-altair-27"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Metric Analysis Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Life Expectancy (Vega Altair 28)
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
										src="/preview/vega/vega-altair-28"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Life Expectancy Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Tech Stock Evolution (Vega Altair 29)
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
										src="/preview/vega/vega-altair-29"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Tech Stock Evolution Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Sine Wave Trends (Vega Altair 30)
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
										src="/preview/vega/vega-altair-30"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Sine Wave Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Crop Yield Trends (Vega Altair 31)
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
										src="/preview/vega/vega-altair-31"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Crop Yield Trends Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Data Insights (Vega Altair 34)
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
										src="/preview/vega/vega-altair-34"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Data Insights Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Daily Cycle (Vega Altair 35)
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
										src="/preview/vega/vega-altair-35"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Daily Cycle Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Vehicle Performance (Vega Altair 36)
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
										src="/preview/vega/vega-altair-36"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Vehicle Performance Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Penguin Morphology (Vega Altair 37)
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
										src="/preview/vega/vega-altair-37"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Penguin Morphology Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Seattle Climate (Vega Altair 38)
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
										src="/preview/vega/vega-altair-38"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Seattle Climate Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									IMDB Ratings by Genre (Vega Altair 39)
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
										src="/preview/vega/vega-altair-39"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="IMDB Ratings by Genre Preview"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Seattle Weather 2012 (Vega Altair 40)
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
										src="/preview/vega/vega-altair-40"
										className="w-full h-full border-none bg-white dark:bg-black"
										title="Seattle Weather 2012 Preview"
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
