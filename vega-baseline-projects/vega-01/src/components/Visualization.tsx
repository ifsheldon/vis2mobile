"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const spec = {
    $schema: "https://vega.github.io/schema/vega/v6.json",
    description:
      "Interactive cross-filtering among histograms of flight statistics.",
    width: 300,
    padding: { top: 10, left: 45, right: 15, bottom: 35 },
    autosize: { type: "fit", contains: "padding" },
    signals: [
      { name: "chartHeight", value: 130 },
      { name: "chartPadding", value: 75 },
      { name: "height", update: "(chartHeight + chartPadding) * 3" },
      { name: "delayExtent", value: [-60, 180] },
      { name: "timeExtent", value: [0, 24] },
      { name: "distExtent", value: [0, 2400] },
      {
        name: "delayStep",
        value: 10,
        bind: {
          input: "range",
          min: 2,
          max: 20,
          step: 1,
          name: "Delay Bin Size",
        },
      },
      {
        name: "timeStep",
        value: 1,
        bind: {
          input: "range",
          min: 0.25,
          max: 2,
          step: 0.25,
          name: "Time Bin Size",
        },
      },
      {
        name: "distStep",
        value: 100,
        bind: {
          input: "range",
          min: 50,
          max: 200,
          step: 50,
          name: "Dist Bin Size",
        },
      },
      {
        name: "delayRange",
        update: "delayExtent",
        on: [
          {
            events: { signal: "delayZoom" },
            update:
              "[(delayRange[0]+delayRange[1])/2 - delayZoom, (delayRange[0]+delayRange[1])/2 + delayZoom]",
          },
          {
            events:
              "@delay:dblclick!, @delayBrush:dblclick!, @delay_axis:dblclick!",
            update: "[delayExtent[0], delayExtent[1]]",
          },
          {
            events:
              "[@delayBrush:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[delayRange[0] + invert('delayScale', x()) - invert('delayScale', xmove), delayRange[1] + invert('delayScale', x()) - invert('delayScale', xmove)]",
          },
          {
            events:
              "[@delay:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[min(delayAnchor, invert('delayScale', x())), max(delayAnchor, invert('delayScale', x()))]",
          },
        ],
      },
      {
        name: "delayZoom",
        value: 0,
        on: [
          {
            events: "@delay:wheel!, @delayBrush:wheel!",
            update:
              "0.5 * abs(span(delayRange)) * pow(1.0005, event.deltaY * pow(16, event.deltaMode))",
          },
        ],
      },
      {
        name: "delayAnchor",
        value: 0,
        on: [
          {
            events: "@delay:pointerdown!",
            update: "invert('delayScale', x())",
          },
        ],
      },
      {
        name: "timeRange",
        update: "timeExtent",
        on: [
          {
            events: { signal: "timeZoom" },
            update:
              "[(timeRange[0]+timeRange[1])/2 - timeZoom, (timeRange[0]+timeRange[1])/2 + timeZoom]",
          },
          {
            events:
              "@time:dblclick!, @timeBrush:dblclick!, @time_axis:dblclick!",
            update: "[timeExtent[0], timeExtent[1]]",
          },
          {
            events:
              "[@timeBrush:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[timeRange[0] + invert('timeScale', x()) - invert('timeScale', xmove), timeRange[1] + invert('timeScale', x()) - invert('timeScale', xmove)]",
          },
          {
            events:
              "[@time:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[min(timeAnchor, invert('timeScale', x())), max(timeAnchor, invert('timeScale', x()))]",
          },
        ],
      },
      {
        name: "timeZoom",
        value: 0,
        on: [
          {
            events: "@time:wheel!, @timeBrush:wheel!",
            update:
              "0.5 * abs(span(timeRange)) * pow(1.0005, event.deltaY * pow(16, event.deltaMode))",
          },
        ],
      },
      {
        name: "timeAnchor",
        value: 0,
        on: [
          { events: "@time:pointerdown!", update: "invert('timeScale', x())" },
        ],
      },
      {
        name: "distRange",
        update: "distExtent",
        on: [
          {
            events: { signal: "distZoom" },
            update:
              "[(distRange[0]+distRange[1])/2 - distZoom, (distRange[0]+distRange[1])/2 + distZoom]",
          },
          {
            events:
              "@dist:dblclick!, @distBrush:dblclick!, @dist_axis:dblclick!",
            update: "[distExtent[0], distExtent[1]]",
          },
          {
            events:
              "[@distBrush:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[distRange[0] + invert('distScale', x()) - invert('distScale', xmove), distRange[1] + invert('distScale', x()) - invert('distScale', xmove)]",
          },
          {
            events:
              "[@dist:pointerdown, window:pointerup] > window:pointermove!",
            update:
              "[min(distAnchor, invert('distScale', x())), max(distAnchor, invert('distScale', x()))]",
          },
        ],
      },
      {
        name: "distZoom",
        value: 0,
        on: [
          {
            events: "@dist:wheel!, @distBrush:wheel!",
            update:
              "0.5 * abs(span(distRange)) * pow(1.0005, event.deltaY * pow(16, event.deltaMode))",
          },
        ],
      },
      {
        name: "distAnchor",
        value: 0,
        on: [
          { events: "@dist:pointerdown!", update: "invert('distScale', x())" },
        ],
      },
      {
        name: "xmove",
        value: 0,
        on: [{ events: "window:pointermove", update: "x()" }],
      },
    ],
    data: [
      {
        name: "flights",
        url: "https://vega.github.io/editor/data/flights-200k.json",
        transform: [
          {
            type: "bin",
            field: "delay",
            extent: { signal: "delayExtent" },
            step: { signal: "delayStep" },
            as: ["delay0", "delay1"],
          },
          {
            type: "bin",
            field: "time",
            extent: { signal: "timeExtent" },
            step: { signal: "timeStep" },
            as: ["time0", "time1"],
          },
          {
            type: "bin",
            field: "distance",
            extent: { signal: "distExtent" },
            step: { signal: "distStep" },
            as: ["dist0", "dist1"],
          },
          {
            type: "crossfilter",
            signal: "xfilter",
            fields: ["delay", "time", "distance"],
            query: [
              { signal: "delayRange" },
              { signal: "timeRange" },
              { signal: "distRange" },
            ],
          },
        ],
      },
    ],
    scales: [
      {
        name: "layout",
        type: "band",
        domain: ["delay", "time", "distance"],
        range: "height",
      },
      {
        name: "delayScale",
        type: "linear",
        round: true,
        domain: { signal: "delayExtent" },
        range: "width",
      },
      {
        name: "timeScale",
        type: "linear",
        round: true,
        domain: { signal: "timeExtent" },
        range: "width",
      },
      {
        name: "distScale",
        type: "linear",
        round: true,
        domain: { signal: "distExtent" },
        range: "width",
      },
    ],
    marks: [
      {
        name: "delay",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "delay", offset: 30 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },
        data: [
          {
            name: "delay-bins",
            source: "flights",
            transform: [
              {
                type: "resolvefilter",
                ignore: 1,
                filter: { signal: "xfilter" },
              },
              {
                type: "aggregate",
                groupby: ["delay0", "delay1"],
                key: "delay0",
                drop: false,
              },
            ],
          },
        ],
        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "delay-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
            nice: true,
          },
        ],
        axes: [
          {
            orient: "bottom",
            scale: "delayScale",
            title: "Arrival Delay (min)",
            labelFlush: true,
            labelOverlap: "parity",
            name: "delay_axis",
            titlePadding: 10,
            titleFontSize: 13,
            titleFontWeight: 600,
            labelFontSize: 11,
          },
          {
            orient: "left",
            scale: "yscale",
            format: "~s",
            tickCount: 3,
            grid: true,
            gridOpacity: 0.1,
            labelFontSize: 10,
          },
        ],
        marks: [
          {
            type: "rect",
            name: "delayBrush",
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#cbd5e1" },
                fillOpacity: { value: 0.3 },
              },
              update: {
                x: { signal: "scale('delayScale', delayRange[0])" },
                x2: { signal: "scale('delayScale', delayRange[1])" },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            from: { data: "delay-bins" },
            encode: {
              enter: { fill: { value: "#3b82f6" } },
              update: {
                x: { scale: "delayScale", field: "delay0" },
                x2: { scale: "delayScale", field: "delay1", offset: -0.5 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('delayScale', delayRange[0])" },
                width: { value: 2 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('delayScale', delayRange[1])" },
                width: { value: 2 },
              },
            },
          },
        ],
      },
      {
        name: "time",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "time", offset: 30 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },
        data: [
          {
            name: "time-bins",
            source: "flights",
            transform: [
              {
                type: "resolvefilter",
                ignore: 2,
                filter: { signal: "xfilter" },
              },
              {
                type: "aggregate",
                groupby: ["time0", "time1"],
                key: "time0",
                drop: false,
              },
            ],
          },
        ],
        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "time-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
            nice: true,
          },
        ],
        axes: [
          {
            orient: "bottom",
            scale: "timeScale",
            title: "Local Departure Time (hour)",
            labelFlush: true,
            name: "time_axis",
            titlePadding: 10,
            titleFontSize: 13,
            titleFontWeight: 600,
            labelFontSize: 11,
          },
          {
            orient: "left",
            scale: "yscale",
            format: "~s",
            tickCount: 3,
            grid: true,
            gridOpacity: 0.1,
            labelFontSize: 10,
          },
        ],
        marks: [
          {
            type: "rect",
            name: "timeBrush",
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#cbd5e1" },
                fillOpacity: { value: 0.3 },
              },
              update: {
                x: { signal: "scale('timeScale', timeRange[0])" },
                x2: { signal: "scale('timeScale', timeRange[1])" },
              },
            },
          },
          {
            type: "rect",
            from: { data: "time-bins" },
            interactive: false,
            encode: {
              enter: { fill: { value: "#3b82f6" } },
              update: {
                x: { scale: "timeScale", field: "time0" },
                x2: { scale: "timeScale", field: "time1", offset: -0.5 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('timeScale', timeRange[0])" },
                width: { value: 2 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('timeScale', timeRange[1])" },
                width: { value: 2 },
              },
            },
          },
        ],
      },
      {
        name: "dist",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "distance", offset: 30 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },
        data: [
          {
            name: "dist-bins",
            source: "flights",
            transform: [
              {
                type: "resolvefilter",
                ignore: 4,
                filter: { signal: "xfilter" },
              },
              {
                type: "aggregate",
                groupby: ["dist0", "dist1"],
                key: "dist0",
                drop: false,
              },
            ],
          },
        ],
        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "dist-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
            nice: true,
          },
        ],
        axes: [
          {
            orient: "bottom",
            scale: "distScale",
            title: "Travel Distance (miles)",
            labelFlush: true,
            labelOverlap: "parity",
            name: "dist_axis",
            titlePadding: 10,
            titleFontSize: 13,
            titleFontWeight: 600,
            labelFontSize: 11,
          },
          {
            orient: "left",
            scale: "yscale",
            format: "~s",
            tickCount: 3,
            grid: true,
            gridOpacity: 0.1,
            labelFontSize: 10,
          },
        ],
        marks: [
          {
            type: "rect",
            name: "distBrush",
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#cbd5e1" },
                fillOpacity: { value: 0.3 },
              },
              update: {
                x: { signal: "scale('distScale', distRange[0])" },
                x2: { signal: "scale('distScale', distRange[1])" },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            from: { data: "dist-bins" },
            encode: {
              enter: { fill: { value: "#3b82f6" } },
              update: {
                x: { scale: "distScale", field: "dist0" },
                x2: { scale: "distScale", field: "dist1", offset: -0.5 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('distScale', distRange[0])" },
                width: { value: 2 },
              },
            },
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "chartHeight" },
                fill: { value: "#ef4444" },
              },
              update: {
                x: { signal: "scale('distScale', distRange[1])" },
                width: { value: 2 },
              },
            },
          },
        ],
      },
    ],
  };

  useEffect(() => {
    if (containerRef.current && controlsRef.current) {
      // biome-ignore lint/suspicious/noExplicitAny: Vega spec has properties like 'name' on Axis that are valid in Vega but not in current types
      vegaEmbed(containerRef.current, spec as any, {
        actions: false,
        width: containerRef.current.clientWidth - 65,
        bind: controlsRef.current,
      });
    }
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 flex flex-col items-center pb-12">
      <header className="w-full bg-white border-b border-slate-200 py-6 px-4 mb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 text-center">
          Flight Statistics
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1 font-medium">
          Interactive Cross-Filtering
        </p>
      </header>

      <div className="w-full px-4 max-w-[450px]">
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-6 border border-slate-200">
          <div ref={containerRef} className="w-full overflow-hidden"></div>
          <div className="mt-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              <span className="font-semibold text-slate-500">How to use:</span>{" "}
              Drag horizontally to filter any chart. Double-tap to reset. All
              charts update in real-time.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Histogram Controls
            </h2>
          </div>
          <div ref={controlsRef} className="vega-controls-container">
            {/* Vega will inject sliders here */}
          </div>
        </div>
      </div>

      <style jsx global>{`
                .vega-bind {
                    display: flex !important;
                    flex-direction: column !important;
                    margin-bottom: 1.5rem !important;
                    gap: 0.5rem !important;
                }
                .vega-bind-name {
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    color: #64748b !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.025em !important;
                }
                .vega-bind-radio {
                    display: flex;
                    gap: 1rem;
                }
                .vega-bind input[type="range"] {
                    width: 100% !important;
                    height: 8px !important;
                    background: #f1f5f9 !important;
                    border-radius: 9999px !important;
                    appearance: none !important;
                    cursor: pointer !important;
                    border: 1px solid #e2e8f0 !important;
                }
                .vega-bind input[type="range"]::-webkit-slider-thumb {
                    appearance: none !important;
                    width: 20px !important;
                    height: 20px !important;
                    background: #3b82f6 !important;
                    border-radius: 50% !important;
                    border: 3px solid white !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) !important;
                }
                .vega-bind span {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                    font-size: 0.75rem !important;
                    color: #3b82f6 !important;
                    font-weight: 700 !important;
                    background: #eff6ff !important;
                    padding: 0.125rem 0.5rem !important;
                    border-radius: 0.375rem !important;
                    width: fit-content !important;
                    align-self: flex-end !important;
                    margin-top: -1.75rem !important;
                }
            `}</style>
    </div>
  );
}
