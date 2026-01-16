import { useMemo } from "react";
import { type DisasterData, disasterData } from "@/lib/data";

interface YearGroup {
  year: number;
  totalCost: number;
  segments: DisasterData[];
}

export function Visualization() {
  const { yearGroups, maxCost } = useMemo(() => {
    const groups: Record<number, YearGroup> = {};
    let max = 0;

    for (const item of disasterData) {
      if (!groups[item.year]) {
        groups[item.year] = { year: item.year, totalCost: 0, segments: [] };
      }
      groups[item.year].segments.push(item);
      groups[item.year].totalCost += item.cost;
    }

    const sortedGroups = Object.values(groups).sort((a, b) => a.year - b.year);

    // Calculate global max for scale
    max = Math.max(...sortedGroups.map((g) => g.totalCost));

    // Sort segments within year by cost descending for consistent stacking visual
    // or keep original order? Original order seems to put largest first for 2017.
    // Let's stick to original order but ensure labeled ones are prioritized if needed.
    // Actually, simply stacking them is fine.

    return { yearGroups: sortedGroups, maxCost: max };
  }, []);

  // Round up maxCost to nice number for grid (e.g. nearest 50 or 100)
  const scaleMax = Math.ceil(maxCost / 50) * 50;
  const gridLines = Array.from({ length: scaleMax / 50 + 1 }, (_, i) => i * 50);

  return (
    <div className="w-full min-h-screen bg-white text-zinc-800 p-4 pb-12 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold leading-tight mb-2">
          Total cost of major natural disasters
        </h1>
        <p className="text-sm text-zinc-500">
          For disasters causing more than $1 billion in losses
        </p>
      </header>

      <div className="relative">
        {/* Background Grid */}
        <div className="absolute top-0 bottom-0 left-12 right-16 pointer-events-none z-0">
          {gridLines.map((val) => (
            <div
              key={val}
              className="absolute top-0 bottom-0 border-l border-dashed border-zinc-200"
              style={{ left: `${(val / scaleMax) * 100}%` }}
            />
          ))}
        </div>

        {/* Axis Labels (Sticky Top?) */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 flex pl-12 pr-16 pb-2 border-b border-zinc-100 mb-4 text-xs text-zinc-400 font-mono">
          <div className="flex-1 relative h-4">
            {gridLines.map((val) => (
              <span
                key={val}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${(val / scaleMax) * 100}%` }}
              >
                {val === scaleMax ? `$${val}B` : val === 0 ? "0" : val}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {yearGroups.map((group) => (
            <div key={group.year} className="flex flex-col">
              <div className="flex items-center h-6">
                {/* Year Label */}
                <span className="w-12 text-sm font-medium text-zinc-500 tabular-nums shrink-0 pt-0.5">
                  {group.year}
                </span>

                {/* Bar Area */}
                <div className="flex-1 h-full flex items-center relative mr-16">
                  {/* Render Segments */}
                  <div className="flex h-5 w-full relative">
                    {group.segments.map((seg) => {
                      const widthPct = (seg.cost / scaleMax) * 100;
                      // seg._index_ comes from the extracted data and is unique
                      return (
                        <div
                          key={seg._index_}
                          role="img"
                          className={`h-full border-r border-white/80 last:border-0 ${
                            seg.labeled ? "bg-rose-600" : "bg-stone-300"
                          }`}
                          style={{ width: `${widthPct}%` }}
                          aria-label={`${seg.label || "Cost"}: $${seg.cost}B`}
                        />
                      );
                    })}
                  </div>

                  {/* Total Value Label at end of bar */}
                  <span className="absolute left-full ml-2 text-xs font-semibold text-zinc-700 whitespace-nowrap">
                    {group.totalCost >= 10
                      ? `${group.totalCost}`
                      : group.totalCost}
                  </span>
                </div>
              </div>

              {/* Labeled Events Details */}
              {group.segments.some((s) => s.labeled) && (
                <div className="mt-1 pl-12 pr-4 space-y-1 mb-2">
                  {group.segments
                    .filter((s) => s.labeled)
                    .map((seg) => (
                      <div
                        key={seg._index_}
                        className="flex items-start text-xs text-zinc-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 mr-2 shrink-0" />
                        <div>
                          <span className="font-bold text-zinc-800">
                            {seg.label}
                          </span>
                          <span className="text-zinc-500 ml-1">
                            (${seg.cost}B)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
