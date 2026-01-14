import { max } from "d3-array";

export interface Movie {
	"IMDB Rating": number | null;
	"Rotten Tomatoes Rating": number | null;
	[key: string]: unknown;
}

export interface BinnedData {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	count: number;
}

export async function fetchAndProcessMovies() {
	const response = await fetch(
		"https://vega.github.io/editor/data/movies.json",
	);
	const data: Movie[] = await response.json();

	const filteredData = data.filter(
		(d) => d["IMDB Rating"] != null && d["Rotten Tomatoes Rating"] != null,
	) as { "IMDB Rating": number; "Rotten Tomatoes Rating": number }[];

	const imdbExtent = [1, 10]; // Fixed range for better stability
	const rtExtent = [0, 100];

	const xBinsCount = 30; // Reduced for better mobile visibility
	const yBinsCount = 20;

	const xStep = (imdbExtent[1] - imdbExtent[0]) / xBinsCount;
	const yStep = (rtExtent[1] - rtExtent[0]) / yBinsCount;

	const bins: Record<string, BinnedData> = {};

	for (const d of filteredData) {
		const xBinIdx = Math.floor((d["IMDB Rating"] - imdbExtent[0]) / xStep);
		const yBinIdx = Math.floor(
			(d["Rotten Tomatoes Rating"] - rtExtent[0]) / yStep,
		);

		if (
			xBinIdx >= 0 &&
			xBinIdx < xBinsCount &&
			yBinIdx >= 0 &&
			yBinIdx < yBinsCount
		) {
			const key = `${xBinIdx}-${yBinIdx}`;
			if (!bins[key]) {
				bins[key] = {
					x0: imdbExtent[0] + xBinIdx * xStep,
					x1: imdbExtent[0] + (xBinIdx + 1) * xStep,
					y0: rtExtent[0] + yBinIdx * yStep,
					y1: rtExtent[0] + (yBinIdx + 1) * yStep,
					count: 0,
				};
			}
			bins[key].count++;
		}
	}

	const binnedArray = Object.values(bins);
	const maxCount = max(binnedArray, (d) => d.count) || 0;

	return {
		data: binnedArray,
		maxCount,
		xExtent: imdbExtent,
		yExtent: rtExtent,
		xStep,
		yStep,
	};
}
