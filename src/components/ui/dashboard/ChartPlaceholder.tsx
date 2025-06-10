
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, BarChart, PieChart, AreaChart, Info, LineChart, Filter } from "lucide-react"; // Changed FunnelIcon to Filter

interface ChartPlaceholderProps {
  type?: "loading" | "error" | "no-data";
  message?: string;
  icon?: "BarChart" | "PieChart" | "AreaChart" | "LineChart" | "Activity" | "Filter" | "Info"; // Changed Funnel to Filter
  className?: string;
}

const iconMap = {
  BarChart: BarChart,
  PieChart: PieChart,
  AreaChart: AreaChart,
  LineChart: LineChart,
  Activity: Activity,
  Filter: Filter, // Changed FunnelIcon to Filter
  Info: Info,
};


export function ChartPlaceholder({
  type = "no-data",
  message,
  icon = "Activity",
  className,
}: ChartPlaceholderProps) {

  const IconComponent = iconMap[icon] || Activity;

  if (type === "loading") {
    return (
      <div className={cn("h-[350px] w-full flex flex-col items-center justify-center", className)}>
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  let defaultMessage = "Dados indisponíveis para este gráfico.";
  let IconToShow = IconComponent;
  let iconColor = "text-muted-foreground";

  if (type === "error") {
    defaultMessage = message || "Erro ao carregar dados do gráfico.";
    IconToShow = AlertTriangle;
    iconColor = "text-destructive";
  } else if (type === "no-data") {
    defaultMessage = message || "Nenhum dado para exibir no momento.";
  }


  return (
    <div
      className={cn(
        "h-[350px] w-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg bg-muted/30",
        iconColor,
        className
      )}
    >
      <IconToShow className="h-12 w-12 mb-3 opacity-70" />
      <p className="text-sm font-medium">{defaultMessage}</p>
    </div>
  );
}
