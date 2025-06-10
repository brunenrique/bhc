
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface SessionStatusData {
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface SessionStatusChartProps {
  data: SessionStatusData;
}

const chartConfig = {
  count: {
    label: "Contagem",
  },
  scheduled: {
    label: "Agendadas",
    color: "hsl(var(--chart-2))", // Example color
  },
  completed: {
    label: "Realizadas",
    color: "hsl(var(--chart-1))", // Example color
  },
  cancelled: {
    label: "Canceladas",
    color: "hsl(var(--chart-3))", // Example color
  },
  noShow: {
    label: "Faltas",
    color: "hsl(var(--chart-5))", // Example color, using destructive for no-show might be an option too
  },
} satisfies ChartConfig;

export function SessionStatusChart({ data }: SessionStatusChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ name: string; count: number; fill: string }>>([]);

  useEffect(() => {
    if (data) {
      setChartData([
        { name: chartConfig.scheduled.label, count: data.scheduled, fill: `var(--color-scheduled)` },
        { name: chartConfig.completed.label, count: data.completed, fill: `var(--color-completed)` },
        { name: chartConfig.cancelled.label, count: data.cancelled, fill: `var(--color-cancelled)` },
        { name: chartConfig.noShow.label, count: data.noShow, fill: `var(--color-noShow)` },
      ]);
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!data || chartData.length === 0) {
     return <p className="text-muted-foreground text-center py-4">Dados de status da sessão indisponíveis.</p>;
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
              content={<ChartTooltipContent />}
            />
            <Legend wrapperStyle={{fontSize: '0.8rem'}} content={({ payload }) => {
              if (!payload) return null;
              return (
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
                  {payload.map((entry, index) => (
                     <li key={`item-${index}`} className="flex items-center text-xs">
                      <span className="inline-block w-2.5 h-2.5 mr-1.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                      {entry.value}
                    </li>
                  ))}
                </ul>
              );
            }}/>
            <Bar dataKey="count" name="Contagem" radius={[0, 4, 4, 0]} barSize={35}>
              {chartData.map((entry) => (
                <RechartsPrimitive.Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

// Need to import Cell from 'recharts' as RechartsPrimitive.Cell
import * as RechartsPrimitive from "recharts";
