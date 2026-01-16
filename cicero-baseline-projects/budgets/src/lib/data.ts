export type PlanType = "Republican plan" | "Already passed" | "Democratic plan";

export interface DataPoint {
  sector: string;
  amount: number;
  plan: PlanType;
  special_label?: boolean;
}

export const plans: { name: PlanType; color: string; borderColor: string; shortName: string }[] = [
  { name: "Republican plan", color: "#FFC0CB", borderColor: "#F08080", shortName: "GOP" }, // pink, lightcoral
  { name: "Already passed", color: "#D3D3D3", borderColor: "#808080", shortName: "Passed" }, // lightgray, gray
  { name: "Democratic plan", color: "#87CEEB", borderColor: "#1E90FF", shortName: "Dem" }, // skyblue, dodgerblue
];

export const data: DataPoint[] = [
    {
      "sector": "Small-business aid",
      "amount": 200,
      "plan": "Republican plan",
      "special_label": true
    },
    {
      "sector": "Small-business aid",
      "amount": 1010,
      "plan": "Already passed",
      "special_label": true
    },
    {
      "sector": "Small-business aid",
      "amount": 0,
      "plan": "Democratic plan",
      "special_label": true
    },
    {
      "sector": "Other measures",
      "amount": 81,
      "plan": "Republican plan"
    },
    {
      "sector": "Other measures",
      "amount": 627,
      "plan": "Already passed"
    },
    {
      "sector": "Other measures",
      "amount": 302,
      "plan": "Democratic plan"
    },
    {
      "sector": "Business tax breaks",
      "amount": 203,
      "plan": "Republican plan"
    },
    {
      "sector": "Business tax breaks",
      "amount": 346,
      "plan": "Already passed"
    },
    {
      "sector": "Business tax breaks",
      "amount": 36,
      "plan": "Democratic plan"
    },
    {
      "sector": "Stimulus checks",
      "amount": 300,
      "plan": "Republican plan"
    },
    {
      "sector": "Stimulus checks",
      "amount": 293,
      "plan": "Already passed"
    },
    {
      "sector": "Stimulus checks",
      "amount": 436,
      "plan": "Democratic plan"
    },
    {
      "sector": "Health care",
      "amount": 111,
      "plan": "Republican plan"
    },
    {
      "sector": "Health care",
      "amount": 277,
      "plan": "Already passed"
    },
    {
      "sector": "Health care",
      "amount": 382,
      "plan": "Democratic plan"
    },
    {
      "sector": "Unemployment benefits",
      "amount": 110,
      "plan": "Republican plan"
    },
    {
      "sector": "Unemployment benefits",
      "amount": 274,
      "plan": "Already passed"
    },
    {
      "sector": "Unemployment benefits",
      "amount": 437,
      "plan": "Democratic plan"
    },
    {
      "sector": "State and local aid",
      "amount": 105,
      "plan": "Republican plan"
    },
    {
      "sector": "State and local aid",
      "amount": 256,
      "plan": "Already passed"
    },
    {
      "sector": "State and local aid",
      "amount": 1118,
      "plan": "Democratic plan"
    },
    {
      "sector": "Safety net and other tax cuts",
      "amount": 18,
      "plan": "Republican plan"
    },
    {
      "sector": "Safety net and other tax cuts",
      "amount": 83,
      "plan": "Already passed"
    },
    {
      "sector": "Safety net and other tax cuts",
      "amount": 736,
      "plan": "Democratic plan"
    }
];
