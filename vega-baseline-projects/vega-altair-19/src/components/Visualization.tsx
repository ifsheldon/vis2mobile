"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import vegaEmbed from "vega-embed";
import { ellipseData, pointData } from "@/lib/data";

export function Visualization() {
  const visRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Deviation ellipses for penguin species.",
      width: "container",
      height: 350,
      padding: { left: 5, right: 5, top: 10, bottom: 10 },
      layer: [
        {
          data: { values: ellipseData },
          mark: {
            type: "line",
            fillOpacity: 0.15,
            filled: true,
            strokeWidth: 2,
          },
          encoding: {
            color: {
              field: "Species",
              type: "nominal",
              scale: {
                range: ["#FF8C00", "#9932CC", "#008B8B"],
              },
            },
            order: { field: "order", type: "quantitative" },
            x: {
              field: "Flipper Length (mm)",
              scale: { zero: false },
              type: "quantitative",
              axis: { title: "Flipper Length (mm)", titlePadding: 10 },
            },
            y: {
              field: "Body Mass (g)",
              scale: { zero: false },
              type: "quantitative",
              axis: { title: "Body Mass (g)", titlePadding: 10 },
            },
          },
        },
        {
          data: { values: pointData },
          mark: {
            type: "circle",
            size: 40,
            tooltip: true,
            opacity: 0.7,
          },
          encoding: {
            color: { field: "Species", type: "nominal" },
            x: {
              field: "Flipper Length (mm)",
              type: "quantitative",
            },
            y: {
              field: "Body Mass (g)",
              type: "quantitative",
            },
          },
        },
      ],
      config: {
        background: "transparent",
        axis: {
          labelFontSize: 11,
          titleFontSize: 12,
          gridColor: "#efefef",
          tickColor: "#ccc",
          domainColor: "#ccc",
        },
        legend: {
          labelFontSize: 12,
          titleFontSize: 12,
          orient: "bottom",
          offset: 20,
          symbolSize: 100,
          columns: 3,
          columnPadding: 10,
        },
      },
    };

    vegaEmbed(visRef.current, spec, {
      actions: false,
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 p-4 pt-12 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Penguin Species
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Body Mass vs Flipper Length Distribution
        </p>
      </div>

      <div className="flex-1 min-h-[450px] w-full">
        <div ref={visRef} className="w-full" />
      </div>

      <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          Key Insights
        </h2>
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-disc pl-4">
          <li>
            <strong>Gentoo</strong> penguins are significantly larger in both
            flipper length and body mass.
          </li>
          <li>
            <strong>Adelie</strong> and <strong>Chinstrap</strong> species show
            considerable overlap in their physical dimensions.
          </li>
          <li>
            The <strong>ellipses</strong> represent the 95% deviation for each
            species group.
          </li>
        </ul>
      </div>

      <div className="mt-auto pt-6 text-[10px] text-center text-zinc-400 uppercase tracking-widest pb-4">
        Palmer Penguins Dataset
      </div>
    </div>
  );
}
