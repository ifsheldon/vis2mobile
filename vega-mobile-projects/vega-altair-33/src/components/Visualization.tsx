"use client";

import { useEffect, useState, useMemo } from "react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Plane, Info, X, Map as MapIcon, ChevronUp } from "lucide-react";
import airportsData from "../lib/airports_aggregated.json";

// FIPS code to State Abbreviation mapping
const fipsToState: Record<number, string> = {
  1: "AL",
  2: "AK",
  4: "AZ",
  5: "AR",
  6: "CA",
  8: "CO",
  9: "CT",
  10: "DE",
  11: "DC",
  12: "FL",
  13: "GA",
  15: "HI",
  16: "ID",
  17: "IL",
  18: "IN",
  19: "IA",
  20: "KS",
  21: "KY",
  22: "LA",
  23: "ME",
  24: "MD",
  25: "MA",
  26: "MI",
  27: "MN",
  28: "MS",
  29: "MO",
  30: "MT",
  31: "NE",
  32: "NV",
  33: "NH",
  34: "NJ",
  35: "NM",
  36: "NY",
  37: "NC",
  38: "ND",
  39: "OH",
  40: "OK",
  41: "OR",
  42: "PA",
  44: "RI",
  45: "SC",
  46: "SD",
  47: "TN",
  48: "TX",
  49: "UT",
  50: "VT",
  51: "VA",
  53: "WA",
  54: "WV",
  55: "WI",
  56: "WY",
  72: "PR",
  78: "VI",
};

const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  PR: "Puerto Rico",
  VI: "Virgin Islands",
};

interface AirportState {
  state: string;
  latitude: number;
  longitude: number;
  count: number;
}

interface GeometryFeature {
	type: string;
	id: number | string;
	geometry: {
		type: string;
		coordinates: any[];
	};
	properties: Record<string, any>;
}

interface GeometryCollection {
	type: "FeatureCollection";
	features: GeometryFeature[];
}

