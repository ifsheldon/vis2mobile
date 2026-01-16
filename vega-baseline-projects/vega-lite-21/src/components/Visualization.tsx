"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Horsepower distribution by number of cylinders.",
      data: { url: "https://vega.github.io/editor/data/cars.json" },
      width: 260,
      height: 400,
      padding: { top: 10, left: 10, right: 10, bottom: 10 },
      layer: [
        {
          mark: {
            type: "tick",
            thickness: 2,
            size: 30,
            opacity: 0.4,
            orient: "horizontal",
          },
          encoding: {
            y: {
              field: "Horsepower",
              type: "quantitative",
              title: "Horsepower (HP)",
              scale: { zero: false },
              axis: {
                grid: true,
                gridDash: [4, 4],
                gridColor: "#e2e8f0",
                labelFontSize: 12,
                titleFontSize: 14,
                titleFontWeight: 600,
                titlePadding: 15,
              },
            },
            x: {
              field: "Cylinders",
              type: "ordinal",
              title: "Cylinders",
              axis: {
                labelFontSize: 13,
                titleFontSize: 14,
                titleFontWeight: 600,
                labelAngle: 0,
                titlePadding: 15,
              },
            },
            color: {
              field: "Cylinders",
              type: "nominal",
              scale: { scheme: "viridis" },
              legend: null,
            },
            tooltip: [
              { field: "Name", type: "nominal", title: "Car" },
              { field: "Horsepower", type: "quantitative", title: "HP" },
              { field: "Cylinders", type: "ordinal" },
              { field: "Origin", type: "nominal" },
            ],
          },
        },
        {
          mark: {
            type: "tick",
            thickness: 4,
            size: 40,
            color: "#000",
            opacity: 0.8,
          },
          encoding: {
            y: {
              field: "Horsepower",
              type: "quantitative",
              aggregate: "median",
            },
            x: {
              field: "Cylinders",
              type: "ordinal",
            },
          },
        },
      ],
      config: {
        background: "transparent",
        view: { stroke: null },
        axis: {
          domain: false,
          ticks: false,
        },
      },
    };

    vegaEmbed(containerRef.current, spec, { actions: false }).catch(
      console.error,
    );
  }, []);

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex flex-col items-center overflow-y-auto pt-16 pb-12">
      <div className="px-6 w-full">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Power vs. Cylinders
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Analyzing horsepower distribution across engine types.
        </p>
      </div>

      <div className="flex-1 w-full flex justify-center mt-6">
        <div ref={containerRef} className="w-full max-w-[320px]"></div>
      </div>

      <div className="px-6 mt-6 w-full border-t border-zinc-100 dark:border-zinc-800 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Dataset Insight
          </span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Most 4-cylinder cars concentrate below 100 HP, while 8-cylinder
          engines show a broad range extending up to 230 HP.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 w-6 bg-zinc-900 dark:bg-zinc-100 rounded-full"></div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            Median Horsepower
          </span>
        </div>
      </div>
    </div>
  );
}
