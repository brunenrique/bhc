"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { issue: "Ansiedade", count: Math.floor(Math.random() * 50) + 10, fill: "hsl(var(--chart-1))" },
  { issue: "Depressão", count: Math.floor(Math.random() * 40) + 10, fill: "hsl(var(--chart-2))" },
  { issue: "Estresse", count: Math.floor(Math.random() * 30) + 5, fill: "hsl(var(--chart-3))" },
  { issue: "Relacionamentos", count: Math.floor(Math.random() * 25) + 5, fill: "hsl(var(--chart-4))" },
  { issue: "Autoestima", count: Math.floor(Math.random() * 20) + 5, fill: "hsl(var(--chart-5))" },
];

export function CommonIssuesChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            content={<ChartTooltipContent />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Bar dataKey="count" name="Casos Reportados" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
