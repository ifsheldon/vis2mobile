import rawData from "./extracted_data.json";

export type PenguinData = {
  Species: string | null;
  Island: string | null;
  "Beak Length (mm)": number | null;
  "Beak Depth (mm)": number | null;
  "Flipper Length (mm)": number | null;
  "Body Mass (g)": number | null;
  Sex: string | null;
};

export interface DensityPoint {
  value: number;
  density: number;
}

// Gaussian Kernel
function gaussianKernel(u: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
}

// Silverman's Rule for bandwidth
function calculateBandwidth(values: number[]): number {
  const n = values.length;
  if (n === 0) return 1;

  // Mean
  const mean = values.reduce((a, b) => a + b, 0) / n;

  // Standard Deviation
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // IQR
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  const A = Math.min(stdDev, iqr / 1.34) || stdDev || 1; // Fallback if IQR is 0

  return 0.9 * A * n ** -0.2;
}

function calculateKDE(data: number[], points = 100): DensityPoint[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1; // Add some padding
  const rangeMin = min - padding;
  const rangeMax = max + padding;

  const bandwidth = calculateBandwidth(data);
  const n = data.length;

  const densityPoints: DensityPoint[] = [];
  const step = (rangeMax - rangeMin) / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = rangeMin + i * step;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += gaussianKernel((x - data[j]) / bandwidth);
    }
    const density = sum / (n * bandwidth);
    densityPoints.push({ value: x, density });
  }

  return densityPoints;
}

export function getProcessedData() {
  const validData = (rawData as PenguinData[]).filter(
    (d) =>
      d["Beak Length (mm)"] != null &&
      d["Beak Depth (mm)"] != null &&
      d["Flipper Length (mm)"] != null,
  );

  const beakLength = validData.map((d) => d["Beak Length (mm)"] as number);
  const beakDepth = validData.map((d) => d["Beak Depth (mm)"] as number);
  const flipperLength = validData.map(
    (d) => d["Flipper Length (mm)"] as number,
  );

  return {
    beakLength: calculateKDE(beakLength),
    beakDepth: calculateKDE(beakDepth),
    flipperLength: calculateKDE(flipperLength),
  };
}
