export interface JusticeData {
  justice: string;
  percentage: number;
  highlight?: boolean;
}

export const data: JusticeData[] = [
  { justice: "Gorsuch", percentage: 82 },
  { justice: "Kennedy", percentage: 76, highlight: true },
  { justice: "White", percentage: 68 },
  { justice: "O'Connor", percentage: 66 },
  { justice: "Roberts", percentage: 65 },
  { justice: "Rehnquist", percentage: 65 },
  { justice: "Thomas", percentage: 63 },
  { justice: "Scalia", percentage: 62 },
  { justice: "Alito", percentage: 61 },
  { justice: "Blackmun", percentage: 57 },
  { justice: "Souter", percentage: 47 },
  { justice: "Stevens", percentage: 46 },
  { justice: "Brennan", percentage: 46 },
  { justice: "Kagan", percentage: 45 },
  { justice: "Sotomayor", percentage: 44 },
  { justice: "Breyer", percentage: 44 },
  { justice: "Ginsburg", percentage: 42 },
  { justice: "Marshall", percentage: 42 },
];
