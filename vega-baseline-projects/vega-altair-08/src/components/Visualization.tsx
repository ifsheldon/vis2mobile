"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAggregatedData, sites } from "@/lib/data";

const COLORS = [
  "#4e79a7",

  "#f28e2c",

  "#e15759",

  "#76b7b2",

  "#59a14f",

  "#edc949",
];

export function Visualization() {
  const data = getAggregatedData().map((d) => {
    const total = sites.reduce(
      (sum, site) => sum + ((d[site] as number) || 0),
      0,
    );

    return { ...d, total };
  });

  return (
    <div className="w-full h-full flex flex-col bg-white p-4 pt-10">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-zinc-800 leading-tight">
          Crop Yields by Variety
        </h1>

        <p className="text-xs text-zinc-500 mt-1">
          Summed yield (1931-1932) across different sites
        </p>
      </div>

      <div className="flex-1 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
            barSize={24}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#f0f0f0"
            />

            <XAxis type="number" hide />

            <YAxis
              dataKey="variety"
              type="category"
              tick={{ fontSize: 11, fill: "#3f3f46", fontWeight: 500 }}
              width={110}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value: number) => value.toFixed(1)}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={80}
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-4 px-2">
                  {payload?.map((entry) => (
                    <div key={entry.value} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: entry.color }}
                      />

                      <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />

            {sites.map((site, index) => (
              <Bar
                key={site}
                dataKey={site}
                stackId="a"
                fill={COLORS[index % COLORS.length]}
              >
                {/* Only show labels on larger bars to avoid clutter */}

                <LabelList
                  dataKey={site}
                  position="inside"
                  formatter={(val: number) => (val > 40 ? val.toFixed(0) : "")}
                  style={{
                    fill: "#fff",
                    fontSize: "10px",
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }}
                />
              </Bar>
            ))}

            <Bar dataKey="total" stackId="b" fill="transparent" barSize={0}>
              <LabelList
                dataKey="total"
                position="right"
                formatter={(val: number) => val.toFixed(0)}
                style={{
                  fill: "#71717a",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[9px] text-zinc-400 text-center italic">
        Source: Barley Crop Yields, University of Minnesota Agricultural
        Experiment Station
      </div>
    </div>
  );
}
