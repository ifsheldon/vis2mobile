"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { budgetPlans } from "@/data/budgetData";

const formatBillions = (value: number) => {
  const formatted = value.toLocaleString("en-US");
  return `$${formatted}B`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function Visualization() {
  const [active, setActive] = useState<{
    planId: string;
    category: string;
  } | null>(null);

  const maxValue = useMemo(() => {
    const values = budgetPlans.flatMap((plan) =>
      plan.items.map((item) => item.value),
    );
    return Math.max(1, ...values);
  }, []);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[radial-gradient(circle_at_top,_#fff3e6,_#ffffff_40%,_#eaf3ff_100%)] text-slate-900"
      style={{
        fontFamily: '"IBM Plex Sans","Avenir Next","Segoe UI",sans-serif',
      }}
    >
      <div className="px-5 pb-10 pt-12">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
            Relief spending
          </p>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-slate-900">
              Where the money goes
            </h1>
            <p className="text-sm text-slate-600">
              Amounts shown in billions of dollars. Tap a bar to focus on a
              category.
            </p>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {budgetPlans.map((plan) => (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className="rounded-3xl border border-white/60 bg-white/80 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur"
              style={{ "--accent": plan.color } as CSSProperties}
            >
              <div className="sticky top-2 z-10 rounded-t-3xl border-b border-slate-200/70 bg-white/85 px-4 pb-4 pt-4 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p
                      id={`plan-${plan.id}`}
                      className="text-base font-semibold text-slate-900"
                    >
                      {plan.name}
                    </p>
                    <p className="text-xs text-slate-500">Total package size</p>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {plan.total}
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-4 pb-6 pt-4">
                {plan.items.map((item) => {
                  const percent = (item.value / maxValue) * 100;
                  const labelLeft =
                    item.value === 0 ? 6 : clamp(percent, 12, 92);
                  const isActive =
                    active?.planId === plan.id &&
                    active.category === item.category;

                  return (
                    <div key={`${plan.id}-${item.category}`}>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.category}
                        </p>
                        <span className="text-xs text-slate-500">
                          {formatBillions(item.value)}
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-pressed={isActive}
                        aria-label={`${plan.name} ${item.category}: ${formatBillions(item.value)}`}
                        onClick={() =>
                          setActive((current) =>
                            current?.planId === plan.id &&
                            current.category === item.category
                              ? null
                              : {
                                  planId: plan.id,
                                  category: item.category,
                                },
                          )
                        }
                        className="mt-2 w-full text-left"
                      >
                        <div className="relative h-7">
                          <div className="absolute inset-0 rounded-full bg-slate-100/90" />
                          <div
                            className="absolute left-0 top-0 h-7 rounded-full bg-[var(--accent)] transition-all"
                            style={{
                              width: `${percent}%`,
                              minWidth: item.value === 0 ? "0px" : "10px",
                            }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow"
                            style={{ left: `${labelLeft}%` }}
                          >
                            {formatBillions(item.value)}
                          </div>
                        </div>
                      </button>

                      {isActive && (
                        <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {item.category} accounts for{" "}
                          <span className="font-semibold text-slate-800">
                            {formatBillions(item.value)}
                          </span>{" "}
                          in the {plan.name.toLowerCase()}.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
