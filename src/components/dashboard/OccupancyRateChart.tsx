
"use client"

import { Pie, PieChart, Cell, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const data = [
  { name: "Dr. João", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-1))" },
  { name: "Dra. Maria", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-2))"  },
  { name: "Dr. Carlos", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-3))"  },
  { name: "Vago", value: Math.floor(Math.random() * 30) + 10, color: "hsl(var(--muted))"  },
];

const chartConfig = {
  "Dr. João": { label: "Dr. João", color: "hsl(var(--chart-1))" },
  "Dra. Maria": { label: "Dra. Maria", color: "hsl(var(--chart-2))" },
  "Dr. Carlos": { label: "Dr. Carlos", color: "hsl(var(--chart-3))" },
  "Vago": { label: "Vago", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

export function OccupancyRateChart() {
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <Tooltip 
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            content={<ChartTooltipContent />}
          />
          <Legend wrapperStyle={{fontSize: '0.8rem'}} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            innerRadius={60}
            paddingAngle={3}
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
