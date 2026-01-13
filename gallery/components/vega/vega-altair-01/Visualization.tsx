"use client";

import { useMemo } from "react";
import {
	type StockData,
	stockData,
} from "@/components/vega/vega-altair-01/data";
import { StockCard } from "@/components/vega/vega-altair-01/StockCard";

const COLORS: Record<string, string> = {
	MSFT: "#14b8a6",
	AAPL: "#3b82f6",
	IBM: "#ef4444",
	AMZN: "#f97316",
};

export function Visualization() {
	const groupedData = useMemo(() => {
		const groups: Record<string, StockData[]> = {};
		for (const d of stockData) {
			if (!groups[d.symbol]) {
				groups[d.symbol] = [];
			}
			groups[d.symbol].push(d);
		}
		const order = ["MSFT", "AAPL", "IBM", "AMZN"];
		return order.map((symbol) => ({
			symbol,
			data: groups[symbol] || [],
		}));
	}, []);

	return (
		<div className="w-full h-full bg-black text-white overflow-y-auto overflow-x-hidden">
			<div className="max-w-md mx-auto px-4 py-8">
				<header className="mb-8 px-2">
					<h1 className="text-3xl font-bold tracking-tight text-white">
						Market Trends
					</h1>
					<p className="text-zinc-400 mt-2 text-sm">
						Historical price analysis (2000-2010)
					</p>
				</header>

				<div className="flex flex-col gap-4 pb-12">
					{groupedData.map(({ symbol, data }) => (
						<StockCard
							key={symbol}
							symbol={symbol}
							data={data}
							color={COLORS[symbol] || "#a1a1aa"}
						/>
					))}
				</div>

				<footer className="text-center text-zinc-600 text-xs pb-8">
					Source: Vega-Lite Gallery
				</footer>
			</div>
		</div>
	);
}
