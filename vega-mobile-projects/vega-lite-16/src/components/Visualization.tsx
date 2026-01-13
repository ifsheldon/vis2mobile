"use client";

import type React from 'react';
import { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from "@/lib/utils";
import drivingData from '@/lib/driving.json';

// Simple Card components since we don't have them in the project
const CustomCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden", className)}>
    {children}
  </div>
);

interface DataPoint {
  year: number;
  miles: number;
  gas: number;
  side?: string;
}

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = drivingData as DataPoint[];

  const selectedPoint = useMemo(() => {
    if (activeIndex !== null) return data[activeIndex];
    return data[data.length - 1]; // Default to latest year
  }, [activeIndex, data]);

  const onScatterMouseEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-2 bg-zinc-50 min-h-[600px]">
      <div className="px-2 pt-4">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Driving vs. Gas Prices</h2>
        <p className="text-sm text-zinc-500 mt-1">
          The relationship between miles driven per capita and the cost of gas (1956–2010).
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Tap points on the chart to explore
          </span>
        </div>
      </div>

      {/* Info Card / Data Display */}
      <CustomCard className="mx-2 bg-blue-50 border-blue-100 shadow-md">
        <div className="flex justify-between items-center p-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Year</span>
            <span className="text-2xl font-black text-blue-900">{selectedPoint.year}</span>
          </div>
          <div className="h-10 w-[1px] bg-blue-200" />
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Gas</span>
              <span className="text-lg font-bold text-blue-900">${selectedPoint.gas.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Miles</span>
              <span className="text-lg font-bold text-blue-900">{selectedPoint.miles.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CustomCard>

      {/* Chart Container */}
      <div className="w-full aspect-[4/5] relative px-0 bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 40, right: 30, bottom: 50, left: 10 }}
          >
            <XAxis
              type="number"
              dataKey="miles"
              name="miles"
              domain={[3000, 11000]}
              tick={{ fontSize: 10, fill: '#71717a' }}
              ticks={[4000, 6000, 8000, 10000]}
              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
              label={{ value: 'Miles Driven (per capita)', position: 'bottom', offset: 30, fontSize: 11, fontWeight: 600, fill: '#3f3f46' }}
              axisLine={{ stroke: '#e4e4e7' }}
              tickLine={{ stroke: '#e4e4e7' }}
            />
            <YAxis
              type="number"
              dataKey="gas"
              name="gas"
              domain={[1.2, 3.6]}
              ticks={[1.5, 2.0, 2.5, 3.0, 3.5]}
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickFormatter={(val) => `$${val.toFixed(1)}`}
              label={{ value: 'Gas Price', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fontWeight: 600, fill: '#3f3f46' }}
              axisLine={{ stroke: '#e4e4e7' }}
              tickLine={{ stroke: '#e4e4e7' }}
            />
            <ZAxis type="number" range={[40, 40]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={null} />
            
            <Scatter
              name="Driving Data"
              data={data}
              fill="#3b82f6"
              line={{ stroke: '#3b82f6', strokeWidth: 3 }}
              onMouseEnter={onScatterMouseEnter}
              onClick={(_: unknown, index: number) => setActiveIndex(index)}
              isAnimationActive={true}
              animationDuration={1500}
            >
              {data.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex ? "#1d4ed8" : index === 0 ? "#10b981" : index === data.length - 1 ? "#ef4444" : "#3b82f6"}
                  stroke={index === activeIndex ? "#fff" : "none"}
                  strokeWidth={2}
                  r={index === activeIndex ? 6 : (index === 0 || index === data.length - 1) ? 5 : 3}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Start/End legend */}
        <div className="absolute top-3 right-4 flex gap-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-zinc-100">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">1956</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">2010</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <p className="text-xs text-zinc-400 italic leading-relaxed">
          Notice the "loops" in the trajectory. When gas prices rose sharply in the 1970s and 2000s, 
          the steady increase in miles driven slowed or even reversed, showing how economic factors 
          influence driving behavior over decades.
        </p>
      </div>
    </div>
  );
}