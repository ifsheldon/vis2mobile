"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import specData from "@/lib/spec.json";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Extract data from the spec's datasets
    const datasetKey = Object.keys(specData.datasets)[0];
    const data = (specData.datasets as any)[datasetKey];

    const mobileSpec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Stock prices of MSFT, AAPL, IBM, and AMZN",
      data: { values: data },
      transform: [{ filter: "datum.symbol !== 'GOOG'" }],
      // Use a vertical stack (vconcat) instead of row facet for better control on mobile
      vconcat: [
        {
          title: "MSFT",
          transform: [{ filter: "datum.symbol === 'MSFT'" }],
          width: "container",
          height: 120,
          mark: {
            type: "area",
            color: "#4c78a8",
            opacity: 0.6,
            line: { color: "#4c78a8" },
          },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              title: null,
              axis: { grid: false },
            },
            y: {
              field: "price",
              type: "quantitative",
              title: "Price ($)",
              scale: { zero: false },
            },
          },
        },
        {
          title: "AAPL",
          transform: [{ filter: "datum.symbol === 'AAPL'" }],
          width: "container",
          height: 120,
          mark: {
            type: "area",
            color: "#f58518",
            opacity: 0.6,
            line: { color: "#f58518" },
          },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              title: null,
              axis: { grid: false },
            },
            y: {
              field: "price",
              type: "quantitative",
              title: "Price ($)",
              scale: { zero: false },
            },
          },
        },
        {
          title: "IBM",
          transform: [{ filter: "datum.symbol === 'IBM'" }],
          width: "container",
          height: 120,
          mark: {
            type: "area",
            color: "#e45756",
            opacity: 0.6,
            line: { color: "#e45756" },
          },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              title: null,
              axis: { grid: false },
            },
            y: {
              field: "price",
              type: "quantitative",
              title: "Price ($)",
              scale: { zero: false },
            },
          },
        },
        {
          title: "AMZN",
          transform: [{ filter: "datum.symbol === 'AMZN'" }],
          width: "container",
          height: 120,
          mark: {
            type: "area",
            color: "#72b7b2",
            opacity: 0.6,
            line: { color: "#72b7b2" },
          },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              title: "Date",
              axis: { grid: false },
            },
            y: {
              field: "price",
              type: "quantitative",
              title: "Price ($)",
              scale: { zero: false },
            },
          },
        },
      ],
      config: {
        axis: {
          labelFontSize: 10,
          titleFontSize: 12,
          gridColor: "#efefef",
        },
        title: {
          fontSize: 14,
          anchor: "start",
          offset: 10,
        },
        view: { stroke: null },
      },
    };

    vegaEmbed(containerRef.current, mobileSpec, {
      actions: false,
      responsive: true,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4 pt-12 overflow-y-auto bg-white">
      <h1 className="text-xl font-bold mb-4 text-zinc-900 px-2">
        Stock Trends
      </h1>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
