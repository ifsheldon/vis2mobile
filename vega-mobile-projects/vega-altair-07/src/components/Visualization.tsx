import { format } from "date-fns";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartData } from "@/data";

type ChartData = (typeof chartData)[0];

const processedData = chartData.map((d) => ({
  ...d,
  monthDate: new Date(d.month),
}));

export function Visualization() {
  const [activeData, setActiveData] = useState<ChartData | null>(
    processedData[processedData.length - 1]
  );

  return (
    <div className="w-full h-full bg-zinc-900 text-white flex flex-col p-4 font-sans">
      <header className="mb-4">
        <h1 className="text-lg font-bold">US Employment Change</h1>
        <p className="text-sm text-zinc-400">Nonfarm, Monthly 2006-2015</p>
        <div className="mt-2 p-2 rounded-lg bg-zinc-800/50">
          {activeData ? (
            <>
              <p className="text-2xl font-semibold">
                {activeData.nonfarm_change.toLocaleString()}k
              </p>
              <p className="text-zinc-400">
                {format(new Date(activeData.month), "MMMM yyyy")}
              </p>
            </>
          ) : (
            <p>Scroll or touch the chart to see details</p>
          )}
        </div>
      </header>
      <div className="flex-grow w-full overflow-x-auto">
        <div style={{ width: 2000, height: "100%" }}>
          <ResponsiveContainer>
            <BarChart
              data={processedData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive && state.activePayload) {
                  setActiveData(state.activePayload[0].payload);
                }
              }}
            >
              <XAxis
                dataKey="monthDate"
                tickFormatter={(date) => format(date, "yyyy")}
                interval={11}
                tickLine={false}
                axisLine={false}
                stroke="rgb(161 161 170)"
              />
              <YAxis
                tickFormatter={(value) => `${Number(value) / 1000}k`}
                orientation="right"
                tickLine={false}
                axisLine={false}
                stroke="rgb(161 161 170)"
              />
              <Tooltip
                cursor={{ fill: "rgba(161, 161, 170, 0.2)" }}
                content={null} // Use onMouseMove to update header
              />
              <Bar dataKey="nonfarm_change">
                {processedData.map((entry) => (
                  <Cell
                    key={`cell-${entry.month}`}
                    fill={
                      entry.nonfarm_change > 0
                        ? "rgb(16 185 129)"
                        : "rgb(244 63 94)"
                    }
                    radius={
                      entry.nonfarm_change > 0
                        ? [4, 4, 0, 0]
                        : [0, 0, 4, 4]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
       <footer className="text-center text-xs text-zinc-500 pt-4">
        Scroll horizontally to explore the full timeline.
      </footer>
    </div>
  );
}
