export interface CountryData {
  id: string;
  value: number;
  [key: string]: string | number;
}

export const data: CountryData[] = [
  { id: "United States", value: 1 },
  { id: "France", value: 1 },
  { id: "Germany", value: 1 },
  { id: "Italy", value: 1 },
  { id: "UK", value: 1 },
  { id: "Canada", value: 10 },
  { id: "China", value: 3 },
  { id: "India", value: 7 },
  { id: "Argentina", value: 8 },
];
