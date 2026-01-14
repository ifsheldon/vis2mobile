export type PopulationDatum = {
	year: number;
	age: number;
	sex: number;
	people: number;
};

export type PopulationRow = {
	age: number;
	male: number;
	female: number;
};

type PopulationSummary = {
	data: PopulationRow[];
	maleTotal: number;
	femaleTotal: number;
	maxValue: number;
};

const DATA_URL =
	"https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json";

let cachedPromise: Promise<PopulationDatum[]> | null = null;

export async function fetchPopulationData(): Promise<PopulationDatum[]> {
	if (!cachedPromise) {
		cachedPromise = fetch(DATA_URL).then(async (response) => {
			if (!response.ok) {
				throw new Error("Failed to load population data");
			}
			return (await response.json()) as PopulationDatum[];
		});
	}

	return cachedPromise;
}

export function buildPopulationSummary(
	rows: PopulationDatum[],
	year: number,
): PopulationSummary {
	const filtered = rows.filter((row) => row.year === year);
	const byAge = new Map<number, PopulationRow>();

	for (const row of filtered) {
		const entry = byAge.get(row.age) ?? {
			age: row.age,
			male: 0,
			female: 0,
		};

		if (row.sex === 1) {
			entry.male += row.people;
		} else if (row.sex === 2) {
			entry.female += row.people;
		}

		byAge.set(row.age, entry);
	}

	const data = Array.from(byAge.values()).sort((a, b) => a.age - b.age);
	const maleTotal = data.reduce((sum, item) => sum + item.male, 0);
	const femaleTotal = data.reduce((sum, item) => sum + item.female, 0);
	const maxValue = data.reduce(
		(max, item) => Math.max(max, item.male, item.female),
		0,
	);

	return {
		data,
		maleTotal,
		femaleTotal,
		maxValue,
	};
}
