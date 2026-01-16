"use client";

import { useEffect, useRef } from "react";
import vegaEmbed from "vega-embed";

export function Visualization() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const sortedIndustries = [
            "Retail & Wholesale",
            "Manufacturing",
            "Leisure & Hospitality",
            "Business Services",
            "Construction",
            "Edu & Health",
            "Government",
            "Others"
        ];

        const spec: any = {
            "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
            "description": "Unemployment across industries normalized to 100%.",
            "data": {
                "url": "https://vega.github.io/editor/data/unemployment-across-industries.json"
            },
            "transform": [
                {
                    "calculate": "datum.series == 'Wholesale and Retail Trade' ? 'Retail & Wholesale' : datum.series == 'Leisure and hospitality' ? 'Leisure & Hospitality' : datum.series == 'Business services' ? 'Business Services' : datum.series == 'Education and Health' ? 'Edu & Health' : datum.series == 'Government' ? 'Government' : datum.series == 'Manufacturing' ? 'Manufacturing' : datum.series == 'Construction' ? 'Construction' : 'Others'",
                    "as": "short_series"
                }
            ],
            "width": "container",
            "height": 300,
            "padding": { "top": 20, "right": 15, "bottom": 10, "left": 10 },
            "mark": {
                "type": "area",
                "line": { "color": "white", "width": 0.5 },
                "opacity": 0.9
            },
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "timeUnit": "yearmonth",
                    "axis": {
                        "title": null,
                        "grid": false,
                        "format": "%Y",
                        "labelAngle": 0,
                        "tickCount": 5,
                        "labelFontSize": 10,
                        "labelColor": "#71717a",
                        "offset": 5
                    }
                },
                "y": {
                    "aggregate": "sum",
                    "field": "count",
                    "type": "quantitative",
                    "stack": "normalize",
                    "axis": {
                        "title": "Share of Total Unemployment",
                        "format": ".0%",
                        "grid": true,
                        "gridColor": "#f4f4f5",
                        "labelFontSize": 10,
                        "labelColor": "#71717a",
                        "titleFontSize": 11,
                        "titleColor": "#52525b",
                        "titleAlign": "left",
                        "titleAnchor": "start",
                        "titleAngle": 0,
                        "titleX": -30,
                        "titleY": -15
                    }
                },
                "color": {
                    "field": "short_series",
                    "type": "nominal",
                    "scale": { 
                        "domain": sortedIndustries,
                        "scheme": "tableau10"
                    },
                    "legend": {
                        "orient": "bottom",
                        "columns": 2,
                        "title": null,
                        "labelFontSize": 11,
                        "labelColor": "#3f3f46",
                        "symbolType": "square",
                        "symbolSize": 100,
                        "offset": 30,
                        "rowPadding": 10,
                        "columnPadding": 10,
                        "labelLimit": 140
                    }
                },
                "tooltip": [
                    { "field": "date", "timeUnit": "yearmonth", "title": "Date" },
                    { "field": "short_series", "title": "Industry" },
                    { "field": "count", "title": "Count", "aggregate": "sum", "format": "," }
                ]
            },
            "config": {
                "view": { "stroke": "transparent" },
                "font": "Inter, system-ui, sans-serif"
            }
        };

        vegaEmbed(containerRef.current, spec, {
            actions: false,
            responsive: true,
        }).catch(console.error);
    }, []);

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 p-4 pt-10">
            <header className="mb-8 px-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Industry Trends
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Composition of US unemployment by industry, 2000–2010.
                </p>
            </header>
            
            <main className="flex-1 min-h-0">
                <div ref={containerRef} className="w-full h-full" />
            </main>
            
            <footer className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-[0.15em] font-semibold">
                    Source: Bureau of Labor Statistics
                </p>
            </footer>
        </div>
    );
}