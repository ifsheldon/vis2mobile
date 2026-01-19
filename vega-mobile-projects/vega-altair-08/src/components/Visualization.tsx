"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { type ProcessedVariety, processData } from "@/lib/data";

const SITE_COLORS: { [key: string]: string } = {
  "University Farm": "#4c78a8",
  Waseca: "#f58518",
  Morris: "#e45756",
  Crookston: "#72b7b2",
  "Grand Rapids": "#54a24b",
  Duluth: "#eeca3b",
};

const VarietyCard = ({
  variety,
  sites,
}: {
  variety: ProcessedVariety;
  sites: string[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const chartData = useMemo(() => {
    return [variety.sites];
  }, [variety]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="mb-4 overflow-hidden border border-zinc-200 shadow-sm rounded-xl bg-white">
      <button
        type="button"
        className="w-full p-4 flex flex-row items-center justify-between cursor-pointer bg-white/50 backdrop-blur-sm active:bg-zinc-100 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-zinc-800">{variety.name}</h3>
          <span className="text-xs font-medium text-zinc-500">
            Total Yield: {variety.total.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </button>
      <div className="p-4 pt-0">
        <div className="h-12 w-full mt-2 min-h-[48px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, 450]} />
              <YAxis type="category" hide />
              {sites.map((site) => (
                <Bar
                  key={site}
                  dataKey={site}
                  stackId="a"
                  fill={SITE_COLORS[site]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {sites.map((site) => (
              <div
                key={site}
                className="flex items-center space-x-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SITE_COLORS[site] }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 truncate leading-tight">
                    {site}
                  </span>
                  <span className="text-sm font-bold text-zinc-700">
                    {variety.sites[site]?.toFixed(1) || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function Visualization() {
  const { data, sites } = useMemo(() => processData(), []);

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Header & Sticky Legend */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-zinc-200 p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-black text-zinc-900 leading-tight">
            Barley Varieties
          </h1>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Yield Analysis by Site
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {sites.map((site) => (
            <div key={site} className="flex items-center space-x-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: SITE_COLORS[site] }}
              />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">
                {site}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {data.map((variety) => (
          <VarietyCard key={variety.name} variety={variety} sites={sites} />
        ))}
      </div>
    </div>
  );
}
