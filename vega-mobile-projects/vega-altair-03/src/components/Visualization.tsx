"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { TooltipProps } from 'recharts';
import data from "@/data.json";

const transformedData = data.map(item => ({
  ...item,
  total: item["Fossil Fuels"] + item["Nuclear Energy"] + item["Renewables"],
}));

type TransformedData = typeof transformedData;
type DataPoint = TransformedData[number];


const numberFormatter = (value: number) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
};

const CustomTooltip = (_: TooltipProps<number, string>) => {
  return null;
};

const colorMap = {
    "Renewables": "bg-emerald-400",
    "Fossil Fuels": "bg-slate-400",
    "Nuclear Energy": "bg-rose-400",
};

export function Visualization() {
  const [activeDataPoint, setActiveDataPoint] = useState<DataPoint>(
    transformedData[transformedData.length - 1]
  );

  const handleMouseMove = (state: { activePayload?: { payload: DataPoint }[] }) => {
    if (state.activePayload && state.activePayload.length > 0) {
      setActiveDataPoint(state.activePayload[0].payload);
    }
  };

  const energySources = [
    { name: "Renewables", value: activeDataPoint["Renewables"] },
    { name: "Fossil Fuels", value: activeDataPoint["Fossil Fuels"] },
    { name: "Nuclear Energy", value: activeDataPoint["Nuclear Energy"] },
  ];

  const ticks = [2001, 2005, 2010, 2015, 2017];


  return (
    <div className="w-full h-full bg-slate-50 font-sans p-4 flex flex-col">
        <header className="mb-4">
            <h1 className="text-lg font-bold text-slate-800">US Electricity Generation</h1>
            <p className="text-sm text-slate-600">Net generation by source, 2001-2017</p>
        </header>

        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm border border-slate-200/80">
            <div className="mb-4">
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{activeDataPoint.year}</p>
                <div className="flex justify-between mt-2 text-sm">
                    {energySources.map(source => (
                         <div key={source.name} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colorMap[source.name as keyof typeof colorMap]}`}></div>
                            <div>
                                <p className="font-medium text-slate-700">{source.name}</p>
                                <p className="font-mono text-slate-500 tabular-nums">{numberFormatter(source.value)}</p>
                            </div>
                         </div>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={transformedData}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setActiveDataPoint(transformedData[transformedData.length - 1])}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                        <XAxis 
                            dataKey="year" 
                            tick={{ fontSize: 12 }} 
                            tickMargin={10} 
                            ticks={ticks}
                            domain={['dataMin', 'dataMax']}
                            type="number"
                        />
                        <YAxis 
                            tickFormatter={numberFormatter} 
                            tick={{ fontSize: 12 }}
                            width={35}
                            domain={[0, 'dataMax']}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={false} />

                        {activeDataPoint && (
                            <ReferenceLine x={activeDataPoint.year} stroke="rgba(0, 0, 0, 0.5)" />
                        )}

                        <Area 
                            type="monotone" 
                            dataKey="Renewables" 
                            stackId="1" 
                            stroke="#34d399" 
                            fill="#a7f3d0" 
                            strokeWidth={2}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Fossil Fuels" 
                            stackId="1" 
                            stroke="#64748b" 
                            fill="#cbd5e1" 
                            strokeWidth={2}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Nuclear Energy" 
                            stackId="1" 
                            stroke="#fb7185" 
                            fill="#fecdd3" 
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        <footer className="mt-4 text-xs text-center text-slate-400">
            Source: U.S. Energy Information Administration
        </footer>
    </div>
  );
}
