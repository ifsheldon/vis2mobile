"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import { carData, originTotals } from "@/lib/data";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Enhance data with total counts for display
    const enhancedData = carData.map((d) => ({
      ...d,
      OriginWithTotal: `${d.Origin}`,
      TotalCount: originTotals[d.Origin as keyof typeof originTotals],
      CylindersStr: `${d.Cylinders} Cyl`,
      Percentage: `${((d.Count / originTotals[d.Origin as keyof typeof originTotals]) * 100).toFixed(1)}%`,
    }));

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Distribution of Car Cylinders by Origin",
      data: {
        values: enhancedData,
      },
      width: "container",
      height: 50,
      spacing: 40,
      facet: {
        field: "Origin",
        type: "nominal",
        columns: 1,
        sort: ["USA", "Japan", "Europe"],
        header: {
          title: null,
          labelFontSize: 18,
          labelFontWeight: "bold",
          labelPadding: 10,
          labelAlign: "left",
          labelAnchor: "start",
          labelColor: "#111827",
        },
      },
      spec: {
        layer: [
          {
            mark: {
              type: "bar",
              tooltip: true,
              cornerRadius: 6,
              height: 36,
            },
            encoding: {
              x: {
                field: "Count",
                type: "quantitative",
                stack: "normalize",
                axis: null,
              },
              color: {
                field: "Cylinders",
                type: "ordinal",
                scale: {
                  scheme: "viridis",
                },
                legend: {
                  orient: "bottom",
                  title: "Cylinders",
                  titleFontSize: 13,
                  labelFontSize: 12,
                  symbolType: "circle",
                  direction: "horizontal",
                  columns: 5,
                },
              },
              tooltip: [
                { field: "Origin", type: "nominal" },
                {
                  field: "Cylinders",
                  type: "quantitative",
                  title: "Cylinders",
                },
                {
                  field: "Count",
                  type: "quantitative",
                  title: "Number of Cars",
                },
                { field: "Percentage", type: "nominal", title: "Percentage" },
              ],
            },
          },
          {
            mark: {
              type: "text",
              baseline: "middle",
              fontSize: 11,
              color: "white",
              fontWeight: "600",
              dy: 0,
            },
            encoding: {
              x: {
                field: "Count",
                type: "quantitative",
                stack: "normalize",
              },
              text: {
                field: "Cylinders",
                type: "nominal",
              },
              detail: { field: "Cylinders" },
              opacity: {
                condition: { test: "datum.Count > 10", value: 1 },
                value: 0,
              },
            },
          },
        ],
      },
      config: {
        view: { stroke: null },
        axis: { domain: false, ticks: false, grid: false },
      },
    };

    vegaEmbed(containerRef.current, spec, { actions: false }).catch(
      console.error,
    );
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50 overflow-y-auto pb-10 font-sans">
      <div className="bg-white p-6 border-b border-zinc-200 shadow-sm">
        <h1 className="text-2xl font-black text-zinc-900 leading-tight">
          Cylinder Distribution
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Comparative engine sizes by manufacturing origin (USA, Japan, Europe).
        </p>
      </div>

      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {["USA", "Japan", "Europe"].map((origin) => (
            <div
              key={origin}
              className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                {origin}
              </div>
              <div className="text-xl font-black text-zinc-900">
                {originTotals[origin as keyof typeof originTotals]}
              </div>
              <div className="text-[10px] text-zinc-500">Total Cars</div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <div ref={containerRef} className="w-full"></div>
        </div>
      </div>

      <div className="mt-auto px-6 py-4 text-[10px] text-zinc-400 border-t border-zinc-100 flex justify-between items-center">
        <span>SOURCE: ALTAIR GALLERY</span>
        <span>2026 ANALYTICS</span>
      </div>
    </div>
  );
}
