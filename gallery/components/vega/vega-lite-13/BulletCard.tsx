import { type ClassValue, clsx } from "clsx";
import {
	Bar,
	ComposedChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface BulletData {
	title: string;
	subtitle: string;
	ranges: number[];
	measures: number[];
	markers: number[];
}

interface BulletCardProps {
	data: BulletData;
}

export function BulletCard({ data }: BulletCardProps) {
	const { title, subtitle, ranges, measures, markers } = data;

	// Prepare data for Recharts
	// ranges[2] is max, ranges[1] is mid, ranges[0] is min
	// measures[1] is forecast (light), measures[0] is current (dark)
	// markers[0] is target

	const chartData = [
		{
			name: title,
			rangeMax: ranges[2],
			rangeMid: ranges[1],
			rangeMin: ranges[0],
			measureForecast: measures[1],
			measureCurrent: measures[0],
			target: markers[0],
		},
	];

	const primaryValue = measures[0];
	const targetValue = markers[0];
	const isMeetingTarget = primaryValue >= targetValue;

	return (
		<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-4 w-full">
			{/* Header */}
			<div className="flex justify-between items-start mb-2">
				<div>
					<h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
						{title}
					</h3>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
				</div>
				<div className="text-right">
					<div
						className={cn(
							"text-2xl font-bold tabular-nums",
							isMeetingTarget
								? "text-emerald-600 dark:text-emerald-400"
								: "text-zinc-900 dark:text-zinc-100",
						)}
					>
						{primaryValue.toLocaleString()}
					</div>
					<div className="text-xs text-zinc-400 dark:text-zinc-500">
						Target: {targetValue.toLocaleString()}
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className="h-12 w-full relative">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						layout="vertical"
						data={chartData}
						margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
						barGap="-100%"
						barCategoryGap={0}
					>
						<XAxis type="number" hide domain={[0, ranges[2]]} />
						<YAxis type="category" dataKey="name" hide />
						<Tooltip
							cursor={false}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const d = payload[0].payload;
									return (
										<div className="bg-zinc-800 text-white text-[10px] rounded px-2 py-1 shadow-lg border border-zinc-700">
											<div className="font-bold mb-0.5 border-b border-zinc-700 pb-0.5">
												{d.name}
											</div>
											<div className="flex justify-between gap-4">
												<span className="text-zinc-400">Current</span>
												<span className="font-mono">{d.measureCurrent}</span>
											</div>
											<div className="flex justify-between gap-4">
												<span className="text-zinc-400">Forecast</span>
												<span className="font-mono">{d.measureForecast}</span>
											</div>
											<div className="flex justify-between gap-4">
												<span className="text-zinc-400">Target</span>
												<span className="font-mono">{d.target}</span>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>

						{/* Background Ranges */}
						<Bar
							dataKey="rangeMax"
							barSize={24}
							fill="#f1f5f9"
							isAnimationActive={false}
							radius={[0, 4, 4, 0]}
						/>
						<Bar
							dataKey="rangeMid"
							barSize={24}
							fill="#e2e8f0"
							isAnimationActive={false}
							radius={[0, 4, 4, 0]}
						/>
						<Bar
							dataKey="rangeMin"
							barSize={24}
							fill="#cbd5e1"
							isAnimationActive={false}
							radius={[0, 4, 4, 0]}
						/>

						{/* Measures */}
						<Bar
							dataKey="measureForecast"
							barSize={8}
							fill="#93c5fd"
							radius={[0, 2, 2, 0]}
						/>
						<Bar
							dataKey="measureCurrent"
							barSize={8}
							fill="#2563eb"
							radius={[0, 2, 2, 0]}
						/>

						{/* Target Marker */}
						<ReferenceLine
							x={chartData[0].target}
							stroke="black"
							strokeWidth={3}
							isFront={true}
							strokeDasharray="none"
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
