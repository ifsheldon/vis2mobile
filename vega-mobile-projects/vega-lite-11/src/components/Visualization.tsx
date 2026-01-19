"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import {
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import rawData from "@/lib/data.json";

interface Rating {
  score: number;
  count: number;
}

interface QuestionData {
  id: string;
  question: string;
  lowLabel: string;
  highLabel: string;
  median: number;
  ratings: Rating[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Rating;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-zinc-200 text-xs">
        <p className="font-bold text-zinc-800">Rating: {data.score}</p>
        <p className="text-zinc-600">{data.count} Participants</p>
      </div>
    );
  }
  return null;
};

const LikertCard = ({
  data,
  maxCount,
}: {
  data: QuestionData;
  maxCount: number;
}) => {
  // We want to center the dots vertically, so we use a fixed Y value
  const chartData = data.ratings.map((r) => ({
    ...r,
    y: 1,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-zinc-200/50"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-800 leading-tight pr-4">
          {data.question}
        </h3>
        <Info size={16} className="text-zinc-400 flex-shrink-0" />
      </div>

      <div className="h-24 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
            <XAxis
              type="number"
              dataKey="score"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#71717a" }}
            />
            <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
            <ZAxis
              type="number"
              dataKey="count"
              range={[0, 400]}
              domain={[0, maxCount]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
            />

            {/* Median line */}
            <ReferenceLine
              x={data.median}
              stroke="#000"
              strokeWidth={2}
              label={{
                position: "top",
                value: "Median",
                fill: "#000",
                fontSize: 8,
                fontWeight: "bold",
              }}
            />

            <Scatter data={chartData} fill="#3b82f6">
              {chartData.map((entry) => (
                <Cell
                  key={`score-${entry.score}`}
                  fill={`rgba(59, 130, 246, ${0.4 + (entry.count / maxCount) * 0.6})`}
                  className="drop-shadow-sm"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-2 px-4">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">
          {data.lowLabel}
        </span>
        <div className="h-px flex-grow mx-4 bg-zinc-200" />
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">
          {data.highLabel}
        </span>
      </div>
    </motion.div>
  );
};

export function Visualization() {
  const { questions, maxCount } = useMemo(() => {
    const medians = rawData.medians;
    const values = rawData.values;

    const processedQuestions = medians.map((m) => {
      const questionValues = values.filter(
        (v) => v.name === m.name && typeof v.value === "number",
      );
      const ratingsMap = new Map<number, number>();
      for (let i = 1; i <= 5; i++) ratingsMap.set(i, 0);
      questionValues.forEach((v) => {
        const score = v.value as number;
        ratingsMap.set(score, (ratingsMap.get(score) || 0) + 1);
      });

      return {
        id: m.name,
        question: m.name,
        lowLabel: m.lo,
        highLabel: m.hi,
        median: m.median,
        ratings: Array.from(ratingsMap.entries()).map(([score, count]) => ({
          score,
          count,
        })),
      };
    });

    const mCount = Math.max(
      ...processedQuestions.flatMap((q) => q.ratings.map((r) => r.count)),
    );

    return { questions: processedQuestions, maxCount: mCount };
  }, []);

  return (
    <div className="w-full min-h-full bg-zinc-50 p-4 font-sans text-zinc-900">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 mb-1">
          User Feedback
        </h1>
        <p className="text-sm text-zinc-500 font-medium">
          Likert Scale Ratings & Distributions
        </p>
      </header>

      <div className="pb-20">
        {questions.map((q) => (
          <LikertCard key={q.id} data={q} maxCount={maxCount} />
        ))}
      </div>

      {/* Legend / Info */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/50 flex items-center gap-6 z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-tighter">
            Frequency
          </span>
        </div>
        <div className="w-px h-4 bg-zinc-300" />
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-black" />
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-tighter">
            Median
          </span>
        </div>
      </div>
    </div>
  );
}
