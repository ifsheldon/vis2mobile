"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import vegaEmbed from "vega-embed";
import data from "../lib/data.json";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const symbols = Array.from(new Set(data.map((d) => d.symbol)));

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Stock prices over time with average price rules.",
      data: { values: data },
      vconcat: symbols.map((symbol) => ({
        title: {
          text: symbol,
          anchor: "start",
          fontSize: 18,
          fontWeight: 700,
          color: "#18181b",
          offset: 10,
        },
        width: "container",
        height: 140,
        layer: [
          {
            mark: {
              type: "area",
              opacity: 0.15,
              interpolate: "monotone",
              color: {
                gradient: "linear",
                x1: 1,
                y1: 1,
                x2: 1,
                y2: 0,
                stops: [
                  { offset: 0, color: "white" },
                  { offset: 1, color: "#2563eb" }, // Default blue, will be overridden by encoding if possible
                ],
              },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                title: null,
                axis: {
                  grid: false,
                  labelFontSize: 10,
                  labelColor: "#71717a",
                  format: "%Y",
                },
              },
              y: {
                field: "price",
                type: "quantitative",
                title: null,
                axis: {
                  grid: true,
                  gridColor: "#f4f4f5",
                  labelFontSize: 10,
                  labelColor: "#71717a",
                },
              },
              color: {
                datum: symbol,
                scale: {
                  domain: ["MSFT", "AMZN", "IBM", "GOOG", "AAPL"],
                  range: [
                    "#2563eb",
                    "#ea580c",
                    "#0891b2",
                    "#16a34a",
                    "#4f46e5",
                  ],
                },
                legend: null,
              },
            },
            transform: [{ filter: `datum.symbol === '${symbol}'` }],
          },
          {
            mark: {
              type: "line",
              strokeWidth: 2.5,
              interpolate: "monotone",
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
              },
              y: {
                field: "price",
                type: "quantitative",
              },
              color: {
                datum: symbol,
                scale: {
                  domain: ["MSFT", "AMZN", "IBM", "GOOG", "AAPL"],
                  range: [
                    "#2563eb",
                    "#ea580c",
                    "#0891b2",
                    "#16a34a",
                    "#4f46e5",
                  ],
                },
                legend: null,
              },
            },
            transform: [{ filter: `datum.symbol === '${symbol}'` }],
          },
          {
            mark: { type: "rule", strokeDash: [6, 4], size: 1.5, opacity: 0.8 },
            encoding: {
              y: {
                aggregate: "average",
                field: "price",
                type: "quantitative",
              },
              color: {
                datum: symbol,
                legend: null,
              },
            },
            transform: [{ filter: `datum.symbol === '${symbol}'` }],
          },
        ],
      })),
      config: {
        view: { stroke: null },
        axis: {
          domain: false,
          tickSize: 0,
        },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-white p-6 font-sans">
      <header className="mb-8 text-left">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Market Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Stock performance with historical averages
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Trend
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-blue-600/60" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Average
            </span>
          </div>
        </div>
      </header>
      <div ref={containerRef} className="w-full" />
      <div className="h-20" />{" "}
      {/* extra space at bottom for better scrolling */}
    </div>
  );
}
