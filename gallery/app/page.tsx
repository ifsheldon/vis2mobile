"use client";

import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PhonePreview } from "./components/PhonePreview";

const MOBILE_RATIOS = [
	{ name: "iPhone 14 Pro Max", width: 430, height: 932 },
	{ name: "iPhone X", width: 375, height: 812 },
	{ name: "Pixel 7", width: 412, height: 915 },
	{ name: "Galaxy S20 Ultra", width: 412, height: 915 },
];

// Cicero Examples data
const CICERO_EXAMPLES = [
	{
		title: "French Election (Mobile)",
		previewSrc: "/preview/french-election",
		originalSrc: "/more-examples/french-election-desktop.html",
	},
	{
		title: "Justice Kennedy (Mobile)",
		previewSrc: "/preview/kennedy",
		originalSrc: "/more-examples/kennedy-desktop.html",
	},
	{
		title: "Disaster Cost (Mobile)",
		previewSrc: "/preview/cost",
		originalSrc: "/more-examples/cost-desktop.html",
	},
	{
		title: "Budgets (Grouped Bar Chart)",
		previewSrc: "/preview/budgets",
		originalSrc: "/more-examples/budgets-desktop.html",
	},
	{
		title: "Daily Sales (Bar Chart)",
		previewSrc: "/preview/bar",
		originalSrc: "/apple-banana.svg",
		originalLabel: "Original SVG",
	},
	{
		title: "Fruit Trends (Line Chart)",
		previewSrc: "/preview/line",
		originalSrc: "/Fruit Sales Line Chart.svg",
		originalLabel: "Original SVG",
	},
	{
		title: "Fruit Distribution (Pie Chart)",
		previewSrc: "/preview/pie",
		originalSrc: "/Fruit Sales Pie Chart.svg",
		originalLabel: "Original SVG",
	},
];

// Vega Examples data
const VEGA_EXAMPLES = [
	// Vega 01
	{
		title: "Flight Explorer",
		previewSrc: "/preview/vega/vega-01",
		originalSrc: "/vega-originals/vega/01.html",
	},
	// Vega 02
	{
		title: "Normal 2D",
		previewSrc: "/preview/vega/vega-02",
		originalSrc: "/vega-originals/vega/02.html",
	},
	// Vega 03
	{
		title: "Stock Explorer",
		previewSrc: "/preview/vega/vega-03",
		originalSrc: "/vega-originals/vega/03.html",
	},
	// Vega 04
	{
		title: "Country Breakdown",
		previewSrc: "/preview/vega/vega-04",
		originalSrc: "/vega-originals/vega/04.html",
	},
	// Vega 05
	{
		title: "Barley Yield",
		previewSrc: "/preview/vega/vega-05",
		originalSrc: "/vega-originals/vega/05.html",
	},
];

