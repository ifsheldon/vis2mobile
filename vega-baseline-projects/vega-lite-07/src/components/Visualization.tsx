"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      width: 280,
      height: 350,
      data: { url: "https://vega.github.io/editor/data/movies.json" },
      transform: [
        { bin: true, field: "IMDB Rating", as: "bin_IMDB_Rating" },
        {
          aggregate: [{ op: "count", as: "count" }],
          groupby: ["bin_IMDB_Rating", "bin_IMDB_Rating_end"],
        },
        { filter: "datum.bin_IMDB_Rating !== null" },
        {
          sort: [{ field: "bin_IMDB_Rating" }],
          window: [{ op: "sum", field: "count", as: "Cumulative Count" }],
          frame: [null, 0],
        },
      ],
      layer: [
        {
          mark: {
            type: "area",
            color: "#6366f1",
            opacity: 0.2,
            interpolate: "monotone",
          },
          encoding: {
            x: {
              field: "bin_IMDB_Rating",
              type: "quantitative",
              scale: { zero: false },
              title: "IMDB Rating",
              axis: {
                labelFontSize: 11,
                titleFontSize: 12,
                grid: false,
                tickCount: 5,
              },
            },
            y: {
              field: "Cumulative Count",
              type: "quantitative",
              title: "Cumulative Movies",
              axis: {
                labelFontSize: 11,
                titleFontSize: 12,
                titleColor: "#6366f1",
                grid: true,
                gridOpacity: 0.1,
              },
            },
          },
        },
        {
          mark: {
            type: "bar",
            color: "#f59e0b",
            opacity: 0.8,
            width: { band: 0.7 },
          },
          encoding: {
            x: {
              field: "bin_IMDB_Rating",
              type: "quantitative",
              bin: "binned",
            },
            x2: { field: "bin_IMDB_Rating_end" },
            y: {
              field: "count",
              type: "quantitative",
              title: "Movies per Bin",
              axis: {
                labelFontSize: 11,
                titleFontSize: 12,
                titleColor: "#f59e0b",
                orient: "right",
                grid: false,
              },
            },
          },
        },
      ],
      resolve: { scale: { y: "independent" } },
      config: {
        view: { stroke: "transparent" },
        font: "Inter, system-ui, sans-serif",
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950">
      <div className="p-6 pt-16 flex-none">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          IMDB Ratings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Distribution of movie ratings
        </p>
      </div>

      <div className="flex-1 px-1 flex items-center justify-center">
        <div ref={containerRef} className="w-auto mx-auto" />
      </div>

      <div className="p-6 pb-12 flex-none space-y-4">
        <div className="flex items-center gap-6 justify-center bg-zinc-50 dark:bg-zinc-900/50 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500" />
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
              Cumulative
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/80" />
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
              Frequency
            </span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed px-2">
          The area shows the total number of movies rated up to a certain point.
          The bars show the number of movies within each 1-point rating
          interval.
        </p>
      </div>
    </div>
  );
}
