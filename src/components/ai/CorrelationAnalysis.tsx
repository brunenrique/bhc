"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, AlertTriangle, Sparkles } from 'lucide-react';
import type { AnalyzeCorrelationInput, AnalyzeCorrelationOutput } from '@/ai/flows/analyze-correlation-flow';
import { useToast } from '@/hooks/use-toast';

interface AnalysisVariable {
  id: string;
  name: string;
  descriptionForAI: string;
}

const mockAnalysisVariables: AnalysisVariable[] = [
  { id: 'demanda_principal', name: 'Tipo de Demanda Principal', descriptionForAI: "Categorical: The primary complaint or reason the patient sought therapy (e.g., 'Ansiedade', 'Depressão', 'Problemas de Relacionamento', 'Estresse no Trabalho')." },
  { id: 'score_ansiedade_beck', name: 'Score (Escala Beck de Ansiedade)', descriptionForAI: "Numerical: Patient's score on the Beck Anxiety Inventory, where higher scores indicate more severe anxiety symptoms." },
  { id: 'score_depressao_beck', name: 'Score (Inventário Beck de Depressão)', descriptionForAI: "Numerical: Patient's score on the Beck Depression Inventory, where higher scores indicate more severe depressive symptoms." },
  { id: 'satisfacao_geral_escala', name: 'Score (Escala de Satisfação Geral)', descriptionForAI: "Numerical: Patient's score on a general satisfaction scale (0-100), where higher scores indicate greater life satisfaction." },
  { id: 'numero_sessoes', name: 'Número de Sessões Realizadas', descriptionForAI: "Numerical: Total number of therapy sessions the patient has completed (e.g., 1 to 50)." },
  { id: 'tempo_tratamento_meses', name: 'Tempo de Tratamento (Meses)', descriptionForAI: "Numerical: Duration the patient has been in therapy, in months (e.g., 1 to 24)." },
  { id: 'situacao_profissional', name: 'Situação Profissional', descriptionForAI: "Categorical: Patient's employment status (e.g., 'Empregado', 'Desempregado', 'Autônomo', 'Estudante', 'Aposentado')." },
  { id: 'qualidade_sono_horas', name: 'Qualidade do Sono (Horas médias)', descriptionForAI: "Numerical: Average hours of sleep per night reported by the patient (e.g., 4 to 9 hours)." },
  { id: 'frequencia_exercicio', name: 'Frequência de Exercício Físico', descriptionForAI: "Categorical: How often the patient engages in physical exercise (e.g., 'Nenhuma', '1-2 vezes/semana', '3-4 vezes/semana', 'Diariamente')." },
  { id: 'nivel_suporte_social', name: 'Nível de Suporte Social Percebido', descriptionForAI: "Categorical: Patient's perceived level of social support (e.g., 'Baixo', 'Médio', 'Alto'). Based on self-report or a qualitative assessment." }
];

export function CorrelationAnalysis() {
  const [variable1Id, setVariable1Id] = useState<string | undefined>(undefined);
  const [variable2Id, setVariable2Id] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = useCallback(async () => {
    if (!variable1Id || !variable2Id) {
      toast({ title: "Seleção Incompleta", description: "Por favor, selecione duas variáveis para análise.", variant: "destructive" });
      return;
    }
    if (variable1Id === variable2Id) {
      toast({ title: "Seleção Inválida", description: "Por favor, selecione duas variáveis diferentes.", variant: "destructive" });
      return;
    }

    const var1 = mockAnalysisVariables.find(v => v.id === variable1Id);
    const var2 = mockAnalysisVariables.find(v => v.id === variable2Id);

    if (!var1 || !var2) {
      toast({ title: "Erro Interno", description: "Variáveis selecionadas não encontradas.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const input: AnalyzeCorrelationInput = {
        variable1Name: var1.name,
        variable1Description: var1.descriptionForAI,
        variable2Name: var2.name,
        variable2Description: var2.descriptionForAI,
      };

      const response = await fetch('/api/ai/analyze-correlation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: AnalyzeCorrelationOutput = await response.json();
      setAnalysisResult(result.correlationInsight);
      toast({ title: "Análise de Correlação Concluída", description: "O insight foi gerado com sucesso.", className:"bg-primary text-primary-foreground" });
    } catch (err: any) {
      // console.error("Failed to analyze correlation:", err);
      setError(err.message || 'Falha ao realizar a análise de correlação.');
      toast({ title: "Erro na Análise", description: err.message || 'Ocorreu um erro.', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [variable1Id, variable2Id, toast]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" />Análise de Correlação (Simulada por IA)</CardTitle>
        <CardDescription>Selecione duas variáveis para que a IA gere uma hipótese de correlação entre elas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="variable1" className="font-medium">Variável 1</Label>
            <Select value={variable1Id} onValueChange={setVariable1Id}>
              <SelectTrigger id="variable1" className="mt-1">
                <SelectValue placeholder="Selecione a primeira variável" />
              </SelectTrigger>
              <SelectContent>
                {mockAnalysisVariables.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === variable2Id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="variable2" className="font-medium">Variável 2</Label>
            <Select value={variable2Id} onValueChange={setVariable2Id}>
              <SelectTrigger id="variable2" className="mt-1">
                <SelectValue placeholder="Selecione a segunda variável" />
              </SelectTrigger>
              <SelectContent>
                {mockAnalysisVariables.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === variable1Id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleAnalyze} disabled={isLoading || !variable1Id || !variable2Id} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Analisar Correlação
        </Button>

        {isLoading && (
          <div className="text-center py-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Analisando dados e gerando insight...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
            <div>
              <p className="font-semibold">Erro na Análise</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {analysisResult && !isLoading && !error && (
          <Card className="mt-4 bg-muted/20 border-primary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />Insight de Correlação Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{analysisResult}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
