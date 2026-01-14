"use client";

import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PhonePreview } from "./components/PhonePreview";
import { SideMenu } from "./components/SideMenu";

const MOBILE_RATIOS = [
	{ name: "iPhone X", width: 375, height: 812 },
	{ name: "Pixel 7", width: 412, height: 915 },
	{ name: "iPhone 14 Pro Max", width: 430, height: 932 },
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
	// Vega-Lite 01
	{
		title: "Simple Bar Chart",
		previewSrc: "/preview/vega/vega-lite-01",
		originalSrc: "/vega-originals/vega_lite/01.html",
	},
	// Vega-Lite 02
	{
		title: "Aggregated Bar Chart",
		previewSrc: "/preview/vega/vega-lite-02",
		originalSrc: "/vega-originals/vega_lite/02.html",
	},
	// Vega-Lite 03
	{
		title: "Grouped Bar Chart",
		previewSrc: "/preview/vega/vega-lite-03",
		originalSrc: "/vega-originals/vega_lite/03.html",
	},
	// Vega-Lite 04
	{
		title: "Stacked Bar Chart",
		previewSrc: "/preview/vega/vega-lite-04",
		originalSrc: "/vega-originals/vega_lite/04.html",
	},
	// Vega-Lite 05
	{
		title: "Population Pyramid",
		previewSrc: "/preview/vega/vega-lite-05",
		originalSrc: "/vega-originals/vega_lite/05.html",
	},
	// Vega-Lite 06
	{
		title: "Trellis Bar Chart",
		previewSrc: "/preview/vega/vega-lite-06",
		originalSrc: "/vega-originals/vega_lite/06.html",
	},
	// Vega-Lite 07
	{
		title: "Wilkinson Dot Plot",
		previewSrc: "/preview/vega/vega-lite-07",
		originalSrc: "/vega-originals/vega_lite/07.html",
	},
];

export default function GalleryPage() {
	const [selectedRatio, setSelectedRatio] = useState(MOBILE_RATIOS[0]);
	const [phoneScale, setPhoneScale] = useState(1);

	useEffect(() => {
		const updateScale = () => {
			// Scale down phones on wider screens (3 columns at 2xl = 1536px)
			if (window.innerWidth >= 1536) {
				setPhoneScale(0.85);
			} else {
				setPhoneScale(1);
			}
		};

		updateScale();
		window.addEventListener("resize", updateScale);
		return () => window.removeEventListener("resize", updateScale);
	}, []);

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
				<section className="space-y-6" id="cicero">
					<div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
							Cicero Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-12 items-start">
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
				<section className="space-y-6" id="vega">
					<div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-12 items-start">
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

				{/* Vega-Lite Examples Section */}
				<section className="space-y-6" id="vega-lite">
					<div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
							Vega-Lite Examples
						</h2>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-12 items-start">
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
