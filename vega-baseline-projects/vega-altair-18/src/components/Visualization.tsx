"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { type VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Carbon Dioxide in the Atmosphere",
      data: {
        url: "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/co2-concentration.csv",
      },
      width: "container",
      height: 90,
      spacing: 15,
      config: {
        view: { stroke: "transparent" },
        axis: {
          labelFontSize: 10,
          titleFontSize: 12,
          grid: true,
          gridColor: "#f0f0f0",
          gridDash: [2, 2],
          tickCount: 5,
        },
        title: {
          fontSize: 18,
          anchor: "middle",
          offset: 15,
          subtitleFontSize: 13,
          subtitleColor: "#666",
          subtitlePadding: 5,
        },
        header: {
          labelFontSize: 14,
          labelPadding: 5,
          labelFontWeight: "bold",
          labelColor: "#333",
          title: null,
        },
      },
      facet: {
        row: {
          field: "decade",
          type: "ordinal",
          header: { labelOrient: "top", labelAlign: "left" },
        },
      },
      resolve: {
        scale: { y: "shared" },
      },
      spec: {
        mark: { type: "line", strokeWidth: 2.5, interpolate: "monotone" },
        encoding: {
          x: {
            field: "scaled_date",
            type: "quantitative",
            axis: { title: "Year into Decade" },
          },
          y: {
            field: "CO2",
            type: "quantitative",
            scale: { zero: false },
            axis: { title: null },
          },
          color: {
            field: "decade",
            type: "ordinal",
            scale: { scheme: "magma" },
            legend: null,
          },
          tooltip: [
            { field: "year", type: "nominal", title: "Year" },
            { field: "CO2", type: "quantitative", title: "CO2 (ppm)" },
          ],
        },
      },
      transform: [
        { calculate: "year(datum.Date)", as: "year" },
        { calculate: "floor(datum.year / 10) * 10", as: "decade" },
        {
          calculate: "(datum.year % 10) + (month(datum.Date)/12)",
          as: "scaled_date",
        },
      ],
      title: {
        text: "Atmospheric CO2 Trend",
        subtitle: "Monthly concentration in ppm, by decade",
      },
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col bg-white overflow-y-auto overflow-x-hidden">
      <div ref={containerRef} className="w-full" />
      <div className="mt-6 text-[11px] text-zinc-500 text-center pb-12 leading-relaxed px-4">
        Each row spans 10 years. The y-axis shows concentration from 310 to 420
        ppm. Scroll to see the relentless upward climb of global CO2 levels.
      </div>
    </div>
  );
}
