"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Connected Scatterplot of Miles Driven vs Gas Prices",
      data: {
        url: "https://vega.github.io/editor/data/driving.json",
      },
      width: "container",
      height: 450,
      autosize: { type: "fit", contains: "padding" },
      padding: { top: 20, left: 20, right: 20, bottom: 20 },
      config: {
        view: { stroke: "transparent" },
        axis: {
          labelFontSize: 12,
          titleFontSize: 14,
          grid: true,
          gridColor: "#f1f5f9",
          tickColor: "#e2e8f0",
          domainColor: "#e2e8f0",
        },
        text: {
          fontSize: 12,
          fontWeight: 500,
          fill: "#475569",
        },
      },
      layer: [
        {
          mark: {
            type: "line",
            point: {
              size: 40,
              color: "#2563eb",
              fill: "white",
              strokeWidth: 2,
            },
            color: "#3b82f6",
            strokeWidth: 3,
            interpolate: "monotone",
          },
          encoding: {
            x: {
              field: "miles",
              type: "quantitative",
              scale: { zero: false },
              axis: {
                title: "Miles Driven (per capita)",
                titlePadding: 15,
                labelFlush: true,
              },
            },
            y: {
              field: "gas",
              type: "quantitative",
              scale: { zero: false },
              axis: {
                title: "Gas Price ($)",
                titlePadding: 15,
                format: "$.2f",
              },
            },
            order: { field: "year" },
          },
        },
        {
          transform: [
            {
              filter:
                "datum.year % 5 === 0 || datum.year === 1956 || datum.year === 2010",
            },
          ],
          mark: {
            type: "text",
            align: { expr: "datum.side === 'left' ? 'right' : 'left'" },
            dx: { expr: "datum.side === 'left' ? -10 : 10" },
            dy: {
              expr: "datum.side === 'top' ? -10 : datum.side === 'bottom' ? 10 : 0",
            },
            baseline: {
              expr: "datum.side === 'top' ? 'bottom' : datum.side === 'bottom' ? 'top' : 'middle'",
            },
          },
          encoding: {
            x: { field: "miles", type: "quantitative" },
            y: { field: "gas", type: "quantitative" },
            text: { field: "year", type: "quantitative" },
          },
        },
      ],
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
      tooltip: true,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full bg-white flex flex-col p-6 overflow-y-auto font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Driving & Gas
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          The complex dance between fuel costs and how much Americans drive.
        </p>
      </header>

      <main className="flex-grow flex flex-col items-center">
        <div ref={containerRef} className="w-full" />
      </main>

      <footer className="mt-8 space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800 font-medium">
            Historical Context
          </p>
          <p className="text-sm text-blue-700 mt-1 leading-snug">
            The path loops and turns, reflecting events like the 1973 Oil Crisis
            and the 1979 energy shortage.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Start Year
            </p>
            <p className="text-lg font-bold text-slate-700">1956</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              End Year
            </p>
            <p className="text-lg font-bold text-slate-700">2010</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center italic">
          Data Source: driving.json (Vega Dataset)
        </p>
      </footer>
    </div>
  );
}
