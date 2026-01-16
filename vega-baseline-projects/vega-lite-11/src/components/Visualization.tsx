"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { type VisualizationSpec } from "vega-embed";
import { medians, values } from "@/lib/data";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Likert Scale Ratings Distributions and Medians.",
      datasets: {
        medians: medians,
        values: values,
      },
      data: { name: "medians" },
      title: {
        text: "Questionnaire Ratings",
        fontSize: 18,
        anchor: "start",
        offset: 15,
        fontWeight: "bold",
      },
      facet: {
        row: {
          field: "name",
          type: "nominal",
          header: {
            title: null,
            labelOrient: "top",
            labelAnchor: "start",
            labelFontSize: 14,
            labelFontWeight: "bold",
            labelPadding: 4,
            labelAlign: "left",
          },
        },
      },
      spec: {
        width: 280,
        height: 40,
        layer: [
          {
            data: { name: "values" },
            transform: [{ filter: "datum.name == parent.name" }],
            mark: { type: "circle", opacity: 0.5, color: "#3b82f6" },
            encoding: {
              x: {
                field: "value",
                type: "quantitative",
                scale: { domain: [0.5, 5.5] },
                axis: {
                  grid: false,
                  values: [1, 2, 3, 4, 5],
                  title: null,
                  labelFontSize: 11,
                  ticks: true,
                },
              },
              size: {
                aggregate: "count",
                type: "quantitative",
                title: "Count",
                scale: { range: [50, 400] },
                legend: null,
              },
            },
          },
          {
            mark: { type: "tick", color: "#000", thickness: 3, size: 30 },
            encoding: {
              x: { field: "median", type: "quantitative" },
            },
          },
          {
            mark: {
              type: "text",
              align: "left",
              baseline: "top",
              dy: 12,
              fontSize: 10,
              fontStyle: "italic",
              color: "#666",
            },
            encoding: {
              text: { field: "lo" },
              x: { datum: 1, type: "quantitative" },
            },
          },
          {
            mark: {
              type: "text",
              align: "right",
              baseline: "top",
              dy: 12,
              fontSize: 10,
              fontStyle: "italic",
              color: "#666",
            },
            encoding: {
              text: { field: "hi" },
              x: { datum: 5, type: "quantitative" },
            },
          },
        ],
      },
      config: {
        view: { stroke: null },
        facet: { spacing: 30 },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full bg-white p-4 overflow-y-auto">
      <div className="flex flex-col items-center">
        <div ref={containerRef} className="w-full flex justify-center" />

        {/* Mobile-optimized Legend */}
        <div className="mt-8 p-3 border border-zinc-200 rounded-xl bg-zinc-50 w-full max-w-[300px]">
          <h3 className="text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">
            Chart Key
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 opacity-50"></div>
              </div>
              <span className="text-xs text-zinc-600">
                Circle size = Number of responses
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-black rounded-full"></div>
              <span className="text-xs text-zinc-600">
                Black line = Median rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
