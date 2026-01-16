"use client";

import { VegaEmbed } from "react-vega";

import type { VisualizationSpec } from "vega-embed";

import data from "../lib/data.json";

export function Visualization() {
  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    description:
      "Layered histogram transformed for mobile with vertical facets.",

    data: { values: data },

    width: 280,

    height: 140,

    config: {
      view: { stroke: null },

      axis: { grid: false },
    },

    transform: [
      {
        fold: ["Trial A", "Trial B", "Trial C"],

        as: ["Experiment", "Measurement"],
      },
    ],

    facet: {
      row: {
        field: "Experiment",

        type: "nominal",

        header: {
          title: null,

          labelFontSize: 16,

          labelFontWeight: "bold",

          labelPadding: 10,

          labelAlign: "left",

          labelAnchor: "start",

          labelOrient: "top",
        },
      },
    },

    spec: {
      mark: {
        type: "area",

        opacity: 0.7,

        interpolate: "monotone",

        line: { color: "white", strokeWidth: 2 },
      },

      encoding: {
        x: {
          field: "Measurement",

          type: "quantitative",

          bin: { maxbins: 30 },

          title: "Measurement Value",

          axis: {
            titleFontSize: 12,
            labelFontSize: 10,
            grid: true,
            gridOpacity: 0.1,
          },
        },

        y: {
          aggregate: "count",

          type: "quantitative",

          title: "Frequency",

          axis: {
            tickCount: 4,

            titleFontSize: 12,

            labelFontSize: 10,

            titlePadding: 10,
          },
        },

        color: {
          field: "Experiment",

          type: "nominal",

          legend: null,

          scale: {
            range: ["#4c78a8", "#f58518", "#e45756"],
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col items-center pt-12 px-4 bg-white overflow-y-auto pb-8">
      <h1 className="text-xl font-bold mb-4 text-zinc-800 self-start px-2">
        Experiment Results
      </h1>

      <p className="text-sm text-zinc-500 mb-6 self-start px-2">
        Distribution of measurements across three trials. Vertical layout for
        better readability on mobile.
      </p>

      <div className="flex-1 w-full flex justify-center">
        <VegaEmbed spec={spec} options={{ actions: false }} />
      </div>
    </div>
  );
}
