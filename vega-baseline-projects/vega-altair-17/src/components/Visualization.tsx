"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { VisualizationSpec } from "vega-embed";
import dataJson from "../lib/data.json";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const dataName = dataJson.data.name;
    const datasets = (dataJson as any).datasets[dataName];

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Mobile version of Becker's Barley Facet",
      data: { values: datasets },
      title: {
        text: "The Morris Mistake",
        subtitle: "Barley Yield (bushels/acre) by Site and Year",
        fontSize: 20,
        subtitleFontSize: 14,
        anchor: "start",
        offset: 20,
      },
      spacing: 40,
      facet: {
        field: "site",
        type: "nominal",
        title: null,
        sort: { field: "yield", op: "sum", order: "descending" },
      },
      columns: 1,
      spec: {
        width: 280,
        height: { step: 28 },
        mark: { type: "point", filled: true, size: 100 },
        encoding: {
          x: {
            field: "yield",
            type: "quantitative",
            title: "Yield",
            scale: { zero: false },
            axis: {
              grid: false,
              labelFontSize: 12,
              titleFontSize: 14,
              tickCount: 5,
            },
          },
          y: {
            field: "variety",
            type: "nominal",
            sort: "-x",
            title: null,
            axis: { grid: true, labelFontSize: 13, tickBand: "extent" },
          },
          color: {
            field: "year",
            type: "nominal",
            scale: { range: ["#1f77b4", "#ff7f0e"] },
            legend: {
              title: "Year",
              orient: "top",
              direction: "horizontal",
              labelFontSize: 13,
              titleFontSize: 14,
              offset: 10,
            },
          },
          tooltip: [
            { field: "variety", type: "nominal" },
            { field: "year", type: "nominal" },
            { field: "yield", type: "quantitative", format: ".2f" },
            { field: "site", type: "nominal" },
          ],
        },
      },
      resolve: {
        axis: { x: "independent" },
        scale: { x: "shared" },
      },
      config: {
        view: { stroke: "transparent" },
        facet: { spacing: 40 },
        header: {
          labelFontSize: 18,
          labelFontWeight: "bold",
          labelPadding: 15,
          labelAnchor: "middle",
        },
      },
    } as any;

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-white pt-12 pb-20 px-4">
      <div ref={containerRef} className="w-full flex justify-center"></div>
    </div>
  );
}
