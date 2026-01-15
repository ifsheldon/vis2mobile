"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import vegaEmbed, { type View } from "vega-embed";

export function Visualization() {
	const containerRef = useRef<HTMLDivElement>(null);
	const vegaViewRef = useRef<View | null>(null);
	const [indexDate, setIndexDate] = useState<number>(
		new Date("2005-01-01").getTime(),
	);

	// Min and max dates from stocks.csv
	const minDate = new Date("2000-01-01").getTime();
	const maxDate = new Date("2010-03-01").getTime();

	useEffect(() => {
		if (!containerRef.current) return;

		const spec: any = {
			$schema: "https://vega.github.io/schema/vega/v5.json",
			description:
				"An interactive line chart of stock prices, with returns shown relative to a selected date.",
			width: "container",
			height: 350,
			padding: { left: 10, top: 30, right: 50, bottom: 30 },
			autosize: { type: "fit", contains: "padding" },
			signals: [
				{
					name: "indexDate",
					value: indexDate,
					on: [
						{
							events: "pointermove",
							update: "invert('x', clamp(x(), 0, width))",
						},
						{
							events: { type: "touchstart", source: "view" },
							update: "invert('x', clamp(x()[0], 0, width))",
						},
						{
							events: { type: "touchmove", source: "view" },
							update: "invert('x', clamp(x()[0], 0, width))",
						},
					],
				},
				{
					name: "maxDate",
					update: "time('Mar 1 2010')",
				},
			],
			data: [
				{
					name: "stocks",
					url: "/stocks.csv",
					format: { type: "csv", parse: { price: "number", date: "date" } },
				},
				{
					name: "index",
					source: "stocks",
					transform: [
						{
							type: "filter",
							expr: "month(datum.date) == month(indexDate) && year(datum.date) == year(indexDate)",
						},
					],
				},
				{
					name: "indexed_stocks",
					source: "stocks",
					transform: [
						{
							type: "lookup",
							from: "index",
							key: "symbol",
							fields: ["symbol"],
							as: ["index"],
							default: { price: 0 },
						},
						{
							type: "formula",
							as: "indexed_price",
							expr: "datum.index.price > 0 ? (datum.price - datum.index.price)/datum.index.price : 0",
						},
					],
				},
			],
			scales: [
				{
					name: "x",
					type: "time",
					domain: { data: "stocks", field: "date" },
					range: "width",
				},
				{
					name: "y",
					type: "linear",
					domain: { data: "indexed_stocks", field: "indexed_price" },
					nice: true,
					zero: true,
					range: "height",
				},
				{
					name: "color",
					type: "ordinal",
					range: ["#4f46e5", "#ef4444", "#10b981", "#f59e0b", "#06b6d4"],
					domain: { data: "stocks", field: "symbol" },
				},
			],
			axes: [
				{
					orient: "left",
					scale: "y",
					grid: true,
					format: "%",
					labelFontSize: 12,
					titleFontSize: 14,
				},
				{
					orient: "bottom",
					scale: "x",
					format: "%Y",
					labelFontSize: 12,
					grid: false,
					tickCount: 5,
				},
			],
			marks: [
				{
					type: "group",
					from: {
						facet: {
							name: "series",
							data: "indexed_stocks",
							groupby: "symbol",
						},
					},
					data: [
						{
							name: "label",
							source: "series",
							transform: [
								{
									type: "filter",
									expr: "datum.date == maxDate",
								},
							],
						},
					],
					marks: [
						{
							type: "line",
							from: { data: "series" },
							encode: {
								update: {
									x: { scale: "x", field: "date" },
									y: { scale: "y", field: "indexed_price" },
									stroke: { scale: "color", field: "symbol" },
									strokeWidth: { value: 2.5 },
									strokeCap: { value: "round" },
									strokeJoin: { value: "round" },
								},
							},
						},
						{
							type: "text",
							from: { data: "label" },
							encode: {
								update: {
									x: { scale: "x", field: "date", offset: 4 },
									y: { scale: "y", field: "indexed_price" },
									fill: { scale: "color", field: "symbol" },
									text: { field: "symbol" },
									baseline: { value: "middle" },
									fontWeight: { value: "bold" },
									fontSize: { value: 14 },
								},
							},
						},
					],
				},
				{
					type: "rule",
					encode: {
						update: {
							x: { value: 0 },
							x2: { field: { group: "width" } },
							y: { scale: "y", value: 0 },
							stroke: { value: "#cbd5e1" },
							strokeWidth: { value: 1 },
							strokeDash: { value: [4, 4] },
						},
					},
				},
				{
					type: "rule",
					encode: {
						update: {
							x: { scale: "x", signal: "indexDate" },
							y: { value: 0 },
							y2: { field: { group: "height" } },
							stroke: { value: "#ef4444" },
							strokeWidth: { value: 2 },
						},
					},
				},
				{
					type: "text",
					encode: {
						update: {
							x: { scale: "x", signal: "indexDate" },
							y: { value: -15 },
							align: { value: "center" },
							text: { signal: "timeFormat(indexDate, '%b %Y')" },
							fill: { value: "#ef4444" },
							fontWeight: { value: "bold" },
							fontSize: { value: 14 },
						},
					},
				},
			],
		};

		vegaEmbed(containerRef.current, spec, {
			actions: false,
			renderer: "svg",
		}).then((result) => {
			vegaViewRef.current = result.view;
			result.view.addSignalListener("indexDate", (_name, value) => {
				setIndexDate(value);
			});
		});

		return () => {
			if (vegaViewRef.current) {
				vegaViewRef.current.finalize();
			}
		};
	}, []);

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value, 10);
		setIndexDate(value);
		if (vegaViewRef.current) {
			vegaViewRef.current.signal("indexDate", value).run();
		}
	};

	return (
		<div className="flex flex-col h-full w-full bg-slate-50 text-slate-900 font-sans">
			{/* Header */}
			<div className="pt-12 px-6 pb-4 bg-white border-b border-slate-200">
				<h1 className="text-2xl font-extrabold tracking-tight">
					Market Returns
				</h1>
				<p className="text-slate-500 text-sm">
					Relative to{" "}
					<span className="text-red-500 font-semibold">
						{new Date(indexDate).toLocaleDateString(undefined, {
							month: "short",
							year: "numeric",
						})}
					</span>
				</p>
			</div>

			{/* Chart Container */}
			<div className="flex-1 px-2 pt-8 flex flex-col justify-start">
				<div ref={containerRef} className="w-full" />

				{/* Instructions */}
				<p className="text-center text-xs text-slate-400 mt-4 px-10">
					Drag the red line or use the slider below to change the base
					comparison date.
				</p>
			</div>

			{/* Controls */}
			<div className="p-8 bg-white border-t border-slate-200 space-y-6 pb-12">
				<div className="space-y-3">
					<div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
						<span>Jan 2000</span>
						<span>Mar 2010</span>
					</div>
					<input
						type="range"
						min={minDate}
						max={maxDate}
						value={indexDate}
						onChange={handleSliderChange}
						className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
					/>
				</div>

				<div className="grid grid-cols-3 gap-2">
					<div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
						<div className="text-[10px] font-bold text-slate-400 uppercase">
							MSFT
						</div>
						<div className="text-indigo-600 font-bold">Blue</div>
					</div>
					<div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
						<div className="text-[10px] font-bold text-slate-400 uppercase">
							AAPL
						</div>
						<div className="text-red-500 font-bold">Red</div>
					</div>
					<div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
						<div className="text-[10px] font-bold text-slate-400 uppercase">
							AMZN
						</div>
						<div className="text-emerald-500 font-bold">Green</div>
					</div>
				</div>
			</div>
		</div>
	);
}