// Vega Altair Examples data
const VEGA_ALTAIR_EXAMPLES = [
	// Vega Altair 01
	{
		title: "Market Trends",
		previewSrc: "/preview/vega/vega-altair-01",
		originalSrc: "/vega-originals/vega_altair/01.html",
	},
	// Vega Altair 02
	{
		title: "Data Density",
		previewSrc: "/preview/vega/vega-altair-02",
		originalSrc: "/vega-originals/vega_altair/02.html",
	},
	// Vega Altair 03
	{
		title: "Energy Trends",
		previewSrc: "/preview/vega/vega-altair-03",
		originalSrc: "/vega-originals/vega_altair/03.html",
	},
	// Vega Altair 04
	{
		title: "Energy Source Share",
		previewSrc: "/preview/vega/vega-altair-04",
		originalSrc: "/vega-originals/vega_altair/04.html",
	},
	// Vega Altair 05
	{
		title: "Barley Yield Analysis",
		previewSrc: "/preview/vega/vega-altair-05",
		originalSrc: "/vega-originals/vega_altair/05.html",
	},
	// Vega Altair 06
	{
		title: "Seattle Weather",
		previewSrc: "/preview/vega/vega-altair-06",
		originalSrc: "/vega-originals/vega_altair/06.html",
	},
	// Vega Altair 07
	{
		title: "Employment Change",
		previewSrc: "/preview/vega/vega-altair-07",
		originalSrc: "/vega-originals/vega_altair/07.html",
	},
	// Vega Altair 09
	{
		title: "Barley Yields",
		previewSrc: "/preview/vega/vega-altair-09",
		originalSrc: "/vega-originals/vega_altair/09.html",
	},
	// Vega Altair 11
	{
		title: "Gantt Overview",
		previewSrc: "/preview/vega/vega-altair-11",
		originalSrc: "/vega-originals/vega_altair/11.html",
	},
	// Vega Altair 12
	{
		title: "Top Rated Movies",
		previewSrc: "/preview/vega/vega-altair-12",
		originalSrc: "/vega-originals/vega_altair/12.html",
	},
	// Vega Altair 13
	{
		title: "Population Pyramid",
		previewSrc: "/preview/vega/vega-altair-13",
		originalSrc: "/vega-originals/vega_altair/13.html",
	},
	// Vega Altair 14
	{
		title: "Population by Age & Sex",
		previewSrc: "/preview/vega/vega-altair-14",
		originalSrc: "/vega-originals/vega_altair/14.html",
	},
	// Vega Altair 15
	{
		title: "US State Capitals",
		previewSrc: "/preview/vega/vega-altair-15",
		originalSrc: "/vega-originals/vega_altair/15.html",
	},
	// Vega Altair 16
	{
		title: "London Tube Lines",
		previewSrc: "/preview/vega/vega-altair-16",
		originalSrc: "/vega-originals/vega_altair/16.html",
	},
	// Vega Altair 17
	{
		title: "Radial Chart",
		previewSrc: "/preview/vega/vega-altair-17",
		originalSrc: "/vega-originals/vega_altair/17.html",
	},
	// Vega Altair 18
	{
		title: "Car Horsepower",
		previewSrc: "/preview/vega/vega-altair-18",
		originalSrc: "/vega-originals/vega_altair/18.html",
	},
	// Vega Altair 19
	{
		title: "Stock Price Comparison",
		previewSrc: "/preview/vega/vega-altair-19",
		originalSrc: "/vega-originals/vega_altair/19.html",
	},
	// Vega Altair 20
	{
		title: "Grouped Bar Chart",
		previewSrc: "/preview/vega/vega-altair-20",
		originalSrc: "/vega-originals/vega_altair/20.html",
	},
	// Vega Altair 21
	{
		title: "Cars Scatter Matrix",
		previewSrc: "/preview/vega/vega-altair-21",
		originalSrc: "/vega-originals/vega_altair/21.html",
	},
	// Vega Altair 22
	{
		title: "Seattle Weather Heatmap",
		previewSrc: "/preview/vega/vega-altair-22",
		originalSrc: "/vega-originals/vega_altair/22.html",
	},
	// Vega Altair 23
	{
		title: "Simple Bar Chart",
		previewSrc: "/preview/vega/vega-altair-23",
		originalSrc: "/vega-originals/vega_altair/23.html",
	},
	// Vega Altair 24
	{
		title: "Stacked Bar Chart",
		previewSrc: "/preview/vega/vega-altair-24",
		originalSrc: "/vega-originals/vega_altair/24.html",
	},
	// Vega Altair 25
	{
		title: "Horizontal Stacked Bar",
		previewSrc: "/preview/vega/vega-altair-25",
		originalSrc: "/vega-originals/vega_altair/25.html",
	},
	// Vega Altair 26
	{
		title: "S&P 500 Focus",
		previewSrc: "/preview/vega/vega-altair-26",
		originalSrc: "/vega-originals/vega_altair/26.html",
	},
	// Vega Altair 27
	{
		title: "Layered Histogram",
		previewSrc: "/preview/vega/vega-altair-27",
		originalSrc: "/vega-originals/vega_altair/27.html",
	},
	// Vega Altair 28
	{
		title: "Interactive Average",
		previewSrc: "/preview/vega/vega-altair-28",
		originalSrc: "/vega-originals/vega_altair/28.html",
	},
	// Vega Altair 29
	{
		title: "US Population",
		previewSrc: "/preview/vega/vega-altair-29",
		originalSrc: "/vega-originals/vega_altair/29.html",
	},
	// Vega Altair 30
	{
		title: "Donut Chart",
		previewSrc: "/preview/vega/vega-altair-30",
		originalSrc: "/vega-originals/vega_altair/30.html",
	},
	// Vega Altair 31
	{
		title: "CO2 Emissions",
		previewSrc: "/preview/vega/vega-altair-31",
		originalSrc: "/vega-originals/vega_altair/31.html",
	},
	// Vega Altair 34
	{
		title: "Bar Chart Highlight",
		previewSrc: "/preview/vega/vega-altair-34",
		originalSrc: "/vega-originals/vega_altair/34.html",
	},
	// Vega Altair 35
	{
		title: "Stocks Quantile Plot",
		previewSrc: "/preview/vega/vega-altair-35",
		originalSrc: "/vega-originals/vega_altair/35.html",
	},
	// Vega Altair 36
	{
		title: "Unemployment",
		previewSrc: "/preview/vega/vega-altair-36",
		originalSrc: "/vega-originals/vega_altair/36.html",
	},
	// Vega Altair 37
	{
		title: "Faceted Scatter",
		previewSrc: "/preview/vega/vega-altair-37",
		originalSrc: "/vega-originals/vega_altair/37.html",
	},
	// Vega Altair 38
	{
		title: "Airport Connections",
		previewSrc: "/preview/vega/vega-altair-38",
		originalSrc: "/vega-originals/vega_altair/38.html",
	},
	// Vega Altair 39
	{
		title: "Ranged Dot Plot",
		previewSrc: "/preview/vega/vega-altair-39",
		originalSrc: "/vega-originals/vega_altair/39.html",
	},
	// Vega Altair 40
	{
		title: "County Unemployment",
		previewSrc: "/preview/vega/vega-altair-40",
		originalSrc: "/vega-originals/vega_altair/40.html",
	},
	// Vega Altair 41
	{
		title: "Iowa Electricity",
		previewSrc: "/preview/vega/vega-altair-41",
		originalSrc: "/vega-originals/vega_altair/41.html",
	},
];

