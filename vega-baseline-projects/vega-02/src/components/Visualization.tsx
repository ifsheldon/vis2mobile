"use client";

import React, { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: any = {
      $schema: "https://vega.github.io/schema/vega/v6.json",
      description:
        "An interactive scatter plot example supporting pan and zoom.",
      width: 300,
      height: 400,
      padding: { top: 20, left: 40, bottom: 40, right: 20 },
      autosize: { type: "fit", contains: "padding" },
      config: {
        axis: {
          domain: false,
          tickSize: 5,
          tickColor: "#888",
          labelFont: "sans-serif",
          labelFontSize: 12,
          titleFontSize: 14,
        },
      },
      signals: [
        { name: "margin", value: 20 },
        {
          name: "hover",
          on: [
            { events: "*:pointerover", encode: "hover" },
            { events: "*:pointerout", encode: "leave" },
            { events: "*:pointerdown", encode: "select" },
            { events: "*:pointerup", encode: "release" },
          ],
        },
        { name: "xoffset", update: "-(height + padding.bottom)" },
        { name: "yoffset", update: "-(width + padding.left)" },
        { name: "xrange", update: "[0, width]" },
        { name: "yrange", update: "[height, 0]" },
        {
          name: "down",
          value: null,
          on: [
            { events: "touchend", update: "null" },
            { events: "pointerdown, touchstart", update: "xy()" },
          ],
        },
        {
          name: "xcur",
          value: null,
          on: [
            {
              events: "pointerdown, touchstart, touchend",
              update: "slice(xdom)",
            },
          ],
        },
        {
          name: "ycur",
          value: null,
          on: [
            {
              events: "pointerdown, touchstart, touchend",
              update: "slice(ydom)",
            },
          ],
        },
        {
          name: "delta",
          value: [0, 0],
          on: [
            {
              events: [
                {
                  source: "window",
                  type: "pointermove",
                  consume: true,
                  between: [
                    { type: "pointerdown" },
                    { source: "window", type: "pointerup" },
                  ],
                },
                {
                  type: "touchmove",
                  consume: true,
                  filter: "event.touches.length === 1",
                },
              ],
              update: "down ? [down[0]-x(), y()-down[1]] : [0,0]",
            },
          ],
        },
        {
          name: "anchor",
          value: [0, 0],
          on: [
            {
              events: "wheel",
              update: "[invert('xscale', x()), invert('yscale', y())]",
            },
            {
              events: {
                type: "touchstart",
                filter: "event.touches.length===2",
              },
              update: "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]",
            },
          ],
        },
        {
          name: "zoom",
          value: 1,
          on: [
            {
              events: "wheel!",
              force: true,
              update: "pow(1.001, event.deltaY * pow(16, event.deltaMode))",
            },
            {
              events: { signal: "dist2" },
              force: true,
              update: "dist1 / dist2",
            },
          ],
        },
        {
          name: "dist1",
          value: 0,
          on: [
            {
              events: {
                type: "touchstart",
                filter: "event.touches.length===2",
              },
              update: "pinchDistance(event)",
            },
            { events: { signal: "dist2" }, update: "dist2" },
          ],
        },
        {
          name: "dist2",
          value: 0,
          on: [
            {
              events: {
                type: "touchmove",
                consume: true,
                filter: "event.touches.length===2",
              },
              update: "pinchDistance(event)",
            },
          ],
        },
        {
          name: "xdom",
          update: "slice(xext)",
          on: [
            {
              events: { signal: "delta" },
              update:
                "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]",
            },
            {
              events: { signal: "zoom" },
              update:
                "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]",
            },
          ],
        },
        {
          name: "ydom",
          update: "slice(yext)",
          on: [
            {
              events: { signal: "delta" },
              update:
                "[ycur[0] + span(ycur) * delta[1] / height, ycur[1] + span(ycur) * delta[1] / height]",
            },
            {
              events: { signal: "zoom" },
              update:
                "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]",
            },
          ],
        },
        { name: "size", update: "clamp(40 / span(xdom), 20, 2000)" },
      ],
      data: [
        {
          name: "points",
          url: "https://vega.github.io/editor/data/normal-2d.json",
          transform: [
            { type: "extent", field: "u", signal: "xext" },
            { type: "extent", field: "v", signal: "yext" },
          ],
        },
      ],
      scales: [
        {
          name: "xscale",
          zero: false,
          domain: { signal: "xdom" },
          range: { signal: "xrange" },
        },
        {
          name: "yscale",
          zero: false,
          domain: { signal: "ydom" },
          range: { signal: "yrange" },
        },
      ],
      axes: [
        { scale: "xscale", orient: "top", offset: { signal: "xoffset" } },
        { scale: "yscale", orient: "right", offset: { signal: "yoffset" } },
      ],
      marks: [
        {
          type: "symbol",
          from: { data: "points" },
          clip: true,
          encode: {
            enter: {
              fillOpacity: { value: 0.6 },
              fill: { value: "steelblue" },
            },
            update: {
              x: { scale: "xscale", field: "u" },
              y: { scale: "yscale", field: "v" },
              size: { signal: "size" },
            },
            hover: { fill: { value: "firebrick" } },
            leave: { fill: { value: "steelblue" } },
            select: { size: { signal: "size", mult: 5 } },
            release: { size: { signal: "size" } },
          },
        },
      ],
    };

    vegaEmbed(containerRef.current, spec, {
      actions: false,
      renderer: "svg",
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-full p-4 bg-white">
      <h1 className="text-xl font-bold mb-4">Interactive Scatter Plot</h1>
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center"
        style={{ minHeight: "400px" }}
      ></div>
      <div className="mt-8 text-sm text-gray-500 text-center px-4">
        <p>Drag to pan, pinch or use wheel to zoom.</p>
        <p className="mt-2">
          This visualization shows a 2D normal distribution of points.
        </p>
      </div>
    </div>
  );
}
