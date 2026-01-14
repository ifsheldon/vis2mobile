import rawData from "./data.json";

export type RawBarleyData = {
	yield: number;
	variety: string;
	year: number;
	site: string;
};

export type ProcessedVarietyData = {
	variety: string;
	yield1931: number;
	yield1932: number;
	diff: number;
};

export type ProcessedSiteData = {
	site: string;
	varieties: ProcessedVarietyData[];
};

export const processData = (): {
	processedData: ProcessedSiteData[];
	globalMin: number;
	globalMax: number;
	sites: string[];
} => {
	const data = rawData as RawBarleyData[];
	const sitesSet = new Set<string>();
	let globalMin = Infinity;
	let globalMax = -Infinity;

	// First pass: collect sites and global min/max
	data.forEach((d) => {
		sitesSet.add(d.site);
		if (d.yield < globalMin) globalMin = d.yield;
		if (d.yield > globalMax) globalMax = d.yield;
	});

	// Calculate total yield per site to sort them.
	const siteYields = new Map<string, number>();
	data.forEach((d) => {
		siteYields.set(d.site, (siteYields.get(d.site) || 0) + d.yield);
	});

	// Sort sites by total yield descending to match original vaguely, or just alphabet/custom.
	// "The Morris Mistake" suggests specific interest in Morris.
	// Let's just use the order from the plan or alphabetical.
	// The plan says "Paginate Panels".
	// Let's just sort them by total yield descending as in the original spec: "sort": {"field": "yield", "op": "sum", "order": "descending"}
	const sortedSites = Array.from(sitesSet).sort(
		(a, b) => (siteYields.get(b) || 0) - (siteYields.get(a) || 0),
	);

	const processedData: ProcessedSiteData[] = sortedSites.map((site) => {
		const siteData = data.filter((d) => d.site === site);
		const varietiesMap = new Map<
			string,
			{ yield1931: number; yield1932: number }
		>();

		siteData.forEach((d) => {
			if (!varietiesMap.has(d.variety)) {
				varietiesMap.set(d.variety, { yield1931: 0, yield1932: 0 });
			}
			const entry = varietiesMap.get(d.variety);
			if (entry) {
				if (d.year === 1931) entry.yield1931 = d.yield;
				if (d.year === 1932) entry.yield1932 = d.yield;
			}
		});

		const varieties: ProcessedVarietyData[] = Array.from(
			varietiesMap.entries(),
		).map(([variety, yields]) => ({
			variety,
			yield1931: yields.yield1931,
			yield1932: yields.yield1932,
			diff: yields.yield1932 - yields.yield1931,
		}));

		// Sort varieties by yield? Original sorts variety by "-x" (descending yield).
		// But which year? Usually sum or 1932?
		// Let's sort by max yield of the two years, or sum.
		// Spec says: "y": {"field": "variety", "sort": "-x"}
		// This implies sorting by the yield value in the plot.
		// Let's sort by 1932 yield descending, or sum.
		varieties.sort(
			(a, b) => b.yield1931 + b.yield1932 - (a.yield1931 + a.yield1932),
		);

		return {
			site,
			varieties,
		};
	});

	return {
		processedData,
		globalMin: Math.floor(globalMin / 10) * 10, // Round down to nearest 10
		globalMax: Math.ceil(globalMax / 10) * 10, // Round up to nearest 10
		sites: sortedSites,
	};
};
