export interface ObservationData {
  hour: number;
  observations: number;
  label: string;
}

export const observationData: ObservationData[] = [
  { hour: 0, observations: 2, label: "00:00" },
  { hour: 1, observations: 2, label: "01:00" },
  { hour: 2, observations: 2, label: "02:00" },
  { hour: 3, observations: 2, label: "03:00" },
  { hour: 4, observations: 2, label: "04:00" },
  { hour: 5, observations: 3, label: "05:00" },
  { hour: 6, observations: 4, label: "06:00" },
  { hour: 7, observations: 4, label: "07:00" },
  { hour: 8, observations: 8, label: "08:00" },
  { hour: 9, observations: 8, label: "09:00" },
  { hour: 10, observations: 9, label: "10:00" },
  { hour: 11, observations: 7, label: "11:00" },
  { hour: 12, observations: 5, label: "12:00" },
  { hour: 13, observations: 6, label: "13:00" },
  { hour: 14, observations: 8, label: "14:00" },
  { hour: 15, observations: 8, label: "15:00" },
  { hour: 16, observations: 7, label: "16:00" },
  { hour: 17, observations: 7, label: "17:00" },
  { hour: 18, observations: 4, label: "18:00" },
  { hour: 19, observations: 3, label: "19:00" },
  { hour: 20, observations: 3, label: "20:00" },
  { hour: 21, observations: 2, label: "21:00" },
  { hour: 22, observations: 2, label: "22:00" },
  { hour: 23, observations: 2, label: "23:00" },
];
