import rawData from "./unemployment.json";

export interface UnemploymentRecord {
	series: string;
	year: number;
	month: number;
	count: number;
	rate: number;
	date: string;
}

export interface PivotedData {
	date: string;
	timestamp: number;
	[key: string]: string | number;
}

const typedRawData = rawData as UnemploymentRecord[];

// Get unique series
export const industries = Array.from(
	new Set(typedRawData.map((d) => d.series)),
);

// Process data into pivoted format for Recharts
const pivotedMap = new Map<string, PivotedData>();

for (const d of typedRawData) {
	if (!pivotedMap.has(d.date)) {
		pivotedMap.set(d.date, {
			date: d.date,
			timestamp: new Date(d.date).getTime(),
		});
	}
	const entry = pivotedMap.get(d.date);
	if (!entry) continue;
	entry[d.series] = d.count;
}

export const processedData = Array.from(pivotedMap.values()).sort(
	(a, b) => a.timestamp - b.timestamp,
);
