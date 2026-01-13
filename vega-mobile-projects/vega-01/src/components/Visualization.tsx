"use client";

import React from "react";
import { FilterChart } from "@/components/FilterChart";
import { useFlightData, DOMAINS, type StepState } from "@/hooks/use-flight-data";
import { Loader2, Plane, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Visualization() {
  const { loading, filters, setFilters, steps, setSteps, chartData } =
    useFlightData();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-blue-500">
        <Loader2 className="h-10 w-10 animate-spin" />
        <span className="ml-2 font-mono text-sm">Loading 200k Flights...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-10 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/20">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Flight Explorer
            </h1>
          </div>

          <SettingsDialog steps={steps} setSteps={setSteps} />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
        {/* Intro / Stats Summary (Optional Enhancement) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400 uppercase tracking-widest">
              Dataset
            </div>
            <div className="text-lg font-bold text-slate-200">231,083</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400 uppercase tracking-widest">
              Active
            </div>
            {/* We could calculate active count here if we wanted, sum of filtered bins */}
            <div className="text-lg font-bold text-blue-400">
              {chartData.delay
                .reduce((acc, curr) => acc + curr.filtered, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>

        {/* Charts */}
        <FilterChart
          title="Arrival Delay"
          unit="min"
          data={chartData.delay}
          domain={DOMAINS.delay}
          step={steps.delay}
          filterRange={filters.delay}
          onFilterChange={(range) =>
            setFilters((prev) => ({ ...prev, delay: range }))
          }
          color="#3b82f6" // Blue
        />

        <FilterChart
          title="Departure Time"
          unit="h"
          data={chartData.time}
          domain={DOMAINS.time}
          step={steps.time}
          filterRange={filters.time}
          onFilterChange={(range) =>
            setFilters((prev) => ({ ...prev, time: range }))
          }
          color="#10b981" // Emerald
        />

        <FilterChart
          title="Distance"
          unit="mi"
          data={chartData.distance}
          domain={DOMAINS.distance}
          step={steps.distance}
          filterRange={filters.distance}
          onFilterChange={(range) =>
            setFilters((prev) => ({ ...prev, distance: range }))
          }
          color="#f59e0b" // Amber
        />
      </main>
    </div>
  );
}

function SettingsDialog({ steps, setSteps }: { steps: StepState; setSteps: React.Dispatch<React.SetStateAction<StepState>> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
          <Settings2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[90%] rounded-2xl bg-slate-900 border-slate-700 text-slate-200">
        <DialogHeader>
          <DialogTitle>View Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label htmlFor="delay-step" className="text-sm font-medium text-slate-400">
              Delay Step Size ({steps.delay})
            </label>
            <SimpleSlider
              id="delay-step"
              min={1}
              max={50}
              step={1}
              value={[steps.delay]}
              onValueChange={([val]) =>
                setSteps((s) => ({ ...s, delay: val }))
              }
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="time-step" className="text-sm font-medium text-slate-400">
              Time Step Size ({steps.time})
            </label>
            <SimpleSlider
              id="time-step"
              min={0.1}
              max={5}
              step={0.1}
              value={[steps.time]}
              onValueChange={([val]) =>
                setSteps((s) => ({ ...s, time: val }))
              }
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="dist-step" className="text-sm font-medium text-slate-400">
              Distance Step Size ({steps.distance})
            </label>
            <SimpleSlider
              id="dist-step"
              min={10}
              max={500}
              step={10}
              value={[steps.distance]}
              onValueChange={([val]) =>
                setSteps((s) => ({ ...s, distance: val }))
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-using the slider logic but simplifying styles for the settings panel
import * as SliderPrimitive from "@radix-ui/react-slider";
const SimpleSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-800">
      <SliderPrimitive.Range className="absolute h-full bg-slate-400" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-slate-600 bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
SimpleSlider.displayName = "SimpleSlider";
