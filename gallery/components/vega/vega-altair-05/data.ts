interface VarietyData {
	variety: string;
	totalYield: number;
	[key: string]: number | string;
}

// @/lib/data.ts

export const rawData = [
	{ yield: 27, variety: "Manchuria", year: 1931, site: "University Farm" },
	{ yield: 48.86667, variety: "Manchuria", year: 1931, site: "Waseca" },
	{ yield: 27.43334, variety: "Manchuria", year: 1931, site: "Morris" },
	{ yield: 39.93333, variety: "Manchuria", year: 1931, site: "Crookston" },
	{ yield: 32.96667, variety: "Manchuria", year: 1931, site: "Grand Rapids" },
	{ yield: 28.96667, variety: "Manchuria", year: 1931, site: "Duluth" },
	{ yield: 43.06666, variety: "Glabron", year: 1931, site: "University Farm" },
	{ yield: 55.2, variety: "Glabron", year: 1931, site: "Waseca" },
	{ yield: 28.76667, variety: "Glabron", year: 1931, site: "Morris" },
	{ yield: 38.13333, variety: "Glabron", year: 1931, site: "Crookston" },
	{ yield: 29.13333, variety: "Glabron", year: 1931, site: "Grand Rapids" },
	{ yield: 29.66667, variety: "Glabron", year: 1931, site: "Duluth" },
	{ yield: 35.13333, variety: "Svansota", year: 1931, site: "University Farm" },
	{ yield: 47.33333, variety: "Svansota", year: 1931, site: "Waseca" },
	{ yield: 25.76667, variety: "Svansota", year: 1931, site: "Morris" },
	{ yield: 40.46667, variety: "Svansota", year: 1931, site: "Crookston" },
	{ yield: 29.66667, variety: "Svansota", year: 1931, site: "Grand Rapids" },
	{ yield: 25.7, variety: "Svansota", year: 1931, site: "Duluth" },
	{ yield: 36.96667, variety: "Velvet", year: 1931, site: "University Farm" },
	{ yield: 48.06666, variety: "Velvet", year: 1931, site: "Waseca" },
	{ yield: 29.7, variety: "Velvet", year: 1931, site: "Morris" },
	{ yield: 40.8, variety: "Velvet", year: 1931, site: "Crookston" },
	{ yield: 29.33333, variety: "Velvet", year: 1931, site: "Grand Rapids" },
	{ yield: 26.53333, variety: "Velvet", year: 1931, site: "Duluth" },
	{ yield: 35.93333, variety: "Peatland", year: 1931, site: "University Farm" },
	{ yield: 45.1, variety: "Peatland", year: 1931, site: "Waseca" },
	{ yield: 29.1, variety: "Peatland", year: 1931, site: "Morris" },
	{ yield: 30.56667, variety: "Peatland", year: 1931, site: "Crookston" },
	{ yield: 26.23333, variety: "Peatland", year: 1931, site: "Grand Rapids" },
	{ yield: 31.5, variety: "Peatland", year: 1931, site: "Duluth" },
	{
		yield: 31.66667,
		variety: "Wisconsin No. 38",
		year: 1931,
		site: "University Farm",
	},
	{ yield: 46.23333, variety: "Wisconsin No. 38", year: 1931, site: "Waseca" },
	{ yield: 30.33333, variety: "Wisconsin No. 38", year: 1931, site: "Morris" },
	{ yield: 37.9, variety: "Wisconsin No. 38", year: 1931, site: "Crookston" },
	{
		yield: 27.6,
		variety: "Wisconsin No. 38",
		year: 1931,
		site: "Grand Rapids",
	},
	{ yield: 25.96667, variety: "Wisconsin No. 38", year: 1931, site: "Duluth" },
	{ yield: 22.36667, variety: "No. 462", year: 1931, site: "University Farm" },
	{ yield: 37.33333, variety: "No. 462", year: 1931, site: "Waseca" },
	{ yield: 24.4, variety: "No. 462", year: 1931, site: "Morris" },
	{ yield: 28.56667, variety: "No. 462", year: 1931, site: "Crookston" },
	{ yield: 24.66667, variety: "No. 462", year: 1931, site: "Grand Rapids" },
	{ yield: 19.33333, variety: "No. 462", year: 1931, site: "Duluth" },
	{ yield: 33.5, variety: "No. 475", year: 1931, site: "University Farm" },
	{ yield: 36.03333, variety: "No. 475", year: 1931, site: "Waseca" },
	{ yield: 23.1, variety: "No. 475", year: 1931, site: "Morris" },
	{ yield: 30.36667, variety: "No. 475", year: 1931, site: "Crookston" },
	{ yield: 21.6, variety: "No. 475", year: 1931, site: "Grand Rapids" },
	{ yield: 20.63333, variety: "No. 475", year: 1931, site: "Duluth" },
	{ yield: 25.86667, variety: "Trebi", year: 1931, site: "University Farm" },
	{ yield: 43.2, variety: "Trebi", year: 1931, site: "Waseca" },
	{ yield: 31.5, variety: "Trebi", year: 1931, site: "Morris" },
	{ yield: 35.9, variety: "Trebi", year: 1931, site: "Crookston" },
	{ yield: 26.86667, variety: "Trebi", year: 1931, site: "Grand Rapids" },
	{ yield: 25.6, variety: "Trebi", year: 1931, site: "Duluth" },
	{ yield: 37.33333, variety: "No. 457", year: 1931, site: "University Farm" },
	{ yield: 41.76666, variety: "No. 457", year: 1931, site: "Waseca" },
	{ yield: 28.53333, variety: "No. 457", year: 1931, site: "Morris" },
	{ yield: 35.8, variety: "No. 457", year: 1931, site: "Crookston" },
	{ yield: 27.06667, variety: "No. 457", year: 1931, site: "Grand Rapids" },
	{ yield: 22.6, variety: "No. 457", year: 1931, site: "Duluth" },
	{ yield: 28.1, variety: "Manchuria", year: 1932, site: "University Farm" },
	{ yield: 29.33333, variety: "Manchuria", year: 1932, site: "Waseca" },
	{ yield: 36.6, variety: "Manchuria", year: 1932, site: "Morris" },
	{ yield: 21.63333, variety: "Manchuria", year: 1932, site: "Crookston" },
	{ yield: 21.93333, variety: "Manchuria", year: 1932, site: "Grand Rapids" },
	{ yield: 21.5, variety: "Manchuria", year: 1932, site: "Duluth" },
	{ yield: 30.96667, variety: "Glabron", year: 1932, site: "University Farm" },
	{ yield: 37.7, variety: "Glabron", year: 1932, site: "Waseca" },
	{ yield: 33.3, variety: "Glabron", year: 1932, site: "Morris" },
	{ yield: 22.63333, variety: "Glabron", year: 1932, site: "Crookston" },
	{ yield: 22.63333, variety: "Glabron", year: 1932, site: "Grand Rapids" },
	{ yield: 24.3, variety: "Glabron", year: 1932, site: "Duluth" },
	{ yield: 27.76667, variety: "Svansota", year: 1932, site: "University Farm" },
	{ yield: 34.46667, variety: "Svansota", year: 1932, site: "Waseca" },
	{ yield: 33.06666, variety: "Svansota", year: 1932, site: "Morris" },
	{ yield: 22.86667, variety: "Svansota", year: 1932, site: "Crookston" },
	{ yield: 21.36667, variety: "Svansota", year: 1932, site: "Grand Rapids" },
	{ yield: 20.9, variety: "Svansota", year: 1932, site: "Duluth" },
	{ yield: 34.53333, variety: "Velvet", year: 1932, site: "University Farm" },
	{ yield: 32.33333, variety: "Velvet", year: 1932, site: "Waseca" },
	{ yield: 37.9, variety: "Velvet", year: 1932, site: "Morris" },
	{ yield: 21.73333, variety: "Velvet", year: 1932, site: "Crookston" },
	{ yield: 19.3, variety: "Velvet", year: 1932, site: "Grand Rapids" },
	{ yield: 21.03333, variety: "Velvet", year: 1932, site: "Duluth" },
	{ yield: 31.96667, variety: "Peatland", year: 1932, site: "University Farm" },
	{ yield: 28.1, variety: "Peatland", year: 1932, site: "Waseca" },
	{ yield: 33.46667, variety: "Peatland", year: 1932, site: "Morris" },
	{ yield: 15.13333, variety: "Peatland", year: 1932, site: "Crookston" },
	{ yield: 19.46667, variety: "Peatland", year: 1932, site: "Grand Rapids" },
	{ yield: 19.1, variety: "Peatland", year: 1932, site: "Duluth" },
	{
		yield: 30.03333,
		variety: "Wisconsin No. 38",
		year: 1932,
		site: "University Farm",
	},
	{ yield: 33.3, variety: "Wisconsin No. 38", year: 1932, site: "Waseca" },
	{ yield: 38.7, variety: "Wisconsin No. 38", year: 1932, site: "Morris" },
	{
		yield: 21.03333,
		variety: "Wisconsin No. 38",
		year: 1932,
		site: "Crookston",
	},
	{
		yield: 17.6,
		variety: "Wisconsin No. 38",
		year: 1932,
		site: "Grand Rapids",
	},
	{ yield: 16.53333, variety: "Wisconsin No. 38", year: 1932, site: "Duluth" },
	{ yield: 26.9, variety: "No. 462", year: 1932, site: "University Farm" },
	{ yield: 31.33333, variety: "No. 462", year: 1932, site: "Waseca" },
	{ yield: 30.56667, variety: "No. 462", year: 1932, site: "Morris" },
	{ yield: 19.23333, variety: "No. 462", year: 1932, site: "Crookston" },
	{ yield: 16.4, variety: "No. 462", year: 1932, site: "Grand Rapids" },
	{ yield: 15.2, variety: "No. 462", year: 1932, site: "Duluth" },
	{ yield: 30.36667, variety: "No. 475", year: 1932, site: "University Farm" },
	{ yield: 29.8, variety: "No. 475", year: 1932, site: "Waseca" },
	{ yield: 34.06666, variety: "No. 475", year: 1932, site: "Morris" },
	{ yield: 19.3, variety: "No. 475", year: 1932, site: "Crookston" },
	{ yield: 16.73333, variety: "No. 475", year: 1932, site: "Grand Rapids" },
	{ yield: 16.46667, variety: "No. 475", year: 1932, site: "Duluth" },
	{ yield: 28.73333, variety: "Trebi", year: 1932, site: "University Farm" },
	{ yield: 28.76667, variety: "Trebi", year: 1932, site: "Waseca" },
	{ yield: 40.83333, variety: "Trebi", year: 1932, site: "Morris" },
	{ yield: 20.66667, variety: "Trebi", year: 1932, site: "Crookston" },
	{ yield: 18.43333, variety: "Trebi", year: 1932, site: "Grand Rapids" },
	{ yield: 19.23333, variety: "Trebi", year: 1932, site: "Duluth" },
	{ yield: 35.03333, variety: "No. 457", year: 1932, site: "University Farm" },
	{ yield: 32.6, variety: "No. 457", year: 1932, site: "Waseca" },
	{ yield: 33.6, variety: "No. 457", year: 1932, site: "Morris" },
	{ yield: 20.03333, variety: "No. 457", year: 1932, site: "Crookston" },
	{ yield: 16.5, variety: "No. 457", year: 1932, site: "Grand Rapids" },
	{ yield: 17.63333, variety: "No. 457", year: 1932, site: "Duluth" },
];

