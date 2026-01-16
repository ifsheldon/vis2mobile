"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description:
        "Source: https://vega.github.io/vega-lite/examples/layer_text_heatmap.html ",
      data: { url: "https://vega.github.io/editor/data/cars.json" },
      transform: [
        {
          aggregate: [{ op: "count", as: "num_cars" }],
          groupby: ["Origin", "Cylinders"],
        },
      ],
      width: "container",
      height: 450,
      padding: { left: 10, right: 10, top: 10, bottom: 10 },
      encoding: {
        x: {
          field: "Origin",
          type: "ordinal",
          axis: {
            labelFontSize: 15,
            titleFontSize: 16,
            titlePadding: 15,
            labelPadding: 10,
            labelAngle: 0,
            orient: "top",
            domain: false,
            ticks: false,
          },
        },
        y: {
          field: "Cylinders",
          type: "ordinal",
          axis: {
            labelFontSize: 15,
            titleFontSize: 16,
            titlePadding: 15,
            labelPadding: 10,
            domain: false,
            ticks: false,
          },
        },
      },
      layer: [
        {
          mark: {
            type: "rect",
            stroke: "white",
            strokeWidth: 2,
            cornerRadius: 4,
          },
          encoding: {
            color: {
              field: "num_cars",
              type: "quantitative",
              title: "Count of Records",
              scale: { scheme: "purples" },
              legend: {
                direction: "horizontal",
                orient: "bottom",
                gradientLength: 200,
                titleFontSize: 14,
                labelFontSize: 12,
                padding: 20,
                offset: 15,
              },
            },
          },
        },
        {
          mark: {
            type: "text",
            fontSize: 16,
            fontWeight: "bold",
            baseline: "middle",
          },
          encoding: {
            text: { field: "num_cars", type: "quantitative" },
            color: {
              condition: { test: "datum['num_cars'] < 40", value: "black" },
              value: "white",
            },
          },
        },
      ],
      config: {
        axis: { grid: false, tickBand: "extent" },
        background: "transparent",
        view: { stroke: "transparent" },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full bg-zinc-50 flex flex-col pt-14 pb-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Car Origin vs. Cylinders
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Distribution of car counts across regions
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-200 p-2">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="mt-6 text-[10px] text-zinc-400 flex justify-between items-center uppercase tracking-widest font-semibold">
        <span>Dataset: Cars</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
