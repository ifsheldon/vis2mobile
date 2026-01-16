"use client";

import { Info, MapPin, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { candidates, type RegionData, regions } from "@/lib/data";

export function Visualization() {
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(
    null,
  );
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const mapRef = React.useRef<HTMLDivElement>(null);

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === selectedRegionName),
    [selectedRegionName],
  );

  const insights = useMemo(() => regions.filter((r) => r.label), []);

  const handleRegionClick = (region: RegionData) => {
    setSelectedRegionName(
      region.name === selectedRegionName ? null : region.name,
    );
  };

  const handleCandidateClick = (candidateName: string) => {
    setSelectedCandidate(
      candidateName === selectedCandidate ? null : candidateName,
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white px-4 py-3 border-b border-slate-200 shrink-0 shadow-sm z-10">
        <h1 className="font-bold text-lg leading-tight">
          French Election Results
        </h1>
        <p className="text-xs text-slate-500">2017 Presidential Election</p>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Map Section */}
          <div
            ref={mapRef}
            className="relative w-full aspect-[1.1] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <svg
              viewBox="0 0 1060 936"
              className="w-full h-full drop-shadow-sm"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Map of France showing election results"
              role="img"
            >
              <title>French Election Map</title>
              <g transform="translate(5,39)">
                {" "}
                {/* Transform from original */}
                {regions.map((region) => {
                  const isSelected = selectedRegionName === region.name;
                  const isCandidateMatch = selectedCandidate
                    ? region.winner === selectedCandidate
                    : true;
                  const opacity =
                    selectedCandidate && !isCandidateMatch ? 0.2 : 1;
                  // Increase stroke width for mobile visibility (original was 0.5)
                  const strokeWidth = isSelected ? 6 : 2;
                  const stroke = isSelected ? "#1e293b" : "#ffffff"; // Dark slate or white stroke
                  const zIndex = isSelected ? 10 : 1;

                  return (
                    // biome-ignore lint/a11y/useSemanticElements: SVG path is interactive
                    <path
                      key={region.name}
                      d={region.d}
                      fill={region.fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeOpacity={1}
                      opacity={opacity}
                      onClick={() => handleRegionClick(region)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleRegionClick(region);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="transition-all duration-200 cursor-pointer hover:opacity-80 outline-none"
                      style={{
                        paintOrder: "stroke",
                        zIndex: zIndex,
                      }}
                      strokeLinejoin="round"
                      aria-label={`${region.name}, Winner: ${region.winner}`}
                    />
                  );
                })}
                {/* Re-render selected region on top to ensure stroke visibility */}
                {selectedRegion && (
                  <path
                    d={selectedRegion.d}
                    fill={selectedRegion.fill}
                    stroke="#1e293b"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                )}
              </g>
            </svg>

            {/* Map Legend Overlay / Controls */}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm text-xs">
              <span className="font-medium text-slate-500">
                Tap a region for details
              </span>
            </div>
          </div>

          {/* Candidates Legend */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              Winner by Region
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => handleCandidateClick(c.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium ${
                    selectedCandidate === c.name
                      ? "bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  } ${selectedCandidate && selectedCandidate !== c.name ? "opacity-50" : ""}`}
                >
                  <span
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Info size={16} /> Key Insights
            </h3>
            <div className="grid gap-3">
              {insights.map((region) => (
                <button
                  type="button"
                  key={region.name}
                  className={`text-left w-full bg-white p-3 rounded-lg border shadow-sm transition-all cursor-pointer ${
                    selectedRegionName === region.name
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    setSelectedRegionName(region.name);
                    mapRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedRegionName(region.name);
                      mapRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />{" "}
                      {region.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: `${region.fill}40`,
                        color: "#333",
                      }}
                    >
                      {region.winner}
                    </span>
                  </div>
                  <div
                    className="text-sm text-slate-600 leading-relaxed"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content from extraction
                    dangerouslySetInnerHTML={{ __html: region.label || "" }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Spacer for bottom sheet */}
          <div className="h-24"></div>
        </div>
      </div>

      {/* Selected Region Details Bottom Sheet */}
      {selectedRegion && (
        <div className="bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 shrink-0 transition-transform duration-300 z-20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedRegion.name}
              </h2>
              <p className="text-sm text-slate-500">
                Population: {selectedRegion.population.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRegionName(null)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-lg p-2 flex items-center gap-3 border border-slate-200">
              <div
                className="w-8 h-8 rounded-full shadow-sm shrink-0 border border-white/20"
                style={{ backgroundColor: selectedRegion.fill }}
              />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                  Winner
                </p>
                <p className="font-medium text-slate-900">
                  {selectedRegion.winner}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
