export interface YearData {
	year: number;
	meanYield: number;
	ciMin: number;
	ciMax: number;
}

export interface SiteData {
	site: string;
	years: YearData[];
}

export const data: SiteData[] = [
	{
		site: "Crookston",
		years: [
			{
				year: 1931,
				meanYield: 43.659999,
				ciMin: 41.19961489583735,
				ciMax: 46.12038310416265,
			},
			{
				year: 1932,
				meanYield: 31.179998,
				ciMin: 27.468344023320984,
				ciMax: 34.891651976679015,
			},
		],
	},
	{
		site: "Duluth",
		years: [
			{
				year: 1931,
				meanYield: 30.293333,
				ciMin: 28.43961636967933,
				ciMax: 32.14704963032067,
			},
			{
				year: 1932,
				meanYield: 25.700000999999997,
				ciMin: 23.402553759961734,
				ciMax: 27.99744824003826,
			},
		],
	},
	{
		site: "Grand Rapids",
		years: [
			{
				year: 1931,
				meanYield: 29.053335000000004,
				ciMin: 25.935167340560348,
				ciMax: 32.17150265943966,
			},
			{
				year: 1932,
				meanYield: 20.809998999999998,
				ciMin: 17.481102368113515,
				ciMax: 24.13889563188648,
			},
		],
	},
	{
		site: "Morris",
		years: [
			{
				year: 1931,
				meanYield: 29.286669,
				ciMin: 25.815380914215595,
				ciMax: 32.757957085784405,
			},
			{
				year: 1932,
				meanYield: 41.513332000000005,
				ciMin: 38.2890542958238,
				ciMax: 44.73760970417621,
			},
		],
	},
	{
		site: "University Farm",
		years: [
			{
				year: 1931,
				meanYield: 35.826666,
				ciMin: 31.962196616664723,
				ciMax: 39.691135383335286,
			},
			{
				year: 1932,
				meanYield: 29.506669,
				ciMin: 26.803192268281645,
				ciMax: 32.21014573171835,
			},
		],
	},
	{
		site: "Waseca",
		years: [
			{
				year: 1931,
				meanYield: 54.346666000000006,
				ciMin: 50.002795884844836,
				ciMax: 58.690536115155176,
			},
			{
				year: 1932,
				meanYield: 41.869997,
				ciMin: 37.33690894381163,
				ciMax: 46.40308505618837,
			},
		],
	},
];
