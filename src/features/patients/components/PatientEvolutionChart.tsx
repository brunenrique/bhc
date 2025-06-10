
"use client";

import type { Assessment, EvolutionDataPoint } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Info } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";

interface PatientEvolutionChartProps {
  patientName: string;
  completedAssessments: Assessment[]; // Only completed assessments with results
}

export function PatientEvolutionChart({ patientName, completedAssessments }: PatientEvolutionChartProps) {
  const [selectedInstrumentTitle, setSelectedInstrumentTitle] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // For initial data processing

  useEffect(() => {
    if (completedAssessments.length > 0) {
      // Default to the first available instrument if none is selected
      if (!selectedInstrumentTitle && completedAssessments[0]?.title) {
         setSelectedInstrumentTitle(completedAssessments[0].title);
      }
    }
    setIsLoading(false);
  }, [completedAssessments, selectedInstrumentTitle]);

  const availableInstruments = useMemo(() => {
    const instrumentTitles = new Set<string>();
    completedAssessments.forEach(assessment => {
      if (assessment.title && assessment.status === 'completed' && assessment.results?.score !== undefined) {
        instrumentTitles.add(assessment.title);
      }
    });
    return Array.from(instrumentTitles);
  }, [completedAssessments]);

  const chartData = useMemo(() => {
    if (!selectedInstrumentTitle) return [];
    return completedAssessments
      .filter(assessment => 
        assessment.title === selectedInstrumentTitle && 
        assessment.status === 'completed' && 
        assessment.results?.score !== undefined
      )
      .map(assessment => ({
        date: format(parseISO(assessment.createdAt), "dd/MM/yy", { locale: ptBR }),
        score: assessment.results!.score,
        name: assessment.title, // for tooltip/legend consistency
      }))
      .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()); // Ensure sorted by date
  }, [completedAssessments, selectedInstrumentTitle]);

  const chartConfig = useMemo(() => {
    if (!selectedInstrumentTitle) return {} as ChartConfig;
    return {
      [selectedInstrumentTitle]: {
        label: selectedInstrumentTitle,
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;
  }, [selectedInstrumentTitle]);


  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (availableInstruments.length === 0) {
     return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary" /> Análise de Evolução Clínica</CardTitle>
          <CardDescription>Dados de {patientName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Info className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma escala ou questionário com resultados numéricos preenchidos.</p>
            <p className="text-xs text-muted-foreground mt-1">Preencha e finalize avaliações para visualizar a evolução.</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary" /> Análise de Evolução Clínica</CardTitle>
        <CardDescription>Dados de {patientName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="instrument-select" className="text-sm font-medium text-muted-foreground">Selecionar Instrumento:</label>
          <Select value={selectedInstrumentTitle} onValueChange={setSelectedInstrumentTitle}>
            <SelectTrigger id="instrument-select" className="w-full md:w-[300px] mt-1">
              <SelectValue placeholder="Escolha um instrumento" />
            </SelectTrigger>
            <SelectContent>
              {availableInstruments.map(instrument => (
                <SelectItem key={instrument} value={instrument}>{instrument}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedInstrumentTitle && chartData.length > 0 ? (
          <div className="h-[300px] w-full">
             <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    domain={['auto', 'auto']} // Or specify min/max if known for the scale
                  />
                  <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Legend wrapperStyle={{fontSize: '0.8rem'}} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    strokeWidth={2}
                    stroke={`var(--color-${selectedInstrumentTitle.replace(/\s+/g, '-')})`} // Ensure key matches config
                    name={selectedInstrumentTitle}
                    dot={{ r: 4, fill: `var(--color-${selectedInstrumentTitle.replace(/\s+/g, '-')})` }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : selectedInstrumentTitle && chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum dado encontrado para "{selectedInstrumentTitle}".</p>
        ) : (
            <p className="text-muted-foreground text-center py-8">Selecione um instrumento para visualizar o gráfico.</p>
        )}
      </CardContent>
    </Card>
  );
}
