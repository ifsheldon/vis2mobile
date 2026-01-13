"use client";

import { Info } from "lucide-react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

// --- Data ---
const rawData = [
  { year: "1875", population: 1309 },
  { year: "1890", population: 1558 },
  { year: "1910", population: 4512 },
  { year: "1925", population: 8180 },
  { year: "1933", population: 15915 },
  { year: "1939", population: 24824 },
  { year: "1946", population: 28275 },
  { year: "1950", population: 29189 },
  { year: "1964", population: 29881 },
  { year: "1971", population: 26007 },
  { year: "1981", population: 24029 },
  { year: "1985", population: 23340 },
  { year: "1989", population: 22307 },
  { year: "1990", population: 22087 },
  { year: "1991", population: 22139 },
  { year: "1992", population: 22105 },
  { year: "1993", population: 22242 },
  { year: "1994", population: 22801 },
  { year: "1995", population: 24273 },
  { year: "1996", population: 25640 },
  { year: "1997", population: 27393 },
  { year: "1998", population: 29505 },
  { year: "1999", population: 32124 },
  { year: "2000", population: 33791 },
  { year: "2001", population: 35297 },
  { year: "2002", population: 36179 },
  { year: "2003", population: 36829 },
  { year: "2004", population: 37493 },
  { year: "2005", population: 38376 },
  { year: "2006", population: 39008 },
  { year: "2007", population: 39366 },
  { year: "2008", population: 39821 },
  { year: "2009", population: 40179 },
  { year: "2010", population: 40511 },
  { year: "2011", population: 40465 },
  { year: "2012", population: 40905 },
  { year: "2013", population: 41258 },
  { year: "2014", population: 41777 },
];

const events = [
  { start: 1933, end: 1945, event: "Nazi Rule", color: "#fb923c" }, // Orange-400
  { start: 1948, end: 1989, event: "GDR (East Germany)", color: "#60a5fa" }, // Blue-400
];

// Transform data for Recharts (year to number)
const data = rawData.map((d) => ({
  year: parseInt(d.year, 10),
  population: d.population,
}));

// --- Components ---

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const year = Number(label);
    const pop = payload[0].value;

    // Find if the year is within an event
    const activeEvent = events.find((e) => year >= e.start && year <= e.end);

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-zinc-200 text-xs text-zinc-800">
        <p className="font-bold mb-1">{year}</p>
        <p className="text-zinc-600 mb-1">
          Population:{" "}
          <span className="font-semibold text-zinc-900">
            {pop?.toLocaleString()}
          </span>
        </p>
        {activeEvent && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-100">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeEvent.color }}
            />
            <span className="font-medium">{activeEvent.event}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function Visualization() {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 px-4 pt-10 pb-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Falkensee Population
          </h1>
          <Info className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Impact of Historical Events (1875 - 2014)
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {events.map((e) => (
          <div key={e.event} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: e.color }}
            />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {e.event}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#e4e4e7"
              className="dark:stroke-zinc-800"
            />

            {/* Background Events */}
            {events.map((e) => (
              <ReferenceArea
                key={e.event}
                x1={e.start}
                x2={e.end}
                fill={e.color}
                fillOpacity={0.2}
              />
            ))}

            <XAxis
              dataKey="year"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 11, fill: "#71717a" }}
              ticks={[1875, 1910, 1945, 1989, 2014]}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#71717a" }}
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : value
              }
              axisLine={false}
              tickLine={false}
              width={35}
              domain={[0, 45000]}
              ticks={[0, 15000, 30000, 45000]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#a1a1aa",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Line
              type="monotone"
              dataKey="population"
              stroke="#27272a"
              strokeWidth={2.5}
              dot={{ r: 2, fill: "#27272a", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "#27272a", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer/Note */}
      <div className="mt-4 text-[10px] text-zinc-400 text-center">
        Data source: vega-lite examples
      </div>
    </div>
  );
}
