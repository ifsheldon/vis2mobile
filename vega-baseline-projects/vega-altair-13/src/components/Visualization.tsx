"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PopulationData {
  year: number;
  age: number;
  sex: number;
  people: number;
}

export function Visualization() {
  const [data, setData] = useState<PopulationData[]>([]);
  const [year, setYear] = useState(2000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json",
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const yearData = data.filter((d) => d.year === year);
    const ageGroups = Array.from(new Set(yearData.map((d) => d.age))).sort(
      (a, b) => a - b,
    );

    return ageGroups.map((age) => {
      const male =
        yearData.find((d) => d.age === age && d.sex === 1)?.people || 0;
      const female =
        yearData.find((d) => d.age === age && d.sex === 2)?.people || 0;
      return {
        age,
        male,
        female: -female, // Negative for left side
        femaleAbs: female,
      };
    });
  }, [data, year]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500">
        Loading data...
      </div>
    );
  }

  const formatPopulation = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return `${(absVal / 1000000).toFixed(1)}M`;
    if (absVal >= 1000) return `${(absVal / 1000).toFixed(0)}k`;
    return absVal.toString();
  };

  const years = Array.from(new Set(data.map((d) => d.year))).sort(
    (a, b) => a - b,
  );

  return (
    <div className="w-full h-full flex flex-col p-4 pt-10 bg-white dark:bg-black overflow-hidden">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center text-zinc-800 dark:text-zinc-100">
          US Population Pyramid
        </h2>
        <p className="text-sm text-center text-zinc-500 mb-4">
          Year:{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            {year}
          </span>
        </p>
        <input
          type="range"
          min={years[0]}
          max={years[years.length - 1]}
          step={10}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
          <span>{years[0]}</span>
          <span>{years[years.length - 1]}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            stackOffset="sign"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#eee"
            />
            <XAxis
              type="number"
              tickFormatter={formatPopulation}
              fontSize={10}
              tick={{ fill: "#888" }}
            />
            <YAxis
              dataKey="age"
              type="category"
              width={30}
              fontSize={10}
              tick={{ fill: "#888" }}
              axisLine={false}
              tickLine={false}
              reversed={true}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              formatter={(value: number, name: string) => [
                formatPopulation(value),
                name === "male" ? "Male" : "Female",
              ]}
              labelFormatter={(label) => `Age: ${label}`}
            />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Bar
              dataKey="female"
              name="Female"
              fill="#e377c2"
              stackId="stack"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="male"
              name="Male"
              fill="#1f77b4"
              stackId="stack"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-[10px] text-center text-zinc-400 italic">
        Source: US Census Bureau
      </div>
    </div>
  );
}
