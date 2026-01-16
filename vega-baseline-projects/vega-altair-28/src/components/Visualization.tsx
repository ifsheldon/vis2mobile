"use client";

import { useEffect, useRef, useState } from "react";
import vegaEmbed, { type VisualizationSpec } from "vega-embed";
import gapminderData from "@/lib/gapminder.json";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const spec: VisualizationSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v6.json",
        data: { values: gapminderData },
        width: 300,
        height: 380,
        autosize: { type: "fit", contains: "padding" },
        config: {
          view: { stroke: "transparent" },
          axis: {
            labelFontSize: 11,
            titleFontSize: 12,
            grid: true,
          },
          legend: {
            labelFontSize: 11,
            titleFontSize: 12,
            orient: "bottom",
            columns: 2,
            offset: 15,
          },
        },
        params: [
          {
            name: "year_select",
            value: 2005,
            bind: {
              input: "range",
              min: 1955,
              max: 2005,
              step: 5,
              name: "Year",
            },
          },
          {
            name: "search_param",
            value: "",
            bind: {
              input: "search",
              placeholder: "Country...",
              name: "Search",
            },
          },
        ],
        transform: [
          {
            calculate:
              "datum.cluster == 0 ? 'South Asia' : datum.cluster == 1 ? 'Europe & Central Asia' : datum.cluster == 2 ? 'Sub-Saharan Africa' : datum.cluster == 3 ? 'The Americas' : datum.cluster == 4 ? 'East Asia & Pacific' : 'Middle East & North Africa'",
            as: "region",
          },
          {
            filter:
              "datum.country !== 'North Korea' && datum.country !== 'South Korea'",
          },
        ],
        layer: [
          {
            mark: {
              type: "text",
              baseline: "middle",
              fontSize: 80,
              opacity: 0.1,
              align: "center",
              x: 150,
              y: 180,
            },
            encoding: {
              text: { field: "year", type: "ordinal" },
            },
            transform: [
              { filter: "datum.year == year_select" },
              { aggregate: [{ op: "max", field: "year", as: "year" }] },
            ],
          },
          {
            mark: { type: "circle", size: 80, cursor: "pointer" },
            params: [
              {
                name: "country_select",
                select: { type: "point", fields: ["country"], on: "click" },
              },
            ],
            encoding: {
              x: {
                field: "fertility",
                type: "quantitative",
                scale: { zero: false },
                title: "Babies per woman",
              },
              y: {
                field: "life_expect",
                type: "quantitative",
                scale: { zero: false },
                title: "Life expectancy",
              },
              color: {
                field: "region",
                type: "nominal",
                scale: { scheme: "dark2" },
                title: "Region",
              },
              opacity: {
                condition: [
                  {
                    test: "test(regexp(search_param,'i'), datum.country)",
                    value: 0.7,
                  },
                ],
                value: 0.1,
              },
            },
            transform: [{ filter: "datum.year == year_select" }],
          },
          {
            mark: { type: "trail", color: "#444" },
            encoding: {
              x: { field: "fertility", type: "quantitative" },
              y: { field: "life_expect", type: "quantitative" },
              detail: { field: "country", type: "nominal" },
              size: {
                field: "year",
                type: "quantitative",
                scale: { domain: [1955, 2005], range: [1, 8] },
                legend: null,
              },
              opacity: {
                condition: {
                  param: "country_select",
                  empty: false,
                  value: 0.4,
                },
                value: 0,
              },
            },
          },
          {
            mark: {
              type: "text",
              align: "center",
              dy: -15,
              fontSize: 14,
              fontWeight: "bold",
            },
            encoding: {
              x: { field: "fertility", type: "quantitative" },
              y: { field: "life_expect", type: "quantitative" },
              text: { field: "country", type: "nominal" },
              opacity: {
                condition: { param: "country_select", empty: false, value: 1 },
                value: 0,
              },
            },
            transform: [{ filter: "datum.year == year_select" }],
          },
        ],
      };

      vegaEmbed(containerRef.current, spec, {
        actions: false,
        mode: "vega-lite",
      }).catch((err) => {
        setError(err.message);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4 pt-12 items-center bg-white overflow-y-auto">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-zinc-900 leading-tight">
          Fertility vs Life Expectancy
        </h1>
        <p className="text-sm text-zinc-500">Gapminder Visualization</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs mb-4">
          Error: {error}
        </div>
      )}

      <div ref={containerRef} className="w-full flex-1" />

      <div className="w-full mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
        <p className="text-xs text-zinc-400 text-center italic">
          Tip: Tap a bubble to see its trajectory.
        </p>
      </div>

      <style jsx global>{`
        .vega-bind {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          margin-top: 20px !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .vega-bind-name {
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #27272a !important;
          margin-bottom: 4px !important;
        }
        .vega-bind input[type="range"] {
          width: 100% !important;
          accent-color: #27272a !important;
        }
        .vega-bind input[type="search"] {
            width: 100% !important;
            border: 1px solid #e4e4e7 !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
            font-size: 14px !important;
            background: white !important;
        }
        canvas {
            max-width: 100% !important;
            height: auto !important;
        }
      `}</style>
    </div>
  );
}
