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
      data: { url: "/penguins.json" },
      width: 280,
      title: {
        text: "Penguin Body Mass Distribution",
        fontSize: 22,
        anchor: "middle",
        offset: 25,
        font: "sans-serif",
      },
      vconcat: [
        {
          title: { text: "Adelie", anchor: "start", fontSize: 16, offset: 5 },
          transform: [
            { filter: "datum.Species === 'Adelie'" },
            { density: "Body Mass (g)", extent: [2500, 6500] },
          ],
          width: 280,
          height: 100,
          mark: {
            type: "area",
            color: "#4c78a8",
            fillOpacity: 0.8,
            stroke: "#4c78a8",
            strokeWidth: 2,
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              axis: null,
              scale: { domain: [2500, 6500] },
            },
            y: { field: "density", type: "quantitative", axis: null },
          },
        },
        {
          title: {
            text: "Chinstrap",
            anchor: "start",
            fontSize: 16,
            offset: 5,
          },
          transform: [
            { filter: "datum.Species === 'Chinstrap'" },
            { density: "Body Mass (g)", extent: [2500, 6500] },
          ],
          width: 280,
          height: 100,
          mark: {
            type: "area",
            color: "#f58518",
            fillOpacity: 0.8,
            stroke: "#f58518",
            strokeWidth: 2,
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              axis: null,
              scale: { domain: [2500, 6500] },
            },
            y: { field: "density", type: "quantitative", axis: null },
          },
        },
        {
          title: { text: "Gentoo", anchor: "start", fontSize: 16, offset: 5 },
          transform: [
            { filter: "datum.Species === 'Gentoo'" },
            { density: "Body Mass (g)", extent: [2500, 6500] },
          ],
          width: 280,
          height: 100,
          mark: {
            type: "area",
            color: "#e45756",
            fillOpacity: 0.8,
            stroke: "#e45756",
            strokeWidth: 2,
          },
          encoding: {
            x: {
              field: "value",
              type: "quantitative",
              title: "Body Mass (g)",
              scale: { domain: [2500, 6500] },
              axis: {
                grid: true,
                gridOpacity: 0.1,
                labelFontSize: 12,
                titleFontSize: 14,
                tickCount: 5,
                orient: "bottom",
              },
            },
            y: { field: "density", type: "quantitative", axis: null },
          },
        },
      ],
      config: {
        concat: { spacing: 20 },
        view: { stroke: null },
      },
    };

    vegaEmbed(containerRef.current, spec, { actions: false }).catch(
      console.error,
    );
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start py-4 bg-white overflow-y-auto">
      <div ref={containerRef} className="w-full flex justify-center mt-8" />
      <div className="px-8 mt-6 pb-12 text-zinc-600 text-sm italic text-center leading-relaxed">
        This chart shows the probability density of body mass for three penguin
        species. Gentoos are significantly heavier than Adelie and Chinstrap
        penguins.
      </div>
    </div>
  );
}
