"use client";

import dynamic from "next/dynamic";

const VegaEmbed = dynamic(
  () => import("react-vega").then((mod) => mod.VegaEmbed),
  { ssr: false },
);

const data = [
  {
    Species: "Adelie",
    lower: 2850,
    q1: 3350,
    median: 3700,
    q3: 4000,
    upper: 4775,
    outliers: [],
  },
  {
    Species: "Chinstrap",
    lower: 2700,
    q1: 3487.5,
    median: 3700,
    q3: 3950,
    upper: 4800,
    outliers: [2700, 4800],
  },
  {
    Species: "Gentoo",
    lower: 3950,
    q1: 4700,
    median: 5000,
    q3: 5500,
    upper: 6300,
    outliers: [],
  },
];

export function Visualization() {
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    description: "A vertical box plot of penguin body mass by species.",
    width: 280,
    height: 340,
    padding: 5,
    data: { values: data },
    encoding: {
      x: {
        field: "Species",
        type: "nominal",
        title: null,
        axis: {
          labelAngle: 0,
          labelFontSize: 13,
          labelFontWeight: "bold",
          tickSize: 0,
          labelPadding: 10,
        },
      },
      y: {
        type: "quantitative",
        title: "Body Mass (g)",
        scale: { zero: false },
        axis: {
          labelFontSize: 12,
          titleFontSize: 13,
          titlePadding: 15,
          grid: true,
          gridColor: "#f0f0f0",
        },
      },
    },
    layer: [
      {
        mark: { type: "rule", color: "#666" } as const,
        encoding: {
          y: { field: "lower" },
          y2: { field: "upper" },
        },
      },
      {
        mark: { type: "bar", size: 45, cornerRadius: 4 } as const,
        encoding: {
          y: { field: "q1" },
          y2: { field: "q3" },
          color: {
            field: "Species",
            type: "nominal",
            legend: null,
            scale: { scheme: "tableau10" },
          },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 45, thickness: 2 } as const,
        encoding: {
          y: { field: "median" },
        },
      },
      {
        transform: [{ flatten: ["outliers"] }],
        mark: {
          type: "point",
          style: "boxplot-outliers",
          size: 70,
          color: "#666",
          filled: true,
          opacity: 0.7,
        } as const,
        encoding: {
          y: { field: "outliers" },
        },
      },
    ],
    config: {
      background: "transparent",
      view: { stroke: null },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 pt-12 pb-8 px-4 overflow-y-auto">
      <div className="mb-6 px-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Penguin Species
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Body Mass Distribution Analysis
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-full flex justify-center">
          <VegaEmbed spec={spec as any} options={{ actions: false }} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-medium mb-1">
                Min
              </span>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                2,700g
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-medium mb-1">
                Median
              </span>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                3,700g
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-medium mb-1">
                Max
              </span>
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                6,300g
              </span>
            </div>
          </div>
        </div>

        <div className="px-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Key Insights
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Gentoo
                </span>{" "}
                penguins are significantly larger, with a median mass of 5,000g.
              </p>
            </li>
            <li className="flex gap-3 items-start">
              <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Chinstrap
                </span>{" "}
                penguins show the widest range with outliers at both extremes.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
