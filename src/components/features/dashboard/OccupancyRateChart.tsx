"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts"
import { ChartTooltipContent } from "@/components/ui/chart";


const data = [
  { name: "Dr. João", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-1))" },
  { name: "Dra. Maria", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-2))"  },
  { name: "Dr. Carlos", value: Math.floor(Math.random() * 60) + 20, color: "hsl(var(--chart-3))"  },
  { name: "Vago", value: Math.floor(Math.random() * 30) + 10, color: "hsl(var(--muted))"  },
];

export function OccupancyRateChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
            // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
      </ResponsiveContainer>
    </div>
  );
}
