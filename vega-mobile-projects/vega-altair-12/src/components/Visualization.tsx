import { Star } from "lucide-react";
import { useMemo, useState } from "react";

type MovieDatum = {
  title: string;
  rating: number;
};

const TOP_MOVIES: MovieDatum[] = [
  { title: "The Godfather", rating: 9.2 },
  { title: "The Shawshank Redemption", rating: 9.2 },
  { title: "Inception", rating: 9.1 },
  { title: "The Godfather: Part II", rating: 9.0 },
  { title: "12 Angry Men", rating: 8.9 },
  { title: "One Flew Over the Cuckoo's Nest", rating: 8.9 },
  { title: "Pulp Fiction", rating: 8.9 },
  { title: "Schindler's List", rating: 8.9 },
  { title: "The Dark Knight", rating: 8.9 },
  { title: "Toy Story 3", rating: 8.9 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const barColor = (rating: number) => {
  const hue = 250 - (rating - 8.5) * 38;
  const lightness = 58 - (rating - 8.5) * 8;
  return `linear-gradient(90deg, hsl(${clamp(hue, 210, 250)} 78% ${clamp(
    lightness + 10,
    40,
    70,
  )}%), hsl(${clamp(hue - 16, 190, 230)} 86% ${clamp(lightness, 32, 60)}%))`;
};

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState(0);

  const maxRating = useMemo(
    () => Math.max(...TOP_MOVIES.map((movie) => movie.rating)),
    [],
  );

  const activeMovie = TOP_MOVIES[activeIndex] ?? TOP_MOVIES[0];

  return (
    <section className="relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 px-4 py-6 text-slate-900">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-200/70 via-blue-200/40 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 rounded-full bg-gradient-to-tr from-indigo-200/60 via-white/40 to-transparent blur-3xl" />

      <div className="relative w-full max-w-sm space-y-5 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur">
        <header className="space-y-2">
          <p
            className="text-xs uppercase tracking-[0.28em] text-slate-500"
            style={{
              fontFamily: '"Space Grotesk", "Helvetica", sans-serif',
            }}
          >
            IMDB Top 10
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-semibold text-slate-900"
                style={{
                  fontFamily: '"DM Serif Display", "Times New Roman", serif',
                }}
              >
                Movie Ratings
              </h1>
              <p className="text-sm text-slate-500">
                Tap a bar to focus details.
              </p>
            </div>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              10/10
            </div>
          </div>
        </header>

        <div className="space-y-3">
          {TOP_MOVIES.map((movie, index) => {
            const isActive = index === activeIndex;
            const width = `${(movie.rating / maxRating) * 100}%`;

            return (
              <button
                type="button"
                key={`${movie.title}-${movie.rating}`}
                onClick={() => setActiveIndex(index)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-indigo-200/80 bg-indigo-50/70 shadow-[0_10px_26px_rgba(99,102,241,0.18)]"
                    : "border-transparent bg-white/60 shadow-[0_12px_30px_rgba(148,163,184,0.18)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Star className="h-3 w-3 text-amber-500" />
                        {movie.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="relative h-9 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width,
                          background: barColor(movie.rating),
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                        {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
            Focused title
            <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white">
              {activeIndex + 1}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p
              className="text-base font-semibold text-slate-900"
              style={{
                fontFamily: '"DM Serif Display", "Times New Roman", serif',
              }}
            >
              {activeMovie.title}
            </p>
            <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
              <Star className="h-4 w-4 text-amber-300" />
              {activeMovie.rating.toFixed(1)}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Bars show IMDB rating on a 10-point scale. Higher is better.
          </p>
        </div>
      </div>
    </section>
  );
}
