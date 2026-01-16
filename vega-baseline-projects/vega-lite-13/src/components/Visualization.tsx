"use client";

import { type BulletData, data } from "@/lib/data";

const BulletChart = ({ item }: { item: BulletData }) => {
  const maxRange = Math.max(...item.ranges, ...item.measures, ...item.markers);

  // Calculate percentages for positioning

  const getPercent = (val: number) => (val / maxRange) * 100;

  return (
    <div className="flex flex-col w-full mb-6 last:mb-0">
      <div className="flex flex-col mb-2 px-1">
        <span className="text-sm font-bold text-zinc-800 leading-tight">
          {item.title}
        </span>

        <span className="text-[11px] text-zinc-500 italic uppercase tracking-wider">
          {item.subtitle}
        </span>
      </div>

      <div className="relative h-6 w-full bg-zinc-50 flex items-center rounded-sm overflow-hidden shadow-sm">
        {/* Ranges (background layers) */}

        <div
          className="absolute h-full bg-[#eeeeee]"
          style={{ width: `${getPercent(item.ranges[2])}%` }}
        />

        <div
          className="absolute h-full bg-[#dddddd]"
          style={{ width: `${getPercent(item.ranges[1])}%` }}
        />

        <div
          className="absolute h-full bg-[#cccccc]"
          style={{ width: `${getPercent(item.ranges[0])}%` }}
        />

        {/* Measures (foreground bars) */}

        <div
          className="absolute h-2.5 bg-[#b0c4de]"
          style={{ width: `${getPercent(item.measures[1])}%` }}
        />

        <div
          className="absolute h-2.5 bg-[#4682b4]"
          style={{ width: `${getPercent(item.measures[0])}%` }}
        />

        {/* Marker (target tick) */}

        <div
          className="absolute h-4 w-0.5 bg-zinc-900"
          style={{
            left: `${getPercent(item.markers[0])}%`,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] font-medium text-zinc-400">0</span>

        <span className="text-[9px] font-medium text-zinc-400">{maxRange}</span>
      </div>
    </div>
  );
};

export function Visualization() {
  return (
    <div className="w-full h-full p-6 overflow-y-auto bg-white">
      <div className="flex flex-col w-full max-w-sm mx-auto">
        <header className="mb-8">
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            Performance Metrics
          </h1>

          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Comparative bullet charts for key indicators
          </p>
        </header>

        <div className="space-y-2 mb-8 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
            Legend
          </h2>

          <div className="grid grid-cols-2 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-[#4682b4] rounded-sm" />

              <span className="text-[10px] text-zinc-600 font-medium">
                Primary Measure
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-[#b0c4de] rounded-sm" />

              <span className="text-[10px] text-zinc-600 font-medium">
                Secondary Measure
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3 bg-zinc-900 mx-[5px]" />

              <span className="text-[10px] text-zinc-600 font-medium ml-[-1px]">
                Marker (Target)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#cccccc] rounded-sm" />

              <span className="text-[10px] text-zinc-600 font-medium">
                Quality Ranges
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {data.map((item) => (
            <BulletChart key={item.title} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
