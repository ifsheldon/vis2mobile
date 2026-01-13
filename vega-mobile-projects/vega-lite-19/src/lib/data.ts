export interface MovieData {
  IMDB_Rating: number | null;
  Rotten_Tomatoes_Rating: number | null;
}

export interface BinnedPoint {
  imdb: number;
  rotten: number;
  count: number;
}

interface RawMovieData {
  "IMDB Rating": number | null;
  "Rotten Tomatoes Rating": number | null;
  [key: string]: any;
}

export async function fetchAndProcessMovieData(): Promise<BinnedPoint[]> {
  const response = await fetch(
    "https://vega.github.io/editor/data/movies.json",
  );
  const rawData: RawMovieData[] = await response.json();

  const bins: Record<string, number> = {};

  for (const movie of rawData) {
    const imdb = movie["IMDB Rating"];
    const rotten = movie["Rotten Tomatoes Rating"];

    if (
      imdb !== null &&
      rotten !== null &&
      imdb !== undefined &&
      rotten !== undefined
    ) {
      // Vega-Lite "maxbins: 10" for IMDB (0-10) usually means step 1.0
      // For Rotten Tomatoes (0-100) usually means step 10.0
      const imdbBin = Math.floor(imdb);
      const rottenBin = Math.floor(rotten / 10) * 10;

      const key = `${imdbBin}-${rottenBin}`;
      bins[key] = (bins[key] || 0) + 1;
    }
  }

  return Object.entries(bins).map(([key, count]) => {
    const [imdb, rotten] = key.split("-").map(Number);
    return { imdb, rotten, count };
  });
}
