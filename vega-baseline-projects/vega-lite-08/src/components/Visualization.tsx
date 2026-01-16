"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";
import type { TopLevelSpec } from "vega-lite";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: TopLevelSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Binned heatmap of movie ratings.",
      data: { url: "/movies.json" },
      transform: [
        {
          filter: {
            and: [
              { field: "IMDB Rating", valid: true },
              { field: "Rotten Tomatoes Rating", valid: true },
            ],
          },
        },
      ],
      width: "container",
      height: 300,
      autosize: { type: "fit", contains: "padding" },
      mark: {
        type: "rect",
        tooltip: true,
        stroke: "white",
        strokeWidth: 0.5,
      },
      encoding: {
        x: {
          bin: { maxbins: 20 },
          field: "IMDB Rating",
          type: "quantitative",
          title: "IMDB Rating →",
          axis: {
            labelFontSize: 11,
            titleFontSize: 12,
            titlePadding: 10,
            grid: false,
            tickCount: 5,
          },
        },
        y: {
          bin: { maxbins: 20 },
          field: "Rotten Tomatoes Rating",
          type: "quantitative",
          title: "Rotten Tomatoes →",
          axis: {
            labelFontSize: 11,
            titleFontSize: 12,
            titlePadding: 10,
            grid: false,
            tickCount: 5,
          },
        },
        color: {
          aggregate: "count",
          type: "quantitative",
          title: "Number of Movies",
          scale: {
            scheme: "magma",
            reverse: true,
          },
          legend: {
            orient: "bottom",
            direction: "horizontal",
            gradientLength: 200,
            labelFontSize: 10,
            titleFontSize: 11,
            titlePadding: 10,
            offset: 20,
          },
        },
      },
      config: {
        view: { stroke: "transparent" },
        axis: {
          domain: true,
          domainColor: "#e5e7eb",
          tickColor: "#e5e7eb",
        },
        font: "sans-serif",
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      // biome-ignore lint/suspicious/noExplicitAny: Theme 'pure' is valid but not typed
      theme: "pure" as any,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-zinc-900 text-white">
        <h1 className="text-xl font-bold tracking-tight">
          Ratings Correlation
        </h1>
        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
          IMDB vs. Rotten Tomatoes
        </p>
      </div>

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        {/* Visualization Container */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-2 shadow-sm">
          <div ref={containerRef} className="w-full" />
        </div>

        {/* Description */}
        <div className="mt-8 space-y-4 px-2">
          <section>
            <h2 className="text-sm font-bold text-zinc-900 mb-1 flex items-center">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
              How to read this
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Each square represents a range of ratings. Brighter colors
              indicate more movies in that rating bracket.
            </p>
          </section>

          <section className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">
              Key Observation
            </h3>
            <p className="text-sm text-indigo-800 leading-relaxed font-medium">
              The strong diagonal cluster shows that critics and fans often
              agree, though Rotten Tomatoes tends to be more "all or nothing" in
              its scores.
            </p>
          </section>
        </div>
      </div>

      {/* Footer Padding */}
      <div className="h-8 w-full shrink-0" />
    </div>
  );
}
