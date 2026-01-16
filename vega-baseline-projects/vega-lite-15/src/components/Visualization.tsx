"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import type { VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const stocks = ["AAPL", "AMZN", "GOOG", "IBM", "MSFT"];

    // Manually creating the layers to avoid repeating the interaction rule 5 times
    const stockLayers = stocks.flatMap((stock) => [
      {
        mark: {
          type: "line",
          stroke: "white",
          strokeWidth: 4,
          interpolate: "monotone",
        },
        encoding: {
          x: {
            field: "date",
            type: "temporal",
            axis: {
              title: null,
              labelAngle: -45,
              labelFontSize: 11,
              format: "%Y",
              tickCount: 5,
            },
          },
          y: {
            field: stock,
            type: "quantitative",
          },
        },
      },
      {
        mark: {
          type: "line",
          interpolate: "monotone",
        },
        encoding: {
          x: { field: "date", type: "temporal" },
          y: {
            field: stock,
            type: "quantitative",
          },
          stroke: {
            datum: stock,
            type: "nominal",
          },
        },
      },
    ]);

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Multi-series Line Chart with Halo, optimized for mobile.",
      width: "container" as any,
      height: 350,
      padding: { left: 5, right: 5, top: 10, bottom: 10 },
      data: {
        url: "https://vega.github.io/editor/data/stocks.csv",
      },
      transform: [
        {
          pivot: "symbol",
          value: "price",
          groupby: ["date"],
        },
      ],
      layer: [
        ...stockLayers,
        {
          params: [
            {
              name: "hover",
              select: {
                type: "point",
                on: "mouseover",
                clear: "mouseout",
                nearest: true,
                encodings: ["x"],
              },
            },
          ],
          mark: { type: "rule", strokeWidth: 1, color: "#999" },
          encoding: {
            x: { field: "date", type: "temporal" },
            opacity: {
              condition: { param: "hover", value: 0.5, empty: false },
              value: 0,
            },
            tooltip: [
              {
                field: "date",
                type: "temporal",
                title: "Date",
                format: "%b %Y",
              },
              {
                field: "AAPL",
                type: "quantitative",
                title: "AAPL",
                format: ".2f",
              },
              {
                field: "AMZN",
                type: "quantitative",
                title: "AMZN",
                format: ".2f",
              },
              {
                field: "GOOG",
                type: "quantitative",
                title: "GOOG",
                format: ".2f",
              },
              {
                field: "IBM",
                type: "quantitative",
                title: "IBM",
                format: ".2f",
              },
              {
                field: "MSFT",
                type: "quantitative",
                title: "MSFT",
                format: ".2f",
              },
            ],
          },
        } as any,
      ],
      config: {
        axis: {
          domain: false,
          tickSize: 5,
        },
        axisY: {
          title: "Price ($)",
          labelFontSize: 11,
          titleFontSize: 13,
          grid: true,
          format: "s",
        },
        legend: {
          orient: "bottom",
          offset: 25,
          labelFontSize: 12,
          titleFontSize: 13,
          columns: 3,
          symbolType: "stroke",
          title: "Stock Symbol",
        },
        view: { stroke: null },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      responsive: true,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          Tech Stocks Trend
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Stock prices from 2000 to 2010
        </p>
      </div>

      <div className="flex-grow">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 rounded-full p-1 mt-0.5">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Info Icon"
            >
              <title>Information</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-800 font-semibold mb-1">
              Interactive Chart
            </p>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Tap or move your finger across the chart to see exact prices. The
              white outlines help you track individual lines in crowded areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