export interface ProcessedDataPoint {
	variety: string;
	totalYield: number;
	"University Farm": number;
	Waseca: number;
	Morris: number;
	Crookston: number;
	"Grand Rapids": number;
	Duluth: number;
}

export interface ChartData {
	1931: ProcessedDataPoint[];
	1932: ProcessedDataPoint[];
}

export const sites = [
	"University Farm",
	"Waseca",
	"Morris",
	"Crookston",
	"Grand Rapids",
	"Duluth",
];

export const processBarleyData = (): ChartData => {
	const processed: ChartData = {
		1931: [],
		1932: [],
	};

	const varieties: { [year: number]: { [key: string]: VarietyData } } = {
		1931: {},
		1932: {},
	};

	for (const item of rawData) {
		const { year, variety, site, yield: yieldValue } = item;

		if (!varieties[year][variety]) {
			const initialSiteData: { [key: string]: number } = {};
			sites.forEach((s) => {
				initialSiteData[s] = 0;
			});
			varieties[year][variety] = {
				variety,
				totalYield: 0,
				...initialSiteData,
			};
		}

		varieties[year][variety][site] = yieldValue;
		varieties[year][variety].totalYield += yieldValue;
	}

	for (const year in varieties) {
		processed[parseInt(year, 10) as keyof ChartData] = Object.values(
			varieties[year],
		).sort((a, b) => a.totalYield - b.totalYield) as ProcessedDataPoint[];
	}

	return processed;
};

export const siteColors: { [key: string]: string } = {
	"University Farm": "#8884d8",
	Waseca: "#82ca9d",
	Morris: "#ffc658",
	Crookston: "#ff8042",
	"Grand Rapids": "#a4de6c",
	Duluth: "#d0ed57",
};
