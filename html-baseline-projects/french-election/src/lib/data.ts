import electionData from "@/lib/french_election_data.json";

export type RegionData = {
  name: string;
  d: string;
  fill: string;
  winner: string;
  population: number;
  label: string | null;
};

export type CandidateData = {
  name: string;
  color: string;
};

export const regions: RegionData[] = electionData.regions as RegionData[];
export const candidates: CandidateData[] =
  electionData.candidates as CandidateData[];
