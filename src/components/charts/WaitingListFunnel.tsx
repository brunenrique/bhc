
"use client";

import React, { useState, useEffect } from "react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPlaceholder } from "@/components/ui/dashboard/ChartPlaceholder";

export interface WaitingListFunnelData {
  waiting: number;
  contacted: number;
  scheduled: number;
  archived: number; // Usually 'archived' might not be part of the main funnel flow, but can be included if desired.
                  // For a typical funnel, it's about progression towards scheduling.
}

interface WaitingListFunnelProps {
  data: WaitingListFunnelData;
  title?: string;
}

const chartConfig = {
  value: {
    label: "Pacientes",
  },
  waiting: {
    label: "Aguardando",
    color: "hsl(var(--chart-1))",
  },
  contacted: {
    label: "Contatados",
    color: "hsl(var(--chart-2))",
  },
  scheduled: {
    label: "Agendados",
    color: "hsl(var(--chart-3))",
  },
  // 'archived' could be visualized separately or if it's a final step.
  // For this funnel, we'll focus on the progression to 'scheduled'.
} satisfies ChartConfig;

export function WaitingListFunnel({
  data,
  title = "Funil da Lista de Espera",
}: WaitingListFunnelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<
    Array<{ value: number; name: string; fill: string }>
  >([]);

  useEffect(() => {
    if (data) {
      const funnelData = [
        {
          value: data.waiting,
          name: chartConfig.waiting.label,
          fill: `var(--color-waiting)`,
        },
        {
          value: data.contacted,
          name: chartConfig.contacted.label,
          fill: `var(--color-contacted)`,
        },
        {
          value: data.scheduled,
          name: chartConfig.scheduled.label,
          fill: `var(--color-scheduled)`,
        },
      ].filter(d => d.value > 0); // Only show stages with data

      setChartData(funnelData);
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
    return <ChartPlaceholder message="Dados da lista de espera indisponíveis para o funil." icon="Funnel" />;
  }

  const totalWaiting = data.waiting;

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
            <Tooltip
              cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
              content={<ChartTooltipContent />}
            />
            <Funnel dataKey="value" data={chartData} isAnimationActive>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                position="center"
                fill="#fff"
                stroke="none"
                dataKey="name"
                formatter={(value: string) => value}
                className="font-semibold text-sm drop-shadow-md"
              />
              <LabelList
                position="right"
                dataKey="value"
                formatter={(value: number) => {
                    const percentage = totalWaiting > 0 ? ((value / totalWaiting) * 100).toFixed(0) : 0;
                    return `${value} (${percentage}%)`;
                }}
                className="text-xs fill-muted-foreground"
                offset={10}
                />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
