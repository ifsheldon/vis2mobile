"use client";

import { useMemo, useState } from "react";
import { Pyramid } from "lucide-react";

type Slice = {
  name: string;
  value: number;
  color: string;
};

const data: Slice[] = [
  { name: "Sky", value: 75, color: "#416D9D" },
  { name: "Shady side of a pyramid", value: 10, color: "#674028" },
  { name: "Sunny side of a pyramid", value: 15, color: "#DEAC58" },
];

const viewBoxSize = 320;
const center = viewBoxSize / 2;
const innerRadius = 70;
const outerRadius = 120;

function polarToCartesian(radius: number, angle: number) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function describeDonutSlice(
  startAngle: number,
  endAngle: number,
  offset: number,
) {
  const adjustedOuter = outerRadius + offset;
  const adjustedInner = innerRadius + offset * 0.4;
  const startOuter = polarToCartesian(adjustedOuter, startAngle);
  const endOuter = polarToCartesian(adjustedOuter, endAngle);
  const startInner = polarToCartesian(adjustedInner, endAngle);
  const endInner = polarToCartesian(adjustedInner, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${adjustedOuter} ${adjustedOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${adjustedInner} ${adjustedInner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export function Visualization() {
  const total = useMemo(
    () => data.reduce((sum, slice) => sum + slice.value, 0),
    [],
  );
  const initialIndex = useMemo(() => {
    let maxIndex = 0;
    data.forEach((slice, index) => {
      if (slice.value > data[maxIndex].value) {
        maxIndex = index;
      }
    });
    return maxIndex;
  }, []);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const slices = useMemo(() => {
    let currentAngle = -Math.PI / 2;
    return data.map((slice) => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      return { ...slice, startAngle, endAngle };
    });
  }, [total]);

  const activeSlice = slices[activeIndex];
  const activePercent = Math.round((activeSlice.value / total) * 100);

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-[#f7f1e5] via-white to-[#f1f5f9] px-5 pb-10 pt-8 text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0d7aa] text-[#7a4b2a] shadow-sm">
            <Pyramid size={22} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Pyramid Composition
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              What fills the scene?
            </h1>
          </div>
        </header>

        <section className="rounded-[28px] bg-white/80 p-5 shadow-[0_18px_40px_-30px_rgba(30,41,59,0.5)] backdrop-blur">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-square w-full">
              <svg
                className="h-full w-full"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                role="img"
                aria-label="Donut chart showing pyramid composition"
              >
                <circle
                  cx={center}
                  cy={center}
                  r={outerRadius + 6}
                  fill="#f8fafc"
                />
                {slices.map((slice, index) => {
                  const isActive = index === activeIndex;
                  const offset = isActive ? 8 : 0;
                  return (
                    <path
                      key={slice.name}
                      d={describeDonutSlice(
                        slice.startAngle,
                        slice.endAngle,
                        offset,
                      )}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      onClick={() => setActiveIndex(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setActiveIndex(index);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${slice.name} ${Math.round(
                        (slice.value / total) * 100,
                      )}%`}
                      className="cursor-pointer transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#416D9D]/40"
                    />
                  );
                })}
                <circle
                  cx={center}
                  cy={center}
                  r={innerRadius - 6}
                  fill="#ffffff"
                />
              </svg>
            </div>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-semibold text-slate-900">
                {activePercent}%
              </p>
              <p className="mt-1 text-sm text-slate-500">of the image</p>
              <p className="mt-3 px-6 text-base font-medium text-slate-800">
                {activeSlice.name}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>Breakdown</span>
            <span>Tap to highlight</span>
          </div>
          {slices.map((slice, index) => {
            const isActive = index === activeIndex;
            const percentage = Math.round((slice.value / total) * 100);
            return (
              <button
                key={slice.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-transparent bg-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.6)] ring-2 ring-[#416D9D]/20"
                    : "border-white/60 bg-white/60 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {slice.name}
                  </span>
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {percentage}%
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
