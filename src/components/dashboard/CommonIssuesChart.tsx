
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  count: {
    label: "Casos Reportados",
  },
} satisfies ChartConfig;

export function CommonIssuesChart() {
  const [chartData, setChartData] = useState<Array<{ issue: string; count: number; fill: string }>>([]);

  useEffect(() => {
    // Generate data on client-side after mount
    const data = [
      { issue: "Ansiedade", count: Math.floor(Math.random() * 50) + 10, fill: "hsl(var(--chart-1))" },
      { issue: "Depressão", count: Math.floor(Math.random() * 40) + 10, fill: "hsl(var(--chart-2))" },
      { issue: "Estresse", count: Math.floor(Math.random() * 30) + 5, fill: "hsl(var(--chart-3))" },
      { issue: "Relacionamentos", count: Math.floor(Math.random() * 25) + 5, fill: "hsl(var(--chart-4))" },
      { issue: "Autoestima", count: Math.floor(Math.random() * 20) + 5, fill: "hsl(var(--chart-5))" },
    ];
    setChartData(data);
  }, []);

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="issue"
            type="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Bar dataKey="count" name="Casos Reportados" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
