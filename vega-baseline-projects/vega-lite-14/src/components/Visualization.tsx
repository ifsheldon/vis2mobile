"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import type { VisualizationSpec } from "vega-embed";
import { weatherData } from "@/lib/weatherData";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Weekly Weather Observations and Predictions",
      title: {
        text: "Weekly Weather",
        subtitle: ["Observations and Predictions", ""],
        fontSize: 20,
        anchor: "start",
        offset: 20,
      },
      data: {
        values: weatherData,
      },
      width: "container" as any,
      height: 450,
      padding: { left: 10, right: 20, top: 10, bottom: 10 },
      config: {
        axis: {
          labelFontSize: 12,
          titleFontSize: 14,
          domain: false,
        },
        view: { stroke: "transparent" },
      },
      encoding: {
        y: {
          field: "id",
          type: "ordinal",
          axis: {
            title: null,
            labelExpr:
              "datum.label == 0 ? 'M' : datum.label == 1 ? 'T' : datum.label == 2 ? 'W' : datum.label == 3 ? 'T' : datum.label == 4 ? 'F' : datum.label == 5 ? 'S' : datum.label == 6 ? 'S' : datum.label == 7 ? 'M' : datum.label == 8 ? 'T' : 'W'",
            ticks: false,
            labelPadding: 10,
            labelFontSize: 14,
            labelFontWeight: "bold",
          },
        } as any,
        x: {
          type: "quantitative",
          scale: { domain: [10, 75] },
          axis: {
            title: "Temperature (°F)",
            grid: true,
            orient: "bottom",
          },
        } as any,
      },
      layer: [
        {
          mark: {
            type: "bar",
            height: 28,
            color: "#f1f1f1",
            cornerRadius: 4,
            tooltip: true,
          },
          encoding: {
            x: { field: "record.low" },
            x2: { field: "record.high" },
          },
        },
        {
          mark: {
            type: "bar",
            height: 28,
            color: "#d4d4d8",
            cornerRadius: 4,
            tooltip: true,
          },
          encoding: {
            x: { field: "normal.low" },
            x2: { field: "normal.high" },
          },
        },
        {
          mark: {
            type: "bar",
            height: 16,
            color: "#27272a",
            cornerRadius: 2,
            tooltip: true,
          },
          encoding: {
            x: { field: "actual.low" },
            x2: { field: "actual.high" },
          },
        },
        {
          mark: {
            type: "bar",
            height: 16,
            color: "#27272a",
            cornerRadius: 2,
            tooltip: true,
          },
          encoding: {
            x: { field: "forecast.low.low" },
            x2: { field: "forecast.low.high" },
          },
        },
        {
          mark: { type: "bar", height: 4, color: "#27272a", tooltip: true },
          encoding: {
            x: { field: "forecast.low.high" },
            x2: { field: "forecast.high.low" },
          },
        },
        {
          mark: {
            type: "bar",
            height: 16,
            color: "#27272a",
            cornerRadius: 2,
            tooltip: true,
          },
          encoding: {
            x: { field: "forecast.high.low" },
            x2: { field: "forecast.high.high" },
          },
        },
      ],
    };

    vegaEmbed(containerRef.current, spec, { actions: false }).catch(
      console.error,
    );
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-white overflow-y-auto">
      <div ref={containerRef} className="w-full" />

      <div className="mt-8 grid grid-cols-1 gap-3 px-2 border-t pt-6 border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#f1f1f1] border border-zinc-200" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700">
              Record Range
            </span>
            <span className="text-xs text-zinc-400">
              Historical extreme high and low
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#d4d4d8]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700">
              Normal Range
            </span>
            <span className="text-xs text-zinc-400">
              Typical historical average
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#27272a]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700">
              Actual / Forecast
            </span>
            <span className="text-xs text-zinc-400">
              Observed or predicted for the day
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-zinc-50 rounded-xl">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="font-semibold text-zinc-700">How to read:</span> This
          chart compares daily temperature ranges against historical records and
          averages. Narrower dark bars show the actual range (or forecast range
          in two segments).
        </p>
      </div>
    </div>
  );
}
