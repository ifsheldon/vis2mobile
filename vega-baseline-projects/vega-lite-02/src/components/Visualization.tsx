"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import type { VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description:
        "A horizontal box plot showing body mass distribution of penguin species.",
      data: { url: "https://vega.github.io/editor/data/penguins.json" },
      width: "container",
      height: 280,
      padding: { left: 10, right: 20, top: 10, bottom: 10 },
      mark: {
        type: "boxplot",
        extent: "min-max",
        size: 40,
        ticks: { color: "#94a3b8", size: 8 },
        box: { fillOpacity: 0.8, stroke: "#475569", strokeWidth: 1 },
        median: { color: "white", thickness: 2 },
        outliers: false,
      },
      encoding: {
        y: {
          field: "Species",
          type: "nominal",
          axis: {
            title: null,
            labelFontSize: 15,
            labelFontWeight: 600,
            labelPadding: 12,
            domain: false,
            ticks: false,
          },
        },
        x: {
          field: "Body Mass (g)",
          type: "quantitative",
          scale: { zero: false, padding: 10 },
          axis: {
            title: "Body Mass (grams)",
            titleFontSize: 13,
            titleColor: "#64748b",
            titlePadding: 15,
            labelFontSize: 11,
            labelColor: "#94a3b8",
            grid: true,
            gridColor: "#f1f5f9",
            gridDash: [4, 4],
            domain: false,
            format: "~s",
            tickCount: 5,
          },
        },
        color: {
          field: "Species",
          type: "nominal",
          legend: null,
          scale: {
            range: ["#6366f1", "#f59e0b", "#10b981"],
          },
        },
      } as any, // Cast to any because vega-lite types can be tricky with boxplot
      config: {
        view: { stroke: null },
        font: "Inter, system-ui, sans-serif",
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-8 bg-indigo-500 rounded-full" />
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
            Data Analysis
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Penguin <span className="text-indigo-600">Weights</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm font-medium">
          A comparison of body mass distribution across three penguin species.
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 flex flex-col justify-center">
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100">
          <div ref={containerRef} className="w-full" />
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 pb-12 pt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100/50">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
              Heaviest
            </p>
            <p className="text-lg font-bold text-indigo-700">Gentoo</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
              Lighest
            </p>
            <p className="text-lg font-bold text-amber-700">Adelie</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl shadow-slate-200">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Key Observation
          </p>
          <p className="text-white text-[15px] leading-relaxed font-medium">
            Gentoo penguins are significantly larger than Adelie and Chinstrap
            species, with almost no overlap in their typical mass ranges.
          </p>
        </div>
      </div>
    </div>
  );
}
