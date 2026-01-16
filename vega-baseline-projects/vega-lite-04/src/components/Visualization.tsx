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
      description: "Movies with IMDB Rating more than 2.5 above average",
      data: { url: "https://vega.github.io/editor/data/movies.json" },
      width: "container",
      height: 600,
      padding: { left: 10, right: 10, top: 10, bottom: 10 },
      transform: [
        { filter: "datum['IMDB Rating'] != null" },
        {
          joinaggregate: [
            { op: "mean", field: "IMDB Rating", as: "AverageRating" },
          ],
        },
        { filter: "(datum['IMDB Rating'] - datum.AverageRating) > 2.5" },
      ],
      layer: [
        {
          mark: { type: "bar", cornerRadiusEnd: 4, color: "#4f46e5" },
          encoding: {
            x: {
              field: "IMDB Rating",
              type: "quantitative",
              title: "IMDB Rating",
              scale: { domain: [0, 10] },
              axis: { grid: true, tickCount: 5 },
            },
            y: {
              field: "Title",
              type: "nominal",
              sort: "-x",
              title: null,
              axis: {
                labelFontSize: 11,
                labelLimit: 120,
                labelPadding: 10,
              },
            },
          },
        },
        {
          mark: {
            type: "text",
            align: "right",
            dx: -5,
            color: "white",
            fontWeight: "bold",
            fontSize: 10,
          },
          encoding: {
            x: { field: "IMDB Rating", type: "quantitative" },
            y: { field: "Title", type: "nominal", sort: "-x" },
            text: {
              field: "IMDB Rating",
              type: "quantitative",
              format: ".1f",
            },
          },
        },
        {
          mark: { type: "rule", color: "#ef4444", strokeDash: [4, 4], size: 2 },
          encoding: {
            x: {
              aggregate: "mean",
              field: "AverageRating",
              type: "quantitative",
            },
          },
        },
        {
          mark: {
            type: "text",
            align: "center",
            baseline: "bottom",
            dy: -5,
            color: "#ef4444",
            fontWeight: "bold",
            fontSize: 12,
          },
          encoding: {
            x: {
              aggregate: "mean",
              field: "AverageRating",
              type: "quantitative",
            },
            y: { value: 0 },
            text: { value: "Avg" },
          },
        },
      ],
      config: {
        view: { stroke: "transparent" },
        axis: { domain: false, ticks: false },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-4 flex-none">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          Elite Movies
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          IMDB Rating &gt; 2.5 points above global average.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-8">
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}
