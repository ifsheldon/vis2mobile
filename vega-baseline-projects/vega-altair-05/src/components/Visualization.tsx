"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import { data } from "@/lib/data";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Barley Yield Comparison",
      data: { values: data },
      facet: {
        row: {
          field: "year",
          type: "ordinal",
          title: null,
          header: { 
            labelFontSize: 16, 
            labelFontWeight: "bold", 
            labelPadding: 10,
            orient: "top",
            labelAlign: "center",
            labelColor: "#18181b"
          }
        }
      },
      spec: {
        width: 280,
        height: 200,
        mark: { type: "bar", tooltip: true },
        encoding: {
          x: {
            field: "yield",
            type: "quantitative",
            title: "Total Yield",
            axis: { 
              grid: true, 
              tickCount: 5,
              titleFontSize: 12,
              labelFontSize: 11,
              titlePadding: 10
            }
          },
          y: {
            field: "variety",
            type: "nominal",
            title: null,
            axis: { 
              labelFontSize: 10,
              labelPadding: 10,
              ticks: false,
              domain: false
            }
          },
          color: {
            field: "site",
            type: "nominal",
            title: "Site",
            legend: {
              orient: "bottom",
              columns: 2,
              titleFontSize: 12,
              labelFontSize: 11,
              offset: 30,
              symbolSize: 100,
              columnPadding: 20
            }
          }
        }
      },
      config: {
        background: "white",
        view: { stroke: "transparent" },
        style: {
          cell: { stroke: "transparent" }
        },
        facet: {
          spacing: 40
        }
      }
    };

    vegaEmbed(containerRef.current, spec, { 
      actions: false,
      renderer: "svg"
    }).catch(err => {
      console.error("Vega Error:", err);
    });
  }, []);

  return (
    <div className="w-full h-full bg-white overflow-y-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">
          Barley Yields
        </h1>
        <p className="text-sm text-zinc-500 mb-6 text-center px-4 leading-tight">
          Comparison of yields across various sites and varieties (1931 vs 1932).
        </p>
        <div ref={containerRef} className="flex justify-center w-full" />
        <div className="h-16" />
      </div>
    </div>
  );
}