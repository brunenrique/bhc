
"use client"

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  sessions: {
    label: "Sessões",
  },
  "Dr. Silva": { label: "Dr. Silva", color: "hsl(var(--chart-1))" },
  "Dra. Alves": { label: "Dra. Alves", color: "hsl(var(--chart-2))" },
  "Dr. Mendes": { label: "Dr. Mendes", color: "hsl(var(--chart-3))" },
  "Outros": { label: "Outros", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function SessionsPerPsychologistChart() {
  const [chartData, setChartData] = useState<Array<{ name: string; sessions: number; fill: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching/generation
    setTimeout(() => {
      const data = [
        { name: "Dr. Silva", sessions: Math.floor(Math.random() * 50) + 30, fill: "var(--color-Dr\\. Silva)" },
        { name: "Dra. Alves", sessions: Math.floor(Math.random() * 40) + 25, fill: "var(--color-Dra\\. Alves)" },
        { name: "Dr. Mendes", sessions: Math.floor(Math.random() * 30) + 20, fill: "var(--color-Dr\\. Mendes)" },
        { name: "Outros", sessions: Math.floor(Math.random() * 20) + 10, fill: "var(--color-Outros)" },
      ];
      setChartData(data);
      setIsLoading(false);
    }, 1200);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full w-full max-w-[300px]"
      >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            content={<ChartTooltipContent nameKey="name" hideLabel />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Pie
            data={chartData}
            dataKey="sessions"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={2}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
