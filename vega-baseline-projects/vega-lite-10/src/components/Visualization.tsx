"use client";

import { useEffect, useRef } from "react";
import embed, { type VisualizationSpec } from "vega-embed";

const populationData = [
  { year: "1875", population: 1309 },
  { year: "1890", population: 1558 },
  { year: "1910", population: 4512 },
  { year: "1925", population: 8180 },
  { year: "1933", population: 15915 },
  { year: "1939", population: 24824 },
  { year: "1946", population: 28275 },
  { year: "1950", population: 29189 },
  { year: "1964", population: 29881 },
  { year: "1971", population: 26007 },
  { year: "1981", population: 24029 },
  { year: "1985", population: 23340 },
  { year: "1989", population: 22307 },
  { year: "1990", population: 22087 },
  { year: "1991", population: 22139 },
  { year: "1992", population: 22105 },
  { year: "1993", population: 22242 },
  { year: "1994", population: 22801 },
  { year: "1995", population: 24273 },
  { year: "1996", population: 25640 },
  { year: "1997", population: 27393 },
  { year: "1998", population: 29505 },
  { year: "1999", population: 32124 },
  { year: "2000", population: 33791 },
  { year: "2001", population: 35297 },
  { year: "2002", population: 36179 },
  { year: "2003", population: 36829 },
  { year: "2004", population: 37493 },
  { year: "2005", population: 38376 },
  { year: "2006", population: 39008 },
  { year: "2007", population: 39366 },
  { year: "2008", population: 39821 },
  { year: "2009", population: 40179 },
  { year: "2010", population: 40511 },
  { year: "2011", population: 40465 },
  { year: "2012", population: 40905 },
  { year: "2013", population: 41258 },
  { year: "2014", population: 41777 },
];

const eventData = [
  { start: "1933", end: "1945", event: "Nazi Rule" },
  { start: "1948", end: "1989", event: "GDR (East Germany)" },
];

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "The population of the German city of Falkensee over time.",
      padding: { left: 5, top: 10, right: 5, bottom: 5 },
      width: "container",
      height: 350,
      title: {
        text: "Population of Falkensee",
        subtitle: ["Major political periods highlighted"],
        anchor: "start",
        fontSize: 18,
        subtitleFontSize: 12,
        offset: 15,
      },
      data: {
        values: populationData,
        format: { parse: { year: "date:'%Y'" } },
      },
      layer: [
        {
          data: {
            values: eventData,
            format: { parse: { start: "date:'%Y'", end: "date:'%Y'" } },
          },
          encoding: {
            x: { field: "start", timeUnit: "year" },
            x2: { field: "end", timeUnit: "year" },
            color: {
              field: "event",
              type: "nominal",
              scale: {
                domain: ["Nazi Rule", "GDR (East Germany)"],
                range: ["#f58518", "#4c78a8"],
              },
              legend: {
                orient: "bottom",
                title: null,
                labelFontSize: 11,
                symbolType: "square",
              },
            },
            tooltip: [
              { field: "event", type: "nominal", title: "Period" },
              { field: "start", timeUnit: "year", title: "Start" },
              { field: "end", timeUnit: "year", title: "End" },
            ],
          },
          layer: [{ mark: { type: "rect", opacity: 0.3 } }],
        },
        {
          mark: {
            type: "line",
            color: "#333",
            strokeWidth: 2,
            interpolate: "monotone",
          },
          encoding: {
            x: {
              field: "year",
              timeUnit: "year",
              title: null,
              axis: {
                labelFontSize: 10,
                format: "%Y",
                labelAngle: 0,
                tickCount: 5,
              },
            },
            y: {
              field: "population",
              type: "quantitative",
              title: "Population",
              axis: { labelFontSize: 10, titleFontSize: 11, format: "~s" },
            },
          },
        },
        {
          mark: { type: "point", color: "#333", filled: true, size: 40 },
          encoding: {
            x: { field: "year", timeUnit: "year" },
            y: { field: "population", type: "quantitative" },
            tooltip: [
              { field: "year", timeUnit: "year", title: "Year" },
              {
                field: "population",
                type: "quantitative",
                format: ",",
                title: "Population",
              },
            ],
          },
        },
      ],
      config: {
        view: { stroke: "transparent" },
        axis: { grid: true, gridColor: "#f0f0f0" },
      },
    };

    embed(containerRef.current, spec, { actions: false });
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center bg-white overflow-y-auto">
      <div ref={containerRef} className="w-full max-w-[340px]" />
    </div>
  );
}
