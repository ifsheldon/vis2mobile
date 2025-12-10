"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

// Data extracted from budgets-desktop.html
// Aggregated into a format suitable for a grouped bar chart (one object per sector)
const data = [
    {
        sector: "Small-business aid",
        "Republican plan": 200,
        "Already passed": 1010,
        "Democratic plan": 0,
    },
    {
        sector: "Other measures",
        "Republican plan": 81,
        "Already passed": 627,
        "Democratic plan": 302,
    },
    {
        sector: "Business tax breaks",
        "Republican plan": 203,
        "Already passed": 346,
        "Democratic plan": 36,
    },
    {
        sector: "Stimulus checks",
        "Republican plan": 300,
        "Already passed": 293,
        "Democratic plan": 436,
    },
    {
        sector: "Health care",
        "Republican plan": 111,
        "Already passed": 277,
        "Democratic plan": 382,
    },
    {
        sector: "Unemployment benefits",
        "Republican plan": 110,
        "Already passed": 274,
        "Democratic plan": 437,
    },
    {
        sector: "State and local aid",
        "Republican plan": 105,
        "Already passed": 256,
        "Democratic plan": 1118,
    },
    {
        sector: "Safety net and other tax cuts",
        "Republican plan": 18,
        "Already passed": 83,
        "Democratic plan": 736,
    },
];

const COLORS = {
    "Republican plan": "pink", // lightcoral stroke in original, flattened for simplicity or use custom shape
    "Already passed": "lightgray", // gray stroke
    "Democratic plan": "skyblue", // dodgerblue stroke
};

const STROKE_COLORS = {
    "Republican plan": "lightcoral",
    "Already passed": "gray",
    "Democratic plan": "dodgerblue",
};

const PLANS = ["Republican plan", "Already passed", "Democratic plan"];
// Totals from the original visualization
const TOTALS = {
    "Republican plan": "$1.1 trillion",
    "Already passed": "$3.2 trillion",
    "Democratic plan": "$3.4 trillion",
};

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600">{entry.name}:</span>
                        <span className="font-mono font-medium">
                            ${entry.value.toLocaleString()} billion
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function BudgetsMobileChart() {
    return (
        <div className="w-full h-full flex flex-col bg-slate-50 p-4 font-sans text-slate-900">
            {/* Title Block */}
            <h2 className="text-2xl font-bold mb-1 text-slate-900">Budgets</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Comparison of proposed and passed stimulus plans across different sectors.
            </p>

            {/* Legacy Legend / Summary Block */}
            <div className="flex flex-wrap gap-2 mb-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan}
                        className="flex flex-col bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex-1 min-w-[100px]"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[plan as keyof typeof COLORS] }}
                            />
                            <span className="text-xs font-medium text-slate-500">
                                {plan}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                            {TOTALS[plan as keyof typeof TOTALS]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full min-h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        barGap={2}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="sector"
                            type="category"
                            width={125}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            interval={0}
                            mirror={false} // Keep labels outside to avoid overlap content
                            tickLine={false}
                            axisLine={false}
                            className="font-medium"
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.05)" }}
                            content={<CustomTooltip />}
                        />
                        {PLANS.map((plan) => (
                            <Bar
                                key={plan}
                                dataKey={plan}
                                fill={COLORS[plan as keyof typeof COLORS]}
                                stroke={STROKE_COLORS[plan as keyof typeof STROKE_COLORS]}
                                radius={[0, 4, 4, 0]}
                                barSize={18} // Fixed bar size for consistent look
                            >
                                {/*
                    Showing values directly on bars might be too cluttered for small bars.
                    We rely on Tooltip for exact values, or we can conditionally render if needed.
                    Let's try creating a custom label that only shows if there's enough space or for max value.
                    For now, clean look is preferred.
                   */}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs text-slate-400 mt-4 text-center">
                Scroll / Tap for details
            </div>
        </div>
    );
}
