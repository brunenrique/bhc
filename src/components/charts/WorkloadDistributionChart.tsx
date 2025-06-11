
"use client";

import type { Session } from "@/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartPlaceholder } from "@/components/ui/dashboard/ChartPlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as RechartsPrimitive from 'recharts'; // For Cell

interface WorkloadDistributionChartProps {
  sessions: Session[];
  // period?: { from: Date; to: Date }; // Optional: for future filtering
}

interface PsychologistWorkload {
  psychologistName: string;
  completedSessions: number;
  fill: string; // For chart color
}

export function WorkloadDistributionChart({ sessions }: WorkloadDistributionChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  const chartData = useMemo(() => {
    setIsLoading(true);
    if (!sessions || sessions.length === 0) {
      setIsLoading(false);
      return [];
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) {
      setIsLoading(false);
      return [];
    }

    const workloadMap: Record<string, number> = {};
    completedSessions.forEach(session => {
      const psyName = session.psychologistName || session.psychologistId || "Desconhecido";
      workloadMap[psyName] = (workloadMap[psyName] || 0) + 1;
    });

    const psychologistColors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    const formattedData = Object.entries(workloadMap)
      .map(([name, count], index) => ({
        psychologistName: name,
        completedSessions: count,
        fill: psychologistColors[index % psychologistColors.length],
      }))
      .sort((a, b) => b.completedSessions - a.completedSessions); // Sort by most sessions

    setIsLoading(false);
    return formattedData;
  }, [sessions]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      completedSessions: {
        label: "Sessões Concluídas",
      },
    };
    chartData.forEach(item => {
      config[item.psychologistName] = {
        label: item.psychologistName,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);


  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (chartData.length === 0) {
    return <ChartPlaceholder message="Nenhuma sessão concluída para exibir a distribuição." icon="BarChart3" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
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
            dataKey="psychologistName"
            type="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={120} // Adjust width for longer names
            interval={0} // Show all labels
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            content={<ChartTooltipContent />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Bar 
            dataKey="completedSessions" 
            name="Sessões Concluídas" 
            radius={[0, 4, 4, 0]}
            barSize={30}
          >
             {chartData.map((entry) => (
                <RechartsPrimitive.Cell key={`cell-${entry.psychologistName}`} fill={entry.fill} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
