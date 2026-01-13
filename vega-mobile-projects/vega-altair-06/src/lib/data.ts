export interface PlanData {
  sector: string;
  republican: number;
  passed: number;
  democratic: number;
}

export const data: PlanData[] = [
  {
    sector: "Small-business aid",
    republican: 200,
    passed: 1010,
    democratic: 0,
  },
  {
    sector: "Other measures",
    republican: 81,
    passed: 627,
    democratic: 302,
  },
  {
    sector: "Business tax breaks",
    republican: 203,
    passed: 346,
    democratic: 36,
  },
  {
    sector: "Stimulus checks",
    republican: 300,
    passed: 293,
    democratic: 436,
  },
  {
    sector: "Health care",
    republican: 111,
    passed: 277,
    democratic: 382,
  },
  {
    sector: "Unemployment benefits",
    republican: 110,
    passed: 274,
    democratic: 437,
  },
  {
    sector: "State and local aid",
    republican: 105,
    passed: 256,
    democratic: 1118,
  },
  {
    sector: "Safety net and other tax cuts",
    republican: 18,
    passed: 83,
    democratic: 736,
  },
];
