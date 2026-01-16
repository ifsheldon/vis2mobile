import { data, plans, type DataPoint, type PlanType } from "@/lib/data";
import { useMemo } from "react";

// Helper to format currency for the header
const formatTotal = (value: number) => {
  return `$${(value / 1000).toFixed(1)} trillion`;
};

// Helper for bar labels
const formatAmount = (value: number) => {
    return `$${value.toLocaleString()} billion`; // "billion" might be too long, use "B" for mobile? 
    // The original uses "$200 billion". On mobile "B" is safer.
    // Let's use "$200B"
};

export function Visualization() {
  const sectors = useMemo(() => {
    // Group data by sector
    const groups: Record<string, DataPoint[]> = {};
    const order: string[] = [];
    data.forEach((d) => {
      if (!groups[d.sector]) {
        groups[d.sector] = [];
        order.push(d.sector);
      }
      groups[d.sector].push(d);
    });
    return order.map(sector => ({ name: sector, items: groups[sector] }));
  }, []);

  const totals = useMemo(() => {
    const t: Record<PlanType, number> = {
      "Republican plan": 0,
      "Already passed": 0,
      "Democratic plan": 0,
    };
    data.forEach((d) => {
      t[d.plan] += d.amount;
    });
    return t;
  }, []);

  // Max value for scaling
  const maxValue = 1200;

  return (
    <div className="w-full h-full bg-white flex flex-col font-sans text-zinc-900 overflow-hidden">
      {/* Header with Totals */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0 z-10 shadow-sm">
        {/* Legend / Totals */}
        <div className="grid grid-cols-3 gap-2 text-center">
            {plans.map(plan => (
                <div key={plan.name} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5" title={plan.name}>
                        {plan.shortName}
                    </span>
                    <span className="text-sm font-bold leading-none" style={{ color: plan.borderColor }}>
                        {`$${(totals[plan.name] / 1000).toFixed(1)}T`}
                    </span>
                </div>
            ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 pb-8">
        {sectors.map((sector) => (
            <div key={sector.name} className="space-y-2">
                <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-1 pt-1">
                    {sector.name}
                </h2>
                <div className="space-y-1.5">
                    {plans.map((planDef) => {
                        const item = sector.items.find(i => i.plan === planDef.name);
                        const amount = item?.amount || 0;
                        const widthPct = (amount / maxValue) * 100;

                        return (
                            <div key={planDef.name} className="flex items-center text-xs h-5">
                                <div className="w-10 shrink-0 font-medium text-gray-400 text-right pr-2 text-[10px] uppercase">
                                    {planDef.shortName}
                                </div>
                                <div className="flex-1 h-full bg-gray-100/50 rounded-sm relative flex items-center">
                                    {amount > 0 && (
                                        <div
                                            className="h-3.5 rounded-sm transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2"
                                            style={{
                                                width: `${widthPct}%`,
                                                backgroundColor: planDef.color,
                                                border: `1px solid ${planDef.borderColor}`,
                                            }}
                                        />
                                    )}
                                    
                                    {/* Value - Positioned intelligently */}
                                    <div 
                                        className="relative z-10 pl-1.5 text-[10px] font-medium transition-all duration-500"
                                        style={{ 
                                           left: amount > 0 ? `${widthPct}%` : '0px',
                                           color: '#555'
                                        }}
                                    >
                                        {amount === 0 ? <span className="text-gray-300">0</span> : `$${amount}B`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
        {/* Footer Note */}
        <div className="text-[10px] text-gray-400 text-center pt-4">
            Amounts in billions unless otherwise noted.
        </div>
      </div>
    </div>
  );
}