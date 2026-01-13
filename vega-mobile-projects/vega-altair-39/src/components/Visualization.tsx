"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Binary } from 'lucide-react';

const GENRE_COLORS: Record<string, string> = {
  'Action': '#3b82f6',
  'Adventure': '#10b981',
  'Black Comedy': '#f43f5e',
  'Comedy': '#fbbf24',
  'Concert/Performance': '#8b5cf6',
  'Documentary': '#06b6d4',
  'Drama': '#f97316',
  'Horror': '#7c3aed',
  'Musical': '#ec4899',
  'Romantic Comedy': '#f87171',
  'Thriller/Suspense': '#6366f1',
  'Western': '#84cc16'
};

interface Movie {
  Title: string;
  "Major Genre": string;
  "IMDB Rating": number;
}

interface ProcessedData {
  id: string;
  title: string;
  genre: string;
  rating: number;
  yNormal: number;
  yUniform: number;
  color: string;
}

function boxMuller() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function Visualization() {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [jitterType, setJitterType] = useState<'normal' | 'uniform'>('normal');
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<ProcessedData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json');
        const json: Movie[] = await response.json();
        
        const validData = json.filter(d => d["Major Genre"] && d["IMDB Rating"] != null);
        const uniqueGenres = Array.from(new Set(validData.map(d => d["Major Genre"]))).sort();
        setGenres(uniqueGenres);

        const processed = validData.map((d, idx) => {
          const genreIndex = uniqueGenres.indexOf(d["Major Genre"]);
          
          // Normal Jitter: Box-Muller, clamped to [-0.4, 0.4]
          let normalJitter = boxMuller() * 0.15;
          normalJitter = Math.max(-0.4, Math.min(0.4, normalJitter));
          
          // Uniform Jitter: Random clamped to [-0.4, 0.4]
          const uniformJitter = (Math.random() - 0.5) * 0.8;

          return {
            id: `${d.Title}-${idx}`,
            title: d.Title,
            genre: d["Major Genre"],
            rating: d["IMDB Rating"],
            yNormal: genreIndex + 0.5 + normalJitter,
            yUniform: genreIndex + 0.5 + uniformJitter,
            color: GENRE_COLORS[d["Major Genre"]] || '#94a3b8'
          };
        });

        setData(processed);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      yPos: jitterType === 'normal' ? d.yNormal : d.yUniform
    }));
  }, [data, jitterType]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Loading Movies...</p>
        </div>
      </div>
    );
  }

  const ROW_HEIGHT = 80;
  const TOTAL_HEIGHT = genres.length * ROW_HEIGHT + 60;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* Header */}
      <div className="pt-10 pb-4 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">IMDB Ratings by Genre</h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Distribution Visualization</p>
        
        {/* Toggle Controls */}
        <div className="mt-4 flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl relative">
          <div 
            className="absolute h-[calc(100%-8px)] top-1 rounded-lg bg-white dark:bg-zinc-700 shadow-sm transition-all duration-300 ease-out"
            style={{
              width: 'calc(50% - 4px)',
              left: jitterType === 'normal' ? '4px' : 'calc(50%)'
            }}
          />
          <button
            type="button"
            onClick={() => setJitterType('normal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${
              jitterType === 'normal' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'
            }`}
          >
            <Binary size={16} />
            Normal
          </button>
          <button
            type="button"
            onClick={() => setJitterType('uniform')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${
              jitterType === 'uniform' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'
            }`}
          >
            <LayoutGrid size={16} />
            Uniform
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable Chart */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div style={{ height: TOTAL_HEIGHT, width: '100%' }} className="relative">
          {/* Genre Labels (Sticky/Floating) */}
          <div className="absolute inset-0 pointer-events-none">
            {genres.map((genre, i) => (
              <div 
                key={genre} 
                className="absolute w-full flex items-start px-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/50"
                style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
              >
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter" style={{ color: `${GENRE_COLORS[genre]}88` }}>{genre}</span>
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 60, left: 10 }}
              onClick={() => setSelectedMovie(null)}
            >
              <XAxis 
                type="number" 
                dataKey="rating" 
                name="Rating" 
                domain={[0, 10]} 
                ticks={[0, 2, 4, 6, 8, 10]}
                orientation="bottom"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                type="number" 
                dataKey="yPos" 
                name="Genre" 
                domain={[0, genres.length]} 
                reversed 
                hide 
              />
              <ZAxis type="number" range={[16, 16]} />
              
              {genres.map((genre, i) => (
                <ReferenceArea
                  key={genre}
                  y1={i}
                  y2={i + 1}
                  fill={i % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.03)'}
                  stroke="none"
                />
              ))}

              <Scatter 
                name="Movies" 
                data={chartData} 
                onClick={(e) => setSelectedMovie(e)}
                animationDuration={500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={entry.id} 
                    fill={entry.color} 
                    fillOpacity={0.4}
                    stroke={entry.color}
                    strokeOpacity={0.8}
                    strokeWidth={1}
                    className="cursor-pointer"
                  />
                ))}
              </Scatter>

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
                trigger="click"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend / Info Footer */}
      <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Interactive Dataset</span>
          </div>
          <div className="flex gap-1 text-[10px] text-zinc-400">
             <span>0</span>
             <div className="w-20 h-1 mt-1 bg-gradient-to-r from-zinc-200 to-zinc-400 rounded-full"></div>
             <span>10 Rating</span>
          </div>
        </div>
      </div>

      {/* Floating Detail Card */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-2xl border border-zinc-200 dark:border-zinc-700 z-50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">
                  {selectedMovie.genre}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                  {selectedMovie.title}
                </h3>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-lg text-center">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">{selectedMovie.rating}</div>
                <div className="text-[8px] text-zinc-500 uppercase">Rating</div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setSelectedMovie(null)}
              className="mt-3 w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ProcessedData }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl pointer-events-none">
        <p className="text-[10px] font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">{data.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }}></div>
          <p className="text-[8px] text-zinc-500">{data.genre} • {data.rating}★</p>
        </div>
      </div>
    );
  }
  return null;
}
