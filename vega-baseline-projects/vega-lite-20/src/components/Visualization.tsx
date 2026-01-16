"use client";

import { movieData } from "@/lib/data";

export function Visualization() {
  const maxRating = 10;

  const getBarColor = (rating: number) => {
    if (rating >= 6.5) return "bg-emerald-500";
    if (rating >= 6.0) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 pt-10 px-4 pb-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Average IMDB Rating
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Mean ratings by major movie genre
        </p>
      </header>

      <div className="space-y-5">
        <div className="flex justify-between text-[10px] font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1">
          <span>Genre</span>
          <div className="flex gap-12 pr-2">
            <span>Poor</span>
            <span>Neutral</span>
            <span>Great</span>
          </div>
        </div>

        <div className="space-y-4">
          {movieData.map((item) => (
            <div key={item.genre} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.genre}
                </span>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {item.mean_rating.toFixed(1)}
                </span>
              </div>
              <div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                {/* Reference markers */}
                <div className="absolute left-[0%] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="absolute left-[100%] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />

                {/* Rating bar */}
                <div
                  className={`absolute top-0 left-0 h-full rounded-full ${getBarColor(item.mean_rating)} transition-all duration-500`}
                  style={{ width: `${(item.mean_rating / maxRating) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4 text-[10px] text-zinc-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span>&lt; 6.0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>6.0 - 6.5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&gt; 6.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
