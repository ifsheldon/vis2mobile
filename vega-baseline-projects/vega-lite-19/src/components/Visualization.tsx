"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Mobile-optimized movie ratings dashboard",
      data: {
        url: "https://vega.github.io/editor/data/movies.json",
      },
      transform: [
        {
          filter:
            "datum['IMDB Rating'] != null && datum['Rotten Tomatoes Rating'] != null",
        },
      ],
      vconcat: [
        {
          title: {
            text: "Ratings Correlation",
            anchor: "start",
            fontSize: 16,
            fontWeight: 600,
            offset: 10,
            color: "#18181b",
          },
          width: "container",
          height: 220,
          mark: {
            type: "rect",
            tooltip: true,
            stroke: "white",
            strokeWidth: 0.5,
          },
          encoding: {
            x: {
              field: "IMDB Rating",
              type: "quantitative",
              bin: { maxbins: 10 },
              title: "IMDB Rating",
              axis: { grid: false, labelFontSize: 10, titleFontSize: 12 },
            },
            y: {
              field: "Rotten Tomatoes Rating",
              type: "quantitative",
              bin: { maxbins: 10 },
              title: "Rotten Tomatoes (%)",
              axis: { grid: false, labelFontSize: 10, titleFontSize: 12 },
            },
            color: {
              aggregate: "count",
              type: "quantitative",
              scale: { scheme: "magma", reverse: true },
              legend: {
                orient: "bottom",
                title: "Number of Movies",
                titleFontSize: 10,
                labelFontSize: 9,
                gradientLength: 150,
              },
            },
          },
        },
        {
          title: {
            text: "IMDB Rating Distribution",
            anchor: "start",
            fontSize: 16,
            fontWeight: 600,
            offset: 15,
            color: "#18181b",
          },
          width: "container",
          height: 140,
          transform: [
            { bin: { maxbins: 20 }, field: "IMDB Rating", as: "binned_imdb" },
          ],
          layer: [
            {
              mark: {
                type: "bar",
                color: "#3b82f6",
                opacity: 0.7,
                cornerRadiusTop: 2,
              },
              encoding: {
                x: {
                  field: "binned_imdb",
                  type: "quantitative",
                  title: "Rating",
                  scale: { domain: [0, 10] },
                  axis: { labelFontSize: 10, titleFontSize: 12 },
                },
                x2: { field: "binned_imdb_end" },
                y: {
                  aggregate: "count",
                  type: "quantitative",
                  title: "Frequency",
                  axis: {
                    titleColor: "#3b82f6",
                    labelFontSize: 10,
                    titleFontSize: 11,
                  },
                },
              },
            },
            {
              transform: [
                {
                  aggregate: [{ op: "count", as: "count" }],
                  groupby: ["binned_imdb", "binned_imdb_end"],
                },
                {
                  window: [
                    { op: "sum", field: "count", as: "cumulative_count" },
                  ],
                  sort: [{ field: "binned_imdb" }],
                },
              ],
              mark: {
                type: "area",
                color: "#ef4444",
                opacity: 0.2,
                line: { color: "#ef4444", strokeWidth: 2 },
                interpolate: "monotone",
              },
              encoding: {
                x: {
                  field: "binned_imdb",
                  type: "quantitative",
                },
                y: {
                  field: "cumulative_count",
                  type: "quantitative",
                  title: "Cumulative",
                  axis: {
                    orient: "right",
                    titleColor: "#ef4444",
                    labelFontSize: 10,
                    titleFontSize: 11,
                  },
                },
              },
            },
          ],
          resolve: { scale: { y: "independent" } },
        },
        {
          title: {
            text: "Rotten Tomatoes Distribution",
            anchor: "start",
            fontSize: 16,
            fontWeight: 600,
            offset: 15,
            color: "#18181b",
          },
          width: "container",
          height: 140,
          transform: [
            {
              bin: { maxbins: 20 },
              field: "Rotten Tomatoes Rating",
              as: "binned_rt",
            },
          ],
          layer: [
            {
              mark: {
                type: "bar",
                color: "#10b981",
                opacity: 0.7,
                cornerRadiusTop: 2,
              },
              encoding: {
                x: {
                  field: "binned_rt",
                  type: "quantitative",
                  title: "Rating (%)",
                  scale: { domain: [0, 100] },
                  axis: { labelFontSize: 10, titleFontSize: 12 },
                },
                x2: { field: "binned_rt_end" },
                y: {
                  aggregate: "count",
                  type: "quantitative",
                  title: "Frequency",
                  axis: {
                    titleColor: "#10b981",
                    labelFontSize: 10,
                    titleFontSize: 11,
                  },
                },
              },
            },
            {
              transform: [
                {
                  aggregate: [{ op: "count", as: "count" }],
                  groupby: ["binned_rt", "binned_rt_end"],
                },
                {
                  window: [
                    { op: "sum", field: "count", as: "cumulative_count" },
                  ],
                  sort: [{ field: "binned_rt" }],
                },
              ],
              mark: {
                type: "area",
                color: "#f59e0b",
                opacity: 0.2,
                line: { color: "#f59e0b", strokeWidth: 2 },
                interpolate: "monotone",
              },
              encoding: {
                x: {
                  field: "binned_rt",
                  type: "quantitative",
                },
                y: {
                  field: "cumulative_count",
                  type: "quantitative",
                  title: "Cumulative",
                  axis: {
                    orient: "right",
                    titleColor: "#f59e0b",
                    labelFontSize: 10,
                    titleFontSize: 11,
                  },
                },
              },
            },
          ],
          resolve: { scale: { y: "independent" } },
        },
      ],
      config: {
        background: "transparent",
        view: { stroke: "transparent" },
        axis: { domain: false, ticks: false },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      responsive: true,
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-50 font-sans">
      <div className="px-5 pt-16 pb-10 space-y-10">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Movie Insights
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Analyzing ratings from IMDB and Rotten Tomatoes
          </p>
        </header>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
          <div ref={containerRef} className="w-full" />
        </div>

        <footer className="text-center pb-4">
          <p className="text-zinc-400 text-xs">
            Data source: vega.github.io/editor/data/movies.json
          </p>
        </footer>
      </div>
    </div>
  );
}
