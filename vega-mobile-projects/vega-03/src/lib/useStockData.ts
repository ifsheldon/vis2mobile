import { csvParse } from "d3-dsv";
import { useEffect, useState } from "react";

export interface StockDataPoint {
  date: Date;
  [key: string]: number | Date; // Allow dynamic keys for symbols
}

export interface RawStockData {
  symbol: string;
  date: string;
  price: string;
}

const DATA_URL = "https://vega.github.io/editor/data/stocks.csv";

export function useStockData() {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(DATA_URL);
        const text = await response.text();
        const parsed = csvParse(text) as unknown as RawStockData[];

        // Pivot data
        const dateMap = new Map<string, StockDataPoint>();
        const symbolSet = new Set<string>();

        parsed.forEach((d) => {
          const date = new Date(d.date);
          const dateKey = date.toISOString(); // Use ISO string as map key for uniqueness
          const price = parseFloat(d.price);
          symbolSet.add(d.symbol);

          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { date });
          }

          const entry = dateMap.get(dateKey);
          if (entry) {
            entry[d.symbol] = price;
          }
        });
        // Convert map to sorted array
        const formattedData = Array.from(dateMap.values()).sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        );

        setData(formattedData);
        setSymbols(Array.from(symbolSet));
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, symbols, loading };
}
