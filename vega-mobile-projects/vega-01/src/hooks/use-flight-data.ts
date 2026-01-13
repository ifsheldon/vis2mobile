import { bin } from "d3-array";
import { useEffect, useMemo, useState } from "react";

export type Flight = {
  date: string;
  delay: number;
  distance: number;
  origin: string;
  destination: string;
  time: number; // float hours
};

export type FilterState = {
  delay: [number, number];
  distance: [number, number];
  time: [number, number];
};

export type StepState = {
  delay: number;
  distance: number;
  time: number;
};

// Default ranges from spec
export const DOMAINS = {
  delay: [-60, 180] as [number, number],
  time: [0, 24] as [number, number],
  distance: [0, 2400] as [number, number],
};

export function useFlightData() {
  const [data, setData] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Steps
  const [steps, setSteps] = useState<StepState>({
    delay: 10,
    distance: 100,
    time: 1,
  });

  // Initial Filters (Full Range)
  const [filters, setFilters] = useState<FilterState>({
    delay: DOMAINS.delay,
    distance: DOMAINS.distance,
    time: DOMAINS.time,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://vega.github.io/editor/data/flights-200k.json",
        );
        const json = await res.json();
        // Basic validation or casting if needed
        setData(json);
      } catch (e) {
        console.error("Failed to fetch flight data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 1. Create Bins for Global Data (Background)
  // We memoize this so it only runs once per step-change
  const globalBins = useMemo(() => {
    if (data.length === 0) return { delay: [], distance: [], time: [] };

    // Helper to bin data
    const createBins = (
      field: keyof Flight,
      domain: [number, number],
      step: number,
    ) => {
      const binner = bin<Flight, number>()
        .value((d) => d[field] as number)
        .domain(domain)
        .thresholds(
          Array.from(
            { length: Math.ceil((domain[1] - domain[0]) / step) + 1 },
            (_, i) => domain[0] + i * step,
          ),
        );
      return binner(data).map((b) => ({
        x0: b.x0,
        x1: b.x1,
        count: b.length,
      }));
    };

    return {
      delay: createBins("delay", DOMAINS.delay, steps.delay),
      distance: createBins("distance", DOMAINS.distance, steps.distance),
      time: createBins("time", DOMAINS.time, steps.time),
    };
  }, [data, steps]);

  // 2. Filter Data based on current selection (Ignoring specific dimensions for cross-filtering)
  // We need three sets of filtered data, each ignoring one dimension
  const filteredData = useMemo(() => {
    if (data.length === 0) return { delay: [], distance: [], time: [] };

    const filterBy = (ignore: keyof FilterState) => {
      return data.filter((d) => {
        const matchesDelay =
          ignore === "delay" ||
          (d.delay >= filters.delay[0] && d.delay <= filters.delay[1]);
        const matchesDistance =
          ignore === "distance" ||
          (d.distance >= filters.distance[0] &&
            d.distance <= filters.distance[1]);
        const matchesTime =
          ignore === "time" ||
          (d.time >= filters.time[0] && d.time <= filters.time[1]);
        return matchesDelay && matchesDistance && matchesTime;
      });
    };

    return {
      delay: filterBy("delay"),
      distance: filterBy("distance"),
      time: filterBy("time"),
    };
  }, [data, filters]);

  // 3. Create Bins for Filtered Data (Foreground)
  const filteredBins = useMemo(() => {
    if (data.length === 0) return { delay: [], distance: [], time: [] };

    const createBins = (
      field: keyof Flight,
      filteredSet: Flight[],
      domain: [number, number],
      step: number,
    ) => {
      const binner = bin<Flight, number>()
        .value((d) => d[field] as number)
        .domain(domain)
        .thresholds(
          Array.from(
            { length: Math.ceil((domain[1] - domain[0]) / step) + 1 },
            (_, i) => domain[0] + i * step,
          ),
        );

      const bins = binner(filteredSet);

      return bins.map((b) => ({
        x0: b.x0,
        x1: b.x1,
        count: b.length,
      }));
    };

    return {
      delay: createBins(
        "delay",
        filteredData.delay,
        DOMAINS.delay,
        steps.delay,
      ),
      distance: createBins(
        "distance",
        filteredData.distance,
        DOMAINS.distance,
        steps.distance,
      ),
      time: createBins("time", filteredData.time, DOMAINS.time, steps.time),
    };
  }, [filteredData, steps, data.length]);

  // 4. Merge for Recharts
  // Structure: { range: "10-20", global: 100, filtered: 20, x0: 10, x1: 20 }
  const chartData = useMemo(() => {
    interface BinResult {
      x0: number | undefined;
      x1: number | undefined;
      count: number;
    }
    const merge = (global: BinResult[], filtered: BinResult[]) => {
      return global.map((g, i) => {
        const f = filtered[i];
        return {
          name: `${g.x0}`, // simplified label
          x0: g.x0 ?? 0,
          x1: g.x1 ?? 0,
          global: g.count,
          filtered: f ? f.count : 0,
        };
      });
    };

    return {
      delay: merge(globalBins.delay, filteredBins.delay),
      distance: merge(globalBins.distance, filteredBins.distance),
      time: merge(globalBins.time, filteredBins.time),
    };
  }, [globalBins, filteredBins]);

  // Totally filtered data (matches ALL filters) for stats
  const totalFilteredCount = useMemo(() => {
    if (data.length === 0) return 0;
    return data.filter((d) => {
      return (
        d.delay >= filters.delay[0] &&
        d.delay <= filters.delay[1] &&
        d.distance >= filters.distance[0] &&
        d.distance <= filters.distance[1] &&
        d.time >= filters.time[0] &&
        d.time <= filters.time[1]
      );
    }).length;
  }, [data, filters]);

  return {
    loading,
    totalCount: data.length,
    totalFilteredCount,
    filters,
    setFilters,
    steps,
    setSteps,
    chartData,
  };
}
