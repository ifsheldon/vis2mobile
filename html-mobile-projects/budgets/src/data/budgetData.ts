export interface BudgetItem {
  category: string;
  value: number;
}

export interface BudgetPlan {
  id: string;
  name: string;
  total: string;
  color: string;
  items: BudgetItem[];
}

export const budgetPlans: BudgetPlan[] = [
  {
    id: "republican",
    name: "Republican plan",
    total: "$1.1 trillion",
    color: "#f4a3b4",
    items: [
      { category: "Small-business aid", value: 200 },
      { category: "Other measures", value: 81 },
      { category: "Business tax breaks", value: 203 },
      { category: "Stimulus checks", value: 300 },
      { category: "Health care", value: 111 },
      { category: "Unemployment benefits", value: 110 },
      { category: "State and local aid", value: 105 },
      { category: "Safety net and other tax cuts", value: 18 },
    ],
  },
  {
    id: "passed",
    name: "Already passed",
    total: "$3.2 trillion",
    color: "#cfd2d6",
    items: [
      { category: "Small-business aid", value: 1010 },
      { category: "Other measures", value: 627 },
      { category: "Business tax breaks", value: 346 },
      { category: "Stimulus checks", value: 293 },
      { category: "Health care", value: 277 },
      { category: "Unemployment benefits", value: 274 },
      { category: "State and local aid", value: 256 },
      { category: "Safety net and other tax cuts", value: 83 },
    ],
  },
  {
    id: "democratic",
    name: "Democratic plan",
    total: "$3.4 trillion",
    color: "#8cc8f2",
    items: [
      { category: "Small-business aid", value: 0 },
      { category: "Other measures", value: 302 },
      { category: "Business tax breaks", value: 36 },
      { category: "Stimulus checks", value: 436 },
      { category: "Health care", value: 382 },
      { category: "Unemployment benefits", value: 437 },
      { category: "State and local aid", value: 1118 },
      { category: "Safety net and other tax cuts", value: 736 },
    ],
  },
];
