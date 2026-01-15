export interface GanttData {
  task: string;
  start: number;
  end: number;
}

export const data: GanttData[] = [
  { task: "A", start: 1, end: 3 },
  { task: "B", start: 3, end: 8 },
  { task: "C", start: 8, end: 10 },
];
