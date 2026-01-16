"use client";

const fpsData = [
  { range: "> 120 FPS", value: 0, color: "bg-emerald-500" },
  { range: "80 - 120 FPS", value: 0, color: "bg-emerald-400" },
  { range: "60 - 80 FPS", value: 31.17, color: "bg-green-400" },
  { range: "30 - 60 FPS", value: 38.96, color: "bg-yellow-400" },
  { range: "20 - 30 FPS", value: 6.49, color: "bg-orange-400" },
  { range: "15 - 20 FPS", value: 2.9, color: "bg-orange-500" },
  { range: "12 - 15 FPS", value: 2.6, color: "bg-red-400" },
  { range: "< 12 FPS", value: 16.88, color: "bg-red-600" },
];

export function Visualization() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-center mb-8 text-zinc-800">
        Distribution of Frame Render Time
      </h2>

      <div className="space-y-4">
        {fpsData.map((item) => (
          <div key={item.range} className="space-y-1">
            <div className="flex justify-between items-end text-sm font-medium">
              <span className="text-zinc-600">{item.range}</span>
              <span className="text-zinc-900">{item.value}%</span>
            </div>
            <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Target
            </p>
            <p className="text-lg font-bold text-green-600">60+ FPS</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Current
            </p>
            <p className="text-lg font-bold text-zinc-800">
              {(31.17 + 38.96 + 6.49 + 2.9 + 2.6 + 16.88 + 0 + 0).toFixed(0)}%
              Total
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-400 italic">
          High frame rates (60+ FPS) provide a smoother experience.
        </p>
      </div>
    </div>
  );
}
