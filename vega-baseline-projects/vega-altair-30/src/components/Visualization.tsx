"use client";

import { useEffect, useRef } from "react";
import vegaEmbed, { type VisualizationSpec } from "vega-embed";

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spec: VisualizationSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v6.1.0.json",
      description: "Mobile version of line chart with arrows",
      width: "container",
      height: 400,
      padding: { left: 10, right: 10, top: 40, bottom: 10 },
      autosize: { type: "fit", contains: "padding" },
      config: {
        view: { stroke: "transparent" },
        axis: {
          labelFontSize: 12,
          titleFontSize: 14,
          gridColor: "#f0f0f0",
        },
      },
      layer: [
        {
          data: {
            values: [
              { x: 1, y: 0.8414709848078965 },
              { x: 1.1224489795918366, y: 0.9011647193541048 },
              { x: 1.2448979591836735, y: 0.947363487374668 },
              { x: 1.3673469387755102, y: 0.9793754610443571 },
              { x: 1.489795918367347, y: 0.996721260174607 },
              { x: 1.6122448979591837, y: 0.9991411309450606 },
              { x: 1.7346938775510203, y: 0.9865988357241925 },
              { x: 1.8571428571428572, y: 0.9592821957288404 },
              { x: 1.9795918367346939, y: 0.9176002783963034 },
              { x: 2.1020408163265305, y: 0.862177271588186 },
              { x: 2.2244897959183674, y: 0.793843136359957 },
              { x: 2.3469387755102042, y: 0.7136211782712532 },
              { x: 2.4693877551020407, y: 0.6227127233569034 },
              { x: 2.5918367346938775, y: 0.5224791282364234 },
              { x: 2.7142857142857144, y: 0.4144213937610953 },
              { x: 2.836734693877551, y: 0.3001576874848237 },
              { x: 2.9591836734693877, y: 0.18139911156038566 },
              { x: 3.0816326530612246, y: 0.05992407893750542 },
              { x: 3.204081632653061, y: -0.06244831842011605 },
              { x: 3.326530612244898, y: -0.1838855504871279 },
              { x: 3.4489795918367347, y: -0.30256909136419585 },
              { x: 3.571428571428571, y: -0.41672165175349946 },
              { x: 3.693877551020408, y: -0.5246337939149841 },
              { x: 3.816326530612245, y: -0.6246895305436606 },
              { x: 3.9387755102040813, y: -0.7153905242240666 },
              { x: 4.061224489795919, y: -0.7953785250743864 },
              { x: 4.183673469387755, y: -0.8634557105758878 },
              { x: 4.3061224489795915, y: -0.9186026229981786 },
              { x: 4.428571428571429, y: -0.9599934358068326 },
              { x: 4.551020408163265, y: -0.9870083204385179 },
              { x: 4.673469387755102, y: -0.9992427282508292 },
              { x: 4.795918367346939, y: -0.9965134486493629 },
              { x: 4.918367346938775, y: -0.978861352671422 },
              { x: 5.040816326530612, y: -0.9465507809411055 },
              { x: 5.163265306122449, y: -0.900065585161171 },
              { x: 5.285714285714286, y: -0.8401018824204437 },
              { x: 5.408163265306122, y: -0.7675576308212114 },
              { x: 5.530612244897959, y: -0.6835191825318773 },
              { x: 5.653061224489796, y: -0.5892450156332808 },
              { x: 5.775510204081632, y: -0.48614688837472503 },
              { x: 5.8979591836734695, y: -0.37576869805526025 },
              { x: 6.020408163265306, y: -0.2597633611190539 },
              { x: 6.142857142857142, y: -0.13986806068604837 },
              { x: 6.26530612244898, y: -0.017878232186832283 },
              { x: 6.387755102040816, y: 0.1043793233324464 },
              { x: 6.5102040816326525, y: 0.22507379560613325 },
              { x: 6.63265306122449, y: 0.34239778158328493 },
              { x: 6.755102040816326, y: 0.45459435133820136 },
              { x: 6.877551020408163, y: 0.5599833581445223 },
              { x: 7, y: 0.6569865987187891 },
            ],
          },
          mark: {
            type: "line",
            point: { size: 40, color: "#1e40af" },
            color: "#3b82f6",
            strokeWidth: 3,
          },
          encoding: {
            x: { field: "x", type: "quantitative", title: "Time / Phase" },
            y: { field: "y", type: "quantitative", title: "Amplitude" },
          },
        },
        {
          layer: [
            {
              data: { values: [{}] },
              mark: { type: "rule", size: 3, color: "#ef4444" },
              encoding: {
                x: { datum: 3.1 },
                x2: { datum: 2.6 },
                y: { datum: 0.1 },
                y2: { datum: -0.4 },
              },
            },
            {
              data: { values: [{}] },
              mark: {
                type: "point",
                fillOpacity: 1,
                filled: true,
                shape: "triangle",
                size: 200,
                color: "#ef4444",
              },
              encoding: {
                angle: { value: 230 },
                x: { datum: 2.6 },
                y: { datum: -0.4 },
              },
            },
            {
              data: { values: [{}] },
              mark: {
                type: "text",
                align: "center",
                baseline: "bottom",
                size: 18,
                fontWeight: "bold",
                dy: -15,
                color: "#ef4444",
              },
              encoding: {
                text: { datum: "decreasing" },
                x: { datum: 2.6 },
                y: { datum: 0.2 },
              },
            },
          ],
        },
        {
          layer: [
            {
              data: { values: [{}] },
              mark: { type: "rule", size: 3, color: "#10b981" },
              encoding: {
                x: { datum: 5.4 },
                x2: { datum: 5.9 },
                y: { datum: -0.4 },
                y2: { datum: 0 },
              },
            },
            {
              data: { values: [{}] },
              mark: {
                type: "point",
                fillOpacity: 1,
                filled: true,
                shape: "triangle",
                size: 200,
                color: "#10b981",
              },
              encoding: {
                angle: { value: 23 },
                x: { datum: 5.9 },
                y: { datum: 0 },
              },
            },
            {
              data: { values: [{}] },
              mark: {
                type: "text",
                align: "center",
                baseline: "bottom",
                size: 18,
                fontWeight: "bold",
                dy: -15,
                color: "#10b981",
              },
              encoding: {
                text: { datum: "increasing" },
                x: { datum: 5.4 },
                y: { datum: -0.4 },
              },
            },
          ],
        },
      ],
    };

    vegaEmbed(containerRef.current, spec, { actions: false, renderer: "svg" });
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="px-6 py-10 flex-grow flex flex-col">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
          Trend Analysis
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Sine wave progression with key trend indicators
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 grow flex items-center">
          <div ref={containerRef} className="w-full h-[450px]" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <span className="block text-red-600 font-bold text-lg">
              Decreasing
            </span>
            <span className="text-red-400 text-xs uppercase tracking-wider font-semibold">
              Downward Trend
            </span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <span className="block text-emerald-600 font-bold text-lg">
              Increasing
            </span>
            <span className="text-emerald-400 text-xs uppercase tracking-wider font-semibold">
              Upward Trend
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 bg-white border-t border-slate-200">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>ALTAIR VISUALIZATION</span>
          <span>MOBILE OPTIMIZED</span>
        </div>
      </div>
    </div>
  );
}