// Vega-Lite Examples data
const VEGA_LITE_EXAMPLES = [
	// Vega-Lite 01: Unemployment
	{
		title: "Unemployment",
		previewSrc: "/preview/vega/vega-lite-01",
		originalSrc: "/vega-originals/vega_lite/01.html",
	},
	// Vega-Lite 02: Penguin Body Mass
	{
		title: "Penguin Body Mass",
		previewSrc: "/preview/vega/vega-lite-02",
		originalSrc: "/vega-originals/vega_lite/02.html",
	},
	// Vega-Lite 03: Penguin Body Mass Distribution
	{
		title: "Penguin Body Mass Distribution",
		previewSrc: "/preview/vega/vega-lite-03",
		originalSrc: "/vega-originals/vega_lite/03.html",
	},
	// Vega-Lite 04: Exceptional Movies
	{
		title: "Exceptional Movies",
		previewSrc: "/preview/vega/vega-lite-04",
		originalSrc: "/vega-originals/vega_lite/04.html",
	},
	// Vega-Lite 05: Annual Financial Flow
	{
		title: "Annual Financial Flow",
		previewSrc: "/preview/vega/vega-lite-05",
		originalSrc: "/vega-originals/vega_lite/05.html",
	},
	// Vega-Lite 06: Penguin Mass Distribution
	{
		title: "Penguin Mass Distribution",
		previewSrc: "/preview/vega/vega-lite-06",
		originalSrc: "/vega-originals/vega_lite/06.html",
	},
	// Vega-Lite 07: IMDB Rating Distribution
	{
		title: "IMDB Rating Distribution",
		previewSrc: "/preview/vega/vega-lite-07",
		originalSrc: "/vega-originals/vega_lite/07.html",
	},
	// Vega-Lite 08: Movie Ratings Heatmap
	{
		title: "Movie Ratings Heatmap",
		previewSrc: "/preview/vega/vega-lite-08",
		originalSrc: "/vega-originals/vega_lite/08.html",
	},
	// Vega-Lite 09: Performance Frame Distribution
	{
		title: "Performance Frame Distribution",
		previewSrc: "/preview/vega/vega-lite-09",
		originalSrc: "/vega-originals/vega_lite/09.html",
	},
	// Vega-Lite 10: Falkensee Population
	{
		title: "Falkensee Population",
		previewSrc: "/preview/vega/vega-lite-10",
		originalSrc: "/vega-originals/vega_lite/10.html",
	},
	// Vega-Lite 12: Seattle Weather
	{
		title: "Seattle Weather",
		previewSrc: "/preview/vega/vega-lite-12",
		originalSrc: "/vega-originals/vega_lite/12.html",
	},
	// Vega-Lite 13: Performance Metrics
	{
		title: "Performance Metrics",
		previewSrc: "/preview/vega/vega-lite-13",
		originalSrc: "/vega-originals/vega_lite/13.html",
	},
	// Vega-Lite 14: Weather Observations
	{
		title: "Weather Observations",
		previewSrc: "/preview/vega/vega-lite-14",
		originalSrc: "/vega-originals/vega_lite/14.html",
	},
	// Vega-Lite 15: Tech Stock History
	{
		title: "Tech Stock History",
		previewSrc: "/preview/vega/vega-lite-15",
		originalSrc: "/vega-originals/vega_lite/15.html",
	},
	// Vega-Lite 16: Driving vs. Gas Prices
	{
		title: "Driving vs. Gas Prices",
		previewSrc: "/preview/vega/vega-lite-16",
		originalSrc: "/vega-originals/vega_lite/16.html",
	},
	// Vega-Lite 18: Data Distribution
	{
		title: "Data Distribution",
		previewSrc: "/preview/vega/vega-lite-18",
		originalSrc: "/vega-originals/vega_lite/18.html",
	},
	// Vega-Lite 19: Movie Ratings Distribution
	{
		title: "Movie Ratings Distribution",
		previewSrc: "/preview/vega/vega-lite-19",
		originalSrc: "/vega-originals/vega_lite/19.html",
	},
	// Vega-Lite 20: Genre Ratings
	{
		title: "Genre Ratings",
		previewSrc: "/preview/vega/vega-lite-20",
		originalSrc: "/vega-originals/vega_lite/20.html",
	},
	// Vega-Lite 21: Power Stats
	{
		title: "Power Stats",
		previewSrc: "/preview/vega/vega-lite-21",
		originalSrc: "/vega-originals/vega_lite/21.html",
	},
	// Vega-Lite 22: Cars by Origin & Cylinders
	{
		title: "Cars by Origin & Cylinders",
		previewSrc: "/preview/vega/vega-lite-22",
		originalSrc: "/vega-originals/vega_lite/22.html",
	},
];

