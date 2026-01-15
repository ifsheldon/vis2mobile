"use client";

import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
  TooltipProps,
} from "recharts";
import processedData from "../lib/processed_data.json";

export function Visualization() {
  const { mean_rating, bins, total_count } = processedData;

  // Custom tooltip to show both frequency and cumulative percentage
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.cumulative / total_count) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-zinc-200 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-zinc-800 mb-1">{`Rating: ${data.bin_start} - ${data.bin_end}`}</p>
          <p className="text-indigo-600">{`Frequency: ${data.count} movies`}</p>
          <p className="text-emerald-600">{`Cumulative: ${data.cumulative} (${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white p-4 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-zinc-900">
          IMDB Ratings Distribution
        </h1>
        <p className="text-xs text-zinc-500">
          Analysis of {total_count.toLocaleString()} movies
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={bins}
            margin={{ top: 40, right: 10, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="bin_start"
              type="number"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
              label={{
                value: "IMDB Rating",
                position: "bottom",
                offset: 0,
                fontSize: 12,
                fill: "#71717a",
              }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                fill: "#71717a",
                offset: 10,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Cumulative",
                angle: 90,
                position: "insideRight",
                fontSize: 10,
                fill: "#71717a",
                offset: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCumulative)"
              name="Cumulative Count"
            />

            <Bar
              yAxisId="left"
              dataKey="count"
              fill="#6366f1"
              radius={[2, 2, 0, 0]}
              name="Frequency"
              barSize={12}
            >
              {bins.map((entry) => (
                <Cell
                  key={`cell-${entry.bin_start}`}
                  fill={entry.bin_start < mean_rating ? "#818cf8" : "#4f46e5"}
                />
              ))}
            </Bar>

            <ReferenceLine
              x={mean_rating}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              yAxisId="left"
              label={{
                value: `Mean: ${mean_rating.toFixed(2)}`,
                position: "top",
                fill: "#ef4444",
                fontSize: 12,
                fontWeight: "bold",
                offset: 15,
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            Average Rating
          </p>
          <p className="text-2xl font-bold text-red-500">
            {mean_rating.toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            Total Movies
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {total_count.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-zinc-400 leading-tight italic">
        The bar chart shows the frequency of ratings in 0.5 increments. The
        shaded area represents the cumulative distribution, showing what
        percentage of movies fall below a certain rating.
      </div>
    </div>
  );
}
