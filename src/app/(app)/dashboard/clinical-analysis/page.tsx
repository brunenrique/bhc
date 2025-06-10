
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button"; // Uncomment if using an "Apply Filters" button
import { Label } from "@/components/ui/label";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { Activity, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';

// Mock data (replace with actual data fetching later)
const mockPsychologists = [
  { id: 'all', name: 'Todos Psicólogos' },
  { id: 'psy1', name: 'Dr. Exemplo Silva' },
  { id: 'psy2', name: 'Dra. Modelo Souza' },
  { id: 'psy3', name: 'Dr. Carlos Alberto' },
];

const mockProfessionalSituations = [
  { id: 'all', name: 'Todas Situações Profissionais' },
  { id: 'employed', name: 'Empregado(a)' },
  { id: 'self_employed', name: 'Autônomo(a)' },
  { id: 'unemployed', name: 'Desempregado(a)' },
  { id: 'student', name: 'Estudante' },
  { id: 'retired', name: 'Aposentado(a)' },
  { id: 'other', name: 'Outra' },
];

interface Filters {
  dateRange: DateRange | undefined;
  psychologistId: string;
  professionalSituation: string;
}

export default function ClinicalAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      from: subDays(new Date(), 30), 
      to: new Date(),
    },
    psychologistId: 'all',
    professionalSituation: 'all',
  });

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Placeholder for data fetching based on filters
  useEffect(() => {
    // console.log("Filters changed, would refetch data:", filters);
    // Example: fetchClinicalData(filters);
  }, [filters]);


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <Activity className="mr-3 h-7 w-7 text-primary" />
            Análise Clínica Avançada
          </CardTitle>
          <CardDescription>
            Filtre e explore dados clínicos para obter insights detalhados sobre pacientes e tratamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/20 mb-6 shadow-sm items-end">
            <div>
              <Label htmlFor="date-range-picker" className="text-sm font-medium">Período da Análise</Label>
              <DatePickerWithRange
                id="date-range-picker"
                date={filters.dateRange}
                onDateChange={(newRange) => handleFilterChange('dateRange', newRange)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="psychologist-filter" className="text-sm font-medium">Psicólogo Responsável</Label>
              <Select
                value={filters.psychologistId}
                onValueChange={(value) => handleFilterChange('psychologistId', value)}
              >
                <SelectTrigger id="psychologist-filter" className="w-full mt-1">
                  <SelectValue placeholder="Selecione um psicólogo" />
                </SelectTrigger>
                <SelectContent>
                  {mockPsychologists.map(psy => (
                    <SelectItem key={psy.id} value={psy.id}>{psy.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="professional-situation-filter" className="text-sm font-medium">Situação Profissional (Paciente)</Label>
              <Select
                value={filters.professionalSituation}
                onValueChange={(value) => handleFilterChange('professionalSituation', value)}
              >
                <SelectTrigger id="professional-situation-filter" className="w-full mt-1">
                  <SelectValue placeholder="Selecione uma situação" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessionalSituations.map(sit => (
                    <SelectItem key={sit.id} value={sit.id}>{sit.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 
            Optional: Apply button if auto-update on change is not desired
            <div className="lg:col-span-3 flex justify-end items-end">
              <Button className="w-full lg:w-auto">
                <Filter className="mr-2 h-4 w-4"/> Aplicar Filtros
              </Button>
            </div>
            */}
          </div>

          <div className="space-y-8 mt-8">
            <ChartContainer
              title="Perfil Demográfico dos Pacientes"
              description="Distribuição demográfica dos pacientes com base nos filtros aplicados."
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-md p-4">
                <Activity className="h-10 w-10 mr-3 text-primary/60"/>
                <p>Gráfico de perfil demográfico (Ex: idade, sexo, etc.) aparecerá aqui, atualizado pelos filtros.</p>
              </div>
            </ChartContainer>

            <ChartContainer
              title="Análise de Queixas Principais (Filtrado)"
              description="Principais queixas e demandas dos pacientes no período e filtros selecionados."
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-md p-4">
                <Filter className="h-10 w-10 mr-3 text-primary/60"/>
                <p>Gráfico de queixas principais (Ex: ansiedade, depressão) aparecerá aqui.</p>
              </div>
            </ChartContainer>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
