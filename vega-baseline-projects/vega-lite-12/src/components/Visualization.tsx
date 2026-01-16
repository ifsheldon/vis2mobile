"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Seattle Weather: Temperature and Precipitation",
      data: { url: "https://vega.github.io/editor/data/weather.csv" },
      transform: [{ filter: "datum.location == 'Seattle'" }],
      vconcat: [
        {
          width: 280,
          height: 200,
          title: {
            text: "Avg. Temperature Range",
            subtitle: "Max and Min Temperature (°C)",
            anchor: "start",
            fontSize: 16,
            subtitleFontSize: 12,
          },
          mark: { opacity: 0.3, type: "area", color: "#85C5A6" },
          encoding: {
            x: {
              timeUnit: "month",
              field: "date",
              axis: { format: "%b", title: null, labelAngle: 0 },
            },
            y: {
              aggregate: "average",
              field: "temp_max",
              scale: { domain: [0, 30] },
              title: "Temp (°C)",
            },
            y2: { aggregate: "average", field: "temp_min" },
          },
        },
        {
          width: 280,
          height: 200,
          title: {
            text: "Average Precipitation",
            subtitle: "Monthly precipitation in inches",
            anchor: "start",
            fontSize: 16,
            subtitleFontSize: 12,
            offset: 20,
          },
          mark: {
            stroke: "#85A9C5",
            type: "line",
            interpolate: "monotone",
            strokeWidth: 3,
          },
          encoding: {
            x: {
              timeUnit: "month",
              field: "date",
              axis: { format: "%b", title: "Month", labelAngle: 0 },
            },
            y: {
              aggregate: "average",
              field: "precipitation",
              title: "Precipitation (in)",
            },
          },
        },
      ],
      spacing: 60,
      config: {
        view: { stroke: "transparent" },
        axis: {
          grid: true,
          gridColor: "#f0f0f0",
          labelColor: "#666",
          titleColor: "#333",
          tickColor: "#ccc",
        },
      },
    };

    if (containerRef.current) {
      vegaEmbed(containerRef.current, spec, {
        actions: false,
        renderer: "svg",
      }).catch(console.error);
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center bg-white overflow-y-auto pt-12 pb-8">
      <div className="px-4 w-full">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Seattle Weather
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          Annual climate patterns for Seattle, WA. Temperatures are shown as an
          average range between monthly highs and lows.
        </p>
      </div>
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
