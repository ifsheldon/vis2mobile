"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec = {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "A basic error bar visualization example.",
      width: 280,
      height: 450,
      padding: 5,
      autosize: { type: "fit", contains: "padding" },
      config: {
        axis: {
          labelFontSize: 12,
          titleFontSize: 14,
          labelColor: "#666",
          titleColor: "#333",
          gridColor: "#eee",
        },
        axisBand: {
          bandPosition: 1,
          tickExtra: true,
          tickOffset: 0,
        },
      },
      signals: [
        {
          name: "errorMeasure",
          value: "95% Confidence Interval",
          bind: {
            input: "select",
            options: [
              "95% Confidence Interval",
              "Standard Error",
              "Standard Deviation",
              "Interquartile Range",
            ],
          },
        },
        {
          name: "lookup",
          value: {
            "95% Confidence Interval": "ci",
            "Standard Deviation": "stdev",
            "Standard Error": "stderr",
            "Interquartile Range": "iqr",
          },
        },
        {
          name: "measure",
          update: "lookup[errorMeasure]",
        },
      ],
      data: [
        {
          name: "barley",
          url: "/data/barley.json",
        },
        {
          name: "summary",
          source: "barley",
          transform: [
            {
              type: "aggregate",
              groupby: ["variety"],
              fields: [
                "yield",
                "yield",
                "yield",
                "yield",
                "yield",
                "yield",
                "yield",
              ],
              ops: ["mean", "stdev", "stderr", "ci0", "ci1", "q1", "q3"],
              as: ["mean", "stdev", "stderr", "ci0", "ci1", "iqr0", "iqr1"],
            },
            {
              type: "formula",
              as: "stdev0",
              expr: "datum.mean - datum.stdev",
            },
            {
              type: "formula",
              as: "stdev1",
              expr: "datum.mean + datum.stdev",
            },
            {
              type: "formula",
              as: "stderr0",
              expr: "datum.mean - datum.stderr",
            },
            {
              type: "formula",
              as: "stderr1",
              expr: "datum.mean + datum.stderr",
            },
          ],
        },
      ],
      scales: [
        {
          name: "yscale",
          type: "band",
          range: "height",
          domain: {
            data: "summary",
            field: "variety",
            sort: {
              op: "max",
              field: "mean",
              order: "descending",
            },
          },
          padding: 0.5,
        },
        {
          name: "xscale",
          type: "linear",
          range: "width",
          round: true,
          domain: {
            data: "summary",
            fields: ["stdev0", "stdev1"],
          },
          zero: false,
          nice: true,
        },
      ],
      axes: [
        {
          orient: "bottom",
          scale: "xscale",
          zindex: 1,
          title: "Barley Yield",
          labelFlush: true,
          grid: true,
        },
        {
          orient: "left",
          scale: "yscale",
          zindex: 1,
          labelPadding: 10,
        },
      ],
      marks: [
        {
          type: "rect",
          from: {
            data: "summary",
          },
          encode: {
            enter: {
              fill: {
                value: "#6366f1",
              },
              height: {
                value: 3,
              },
              cornerRadius: { value: 1.5 },
            },
            update: {
              y: {
                scale: "yscale",
                field: "variety",
                band: 0.5,
                offset: -1.5,
              },
              x: {
                scale: "xscale",
                signal: "datum[measure+'0']",
              },
              x2: {
                scale: "xscale",
                signal: "datum[measure+'1']",
              },
            },
          },
        },
        {
          type: "symbol",
          from: {
            data: "summary",
          },
          encode: {
            enter: {
              fill: {
                value: "#4338ca",
              },
              size: {
                value: 120,
              },
              stroke: { value: "white" },
              strokeWidth: { value: 2 },
            },
            update: {
              x: {
                scale: "xscale",
                field: "mean",
              },
              y: {
                scale: "yscale",
                field: "variety",
                band: 0.5,
              },
            },
          },
        },
      ],
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "canvas",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-16 bg-white dark:bg-zinc-950 overflow-y-auto">
      <header className="w-full mb-6 px-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Barley Yield
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Error bar analysis by variety
        </p>
      </header>

      <div className="w-full flex-1 flex flex-col items-center">
        <div
          ref={containerRef}
          className="vega-container w-full flex flex-col items-center"
        />
      </div>

      <footer className="mt-6 mb-8 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
        The chart displays the mean yield and selected error measure for 10
        varieties of barley. Use the selector above to change the error metric.
      </footer>

      <style jsx global>{`
                .vega-container .vega-bind {
                    margin-top: 20px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .vega-container .vega-bind-name {
                    font-weight: 600;
                    font-size: 14px;
                    color: #374151;
                }
                .vega-container select {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    background-color: white;
                    font-size: 14px;
                    color: #1f2937;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 0.5rem center;
                    background-size: 1.5em 1.5em;
                }
                .dark .vega-container .vega-bind-name {
                    color: #e5e7eb;
                }
                .dark .vega-container select {
                    background-color: #18181b;
                    border-color: #3f3f46;
                    color: #f4f4f5;
                }
            `}</style>
    </div>
  );
}
