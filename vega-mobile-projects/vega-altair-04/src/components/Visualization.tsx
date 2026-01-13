"use client";

import { motion } from "framer-motion";
import { Atom, Leaf, Zap } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import rawData from "@/lib/data.json";

interface ProcessedData {
  [year: string]: {
    year: string;
    "Fossil Fuels"?: number;
    "Nuclear Energy"?: number;
    "Renewables"?: number;
  };
}

interface ChartDataPoint {
  year: string;
  "Fossil Fuels"?: number;
  "Nuclear Energy"?: number;
  "Renewables"?: number;
}

const processedData = rawData.reduce<ProcessedData>((acc, item) => {
  const year = new Date(item.year).getFullYear().toString();
  if (!acc[year]) {
    acc[year] = { year };
  }
  if (item.source === 'Fossil Fuels') {
    acc[year]['Fossil Fuels'] = item.net_generation;
  } else if (item.source === 'Nuclear Energy') {
    acc[year]['Nuclear Energy'] = item.net_generation;
  } else if (item.source === 'Renewables') {
    acc[year]['Renewables'] = item.net_generation;
  }
  return acc;
}, {});

const chartData: ChartDataPoint[] = Object.values(processedData);

const sources = [
  { name: "Fossil Fuels", color: "bg-slate-500", icon: Zap },
  { name: "Nuclear Energy", color: "bg-amber-500", icon: Atom },
  { name: "Renewables", color: "bg-emerald-500", icon: Leaf },
];

export function Visualization() {
  const [activeYear, setActiveYear] = useState<ChartDataPoint>(chartData[chartData.length - 1]);

  return (
    <div className='w-full h-full bg-slate-900 text-white p-4 flex flex-col font-sans'>
      <header className='text-center mb-4'>
        <h1 className='text-xl font-bold'>Energy Source Share</h1>
        <p className='text-sm text-slate-400'>
          Net generation distribution (2001-2017)
        </p>
      </header>

      <div className='flex justify-center gap-4 mb-4'>
        {sources.map((source) => (
          <div key={source.name} className='flex items-center gap-2'>
            <div className={`w-3 h-3 rounded-full ${source.color}`} />
            <span className='text-xs'>{source.name}</span>
          </div>
        ))}
      </div>

      <div className='w-full flex-grow' style={{ aspectRatio: "1/1" }}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={chartData}
            stackOffset='expand'
            margin={{ top: 10, right: 0, left: -20, bottom: 20 }}
            onMouseMove={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                setActiveYear(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(255,255,255,0.1)'
            />
            <XAxis
              dataKey='year'
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(tick) => `'${tick.substring(2)}`}
              ticks={['2001', '2005', '2009', '2013', '2017']}
            />
            <YAxis
              tickFormatter={(tick) => `${Math.round(tick * 100)}%`}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              ticks={[0, 0.5, 1]}
            />
            <Tooltip />
            <Area
              type='monotone'
              dataKey='Fossil Fuels'
              stackId='1'
              stroke='#64748b'
              fill='#64748b'
            />
            <Area
              type='monotone'
              dataKey='Nuclear Energy'
              stackId='1'
              stroke='#f59e0b'
              fill='#f59e0b'
            />
            <Area
              type='monotone'
              dataKey='Renewables'
              stackId='1'
              stroke='#10b981'
              fill='#10b981'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4 p-4 rounded-lg bg-slate-800/50 backdrop-blur-md'>
        <motion.div
          key={activeYear.year}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className='text-lg font-bold text-center mb-2'>
            {activeYear.year}
          </p>
          <div className='flex justify-around text-center'>
            {sources.map((source) => {
              const total = Object.values(activeYear).reduce(
                (acc: number, value) => {
                  if (typeof value === "number") {
                    return acc + value;
                  }
                  return acc;
                },
                0,
              );
              const percentage =
                ((activeYear[source.name as keyof ChartDataPoint] as number) / total) * 100;
              return (
                <div key={source.name}>
                  <source.icon className='w-6 h-6 mx-auto mb-1' />
                  <p className='text-sm font-semibold'>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return null; // We use the main component's state to show data
  }
  return null;
};