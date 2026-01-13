import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RangeSlider } from "@/components/ui/range-slider";

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
  // Local state for slider to ensure smooth dragging without waiting for heavy re-render
  // But we also need to sync with parent if parent updates (e.g. reset)
  // Actually, let's try direct control first. If laggy, we decouple.

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-slate-200 uppercase tracking-wider">
            {title}
          </CardTitle>
          <span className="text-xs font-mono text-blue-400">
            {filterRange[0]}
            {unit} - {filterRange[1]}
            {unit}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap={0}
              barGap={0}
            >
              {/* Global (Background) Data */}
              <Bar dataKey="global" fill="#334155" isAnimationActive={false} />

              {/* Filtered (Foreground) Data */}
              <Bar dataKey="filtered" fill={color} isAnimationActive={true} />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border border-slate-700 bg-slate-900/95 p-2 shadow-xl text-xs text-slate-200">
                        <div className="font-bold mb-1">
                          Range: {d.x0} - {d.x1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-500" />
                          <span>Total: {d.global}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span>Selected: {d.filtered}</span>
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
        <div className="px-1">
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
