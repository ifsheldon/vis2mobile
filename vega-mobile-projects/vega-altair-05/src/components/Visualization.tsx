"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  type ProcessedDataPoint,
  processBarleyData,
  siteColors,
  sites,
} from "@/lib/data";

const chartData = processBarleyData();

interface BarClickData {
  payload: ProcessedDataPoint;
}

export function Visualization() {
  const [activeYear, setActiveYear] = useState<"1931" | "1932">("1931");
  const [selectedVariety, setSelectedVariety] =
    useState<ProcessedDataPoint | null>(null);

  const data = chartData[activeYear];

  const handleBarClick = (barData: BarClickData) => {
    setSelectedVariety(barData.payload);
  };

  return (
    <div className="w-full h-full bg-zinc-900 text-white p-4 flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-center">Barley Yield Analysis</h1>
        <div className="flex justify-center my-4">
          <ToggleGroup.Root
            type="single"
            value={activeYear}
            onValueChange={(value: "1931" | "1932") => {
              if (value) setActiveYear(value);
            }}
            className="inline-flex bg-zinc-800 rounded-md p-1"
          >
            <ToggleGroup.Item
              value="1931"
              className="px-4 py-1 rounded-md text-sm data-[state=on]:bg-zinc-600"
            >
              1931
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="1932"
              className="px-4 py-1 rounded-md text-sm data-[state=on]:bg-zinc-600"
            >
              1932
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </div>

      <div className="flex-grow w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#a1a1aa" }}
              tickLine={{ stroke: "#a1a1aa" }}
              axisLine={{ stroke: "#a1a1aa" }}
            />
            <YAxis
              type="category"
              dataKey="variety"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickLine={{ stroke: "#a1a1aa" }}
              axisLine={{ stroke: "#a1a1aa" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              contentStyle={{
                backgroundColor: "#27272a",
                border: "1px solid #3f3f46",
              }}
            />
            {sites.map((site, index) => (
              <Bar
                key={site}
                dataKey={site}
                stackId="a"
                fill={siteColors[site]}
                onClick={handleBarClick}
              >
                {data.map((_entry, entryIndex) => (
                  <Cell
                    key={`cell-${_entry.variety}-${entryIndex}`}
                    radius={
                      index === sites.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]
                    }
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-shrink-0 mt-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {sites.map((site) => (
            <div key={site} className="flex items-center text-xs">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: siteColors[site] }}
              />
              {site}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedVariety && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="absolute bottom-0 left-0 right-0 bg-zinc-800 p-4 rounded-t-lg shadow-lg"
          >
            <button
              type="button"
              onClick={() => setSelectedVariety(null)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-white"
            >
              Close
            </button>
            <h3 className="text-lg font-bold mb-2">
              {selectedVariety.variety}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {sites
                .map((site) => ({
                  site,
                  yield: selectedVariety[
                    site as keyof ProcessedDataPoint
                  ] as number,
                }))
                .sort((a, b) => b.yield - a.yield)
                .map(({ site, yield: yieldValue }) => (
                  <div key={site} className="flex justify-between">
                    <span>{site}</span>
                    <span className="font-mono">{yieldValue.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
