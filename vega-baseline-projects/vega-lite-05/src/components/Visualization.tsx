"use client";

import { useEffect, useRef } from "react";
import type { VisualizationSpec } from "vega-embed";
import embed from "vega-embed";

const data = [
  { label: "Begin", amount: 4000 },
  { label: "Jan", amount: 1707 },
  { label: "Feb", amount: -1425 },
  { label: "Mar", amount: -1030 },
  { label: "Apr", amount: 1812 },
  { label: "May", amount: -1067 },
  { label: "Jun", amount: -1481 },
  { label: "Jul", amount: 1228 },
  { label: "Aug", amount: 1176 },
  { label: "Sep", amount: 1146 },
  { label: "Oct", amount: 1205 },
  { label: "Nov", amount: -1388 },
  { label: "Dec", amount: 1492 },
  { label: "End", amount: 0 },
];

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      description: "Professional Vertical Waterfall Chart for Mobile",
      data: { values: data },
      width: 260,
      height: 640,
      padding: { left: 10, right: 45, top: 10, bottom: 10 },
      transform: [
        { window: [{ op: "sum", field: "amount", as: "sum" }] },
        { window: [{ op: "lead", field: "label", as: "lead" }] },
        {
          calculate: "datum.lead === null ? datum.label : datum.lead",
          as: "lead",
        },
        {
          calculate: "datum.label === 'End' ? 0 : datum.sum - datum.amount",
          as: "previous_sum",
        },
        {
          calculate: "datum.label === 'End' ? datum.sum : datum.amount",
          as: "amount",
        },
        {
          calculate:
            "(datum.label !== 'Begin' && datum.label !== 'End' && datum.amount > 0 ? '+' : '') + datum.amount",
          as: "text_amount",
        },
        { calculate: "(datum.sum + datum.previous_sum) / 2", as: "center" },
        {
          calculate:
            "datum.label === 'Begin' || datum.label === 'End' ? 'Balance' : (datum.amount >= 0 ? 'Increase' : 'Decrease')",
          as: "status",
        },
      ],
      encoding: {
        y: {
          field: "label",
          type: "ordinal",
          sort: null,
          axis: {
            title: null,
            labelFontSize: 13,
            labelFontWeight: "bold",
            labelPadding: 8,
            ticks: false,
            domain: false,
          },
        },
      },
      layer: [
        {
          mark: { type: "bar", size: 30, cornerRadius: 4 },
          encoding: {
            x: {
              field: "previous_sum",
              type: "quantitative",
              axis: {
                title: "Cumulative Balance",
                labelFontSize: 10,
                titleFontSize: 11,
                titleColor: "#64748b",
                grid: true,
                gridDash: [2, 2],
                format: "~s",
                tickCount: 5,
              },
            },
            x2: { field: "sum" },
            color: {
              field: "status",
              type: "nominal",
              scale: {
                domain: ["Balance", "Increase", "Decrease"],
                range: ["#6366f1", "#10b981", "#f43f5e"],
              },
              legend: {
                orient: "top",
                title: null,
                labelFontSize: 11,
                symbolType: "circle",
                padding: 20,
              },
            },
          },
        },
        {
          mark: {
            type: "rule",
            color: "#cbd5e1",
            opacity: 0.8,
            strokeWidth: 1.5,
            strokeDash: [4, 2],
            yOffset: 15,
            y2Offset: -15,
          },
          encoding: {
            y2: { field: "lead" },
            x: { field: "sum", type: "quantitative" },
          },
        },
        {
          mark: {
            type: "text",
            dx: { expr: "datum.sum >= datum.previous_sum ? 6 : -6" },
            align: {
              expr: "datum.sum >= datum.previous_sum ? 'left' : 'right'",
            },
            fontSize: 10,
            fontWeight: 700,
            color: "#475569",
          },
          encoding: {
            x: { field: "sum", type: "quantitative" },
            text: { field: "sum", type: "nominal" },
          },
        },
        {
          mark: {
            type: "text",
            fontWeight: "bold",
            baseline: "middle",
            fontSize: 10,
          },
          encoding: {
            x: { field: "center", type: "quantitative" },
            text: { field: "text_amount", type: "nominal" },
            color: { value: "white" },
            opacity: {
              condition: {
                test: "abs(datum.amount) < 700 && datum.label !== 'Begin' && datum.label !== 'End'",
                value: 0,
              },
              value: 1,
            },
          },
        },
      ],
      config: {
        view: { stroke: null },
        font: "system-ui, -apple-system, sans-serif",
      },
    };

    embed(containerRef.current, spec, { actions: false });
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <div className="pt-12 pb-4 px-6 border-b border-zinc-100 bg-zinc-50/50">
        <h1 className="text-xl font-extrabold text-zinc-900 leading-tight">
          Monthly Waterfall
        </h1>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">
          Budget Flow Analysis
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex justify-center">
          <div ref={containerRef} className="w-full max-w-[320px]"></div>
        </div>
      </div>
      <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-400 text-center">
        Swipe to see more months • Data source: Vega-lite Examples
      </div>
    </div>
  );
}
