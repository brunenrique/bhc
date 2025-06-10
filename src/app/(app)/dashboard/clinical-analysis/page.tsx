
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { Activity, Filter, TrendingUp } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { MainComplaintsCloud } from '@/components/charts/MainComplaintsCloud';
import { AssessmentScoreTrend } from '@/components/charts/AssessmentScoreTrend'; // Import the new chart
import { mockAssessmentsData } from '@/app/(app)/assessments/page'; // Import mock assessment data
import type { Assessment } from '@/types';

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

const mockComplaintsData = [
  "Sinto muita ansiedade no trabalho e em situações sociais.",
  "Tenho tido problemas para dormir, acordo cansado.",
  "Estou desmotivado e sem energia para fazer as coisas que gostava.",
  "Muita tristeza e choro fácil nos últimos meses.",
  "Dificuldade de concentração e foco nas tarefas diárias.",
  "Preocupação excessiva com o futuro, medo de que algo ruim aconteça.",
  "Irritabilidade constante, perco a paciência facilmente.",
  "Problemas de relacionamento com meu parceiro(a).",
  "Sentimento de solidão, mesmo rodeado de pessoas.",
  "Baixa autoestima e insegurança sobre minhas capacidades.",
  "Ataques de pânico recorrentes, com falta de ar e taquicardia.",
  "Estresse crônico devido às pressões do trabalho.",
  "Não consigo relaxar, sempre tenso e alerta.",
  "Pensamentos negativos e pessimistas sobre mim e sobre a vida.",
  "Perda de interesse em atividades que antes eram prazerosas.",
];

interface Filters {
  dateRange: DateRange | undefined;
  psychologistId: string;
  professionalSituation: string;
  assessmentTypeForTrend: string | undefined;
}

export default function ClinicalAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      from: subDays(new Date(), 90), // Default to last 90 days
      to: new Date(),
    },
    psychologistId: 'all',
    professionalSituation: 'all',
    assessmentTypeForTrend: undefined,
  });
  const [complaintsForCloud, setComplaintsForCloud] = useState<string[]>(mockComplaintsData);
  const [assessmentsForTrend, setAssessmentsForTrend] = useState<Assessment[]>(mockAssessmentsData);

  const availableAssessmentTitles = useMemo(() => {
    const titles = new Set<string>();
    mockAssessmentsData.forEach(assessment => {
      if (assessment.title && assessment.status === 'completed' && assessment.results?.score !== undefined) {
        titles.add(assessment.title);
      }
    });
    return Array.from(titles);
  }, []);

  useEffect(() => {
    if (availableAssessmentTitles.length > 0 && !filters.assessmentTypeForTrend) {
      setFilters(prev => ({ ...prev, assessmentTypeForTrend: availableAssessmentTitles[0]}));
    }
  }, [availableAssessmentTitles, filters.assessmentTypeForTrend]);


  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // Placeholder for data fetching based on filters
    // console.log("Filters changed, would refetch data:", filters);
    // For now, we just use the mock data or re-filter it.
    // Example: fetchClinicalData(filters).then(data => {
    //   setComplaintsForCloud(data.complaints);
    //   setAssessmentsForTrend(data.assessments);
    // });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/20 mb-6 shadow-sm items-end">
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
            <div>
              <Label htmlFor="assessment-type-trend-filter" className="text-sm font-medium">Tendência de Escala/Avaliação</Label>
              <Select
                value={filters.assessmentTypeForTrend}
                onValueChange={(value) => handleFilterChange('assessmentTypeForTrend', value)}
              >
                <SelectTrigger id="assessment-type-trend-filter" className="w-full mt-1">
                  <SelectValue placeholder="Selecione uma avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssessmentTitles.length > 0 ? (
                    availableAssessmentTitles.map(title => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Nenhuma avaliação com score encontrada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
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
              title="Análise de Queixas Principais (IA)"
              description="Nuvem de palavras com os temas mais frequentes das queixas dos pacientes no período e filtros selecionados."
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <MainComplaintsCloud complaints={complaintsForCloud} />
            </ChartContainer>
            
            <ChartContainer
              title="Tendência de Scores de Avaliação"
              description={`Média de scores para "${filters.assessmentTypeForTrend || "Avaliação Selecionada"}" ao longo do tempo.`}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <AssessmentScoreTrend 
                assessments={assessmentsForTrend} 
                selectedAssessmentTitle={filters.assessmentTypeForTrend} 
              />
            </ChartContainer>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
