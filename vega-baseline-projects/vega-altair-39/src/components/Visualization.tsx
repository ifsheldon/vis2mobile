"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description:
        "Source: https://altair-viz.github.io/gallery/strip_plot_jitter.html",
      data: {
        url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json",
      },
      transform: [
        { filter: "datum['Major Genre'] != null" },
        {
          calculate: "sqrt(-2*log(random()))*cos(2*PI*random())",
          as: "normal_jitter",
        },
        { calculate: "random()", as: "uniform_jitter" },
      ],
      config: {
        view: { stroke: "transparent" },
        axis: {
          labelFontSize: 11,
          titleFontSize: 12,
          grid: false,
          labelColor: "#4b5563",
          titleColor: "#374151",
        },
        title: {
          fontSize: 14,
          anchor: "middle",
          offset: 10,
          color: "#1f2937",
        },
      },
      vconcat: [
        {
          title: "Normally distributed jitter",
          width: 180,
          height: 240,
          mark: { type: "circle", size: 12, opacity: 0.5, clip: true },
          encoding: {
            x: {
              field: "IMDB Rating",
              type: "quantitative",
              scale: { domain: [0, 10] },
              title: "IMDB Rating",
            },
            y: {
              field: "Major Genre",
              type: "nominal",
              title: null,
            },
            yOffset: { field: "normal_jitter", type: "quantitative" },
            color: {
              field: "Major Genre",
              type: "nominal",
              legend: null,
            },
          },
        },
        {
          title: "Uniformly distributed jitter",
          width: 180,
          height: 240,
          mark: { type: "circle", size: 12, opacity: 0.5, clip: true },
          encoding: {
            x: {
              field: "IMDB Rating",
              type: "quantitative",
              scale: { domain: [0, 10] },
              title: "IMDB Rating",
            },
            y: {
              field: "Major Genre",
              type: "nominal",
              title: null,
            },
            yOffset: { field: "uniform_jitter", type: "quantitative" },
            color: {
              field: "Major Genre",
              type: "nominal",
              legend: null,
            },
          },
        },
      ],
      spacing: 40,
      resolve: {
        scale: { yOffset: "independent" },
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 pt-12 pb-12 px-4">
      <div className="flex flex-col items-center">
        <header className="w-full mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
            Movie Ratings
          </h1>
          <div className="h-1 w-12 bg-blue-500 rounded mt-2 mb-3"></div>
          <p className="text-sm text-slate-600">
            A comparison of <span className="font-semibold">Normal</span> vs{" "}
            <span className="font-semibold">Uniform</span> jittering techniques
            across genres.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 w-full flex justify-center">
          <div ref={containerRef} className="w-full flex justify-center" />
        </div>

        <footer className="mt-8 w-full text-center text-xs text-slate-400 pb-4">
          Data source: Vega Datasets (Movies)
        </footer>
      </div>
    </div>
  );
}
