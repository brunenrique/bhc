
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  sessions: {
    label: "Sessões",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function WeeklySessionsChart() {
  const [chartData, setChartData] = useState<Array<{ day: string; sessions: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => {
        const data = [
        { day: "Seg", sessions: Math.floor(Math.random() * 20) + 5 },
        { day: "Ter", sessions: Math.floor(Math.random() * 20) + 5 },
        { day: "Qua", sessions: Math.floor(Math.random() * 20) + 5 },
        { day: "Qui", sessions: Math.floor(Math.random() * 20) + 5 },
        { day: "Sex", sessions: Math.floor(Math.random() * 20) + 5 },
        { day: "Sáb", sessions: Math.floor(Math.random() * 10) },
        ];
        setChartData(data);
        setIsLoading(false);
    }, 600); // Simulate loading
    return () => clearTimeout(timer);
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
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
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
          <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} name="Sessões" />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
