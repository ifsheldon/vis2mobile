"use client";

import movieData from "@/lib/movie_data.json";

export function Visualization() {
  // Sort data just in case, though it should be sorted already
  const sortedData = [...movieData].sort(
    (a, b) => (b["IMDB Rating"] || 0) - (a["IMDB Rating"] || 0),
  );

  // Find min and max for color scaling (though they are very close)
  const ratings = sortedData.map((d) => d["IMDB Rating"] || 0);
  const maxRating = Math.max(...ratings);
  const minRating = Math.min(...ratings);

  // Helper to get color based on rating
  // Using a gradient from indigo-400 to indigo-800
  const getColor = (rating: number) => {
    if (maxRating === minRating) return "bg-indigo-600";
    const ratio = (rating - minRating) / (maxRating - minRating);
    // Simulating a color scale
    if (ratio > 0.8) return "bg-indigo-800";
    if (ratio > 0.6) return "bg-indigo-700";
    if (ratio > 0.4) return "bg-indigo-600";
    if (ratio > 0.2) return "bg-indigo-500";
    return "bg-indigo-400";
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div className="p-6 pt-12">
        <header className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Movies by IMDB Rating</h2>
          <p className="text-xs text-gray-500 mt-1">Source: vega-datasets (Movies.json)</p>
        </header>

        <div className="space-y-6">
          {sortedData.map((movie, index) => (
            <div key={movie.Title} className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-gray-800 truncate pr-2 flex-1">
                  {index + 1}. {movie.Title}
                </span>
                <span className="text-sm font-bold text-indigo-700 shrink-0">
                  {movie['IMDB Rating']?.toFixed(1)}
                </span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getColor(movie['IMDB Rating'] || 0)}`}
                  style={{ 
                    width: `${((movie['IMDB Rating'] || 0) / 10) * 100}%`,
                    opacity: 0.9
                  }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>0</span>
                <span>5.0</span>
                <span>10.0</span>
              </div>
            </div>
          ))}
        </div>
        
        <footer className="mt-8 pt-4 border-t border-gray-100 pb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-indigo-400 rounded-sm"></div>
              <span className="text-[10px] text-gray-500">Lower Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-indigo-800 rounded-sm"></div>
              <span className="text-[10px] text-gray-500">Higher Rating</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
