import populationRaw from "./population.json";

export interface PopulationData {
  year: number;
  age: number;
  sex: number;
  people: number;
}

export const populationData = populationRaw as PopulationData[];

export const years = Array.from(
  new Set(populationData.map((d) => d.year)),
).sort((a, b) => a - b);
export const ages = Array.from(new Set(populationData.map((d) => d.age))).sort(
  (a, b) => a - b,
);

export function getYearlyData(year: number) {
  const filtered = populationData.filter((d) => d.year === year);

  // Format for Recharts: { age: 0, male: 123, female: 456, maleNegative: -123 }
  const formatted = ages.map((age) => {
    const male =
      filtered.find((d) => d.age === age && d.sex === 1)?.people || 0;
    const female =
      filtered.find((d) => d.age === age && d.sex === 2)?.people || 0;
    return {
      age: age.toString(),
      male,
      female,
      maleNegative: -male,
    };
  });

  return formatted;
}
