"use client";

import moviesData from "@/lib/movies.json";

interface Movie {
	title: string;
	rating: number;
	average_rating: number;
}

export function Visualization() {
	const { average_rating, movies } = moviesData as {
		average_rating: number;
		movies: Movie[];
	};

	// Sort movies by rating descending for better mobile readability/narrative
	const sortedMovies = [...movies].sort((a, b) => b.rating - a.rating);

	// Calculate percentage for bar width (0-10 scale)
	const getWidth = (rating: number) => `${(rating / 10) * 100}%`;
	const getAvgPos = () => `${(average_rating / 10) * 100}%`;

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden font-sans">
			{/* Header */}
			<div className="pt-12 pb-6 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-950 flex-shrink-0">
				<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
					Exceptional Movies
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
					Rated 2.5+ points above the global average.
				</p>

				{/* KPI Card */}
				<div className="mt-4 flex items-center space-x-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
					<div className="flex flex-col">
						<span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
							Global Average
						</span>
						<span className="text-xl font-bold text-rose-500">
							{average_rating.toFixed(2)}
						</span>
					</div>
					<div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
					<div className="flex flex-col">
						<span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
							Movies Shown
						</span>
						<span className="text-xl font-bold text-blue-600 dark:text-blue-400">
							{movies.length}
						</span>
					</div>
				</div>
			</div>

			{/* List Container - Scrollable */}
			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 pb-12">
				{sortedMovies.map((movie) => (
					<div key={movie.title} className="relative group">
						{/* Title above the bar */}
						<div className="flex justify-between items-end mb-2">
							<span className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 flex-1 mr-2">
								{movie.title}
							</span>
							<span className="text-[14px] font-black text-blue-600 dark:text-blue-400">
								{movie.rating.toFixed(1)}
							</span>
						</div>

						{/* Bar Container */}
						<div className="relative h-6 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
							{/* Global Average Reference Line (Background) */}
							<div 
								className="absolute top-0 bottom-0 w-0.5 bg-rose-500/30 z-0"
								style={{ left: getAvgPos() }}
							/>
							
							{/* Actual Rating Bar */}
							<div 
								className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md relative z-10 transition-all duration-1000 ease-out"
								style={{ width: getWidth(movie.rating) }}
							/>
						</div>
						
						{/* Reference Label (optional, only show for first item or if needed) */}
						<div 
							className="absolute top-[34px] text-[9px] font-bold text-rose-500/60 uppercase tracking-tighter"
							style={{ left: `calc(${getAvgPos()} + 4px)` }}
						>
							Avg
						</div>
					</div>
				))}
			</div>
		</div>
	);
}