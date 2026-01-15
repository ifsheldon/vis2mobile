"use client";

import { Calendar, Clock, MoreVertical, Search } from "lucide-react";
import { data } from "@/lib/data";

export function Visualization() {
  const minStart = Math.min(...data.map((d) => d.start));
  const maxEnd = Math.max(...data.map((d) => d.end));
  const totalDuration = maxEnd - minStart;

  // Chart boundaries for rendering
  const chartStart = 0;
  const chartEnd = 11;
  const range = chartEnd - chartStart;

  const getStatus = (task: string) => {
    if (task === "A")
      return { label: "Completed", color: "bg-green-100 text-green-700" };
    if (task === "B")
      return { label: "In Progress", color: "bg-blue-100 text-blue-700" };
    return { label: "Upcoming", color: "bg-gray-100 text-gray-700" };
  };

  const getBarColor = (task: string) => {
    if (task === "A") return "bg-green-500";
    if (task === "B") return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col font-sans">
      {/* App Bar */}
      <div className="pt-12 pb-6 px-6 bg-white border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-slate-900">Project Timeline</h1>
          <div className="flex gap-3 text-slate-400">
            <Search size={20} />
            <MoreVertical size={20} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar size={14} />
              <span>Duration</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {totalDuration} Days
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock size={14} />
              <span>Tasks</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {data.length} Total
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="relative">
          {/* Time Scale Header */}
          <div className="flex justify-between mb-4 px-1">
            {[0, 2, 4, 6, 8, 10].map((tick) => (
              <span
                key={tick}
                className="text-[10px] font-medium text-slate-400"
              >
                Day {tick}
              </span>
            ))}
          </div>

          {/* Grid Lines */}
          <div className="absolute top-6 bottom-0 left-0 right-0 flex justify-between pointer-events-none px-1">
            {[0, 2, 4, 6, 8, 10].map((tick) => (
              <div
                key={tick}
                className="h-full border-l border-slate-200 border-dashed"
              />
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-8 pt-2">
            {data.map((task) => {
              const left = ((task.start - chartStart) / range) * 100;
              const width = ((task.end - task.start) / range) * 100;
              const status = getStatus(task.task);

              return (
                <div
                  key={task.task}
                  className="flex flex-col gap-2 relative z-10"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-sm">
                      Task {task.task}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="h-10 w-full bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200/50">
                    <div
                      className={`absolute top-0 h-full ${getBarColor(task.task)} shadow-sm flex items-center justify-center transition-all duration-500`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    >
                      <span className="text-[10px] text-white font-bold whitespace-nowrap px-2">
                        {task.start} → {task.end}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend / Footer */}
      <div className="p-6 bg-white border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Timeline Overview
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-600">Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-600">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-600">Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
