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
      description: "US County Unemployment Rates",
      width: "container",
      height: 300,
      data: {
        url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json",
        format: { feature: "counties", type: "topojson" },
      },
      transform: [
        {
          lookup: "id",
          from: {
            data: {
              url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment.tsv",
            },
            key: "id",
            fields: ["rate"],
          },
        },
      ],
      projection: { type: "albersUsa" },
      mark: {
        type: "geoshape",
        stroke: "#ffffff",
        strokeWidth: 0.1,
      },
      encoding: {
        color: {
          field: "rate",
          type: "quantitative",
          scale: { scheme: "viridis" },
          legend: {
            orient: "bottom",
            title: "Unemployment Rate (%)",
            direction: "horizontal",
            gradientLength: 250,
            titleFontSize: 12,
            labelFontSize: 10,
            format: ".0%",
          },
        },
        tooltip: [
          { field: "rate", type: "quantitative", title: "Rate", format: ".1%" },
        ],
      },
      config: {
        view: { stroke: null },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      mode: "vega-lite",
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white">
      <h1 className="text-lg font-bold text-center mb-2 text-zinc-800">
        U.S. County Unemployment
      </h1>
      <p className="text-xs text-center text-zinc-500 mb-4">
        Interactive map showing unemployment rates across the United States.
      </p>
      <div ref={containerRef} className="w-full grow" />
      <div className="mt-4 p-2 bg-zinc-50 rounded-lg">
        <p className="text-[10px] text-zinc-400 leading-tight italic">
          Note: Small counties may be difficult to see on mobile. Use landscape
          mode or zoom for more detail if available.
        </p>
      </div>
    </div>
  );
}
