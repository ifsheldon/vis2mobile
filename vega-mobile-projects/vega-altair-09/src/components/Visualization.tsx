"use client";

import {
  Bar,
  BarChart,
  Cell,
  ErrorBar,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { data, type SiteData } from "@/lib/data";

const COLORS = {
  1931: "#6366f1", // Indigo-500
  1932: "#f97316", // Orange-500
};

export function Visualization() {
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Barley Yields
        </h1>
        <div className="flex items-center gap-6 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[1931] }}
            />
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              1931
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[1932] }}
            />
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              1932
            </span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {data.map((site) => (
          <SiteCard key={site.site} site={site} />
        ))}
        {/* Bottom spacer for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

function SiteCard({ site }: { site: SiteData }) {
  // Transform data for Recharts
  const chartData = site.years.map((y) => ({
    year: y.year,
    meanYield: y.meanYield,
    // ErrorBar expects [errorMinus, errorPlus]
    errorRange: [y.meanYield - y.ciMin, y.ciMax - y.meanYield],
  }));

  // Sort by year to ensure consistent order
  chartData.sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 truncate">
        {site.site}
      </h3>
      <div className="h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" domain={[0, 65]} hide />
            <YAxis type="category" dataKey="year" hide width={1} />
            <Bar
              dataKey="meanYield"
              radius={[0, 4, 4, 0]}
              barSize={24}
              isAnimationActive={true}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={COLORS[entry.year as keyof typeof COLORS]}
                />
              ))}
              <ErrorBar
                dataKey="errorRange"
                direction="x"
                strokeWidth={2}
                stroke="currentColor"
                className="text-zinc-900 dark:text-white opacity-40"
                width={4}
              />
              <LabelList
                dataKey="meanYield"
                position="right"
                formatter={(val: number) => val.toFixed(1)}
                className="fill-zinc-600 dark:fill-zinc-400 text-xs font-medium"
                offset={8}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
