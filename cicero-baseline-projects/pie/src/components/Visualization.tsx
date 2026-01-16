'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fruitSalesData } from '@/lib/data';
import { useMemo, useState } from 'react';

export function Visualization() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const total = useMemo(() => fruitSalesData.reduce((acc, curr) => acc + curr.value, 0), []);

  const dataWithPercentage = useMemo(() => {
    return fruitSalesData.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }));
  }, [total]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const activeItem = activeIndex !== undefined ? dataWithPercentage[activeIndex] : null;

  return (
    <div className="w-full h-full flex flex-col bg-white pt-12 px-4 pb-4 select-none">
      <h2 className="text-2xl font-bold text-center mb-2 text-zinc-900">Fruit Sales</h2>
      
      <div className="h-[320px] w-full relative shrink-0 flex justify-center">
          <PieChart width={343} height={320}>
            <Pie
              data={dataWithPercentage}
              cx={171}
              cy={160}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={onPieEnter}
              isAnimationActive={false}
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    stroke={activeIndex === index ? '#000' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{ outline: 'none', transition: 'all 0.3s ease' }}
                    className="cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <div className="text-4xl font-bold text-zinc-900">
             {activeItem ? activeItem.value : total}
           </div>
           <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide mt-1">
             {activeItem ? activeItem.name : 'Total Sales'}
           </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        {dataWithPercentage.map((item, index) => (
          <div 
            key={item.name}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              activeIndex === index 
                ? 'bg-zinc-50 border-zinc-400 shadow-sm scale-[1.02]' 
                : 'bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200'
            }`}
            onClick={() => setActiveIndex(index === activeIndex ? undefined : index)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="font-semibold text-zinc-800 text-lg">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-medium">{item.percentage}%</span>
                <span className="font-bold text-zinc-900 text-lg min-w-[3ch] text-right">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}