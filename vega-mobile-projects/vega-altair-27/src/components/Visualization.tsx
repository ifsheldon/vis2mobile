"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import data from '../lib/data.json';

const categories = [
  { id: 'A', color: '#4c78a8', label: 'Category A' },
  { id: 'B', color: '#f58518', label: 'Category B' },
  { id: 'C', color: '#e45756', label: 'Category C' },
];

export function Visualization() {
  const [activeCategories, setActiveCategories] = useState(['A', 'B', 'C']);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleCategory = (id: string) => {
    setActiveCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const activeData = useMemo(() => {
    if (activeIndex === null) return data[0];
    return data[activeIndex] || data[0];
  }, [activeIndex]);

  const handleMouseMove = (e: any) => {
    if (e && e.activeTooltipIndex !== undefined) {
      setActiveIndex(e.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-zinc-950 p-5 pt-14 font-sans overflow-hidden">
      {/* Header Section */}
      <div className="mb-5 space-y-0.5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Metric Analysis
        </h1>
        <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          Daily performance tracking
        </p>
      </div>

      {/* Hero Display Card (Externalized Tooltip) */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-white dark:border-zinc-800 mb-6 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              Point index
            </span>
            <div className="text-4xl font-black text-slate-900 dark:text-slate-50 tabular-nums leading-none">
              {activeData.x}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => {
            const isActive = activeCategories.includes(cat.id);
            const value = activeData[cat.id as keyof typeof activeData] as number;
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex flex-col items-center py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-50 dark:bg-zinc-800/80 shadow-inner'
                    : 'bg-transparent opacity-20 grayscale'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full mb-2 shadow-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 mb-1">
                  {cat.id}
                </span>
                <div className="text-sm font-black text-slate-900 dark:text-slate-50 tabular-nums">
                  {typeof value === 'number' ? value.toFixed(1) : '--'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 w-full min-h-[250px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
          >
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="8 8" 
              stroke="#e2e8f0" 
              className="dark:stroke-zinc-800"
            />
            <XAxis
              dataKey="x"
              axisLine={false}
              tickLine={false}
              ticks={[0, 25, 50, 75, 99]}
              tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
              dy={15}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
            />
            <Tooltip
              content={<></>}
              cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            {activeCategories.map(catId => (
              <Line
                key={catId}
                type="monotone"
                dataKey={catId}
                stroke={categories.find(c => c.id === catId)?.color}
                strokeWidth={4}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  stroke: '#fff', 
                  strokeWidth: 3,
                  fill: categories.find(c => c.id === catId)?.color 
                }}
                animationDuration={800}
              />
            ))}
            {activeIndex !== null && (
               <ReferenceLine x={activeIndex} stroke="#94a3b8" strokeDasharray="4 4" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 flex flex-col items-center gap-4 pb-4">
        <div className="w-full max-w-[120px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-slate-400 dark:bg-zinc-600 transition-all duration-500 rounded-full" 
            style={{ width: activeIndex !== null ? `${(activeIndex/99)*100}%` : '10%' }}
          />
        </div>
        <p className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-[0.4em] animate-pulse">
          {activeIndex !== null ? 'Inspecting Data' : 'Slide to Explore'}
        </p>
      </div>
    </div>
  );
}