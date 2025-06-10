
"use client";

import type { Assessment } from "@/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartPlaceholder } from "@/components/ui/dashboard/ChartPlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AssessmentScoreTrendProps {
  assessments: Assessment[];
  selectedAssessmentTitle: string | undefined;
  patientName?: string; // Optional: if chart is for a specific patient
}

interface MonthlyScoreData {
  month: string; // "YYYY-MM"
  averageScore: number;
  count: number;
}

export function AssessmentScoreTrend({ assessments, selectedAssessmentTitle, patientName }: AssessmentScoreTrendProps) {
  const [isLoading, setIsLoading] = useState(true);

  const chartData = useMemo(() => {
    setIsLoading(true);
    if (!selectedAssessmentTitle || !assessments || assessments.length === 0) {
      setIsLoading(false);
      return [];
    }

    const filtered = assessments.filter(
      (assessment) =>
        assessment.title === selectedAssessmentTitle &&
        assessment.status === "completed" &&
        assessment.results?.score !== undefined &&
        typeof assessment.results.score === "number" &&
        (assessment.results.answeredAt || assessment.createdAt)
    );

    if (filtered.length === 0) {
      setIsLoading(false);
      return [];
    }

    const scoresByMonth: Record<string, { totalScore: number; count: number }> = {};

    filtered.forEach((assessment) => {
      const dateToSort = assessment.results?.answeredAt || assessment.createdAt;
      const monthKey = format(startOfMonth(parseISO(dateToSort)), "yyyy-MM");
      if (!scoresByMonth[monthKey]) {
        scoresByMonth[monthKey] = { totalScore: 0, count: 0 };
      }
      scoresByMonth[monthKey].totalScore += assessment.results!.score;
      scoresByMonth[monthKey].count += 1;
    });

    const monthlyAverages = Object.entries(scoresByMonth)
      .map(([month, data]) => ({
        month, // Keep as "YYYY-MM" for sorting
        averageScore: parseFloat((data.totalScore / data.count).toFixed(1)),
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)) // Sort by "YYYY-MM" string
      .map(d => ({
        ...d,
        month: format(parseISO(d.month + "-01"), "MMM/yy", { locale: ptBR }), // Format for display
      })); // Format for display "Jan/24"

    setIsLoading(false);
    return monthlyAverages;
  }, [assessments, selectedAssessmentTitle]);

  const chartConfig = useMemo(() => {
    if (!selectedAssessmentTitle) return {} as ChartConfig;
    const key = selectedAssessmentTitle.replace(/\s+/g, '-') || "score";
    return {
      [key]: {
        label: `Média de Score (${selectedAssessmentTitle})`,
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;
  }, [selectedAssessmentTitle]);

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (!selectedAssessmentTitle) {
    return <ChartPlaceholder message="Selecione um tipo de avaliação para ver a tendência." icon="LineChart" />;
  }

  if (chartData.length === 0) {
    return <ChartPlaceholder message={`Nenhum dado de score encontrado para "${selectedAssessmentTitle}"${patientName ? ` de ${patientName}`: ''}.`} icon="LineChart" />;
  }
  
  const scoreKey = selectedAssessmentTitle.replace(/\s+/g, '-') || "score";

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: 0, // Adjusted for better y-axis label visibility
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={{stroke: "hsl(var(--border))"}}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={{stroke: "hsl(var(--border))"}}
            domain={['auto', 'auto']} // Auto domain based on data
          />
          <Tooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelKey="month"
                nameKey="averageScore"
                formatter={(value, name, item) => {
                   if (name === "averageScore" && item.payload.count) {
                     return `${value} (N=${item.payload.count})`;
                   }
                   return value as React.ReactNode;
                }}
              />
            }
            cursor={{stroke: "hsl(var(--accent))", strokeWidth: 1, strokeDasharray: "3 3"}}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
          <Line
            dataKey="averageScore"
            type="monotone"
            stroke={`var(--color-${scoreKey})`}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: `var(--color-${scoreKey})`,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: `var(--color-${scoreKey})`,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            name={chartConfig[scoreKey]?.label as string || "Média de Score"}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
