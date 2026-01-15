"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Info, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our data
interface CountyProperties {
  name: string;
}

interface CountyFeature
  extends GeoJSON.Feature<GeoJSON.Geometry, CountyProperties> {
  id: string;
}

export function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const [geoData, setGeoData] = useState<any>(null);
  const [rateMap, setRateMap] = useState<Map<string, number>>(new Map());
  const [selectedCounty, setSelectedCounty] = useState<CountyFeature | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(
    d3.zoomIdentity,
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topoData, tsvData] = await Promise.all([
          d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"),
          d3.tsv(
            "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment.tsv",
          ),
        ]);

        const counties = topojson.feature(
          topoData as any,
          (topoData as any).objects.counties,
        ) as any;
        setGeoData(counties);

        const rates = new Map<string, number>();
        (tsvData as any[]).forEach((d) => {
          // Normalize ID to 5 digits string
          const id = d.id.padStart(5, "0");
          rates.set(id, +d.rate);
        });
        setRateMap(rates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Set up Zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    svg.call(zoom);
  }, [loading]);

  // Color scale
  const colorScale = useMemo(() => {
    return d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 0.2]);
  }, []);

  // Projection and path generator
  const { projection, pathGenerator } = useMemo(() => {
    const projection = d3.geoAlbersUsa();
    const pathGenerator = d3.geoPath().projection(projection);

    if (geoData && dimensions.width > 0) {
      // Adjust map to fit the container width
      projection.fitSize([dimensions.width, dimensions.height * 0.55], geoData);
    }

    return { projection, pathGenerator };
  }, [geoData, dimensions]);

  const handleCountyClick = (
    event: React.MouseEvent,
    feature: CountyFeature,
  ) => {
    event.stopPropagation();
    setSelectedCounty(selectedCounty?.id === feature.id ? null : feature);
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.75);
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-zinc-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse">
          Analyzing Census Data...
        </p>
      </div>
    );
  }

  const selectedRate = selectedCounty ? rateMap.get(selectedCounty.id) : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-zinc-50 overflow-hidden font-sans"
    >
      {/* Header */}
      <div className="p-6 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-10 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">
              Map Explorer
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live US Unemployment Rates
            </p>
          </div>
          <button className="p-2.5 bg-zinc-100 rounded-2xl text-zinc-500 active:scale-95 transition-all">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden bg-white">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height * 0.55}
          className="w-full h-full touch-none"
          onClick={() => setSelectedCounty(null)}
        >
          <g ref={gRef}>
            {geoData?.features.map((feature: CountyFeature) => {
              const rate = rateMap.get(feature.id);
              const isSelected = selectedCounty?.id === feature.id;

              return (
                <path
                  key={feature.id}
                  d={pathGenerator(feature) || ""}
                  fill={rate !== undefined ? colorScale(rate) : "#f4f4f5"}
                  stroke={isSelected ? "#000" : "#fff"}
                  strokeWidth={
                    isSelected ? 1.5 / zoomTransform.k : 0.15 / zoomTransform.k
                  }
                  className="transition-[stroke-width,fill] duration-200 ease-in-out cursor-pointer"
                  onClick={(e) => handleCountyClick(e, feature)}
                />
              );
            })}
          </g>
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-4 p-4 bg-white/95 backdrop-blur-md border border-zinc-100 rounded-2xl shadow-xl z-20 w-[calc(100%-2rem)] max-w-[280px]">
          <div className="flex justify-between items-center mb-2.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">
              Rate Scale
            </p>
            <Info size={12} className="text-zinc-300" />
          </div>
          <div className="space-y-2">
            <div
              className="h-2 w-full rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #ffffd9, #edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #253494, #081d58)",
              }}
            />
            <div className="flex justify-between text-[10px] font-black text-zinc-600">
              <span>0%</span>
              <span>10%</span>
              <span>20%+</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-4 top-4 flex flex-col space-y-2.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="w-11 h-11 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700 active:scale-90 transition-all"
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="w-11 h-11 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700 active:scale-90 transition-all"
          >
            <Minimize2 size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetZoom();
            }}
            className="w-11 h-11 bg-zinc-900 shadow-lg shadow-zinc-900/20 border border-zinc-800 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all text-[10px] font-black"
          >
            FIT
          </button>
        </div>
      </div>

      {/* Bottom Selection Card */}
      <AnimatePresence>
        {selectedCounty && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-100 rounded-t-[3rem] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.15)] z-30 p-8 pb-12"
          >
            <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-8" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <MapPin
                    size={14}
                    className="fill-indigo-600/10"
                    strokeWidth={2.5}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                    {selectedCounty.id}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter leading-[1.1]">
                  {selectedCounty.properties.name || "Unknown"} County
                </h2>
              </div>
              <div className="bg-zinc-900 px-6 py-4 rounded-[1.5rem] text-right shadow-xl shadow-zinc-900/10 shrink-0">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Rate
                </p>
                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">
                  {selectedRate ? (selectedRate * 100).toFixed(1) : "—"}
                  <span className="text-lg ml-0.5 opacity-60">%</span>
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5">
                  Risk Profile
                </p>
                <div className="flex items-center space-x-2.5">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      selectedRate && selectedRate > 0.1
                        ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                        : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
                    )}
                  />
                  <p className="text-base font-black text-zinc-800 tracking-tight">
                    {selectedRate && selectedRate > 0.1
                      ? "Elevated"
                      : "Controlled"}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5">
                  Comparison
                </p>
                <p className="text-base font-black text-zinc-800 tracking-tight">
                  {selectedRate && selectedRate > 0.08
                    ? "Above Nat. Avg"
                    : "Below Nat. Avg"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCounty(null)}
              className="w-full mt-8 py-5 bg-zinc-100 text-zinc-900 rounded-[1.5rem] font-black text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              Close Explorer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-30 z-10">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">
          Interactive GIS Explorer
        </p>
      </div>
    </div>
  );
}