export function Visualization() {
	const [geometries, setGeometries] = useState<GeometryCollection | null>(null);
	const [selectedState, setSelectedState] = useState<string | null>(null);
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	// Load US Map Data
	useEffect(() => {
		fetch("/us-10m.json")
			.then((res) => res.json())
			.then((data) => {
				const states = topojson.feature(
					data,
					data.objects.states,
				) as unknown as GeometryCollection;
				setGeometries(states);
			});
	}, []);

	const projection = d3.geoAlbersUsa().scale(400).translate([160, 100]);
	const pathGenerator = d3.geoPath().projection(projection);

	const totalAirports = useMemo(() => {
		return airportsData.reduce((acc, curr) => acc + curr.count, 0);
	}, []);

	const topStates = useMemo(() => {
		return [...airportsData]
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)
			.map((d) => ({
				name: d.state,
				count: d.count,
				fullName: stateNames[d.state] || d.state,
			}));
	}, []);

	const selectedData = useMemo(() => {
		if (!selectedState) return null;
		return (airportsData as AirportState[]).find(
			(d) => d.state === selectedState,
		);
	}, [selectedState]);

	const handleStateClick = (stateCode: string) => {
		setSelectedState(stateCode);
		setIsPanelOpen(true);
	};

	const maxCount = Math.max(...airportsData.map((d) => d.count));
	const sizeScale = (count: number) => {
		const minSize = 3;
		const maxSize = 18;
		return minSize + (count / maxCount) * (maxSize - minSize);
	};

	if (!geometries) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-zinc-950 text-blue-500">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				>
					<Plane size={32} />
				</motion.div>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full bg-zinc-950 overflow-hidden font-sans text-zinc-100 flex flex-col">
			{/* Header */}
			<div className="p-4 pt-6 z-10 bg-gradient-to-b from-zinc-950 to-transparent">
				<h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
					<Plane className="text-blue-500" size={24} />
					US Airport Density
				</h1>
				<p className="text-xs text-zinc-400 mt-1">
					Visualizing {totalAirports.toLocaleString()} airports across the US
				</p>
			</div>

			{/* Map Container */}
			<div className="relative flex-1 flex items-start justify-center pt-4">
				<svg
					viewBox="0 0 320 220"
					className="w-full h-auto max-h-[50vh] drop-shadow-2xl"
					role="img"
					aria-labelledby="map-title"
				>
					<title id="map-title">US Airport Density Map</title>
					<g className="states">
						{geometries.features.map((feature) => {
							const stateCode = fipsToState[feature.id as number];
							const isSelected = selectedState === stateCode;
							return (
								<path
									key={feature.id}
									d={pathGenerator(feature as any) || ""}
									className={`transition-colors duration-300 cursor-pointer ${
										isSelected
											? "fill-blue-600/30 stroke-blue-400"
											: "fill-zinc-900 stroke-zinc-700/50"
									}`}
									onClick={() => stateCode && handleStateClick(stateCode)}
									strokeWidth={isSelected ? 1 : 0.5}
									role="button"
									aria-pressed={isSelected}
									tabIndex={0}
									onKeyDown={(e) => {
										if ((e.key === "Enter" || e.key === " ") && stateCode) {
											handleStateClick(stateCode);
										}
									}}
								/>
							);
						})}
					</g>

					<g className="bubbles">
						{airportsData.map((d) => {
							const coords = projection([d.longitude, d.latitude]);
							if (!coords) return null;
							const isSelected = selectedState === d.state;
							const radius = sizeScale(d.count);
							return (
								<motion.circle
									key={d.state}
									cx={coords[0]}
									cy={coords[1]}
									initial={{ r: radius }}
									animate={{
										r: isSelected ? [radius, radius * 1.3, radius] : radius,
										opacity: isSelected ? 1 : 0.7,
									}}
									transition={{
										r: { repeat: isSelected ? Infinity : 0, duration: 1.5 },
										opacity: { duration: 0.3 },
									}}
									className={`transition-all duration-300 pointer-events-none ${
										isSelected
											? "fill-blue-400 stroke-white"
											: "fill-blue-500 fill-opacity-50 stroke-blue-300/30"
									}`}
									strokeWidth={isSelected ? 1.5 : 0.5}
									style={{
										filter: isSelected
											? "drop-shadow(0 0 8px #60a5fa)"
											: "none",
									}}
								/>
							);
						})}
					</g>
				</svg>

				{/* Legend Overlay */}
				<div className="absolute top-2 right-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-2 rounded-lg text-[10px] space-y-1 shadow-lg">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-blue-500/60 border border-blue-300/50" />
						<span className="text-zinc-300">Airports Count</span>
					</div>
					<div className="flex items-center gap-1.5 mt-1 px-1">
						<div className="w-1 h-1 rounded-full bg-zinc-600" />
						<div className="w-2 h-2 rounded-full bg-zinc-600" />
						<div className="w-3 h-3 rounded-full bg-zinc-600" />
						<span className="text-zinc-500 ml-1">Scale</span>
					</div>
				</div>
			</div>

			{/* Quick Access Info if none selected */}
			{!isPanelOpen && (
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="p-4 pb-8 text-center"
				>
					<button
						type="button"
						onClick={() => setIsPanelOpen(true)}
						className="text-zinc-400 text-xs flex items-center gap-2 mx-auto bg-zinc-900/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-zinc-800 shadow-xl active:scale-95 transition-transform"
					>
						<Info size={14} className="text-blue-500" />
						Tap a state for details
						<ChevronUp size={14} />
					</button>
				</motion.div>
			)}

			{/* Bottom Sheet / Details Panel */}
			<AnimatePresence>
				{isPanelOpen && (
					<>
						{/* Backdrop for better focus */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsPanelOpen(false)}
							className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
						/>
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed inset-x-0 bottom-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh]"
						>
							{/* Handle */}
							<div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-3 mb-1" />

							<div className="p-5 flex-1 overflow-y-auto pb-10">
								<div className="flex justify-between items-start mb-6">
									<div>
										<h2 className="text-2xl font-bold text-white tracking-tight">
											{selectedState ? stateNames[selectedState] : "US Overview"}
										</h2>
										<p className="text-blue-400 font-semibold mt-0.5">
											{selectedData
												? `${selectedData.count} Airports`
												: `${totalAirports.toLocaleString()} Total Airports`}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setIsPanelOpen(false)}
										className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors"
									>
										<X size={20} />
									</button>
								</div>

								{/* Stats Cards */}
								<div className="grid grid-cols-2 gap-3 mb-8">
									<div className="bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-700/50">
										<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5">
											{selectedState ? "National Rank" : "Avg per State"}
										</p>
										<p className="text-2xl font-black text-white">
											{selectedState ? (
												<>
													<span className="text-blue-500 text-lg mr-1">#</span>
													{airportsData
														.sort((a, b) => b.count - a.count)
														.findIndex((d) => d.state === selectedState) + 1}
												</>
											) : (
												~~(totalAirports / airportsData.length)
											)}
										</p>
									</div>
									<div className="bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-700/50">
										<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5">
											{selectedState ? "% of National" : "Max in State"}
										</p>
										<p className="text-2xl font-black text-white">
											{selectedState ? (
												<>
													{((selectedData!.count / totalAirports) * 100).toFixed(
														1,
													)}
													<span className="text-blue-500 text-lg ml-1">%</span>
												</>
											) : (
												maxCount
											)}
										</p>
									</div>
								</div>

								{/* Chart Section */}
								<div className="mt-2">
									<h3 className="text-sm font-bold text-zinc-300 mb-5 flex items-center gap-2">
										<MapIcon size={16} className="text-blue-500" />
										Top States Comparison
									</h3>
									<div className="h-52 w-full bg-zinc-800/20 rounded-2xl p-4 border border-zinc-700/30">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={topStates}
												layout="vertical"
												margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
											>
												<XAxis type="number" hide />
												<YAxis
													dataKey="name"
													type="category"
													axisLine={false}
													tickLine={false}
													tick={{ fill: "#71717a", fontSize: 12, fontWeight: 600 }}
													width={35}
												/>
												<Tooltip
													cursor={{ fill: "rgba(255,255,255,0.05)", radius: 10 }}
													content={({ active, payload }) => {
														if (active && payload && payload.length) {
															return (
																<div className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl shadow-2xl">
																	<p className="text-xs font-bold text-white">
																		{payload[0].payload.fullName}
																	</p>
																	<p className="text-[10px] text-blue-400 font-bold">
																		{payload[0].value} Airports
																	</p>
																</div>
															);
														}
														return null;
													}}
												/>
												<Bar
													dataKey="count"
													radius={[0, 6, 6, 0]}
													barSize={24}
													onClick={(data) => handleStateClick(data.name)}
												>
													{topStates.map((entry) => (
														<Cell
															key={`cell-${entry.name}`}
															fill={
																selectedState === entry.name
																	? "#3b82f6"
																	: "#3f3f46"
															}
															className="cursor-pointer transition-all duration-500"
														/>
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>

								<p className="text-[10px] text-zinc-600 text-center mt-8 font-medium">
									Data source: Vega Datasets &bull; US Airports CSV
								</p>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
