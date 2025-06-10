
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  sessions: {
    label: "Sessões Criadas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SessionsCreatedPerWeekChart() {
  const [chartData, setChartData] = useState<Array<{ week: string; sessions: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching/generation
    setTimeout(() => {
      const data = [
        { week: "Semana -4", sessions: Math.floor(Math.random() * 30) + 20 },
        { week: "Semana -3", sessions: Math.floor(Math.random() * 30) + 25 },
        { week: "Semana -2", sessions: Math.floor(Math.random() * 30) + 22 },
        { week: "Semana -1", sessions: Math.floor(Math.random() * 30) + 30 },
        { week: "Semana Atual", sessions: Math.floor(Math.random() * 30) + 15 },
      ];
      setChartData(data);
      setIsLoading(false);
    }, 800);
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
      <ChartContainer config={chartConfig} className="h-full w-full">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            content={<ChartTooltipContent />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} name="Sessões Criadas" />
        </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
