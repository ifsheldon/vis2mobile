"use client";

import React, { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const spec: any = {
			$schema: "https://vega.github.io/schema/vega-lite/v6.json",
			data: {
				url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment-across-industries.json",
			},
			width: 300,
			height: 350,
			autosize: { type: "fit", contains: "padding" },
			config: {
				view: { stroke: null },
				axis: {
					labelFont: "Inter, system-ui, sans-serif",
					titleFont: "Inter, system-ui, sans-serif",
					labelFontSize: 11,
					titleFontSize: 13,
					titlePadding: 10,
				},
				legend: {
					labelFont: "Inter, system-ui, sans-serif",
					titleFont: "Inter, system-ui, sans-serif",
					labelFontSize: 11,
					titleFontSize: 12,
					orient: "bottom",
					columns: 2,
					symbolType: "circle",
					offset: 20,
				},
			},
			layer: [
				{
					params: [
						{
							name: "industry_select",
							select: { type: "point", fields: ["series"] },
							bind: "legend",
						},
					],
					mark: {
						type: "area",
						interpolate: "monotone",
						cursor: "pointer",
					},
					encoding: {
						x: {
							field: "date",
							type: "temporal",
							title: "Year",
							axis: { format: "%Y", tickCount: 5, grid: false },
						},
						y: {
							aggregate: "sum",
							field: "count",
							type: "quantitative",
							title: "Unemployed (Thousands)",
							axis: { grid: true, gridDash: [2, 2] },
						},
						color: {
							field: "series",
							type: "nominal",
							title: "Tap Legend to Filter",
							scale: { scheme: "tableau20" },
						},
						opacity: {
							condition: { param: "industry_select", value: 1 },
							value: 0.1,
						},
						tooltip: [
							{ field: "date", type: "temporal", title: "Month", format: "%B %Y" },
							{ field: "series", type: "nominal", title: "Industry" },
							{ field: "count", type: "quantitative", title: "Count", format: "," },
						],
					},
				},
				{
					mark: {
						type: "rule",
						color: "#666",
						strokeWidth: 1,
					},
					encoding: {
						x: {
							field: "date",
							type: "temporal",
						},
						opacity: {
							condition: { param: "hover", value: 1, empty: false },
							value: 0,
						},
					},
					params: [
						{
							name: "hover",
							select: {
								type: "point",
								fields: ["date"],
								nearest: true,
								on: "pointerover",
							},
						},
					],
				},
			],
		};

		vegaEmbed(containerRef.current, spec, { actions: false }).catch(console.error);
	}, []);

	return (
		<div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto">
			<div className="pt-16 pb-6 px-6">
				<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
					Unemployment by Industry
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
					Monthly unemployment counts across various sectors in the U.S. (2000–2010).
				</p>
			</div>

			<div className="px-2 flex justify-center">
				<div ref={containerRef} className="w-full max-w-[340px]" />
			</div>

			<div className="p-6 mt-4 border-t border-zinc-100 dark:border-zinc-800">
				<div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
						Quick Tip
					</h3>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						Tap on an industry in the legend to highlight its specific trend. Hover or tap on the chart to see monthly details.
					</p>
				</div>
			</div>
			
			<div className="h-20 flex-shrink-0" />
		</div>
	);
}
