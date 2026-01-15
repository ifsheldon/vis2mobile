"use client";

import { useEffect, useRef } from "react";

import vegaEmbed, { type VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      data: {
        url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/sp500.csv",
      },
      vconcat: [
        {
          width: "container",
          height: 320,
          mark: {
            type: "area",
            color: "#3b82f6",
            line: { color: "#2563eb", strokeWidth: 1.5 },
            interpolate: "monotone",
          },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              scale: { domain: { param: "brush" } },
              axis: {
                title: null,
                labelFontSize: 10,
                grid: true,
                gridDash: [2, 2],
                labelOverlap: "parity",
              },
            },
            y: {
              field: "price",
              type: "quantitative",
              axis: {
                title: "S&P 500 Price (USD)",
                titleFontSize: 12,
                labelFontSize: 10,
                grid: true,
                gridDash: [2, 2],
                format: "$,.0f",
                titlePadding: 12,
                minExtent: 60,
              },
            },
          },
        },
        {
          width: "container",
          height: 60,
          name: "brush_view",
          mark: {
            type: "area",
            color: "#93c5fd",
            line: { color: "#60a5fa", strokeWidth: 1 },
            interpolate: "monotone",
          },
          params: [
            {
              name: "brush",
              select: {
                type: "interval",
                encodings: ["x"],
              },
              value: {
                x: [
                  { year: 2007, month: 6, date: 30 },
                  { year: 2009, month: 6, date: 30 },
                ],
              },
            },
          ],
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              axis: {
                title: "Drag to filter time range",
                titleFontSize: 11,
                titleFontWeight: "normal",
                titlePadding: 10,
                labelFontSize: 9,
                labelOverlap: "parity",
                tickCount: 5,
              },
            },
            y: {
              field: "price",
              type: "quantitative",
              axis: { visible: false, minExtent: 60 },
            },
          },
        },
      ],
      config: {
        view: { stroke: "transparent" },
        axis: {
          domain: false,
          tickSize: 4,
        },
        concat: { spacing: 30 },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      responsive: true,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 p-5 pt-14 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          S&P 500 Performance
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Interactive stock price history
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div ref={containerRef} className="w-full flex-1" />
      </div>

      <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          How to use
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Swipe or drag across the smaller bottom chart to focus on a specific
          time period. The top chart will update instantly to show the detail.
        </p>
      </div>

      <div className="mt-8 text-center">
        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
          Data source: S&P Dow Jones Indices
        </span>
      </div>
    </div>
  );
}
