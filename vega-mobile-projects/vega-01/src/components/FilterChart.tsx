import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  name: string;
  x0: number;
  x1: number;
  global: number;
  filtered: number;
}

interface FilterChartProps {
  title: string;
  data: ChartDataPoint[];
  filterRange: [number, number];
  domain: [number, number];
  step: number;
  onFilterChange: (range: [number, number]) => void;
  color?: string;
  unit?: string;
}

export function FilterChart({
  title,
  data,
  filterRange,
  domain,
  step,
  onFilterChange,
  color = "#3b82f6", // blue-500
  unit = "",
}: FilterChartProps) {
  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            {title}
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-[10px] font-bold text-blue-400 font-mono">
              {filterRange[0]}
              {unit} — {filterRange[1]}
              {unit}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 10, bottom: 0, left: 10 }}
              barCategoryGap="10%"
            >
              <XAxis
                dataKey="x0"
                type="number"
                domain={domain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                ticks={[
                  domain[0],
                  domain[0] + (domain[1] - domain[0]) / 2,
                  domain[1],
                ]}
                interval={0}
              />
              <YAxis hide domain={[0, "auto"]} />

              {/* Global (Background) Data */}
              <Bar
                dataKey="global"
                fill="#1e293b"
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
              />

              {/* Filtered (Foreground) Data */}
              <Bar
                dataKey="filtered"
                fill={color}
                isAnimationActive={true}
                radius={[2, 2, 0, 0]}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 shadow-2xl text-[11px] text-slate-200 backdrop-blur-md">
                        <div className="font-bold mb-1.5 text-slate-100 border-b border-white/10 pb-1">
                          Range: {d.x0}
                          {unit} - {d.x1}
                          {unit}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-slate-600" />
                              <span>Total</span>
                            </div>
                            <span className="font-mono text-slate-400">
                              {d.global.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span>Selected</span>
                            </div>
                            <span
                              className="font-mono font-bold"
                              style={{ color }}
                            >
                              {d.filtered.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Range Slider Control */}
        <div className="px-2 pb-2">
          <RangeSlider
            min={domain[0]}
            max={domain[1]}
            step={step}
            value={filterRange}
            onValueChange={(val) => onFilterChange(val as [number, number])}
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
