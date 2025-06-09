"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent } from "@/components/ui/chart" // Assuming ChartTooltipContent is part of your shadcn/ui setup


const data = [
  { day: "Seg", sessions: Math.floor(Math.random() * 20) + 5 },
  { day: "Ter", sessions: Math.floor(Math.random() * 20) + 5 },
  { day: "Qua", sessions: Math.floor(Math.random() * 20) + 5 },
  { day: "Qui", sessions: Math.floor(Math.random() * 20) + 5 },
  { day: "Sex", sessions: Math.floor(Math.random() * 20) + 5 },
  { day: "Sáb", sessions: Math.floor(Math.random() * 10) },
];

export function WeeklySessionsChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
          <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessões" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
