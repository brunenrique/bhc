
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { Activity, Filter, TrendingUp, Search, Tags, Brain } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { MainComplaintsCloud } from '@/components/charts/MainComplaintsCloud';
import { AssessmentScoreTrend } from '@/components/charts/AssessmentScoreTrend';
import { mockAssessmentsData } from '@/app/(app)/assessments/page';
import type { Assessment } from '@/types';
import { CorrelationAnalysis } from '@/components/ai/CorrelationAnalysis'; 
import { ChartPlaceholder } from '@/components/ui/dashboard/ChartPlaceholder';

const mockPsychologists = [
  { id: 'all', name: 'Todos Psicólogos' },
  { id: 'psy1', name: 'Dr. Exemplo Silva' },
  { id: 'psy2', name: 'Dra. Modelo Souza' },
  { id: 'psy3', name: 'Dr. Carlos Alberto' },
  { id: 'other-psy-uid', name: 'Dr. Outro Exemplo'}
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
  "Medo de falhar e decepcionar os outros.",
  "Dificuldade em tomar decisões, mesmo as mais simples.",
  "Procrastinação constante, adiando tarefas importantes.",
  "Sentimento de culpa por coisas do passado.",
  "Isolamento social, evitando contato com amigos e familiares.",
  "Fadiga persistente, mesmo após descanso.",
  "Alterações de apetite, comendo demais ou de menos.",
  "Dores de cabeça frequentes e tensão muscular.",
  "Preocupações financeiras e instabilidade no emprego.",
  "Dificuldade em lidar com críticas ou feedback negativo.",
];

interface Filters {
  dateRange: DateRange | undefined;
  psychologistId: string;
  professionalSituation: string;
  assessmentTypeForTrend: string | undefined;
  diagnosisTerm: string;
  tagsTerm: string;
  assessmentTypeFilter: string | undefined;
}

export default function ClinicalAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      from: subDays(new Date(), 90), 
      to: new Date(),
    },
    psychologistId: 'all',
    professionalSituation: 'all',
    assessmentTypeForTrend: undefined,
    diagnosisTerm: '',
    tagsTerm: '',
    assessmentTypeFilter: 'all',
  });
  const [complaintsForCloud, setComplaintsForCloud] = useState<string[]>(mockComplaintsData);
  const [assessmentsForTrend, setAssessmentsForTrend] = useState<Assessment[]>(mockAssessmentsData);

  const availableAssessmentTitles = useMemo(() => {
    const titles = new Set<string>();
    mockAssessmentsData.forEach(assessment => {
      if (assessment.title) { // For filtering by type, not just completed with score
        titles.add(assessment.title);
      }
    });
    return Array.from(titles);
  }, []);

  const availableAssessmentTitlesForTrend = useMemo(() => {
    const titles = new Set<string>();
    mockAssessmentsData.forEach(assessment => {
      if (assessment.title && assessment.status === 'completed' && assessment.results?.score !== undefined) {
        titles.add(assessment.title);
      }
    });
    return Array.from(titles);
  }, []);

  useEffect(() => {
    if (availableAssessmentTitlesForTrend.length > 0 && !filters.assessmentTypeForTrend) {
      setFilters(prev => ({ ...prev, assessmentTypeForTrend: availableAssessmentTitlesForTrend[0]}));
    }
  }, [availableAssessmentTitlesForTrend, filters.assessmentTypeForTrend]);


  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
  }

  useEffect(() => {
    // console.log("Filters changed, would refetch data:", filters);
  }, [filters]);


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <Filter className="mr-3 h-7 w-7 text-primary" />
            Busca Clínica Avançada
          </CardTitle>
          <CardDescription>
            Filtre e explore dados clínicos para obter insights detalhados sobre pacientes e tratamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/20 mb-6 shadow-sm items-end">
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
              <Label htmlFor="assessmentTypeFilter" className="text-sm font-medium">Tipo de Avaliação (Filtro)</Label>
              <Select
                value={filters.assessmentTypeFilter}
                onValueChange={(value) => handleFilterChange('assessmentTypeFilter', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="assessmentTypeFilter" className="w-full mt-1">
                  <SelectValue placeholder="Filtrar por avaliação realizada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Avaliações</SelectItem>
                  {availableAssessmentTitles.length > 0 ? (
                    availableAssessmentTitles.map(title => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Nenhuma avaliação cadastrada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="diagnosisTerm" className="text-sm font-medium">Diagnóstico (Busca por Termo)</Label>
              <div className="relative mt-1">
                <Brain className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="diagnosisTerm" name="diagnosisTerm" value={filters.diagnosisTerm} onChange={handleInputChange} placeholder="Ex: Transtorno de Ansiedade Generalizada, Depressão Maior..." className="pl-8"/>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="tagsTerm" className="text-sm font-medium">Tags (Busca por Termo)</Label>
               <div className="relative mt-1">
                <Tags className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="tagsTerm" name="tagsTerm" value={filters.tagsTerm} onChange={handleInputChange} placeholder="Ex: luto, estresse pós-traumático, TCC..." className="pl-8"/>
              </div>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                    <Search className="mr-2 h-5 w-5 text-accent"/>Resultados da Busca Avançada
                </CardTitle>
                <CardDescription>Pacientes correspondentes aos filtros selecionados aparecerão aqui.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartPlaceholder message="Tabela de pacientes filtrados aparecerá aqui. A lógica de busca detalhada e combinação de filtros não está implementada nesta simulação." icon="Info"/>
            </CardContent>
          </Card>

          <div className="space-y-8 mt-8">
            <ChartContainer
              title="Perfil Demográfico dos Pacientes (Filtrado)"
              description="Distribuição demográfica dos pacientes com base nos filtros aplicados."
              className="shadow-md hover:shadow-lg transition-shadow"
            >
               <ChartPlaceholder message="Gráfico de perfil demográfico (Ex: idade, sexo) com base nos filtros aparecerá aqui." icon="Activity" />
            </ChartContainer>

            <ChartContainer
              title="Análise de Queixas Principais (IA)"
              description="Nuvem de palavras com os temas mais frequentes das queixas dos pacientes no período e filtros selecionados."
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <MainComplaintsCloud complaints={complaintsForCloud} />
            </ChartContainer>
            
            <div className="lg:col-span-1"> {/* Changed from lg:col-span-2 to make it single column */}
                <Label htmlFor="assessment-type-trend-filter" className="text-sm font-medium">Selecionar Escala para Gráfico de Tendência</Label>
                <Select
                    value={filters.assessmentTypeForTrend}
                    onValueChange={(value) => handleFilterChange('assessmentTypeForTrend', value)}
                >
                    <SelectTrigger id="assessment-type-trend-filter" className="w-full md:w-1/2 lg:w-1/3 mt-1">
                    <SelectValue placeholder="Selecione uma avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                    {availableAssessmentTitlesForTrend.length > 0 ? (
                        availableAssessmentTitlesForTrend.map(title => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="none" disabled>Nenhuma avaliação com score encontrada</SelectItem>
                    )}
                    </SelectContent>
                </Select>
            </div>
            <ChartContainer
              title={`Tendência de Scores: ${filters.assessmentTypeForTrend || "Nenhuma Avaliação Selecionada"}`}
              description={`Média de scores para "${filters.assessmentTypeForTrend || "Avaliação Selecionada"}" ao longo do tempo.`}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <AssessmentScoreTrend 
                assessments={assessmentsForTrend} 
                selectedAssessmentTitle={filters.assessmentTypeForTrend} 
              />
            </ChartContainer>

            <CorrelationAnalysis />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
    