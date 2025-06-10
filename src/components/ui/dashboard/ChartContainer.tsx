
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function ChartContainer({ title, description, children, className, footer }: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && <div className="p-6 pt-0">{footer}</div>}
    </Card>
  );
}
