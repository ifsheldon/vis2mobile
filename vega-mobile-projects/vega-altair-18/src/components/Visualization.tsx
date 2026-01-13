"use client";

import { csvParse } from "d3-dsv";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RawData {
  Date: string;
  CO2: string;
}

interface ProcessedPoint {
  scaled_date: number;
  [key: string]: number | undefined;
}

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const MAGMA_COLORS = [
  "#000004",

  "#1d1147",

  "#51127c",

  "#822681",

  "#b63679",

  "#e34f6f",

  "#fb815d",

  "#fec287",
];

export function Visualization() {
  const [data, setData] = useState<ProcessedPoint[]>([]);

  const [loading, setLoading] = useState(true);

  const [activePayload, setActivePayload] = useState<any>(null);

  const [activeLabel, setActiveLabel] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/co2-concentration.csv",
        );

        const csvText = await response.text();

        const rawData = csvParse(csvText) as unknown as RawData[];

        // Process data

        const groupedData: { [key: number]: { [key: string]: number } } = {};

        rawData.forEach((row) => {
          const date = new Date(row.Date);

          if (Number.isNaN(date.getTime())) return;

          const year = date.getFullYear();

          const month = date.getMonth();

          const co2 = parseFloat(row.CO2);

          if (Number.isNaN(co2)) return;

          const decade = Math.floor(year / 10) * 10;

          const monthIndex = (year % 10) * 12 + month;

          const scaled_date = (year % 10) + month / 12;

          if (!groupedData[monthIndex]) {
            groupedData[monthIndex] = { scaled_date };
          }

          groupedData[monthIndex][`d${decade}`] = co2;
        });

        const finalData = Object.keys(groupedData)

          .map((key) => groupedData[parseInt(key, 10)] as ProcessedPoint)

          .sort((a, b) => a.scaled_date - b.scaled_date);

        setData(finalData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMouseMove = (e: any) => {
    if (e.activePayload) {
      setActivePayload(e.activePayload);

      setActiveLabel(e.activeLabel);
    }
  };

  const handleMouseLeave = () => {
    setActivePayload(null);

    setActiveLabel(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium animate-pulse">
        Fetching atmospheric data...
      </div>
    );
  }

  // Find the latest decade value for the active point

  const latestDecadeValue = activePayload
    ? [...activePayload].sort(
        (a, b) => parseInt(b.name, 10) - parseInt(a.name, 10),
      )[0]?.value
    : null;

  const latestDecadeName = activePayload
    ? [...activePayload].sort(
        (a, b) => parseInt(b.name, 10) - parseInt(a.name, 10),
      )[0]?.name
    : null;

  return (
    <div className="flex flex-col w-full h-full bg-white font-sans overflow-hidden">
      {/* Header Section */}

      <div className="p-6 pb-2">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-none">
          CO2 ATMOSPHERE
        </h1>

        <h2 className="text-2xl font-black text-orange-500 tracking-tight leading-none mb-1">
          TRENDS
        </h2>

        <div className="h-px w-12 bg-zinc-200 my-3" />

        {/* Fixed Information Block */}

        <div className="min-h-[64px] flex items-end justify-between transition-all duration-200">
          {!activePayload ? (
            <div className="w-full">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Global Concentration
              </p>

              <p className="text-sm text-zinc-600 font-medium">
                Parts per million (ppm) by decade
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Year +{activeLabel?.toFixed(1)} in {latestDecadeName}s
                </p>

                <p className="text-3xl font-black text-zinc-900 tabular-nums">
                  {latestDecadeValue?.toFixed(2)}

                  <span className="text-sm font-bold text-zinc-400 ml-1.5 uppercase">
                    ppm
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-end pb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Comparison
                </span>

                <div className="flex -space-x-1">
                  {activePayload.slice(-3).map((entry: any, _i: number) => (
                    <div
                      key={entry.name}
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: entry.stroke }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Chart Area */}

      <div className="flex-1 w-full min-h-0 px-2 py-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseLeave}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              vertical={false}
              stroke="#f0f0f0"
            />

            <XAxis
              dataKey="scaled_date"
              type="number"
              domain={[0, 10]}
              ticks={[0, 5, 10]}
              tickFormatter={(val) => `Year ${val}`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontWeight: 600 }}
              dy={10}
            />

            <YAxis domain={[310, 420]} hide={true} />

            <Tooltip
              content={() => null} // We use the fixed header instead
              cursor={{
                stroke: "#f4f4f5",
                strokeWidth: 20,
                strokeOpacity: 0.5,
              }}
            />

            {DECADES.map((decade, index) => (
              <Line
                key={decade}
                type="monotone"
                dataKey={`d${decade}`}
                name={`${decade}`}
                stroke={MAGMA_COLORS[index]}
                strokeWidth={
                  activePayload?.some((p: any) => p.name === `${decade}`)
                    ? 3
                    : 1.5
                }
                strokeOpacity={
                  activePayload
                    ? activePayload.some((p: any) => p.name === `${decade}`)
                      ? 1
                      : 0.2
                    : 0.8
                }
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer / Legend */}

      <div className="p-6 bg-zinc-50 border-t border-zinc-100">
        <div className="grid grid-cols-4 gap-y-3 gap-x-2">
          {DECADES.map((decade, index) => (
            <div key={decade} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: MAGMA_COLORS[index] }}
              />

              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                {decade}s
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-2 bg-white/50 p-3 rounded-lg border border-zinc-200/50">
          <div className="w-1 h-8 bg-orange-400 rounded-full" />

          <p className="text-[10px] leading-tight text-zinc-500 font-medium italic">
            The seasonal "sawtooth" pattern reflects the Earth's biosphere
            breathing, superimposed on a relentless upward trend.
          </p>
        </div>
      </div>
    </div>
  );
}
