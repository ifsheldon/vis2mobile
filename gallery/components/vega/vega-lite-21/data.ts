import carsData from "@/components/vega/vega-lite-21/cars.json";

export interface Car {
	Name: string;
	Miles_per_Gallon: number | null;
	Cylinders: number;
	Displacement: number;
	Horsepower: number | null;
	Weight_in_lbs: number;
	Acceleration: number;
	Year: string;
	Origin: string;
}

export const cars: Car[] = carsData as Car[];
