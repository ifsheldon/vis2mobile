import populationData from "./data.json";

export interface BoxPlotData {
  age: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export const data: BoxPlotData[] = populationData;
