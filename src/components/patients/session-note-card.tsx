
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Tag, Lightbulb, BarChart3, Edit, Trash2, AlertTriangleIcon, CheckCircle, ShieldAlert, FilePlus2 } from "lucide-react";
import { generateSessionInsights, generateReportDraft } from '@/services/aiService';
import type { GenerateSessionInsightsOutput } from '@/ai/flows/generate-session-insights';
import type { GenerateReportDraftInput } from '@/ai/flows/generate-report-draft-flow';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Removed DialogClose as it's not directly used for control here
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SessionNote {
  id: string;
  date: string;
  summary: string;
  keywords?: string[];
  themes?: string[];
}

interface SessionNoteCardProps {
  note: SessionNote;
  patientName: string;
  therapistName?: string; 
}

function SessionNoteCardComponent({ note, patientName, therapistName = "Psicólogo(a) Responsável" }: SessionNoteCardProps) {
  const { toast } = useToast();
  const [insights, setInsights] = useState<GenerateSessionInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [errorInsights, setErrorInsights] = useState<string | null>(null);

  const [reportDraft, setReportDraft] = useState<string | null>(null);
  const [currentReportType, setCurrentReportType] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [errorReport, setErrorReport] = useState<string | null>(null);
  const [isReportDialogVisible, setIsReportDialogVisible] = useState(false);

  const handleGenerateInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    setErrorInsights(null);
    try {
      const result = await generateSessionInsights({ sessionNotes: note.summary });
      setInsights(result);
      toast({ title: "Insights Gerados" });
    } catch (e) {
      console.error("Falha ao gerar insights:", e);
      setErrorInsights("Falha ao gerar insights. Por favor, tente novamente.");
    } finally {
      setIsLoadingInsights(false);
    }
  }, [note.summary, toast]);

  const getReportTypeName = useCallback((type: GenerateReportDraftInput["reportType"]): string => {
    if (type === "progress_report") return "Relatório de Progresso";
    if (type === "referral_letter") return "Carta de Encaminhamento";
    if (type === "session_summary") return "Resumo da Sessão";
    return "Documento";
  }, []);

  const handleGenerateReport = useCallback(async (reportType: GenerateReportDraftInput["reportType"]) => {
    setIsGeneratingReport(true);
    setErrorReport(null);
    setReportDraft(null);
    const reportTypeName = getReportTypeName(reportType);
    setCurrentReportType(reportTypeName);
    setIsReportDialogVisible(true);

    try {
      const result = await generateReportDraft({
        sessionNotes: note.summary,
        patientName,
        reportType,
        therapistName,
      });
      setReportDraft(result.draftContent);
      toast({ title: "Rascunho de relatório gerado" });
    } catch (e) {
      console.error("Falha ao gerar rascunho de relatório:", e);
      setErrorReport(`Falha ao gerar rascunho de ${reportTypeName}. Por favor, tente novamente.`);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [getReportTypeName, patientName, note.summary, therapistName, toast]);

  const handleCopyReportDraft = useCallback(() => {
    if (reportDraft) {
      navigator.clipboard.writeText(reportDraft);
      toast({ title: "Rascunho Copiado", description: "O conteúdo do rascunho foi copiado para a área de transferência." });
    }
  }, [reportDraft, toast]);
  
  const closeReportDialog = useCallback(() => {
    setIsReportDialogVisible(false); 
    setReportDraft(null);
    setErrorReport(null);
    setIsGeneratingReport(false);
  }, []);

  const formattedDate = useMemo(() => format(new Date(note.date), "PPP", { locale: ptBR }), [note.date]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Anotação de Sessão
            </CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Gerar documento a partir da anotação de ${formattedDate}`}>
                  <FilePlus2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Gerar Rascunho de Documento</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleGenerateReport("progress_report")}>Relatório de Progresso</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport("referral_letter")}>Carta de Encaminhamento</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateReport("session_summary")}>Resumo da Sessão</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" aria-label={`Editar anotação de ${formattedDate}`}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Excluir anotação de ${formattedDate}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.summary}</p>
        {!insights && !isLoadingInsights && (
          <Button onClick={handleGenerateInsights} variant="outline" size="sm" className="mt-4">
            <Brain className="mr-2 h-4 w-4" /> Gerar Insights com IA
          </Button>
        )}
        {isLoadingInsights && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {errorInsights && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Erro nos Insights</AlertTitle>
            <AlertDescription>{errorInsights}</AlertDescription>
          </Alert>
        )}
        {insights && (
          <div className="mt-6 space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-md font-semibold text-accent flex items-center"><Lightbulb className="mr-2 h-5 w-5" /> Insights da IA</h4>
            {insights.potentialRiskAlerts && insights.potentialRiskAlerts.length > 0 && (
              <div>
                <h5 className="text-sm font-medium flex items-center text-destructive"><ShieldAlert className="mr-2 h-4 w-4" /> Alertas de Risco Potencial:</h5>
                <div className="flex flex-wrap gap-1 mt-1">
                  {insights.potentialRiskAlerts.map((alert, idx) => <Badge key={idx} variant="destructive">{alert}</Badge>)}
                </div>
              </div>
            )}
            <div>
              <h5 className="text-sm font-medium flex items-center"><Tag className="mr-2 h-4 w-4 text-muted-foreground" /> Palavras-chave:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {insights.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium flex items-center"><Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" /> Temas:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {insights.themes.map(theme => <Badge key={theme} variant="outline">{theme}</Badge>)}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium flex items-center"><BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" /> Evolução dos Sintomas:</h5>
              <p className="text-xs text-muted-foreground mt-1">{insights.symptomEvolution}</p>
            </div>
            {insights.therapeuticMilestones && insights.therapeuticMilestones.length > 0 && (
                <div>
                    <h5 className="text-sm font-medium flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcos Terapêuticos:</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {insights.therapeuticMilestones.map((milestone, idx) => <Badge key={idx} variant="default" className="bg-green-100 text-green-700 border-green-300">{milestone}</Badge>)}
                    </div>
                </div>
            )}
            {insights.inventoryComparisonInsights && (
                <div>
                    <h5 className="text-sm font-medium flex items-center"><BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" /> Insights Comparativos de Inventário:</h5>
                    <p className="text-xs text-muted-foreground mt-1">{insights.inventoryComparisonInsights}</p>
                </div>
            )}
             <div>
              <h5 className="text-sm font-medium flex items-center"><Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" /> Insights Sugestivos:</h5>
              <p className="text-xs text-muted-foreground mt-1">{insights.suggestiveInsights}</p>
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={isReportDialogVisible} onOpenChange={setIsReportDialogVisible}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rascunho: {currentReportType}</DialogTitle>
            <DialogDescription>
              Revise o rascunho gerado pela IA. Você pode copiar e colar em seu editor de preferência.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {isGeneratingReport && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
            {errorReport && !isGeneratingReport && (
              <Alert variant="destructive">
                <AlertTitle>Erro ao Gerar Rascunho</AlertTitle>
                <AlertDescription>{errorReport}</AlertDescription>
              </Alert>
            )}
            {!isGeneratingReport && reportDraft && (
              <Textarea
                value={reportDraft}
                readOnly 
                rows={15}
                className="min-h-[300px] bg-muted/50"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeReportDialog}>
              Fechar
            </Button>
            <Button type="button" onClick={handleCopyReportDraft} disabled={isGeneratingReport || !reportDraft}>
              Copiar Rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

const SessionNoteCard = React.memo(SessionNoteCardComponent);
export default SessionNoteCard;
