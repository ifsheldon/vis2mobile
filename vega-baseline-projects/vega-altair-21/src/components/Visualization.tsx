"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { type VisualizationSpec } from "vega-embed";
import { penguinsData } from "@/lib/penguins_data";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Density plots of penguin measurements",
      data: {
        values: penguinsData,
      },
      vconcat: [
        {
          title: {
            text: "Beak Length (mm)",
            anchor: "start",
            fontSize: 16,
            offset: 10,
          },
          transform: [
            { filter: "datum['Beak Length (mm)'] !== null" },
            { density: "Beak Length (mm)" },
          ],
          width: "container",
          height: 100,
          mark: {
            type: "area",
            color: "#4c78a8",
            fillOpacity: 0.6,
            stroke: "#4c78a8",
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              title: null,
              axis: { grid: true, labelFontSize: 12, tickCount: 5 },
            },
            y: {
              field: "density",
              type: "quantitative",
              title: null,
              axis: { labels: false, ticks: false, grid: false },
            },
          },
        },
        {
          title: {
            text: "Beak Depth (mm)",
            anchor: "start",
            fontSize: 16,
            offset: 10,
          },
          transform: [
            { filter: "datum['Beak Depth (mm)'] !== null" },
            { density: "Beak Depth (mm)" },
          ],
          width: "container",
          height: 100,
          mark: {
            type: "area",
            color: "#72b7b2",
            fillOpacity: 0.6,
            stroke: "#72b7b2",
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              title: null,
              axis: { grid: true, labelFontSize: 12, tickCount: 5 },
            },
            y: {
              field: "density",
              type: "quantitative",
              title: null,
              axis: { labels: false, ticks: false, grid: false },
            },
          },
        },
        {
          title: {
            text: "Flipper Length (mm)",
            anchor: "start",
            fontSize: 16,
            offset: 10,
          },
          transform: [
            { filter: "datum['Flipper Length (mm)'] !== null" },
            { density: "Flipper Length (mm)" },
          ],
          width: "container",
          height: 100,
          mark: {
            type: "area",
            color: "#e15759",
            fillOpacity: 0.6,
            stroke: "#e15759",
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              title: null,
              axis: { grid: true, labelFontSize: 12, tickCount: 5 },
            },
            y: {
              field: "density",
              type: "quantitative",
              title: null,
              axis: { labels: false, ticks: false, grid: false },
            },
          },
        },
      ],
      config: {
        view: { stroke: null },
        concat: { spacing: 40 },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col items-center bg-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8 text-zinc-800 self-start">
        Penguin Measurements Density
      </h1>
      <div ref={containerRef} className="w-full max-w-[350px]"></div>
      <div className="mt-8 mb-8 text-xs text-zinc-500 self-start italic">
        Source: Palmer Archipelago (Antarctica) penguin data
      </div>
    </div>
  );
}
