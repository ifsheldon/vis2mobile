export interface CarData {
  Origin: string;
  Cylinders: number;
  Count: number;
}

export const carData: CarData[] = [
  { Origin: "USA", Cylinders: 8, Count: 108 },
  { Origin: "USA", Cylinders: 6, Count: 74 },
  { Origin: "USA", Cylinders: 4, Count: 72 },
  { Origin: "Europe", Cylinders: 4, Count: 66 },
  { Origin: "Europe", Cylinders: 6, Count: 4 },
  { Origin: "Europe", Cylinders: 5, Count: 3 },
  { Origin: "Japan", Cylinders: 4, Count: 69 },
  { Origin: "Japan", Cylinders: 3, Count: 4 },
  { Origin: "Japan", Cylinders: 6, Count: 6 },
];

export const originTotals = {
  USA: 254,
  Europe: 73,
  Japan: 79,
};
