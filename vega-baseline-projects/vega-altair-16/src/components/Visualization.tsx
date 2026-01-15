"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import disastersData from "@/lib/disasters.json";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.1.0.json",
      description: "Global Deaths from Natural Disasters (1900-2017)",
      data: {
        values: disastersData,
      },
      config: {
        view: { stroke: null },
        axis: {
          labelFontSize: 11,
          titleFontSize: 12,
          grid: false,
          labelFont: "sans-serif",
        },
        axisX: {
          grid: false,
          labelPadding: 10,
          tickCount: 10,
          domain: true,
          domainColor: "#ddd",
        },
        axisY: {
          domain: false,
          offset: 5,
          ticks: false,
          labelPadding: 10,
          labelFontWeight: "bold",
        },
      },
      width: 1400,
      height: 400,
      // Removed title from here as it's handled in React
      mark: {
        type: "circle",
        opacity: 0.9, // Increased opacity
        stroke: "white",
        strokeWidth: 0.5,
      },
      encoding: {
        x: {
          field: "Year",
          type: "temporal",
          scale: { domain: ["1899", "2018"] },
          title: "Year",
          axis: {
            format: "%Y",
            labelAngle: 0,
            grid: true,
            gridDash: [2, 2],
            gridColor: "#eee",
          },
        },
        y: {
          field: "Entity",
          type: "nominal",
          sort: { field: "Deaths", op: "sum", order: "descending" },
          title: null,
        },
        size: {
          field: "Deaths",
          type: "quantitative",
          scale: {
            type: "sqrt",
            range: [20, 5000], // Slightly larger range
          },
          legend: {
            title: "Annual Deaths",
            format: "s",
            orient: "bottom",
            offset: 30,
            direction: "horizontal",
            symbolFillColor: "#777",
          },
        },
        color: {
          field: "Entity",
          type: "nominal",
          scale: { scheme: "category10" },
          legend: null,
        },
        tooltip: [
          { field: "Entity", type: "nominal" },
          { field: "Year", type: "temporal", format: "%Y" },
          { field: "Deaths", type: "quantitative", format: "," },
        ],
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Title Section */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-xl font-bold text-zinc-900 leading-tight">
          Natural Disaster Mortality
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Bubble size represents annual deaths by disaster type (1900–2017)
        </p>
      </div>

      {/* Chart Section */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-2">
        <div className="min-w-max">
          <div ref={containerRef}></div>
        </div>
      </div>

      {/* Insight & Legend Helper */}
      <div className="px-6 py-6 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-start space-x-3 mb-4">
          <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            <span className="font-bold text-zinc-800">Insight:</span> The early
            20th century saw extreme mortality from{" "}
            <span className="text-blue-600 font-semibold">Droughts</span> and{" "}
            <span className="text-orange-600 font-semibold">Epidemics</span>.
            Modern deaths are often lower despite higher frequency, thanks to
            better infrastructure.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-zinc-200 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center">
              <span className="mr-2">←</span> Swipe to Explore Timeline{" "}
              <span className="ml-2">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