export default function GalleryPage() {
	const [selectedRatio, setSelectedRatio] = useState(MOBILE_RATIOS[0]);
	const [phoneScale, setPhoneScale] = useState(1);

	useEffect(() => {
		const updateScale = () => {
			const width = window.innerWidth;
			// Scale down phones on wider screens (3 columns at 2xl = 1536px)
			if (width >= 1536) {
				setPhoneScale(0.85);
			} else if (width < 640) {
				// Mobile: Calculate scale to fit width
				// Page padding: px-2 (8px * 2 = 16px)
				// Preview padding: p-2 (8px * 2 = 16px)
				// Total chrome: ~32px
				// We leave a bit more buffer for borders/shadows
				const availableWidth = width - 48;
				setPhoneScale(Math.min(1, availableWidth / selectedRatio.width));
			} else {
				setPhoneScale(1);
			}
		};

		updateScale();
		window.addEventListener("resize", updateScale);
		return () => window.removeEventListener("resize", updateScale);
	}, [selectedRatio]);

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
			{/* Hero Section */}
			<div className="bg-white dark:bg-zinc-900 pt-20 pb-10 px-6 border-b border-zinc-200 dark:border-zinc-800">
				<div className="max-w-3xl mx-auto text-center space-y-6">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
						Proteus Mobile Visualization Gallery
					</h1>
					<p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
						Proteus automatically transforms desktop visualizations into
						mobile-optimized versions.
					</p>

					{/* Intro Text */}
					<p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed pt-2 text-justify">
						Proteus is a multi-agent framework designed to automatically adapt
						desktop visualizations for mobile devices. By leveraging large
						language models (LLMs) and computer vision, Proteus analyzes the
						original visualization, identifies adaptation strategies within our
						proposed Multi-level design space, and generates the corresponding
						code to create a responsive mobile-optimized version that preserves
						the original intent while ensuring readability on smaller screens.
						You can explore and interact with the mobile visualizations below, or
						click "Original HTML" to view the original desktop versions. You can click the dropdown menu on the top right to change the phone size.
					</p>
				</div>
			</div>

			{/* Pipeline Section - Hidden */}
			{/* <div className="max-w-[1800px] mx-auto px-6 py-10 border-b border-zinc-200 dark:border-zinc-800">
				<div className="flex flex-col items-center space-y-6">
					<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
						Pipeline
					</h2>
					<img
						src="/pipeline.png"
						alt="Proteus Pipeline"
						className="w-full max-w-5xl rounded-lg"
					/>
				</div>
			</div> */}

			{/* Gallery Section */}
			<div className="max-w-[1800px] mx-auto px-2 md:px-6 py-6 space-y-4">
				{/* Controls */}
				<div className="flex justify-end sticky top-6 z-40">
					<div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
						<Smartphone className="w-5 h-5 text-zinc-500 ml-2" />
						<select
							value={selectedRatio.name}
							onChange={(e) => {
								const ratio = MOBILE_RATIOS.find(
									(r) => r.name === e.target.value,
								);
								if (ratio) setSelectedRatio(ratio);
							}}
							className="bg-transparent border-none text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer pr-8 py-1"
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
				<section className="space-y-8" id="cicero">
					<div className="flex items-baseline gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
							Cicero Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-12 items-start">
						{CICERO_EXAMPLES.map((example) => (
							<PhonePreview
								key={example.previewSrc}
								title={example.title}
								previewSrc={example.previewSrc}
								originalSrc={example.originalSrc}
								originalLabel={example.originalLabel || "Original HTML"}
								phoneWidth={selectedRatio.width}
								phoneHeight={selectedRatio.height}
								phoneScale={phoneScale}
							/>
						))}
					</div>
				</section>

				{/* Vega Examples Section */}
				<section className="space-y-8" id="vega">
					<div className="flex items-baseline gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-12 items-start">
						{VEGA_EXAMPLES.map((example) => (
							<PhonePreview
								key={example.previewSrc}
								title={example.title}
								previewSrc={example.previewSrc}
								originalSrc={example.originalSrc}
								originalLabel="Original HTML"
								phoneWidth={selectedRatio.width}
								phoneHeight={selectedRatio.height}
								phoneScale={phoneScale}
							/>
						))}
					</div>
				</section>

				{/* Vega Altair Examples Section */}
				<section className="space-y-8" id="vega-altair">
					<div className="flex items-baseline gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega Altair Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-12 items-start">
						{VEGA_ALTAIR_EXAMPLES.map((example) => (
							<PhonePreview
								key={example.previewSrc}
								title={example.title}
								previewSrc={example.previewSrc}
								originalSrc={example.originalSrc}
								originalLabel="Original HTML"
								phoneWidth={selectedRatio.width}
								phoneHeight={selectedRatio.height}
								phoneScale={phoneScale}
							/>
						))}
					</div>
				</section>

				{/* Vega-Lite Examples Section */}
				<section className="space-y-8" id="vega-lite">
					<div className="flex items-baseline gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega-Lite Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-12 items-start">
						{VEGA_LITE_EXAMPLES.map((example) => (
							<PhonePreview
								key={example.previewSrc}
								title={example.title}
								previewSrc={example.previewSrc}
								originalSrc={example.originalSrc}
								originalLabel="Original HTML"
								phoneWidth={selectedRatio.width}
								phoneHeight={selectedRatio.height}
								phoneScale={phoneScale}
							/>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
