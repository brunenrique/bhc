
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  href?: string;
}

function StatsCardComponent({ title, value, icon, trend, href }: StatsCardProps) {
  const cardContent = (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", href && "cursor-pointer")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground flex items-center">
          <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" /> {trend}
        </p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }
  return cardContent;
}

const StatsCard = React.memo(StatsCardComponent);
export default StatsCard;
