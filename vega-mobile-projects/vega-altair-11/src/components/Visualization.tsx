"use client";

import { useMemo, useState } from "react";

const rawTasks = [
  { task: "A", start: 1, end: 3 },
  { task: "B", start: 3, end: 8 },
  { task: "C", start: 8, end: 10 },
];

type Task = {
  task: string;
  start: number;
  end: number;
  duration: number;
};

const domainMin = 0;
const domainMax = 10;
const ticks = [0, 2, 4, 6, 8, 10];

export function Visualization() {
  const tasks = useMemo<Task[]>(() => {
    return rawTasks.map((item) => ({
      ...item,
      duration: item.end - item.start,
    }));
  }, []);

  const [activeTask, setActiveTask] = useState<Task | null>(tasks[0] ?? null);
  const span = domainMax - domainMin;
  const tickPositions = useMemo(
    () =>
      ticks.map((tick) => ({
        value: tick,
        left: ((tick - domainMin) / span) * 100,
      })),
    [span],
  );

  const handleSelect = (task: Task) => {
    setActiveTask((current) => (current?.task === task.task ? null : task));
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-slate-950 px-4 py-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <header className="mb-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Project Schedule
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-50 [font-family:'Avenir_Next',_'Avenir',_'Segoe_UI',_sans-serif]">
            Mobile Gantt Overview
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Tap a bar to reveal the exact start, end, and duration.
          </p>
        </header>

        <div
          className="mb-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
          aria-live="polite"
        >
          {activeTask ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Active Task
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-50">
                  Task {activeTask.task}
                </p>
              </div>
              <div className="text-right text-sm text-slate-200">
                <p>
                  {activeTask.start} -&gt; {activeTask.end}
                </p>
                <p className="text-xs text-slate-400">
                  Duration {activeTask.duration}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Tap a bar to pin its timing details here.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {tasks.map((task) => {
            const leftPercent = ((task.start - domainMin) / span) * 100;
            const widthPercent = (task.duration / span) * 100;
            const isActive = activeTask?.task === task.task;

            return (
              <div
                key={task.task}
                className="grid grid-cols-[3.25rem_1fr] items-center gap-3"
              >
                <div className="text-sm font-semibold text-slate-200">
                  {task.task}
                </div>
                <div className="relative h-11 overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {tickPositions.map((tick) => (
                      <line
                        key={`grid-${tick.value}`}
                        x1={tick.left}
                        x2={tick.left}
                        y1={0}
                        y2={100}
                        stroke="rgba(148,163,184,0.3)"
                        strokeDasharray="4 6"
                        strokeWidth={0.6}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>
                  <button
                    type="button"
                    onClick={() => handleSelect(task)}
                    className={`absolute top-1/2 h-8 -translate-y-1/2 rounded-full px-3 text-xs font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-pink-500"
                        : "bg-gradient-to-r from-indigo-500 to-fuchsia-600"
                    }`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    aria-pressed={isActive}
                    aria-label={`Task ${task.task} runs from ${task.start} to ${task.end}`}
                  >
                    <span className="truncate">{`T${task.task}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-[3.25rem_1fr] items-center gap-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Time
          </div>
          <div className="relative h-6">
            {tickPositions.map((tick) => {
              const alignClass =
                tick.value === domainMin
                  ? "translate-x-0"
                  : tick.value === domainMax
                    ? "-translate-x-full"
                    : "-translate-x-1/2";

              return (
                <div
                  key={`tick-${tick.value}`}
                  className="absolute top-0 flex flex-col items-center text-[0.7rem] text-slate-400"
                  style={{ left: `${tick.left}%` }}
                >
                  <span className={`font-medium ${alignClass}`}>
                    {tick.value}
                  </span>
                  <span className="mt-1 h-2 w-px bg-white/20" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
