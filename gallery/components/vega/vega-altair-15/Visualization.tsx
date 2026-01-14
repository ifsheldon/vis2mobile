"use client";

import { geoAlbersUsa, geoPath } from "d3-geo";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	type Capital,
	fetchMapData,
	type MapData,
} from "@/components/vega/vega-altair-15/map-data";

export function Visualization() {
	const [data, setData] = useState<MapData | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedCapital, setSelectedCapital] = useState<Capital | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		fetchMapData()
			.then((d) => {
				setData(d);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Failed to load map data", err);
				setLoading(false);
			});
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when data loads to attach observer.
	useEffect(() => {
		if (!containerRef.current) return;
		const element = containerRef.current;

		const updateDimensions = () => {
			setDimensions({
				width: element.clientWidth,
				height: element.clientHeight,
			});
		};

		const observer = new ResizeObserver(() => {
			updateDimensions();
		});

		observer.observe(element);
		updateDimensions();

		return () => observer.disconnect();
	}, [data]);

	const { projection, pathGenerator } = useMemo(() => {
		if (!data || dimensions.width === 0)
			return { projection: null, pathGenerator: null };

		// Create a projection that fits the width of the container
		const proj = geoAlbersUsa();
		// Fit the projection to the container, leaving some padding
		// We only use the top portion for the map
		const mapHeight = dimensions.height * 0.6;

		// Construct a FeatureCollection of all states to fit
		const allStates = {
			type: "FeatureCollection",
			features: data.features,
		};

		// Cast to any because d3-geo types are sometimes strict about GeoJSON version compatibility
		// biome-ignore lint/suspicious/noExplicitAny: d3-geo types are strict
		proj.fitSize([dimensions.width, mapHeight], allStates as any);

		const pathGen = geoPath().projection(proj);

		return { projection: proj, pathGenerator: pathGen };
	}, [data, dimensions]);

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-zinc-950 text-white">
				<div className="animate-pulse flex flex-col items-center gap-2">
					<div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
					<p className="text-sm text-zinc-400">Loading Map Data...</p>
				</div>
			</div>
		);
	}

	if (!data) {
		return null;
	}

	return (
		<div className="w-full h-screen bg-zinc-950 flex flex-col overflow-hidden relative font-sans text-zinc-100">
			{/* Header */}
			<div className="absolute top-0 left-0 w-full z-10 p-4 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
				<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
					US State Capitals
				</h1>
				<p className="text-sm text-zinc-400 mt-1">Tap a city to explore</p>
			</div>

			{/* Map Container */}
			<div ref={containerRef} className="flex-grow w-full h-[60%] relative">
				{projection && pathGenerator ? (
					<svg
						width="100%"
						height="100%"
						viewBox={`0 0 ${dimensions.width} ${dimensions.height * 0.6}`}
						className="overflow-visible"
					>
						<title>Interactive Map of US State Capitals</title>
						{/* Background States */}
						<g>
							{data.features.map((feature, i) => (
								<path
									key={feature.id ? String(feature.id) : `state-${i}`}
									d={pathGenerator(feature) || ""}
									fill="rgba(255, 255, 255, 0.05)"
									stroke="rgba(255, 255, 255, 0.2)"
									strokeWidth={0.5}
									className="transition-colors duration-300"
								/>
							))}
						</g>

						{/* Capitals */}
						<g>
							{data.capitals.map((capital) => {
								const coords = projection([capital.lon, capital.lat]);
								if (!coords) return null;
								const [x, y] = coords;
								const isSelected = selectedCapital?.city === capital.city;

								return (
									// biome-ignore lint/a11y/useSemanticElements: cannot use button inside svg
									<g
										key={capital.city}
										transform={`translate(${x}, ${y})`}
										onClick={() => setSelectedCapital(capital)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												setSelectedCapital(capital);
											}
										}}
										role="button"
										tabIndex={0}
										className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-full"
										aria-label={`Select ${capital.city}, ${capital.state}`}
									>
										{/* Invisible Hit Target (Larger) */}
										<circle r={22} fill="transparent" />

										{/* Visible Dot */}
										<motion.circle
											r={isSelected ? 6 : 3}
											initial={false}
											animate={{
												r: isSelected ? 8 : 3,
												fill: isSelected ? "#06b6d4" : "#71717a", // cyan-500 vs zinc-500
												stroke: isSelected ? "#fff" : "none",
												strokeWidth: isSelected ? 2 : 0,
											}}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 20,
											}}
										/>

										{/* Ripple effect when selected */}
										{isSelected && (
											<motion.circle
												r={8}
												initial={{ opacity: 0.5, scale: 1 }}
												animate={{ opacity: 0, scale: 3 }}
												transition={{ duration: 1.5, repeat: Infinity }}
												fill="none"
												stroke="#06b6d4"
												strokeWidth={1}
											/>
										)}
									</g>
								);
							})}
						</g>
					</svg>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
						Preparing map…
					</div>
				)}
			</div>

			{/* Detail Card (Bottom Sheet) */}
			<motion.div
				className="h-[40%] bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 p-6 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<AnimatePresence mode="wait">
					{selectedCapital ? (
						<motion.div
							key={selectedCapital.city}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
							className="flex flex-col gap-4 h-full"
						>
							<div>
								<h2 className="text-3xl font-bold text-white mb-1">
									{selectedCapital.city}
								</h2>
								<h3 className="text-xl text-cyan-400 font-medium">
									{selectedCapital.state}
								</h3>
							</div>

							<div className="grid grid-cols-2 gap-4 mt-2">
								<div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col gap-2">
									<div className="flex items-center gap-2 text-zinc-400 text-sm">
										<Navigation size={16} />
										<span>Latitude</span>
									</div>
									<span className="text-xl font-mono text-white">
										{selectedCapital.lat.toFixed(4)}°N
									</span>
								</div>

								<div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col gap-2">
									<div className="flex items-center gap-2 text-zinc-400 text-sm">
										<Navigation size={16} className="rotate-90" />
										<span>Longitude</span>
									</div>
									<span className="text-xl font-mono text-white">
										{Math.abs(selectedCapital.lon).toFixed(4)}°W
									</span>
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="empty"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3"
						>
							<div className="p-4 bg-zinc-800/50 rounded-full">
								<MapPin size={32} className="text-zinc-600" />
							</div>
							<p className="text-lg">Select a capital on the map</p>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
